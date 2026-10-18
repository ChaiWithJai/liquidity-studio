import { writable } from "svelte/store";

export const DEFAULT_WORKSPACE_QUERY = Object.freeze({
  filters: {},
  sort: [{ field: "title", direction: "asc" }],
  groupBy: null,
  columns: [
    "title",
    "category",
    "status",
    "sourceReadiness",
    "assigneeId",
    "revision",
  ],
  limit: 25,
});
const copy = (value) =>
  value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const changed = () =>
  Object.assign(new Error("Workspace changed. Retry in the current brand."), {
    code: "REQUEST_CONTEXT_CHANGED",
  });

/** One scoped entity map. Rows are projections; an older full DTO is never relabeled as current. */
export function createWorkspaceClient({
  request,
  scopeKey,
  initialQuery = DEFAULT_WORKSPACE_QUERY,
  initialUi = {},
}) {
  let disposed = false,
    querySequence = 0,
    calendarSequence = 0;
  let state = {
    scopeKey,
    entities: new Map(),
    pageIds: [],
    query: {
      definition: copy(initialQuery),
      total: 0,
      filteredTotal: 0,
      groups: [],
      nextCursor: null,
      loading: false,
      error: "",
      loaded: false,
    },
    calendar: { data: null, loading: false, error: "", parameters: null },
    members: [],
    views: [],
    operations: [],
    receipt: null,
    mutationPending: false,
    error: "",
    uncertain: null,
    ui: {
      selectedIds: [],
      scrollTop: 0,
      focusStoryId: null,
      ...copy(initialUi),
      // A recreated scope restores row context, never an uninitialized editable panel.
      drawerStoryId: null,
    },
    deletedView: null,
  };
  const store = writable(state);
  const guard = () => {
    if (disposed) throw changed();
  };
  function publish(patch = {}) {
    guard();
    state = { ...state, ...patch };
    store.set(state);
  }
  async function call(path, body) {
    guard();
    const result = await request(
      "/api/studio/workspace" + path,
      body === undefined ? {} : { method: "POST", body: JSON.stringify(body) },
    );
    guard();
    return result;
  }
  function applyRow(row, entities) {
    if (
      !row ||
      typeof row.id !== "string" ||
      !Number.isSafeInteger(row.revision)
    )
      throw Error("Invalid workspace story projection");
    const previous = entities.get(row.id);
    if (previous && previous.revision > row.revision) return;
    entities.set(row.id, {
      id: row.id,
      revision: row.revision,
      row: copy(row),
      story: previous?.story?.revision === row.revision ? previous.story : null,
    });
  }
  function ingestStories(stories, { replace = false } = {}) {
    guard();
    const entities = replace ? new Map() : new Map(state.entities);
    for (const story of stories) {
      if (
        !story ||
        typeof story.id !== "string" ||
        !Number.isSafeInteger(story.revision)
      )
        throw Error("Invalid canonical story");
      const previous = state.entities.get(story.id);
      if (previous && previous.revision > story.revision) {
        entities.set(story.id, previous);
        continue;
      }
      entities.set(story.id, {
        id: story.id,
        revision: story.revision,
        row: previous?.revision === story.revision ? previous.row : null,
        story: copy(story),
      });
    }
    const changedStories = stories.some(
      (story) =>
        !state.entities.has(story.id) ||
        state.entities.get(story.id).revision !== story.revision,
    );
    publish({ entities });
    if (changedStories && state.query.loaded)
      query(state.query.definition).catch(() => {});
  }
  async function ensureStories(ids, { force = false } = {}) {
    guard();
    const details = await Promise.all(
      [...new Set(ids)].map(async (id) => {
        const existing = state.entities.get(id);
        if (
          !force &&
          existing?.story &&
          existing.story.revision === existing.revision
        )
          return null;
        return call("/stories/" + encodeURIComponent(id));
      }),
    );
    guard();
    const entities = new Map(state.entities);
    for (const result of details.filter(Boolean)) {
      if (
        result.story?.id !== result.row?.id ||
        result.story.revision !== result.row.revision
      )
        throw Error("Mismatched workspace detail revision");
      applyRow(result.row, entities);
      const current = entities.get(result.story.id);
      if (current.revision === result.story.revision)
        entities.set(result.story.id, {
          ...current,
          story: copy(result.story),
        });
    }
    publish({ entities });
    return ids.map((id) => getStory(id));
  }
  function getStory(id) {
    const entry = state.entities.get(id);
    return entry?.story && entry.story.revision === entry.revision
      ? copy(entry.story)
      : null;
  }
  async function query(
    definition = state.query.definition,
    { append = false } = {},
  ) {
    guard();
    const sequence = ++querySequence;
    const { cursor: ignored, ...normalized } = copy(definition);
    const cursor = append ? state.query.nextCursor : null;
    if (append && !cursor) return;
    publish({
      query: {
        ...state.query,
        definition: normalized,
        loading: true,
        error: "",
      },
      ...(!append ? { ui: { ...state.ui, selectedIds: [] } } : {}),
    });
    try {
      const result = await call("/query", {
        ...normalized,
        ...(cursor ? { cursor } : {}),
      });
      if (sequence !== querySequence) return;
      const entities = new Map(state.entities);
      for (const row of result.rows) applyRow(row, entities);
      publish({
        entities,
        pageIds: append
          ? [
              ...new Set([
                ...state.pageIds,
                ...result.rows.map((row) => row.id),
              ]),
            ]
          : result.rows.map((row) => row.id),
        query: {
          ...result,
          definition: result.definition,
          loading: false,
          error: "",
          loaded: true,
        },
      });
      return result;
    } catch (error) {
      if (disposed || sequence !== querySequence) return;
      if (append && error.status === 409) {
        await query(normalized);
        publish({
          error:
            "Stories changed while paging. The first page was refreshed; select your stories again.",
        });
        return;
      }
      publish({
        query: { ...state.query, loading: false, error: error.message },
      });
      throw error;
    }
  }
  async function loadCalendar(parameters) {
    guard();
    const sequence = ++calendarSequence;
    publish({
      calendar: {
        ...state.calendar,
        parameters: copy(parameters),
        loading: true,
        error: "",
      },
    });
    try {
      const result = await call("/calendar?" + new URLSearchParams(parameters));
      if (sequence !== calendarSequence) return;
      const entities = new Map(state.entities);
      for (const row of [...result.unscheduled, ...result.legacyWeekdays])
        applyRow(row, entities);
      const { unscheduled, legacyWeekdays, ...rest } = result;
      publish({
        entities,
        calendar: {
          data: {
            ...rest,
            unscheduledIds: unscheduled.map((row) => row.id),
            legacyWeekdayIds: legacyWeekdays.map((row) => row.id),
          },
          parameters: copy(parameters),
          loading: true,
          error: "",
        },
      });
      await ensureStories(
        [...new Set(result.assignments.map((item) => item.storyId))],
        { force: true },
      );
      if (sequence === calendarSequence)
        publish({ calendar: { ...state.calendar, loading: false } });
      return state.calendar.data;
    } catch (error) {
      if (disposed || sequence !== calendarSequence) return;
      publish({
        calendar: { ...state.calendar, loading: false, error: error.message },
      });
      throw error;
    }
  }
  async function loadMembers() {
    const result = await call("/members");
    publish({ members: result.members });
    return result.members;
  }
  async function loadViews() {
    const result = await call("/views");
    publish({ views: result.views });
    return result.views;
  }
  async function loadOperations() {
    const result = await call("/operations");
    publish({ operations: result.operations });
    return result.operations;
  }
  async function refreshProjections() {
    const tasks = [];
    if (state.query.loaded) tasks.push(query(state.query.definition));
    if (state.calendar.parameters)
      tasks.push(loadCalendar(state.calendar.parameters));
    tasks.push(loadOperations());
    const results = await Promise.allSettled(tasks);
    guard();
    const rejected = results.find((result) => result.status === "rejected");
    if (rejected)
      publish({
        error:
          "The change was recorded, but a projection could not refresh. Retry loading before continuing.",
      });
  }
  async function perform(path, payload) {
    guard();
    if (state.mutationPending)
      throw Error("Wait for the current workspace change to finish.");
    const intent = { path, payload: copy(payload) };
    publish({ mutationPending: true, error: "", uncertain: null });
    let recorded = false;
    try {
      const result = await call(path, intent.payload);
      recorded = true;
      const rows =
        result.rows ||
        result.outcomes?.filter((item) => item.row).map((item) => item.row) ||
        [];
      const entities = new Map(state.entities);
      for (const row of rows) applyRow(row, entities);
      querySequence++;
      calendarSequence++;
      publish({ entities, receipt: result, uncertain: null });
      await ensureStories(rows.map((row) => row.id));
      await refreshProjections();
      guard();
      return result;
    } catch (error) {
      if (!disposed) {
        const uncertain = !recorded && (!error.status || error.status >= 500);
        publish({
          error: recorded
            ? "The change was recorded, but its story could not refresh. Reload before editing again."
            : error.message,
          ...(uncertain ? { uncertain: intent } : {}),
        });
      }
      throw error;
    } finally {
      if (!disposed) publish({ mutationPending: false });
    }
  }
  async function mutate(
    changes,
    { idempotencyKey = crypto.randomUUID() } = {},
  ) {
    return perform("/mutations", { idempotencyKey, changes });
  }
  async function undo(
    operationId,
    { idempotencyKey = crypto.randomUUID() } = {},
  ) {
    return perform("/operations/" + encodeURIComponent(operationId) + "/undo", {
      idempotencyKey,
    });
  }
  async function retryOperation() {
    guard();
    if (!state.uncertain) throw Error("No uncertain request to retry.");
    const { path, payload } = state.uncertain;
    return perform(path, payload);
  }
  async function writeView(action, { id, expectedRevision, ...fields }) {
    const path =
      "/views" +
      (id ? "/" + encodeURIComponent(id) : "") +
      (action === "delete" || action === "restore" ? "/" + action : "");
    const view = await call(path, {
      idempotencyKey: crypto.randomUUID(),
      ...(id ? { expectedRevision } : {}),
      ...fields,
    });
    publish({ deletedView: action === "delete" ? view : null });
    await loadViews();
    return view;
  }
  return {
    subscribe: store.subscribe,
    get snapshot() {
      return state;
    },
    scopeKey,
    ingestStories,
    getStory,
    ensureStories,
    query,
    loadCalendar,
    loadMembers,
    loadViews,
    loadOperations,
    mutate,
    undo,
    retryOperation,
    writeView,
    setUi(patch) {
      publish({ ui: { ...state.ui, ...patch } });
    },
    clearError() {
      publish({ error: "" });
    },
    async invalidate() {
      guard();
      await refreshProjections();
    },
    dispose() {
      disposed = true;
      querySequence++;
      calendarSequence++;
    },
  };
}
