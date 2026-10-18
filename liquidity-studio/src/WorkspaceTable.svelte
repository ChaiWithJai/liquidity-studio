<script>
  import { onMount, tick } from "svelte";
  let {
    client,
    scopeKey,
    actorId,
    canAdmin = false,
    search = "",
    statusFilter = "All",
    onQueryFilters = () => {},
    onOpenStory = () => {},
  } = $props();
  const labels = {
    title: "Story",
    category: "Category",
    status: "Status",
    sourceReadiness: "Source review",
    assigneeId: "Assignee",
    formats: "Saved formats",
    plannedDate: "Planned date",
    exportStatus: "Export",
    revision: "Revision",
  };
  const statuses = ["In Backlog", "Ready for Campaign", "Draft Ready"];
  let localError = $state(""),
    message = $state(""),
    viewName = $state(""),
    sharing = $state("personal"),
    viewId = $state("");
  let inline = $state(null),
    inlineValue = $state(""),
    drawerTitle = $state(""),
    drawerCategory = $state("");
  let bulkField = $state("category"),
    bulkValue = $state("");
  let detailsLoading = $state(false);
  let host = $state();
  let scroller = $state(),
    opener,
    alive = false,
    restoredFocus = false,
    detailsSequence = 0;
  let rows = $derived(
    $client.pageIds.map((id) => $client.entities.get(id)?.row).filter(Boolean),
  );
  let columns = $derived($client.query.definition.columns || Object.keys(labels));
  let selected = $derived($client.ui.selectedIds);
  let drawer = $derived($client.entities.get($client.ui.drawerStoryId));
  let selectedView = $derived($client.views.find((view) => view.id === viewId));
  let canEditView = $derived(
    selectedView &&
      (selectedView.ownerId === actorId ||
        (canAdmin && selectedView.sharing === "brand")),
  );
  let groups = $derived.by(() => {
    const field = $client.query.definition.groupBy;
    if (!field) return [{ key: "", rows }];
    const result = Object.create(null);
    for (const row of rows) {
      const key = String(row[field] ?? "Unassigned");
      (result[key] ??= []).push(row);
    }
    return Object.entries(result).map(([key, rows]) => ({ key, rows }));
  });
  const memberName = (id) =>
    id
      ? $client.members.find((member) => member.id === id)?.displayName ||
        "Member unavailable"
      : "Unassigned";
  function fail(error) {
    if (alive && error.code !== "REQUEST_CONTEXT_CHANGED")
      localError = error.message;
  }
  function cellValue(row, key) {
    if (key === "assigneeId") return memberName(row.assigneeId);
    if (key === "sourceReadiness")
      return row.sourceReadiness === "ready"
        ? "Ready for generation"
        : "Review needed";
    if (key === "formats")
      return (
        row.formats
          .map(
            (format) =>
              ({
                infographic: "Feed",
                carousel: "Carousel",
                story: "Story",
                reel: "Reel",
              })[format],
          )
          .join(", ") || "No saved formats"
      );
    if (key === "exportStatus")
      return row.exportStatus === "exported" ? "Export exists" : "Not exported";
    return row[key] ?? "—";
  }
  function groupName(key) {
    const field = $client.query.definition.groupBy;
    return field === "assigneeId"
      ? memberName(key === "Unassigned" ? null : key)
      : field === "sourceReadiness"
        ? key === "ready"
          ? "Ready for generation"
          : "Review needed"
        : key;
  }
  async function runQuery(patch = {}, filterPatch) {
    localError = "";
    const current = client.snapshot.query.definition;
    const next = {
      ...current,
      ...patch,
      ...(filterPatch ? { filters: { ...current.filters, ...filterPatch } } : {}),
    };
    try {
      await client.query(next);
    } catch (error) {
      fail(error);
    }
  }
  $effect(() => {
    const owner = client,
      term = search.trim(),
      status = statusFilter;
    const timer = setTimeout(() => {
      const current = owner.snapshot.query;
      const same =
        (current.definition.filters?.search || "") === term &&
        (current.definition.filters?.statuses?.[0] || "All") === status;
      if (same && (current.loaded || current.loading)) return;
      owner
        .query({
          ...current.definition,
          filters: {
            ...current.definition.filters,
            search: term,
            statuses: status === "All" ? [] : [status],
          },
        })
        .catch(fail);
    }, 100);
    return () => clearTimeout(timer);
  });
  onMount(() => {
    alive = true;
    Promise.allSettled([
      client.loadMembers(),
      client.loadViews(),
      client.loadOperations(),
    ]).then((results) => {
      const failure = results.find((result) => result.status === "rejected");
      if (failure) fail(failure.reason);
    });
    return () => {
      alive = false;
    };
  });
  $effect(() => {
    rows.length;
    const node = scroller || host,
      position = $client.ui.scrollTop;
    if (node)
      queueMicrotask(() => {
        if (alive && node.isConnected) {
          if (scroller) scroller.scrollTop = position;
          if (!restoredFocus && rows.length) {
            restoredFocus = true;
            const id = client.snapshot.ui.focusStoryId;
            if (id && !client.snapshot.ui.drawerStoryId)
              node
                .querySelector(`[data-detail-story="${CSS.escape(id)}"], [data-open-story="${CSS.escape(id)}"]`)
                ?.focus({ preventScroll: true });
          }
        }
      });
  });
  async function toggleSelection(id, checked) {
    if (checked && selected.length >= 25) {
      localError = "Select at most 25 stories per operation.";
      return;
    }
    client.setUi({
      selectedIds: checked
        ? [...new Set([...selected, id])]
        : selected.filter((value) => value !== id),
    });
  }
  function selectLoaded() {
    if (rows.length > 25) {
      localError =
        "This page has more than 25 rows. Select individual stories or reduce the page size.";
      return;
    }
    client.setUi({ selectedIds: rows.map((row) => row.id) });
  }
  async function resetFilters() {
    localError = "";
    const pending = client.query({
      ...client.snapshot.query.definition,
      filters: {},
    });
    onQueryFilters({});
    try {
      await pending;
    } catch (error) {
      fail(error);
    }
  }
  async function applyView() {
    const view = client.snapshot.views.find((view) => view.id === viewId);
    if (!view) return;
    viewName = view.name;
    sharing = view.sharing;
    const pending = client.query(view.definition);
    onQueryFilters(view.definition.filters);
    try {
      await pending;
      message = `Loaded ${view.sharing === "brand" ? "shared brand" : "personal"} view “${view.name}”.`;
    } catch (error) {
      fail(error);
    }
  }
  async function saveView(action) {
    localError = "";
    try {
      const current = client.snapshot.views.find((view) => view.id === viewId);
      const view = await client.writeView(
        action,
        action === "create"
          ? {
              name: viewName,
              sharing,
              definition: client.snapshot.query.definition,
            }
          : {
              id: current.id,
              expectedRevision: current.revision,
              ...(action === "update"
                ? {
                    name: viewName,
                    sharing,
                    definition: client.snapshot.query.definition,
                  }
                : {}),
            },
      );
      if (action === "delete") {
        viewId = "";
        message = "View deleted. Story content was retained.";
      } else {
        viewId = view.id;
        message = "View saved with its sharing scope and revision.";
      }
    } catch (error) {
      fail(error);
    }
  }
  async function restoreView() {
    const view = $client.deletedView;
    if (!view) return;
    try {
      const restored = await client.writeView("restore", {
        id: view.id,
        expectedRevision: view.revision,
      });
      viewId = restored.id;
      message = "Deleted view restored.";
    } catch (error) {
      fail(error);
    }
  }
  async function openDetails(row, event) {
    const sequence = ++detailsSequence;
    detailsLoading = true;
    opener = event.currentTarget;
    client.setUi({ drawerStoryId: row.id, focusStoryId: row.id });
    localError = "";
    try {
      await client.ensureStories([row.id], { force: true });
      if (
        !alive ||
        sequence !== detailsSequence ||
        client.snapshot.ui.drawerStoryId !== row.id
      )
        return;
      const story = client.getStory(row.id);
      if (!story)
        throw Error("Story changed while loading. Refresh its details.");
      drawerTitle = story.title;
      drawerCategory = story.category;
      detailsLoading = false;
      await tick();
      document.querySelector("[data-workspace-drawer]")?.focus();
    } catch (error) {
      fail(error);
    }
  }
  async function closeDetails() {
    detailsLoading = false;
    detailsSequence++;
    client.setUi({ drawerStoryId: null });
    await tick();
    if (opener?.isConnected) opener.focus();
    else
      (scroller || host)
        ?.querySelector(
          `[data-detail-story="${CSS.escape(client.snapshot.ui.focusStoryId || "")}"], [data-open-story="${CSS.escape(client.snapshot.ui.focusStoryId || "")}"]`,
        )
        ?.focus();
  }
  async function openEditor(id) {
    localError = "";
    try {
      await client.ensureStories([id]);
      const story = client.getStory(id);
      if (!story) throw Error("Story is not current. Refresh before opening.");
      detailsSequence++;
      client.setUi({ focusStoryId: id, drawerStoryId: null });
      await onOpenStory(story);
    } catch (error) {
      fail(error);
    }
  }
  async function saveInline(row, key, value) {
    localError = "";
    try {
      await client.mutate([
        {
          kind: "story.patch",
          storyId: row.id,
          expectedRevision: row.revision,
          patch: { [key]: value },
        },
      ]);
      inline = null;
    } catch (error) {
      fail(error);
    }
  }
  async function changeBoardStatus(row, event) {
    const node = event.currentTarget;
    await saveInline(row, "status", node.value);
    if (node.isConnected)
      node.value =
        client.snapshot.entities.get(row.id)?.row?.status || row.status;
  }
  async function saveDetails() {
    const row = client.snapshot.entities.get(
      client.snapshot.ui.drawerStoryId,
    )?.row;
    if (!row) return;
    localError = "";
    try {
      await client.mutate([
        {
          kind: "story.patch",
          storyId: row.id,
          expectedRevision: row.revision,
          patch: { title: drawerTitle, category: drawerCategory },
        },
      ]);
    } catch (error) {
      fail(error);
    }
  }
  async function bulkChange() {
    localError = "";
    if (!selected.length) return;
    const value = bulkField === "assigneeId" ? bulkValue || null : bulkValue;
    const changes = selected.map((id) => ({
      kind: "story.patch",
      storyId: id,
      expectedRevision: client.snapshot.entities.get(id).revision,
      patch: { [bulkField]: value },
    }));
    try {
      await client.mutate(changes);
    } catch (error) {
      fail(error);
    }
  }
  async function undo(id) {
    localError = "";
    try {
      await client.undo(id);
      message = "Undo recorded at new revisions. Newer work was not overwritten.";
    } catch (error) {
      fail(error);
    }
  }
  function onKey(event) {
    if (event.key === "Escape" && $client.ui.drawerStoryId) {
      event.preventDefault();
      closeDetails();
    }
  }
</script>

<svelte:window onkeydown={onKey}/>
<section bind:this={host} class="workspace-table-surface" aria-label="Story work table" data-scope-key={scopeKey}>
  <div class="projection-switch" role="group" aria-label="Story projection"><button class="secondary" aria-pressed={($client.ui.viewKind||"table")==="table"} onclick={()=>client.setUi({viewKind:"table"})}>Table view</button><button class="secondary" aria-pressed={$client.ui.viewKind==="board"} onclick={()=>client.setUi({viewKind:"board"})}>Board view</button><span>Both show the same filtered stories and saved revisions.</span>{#if !selected.length}<span>0 selected · active brand only</span><button class="secondary" disabled={!rows.length||$client.mutationPending} onclick={selectLoaded}>Select loaded rows</button>{/if}</div>
  <div class="table-tools">
    <label>Sort by <select aria-label="Sort stories" value={$client.query.definition.sort?.[0]?.field||"title"} onchange={event=>runQuery({sort:[{field:event.currentTarget.value,direction:$client.query.definition.sort?.[0]?.direction||"asc"}]})}>{#each ["title","category","status","revision","plannedDate","assigneeId","exportedAt"] as field (field)}<option value={field}>{labels[field]||"Export date"}</option>{/each}</select></label>
    <label>Direction <select aria-label="Sort direction" value={$client.query.definition.sort?.[0]?.direction||"asc"} onchange={event=>runQuery({sort:[{field:$client.query.definition.sort?.[0]?.field||"title",direction:event.currentTarget.value}]})}><option value="asc">Ascending</option><option value="desc">Descending</option></select></label>
    <label>Group <select aria-label="Group stories" value={$client.query.definition.groupBy||""} onchange={event=>runQuery({groupBy:event.currentTarget.value||null})}><option value="">None</option>{#each ["status","sourceReadiness","assigneeId","plannedDate"] as field (field)}<option value={field}>{labels[field]}</option>{/each}</select></label>
    <details><summary>Columns</summary><div class="column-options">{#each Object.entries(labels) as [key,label] (key)}<label><input type="checkbox" checked={columns.includes(key)} disabled={columns.length===1&&columns.includes(key)} onchange={event=>runQuery({columns:event.currentTarget.checked?[...columns,key]:columns.filter(value=>value!==key)})}/>{label}</label>{/each}</div></details>
    <details><summary>More filters</summary><div class="advanced-filters">
      <label>Source review <select aria-label="Filter source review" value={$client.query.definition.filters.sourceReadiness||"any"} onchange={event=>runQuery({}, {sourceReadiness:event.currentTarget.value})}><option value="any">Any review state</option><option value="ready">Ready for generation</option><option value="blocked">Review needed</option></select></label>
      <label>Assignee <select aria-label="Filter assignee" value={$client.query.definition.filters.assigneeIds?.[0]??"any"} onchange={event=>runQuery({}, {assigneeIds:event.currentTarget.value==="any"?[]:[event.currentTarget.value||null]})}><option value="any">Any assignee</option><option value="">Unassigned</option>{#each $client.members as member (member.id)}<option value={member.id}>{member.displayName}</option>{/each}</select></label>
      <label>Saved format <select aria-label="Filter saved format" value={$client.query.definition.filters.formats?.[0]||""} onchange={event=>runQuery({}, {formats:event.currentTarget.value?[event.currentTarget.value]:[]})}><option value="">Any saved format</option><option value="infographic">Feed</option><option value="carousel">Carousel</option><option value="story">Story</option><option value="reel">Reel</option></select></label>
      <label>Planned from <input aria-label="Filter planned from" type="date" value={$client.query.definition.filters.dateFrom||""} onchange={event=>runQuery({}, {dateFrom:event.currentTarget.value||undefined})}/></label>
      <label>Planned to <input aria-label="Filter planned to" type="date" value={$client.query.definition.filters.dateTo||""} onchange={event=>runQuery({}, {dateTo:event.currentTarget.value||undefined})}/></label>
      <button class="secondary" onclick={resetFilters}>Reset table filters</button>
    </div></details>
    <details class="view-controls"><summary>Saved views</summary><div class="advanced-filters">
      <label>View <select aria-label="Saved workspace view" bind:value={viewId} onchange={applyView}><option value="">Choose a view</option>{#each $client.views as view (view.id)}<option value={view.id}>{view.name} · {view.sharing==="brand"?"shared brand":"personal"}</option>{/each}</select></label>
      <label>View name <input aria-label="Workspace view name" bind:value={viewName} maxlength="120"/></label>
      <label>Sharing <select aria-label="Workspace view sharing" bind:value={sharing}><option value="personal">Personal · only you</option><option value="brand">Shared · current brand members</option></select></label>
      <button class="secondary" disabled={!viewName.trim()} onclick={()=>saveView("create")}>Create saved view</button>
      <button class="secondary" disabled={!canEditView||!viewName.trim()} onclick={()=>saveView("update")}>Update selected view</button>
      <button class="secondary" disabled={!canEditView} onclick={()=>saveView("delete")}>Delete selected view</button>
      {#if $client.deletedView}<button class="secondary" onclick={restoreView}>Restore deleted view</button>{/if}
      <p class="small">Views save filters, sort, grouping and columns. Sharing a view never grants brand access or approves sources.</p>
    </div></details>
  </div>
  {#if localError||$client.error}<div role="alert" class="table-error">{localError||$client.error}<button aria-label="Dismiss table error" onclick={()=>{localError="";client.clearError();}}>×</button></div>{/if}
  {#if message}<p role="status">{message}</p>{/if}
  {#if selected.length}<div class="selection-toolbar">
    <span>{selected.length} selected · active brand only</span><button class="secondary" disabled={!rows.length||$client.mutationPending} onclick={selectLoaded}>Select loaded rows</button><button class="secondary" disabled={!selected.length} onclick={()=>client.setUi({selectedIds:[]})}>Clear selection</button>
    {#if selected.length}
    <label>Bulk field <select aria-label="Bulk metadata field" bind:value={bulkField} onchange={()=>bulkValue=""}><option value="category">Category</option><option value="assigneeId">Assignee</option><option value="status">Status</option></select></label>
    {#if bulkField==="status"}<select aria-label="Bulk metadata value" bind:value={bulkValue}><option value="">Choose status</option>{#each statuses as status (status)}<option>{status}</option>{/each}</select>{:else if bulkField==="assigneeId"}<select aria-label="Bulk metadata value" bind:value={bulkValue}><option value="">Unassigned</option>{#each $client.members as member (member.id)}<option value={member.id}>{member.displayName}</option>{/each}</select>{:else}<input aria-label="Bulk metadata value" bind:value={bulkValue} placeholder="Category" maxlength="300"/>{/if}
    <button class="primary" disabled={!selected.length||$client.mutationPending||(bulkField!=="assigneeId"&&!bulkValue.trim())} onclick={bulkChange}>Apply to selected</button>
    {/if}
  </div>
  {/if}
  {#if $client.uncertain}<p role="alert">The last request outcome is uncertain. Retry the same retained request rather than submitting a new one. <button class="secondary" disabled={$client.mutationPending} onclick={()=>{localError="";client.retryOperation().catch(fail);}}>Retry same request</button></p>{/if}
  {#if $client.receipt}<section class="operation-results" aria-label="Operation results" role="status"><b>{$client.receipt.undone?"Undo recorded":`${$client.receipt.outcomes.filter(item=>item.status==="applied").length} updated · ${$client.receipt.outcomes.filter(item=>item.status!=="applied").length} not updated`}</b>
    {#if $client.receipt.outcomes}<ul>{#each $client.receipt.outcomes as outcome (outcome.storyId)}<li>{$client.entities.get(outcome.storyId)?.row?.title||"Story"}: {outcome.status}{outcome.message?` · ${outcome.message}`:""}</li>{/each}</ul>{/if}
    {#if $client.operations.find(operation=>operation.operationId===$client.receipt.operationId)?.canUndo}<button class="secondary" disabled={$client.mutationPending} onclick={()=>undo($client.receipt.operationId)}>Undo operation</button>{/if}
    <details><summary>Receipt details</summary><p>Operation {$client.receipt.operationId}. Undo is a bounded compensating action and rejects newer conflicting work.</p></details>
  </section>{/if}
  {#if $client.query.loading}<p role="status">Loading current story rows…</p>{/if}
  {#if $client.query.error}<div role="alert"><p>Story rows could not load: {$client.query.error}</p><button class="secondary" onclick={()=>runQuery()}>Retry table</button></div>{/if}
  {#if $client.ui.viewKind==="board"}
  <div class="status-board" aria-label="Story status board" aria-busy={$client.query.loading}>
    {#each [...new Set([...statuses,...rows.map(row=>row.status)])] as status (status)}<section class="status-column" aria-label={`${status} stories`}><h3>{status} · {rows.filter(row=>row.status===status).length} loaded</h3>
      {#each rows.filter(row=>row.status===status) as row (row.id)}<article class="board-card" data-story-id={row.id} data-story-revision={row.revision}>
        <label><input type="checkbox" aria-label={`Select ${row.title}`} checked={selected.includes(row.id)} disabled={$client.mutationPending} onchange={event=>toggleSelection(row.id,event.currentTarget.checked)}/>Select</label>
        <button class="title-button" data-detail-story={row.id} onclick={event=>openDetails(row,event)}>{row.title}</button>
        <p>{row.category} · Saved revision {row.revision}</p><p>{cellValue(row,"sourceReadiness")}</p>
        <label>Change status <select aria-label={`Change status for ${row.title}`} value={row.status} disabled={$client.mutationPending} onchange={event=>changeBoardStatus(row,event)}>{#each [...new Set([row.status,...statuses])] as target (target)}<option>{target}</option>{/each}</select></label>
        <button class="secondary" disabled={$client.mutationPending} data-open-story={row.id} onclick={()=>openEditor(row.id)}>{row.formats.length?"Open draft":"Open story"} ↗</button>
      </article>{/each}
    </section>{/each}
  </div>
  {:else}
  <div class="table-scroll" bind:this={scroller} onscroll={event=>{if(client.snapshot.ui.scrollTop!==event.currentTarget.scrollTop)client.setUi({scrollTop:event.currentTarget.scrollTop});}} aria-busy={$client.query.loading}>
    <table aria-label="Scoped story table"><thead><tr><th scope="col">Select</th>{#each columns as column (column)}<th scope="col">{labels[column]}</th>{/each}<th scope="col">Open</th></tr></thead>
    <tbody>{#each groups as group (group.key)}
      {#if group.key}<tr class="group-row"><th colspan={columns.length+2} scope="rowgroup">{groupName(group.key)} · {$client.query.groups.find(item=>item.key===group.key)?.count||group.rows.length} matching, {group.rows.length} loaded</th></tr>{/if}
      {#each group.rows as row (row.id)}<tr class="story-row" data-story-id={row.id} data-story-revision={row.revision}>
        <td><input type="checkbox" aria-label={`Select ${row.title}`} checked={selected.includes(row.id)} disabled={$client.mutationPending} onchange={event=>toggleSelection(row.id,event.currentTarget.checked)}/></td>
        {#each columns as column (column)}<td>
          {#if column==="title"}<button class="title-button" data-detail-story={row.id} onclick={event=>openDetails(row,event)}>{row.title}</button>
          {:else if ["category","assigneeId","status"].includes(column)}
            {#if inline?.id===row.id&&inline?.field===column}<form onsubmit={event=>{event.preventDefault();saveInline(row,column,column==="assigneeId"?(inlineValue||null):inlineValue);}}>
              {#if column==="assigneeId"}<select aria-label={`Edit ${labels[column]} for ${row.title}`} bind:value={inlineValue}><option value="">Unassigned</option>{#each $client.members as member (member.id)}<option value={member.id}>{member.displayName}</option>{/each}</select>{:else if column==="status"}<select aria-label={`Edit ${labels[column]} for ${row.title}`} bind:value={inlineValue}>{#each [...new Set([row.status,...statuses])] as status (status)}<option>{status}</option>{/each}</select>{:else}<input aria-label={`Edit ${labels[column]} for ${row.title}`} bind:value={inlineValue} maxlength="300"/>{/if}
              <button class="secondary" disabled={$client.mutationPending}>Save cell</button><button type="button" onclick={()=>inline=null}>Cancel</button>
            </form>{:else}<button class="cell-button" aria-label={`Edit ${labels[column]} for ${row.title}`} disabled={$client.mutationPending} onclick={()=>{inline={id:row.id,field:column};inlineValue=row[column]||"";}}>{cellValue(row,column)}</button>{/if}
          {:else}{cellValue(row,column)}{/if}
        </td>{/each}
        <td><button class="secondary" disabled={$client.mutationPending} data-open-story={row.id} onclick={()=>openEditor(row.id)}>{row.formats.length?"Open draft":"Open story"} ↗</button></td>
      </tr>{/each}
    {/each}</tbody></table>
    {#if $client.query.loaded&&!$client.query.loading&&!rows.length&&!$client.query.error}<div class="table-empty">{#if $client.query.total}<h3>No stories match these filters.</h3><p>Your stories are still in this brand. Clear filters to show them.</p>{:else}<h3>No stories here yet.</h3><p>Add supplied facts below. The studio will not invent them.</p>{/if}</div>{/if}
  </div>
  {/if}
  <div class="pagination"><p>{rows.length} loaded of {$client.query.filteredTotal} matching · {$client.query.total} in this brand</p><label>Rows per page <select aria-label="Rows per page" value={$client.query.definition.limit||25} onchange={event=>runQuery({limit:Number(event.currentTarget.value)})}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label><button class="secondary" disabled={!$client.query.nextCursor||$client.query.loading} onclick={()=>client.query(client.snapshot.query.definition,{append:true}).catch(fail)}>Load more rows</button></div>
  {#if $client.operations.length}<details><summary>Recent operations</summary><ul>{#each $client.operations as operation (operation.operationId)}<li>{operation.undone?"Undone":"Recorded"} · {new Date(operation.createdAt).toLocaleString()} · {operation.outcomes.length} item outcomes {#if operation.canUndo}<button class="secondary" disabled={$client.mutationPending} onclick={()=>undo(operation.operationId)}>Undo recorded operation</button>{/if}</li>{/each}</ul></details>{/if}
  {#if $client.ui.drawerStoryId}<div class="context-drawer" role="dialog" aria-modal="false" aria-label="Story details" tabindex="-1" data-workspace-drawer>
    <header><h3>Story details</h3><button aria-label="Close story details" onclick={closeDetails}>×</button></header>
    {#if !detailsLoading&&drawer?.story&&drawer.story.revision===drawer.revision}<p>Saved revision {drawer.revision} · source review is separate from artwork approval</p>
      <form onsubmit={event=>{event.preventDefault();saveDetails();}}><label>Queue title <input aria-label="Detail queue title" bind:value={drawerTitle} maxlength="300"/></label><label>Category <input aria-label="Detail category" bind:value={drawerCategory} maxlength="300"/></label><button class="primary" disabled={$client.mutationPending}>Save detail metadata</button></form>
      <p>{drawer.story.status} · {drawer.story.sourceClaims?.length||0} supplied source claims</p><p>Queue metadata edits do not rewrite generated artwork or approve claims.</p>
      <button class="secondary" onclick={()=>openEditor(drawer.id)}>Open campaign editor</button><details><summary>Story identity</summary><p>{drawer.id}</p></details>
    {:else}<p role="status">Loading current story details…</p><button class="secondary" onclick={()=>openDetails({id:$client.ui.drawerStoryId},{currentTarget:opener})}>Retry story details</button>{/if}
    <p class="small">Closing this panel returns to the same work surface, filters and focused row. Escape closes it.</p>
  </div>{/if}
</section>

<style>
  .projection-switch { display:flex;gap:8px;align-items:center;font-size:12px;flex-wrap:wrap; }
  .status-board { display:flex;gap:14px;overflow:auto;align-items:flex-start;max-height:65vh; }
  .status-column { flex:0 0 260px;background:#eef1e8;padding:10px;border-radius:10px; }
  .board-card { display:grid;gap:8px;background:white;padding:12px;border:1px solid #d2d9c9;border-radius:8px;margin-top:10px; }
  .board-card p {margin:0;font-size:12px;}
  .workspace-table-surface { position: relative; }
  .table-tools,.selection-toolbar,.pagination { display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0; }
  label { display:flex;gap:6px;align-items:center;font-size:12px; }
  select,input { max-width:200px;padding:7px;border:1px solid #cbd3c5;border-radius:6px;background:white; }
  .table-tools details { position:relative; }
  summary { cursor:pointer;font-size:13px; }
  .column-options,.advanced-filters { background:#fff;border:1px solid #cbd3c5;padding:12px;border-radius:8px;display:flex;gap:10px;flex-wrap:wrap;max-width:720px; }
  .table-scroll { max-height:60vh;overflow:auto;border:1px solid #d2d9c9;border-radius:10px;background:white; }
  table { border-collapse:collapse;width:100%;font-size:13px; }
  th,td { text-align:left;padding:6px 8px;border-bottom:1px solid #e7ebdf;vertical-align:middle;white-space:nowrap; }
  thead { position:sticky;top:0;background:#eef1e8;z-index:1; }
  tr.story-row { display:table-row;box-shadow:none;border-radius:0; }
  .title-button,.cell-button { text-align:left;padding:0;background:none;border:0;color:inherit;font:inherit; }
  .title-button { font-weight:650;min-width:140px;max-width:230px;white-space:normal; }
  .cell-button { text-decoration:underline dotted;max-width:140px;white-space:normal; }
  .group-row { background:#f0f3e9; }
  .selection-toolbar { padding:6px;background:#e7eddf;border-radius:8px;font-size:12px; }
  .selection-toolbar button,.pagination button,td button { font-size:12px;white-space:nowrap; }
  .operation-results,.table-error { padding:12px;border:1px solid #a7b39a;border-radius:8px;margin:10px 0; }
  .table-error { color:#8e2929;background:#fff5f4; }
  .table-empty { padding:30px;text-align:center; }
  .context-drawer { position:fixed;right:20px;top:20px;bottom:20px;width:min(440px,calc(100vw - 40px));overflow:auto;z-index:20;padding:20px;background:#fff;border:1px solid #b6c2ac;border-radius:12px;box-shadow:0 10px 45px #0002; }
  .context-drawer header { display:flex;align-items:center;justify-content:space-between; }
  .context-drawer form,.context-drawer form label { display:grid;gap:10px;margin:14px 0; }
  .context-drawer input { max-width:none; }
  .context-drawer:focus { outline:2px solid #536b41; }
</style>
