<script>
  import { onMount } from "svelte";
  import Emulator from "./Emulator.svelte";
  import "./studio.css";

  const supportedFonts = [
    "Mona Sans",
    "Inter",
    "Instrument Serif",
    "DejaVu Sans",
  ];
  function supportedFont(value) {
    const firstFamily =
      typeof value === "string" ? value.split("/")[0].trim() : "";
    return supportedFonts.includes(firstFamily) ? firstFamily : "DejaVu Sans";
  }
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const formats = [
    { id: "infographic", name: "Feed post", ratio: "4:5" },
    { id: "carousel", name: "Carousel", ratio: "4 slides" },
    { id: "story", name: "Story", ratio: "9:16" },
    { id: "reel", name: "Reel", ratio: "30s script" },
  ];
  let user = $state(null);
  let organizations = $state([]);
  let organizationId = $state("");
  let brandId = $state("");
  let permissions = $state({});
  let username = $state("");
  let password = $state("");
  let booting = $state(true);
  let busy = $state(false);
  let error = $state("");
  let notice = $state("");
  let tab = $state("backlog");
  let brandProfile = $state(null);
  let backlog = $state([]);
  let calendar = $state([]);
  let selectedStory = $state(null);
  let campaign = $state(null);
  let format = $state("infographic");
  let scheduledDay = $state("Monday");
  let search = $state("");
  let statusFilter = $state("All");
  let editJson = $state("");
  let editFields = $state({});
  let pendingEdits = $state(false);
  let title = $state("");
  let sourceFacts = $state("");
  let sourceUrls = $state("");
  let reviewClaims = $state([]);
  let category = $state("Editorial");
  let newDay = $state("Monday");
  let newOrganization = $state("");
  let newBrand = $state("");
  let newBrandPreset = $state("liquidity_desk");
  let adminData = $state(null);
  let graph = $state(null);
  let readiness = $state(null);
  let preflight = $state(null);
  let exportUrl = $state("");
  let exportName = $state("");
  let lastScopeToken = 0;
  let preflightSequence = 0;
  let currentOrganization = $derived(
    organizations.find((org) => org.id === organizationId),
  );
  let currentBrand = $derived(
    currentOrganization?.brands?.find((brand) => brand.id === brandId),
  );
  let filteredStories = $derived(
    backlog.filter(
      (story) =>
        (!search ||
          (story.title + " " + story.category)
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (statusFilter === "All" || story.status === statusFilter),
    ),
  );
  let provenance = $derived(
    campaign?.provenance?.mode === "synthetic"
      ? "Synthetic draft · source review required"
      : campaign?.provenance?.mode === "provider"
        ? "Provider draft · source review required"
        : "Source provenance unverified · review required",
  );
  let canAdmin = $derived(
    permissions?.admin === true || user?.role === "founder",
  );

  function scopeQuery() {
    return new URLSearchParams({ organizationId, brandId }).toString();
  }
  async function request(path, options = {}, scoped = true) {
    const requestScopeToken = lastScopeToken;
    const response = await fetch(
      path + (scoped ? (path.includes("?") ? "&" : "?") + scopeQuery() : ""),
      {
        ...options,
        credentials: "same-origin",
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
      },
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) user = null;
      throw new Error(
        data.error || data.message || `Request failed (${response.status})`,
      );
    }
    if (scoped && requestScopeToken !== lastScopeToken)
      throw new Error(
        "Workspace changed while the request was running; retry in the current brand",
      );
    return data;
  }
  function post(path, body = {}, scoped = true) {
    return request(
      path,
      { method: "POST", body: JSON.stringify(body) },
      scoped,
    );
  }
  function applySession(session) {
    user = session.user;
    organizations = session.organizations || [];
    permissions = session.permissions || {};
    organizationId =
      session.activeScope?.organizationId || organizations[0]?.id || "";
    brandId =
      session.activeScope?.brandId ||
      organizations.find((org) => org.id === organizationId)?.brands?.[0]?.id ||
      "";
  }
  onMount(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
      });
      if (response.ok) {
        applySession(await response.json());
        if (brandId) await loadScope();
      }
    } catch {
      error = "Could not connect to the studio. Check the server and retry.";
    } finally {
      booting = false;
    }
  });
  async function login(event) {
    event.preventDefault();
    busy = true;
    error = "";
    try {
      const session = await post(
        "/api/auth/login",
        { username, password },
        false,
      );
      password = "";
      applySession(session);
      await loadScope();
    } catch (failure) {
      error = failure.message;
    } finally {
      busy = false;
    }
  }
  async function logout() {
    try {
      await post("/api/auth/logout", {}, false);
      user = null;
      organizations = [];
      backlog = [];
      campaign = null;
    } catch (failure) {
      error = failure.message;
    }
  }
  async function loadScope() {
    const token = ++lastScopeToken;
    error = "";
    busy = true;
    selectedStory = null;
    campaign = null;
    adminData = null;
    preflight = null;
    exportUrl = "";
    pendingEdits = false;
    try {
      const data = await request("/api/studio/bootstrap");
      if (token !== lastScopeToken) return;
      brandProfile = data.brandProfile;
      if (brandProfile) {
        brandProfile.fonts ||= { heading: "DejaVu Sans", body: "DejaVu Sans" };
        brandProfile.fonts.heading = supportedFont(brandProfile.fonts.heading);
        brandProfile.fonts.body = supportedFont(brandProfile.fonts.body);
        brandProfile.colors ||= [];
      }
      backlog = data.backlog || [];
      calendar = data.calendar || [];
      if (data.organizations) organizations = data.organizations;
      if (data.permissions) permissions = data.permissions;
      if (backlog.length) selectStory(backlog[0]);
    } catch (failure) {
      if (token === lastScopeToken) {
        error = failure.message;
        backlog = [];
        calendar = [];
        brandProfile = null;
      }
    } finally {
      if (token === lastScopeToken) busy = false;
    }
  }
  async function switchOrganization(event) {
    if (pendingEdits && !(await saveEdit())) return;
    organizationId = event.currentTarget.value;
    brandId =
      organizations.find((org) => org.id === organizationId)?.brands?.[0]?.id ||
      "";
    tab = "backlog";
    await loadScope();
  }
  async function switchBrand(event) {
    if (pendingEdits && !(await saveEdit())) return;
    brandId = event.currentTarget.value;
    tab = "backlog";
    await loadScope();
  }
  function selectStory(story) {
    selectedStory = story;
    campaign = story?.campaignDraft || null;
    scheduledDay = story?.scheduledDay || "Monday";
    reviewClaims = (
      story?.sourceClaims ||
      story?.verifiedFacts?.map((text, i) => ({
        id: `claim_${i}`,
        text,
        sourceUrl: "",
        status: "unreviewed",
      })) ||
      []
    ).map((claim) => ({ ...claim }));
    exportUrl = "";
    preflight = null;
    syncEditor();
  }
  function syncEditor() {
    editFields = campaign?.[format]
      ? JSON.parse(JSON.stringify(campaign[format]))
      : {};
    editJson = campaign?.[format] ? JSON.stringify(editFields, null, 2) : "";
    pendingEdits = false;
  }
  function updateField(key, value) {
    editFields[key] = value;
    editJson = JSON.stringify(editFields, null, 2);
    pendingEdits = true;
  }
  function updateNested(key, index, field, value) {
    if (field) editFields[key][index][field] = value;
    else editFields[key][index] = value;
    editJson = JSON.stringify(editFields, null, 2);
    pendingEdits = true;
  }
  async function openStory(story) {
    if (pendingEdits && !(await saveEdit())) return;
    selectStory(story);
    tab = "studio";
  }
  async function selectFormat(next) {
    if (pendingEdits && !(await saveEdit())) return;
    format = next;
    exportUrl = "";
    syncEditor();
  }
  async function generate() {
    if (!selectedStory || busy) return;
    if (pendingEdits && !(await saveEdit())) return;
    busy = true;
    error = "";
    const token = lastScopeToken;
    const storyId = selectedStory.id;
    try {
      const result = await post("/api/studio/generate-campaign", { storyId });
      if (token !== lastScopeToken || selectedStory?.id !== storyId) return;
      campaign = result.campaign;
      selectedStory =
        result.backlog?.find((story) => story.id === storyId) || result.story;
      backlog = result.backlog || backlog;
      calendar = result.calendar || calendar;
      syncEditor();
      notice = "Draft generated. Review the sources before export.";
    } catch (failure) {
      if (token === lastScopeToken)
        error = `Generation failed: ${failure.message}. Your existing draft is preserved.`;
    } finally {
      if (token === lastScopeToken) busy = false;
    }
  }
  async function saveEdit() {
    if (!campaign || !selectedStory || !pendingEdits) return true;
    error = "";
    try {
      const editingSnapshot = editJson;
      const content = JSON.parse(editingSnapshot);
      if (!content || typeof content !== "object" || Array.isArray(content))
        throw new Error("Format content must be a JSON object");
      const saved = await post("/api/studio/save-edit", {
        storyId: selectedStory.id,
        format,
        content,
        expectedRevision: selectedStory.revision,
      });
      if (saved.story) selectedStory = saved.story;
      else if (saved.revision !== undefined)
        selectedStory.revision = saved.revision;
      campaign[format] = content;
      selectedStory.campaignDraft = campaign;
      const story = backlog.find((item) => item.id === selectedStory.id);
      if (story) story.campaignDraft = campaign;
      pendingEdits = editJson !== editingSnapshot;
      notice = pendingEdits
        ? "Saved the submitted edit. Newer changes remain unsaved."
        : "Changes saved.";
      return !pendingEdits;
    } catch (failure) {
      error = `Could not save: ${failure.message}. Your editor text is still here.`;
      return false;
    }
  }
  async function updateSchedule() {
    if (!selectedStory) return;
    try {
      const data = await post("/api/studio/schedule", {
        storyId: selectedStory.id,
        status: "Scheduled",
        scheduledDay,
      });
      selectedStory = data.story || {
        ...selectedStory,
        scheduledDay,
        status: "Scheduled",
      };
      backlog = data.backlog || backlog;
      calendar = data.calendar || calendar;
      notice = `Assigned to ${scheduledDay}. This does not publish to Instagram.`;
    } catch (failure) {
      error = failure.message;
    }
  }
  async function exportAsset() {
    if (!(await saveEdit()) || !selectedStory || !campaign) return;
    busy = true;
    error = "";
    exportUrl = "";
    try {
      const result = await post("/api/studio/export-asset", {
        storyId: selectedStory.id,
        format,
        content: campaign[format],
      });
      exportUrl = result.downloadUrl || result.artifact?.downloadUrl || "";
      exportName =
        result.filename || result.artifact?.filename || "Download export";
      if (!exportUrl)
        throw new Error("Server did not return a downloadable artifact");
      backlog = result.backlog || backlog;
      calendar = result.calendar || calendar;
      selectedStory =
        backlog.find((story) => story.id === selectedStory.id) || selectedStory;
      notice = "Export created. Download the actual file below.";
    } catch (failure) {
      error = `Export failed: ${failure.message}`;
    } finally {
      busy = false;
    }
  }
  function addSourceClaim() {
    reviewClaims = [
      ...reviewClaims,
      {
        id: crypto.randomUUID(),
        text: "",
        sourceUrl: "",
        kind: "",
        status: "unreviewed",
      },
    ];
  }
  function removeSourceClaim(id) {
    reviewClaims = reviewClaims.filter((claim) => claim.id !== id);
  }
  async function saveSourceClaims() {
    if (!selectedStory) return;
    if (!reviewClaims.length) {
      error = "Add at least one sourced claim before saving the review.";
      return;
    }
    error = "";
    try {
      const result = await post("/api/studio/source-claims", {
        storyId: selectedStory.id,
        sourceClaims: reviewClaims,
        expectedRevision: selectedStory.revision,
      });
      if (result.story) {
        selectedStory = result.story;
        const index = backlog.findIndex(
          (story) => story.id === selectedStory.id,
        );
        if (index >= 0) backlog[index] = selectedStory;
      }
      notice =
        "Source review saved. Only approved sourced claims can enter generation.";
    } catch (failure) {
      error = failure.message;
    }
  }
  async function saveProfile(event) {
    event.preventDefault();
    try {
      const fields = [
        "brandName",
        "websiteUrl",
        "tagline",
        "mission",
        "fonts",
        "colors",
        "logoText",
        "strategy",
        "valueGroups",
        "pillars",
      ];
      const patch = Object.fromEntries(
        fields
          .filter((key) => brandProfile[key] !== undefined)
          .map((key) => [key, brandProfile[key]]),
      );
      patch.fonts = {
        heading: supportedFont(brandProfile.fonts.heading),
        body: supportedFont(brandProfile.fonts.body),
      };
      const result = await post("/api/studio/brand-profile", patch);
      brandProfile = result.brandProfile || brandProfile;
      notice = "Brand profile saved for this brand.";
    } catch (failure) {
      error = failure.message;
    }
  }
  async function addStory(event) {
    event.preventDefault();
    const facts = sourceFacts
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!facts.length) {
      error =
        "Add at least one supplied fact. The studio will not invent source facts.";
      return;
    }
    try {
      const result = await post("/api/studio/backlog", {
        title,
        category,
        scheduledDay: newDay,
        verifiedFacts: facts,
        sourceClaims: facts.map((text, i) => ({
          id: `claim_${i}`,
          text,
          sourceUrl: sourceUrls.split("\n")[i]?.trim() || "",
          status: "unreviewed",
        })),
        sourceUrls: sourceUrls.split("\n").filter(Boolean),
        sourceStatus: "unreviewed",
      });
      backlog = result.backlog || [result.story, ...backlog];
      calendar = result.calendar || calendar;
      title = "";
      sourceFacts = "";
      sourceUrls = "";
      notice = "Story added. Supplied facts still need source review.";
    } catch (failure) {
      error = failure.message;
    }
  }
  async function loadAdmin() {
    tab = "admin";
    error = "";
    try {
      [adminData, graph, readiness] = await Promise.all([
        request("/api/admin/overview"),
        request("/api/admin/context-graph"),
        fetch("/readyz").then((response) => response.json()),
      ]);
    } catch (failure) {
      error = failure.message;
    }
  }
  async function createOrganization(event) {
    event.preventDefault();
    try {
      await post("/api/admin/organizations", { name: newOrganization });
      const session = await request("/api/auth/session", {}, false);
      organizations = session.organizations || organizations;
      newOrganization = "";
      notice = "Organization created.";
    } catch (failure) {
      error = failure.message;
    }
  }
  async function createBrand(event) {
    event.preventDefault();
    try {
      await post("/api/admin/brands", {
        organizationId,
        name: newBrand,
        preset: newBrandPreset,
      });
      const session = await request("/api/auth/session", {}, false);
      organizations = session.organizations || organizations;
      newBrand = "";
      notice = "Brand created.";
    } catch (failure) {
      error = failure.message;
    }
  }
  async function runBatch(retryOfJobId = null) {
    const scopeToken = lastScopeToken;
    busy = true;
    error = "";
    try {
      await post("/api/admin/run-weekly-batch", {
        idempotencyKey: crypto.randomUUID(),
        maxStories: 5,
        ...(retryOfJobId ? { retryOfJobId } : {}),
      });
      if (scopeToken !== lastScopeToken) return;
      await loadScope();
      await loadAdmin();
      notice = retryOfJobId
        ? "Retry completed. Previously completed drafts were preserved."
        : "Scoped batch completed. Review every generated draft.";
    } catch (failure) {
      if (scopeToken !== lastScopeToken) return;
      await loadAdmin();
      error = failure.message;
    } finally {
      busy = false;
    }
  }
  async function recordPreflight(payload) {
    if (!selectedStory || !user) return;
    const sequence = ++preflightSequence;
    const token = lastScopeToken;
    try {
      const result = await post("/api/studio/preflight", {
        storyId: selectedStory.id,
        expectedRevision: selectedStory.revision,
        ...payload,
      });
      if (sequence === preflightSequence && token === lastScopeToken)
        preflight = result;
    } catch (failure) {
      if (token === lastScopeToken) preflight = { error: failure.message };
    }
  }
</script>

<svelte:head
  ><title>Liquidity Studio · Brand workspace</title><meta
    name="description"
    content="Private editorial workspace for brand campaigns, measured previews and source review."
  /></svelte:head
>
{#if booting}<main class="login-shell">
    <p role="status">Connecting to your studio…</p>
  </main>
{:else if !user}
  <main class="login-shell">
    <div class="login-card">
      <span class="wordmark">◈ LIQUIDITY STUDIO</span>
      <h1>Good work starts<br />with a clear view.</h1>
      <p>Sign in to your private brand workspace.</p>
      <form onsubmit={login}>
        <label
          >Username<input
            name="username"
            autocomplete="username"
            bind:value={username}
            required
          /></label
        ><label
          >Password<input
            name="password"
            type="password"
            autocomplete="current-password"
            bind:value={password}
            required
          /></label
        ><button class="primary" disabled={busy}
          >{busy ? "Signing in…" : "Sign in →"}</button
        >
      </form>
      {#if error}<p class="error" role="alert">{error}</p>{/if}
      <p class="small muted">
        Accounts are provisioned by your studio operator. No public
        registration.
      </p>
    </div>
    <div class="login-art">
      <span class="eyebrow">YOUR EDITORIAL WORKSPACE</span>
      <h2>From a good story.<br />To a considered campaign.</h2>
      <div class="login-cards">
        <span>SOURCE</span><span>SHAPE</span><span>PREVIEW</span>
      </div>
      <p>
        One place to edit, inspect and export.<br />Every brand keeps its own
        context.
      </p>
    </div>
  </main>
{:else}
  <div class="app-shell">
    <aside class="sidebar">
      <a
        href="/"
        class="wordmark"
        onclick={(e) => {
          e.preventDefault();
          tab = "backlog";
        }}>◈<span>LIQUIDITY<br />STUDIO</span></a
      >
      <div class="scope-selectors">
        <label
          >Organization<select
            aria-label="Organization"
            value={organizationId}
            onchange={switchOrganization}
            >{#each organizations as org (org.id)}<option value={org.id}
                >{org.name}</option
              >{/each}</select
          ></label
        ><label
          >Brand<select
            aria-label="Brand"
            value={brandId}
            onchange={switchBrand}
            >{#each currentOrganization?.brands || [] as brand (brand.id)}<option
                value={brand.id}>{brand.name}</option
              >{/each}</select
          ></label
        >
      </div>
      <nav aria-label="Main navigation">
        {#each [{ id: "backlog", label: "Story backlog", icon: "▤" }, { id: "calendar", label: "Content calendar", icon: "▦" }, { id: "studio", label: "Campaign Studio", icon: "◧" }, { id: "brand", label: "Brand Kit", icon: "◉" }] as item (item.id)}<button
            class:active={tab === item.id}
            onclick={() => (tab = item.id)}
            ><span aria-hidden="true">{item.icon}</span>{item.label}</button
          >{/each}{#if canAdmin}<button
            class:active={tab === "admin"}
            onclick={loadAdmin}
            ><span aria-hidden="true">⌘</span>Operations</button
          >{/if}
      </nav>
      <div class="sidebar-bottom">
        <span class="avatar">{user.username?.slice(0, 2)}</span>
        <div><b>{user.username}</b><small>{user.role}</small></div>
        <button aria-label="Sign out" onclick={logout}>↪</button>
      </div>
    </aside>
    <main class="workspace">
      <header class="workspace-header">
        <div>
          <span class="eyebrow"
            >{currentOrganization?.name || "ORGANIZATION"} / {currentBrand?.name ||
              "BRAND"}</span
          >
          <h1>
            {tab === "backlog"
              ? "Good stories, next up."
              : tab === "calendar"
                ? "Make room for the week."
                : tab === "studio"
                  ? "Campaign Studio"
                  : tab === "brand"
                    ? "Your brand, clearly."
                    : "Studio operations"}
          </h1>
          <p>
            {tab === "studio"
              ? "Edit the substance. Inspect the surface. Export with context."
              : "A focused workspace for source-backed editorial work."}
          </p>
        </div>
        <span class="private-badge">● Private workspace</span>
      </header>
      {#if error}<div class="error banner" role="alert">
          {error}<button aria-label="Dismiss error" onclick={() => (error = "")}
            >×</button
          >
        </div>{/if}{#if notice}<div class="notice banner" role="status">
          {notice}<button
            aria-label="Dismiss notice"
            onclick={() => (notice = "")}>×</button
          >
        </div>{/if}
      {#if tab === "backlog"}
        <div class="section-line">
          <div>
            <h2>Story backlog <span class="count">{backlog.length}</span></h2>
            <p class="muted">Opening a saved story keeps your edits.</p>
          </div>
          <div class="filters">
            <input
              aria-label="Search stories"
              placeholder="Search stories…"
              bind:value={search}
            /><select aria-label="Filter by status" bind:value={statusFilter}
              ><option>All</option
              >{#each [...new Set(backlog.map((story) => story.status))] as status (status)}<option
                  >{status}</option
                >{/each}</select
            >
          </div>
        </div>
        <div class="story-list">
          {#each filteredStories as story (story.id)}<article class="story-row">
              <div class="story-day">
                <b>{story.scheduledDay?.slice(0, 3) || "—"}</b><span
                  >{story.campaignDraft ? "DRAFT" : "SOURCE"}</span
                >
              </div>
              <div class="story-copy">
                <span class="eyebrow">{story.category}</span>
                <h3>{story.title}</h3>
                <p>
                  {story.verifiedFacts?.[0] ||
                    "Add source facts before generating."}
                </p>
                <span class="status-tag">{story.status}</span>
              </div>
              <button class="secondary" onclick={() => openStory(story)}
                >{story.campaignDraft ? "Open draft" : "Open story"} ↗</button
              >
            </article>{:else}<div class="empty">
              <h3>No stories here yet.</h3>
              <p>Add supplied facts below. The studio will not invent them.</p>
            </div>{/each}
        </div>
        <details class="panel add-story">
          <summary>Add a story</summary>
          <form class="form-grid" onsubmit={addStory}>
            <label class="full"
              >Story title<input bind:value={title} required /></label
            ><label>Category<input bind:value={category} /></label><label
              >Calendar day<select bind:value={newDay}
                >{#each days as day (day)}<option>{day}</option>{/each}</select
              ></label
            ><label class="full"
              >Supplied facts, one per line<textarea
                bind:value={sourceFacts}
                rows="4"
                required
                placeholder="Add the specific facts you want the draft to use."
              ></textarea></label
            ><label class="full"
              >Source links, one per line<textarea
                bind:value={sourceUrls}
                rows="2"
                placeholder="https://…"></textarea></label
            >
            <p class="small muted full">
              Facts are editorial inputs, not independently verified claims.
              Clinical claims require source review.
            </p>
            <button class="primary">Add to backlog</button>
          </form>
        </details>
      {:else if tab === "calendar"}
        <div class="section-line">
          <h2>Weekly editorial calendar</h2>
          <span class="muted small"
            >Assignments only · no automatic publishing</span
          >
        </div>
        <div class="calendar-grid">
          {#each days as day (day)}<section class="day-column">
              <h3>{day}</h3>
              {#each backlog.filter((story) => story.scheduledDay === day) as story (story.id)}<button
                  class="calendar-story"
                  onclick={() => openStory(story)}
                  ><span class="eyebrow">{story.category}</span><b
                    >{story.title}</b
                  ><span class="status-tag">{story.status}</span></button
                >{:else}<p class="muted small">Room for a story</p>{/each}
            </section>{/each}
        </div>
      {:else if tab === "studio"}
        {#if selectedStory}<div class="studio-toolbar">
            <div>
              <span class="eyebrow">ACTIVE STORY</span>
              <h2>{selectedStory.title}</h2>
              <span class="provenance"
                >{campaign ? provenance : "No generated draft yet"}</span
              >
            </div>
            <div class="toolbar-actions">
              <button class="secondary" disabled={busy} onclick={generate}
                >{busy
                  ? "Working…"
                  : campaign
                    ? "Regenerate draft"
                    : "Generate draft"}</button
              ><button
                class="primary"
                disabled={busy || !campaign}
                onclick={exportAsset}
                >Export {format === "carousel"
                  ? "ZIP"
                  : format === "reel"
                    ? "script"
                    : "PNG"} ↗</button
              >
            </div>
          </div>
          {#if exportUrl}<p class="download">
              <a href={exportUrl} download={exportName}>↓ {exportName}</a><small
                >Actual exported artifact · scope authorization required</small
              >
            </p>{/if}
          <div class="format-tabs" aria-label="Campaign format">
            {#each formats as item (item.id)}<button
                class:active={format === item.id}
                onclick={() => selectFormat(item.id)}
                >{item.name}<small>{item.ratio}</small></button
              >{/each}
          </div>
          {#if campaign}<div class="studio-grid">
              <section class="editor-panel">
                <div class="panel-heading">
                  <h3>Make it yours.</h3>
                  <span class="status-tag"
                    >{pendingEdits ? "Unsaved changes" : "Saved draft"}</span
                  >
                </div>
                <p class="small muted">
                  Edit the wording, then save to update your preview and
                  exported artwork.
                </p>
                <div class="field-editor">
                  {#if format === "infographic"}
                    <label
                      >Headline<textarea
                        aria-label="Headline"
                        value={editFields.headline || ""}
                        oninput={(e) =>
                          updateField("headline", e.currentTarget.value)}
                        rows="3"></textarea></label
                    >
                    {#each editFields.statRows || [] as row, i (i)}<label
                        >Fact {i + 1}<textarea
                          value={row}
                          oninput={(e) =>
                            updateNested(
                              "statRows",
                              i,
                              null,
                              e.currentTarget.value,
                            )}
                          rows="3"></textarea></label
                      >{/each}
                    <label
                      >Takeaway<textarea
                        value={editFields.bottomTakeaway || ""}
                        oninput={(e) =>
                          updateField("bottomTakeaway", e.currentTarget.value)}
                        rows="3"></textarea></label
                    >
                    <label
                      >Caption<textarea
                        aria-label="Caption"
                        value={editFields.caption || ""}
                        oninput={(e) =>
                          updateField("caption", e.currentTarget.value)}
                        rows="4"></textarea></label
                    >
                  {:else if format === "carousel"}
                    <label
                      >Cover hook<input
                        value={editFields.coverHook || ""}
                        oninput={(e) =>
                          updateField("coverHook", e.currentTarget.value)}
                      /></label
                    >
                    {#each editFields.slides || [] as item, i (i)}<fieldset>
                        <legend>Slide {i + 1}</legend><label
                          >Title<input
                            value={item.title || ""}
                            oninput={(e) =>
                              updateNested(
                                "slides",
                                i,
                                "title",
                                e.currentTarget.value,
                              )}
                          /></label
                        ><label
                          >Source detail<textarea
                            value={item.bodyMetric || ""}
                            oninput={(e) =>
                              updateNested(
                                "slides",
                                i,
                                "bodyMetric",
                                e.currentTarget.value,
                              )}
                            rows="3"></textarea></label
                        ><label
                          >Visual direction<input
                            value={item.visualNote || ""}
                            oninput={(e) =>
                              updateNested(
                                "slides",
                                i,
                                "visualNote",
                                e.currentTarget.value,
                              )}
                          /></label
                        >
                      </fieldset>{/each}
                  {:else if format === "story"}
                    <label
                      >Story hook<textarea
                        value={editFields.hookBanner || ""}
                        oninput={(e) =>
                          updateField("hookBanner", e.currentTarget.value)}
                        rows="3"></textarea></label
                    ><label
                      >Source highlight<textarea
                        value={editFields.keyStatHighlight || ""}
                        oninput={(e) =>
                          updateField(
                            "keyStatHighlight",
                            e.currentTarget.value,
                          )}
                        rows="4"></textarea></label
                    ><label
                      >Poll question<input
                        aria-label="Poll question"
                        value={editFields.interactiveStickerPrompt || ""}
                        oninput={(e) =>
                          updateField(
                            "interactiveStickerPrompt",
                            e.currentTarget.value,
                          )}
                      /></label
                    >
                  {:else}
                    <label
                      >Spoken hook<textarea
                        value={editFields.spokenHook0to3s || ""}
                        oninput={(e) =>
                          updateField("spokenHook0to3s", e.currentTarget.value)}
                        rows="3"></textarea></label
                    >{#each editFields.beats || [] as item, i (i)}<fieldset>
                        <legend>Beat {i + 1}</legend
                        >{#each ["timecode", "voiceover", "onScreenText", "bRollDirection"] as field (field)}<label
                            >{field}<textarea
                              value={item[field] || ""}
                              oninput={(e) =>
                                updateNested(
                                  "beats",
                                  i,
                                  field,
                                  e.currentTarget.value,
                                )}
                              rows={field === "timecode" ? 1 : 3}
                            ></textarea></label
                          >{/each}
                      </fieldset>{/each}<label
                      >Closing call to action<input
                        value={editFields.closingCta || ""}
                        oninput={(e) =>
                          updateField("closingCta", e.currentTarget.value)}
                      /></label
                    >
                  {/if}
                </div>
                <details class="advanced-editor">
                  <summary>Advanced format JSON</summary><label
                    >Format content<textarea
                      class="json-editor"
                      aria-label="Format content"
                      bind:value={editJson}
                      oninput={() => {
                        pendingEdits = true;
                        try {
                          editFields = JSON.parse(editJson);
                        } catch {}
                      }}
                      spellcheck="false"></textarea></label
                  >
                </details>
                <button
                  class="primary"
                  disabled={!pendingEdits || busy}
                  onclick={saveEdit}>Save changes</button
                >
                <div class="schedule-box">
                  <label
                    >Assigned day<select
                      aria-label="Assigned day"
                      bind:value={scheduledDay}
                      >{#each days as day (day)}<option>{day}</option
                        >{/each}</select
                    ></label
                  ><button class="secondary" onclick={updateSchedule}
                    >Assign to calendar</button
                  >
                  <p class="small muted">
                    Assigning a day does not publish or export.
                  </p>
                </div>
                <details class="sources">
                  <summary>Review source claims</summary>
                  <p class="small muted">
                    Approve a claim only after reviewing its linked source and
                    meaning. Clinical claims require a separate clinical review.
                  </p>
                  {#each reviewClaims as claim, i (claim.id)}<fieldset>
                      <legend>Claim {i + 1}</legend><button
                        class="secondary"
                        onclick={() => removeSourceClaim(claim.id)}
                        aria-label={`Remove claim ${i + 1}`}
                        >Remove claim {i + 1}</button><label
                        >Claim text<textarea bind:value={claim.text} rows="3"
                        ></textarea></label
                      ><label
                        >HTTPS source URL<input
                          type="url"
                          bind:value={claim.sourceUrl}
                          placeholder="https://…"
                        /></label
                      ><label
                        >Claim classification<select
                          aria-label="Claim classification"
                          bind:value={claim.kind}
                          ><option value="">Select a classification</option
                          ><option value="general">General editorial</option
                          ><option value="financial">Financial</option><option
                            value="cultural">Cultural</option
                          ><option value="clinical"
                            >Clinical · separate reviewer required</option
                          ></select
                        ></label
                      >{#if claim.kind === "clinical"}{#if canAdmin}<label
                            class="clinical-attestation"
                            ><input
                              type="checkbox"
                              bind:checked={claim.clinicalReviewRequested}
                            />I have completed the clinical source review and
                            want to record my review.</label
                          >{:else}<p class="small muted">
                            A founder clinical source review is required before
                            generation.
                          </p>{/if}{/if}<label
                        >Review status<select
                          aria-label="Review status"
                          bind:value={claim.status}
                          ><option value="unreviewed">Unreviewed</option><option
                            value="approved"
                            >Approved after source review</option
                          ><option value="rejected">Rejected</option></select
                        ></label
                      >{#if claim.kind === "clinical"}<p class="small error">
                          Clinical review must be recorded by an authorized
                          reviewer.
                        </p>{/if}
                    </fieldset>{/each}<button
                    class="secondary"
                    onclick={addSourceClaim}>Add source claim</button
                  ><button class="secondary" onclick={saveSourceClaims}
                    >Save source review</button
                  >
                </details>
                {#if preflight?.error}<p class="small error">
                    Preflight could not be recorded: {preflight.error}
                  </p>{:else if preflight}<p class="small muted">
                    Preflight recorded for this brand. Editorial review
                    required.
                  </p>{/if}
              </section>
              {#key organizationId + brandId + selectedStory.id + format}<Emulator
                  {campaign}
                  {brandProfile}
                  {format}
                  {backlog}
                  activeStoryId={selectedStory.id}
                  onpreflight={recordPreflight}
                />{/key}
            </div>{:else}<section class="panel">
              <h3>Review sources before generation</h3>
              <p class="muted">
                Add a source link to each claim and choose its review status.
                Unreviewed claims cannot enter a campaign.
              </p>
              <div class="field-editor">
                {#each reviewClaims as claim, i (claim.id)}<fieldset>
                    <legend>Claim {i + 1}</legend><button
                        class="secondary"
                        onclick={() => removeSourceClaim(claim.id)}
                        aria-label={`Remove claim ${i + 1}`}
                        >Remove claim {i + 1}</button><label
                      >Claim text<textarea bind:value={claim.text} rows="3"
                      ></textarea></label
                    ><label
                      >HTTPS source URL<input
                        type="url"
                        bind:value={claim.sourceUrl}
                        placeholder="https://…"
                      /></label
                    ><label
                      >Claim classification<select
                        aria-label="Claim classification"
                        bind:value={claim.kind}
                        ><option value="">Select a classification</option
                        ><option value="general">General editorial</option
                        ><option value="financial">Financial</option><option
                          value="cultural">Cultural</option
                        ><option value="clinical"
                          >Clinical · separate reviewer required</option
                        ></select
                      ></label
                    >{#if claim.kind === "clinical"}{#if canAdmin}<label
                          class="clinical-attestation"
                          ><input
                            type="checkbox"
                            bind:checked={claim.clinicalReviewRequested}
                          />I have completed the clinical source review and want
                          to record my review.</label
                        >{:else}<p class="small muted">
                          A founder clinical source review is required before
                          generation.
                        </p>{/if}{/if}<label
                      >Review status<select
                        aria-label="Review status"
                        bind:value={claim.status}
                        ><option value="unreviewed">Unreviewed</option><option
                          value="approved">Approved after source review</option
                        ><option value="rejected">Rejected</option></select
                      ></label
                    >
                  </fieldset>{/each}
              </div>
              <button class="secondary" onclick={addSourceClaim}
                >Add source claim</button
              >
              <button class="secondary" onclick={saveSourceClaims}
                >Save source review</button
              >
            </section>
            <div class="empty">
              <span class="empty-symbol">◧</span>
              <h2>A story ready to take shape.</h2>
              <p>
                Generate a draft from the supplied facts, then review every
                format.
              </p>
              <button class="primary" disabled={busy} onclick={generate}
                >{busy ? "Generating…" : "Generate four-format draft"}</button
              >
            </div>{/if}
        {:else}<div class="empty">
            <h2>Choose a story to begin.</h2>
            <p>
              Every campaign starts with supplied facts and a source review.
            </p>
            <button class="primary" onclick={() => (tab = "backlog")}
              >Open story backlog</button
            >
          </div>{/if}
      {:else if tab === "brand" && brandProfile}
        <form class="panel brand-form form-grid" onsubmit={saveProfile}>
          <label
            >Brand name<input
              bind:value={brandProfile.brandName}
              required
            /></label
          ><label>Website<input bind:value={brandProfile.websiteUrl} /></label
          ><label class="full"
            >Tagline<input bind:value={brandProfile.tagline} /></label
          ><label class="full"
            >Editorial mission<textarea
              bind:value={brandProfile.mission}
              rows="4"></textarea></label
          ><label
            >Wordmark / monogram<input
              bind:value={brandProfile.logoText}
            /></label
          ><label
            >Heading font<select
              aria-label="Heading font"
              bind:value={brandProfile.fonts.heading}
              >{#each supportedFonts as family (family)}<option value={family}
                  >{family}</option
                >{/each}</select
            ></label
          ><label
            >Body font<select
              aria-label="Body font"
              bind:value={brandProfile.fonts.body}
              >{#each supportedFonts as family (family)}<option value={family}
                  >{family}</option
                >{/each}</select
            ></label
          >
          <div class="full color-list">
            {#each brandProfile.colors || [] as color (color.name)}<label
                >{color.name}
                <div>
                  <input
                    aria-label="{color.name} color"
                    type="color"
                    bind:value={color.hex}
                  /><input
                    aria-label="{color.name} hex"
                    bind:value={color.hex}
                  />
                </div></label
              >{/each}
          </div>
          <button class="primary">Save Brand Kit</button>
        </form>
        {#if brandProfile.strategy}<section
            class="panel"
            style="margin-top:24px"
            aria-label="Brand positioning reference"
          >
            <span class="eyebrow">OWNER POSITIONING · READ-ONLY REFERENCE</span>
            <h2>Proposed editorial positioning</h2>
            <p class="muted">
              These audiences and pillars describe editorial intent. They are
              not verified factual or clinical claims. Source review is required
              for every campaign.
            </p>
            <span class="status-tag"
              >{brandProfile.strategy.status || "Proposed positioning"}</span
            >
            <div class="admin-grid" style="margin-top:24px">
              <section>
                <h3>Audience value groups</h3>
                {#each brandProfile.strategy.valueGroups || [] as group, i (typeof group === "string" ? group : group.id || i)}<article
                    class="panel"
                    style="margin-bottom:12px"
                  >
                    <h3>{typeof group === "string" ? group : group.name}</h3>
                    {#if typeof group === "object"}<p class="small muted">
                        {group.ageRange || ""}
                      </p>
                      <p>{group.motivation || ""}</p>{/if}
                  </article>{:else}<p class="muted">
                    Audience groups need owner review.
                  </p>{/each}
              </section>
              <section>
                <h3>Editorial pillars</h3>
                <ol>
                  {#each brandProfile.strategy.pillars || [] as pillar (pillar)}<li
                    >
                      <p>{pillar}</p>
                    </li>{:else}<li class="muted">
                      Editorial pillars need owner review.
                    </li>{/each}
                </ol>
              </section>
            </div>
            {#if brandProfile.strategy.clinicalClaimsQuarantined}<p
                class="small error"
              >
                Clinical claims remain quarantined until explicit source and
                clinical review are recorded.
              </p>{/if}
          </section>{/if}
        <section
          class="panel"
          style="margin-top:24px"
          aria-label="Unreviewed research topics"
        >
          <h2>Research queue · unreviewed</h2>
          <p class="muted">
            Research prompts are starting points, not approved claims. Open a
            topic to add sourced claims for review.
          </p>
          {#each backlog.filter((story) => story.category === "Source research") as story (story.id)}<article
              class="story-row"
            >
              <div class="story-copy">
                <h3>{story.title}</h3>
                <span class="status-tag"
                  >{story.reviewStatus || "Unreviewed research"}</span
                >
              </div>
              <button class="secondary" onclick={() => openStory(story)}
                >Review sources</button
              >
            </article>{:else}<p class="small muted">
              No research prompts in this brand.
            </p>{/each}
        </section>
      {:else if tab === "admin" && canAdmin}
        <div class="admin-grid">
          <section class="panel">
            <div class="panel-heading">
              <h2>Health & readiness</h2>
              <button class="secondary" onclick={loadAdmin}>Refresh</button>
            </div>
            <p class="muted">
              Repository readiness does not establish provider connectivity.
            </p>
            <div class="ops-metrics">
              <div>
                <b>{readiness?.status || "Unknown"}</b><span
                  >Service readiness</span
                >
              </div>
              <div>
                <b>{readiness?.checks?.repository || "Unknown"}</b><span
                  >Repository check</span
                >
              </div>
              <div>
                <b>{readiness?.checks?.generationProvider || "Not checked"}</b
                ><span>Generation provider</span>
              </div>
            </div>
            <details>
              <summary>Readiness details</summary>
              <pre>{JSON.stringify(readiness, null, 2)}</pre>
            </details>
          </section>
          <section class="panel">
            <h2>Scoped operations</h2>
            <button class="secondary" disabled={busy} onclick={() => runBatch()}
              >Run this brand’s batch</button
            >
            <p>
              <a href={"/api/admin/backprop-jsonl?" + scopeQuery()}
                >Download scoped feedback JSONL</a
              >
            </p>
            <p class="small muted">
              Jobs use this organization and brand. Export is separate from
              publishing.
            </p>
            <h3>Recent batch attempts</h3>
            <ul aria-label="Recent batch attempts">
              {#each adminData?.observability?.jobs?.slice(0, 10) || [] as job (job.jobId)}
                <li>
                  <strong>{job.status}</strong> · Attempt {job.attempt || 1}
                  <p class="small muted">
                    {job.completedStoryIds?.length || 0} completed stories
                    {job.retryOfJobId ? ` · Retry of ${job.retryOfJobId.slice(0, 8)}` : ''}
                  </p>
                  {#if job.status === 'FAILED' || job.status === 'INTERRUPTED'}
                    <button
                      class="secondary"
                      disabled={busy}
                      onclick={() => runBatch(job.jobId)}
                      aria-label={`${job.status === 'FAILED' ? 'Retry failed batch' : 'Retry interrupted batch'} ${job.jobId.slice(0, 8)}`}
                    >
                      {job.status === 'FAILED' ? 'Retry failed batch' : 'Retry interrupted batch'}
                    </button>
                  {/if}
                </li>
              {:else}
                <li class="muted">No batch attempts for this brand.</li>
              {/each}
            </ul>
          </section>
          <section class="panel">
            <h2>Organization management</h2>
            <form onsubmit={createOrganization}>
              <label
                >New organization name<input
                  bind:value={newOrganization}
                  required
                /></label
              ><button class="secondary">Create organization</button>
            </form>
            <form onsubmit={createBrand}>
              <label
                >New brand in {currentOrganization?.name}<input
                  bind:value={newBrand}
                  required
                /></label
              ><label
                >Brand preset<select
                  aria-label="Brand preset"
                  bind:value={newBrandPreset}
                  ><option value="liquidity_desk">The Liquidity Desk</option
                  ><option value="vedic_dharma">Chai With Jai</option></select
                ></label
              ><button class="secondary">Create brand</button>
            </form>
          </section>
          <section class="panel">
            <h2>Telemetry & generation</h2>
            <div class="ops-metrics">
              <div>
                <b>{adminData?.observability?.traces?.length || 0}</b><span
                  >Recent generation traces</span
                >
              </div>
              <div>
                <b>{adminData?.observability?.usageEvents || 0}</b><span
                  >Recorded usage events</span
                >
              </div>
              <div>
                <b>{adminData?.observability?.operationalEvents?.length || 0}</b
                ><span>Recent operational events</span>
              </div>
            </div>
            <p class="small muted">
              Usage records describe operations; they are not customer invoices
              or proof of factual accuracy.
            </p>
            <div class="trace-table">
              <table>
                <thead
                  ><tr
                    ><th>Status</th><th>Provider</th><th>Model</th><th
                      >Duration</th
                    ></tr
                  ></thead
                ><tbody
                  >{#each adminData?.observability?.traces || [] as trace (trace.traceId)}<tr
                      ><td>{trace.status}</td><td>{trace.provider}</td><td
                        >{trace.model}</td
                      ><td>{trace.latencyMs} ms</td></tr
                    >{:else}<tr
                      ><td colspan="4">No generation traces for this brand.</td
                      ></tr
                    >{/each}</tbody
                >
              </table>
            </div>
            <details>
              <summary>Operational data</summary>
              <pre>{JSON.stringify(adminData, null, 2)}</pre>
            </details>
          </section>
          <details class="panel">
            <summary>Architecture reference</summary>
            <pre>{JSON.stringify(graph, null, 2)}</pre>
          </details>
        </div>
      {/if}
    </main>
  </div>
{/if}
