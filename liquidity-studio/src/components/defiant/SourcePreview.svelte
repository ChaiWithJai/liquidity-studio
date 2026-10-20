<script>
 let {source}=$props();
 let loaded=$state(false);
 const validId=$derived(typeof source?.videoId==='string'&&/^[A-Za-z0-9_-]{11}$/.test(source.videoId)?source.videoId:'');
</script>
<div class="source-preview" aria-label="Source video preview">
 {#if loaded&&validId}<iframe title={`YouTube source: ${source.title}`} src={`https://www.youtube-nocookie.com/embed/${validId}`} allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>{:else}<div class="preview-start"><span aria-hidden="true">▶</span><strong>Watch the selected source</strong>{#if validId}<button onclick={()=>loaded=true}>Load YouTube preview</button>{:else}<p>Preview unavailable for this reference.</p>{/if}<small>Loads YouTube only when requested.</small></div>{/if}
 <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">Open source on YouTube ↗</a>
</div>
<style>.source-preview{margin:12px 0}.source-preview iframe,.preview-start{display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:8px;background:#17221c;color:#f5f5ef}.preview-start{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;text-align:center}.preview-start>span{font-size:24px;color:#d9ef83}.preview-start small{font-size:11px;color:#c6d0c8}.source-preview>a{display:inline-block;font-size:12px;margin-top:7px}</style>
