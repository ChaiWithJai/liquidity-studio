<script>
  import ResearchPage from "./defiant/ResearchPage.svelte";
  import ResearchToolbar from "./defiant/ResearchToolbar.svelte";
  import { onDestroy, untrack } from "svelte";
  let { request, scopeKey, onOpenStory = () => {} } = $props();
  let plan = $state(null),
    jobs = $state([]),
    active = $state(null),
    selected = $state([]),
    reviewed = $state(false),
    pending = $state(false),
    error = $state(""),
    notice = $state(""),
    retained = $state(null);
  let newPlanOpen = $state(false);
  let loadSequence = 0,
    detailSequence = 0;
  let epoch = 0,
    closed = false;
  function current(captured) {
    return !closed && captured === epoch;
  }
  async function load() {
    const captured = epoch,
      sequence = ++loadSequence,
      activeId = active?.id,
      detail = detailSequence;
    try {
      const [nextPlan, list] = await Promise.all([
        request("/api/studio/jobs/plan"),
        request("/api/studio/jobs"),
      ]);
      if (!current(captured) || sequence !== loadSequence) return;
      if (
        plan &&
        (plan.brandRevision !== nextPlan.brandRevision ||
          selected.some(
            (id) =>
              plan.stories.find((story) => story.id === id)?.revision !==
              nextPlan.stories.find((story) => story.id === id)?.revision,
          ))
      ) {
        reviewed = false;
        notice =
          "Saved inputs changed. Review the current plan again before queueing.";
      }
      if (!plan) newPlanOpen = list.jobs.length === 0;
      plan = nextPlan;
      jobs = list.jobs;
      if (activeId && active?.id === activeId && detail === detailSequence) {
        const result = await request(`/api/studio/jobs/${activeId}`);
        if (
          current(captured) &&
          sequence === loadSequence &&
          active?.id === activeId &&
          detail === detailSequence
        )
          active = result.job;
      }
    } catch (failure) {
      if (current(captured)&&sequence===loadSequence) error = failure.status===404 ? "Durable jobs are not enabled here. Ask the operator to configure a separate worker, then refresh." : failure.message;
    }
  }
  async function openJob(id) {
    const captured = epoch,
      sequence = ++detailSequence;
    error = "";
    try {
      const result = await request(`/api/studio/jobs/${id}`);
      if (current(captured) && sequence === detailSequence) active = result.job;
    } catch (failure) {
      if (current(captured)&&sequence===detailSequence) error = failure.message;
    }
  }
  function toggle(id, checked) {
    if (retained) return;
    selected = checked
      ? [...selected, id]
      : selected.filter((value) => value !== id);
    reviewed = false;
  }
  async function submit(path, body) {
    const captured = epoch;
    pending = true;
    error = "";
    retained = { path, body };
    try {
      const result = await request(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!current(captured)) return;
      detailSequence++;
      active = result.job;
      newPlanOpen = false;
      retained = null;
      notice =
        result.dispatchError ||
        "Saved durable job state. You can leave and return to this job ID.";
      selected = [];
      reviewed = false;
      await load();
    } catch (failure) {
      if (current(captured)) {
        error = failure.message;
        if (failure.status && failure.status < 500) retained = null;
      }
    } finally {
      if (current(captured)) pending = false;
    }
  }
  function queue() {
    if (!plan || !reviewed || !selected.length) return;
    void submit("/api/studio/jobs", {
      idempotencyKey: crypto.randomUUID(),
      reviewed: true,
      brandRevision: plan.brandRevision,
      items: selected.map((id) => {
        const story = plan.stories.find((story) => story.id === id);
        return { storyId: id, storyRevision: story.revision };
      }),
    });
  }
  function control(action, itemIds) {
    void submit(`/api/studio/jobs/${active.id}/${action}`, {
      idempotencyKey: crypto.randomUUID(),
      ...(itemIds ? { itemIds } : {}),
    });
  }
  // Scope/session-owned async projections reset only when their owner changes.
  // Reads inside load() must not become effect dependencies and erase active jobs.
  $effect(() => {
    scopeKey;
    request;
    untrack(()=>{
    epoch++;
    plan = null;
    newPlanOpen = false;
    jobs = [];
    active = null;
    selected = [];
    reviewed = false;
    pending = false;
    error = "";
    notice = "";
    retained = null;
    void load();
    });
    const timer = setInterval(() => {
      if (!pending && document.visibilityState === "visible" && jobs.some(job=>["queued","running"].includes(job.state))) void load();
    }, 3000);
    return () => clearInterval(timer);
  });
  onDestroy(() => {
    closed = true;
    epoch++;
  });
</script>
<section class="jobs-pane" aria-label="Durable operator jobs">
  <ResearchPage label="Campaign jobs workspace"><ResearchToolbar label="Campaign jobs actions"><div class="jobs-heading"><h2>Campaign generation</h2><p>Track saved jobs or review a new plan.</p></div><button onclick={load} disabled={pending}>Refresh jobs</button></ResearchToolbar><div class="jobs-content">
  {#if error}<p role="alert">{error}</p>{/if}
  {#if notice}<p role="status">{notice}</p>{/if}
  {#if retained && pending}<p role="status">Saving job request…</p>
  {:else if retained}<aside role="alert">The response may have been lost. Retry the same request before changing this plan. <button disabled={pending} onclick={()=>submit(retained.path,retained.body)}>Retry same job request</button></aside>{/if}
  {#if !plan}{#if error}<p>Job configuration is unavailable. Refresh after the operator resolves it.</p>{:else}<p role="status">Loading campaign prerequisites…</p>{/if}
  {/if}
  {#if plan || active || jobs.length}<div class="jobs-layout"><section class="job-history" aria-label="Job history"><h3>Job history</h3>{#if !jobs.length}<p>No jobs yet. Review a new plan to get started.</p>{:else}<ul>{#each jobs as job (job.id)}<li><button class:job-selected={active?.id===job.id} aria-pressed={active?.id===job.id} data-job-id={job.id} disabled={pending} onclick={()=>openJob(job.id)}>{job.itemCount} campaigns · {job.state} · {new Date(job.createdAt).toLocaleString()}</button></li>{/each}</ul>{/if}</section><div class="job-workspace">  {#if active}<section class="job-detail" aria-label="Job details"><h3>Job details</h3><details><summary>Job identity</summary><p>Job {active.id} · Requested by {active.requestedBy || "a workspace member"}</p></details><p>State: {active.state} · saved {active.updatedAt}</p><details class="job-implementation"><summary>Delivery details · {active.outbox.state}</summary><p>{active.outbox.state==='pending'?'A separate worker must pick up this persisted plan. Refreshing the page does not execute it.':'Delivery state recorded by the worker.'}</p></details>
    {#if active.accountingWarning}<p role="alert">{active.accountingWarning}</p>{/if}
    <button disabled={active.canControl===false||pending||!!retained||active.state==='completed'||active.state==='cancelled'} onclick={()=>control('cancel')}>Cancel unfinished items</button>
    {#if active.items.some(item=>['cancelled','paused'].includes(item.state))}<button disabled={active.canControl===false||pending||!!retained} onclick={()=>control('resume')}>Resume paused or cancelled items</button>{/if}
    <ol>{#each active.items as item (item.id)}<li><p><strong>{item.storyTitle || item.storyId}</strong> · {item.state} · attempt {item.attempt} · reviewed revision {item.storyRevision}</p><details><summary>Item identity</summary><p>{item.id}</p></details>
      {#if item.error}<p role="alert">{item.error.code}: {item.error.message}</p>{/if}
      {#if item.receipt}<p>Committed revision {item.receipt.storyRevision} · generation {item.receipt.generationId} · {item.receipt.mode}</p><p>Provider reported usage{item.receipt.usageProvider?` (${item.receipt.usageProvider})`:""}: {item.receipt.usage?JSON.stringify(item.receipt.usage):'not reported'}</p><button onclick={()=>onOpenStory(item.storyId)}>Open saved campaign</button>{/if}
      {#if item.attempts.some(attempt=>attempt.providerOutcome)}<details><summary>Attempt usage history</summary><ul>{#each item.attempts.filter(attempt=>attempt.providerOutcome) as attempt (attempt.id)}<li>{attempt.state} · output mode {attempt.providerOutcome.mode} · {attempt.providerOutcome.committed?'committed':'not committed'} · reported usage {attempt.providerOutcome.usage?JSON.stringify(attempt.providerOutcome.usage):'unknown or not reported'}</li>{/each}</ul></details>{/if}
      {#if ['failed','unknown','conflict'].includes(item.state)}<button disabled={active.canControl===false||pending||!!retained} onclick={()=>control('retry',[item.id])}>Retry this item with reviewed inputs</button><p>Changed input revisions require a new reviewed plan. An unknown provider attempt may be billed again.</p>{/if}
    </li>{/each}</ol>
  </section>{:else}<section class="job-detail job-empty" aria-label="Job selection"><h3>{jobs.length ? "Select a saved job" : "No saved jobs yet"}</h3><p>{jobs.length ? "Choose a job from history to see its progress, results and available actions." : "Review a new campaign plan below. Queueing requires saved source review and configured delivery."}</p></section>{/if}
  {#if plan}    <details class="new-plan" bind:open={newPlanOpen}><summary>Review a new campaign plan</summary><section aria-label="Reviewed job plan"><h3>Plan · up to {plan.maxItems} campaigns</h3><p class="dispatcher-state" role="status">{plan.dispatcher.configured ? "Delivery ready" : "Delivery unavailable"}</p><details class="job-implementation"><summary>Delivery configuration</summary><p>{plan.dispatcher.message}</p></details><p>Each campaign produces four formats. Sources, access and limits are rechecked before generation. Retrying an interrupted provider call may incur another charge.</p>
      <fieldset disabled={pending||!!retained}><legend>Select saved source-backed stories</legend>
        {#each plan.stories as story (story.id)}<label class="plan-story"><input type="checkbox" aria-label={`Plan ${story.title}`} checked={selected.includes(story.id)} disabled={story.sourceReadiness!=='approved'||(!selected.includes(story.id)&&selected.length>=plan.maxItems)} onchange={event=>toggle(story.id,event.currentTarget.checked)}/><span>{story.title} · revision {story.revision} · {story.sourceReadiness==='approved'?'sources approved':'source review required'}</span></label>{/each}
        {#if !plan.stories.length}<p>No stories in this brand. Add a story and review its sources first.</p>{/if}
        <label class="review-confirmation"><input type="checkbox" bind:checked={reviewed}/>I reviewed these {selected.length} campaigns and their saved input revisions.</label>
      </fieldset><button disabled={pending||!!retained||!reviewed||!selected.length||!plan.dispatcher.configured} onclick={queue}>Queue reviewed plan</button>
    </section>
    </details>{/if}</div></div>{/if}
  </div></ResearchPage>
</section>
<style>
.jobs-pane{container-type:inline-size;min-width:0}
.jobs-heading{flex:1;min-width:200px}.jobs-heading h2{margin:0;font-size:18px}.jobs-heading p{margin:4px 0 0;font-size:12px;color:var(--research-muted)}
.jobs-content{padding:16px}.jobs-content>p,.jobs-content>aside{margin:0 0 12px;font-size:13px}
.jobs-layout{display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);gap:16px;align-items:start}.job-workspace{min-width:0;display:grid;gap:16px}
.job-history,.job-detail,.new-plan{min-width:0;border:1px solid var(--research-line);border-radius:8px;background:var(--research-surface);padding:14px}
.job-history ul,.job-detail ol{list-style:none;margin:12px 0 0;padding:0}.job-history li{margin:0 0 6px}.job-history button{width:100%;text-align:left;justify-content:flex-start;white-space:normal}.job-history button.job-selected{background:var(--research-selected);border-color:var(--research-accent)}
.job-detail li{padding:12px 0;border-top:1px solid var(--research-line);overflow-wrap:anywhere}.job-detail p,.new-plan p,.job-history p{font-size:13px;overflow-wrap:anywhere}.job-detail button{margin:4px 4px 4px 0}.job-implementation{margin:10px 0}.job-implementation p{color:var(--research-muted)}
.new-plan>summary{padding:2px 0}.new-plan>section{padding-top:14px}.dispatcher-state{font-weight:600}
fieldset{display:grid;gap:12px;margin:12px 0;padding:12px;border:1px solid var(--research-line);min-width:0}
.plan-story,.review-confirmation{display:flex;flex-direction:row;gap:10px;align-items:start;font-size:13px;font-weight:400}.jobs-pane input[type="checkbox"]{min-width:20px;min-height:20px;flex:none}
[role="alert"]{border-left:3px solid var(--accent,#e85d04);padding:8px 12px;background:var(--research-surface)}
@container(max-width:740px){.jobs-layout{grid-template-columns:minmax(0,1fr)}.jobs-content{padding:12px}.job-history ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px}.job-history li{margin:0}}
</style>
