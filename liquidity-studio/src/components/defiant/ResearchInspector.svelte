<script>
 let {label,selected=false,children}=$props();
</script>
<aside class="research-inspector" class:has-selection={selected} aria-label={label}>{@render children?.()}</aside>
<style>.research-inspector{min-width:0;padding:var(--research-space,16px);background:var(--research-surface,#fff);overflow-wrap:anywhere}.research-inspector :global(.inspector-heading){margin-bottom:12px}.research-inspector :global(.inspector-actions){display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.research-inspector :global(.inspector-section){border-top:1px solid var(--research-line,#dedfd5);margin-top:16px;padding-top:14px}.research-inspector :global(.inspector-section summary){margin-bottom:8px}.research-inspector :global(.inspector-fields){display:grid;gap:12px}</style>
