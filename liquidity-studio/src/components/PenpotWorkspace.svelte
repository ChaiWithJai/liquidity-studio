<script>
  let {design,storyTitle,brandName,formatName,onReturn}=$props();
  let loaded=$state(false);
</script>
<section class="design-workspace" aria-label="Campaign design workspace">
  <header>
    <div><strong>{brandName} · {formatName}</strong><span>{storyTitle}</span></div>
    <nav aria-label="Design workspace actions">
      <button class="secondary" onclick={onReturn}>Return to copy and preview</button>
      <a href={design.frameUrl} target="_blank" rel="noopener noreferrer">Open in separate tab ↗</a>
    </nav>
  </header>
  <details>
    <summary>About this workspace</summary>
    <p>Save and export with the Penpot controls below. The editor shows its own save status; Studio does not yet read that status. Native layout edits do not change the reviewed Studio copy.</p>
    <p>If sign-in or an editor feature cannot open here, use the separate tab, then return to this same saved design.</p>
  </details>
  {#if !loaded}<p role="status">Opening your saved design…</p>{/if}
  <iframe title={`${formatName} design for ${storyTitle}`} src={design.frameUrl} allow="clipboard-read; clipboard-write; fullscreen" allowfullscreen onload={()=>loaded=true}></iframe>
</section>
<style>
  .design-workspace { display:flex; flex-direction:column; gap:8px; min-width:0; }
  header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
  header div { display:grid; gap:2px; min-width:0; }
  header span { font-size:13px; color:var(--muted,#616571); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:55vw; }
  nav { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  a,summary { font-size:13px; }
  details p { max-width:80ch; font-size:13px; margin:8px 0; }
  iframe { width:100%; height:calc(100dvh - 170px); min-height:480px; border:1px solid #ddd; border-radius:8px; background:#18181b; }
  @media(max-width:720px){header{align-items:flex-start;flex-direction:column}header span{max-width:90vw}iframe{height:calc(100dvh - 210px)}}
</style>
