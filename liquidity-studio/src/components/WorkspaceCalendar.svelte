<script>
  import { tick, untrack } from "svelte";
  import {
    canonicalZone,
    captureIntent,
    dateRange,
    findBucket,
    localToday,
    placeCommand,
    removeCommand,
    shiftDate,
    unitKey,
    unitLabel,
    validDate,
    weekStart,
  } from "../lib/calendar-model.js";
  let {
    client,
    scopeKey,
    onOpenStory = () => {},
    onReceipt = () => {},
  } = $props();
  const defaultZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
  let timeZone = $state(defaultZone);
  const initialStartDate = weekStart(localToday(defaultZone));
  let startDate = $state(initialStartDate);
  let endDate = $state(shiftDate(initialStartDate, 6));
  let unitFilter = $state("campaign");
  let loadedScope = "";
  let loadedClient = null;
  let localError = $state("");
  let announcement = $state("");
  let pending = $state(false);
  let dialog = $state.raw(null);
  let targetDate = $state("");
  let beforeId = $state("");
  let drag = $state.raw(null);
  let dropDate = $state("");
  let dropBefore = $state(null);
  let lastOperationId = $state(null);
  let attemptKey = $state(null);
  let epoch = 0;
  let pointerStart = null;
  let lastDragAt = 0;
  const data = $derived($client.calendar.data);
  const blocked = $derived(pending || $client.mutationPending);
  const days = $derived.by(() => {
    try {
      return dateRange(startDate, endDate);
    } catch {
      return [];
    }
  });
  const visibleUnits = $derived(
    (data?.unscheduledUnits || []).filter(
      (item) =>
        accepts(item) && !(item.unit === "campaign" && item.legacyWeekday),
    ),
  );
  const legacyIds = $derived(
    unitFilter === "format" ? [] : data?.legacyWeekdayIds || [],
  );
  const lastOperation = $derived(
    $client.operations.find(
      (operation) => operation.operationId === lastOperationId,
    ),
  );
  const dateLabel = (date) =>
    new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  const row = (id) => $client.entities.get(id)?.row;
  const accepts = (item) => unitFilter === "all" || item.unit === unitFilter;
  function placements(date) {
    const bucket = findBucket(data, date, timeZone);
    return (bucket?.assignmentIds || [])
      .map((id) => data.assignments.find((item) => item.id === id))
      .filter((item) => item && accepts(item))
      .map((item) => ({ ...item, assignmentId: item.id }));
  }
  function storePreferences() {
    try {
      sessionStorage.setItem(
        `liquidity-calendar-v1:${scopeKey}`,
        JSON.stringify({ startDate, endDate, timeZone, unitFilter }),
      );
    } catch {}
  }
  function restorePreferences(key) {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(`liquidity-calendar-v1:${key}`) || "null",
      );
      if (saved) {
        dateRange(saved.startDate, saved.endDate);
        const zone = canonicalZone(saved.timeZone);
        startDate = saved.startDate;
        endDate = saved.endDate;
        timeZone = zone;
        unitFilter = ["all", "campaign", "format"].includes(saved.unitFilter)
          ? saved.unitFilter
          : "campaign";
        return;
      }
    } catch {}
    timeZone = defaultZone;
    startDate = weekStart(localToday(defaultZone));
    endDate = shiftDate(startDate, 6);
    unitFilter = "campaign";
  }
  $effect(() => {
    const currentScope = scopeKey,
      currentClient = client;
    // Scope lifecycle intentionally resets local interaction, never shared content.
    untrack(() => {
      if (currentScope !== loadedScope || currentClient !== loadedClient) {
        loadedScope = currentScope;
        loadedClient = currentClient;
        epoch++;
        pointerStart = null;
        dialog = null;
        drag = null;
        dropDate = "";
        lastOperationId = null;
        attemptKey = null;
        localError = "";
        announcement = "";
        pending = false;
        restorePreferences(currentScope);
        void refresh();
      }
    });
  });
  async function refresh() {
    const token = epoch;
    try {
      dateRange(startDate, endDate);
      timeZone = canonicalZone(timeZone);
      localError = "";
      storePreferences();
      await client.loadCalendar({ startDate, endDate, timeZone });
      if (token === epoch) await client.loadOperations();
    } catch (failure) {
      if (token === epoch) localError = failure.message;
    }
  }
  async function reloadCalendar() {
    dialog = null;
    drag = null;
    dropDate = "";
    await refresh();
    announcement = "Calendar reloaded. Reopen Move to review current revisions.";
  }
  async function shiftRange(direction) {
    try {
      const count = dateRange(startDate, endDate).length;
      startDate = shiftDate(startDate, direction * count);
      endDate = shiftDate(endDate, direction * count);
      await refresh();
    } catch (failure) {
      localError = failure.message;
    }
  }
  function intentFor(item) {
    return captureIntent(item, $client.entities, data);
  }
  function openMove(item) {
    try {
      dialog = { item, intent: intentFor(item) };
      targetDate = item.date || startDate;
      beforeId = "";
      localError = "";
      announcement = `Choose a dated placement for ${row(item.storyId)?.title || "this story"}.`;
      void tick().then(() =>
        document.querySelector("[data-calendar-move-date]")?.focus(),
      );
    } catch (failure) {
      localError = failure.message;
    }
  }
  async function focusUnit(key) {
    await tick();
    [...document.querySelectorAll("[data-calendar-unit]")]
      .find((element) => element.dataset.calendarUnit === key)
      ?.focus();
  }
  function closeMove() {
    const key = dialog ? unitKey(dialog.item) : null;
    dialog = null;
    announcement = "Move cancelled. Nothing changed.";
    if (key) void focusUnit(key);
  }
  async function chooseTargetDate() {
    if (!validDate(targetDate) || !dialog) return;
    const token = epoch,
      currentDialog = dialog;
    if (targetDate < startDate || targetDate > endDate) {
      startDate = weekStart(targetDate);
      endDate = shiftDate(startDate, 6);
      await refresh();
      if (token !== epoch || dialog !== currentDialog) return;
    }
    // Changing the destination is an explicit review of its newly loaded order.
    dialog = {
      ...currentDialog,
      intent: {
        ...currentDialog.intent,
        bucketRevisions: {
          ...currentDialog.intent.bucketRevisions,
          [`${timeZone}|${targetDate}`]:
            findBucket(data, targetDate, timeZone)?.revision || 0,
        },
      },
    };
    beforeId = "";
  }
  async function commit(changes, message, focusKey = null, retry = false) {
    if (blocked) return;
    const token = epoch;
    pending = true;
    localError = "";
    try {
      if (!retry) attemptKey = crypto.randomUUID();
      const receipt = retry
        ? await client.retryOperation()
        : await client.mutate(changes, { idempotencyKey: attemptKey });
      if (token !== epoch) return;
      const failure = receipt.outcomes?.find((item) => item.status !== "applied");
      if (failure) {
        localError = `${failure.status === "conflict" ? "The plan changed. " : "The calendar change was not applied. "}${failure.message} Reload and review before retrying.`;
        return;
      }
      const resolvedFocusKey = focusKey || (dialog ? unitKey(dialog.item) : null);
      attemptKey = null;
      lastOperationId = receipt.operationId;
      dialog = null;
      drag = null;
      dropDate = "";
      announcement = receipt.undone ? "The calendar action was undone." : message;
      if (receipt.outcomes) onReceipt(receipt);
      await client.loadOperations();
      if (token !== epoch) return;
      pending = false;
      if (resolvedFocusKey) await focusUnit(resolvedFocusKey);
    } catch (failure) {
      if (token === epoch) localError = failure.message;
    } finally {
      if (token === epoch) pending = false;
    }
  }
  async function submitMove(event) {
    event.preventDefault();
    if (!dialog) return;
    try {
      await commit(
        [placeCommand(dialog.intent, targetDate, timeZone, beforeId || null)],
        `Plan assigned to ${targetDate} in ${timeZone}. This does not export or publish.`,
        unitKey(dialog.item),
      );
    } catch (failure) {
      localError = failure.message;
    }
  }
  async function remove(item) {
    try {
      await commit(
        [removeCommand(intentFor(item))],
        "Dated placement removed. No export or publication was changed.",
        unitKey(item),
      );
    } catch (failure) {
      localError = failure.message;
    }
  }
  async function reorder(item, direction) {
    try {
      const bucket = findBucket(data, item.date, timeZone),
        ids = bucket.assignmentIds,
        index = ids.indexOf(item.assignmentId);
      if (
        (direction < 0 && index === 0) ||
        (direction > 0 && index === ids.length - 1)
      )
        return;
      const anchor = direction < 0 ? ids[index - 1] : ids[index + 2] || null;
      await commit(
        [placeCommand(intentFor(item), item.date, timeZone, anchor)],
        "Plan order saved.",
        unitKey(item),
      );
    } catch (failure) {
      localError = failure.message;
    }
  }
  async function undo() {
    if (!lastOperationId || blocked) return;
    const token = epoch;
    pending = true;
    localError = "";
    try {
      attemptKey = crypto.randomUUID();
      await client.undo(lastOperationId, { idempotencyKey: attemptKey });
      if (token === epoch) {
        attemptKey = null;
        announcement = "The last calendar action was undone.";
        await client.loadOperations();
      }
    } catch (failure) {
      if (token === epoch)
        localError = `${failure.message} Newer work is preserved.`;
    } finally {
      if (token === epoch) pending = false;
    }
  }
  function lift(item) {
    drag = { item, intent: intentFor(item) };
    dropDate = item.date || startDate;
    dropBefore = null;
    localError = "";
    announcement =
      "Plan lifted. Left or right changes date; up or down changes position; Enter drops; Escape cancels.";
  }
  async function handleKey(event, item) {
    if (!drag) {
      if (event.key === " ") {
        event.preventDefault();
        try {
          lift(item);
        } catch (failure) {
          localError = failure.message;
        }
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      drag = null;
      dropDate = "";
      announcement = "Move cancelled. Nothing changed.";
      return;
    }
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      const next = shiftDate(dropDate, event.key === "ArrowLeft" ? -1 : 1);
      if (next < startDate || next > endDate) {
        announcement = "Use Move to choose a date outside this range.";
        return;
      }
      dropDate = next;
      dropBefore = null;
    } else if (["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      const ids = (
        findBucket(data, dropDate, timeZone)?.assignmentIds || []
      ).filter((id) => id !== drag.item.assignmentId);
      const current = dropBefore === null ? ids.length : ids.indexOf(dropBefore);
      const next = Math.max(
        0,
        Math.min(ids.length, current + (event.key === "ArrowUp" ? -1 : 1)),
      );
      dropBefore = ids[next] || null;
    } else if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      await commit(
        [placeCommand(drag.intent, dropDate, timeZone, dropBefore)],
        `Plan placed on ${dropDate}.`,
        unitKey(drag.item),
      );
      return;
    } else return;
    announcement = `Destination ${dropDate}, ${dropBefore ? "before another plan" : "last position"}. Press Enter to save.`;
  }
  function pointerDown(event, item) {
    if (event.button !== 0 || blocked) return;
    lastDragAt = 0;
    pointerStart = {
      x: event.clientX,
      y: event.clientY,
      item,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event) {
    if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
    if (
      !drag &&
      Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) >
        8
    ) {
      try {
        lift(pointerStart.item);
      } catch (failure) {
        localError = failure.message;
        pointerStart = null;
        return;
      }
    }
    if (!drag) return;
    const hit = document.elementFromPoint(event.clientX, event.clientY),
      day = hit?.closest("[data-calendar-date]");
    dropDate = day?.dataset.calendarDate || "";
    dropBefore =
      hit?.closest("[data-assignment-id]")?.dataset.assignmentId || null;
    if (dropBefore === drag.item.assignmentId) dropBefore = null;
  }
  async function pointerUp(event) {
    if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
    pointerStart = null;
    if (!drag) return;
    lastDragAt = Date.now();
    if (dropDate)
      await commit(
        [placeCommand(drag.intent, dropDate, timeZone, dropBefore)],
        `Plan placed on ${dropDate}.`,
        unitKey(drag.item),
      );
    else {
      drag = null;
      announcement = "Move cancelled outside the date grid. Nothing changed.";
    }
  }
  function cancelPointer() {
    pointerStart = null;
    drag = null;
    dropDate = "";
    announcement = "Move cancelled. Nothing changed.";
  }
</script>

<section class="workspace-calendar" aria-label="Dated content calendar">
  <div class="calendar-heading"><div><h2>Plan the work.</h2><p>Dates arrange campaign or format plans. They do not export or publish content.</p></div><button type="button" onclick={reloadCalendar} disabled={blocked}>Reload calendar</button></div>
  <div class="calendar-controls">
    <label>Start date<input aria-label="Calendar start date" type="date" bind:value={startDate} onchange={refresh}/></label>
    <label>End date<input aria-label="Calendar end date" type="date" bind:value={endDate} onchange={refresh}/></label>
    <label>Timezone<input aria-label="Calendar timezone" list="calendar-timezones" bind:value={timeZone} onchange={refresh}/></label>
    <datalist id="calendar-timezones"><option value="America/New_York"></option><option value="America/Los_Angeles"></option><option value="Europe/London"></option><option value="UTC"></option></datalist>
    <label>Planning unit<select aria-label="Calendar planning unit" bind:value={unitFilter} onchange={storePreferences}><option value="campaign">Whole campaigns</option><option value="format">Individual formats</option><option value="all">Campaigns and formats</option></select></label>
    <button type="button" onclick={() => shiftRange(-1)} disabled={blocked}>Previous range</button><button type="button" onclick={() => shiftRange(1)} disabled={blocked}>Next range</button>
  </div>
  <p class="calendar-feedback" aria-live="polite" aria-atomic="true">{announcement || "Choose Move for date and position controls, or use a plan handle to drag. Space lifts a focused handle."}</p>
  {#if localError || $client.calendar.error || $client.error}<div class="calendar-error" role="alert"><strong>Calendar change needs attention.</strong> {localError || $client.calendar.error || $client.error}<button type="button" onclick={reloadCalendar}>Reload authoritative calendar</button></div>{/if}
  {#if attemptKey && $client.uncertain?.payload?.idempotencyKey === attemptKey}<p class="calendar-error">The server outcome is unknown. Retrying keeps the same request key, so it cannot create a duplicate placement.<button type="button" disabled={blocked} onclick={() => commit(null,"The retried calendar action was recorded.",null,true)}>Retry calendar request</button></p>{/if}
  {#if lastOperationId}<div class="calendar-receipt"><span>{lastOperation?.undone ? "Calendar action undone." : "Calendar action saved."}</span><button type="button" onclick={undo} disabled={blocked || !lastOperation?.canUndo}>Undo calendar action</button><small>Undo checks current revisions and preserves newer work.</small></div>{/if}
  {#if $client.calendar.loading}<p role="status">Loading the current brand's calendar…</p>
  {:else if data}
    <div class="workspace-date-grid" class:moving={!!drag} aria-label="Dated plans">
      {#each days as date (date)}
        <section class="calendar-day" class:drop-target={dropDate === date} data-calendar-date={date} aria-label={`Plans for ${date}`}>
          <h3>{dateLabel(date)}<small>{date} · {timeZone}</small></h3>
          <ol>{#each placements(date) as item (item.assignmentId)}
            <li class="calendar-plan" data-assignment-id={item.assignmentId}>
              <button type="button" class="calendar-handle" aria-label={`Move ${row(item.storyId)?.title || "story"}, ${unitLabel(item)}`} data-calendar-unit={unitKey(item)} disabled={blocked}
                onpointerdown={event => pointerDown(event, item)} onpointermove={pointerMove} onpointerup={pointerUp} onpointercancel={cancelPointer} onkeydown={event => handleKey(event, item)} onclick={event => { if (event.detail === 0 || Date.now() - lastDragAt > 500) openMove(item); }}>↕ <span>{unitLabel(item)}</span></button>
              <button type="button" class="workspace-story-button" onclick={() => onOpenStory(item.storyId)}>{row(item.storyId)?.title || "Loading story…"}</button>
              <small>{row(item.storyId)?.status} · revision {row(item.storyId)?.revision}</small>
              <div class="calendar-card-actions"><button type="button" onclick={() => reorder(item, -1)} disabled={blocked} aria-label={`Move ${row(item.storyId)?.title} earlier`}>Earlier</button><button type="button" onclick={() => reorder(item, 1)} disabled={blocked} aria-label={`Move ${row(item.storyId)?.title} later`}>Later</button><button type="button" onclick={() => remove(item)} disabled={blocked}>Unassign</button></div>
            </li>
          {:else}<li class="calendar-empty">No {unitFilter === "format" ? "format plans" : "plans"} on this date.</li>{/each}</ol>
        </section>
      {/each}
    </div>
    <div class="calendar-pools">
      <section aria-label="Unscheduled planning units"><h3>Unscheduled units</h3><p>No dated placement. A format plan does not mean its artwork exists.</p><ul>{#each visibleUnits as item (unitKey(item))}<li><button type="button" aria-label={`Move ${row(item.storyId)?.title || "story"}, ${unitLabel(item)}`} data-calendar-unit={unitKey(item)} onclick={() => openMove(item)} disabled={blocked}>Move {row(item.storyId)?.title || "story"}<small>{unitLabel(item)}</small></button></li>{:else}<li>No unscheduled units in this view.</li>{/each}</ul></section>
      <section aria-label="Legacy undated weekday plans"><h3>Undated weekday plans</h3><p>Existing Monday–Sunday plans have no calendar date. Moving one to a date is explicit.</p><ul>{#each legacyIds as id (id)}<li><button type="button" data-calendar-unit={unitKey({storyId:id,unit:'campaign'})} onclick={() => openMove({storyId:id,unit:'campaign',format:null})} disabled={blocked}>Move {row(id)?.title || "story"}<small>{row(id)?.legacyWeekday} · undated whole campaign</small></button></li>{:else}<li>No undated weekday plans in this view.</li>{/each}</ul></section>
    </div>
  {/if}
  {#if dialog}
    <dialog open class="calendar-move-panel" aria-modal="false" aria-label="Move planning unit" onkeydown={event => {if(event.key==='Escape')closeMove();}}>
      <h3>Move {row(dialog.item.storyId)?.title || "story"}</h3><p>{unitLabel(dialog.item)} · expected story revision {dialog.intent.expectedRevision}</p>
      <form onsubmit={submitMove}>
        <label>Destination date<input data-calendar-move-date aria-label="Destination date" type="date" bind:value={targetDate} onchange={chooseTargetDate} required/></label>
        <p>Timezone: {timeZone}. Choosing a date outside this range opens that week for review.</p>
        <label>Position<select aria-label="Calendar placement position" bind:value={beforeId}><option value="">Last in date bucket</option>{#each (findBucket(data,targetDate,timeZone)?.assignmentIds || []).filter(id => id !== dialog.item.assignmentId) as id (id)}{@const item = data.assignments.find(value => value.id === id)}<option value={id}>Before {row(item?.storyId)?.title || "plan"} · {item ? unitLabel(item) : ""}</option>{/each}</select></label>
        <button type="submit" disabled={blocked || $client.calendar.loading}>Save dated placement</button><button type="button" onclick={closeMove} disabled={blocked}>Cancel move</button>
      </form>
    </dialog>
  {/if}
</section>

<style>
  .workspace-calendar {
    color: var(--ink, #19251c);
    min-width: 0;
  }
  .calendar-heading {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: start;
  }
  .calendar-heading h2 {
    margin: 0;
  }
  .calendar-heading p,
  .calendar-pools p {
    color: #526256;
    font-size: 0.88rem;
  }
  .calendar-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  .calendar-controls label,
  .calendar-move-panel label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.8rem;
  }
  .calendar-controls input,
  .calendar-controls select,
  .calendar-move-panel input,
  .calendar-move-panel select {
    min-height: 44px;
    min-width: 0;
  }
  .calendar-feedback {
    min-height: 2.5em;
    color: #526256;
    font-size: 0.85rem;
  }
  .calendar-error {
    padding: 1rem;
    border: 1px solid #ef846e;
    margin: 1rem 0;
  }
  .calendar-error button {
    margin: 0.5rem;
  }
  .calendar-receipt {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
    margin: 1rem 0;
  }
  .calendar-receipt small {
    color: #526256;
  }
  .workspace-date-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(150px, 1fr));
    gap: 0.65rem;
    overflow-x: auto;
    padding: 0.2rem 0.2rem 1rem;
  }
  .calendar-day {
    border: 1px solid var(--line, #dedfd5);
    border-radius: 8px;
    padding: 0.65rem;
    min-height: 200px;
  }
  .calendar-day h3 {
    font-size: 0.9rem;
    margin: 0 0 0.75rem;
  }
  .calendar-day h3 small {
    display: block;
    font-size: 12px;
    font-weight: 400;
    margin-top: 0.3rem;
    color: #526256;
  }
  .calendar-day ol,
  .calendar-pools ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.65rem;
  }
  .calendar-plan {
    padding: 0.55rem;
    background: #fff;
    border: 1px solid var(--line, #dedfd5);
    border-radius: 6px;
    min-width: 0;
  }
  .calendar-handle {
    touch-action: none;
    min-height: 44px;
    width: 100%;
    text-align: left;
    cursor: grab;
    font-size: 12px;
  }
  .calendar-handle span {
    font-weight: 500;
  }
  .workspace-story-button {
    display: block;
    text-align: left;
    width: 100%;
    white-space: normal;
    margin: 0.4rem 0;
    overflow-wrap: anywhere;
  }
  .calendar-plan > small {
    color: #526256;
    font-size: 12px;
  }
  .calendar-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.5rem;
  }
  .calendar-card-actions button {
    min-height: 36px;
    font-size: 12px;
    padding: 0.3rem 0.4rem;
  }
  .calendar-empty {
    font-size: 0.8rem;
    color: #526256;
  }
  .drop-target {
    outline: 3px solid var(--accent, #e85d04);
    outline-offset: 1px;
  }
  .calendar-pools {
    display: grid;
    align-items: start;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }
  .calendar-pools section {
    border: 1px solid var(--line, #dedfd5);
    border-radius: 8px;
    padding: 1rem;
  }
  .calendar-pools li button {
    width: 100%;
    text-align: left;
    white-space: normal;
    min-height: 44px;
  }
  .calendar-pools small {
    display: block;
    font-weight: 400;
    color: #526256;
  }
  .calendar-move-panel {
    position: fixed;
    left: auto;
    top: auto;
    margin: 0;
    right: 1rem;
    bottom: 1rem;
    max-height: 80vh;
    overflow: auto;
    width: min(420px, calc(100vw - 2rem));
    padding: 1.25rem;
    background: #fff;
    border: 2px solid var(--accent, #e85d04);
    border-radius: 10px;
    box-shadow: 0 8px 40px #0008;
    z-index: 20;
  }
  .calendar-move-panel form {
    display: grid;
    gap: 0.8rem;
  }
  .calendar-move-panel p {
    font-size: 0.85rem;
  }
  .calendar-move-panel button {
    min-height: 44px;
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 3px solid var(--accent, #e85d04);
    outline-offset: 3px;
  }
  @media (max-width: 700px) {
    .workspace-date-grid {
      grid-template-columns: 1fr;
      overflow: visible;
    }
    .calendar-day {
      min-height: 100px;
    }
    .calendar-pools {
      grid-template-columns: 1fr;
    }
    .calendar-heading {
      display: block;
    }
    .calendar-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .calendar-controls label {
      min-width: 0;
    }
    .calendar-card-actions button {
      min-height: 44px;
    }
    .calendar-day h3 small {
      font-size: 12px;
    }
  }
</style>
