<script>
  import { onMount, tick } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import Emulator from "./Emulator.svelte";
  import WorkspaceTable from "./WorkspaceTable.svelte";
  import WorkspaceCalendar from "./components/WorkspaceCalendar.svelte";
  import JobsPane from "./components/JobsPane.svelte";
  import { createWorkspaceClient } from "./lib/workspace-client.js";
  import { scopedRequest } from "./lib/scoped-request.js";
  import SourceReviewSummary from "./SourceReviewSummary.svelte";
  import { sourceReviewSummary, reviewSignature } from "./lib/source-review.js";
  import { createGoogleAuth } from "./lib/google-auth.js";
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
  let authMode = $state("unavailable");
  let googleAuth;
  let authSequence = 0;
  let requestSessionEpoch = 0;
  let googleLoginSequence = 0;
  let googleLoginTimer;
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
  let workspaceClient = $state(null);
  let workspaceState = $state(null);
  let workspaceUnsubscribe;
  // Projection of one canonical entity map; editor fields are intentional transient buffers.
  let backlog = $derived(workspaceState ? [...workspaceState.entities.values()].filter(entry => entry.story?.revision === entry.revision).map(entry => entry.story) : []);
  let selectedStory = $state(null);
  let editorConflictRevision = $state(null);
  let campaign = $state(null);
  let format = $state("infographic");
  let scheduledDay = $state("Monday");
  let search = $state("");
  let statusFilter = $state("All");
  let searchInput = $state(null);
  // Session-only view context, never story data or an authorization source.
  const backlogViews = new SvelteMap();
  let activeBacklogScopeKey = "";
  let scopeLoadError = $state("");
  let searchQuery = $derived(search.trim());
  let filtersActive = $derived(Boolean(searchQuery || statusFilter !== "All" || Object.entries(workspaceState?.query.definition.filters || {}).some(([key,value]) => !["search","statuses"].includes(key) && value !== "any" && value != null && value !== "" && (!Array.isArray(value) || value.length))));
  let editJson = $state("");
  let editFields = $state({});
  let pendingEdits = $state(false);
  let title = $state("");
  let sourceFacts = $state("");
  let sourceUrls = $state("");
  let reviewClaims = $state([]);
  let savedReviewSignature = $state("[]");
  let generationReview = $derived(sourceReviewSummary(reviewClaims, reviewSignature(reviewClaims) !== savedReviewSignature));
  function focusSourceClaim(id) {
    const target = document.getElementById(`source-claim-${encodeURIComponent(id)}`);
    const disclosure = target?.closest("details");
    if (disclosure) disclosure.open = true;
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
    (target?.querySelector("textarea, input, select") || target)?.focus();
  }
  const reelFields = [
    { key: "timecode", label: "Time range", hint: "Start and end time for this beat, in seconds." },
    { key: "voiceover", label: "Voiceover", hint: "Words to speak during this beat." },
    { key: "onScreenText", label: "On-screen text", hint: "Short text the viewer reads on the artwork." },
    { key: "bRollDirection", label: "B-roll direction", hint: "Describe the supporting shot. This does not generate footage." },
  ];
  let reviewDirty = $derived(reviewSignature(reviewClaims) !== savedReviewSignature);
  let nextWorkflowAction = $derived(editorConflictRevision ? "Resolve newer saved revision" : reviewDirty ? "Save source review" : !generationReview.ready ? "Review source prerequisites" : !campaign ? "Generate a draft" : pendingEdits ? "Save artwork changes" : "Inspect preview and validation before handoff");
  let workflowContext = $state(null);
  function measureWorkflowOffset(bar = workflowContext) {
    if (!bar?.isConnected) return 16;
    const style = getComputedStyle(bar);
    const offset = style.position === "sticky"
      ? Math.ceil(bar.getBoundingClientRect().height + (parseFloat(style.top) || 0) + 16)
      : 16;
    document.documentElement.style.setProperty("--workflow-offset", `${offset}px`);
    return offset;
  }
  $effect(() => {
    const bar = workflowContext;
    if (!bar) return;
    const update = () => measureWorkflowOffset(bar);
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--workflow-offset");
    };
  });
  async function focusWorkflow(id) {
    await tick();
    const target = document.getElementById(id);
    if (!target) return;
    if (target.tagName === "DETAILS") target.open = true;
    const offset = measureWorkflowOffset();
    window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), behavior: "instant" });
    target.focus({ preventScroll: true });
  }
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
  let scopeLoading = $state(false);
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
        (!searchQuery ||
          (story.title + " " + story.category)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
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
  function requestContext() {
    return { sessionEpoch: requestSessionEpoch, scopeToken: lastScopeToken, query: scopeQuery() };
  }
  function request(path, options = {}, scoped = true) {
    const context = requestContext();
    const auth = googleAuth;
    const google = authMode === "google";
    return scopedRequest({
      path, options, scoped, context, getContext: requestContext,
      authorize: async () => google ? { Authorization: `Bearer ${await auth.getToken()}` } : {},
      onUnauthorized: clearWorkspace,
    });
  }
  function post(path, body = {}, scoped = true) {
    return request(
      path,
      { method: "POST", body: JSON.stringify(body) },
      scoped,
    );
  }
  function applySession(session) {
    requestSessionEpoch++;
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
  function invalidateGoogleLoginAttempt() {
    googleLoginSequence++;
    clearTimeout(googleLoginTimer);
    googleLoginTimer = undefined;
  }
  function disposeWorkspaceClient() {
    workspaceUnsubscribe?.();
    workspaceClient?.dispose();
    workspaceClient = null;
    workspaceState = null;
  }
  function initializeWorkspaceClient(view) {
    disposeWorkspaceClient();
    const client = createWorkspaceClient({ request, scopeKey: backlogScopeKey(), initialQuery: view?.workspaceQuery, initialUi: view?.workspaceUi });
    workspaceClient = client;
    workspaceUnsubscribe = client.subscribe(state => {
      workspaceState = state;
      const current = selectedStory && client.getStory(selectedStory.id);
      if (current && current.revision > selectedStory.revision) {
        if (pendingEdits || reviewSignature(reviewClaims) !== savedReviewSignature) {
          // Canonical projections may advance; an unsaved editor keeps its original optimistic base.
          editorConflictRevision = current.revision;
        } else {
          // A clean editor adopts the whole saved snapshot, including its editable buffers.
          selectStory(current);
        }
      }
    });
  }
  async function openWorkspaceStory(id) {
    const client = workspaceClient;
    try {
      await client.ensureStories([id], { force: true });
      if (workspaceClient !== client) return;
      const story = client.getStory(id);
      if (story) await openStory(story);
    } catch (failure) {
      if (workspaceClient === client && failure.code !== "REQUEST_CONTEXT_CHANGED") error = failure.message;
    }
  }
  async function discardLocalEditsAndReload() {
    const client = workspaceClient, storyId = selectedStory?.id;
    if (!client || !storyId) return;
    try {
      await client.ensureStories([storyId], {force:true});
      if (workspaceClient !== client || selectedStory?.id !== storyId) return;
      const story = client.getStory(storyId);
      if (story) { selectStory(story); error = ""; notice = "Loaded the current saved story. Local edits were discarded."; }
    } catch (failure) {
      if (workspaceClient === client && failure.code !== "REQUEST_CONTEXT_CHANGED") error = failure.message;
    }
  }
  function receiveStories(stories, replace = false) {
    if (workspaceClient && stories) workspaceClient.ingestStories(stories, {replace});
  }
  function clearWorkspace() {
    requestSessionEpoch++;
    lastScopeToken++;
    scopeLoading = false;
    scopeLoadError = "";
    backlogViews.clear();
    activeBacklogScopeKey = "";
    search = "";
    statusFilter = "All";
    user = null;
    organizations = [];
    permissions = {};
    organizationId = "";
    brandId = "";
    disposeWorkspaceClient();
    selectedStory = null;
    campaign = null;
    brandProfile = null;
    adminData = null;
    preflight = null;
    exportUrl = "";
    pendingEdits = false;
  }
  onMount(() => {
    let disposed = false;
    let unsubscribe;
    async function initialize() {
      try {
        const configResponse = await fetch("/api/auth/config");
        if (!configResponse.ok) throw new Error("Could not load sign-in configuration.");
        const config = await configResponse.json();
        if (disposed) return;
        if (!["google", "password"].includes(config.mode)) throw new Error("Unsupported sign-in configuration.");
        authMode = config.mode;
        if (authMode === "google") {
          googleAuth = createGoogleAuth(config);
          unsubscribe = googleAuth.watch(async (identity) => {
            invalidateGoogleLoginAttempt();
            const sequence = ++authSequence;
            clearWorkspace();
            booting = true;
            try {
              if (identity) {
                const session = await request("/api/auth/session", {}, false);
                if (disposed || sequence !== authSequence) return;
                applySession(session);
                if (brandId) await loadScope();
              }
            } catch (failure) {
              if (!disposed && sequence === authSequence) {
                clearWorkspace();
                error = `Google sign-in could not open this workspace: ${failure.message}. Check your invited account or contact the studio operator.`;
              }
            } finally {
              if (!disposed && sequence === authSequence) { booting = false; busy = false; }
            }
          });
        } else {
          const response = await fetch("/api/auth/session", {credentials: "same-origin"});
          if (response.ok && !disposed) {
            applySession(await response.json());
            if (brandId) await loadScope();
          }
          if (!disposed) booting = false;
        }
      } catch (failure) {
        if (!disposed) { error = failure.message; booting = false; }
      }
    }
    initialize();
    return () => { disposed = true; authSequence++; invalidateGoogleLoginAttempt(); unsubscribe?.(); };
  });
  async function loginGoogle() {
    if (busy || !googleAuth) return;
    invalidateGoogleLoginAttempt();
    const attempt = googleLoginSequence;
    busy = true;
    error = "";
    // Firebase owns popup authentication; this timer only restores an explicit retry.
    // Public SDK flow: https://firebase.google.com/docs/auth/web/google-signin
    const timer = setTimeout(() => {
      if (attempt !== googleLoginSequence) return;
      invalidateGoogleLoginAttempt();
      busy = false;
      error = "Google sign-in has not completed. Finish the Google popup or try again.";
    }, 90000);
    googleLoginTimer = timer;
    try {
      await googleAuth.login();
    } catch (failure) {
      if (attempt !== googleLoginSequence) return;
      error = failure.code === "auth/popup-closed-by-user"
        ? "Google sign-in was closed. Select Continue with Google to try again."
        : failure.code === "auth/popup-blocked"
          ? "Allow the Google sign-in popup, then try again."
          : failure.message || "Google sign-in failed. Try again.";
    } finally {
      clearTimeout(timer);
      if (attempt === googleLoginSequence) {
        googleLoginTimer = undefined;
        busy = false;
      }
    }
  }
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
      if (authMode === "google") await googleAuth.logout();
      else await post("/api/auth/logout", {}, false);
      authSequence++;
      invalidateGoogleLoginAttempt();
      clearWorkspace();
      booting = false;
    } catch (failure) { error = failure.message; }
  }
  async function downloadArtifact(event) {
    if (authMode !== "google") return;
    event.preventDefault();
    try {
      const response = await fetch(exportUrl, {headers:{Authorization:`Bearer ${await googleAuth.getToken()}`}});
      if (!response.ok) throw new Error(`Download failed (${response.status}). Sign in again if access expired.`);
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url; link.download = exportName; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) { error = failure.message; }
  }
  function backlogScopeKey() {
    return JSON.stringify([user?.id, organizationId, brandId]);
  }
  function rememberBacklogView() {
    if (!user || scopeLoading || scopeLoadError) return;
    const key = backlogScopeKey();
    const previous = backlogViews.get(key);
    backlogViews.set(key, {
      search,
      statusFilter,
      selectedStoryId: selectedStory?.id,
      scrollY: tab === "backlog" ? window.scrollY : previous?.scrollY || 0,
      workspaceQuery: workspaceClient?.snapshot.query.definition,
      workspaceUi: workspaceClient?.snapshot.ui,
    });
  }
  async function navigateTab(next) {
    if (tab === "backlog") rememberBacklogView();
    tab = next;
    if (next === "backlog") {
      const token = lastScopeToken;
      await tick();
      if (token === lastScopeToken && !scopeLoading) {
        window.scrollTo(0, backlogViews.get(backlogScopeKey())?.scrollY || 0);
      }
    }
  }
  async function clearFilters() {
    search = "";
    statusFilter = "All";
    await workspaceClient?.query({...workspaceClient.snapshot.query.definition,filters:{}});
    rememberBacklogView();
    await tick();
    searchInput?.focus();
  }
  async function loadScope() {
    const key = backlogScopeKey();
    const cached = backlogViews.get(key);
    const view = key === activeBacklogScopeKey
      ? {
          search,
          statusFilter,
          selectedStoryId: selectedStory?.id || cached?.selectedStoryId,
          scrollY: cached?.scrollY || 0,
          workspaceQuery: workspaceClient?.snapshot.query.definition || cached?.workspaceQuery,
          workspaceUi: workspaceClient?.snapshot.ui || cached?.workspaceUi,
        }
      : cached;
    activeBacklogScopeKey = key;
    search = view?.search || "";
    statusFilter = view?.statusFilter || "All";
    scopeLoadError = "";
    const token = ++lastScopeToken;
    scopeLoading = true;
    disposeWorkspaceClient();
    brandProfile = null;
    reviewClaims = [];
    notice = "";
    error = "";
    busy = true;
    selectedStory = null;
    campaign = null;
    adminData = null;
    preflight = null;
    exportUrl = "";
    pendingEdits = false;
    initializeWorkspaceClient(view);
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
      receiveStories(data.backlog || [], true);
      if (data.organizations) organizations = data.organizations;
      if (data.permissions) permissions = data.permissions;
      if (backlog.length) {
        selectStory(backlog.find(story => story.id === view?.selectedStoryId) || backlog[0]);
      }
    } catch (failure) {
      if (token === lastScopeToken) {
        error = failure.message;
        scopeLoadError = failure.message;
        disposeWorkspaceClient();
        brandProfile = null;
      }
    } finally {
      if (token === lastScopeToken) {
        busy = false;
        scopeLoading = false;
        await tick();
        if (token === lastScopeToken && tab === "backlog" && !scopeLoadError) {
          window.scrollTo(0, view?.scrollY || 0);
        }
      }
    }
  }
  async function switchOrganization(event) {
    const selector = event.currentTarget;
    const requestedOrganizationId = selector.value;
    if (pendingEdits && !(await saveEdit())) {
      selector.value = organizationId;
      return;
    }
    rememberBacklogView();
    organizationId = requestedOrganizationId;
    brandId =
      organizations.find((org) => org.id === organizationId)?.brands?.[0]?.id ||
      "";
    tab = "backlog";
    await loadScope();
  }
  async function switchBrand(event) {
    const selector = event.currentTarget;
    const requestedBrandId = selector.value;
    if (pendingEdits && !(await saveEdit())) {
      selector.value = brandId;
      return;
    }
    rememberBacklogView();
    brandId = requestedBrandId;
    tab = "backlog";
    await loadScope();
  }
  function selectStory(story) {
    editorConflictRevision = null;
    selectedStory = story ? JSON.parse(JSON.stringify(story)) : null;
    campaign = selectedStory?.campaignDraft || null;
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
    savedReviewSignature = reviewSignature(reviewClaims);
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
    rememberBacklogView();
    selectStory(story);
    rememberBacklogView();
    tab = "studio";
  }
  async function selectFormat(next) {
    if (pendingEdits && !(await saveEdit())) return;
    format = next;
    exportUrl = "";
    syncEditor();
  }
  async function generate() {
    if (!selectedStory || busy || !generationReview.ready) return;
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
      receiveStories(result.backlog || (selectedStory ? [selectedStory] : []));
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
      receiveStories([saved.story || selectedStory]);
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
    const token = lastScopeToken;
    const storyId = selectedStory.id;
    const expectedRevision = selectedStory.revision;
    const requestedDay = scheduledDay;
    const idempotencyKey = crypto.randomUUID();
    try {
      const data = await post("/api/studio/schedule", {
        storyId,
        status: "Scheduled",
        scheduledDay: requestedDay,
        expectedRevision,
        idempotencyKey,
      });
      if (token !== lastScopeToken || selectedStory?.id !== storyId) return;
      if (selectedStory.revision !== expectedRevision) {
        notice = "The schedule was saved. Reload this story to see concurrent changes.";
        return;
      }
      // Scheduling changes metadata only. Keep any text typed while it ran.
      selectedStory = { ...data.story, campaignDraft: campaign || data.story.campaignDraft };
      receiveStories(data.backlog || [data.story]);
      notice = `Assigned to ${requestedDay} as an undated weekday. This does not publish to Instagram.`;
    } catch (failure) {
      if (token === lastScopeToken && selectedStory?.id === storyId) error = failure.message;
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
      // Reconcile the exported revision before exposing its download. Clean snapshot adoption
      // intentionally clears stale artifacts, so the new link is assigned afterward.
      receiveStories(result.backlog || (selectedStory ? [selectedStory] : []));
      exportUrl = result.downloadUrl || result.artifact?.downloadUrl || "";
      exportName = result.filename || result.artifact?.filename || "Download export";
      if (!exportUrl) throw new Error("Server did not return a downloadable artifact");
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
  async function reloadSourceReview() {
    if (!selectedStory || busy || pendingEdits) return;
    const token = lastScopeToken;
    const id = selectedStory.id;
    try {
      const data = await request("/api/studio/bootstrap");
      if (token !== lastScopeToken || selectedStory?.id !== id) return;
      const story = data.backlog?.find((item) => item.id === id);
      if (!story) throw new Error("Story is no longer available in this brand.");
      receiveStories(data.backlog, true);
      selectStory(story);
      error = "";
      notice = "Saved review reloaded. Unsaved review edits were discarded.";
    } catch (failure) { if (token === lastScopeToken) error = failure.message; }
  }
  async function saveSourceClaims() {
    if (!selectedStory) return;
    if (!reviewClaims.length) {
      error = "Add at least one sourced claim before saving the review.";
      return;
    }
    error = "";
    const token = lastScopeToken;
    const storyId = selectedStory.id;
    const submittedSignature = reviewSignature(reviewClaims);
    try {
      const result = await post("/api/studio/source-claims", {
        storyId,
        sourceClaims: reviewClaims,
        expectedRevision: selectedStory.revision,
      });
      if (token !== lastScopeToken || selectedStory?.id !== storyId) return;
      if (result.story) {
        selectedStory = result.story;
        const savedClaims = (result.story.sourceClaims || []).map((claim) => ({ ...claim }));
        const unchanged = reviewSignature(reviewClaims) === submittedSignature;
        if (unchanged) reviewClaims = savedClaims;
        savedReviewSignature = reviewSignature(savedClaims);
        receiveStories([result.story]);
      }
      notice =
        "Source review saved. Only approved sourced claims can enter generation.";
    } catch (failure) {
      if (token === lastScopeToken && selectedStory?.id === storyId) error = failure.message;
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
      receiveStories(result.backlog || [result.story]);
      title = "";
      sourceFacts = "";
      sourceUrls = "";
      notice = "Story added. Supplied facts still need source review.";
    } catch (failure) {
      error = failure.message;
    }
  }
  async function loadAdmin() {
    if (tab === "backlog") rememberBacklogView();
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
  async function recordPreflight(payload, isCurrent = () => true) {
    if (!payload) {
      preflightSequence++;
      preflight = null;
      return;
    }
    if (!selectedStory || !user) return;
    const sequence = ++preflightSequence;
    const token = lastScopeToken;
    const storyId = selectedStory.id,
      revision = selectedStory.revision,
      selectedFormat = format;
    const current = () =>
      sequence === preflightSequence &&
      token === lastScopeToken &&
      selectedStory?.id === storyId &&
      selectedStory?.revision === revision &&
      format === selectedFormat &&
      isCurrent();
    try {
      const result = await post("/api/studio/preflight", {
        storyId: selectedStory.id,
        expectedRevision: selectedStory.revision,
        ...payload,
      });
      if (current()) preflight = result;
    } catch (failure) {
      if (current()) preflight = { error: failure.message };
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
      {#if authMode === "google"}<button class="primary" disabled={busy} onclick={loginGoogle}>{busy ? "Signing in…" : "Continue with Google"}</button>
      {:else if authMode === "password"}<form onsubmit={login}>
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
      </form>{/if}
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
          navigateTab("backlog");
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
        {#each [{ id: "backlog", label: "Story backlog", icon: "▤" }, { id: "calendar", label: "Content calendar", icon: "▦" }, { id: "studio", label: "Campaign Studio", icon: "◧" }, { id: "brand", label: "Brand Kit", icon: "◉" }, { id: "jobs", label: "Jobs", icon: "◷" }] as item (item.id)}<button
            class:active={tab === item.id}
            onclick={() => navigateTab(item.id)}
            ><span aria-hidden="true">{item.icon}</span>{item.label}</button
          >{/each}{#if canAdmin}<button
            class:active={tab === "admin"}
            disabled={scopeLoading}
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
                    : tab === "jobs" ? "Work in progress." : "Studio operations"}
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
      {#if scopeLoading}
        <div class="panel" role="status">Loading {currentBrand?.name || "brand"} workspace…</div>
      {:else if scopeLoadError}
        <div class="panel">
          <h2>Workspace could not load.</h2>
          <p>Retry loading this brand before opening or adding stories.</p>
          <button class="secondary" onclick={loadScope}>Retry workspace</button>
        </div>
      {:else if tab === "backlog"}
        <div class="section-line">
          <div>
            <h2>Story backlog <span class="count">{workspaceState?.query.loaded ? workspaceState.query.filteredTotal : filteredStories.length} of {workspaceState?.query.loaded ? workspaceState.query.total : backlog.length}</span></h2>
            <p id="backlog-results" class="muted" role="status" aria-live="polite" aria-atomic="true">Showing {workspaceState?.query.loaded ? workspaceState.query.filteredTotal : filteredStories.length} of {workspaceState?.query.loaded ? workspaceState.query.total : backlog.length} stories.{searchQuery ? ` Search: ${searchQuery}.` : ""}{statusFilter !== "All" ? ` Status: ${statusFilter}.` : ""}</p>
            <p class="muted">Opening a saved story keeps your edits.</p>
          </div>
          <div class="filters">
            <input
              bind:this={searchInput}
              aria-label="Search stories"
              aria-describedby="backlog-results"
              placeholder="Search stories…"
              bind:value={search}
            /><select aria-label="Filter by status" bind:value={statusFilter}
              ><option>All</option
              >{#each [...new Set([...backlog.map((story) => story.status), statusFilter].filter(status => status !== "All"))] as status (status)}<option
                  >{status}</option
                >{/each}</select
            >
          </div>
        </div>
        {#if filtersActive}
          <div class="active-filters" role="group" aria-label="Active filters">
            {#if searchQuery}<span class="status-tag">Search: {searchQuery}</span>{/if}
            {#if statusFilter !== "All"}<span class="status-tag">Status: {statusFilter}</span>{/if}
            <button class="secondary" onclick={clearFilters}>Clear filters</button>
          </div>
        {/if}
        {#if workspaceClient}
          <WorkspaceTable client={workspaceClient} scopeKey={workspaceClient.scopeKey} actorId={user.id} {canAdmin} {search} {statusFilter}
            onQueryFilters={(filters) => { search = filters.search || ""; statusFilter = filters.statuses?.[0] || "All"; rememberBacklogView(); }}
            onOpenStory={openStory} />
        {/if}
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
        {#if workspaceClient}
          <WorkspaceCalendar client={workspaceClient} scopeKey={workspaceClient.scopeKey}
            onOpenStory={openWorkspaceStory}
            onReceipt={() => {}} />
        {/if}
      {:else if tab === "jobs"}
        {#if workspaceClient}{#key workspaceClient}<JobsPane {request} scopeKey={workspaceClient.scopeKey} onOpenStory={openWorkspaceStory} />{/key}{/if}
      {:else if tab === "studio"}
        {#if selectedStory && editorConflictRevision}
          <div class="workspace-conflict" role="alert">A newer saved revision {editorConflictRevision} is available. Your local edits still use revision {selectedStory.revision}; they cannot overwrite the newer work.
            <button class="secondary" onclick={discardLocalEditsAndReload}>Discard local edits and load saved story</button>
          </div>
        {/if}
        {#if selectedStory}
          <section class="workflow-context" aria-label="Current editorial task" bind:this={workflowContext}>
            <div class="workflow-identity"><strong title={selectedStory.title}>{selectedStory.title}</strong><span>{currentOrganization?.name} / {currentBrand?.name} · {formats.find(item => item.id === format)?.name} · revision {selectedStory.revision}</span></div>
            <p class="workflow-state" role="status">{pendingEdits ? "Unsaved artwork changes" : campaign ? "Artwork saved" : "No draft yet"} · {reviewDirty ? "Unsaved source review" : generationReview.ready ? "Source prerequisites saved" : `${generationReview.blockers.length} source prerequisite${generationReview.blockers.length === 1 ? "" : "s"} to review`}{editorConflictRevision ? ` · Newer saved revision ${editorConflictRevision}; resolve the conflict before saving.` : ""} · Next: {nextWorkflowAction}</p>
            <nav aria-label="Editorial task actions">
              <button class="secondary" onclick={() => focusWorkflow("workflow-sources")}>Review sources</button>
              {#if campaign}<button class="secondary" onclick={() => focusWorkflow("workflow-editor")}>Edit wording</button><button class="secondary" onclick={() => focusWorkflow("workflow-preview")}>Preview & validation</button><button class="secondary" onclick={() => focusWorkflow("workflow-validation")}>Validation results</button>
              <button class="primary" disabled={!pendingEdits || busy || Boolean(editorConflictRevision)} onclick={saveEdit}>Save artwork changes</button>
              <button class="secondary" onclick={() => focusWorkflow("workflow-handoff")}>Export handoff</button>{/if}
              <button class="secondary" onclick={() => navigateTab("calendar")}>Plan in calendar</button>
              <button class="secondary" onclick={() => navigateTab("backlog")}>Return to backlog</button>
            </nav>
          </section>
          <div class="studio-toolbar" id="workflow-handoff" tabindex="-1">
            <div>
              <span class="eyebrow">ACTIVE STORY</span>
              <h2>{selectedStory.title}</h2>
              <span class="provenance"
                >{campaign ? provenance : "No generated draft yet"}</span
              >
            </div>
            <div class="toolbar-actions">
              <button class="secondary" disabled={busy || !generationReview.ready} onclick={generate}
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
          <div class="generation-review-context"><SourceReviewSummary summary={generationReview} onclaim={focusSourceClaim} /></div>
          {#if exportUrl}<p class="download">
              <a href={exportUrl} download={exportName} onclick={downloadArtifact}>↓ {exportName}</a><small
                >Actual exported artifact · scope authorization required</small
              >
            </p>{/if}
          <p class="small muted workflow-boundaries">Saving updates the private draft. Calendar placement plans work; export downloads a file for handoff. Neither publishes nor opens Doory or Penpot. Unsaved changes stay in this tab when you visit the calendar or backlog; return via Campaign Studio. Reloading discards unsaved changes.</p>
          <div class="format-tabs" aria-label="Campaign format">
            {#each formats as item (item.id)}<button
                class:active={format === item.id}
                onclick={() => selectFormat(item.id)}
                >{item.name}<small>{item.ratio}</small></button
              >{/each}
          </div>
          {#if campaign}<div class="studio-grid">
              <section class="editor-panel workflow-target" id="workflow-editor" aria-label="Campaign wording" tabindex="-1">
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
                        >{#each reelFields as field (field.key)}<label
                            >{field.label}<small class="field-guidance">{field.hint}</small><textarea
                              aria-label={`Beat ${i + 1} ${field.label}`}
                              value={item[field.key] || ""}
                              oninput={(e) =>
                                updateNested(
                                  "beats",
                                  i,
                                  field.key,
                                  e.currentTarget.value,
                                )}
                              rows={field.key === "timecode" ? 1 : 3}
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
                <details class="sources workflow-target" id="workflow-sources" tabindex="-1">
                  <summary>Review source claims</summary>
                  <div class="generation-review-context generation-review-context--editor"><SourceReviewSummary summary={generationReview} onclaim={focusSourceClaim} /></div>
                  <p class="small muted">
                    Approve a claim only after reviewing its linked source and
                    meaning. Clinical claims require a separate clinical review.
                  </p>
                  {#each reviewClaims as claim, i (claim.id)}<fieldset id={`source-claim-${encodeURIComponent(claim.id)}`} tabindex="-1">
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
                  ><button class="secondary" disabled={busy || pendingEdits} onclick={reloadSourceReview}>Reload saved review (discard review edits)</button>
                </details>
                {#if preflight?.error}<p class="small error">
                    Preflight could not be recorded: {preflight.error}
                  </p>{:else if preflight}<p class="small muted">
                    Preflight recorded for this brand. Editorial review
                    required.
                  </p>{/if}
                {#if preflight?.artifact}
                  <p class="small muted" data-testid="recorded-preflight">Recorded {preflight.artifact.format} · saved revision {preflight.artifact.storyRevision}</p>
                {/if}
              </section>
              <section class="preview-workspace workflow-target" id="workflow-preview" aria-label="Preview and validation" tabindex="-1">{#key organizationId + brandId + selectedStory.id + format}<Emulator
                  {campaign}
                  {brandProfile}
                  {format}
                  {backlog}
                  activeStoryId={selectedStory.id}
                  storyRevision={selectedStory.revision}
                  {pendingEdits}
                  onpreflight={recordPreflight}
                />{/key}</section>
            </div>{:else}<section class="panel workflow-target" id="workflow-sources" aria-label="Source prerequisites" tabindex="-1">
              <h3>Review sources before generation</h3>
              <p class="muted">
                Add a source link to each claim and choose its review status.
                Unreviewed claims cannot enter a campaign.
              </p>
              <div class="field-editor">
                {#each reviewClaims as claim, i (claim.id)}<fieldset id={`source-claim-${encodeURIComponent(claim.id)}`} tabindex="-1">
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
              ><button class="secondary" disabled={busy || pendingEdits} onclick={reloadSourceReview}>Reload saved review (discard review edits)</button>
            </section>
            <div class="empty">
              <span class="empty-symbol">◧</span>
              <h2>A story ready to take shape.</h2>
              <p>
                Generate a draft from the supplied facts, then review every
                format.
              </p>
              <SourceReviewSummary summary={generationReview} onclaim={focusSourceClaim} />
              <button class="primary" disabled={busy || !generationReview.ready} onclick={generate}
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
