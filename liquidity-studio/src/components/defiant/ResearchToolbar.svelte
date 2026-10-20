<script>
 let {label,children}=$props();
</script>
<div class="research-toolbar" role="group" aria-label={label}>{@render children?.()}</div>
<style>.research-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:10px var(--research-space,16px);border-bottom:1px solid var(--research-line,#dedfd5);min-width:0;background:var(--research-surface,#fff)}.research-toolbar :global(label){min-width:130px}.research-toolbar :global(.toolbar-grow){flex:1;min-width:190px}.research-toolbar :global(details){margin:0}.research-toolbar :global(summary){padding:8px 4px}.research-toolbar :global(.toolbar-panel){padding:12px 0;display:flex;gap:12px;flex-wrap:wrap;align-items:end}.research-toolbar :global(.toolbar-panel label){flex:1;min-width:140px}@media(max-width:700px){.research-toolbar{gap:8px}}</style>
