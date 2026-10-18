<script>
 let {record={},resources=[],observations=[],evidence=[]}=$props();
 function sourceName(id){return evidence.find(source=>source.id===id)?.title||'Source reference unavailable';}
</script>
{#if record.requirements?.length || resources.length || observations.length}
<details class="evidence-constraints"><summary>Evidence and constraints</summary>
 {#if record.requirements?.length}<h4>Route requirements</h4><ul>{#each record.requirements as requirement,index(index)}<li>{requirement}</li>{/each}</ul>{/if}
 {#if observations.length}<h4>Reported observations</h4>{#each observations as observation(observation.id)}<article><p><strong>{observation.metric}</strong>: {observation.value===null?'Unknown':observation.value} {observation.value===null?'':observation.unit}</p><small>{observation.state||'user-reported'} · Observed {observation.observedAt||'time unknown'}</small><p class="source">{sourceName(observation.evidenceId)}</p></article>{/each}{/if}
 {#each resources as resource(resource.id)}<article><h4>Resource constraints</h4><p>{resource.capabilities?.length?resource.capabilities.join(' · '):'Capabilities unknown'} · {resource.location||'Location unknown'}</p><p><strong>Availability:</strong> {resource.availability?.status||'unknown'}</p>{#if resource.availability?.start||resource.availability?.end}<p>{resource.availability.start||'Start unknown'} → {resource.availability.end||'End unknown'} · {resource.availability.timeZone||'Time zone unknown'}</p>{/if}{#if resource.availability?.notes}<p>{resource.availability.notes}</p>{/if}<p><strong>Rights:</strong> {resource.rights?.status||'unverified'}</p>{#if resource.rights?.notes}<p>{resource.rights.notes}</p>{/if}{#each resource.rights?.evidenceIds||[] as id(id)}<p class="source">Rights reference: {sourceName(id)}</p>{/each}<small>Check current availability and permission for the proposed use before acting.</small></article>{/each}
</details>
{/if}
<style>
.evidence-constraints{margin:12px 0;font-size:13px;line-height:1.5}.evidence-constraints summary{cursor:pointer;font-weight:600}.evidence-constraints h4{margin:10px 0 4px}.evidence-constraints p{margin:4px 0;white-space:pre-wrap;overflow-wrap:anywhere}.evidence-constraints article{padding:6px 0}.evidence-constraints small,.source{color:var(--muted,#69765f)}
</style>
