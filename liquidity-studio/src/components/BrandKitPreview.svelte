<script>
  let { profile } = $props();
  const families = ["Mona Sans", "Inter", "Instrument Serif", "DejaVu Sans"];
  const font = value => families.includes(value) ? value : "DejaVu Sans";
  const hex = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
  let colors = $derived(profile.colors || []);
  let ink = $derived(hex(colors.at(-1)?.hex, "#202620"));
  let paper = $derived(hex(colors[0]?.hex, "#f4f5ef"));
  let heading = $derived(font(profile.fonts?.heading));
  let body = $derived(font(profile.fonts?.body));
</script>

<aside class="brand-preview" aria-label="Brand Kit live preview">
  <header><h2>Style preview</h2><p>Current form values</p></header>
  <div class="brand-specimen" style:background={paper} style:color={ink}>
    <div class="specimen-wordmark" style:font-family={`"${heading}", "Noto Sans Devanagari", sans-serif`} style:font-weight={heading === "Instrument Serif" ? 400 : 700}>{profile.logoText || "Wordmark"}</div>
    <div class="specimen-name" style:font-family={`"${heading}", "Noto Sans Devanagari", sans-serif`} style:font-weight={heading === "Instrument Serif" ? 400 : 700}>{profile.brandName || "Your brand name"}</div>
    <p class="specimen-tagline" style:font-family={`"${body}", "Noto Sans Devanagari", sans-serif`}>{profile.tagline || "Your tagline"}</p>
    {#if profile.mission}<p class="specimen-mission" style:font-family={`"${body}", "Noto Sans Devanagari", sans-serif`}>{profile.mission}</p>{/if}
  </div>
  <dl><div><dt>Heading</dt><dd>{heading}</dd></div><div><dt>Body</dt><dd>{body}</dd></div></dl>
  {#if colors.length}<ul aria-label="Preview palette">{#each colors as color (color.name)}<li><span class="swatch" style:background={hex(color.hex,"#ffffff")} aria-hidden="true"></span><span>{color.name}<small>{color.hex}</small></span></li>{/each}</ul>{/if}
  <p class="preview-boundary">Brand Kit preview only. Existing campaign artwork and native designs are separate.</p>
</aside>

<style>
  .brand-preview {min-width:0;border:1px solid var(--line,#dedfd5);border-radius:10px;background:white;padding:16px;color:var(--ink,#19251c);font:13px/1.5 "Inter",sans-serif;}
  header h2 {margin:0;font:600 16px/1.35 "Inter",sans-serif;}
  header p {margin:4px 0 14px;font-size:12px;color:#59665d;}
  .brand-specimen {padding:20px 16px;border:1px solid #0002;border-radius:6px;overflow-wrap:anywhere;}
  .specimen-wordmark {font-size:14px;font-weight:700;line-height:1.4;margin-bottom:22px;white-space:pre-wrap;}
  .specimen-name {font-size:28px;font-weight:700;line-height:1.15;letter-spacing:-.5px;}
  .specimen-tagline {font-size:15px;line-height:1.5;margin:14px 0 0;}
  .specimen-mission {font-size:12px;line-height:1.5;margin:18px 0 0;}
  dl {margin:14px 0;display:grid;gap:6px;}
  dl div {display:flex;justify-content:space-between;gap:12px;}
  dt {color:#59665d;}dd {margin:0;text-align:right;}
  ul {list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
  li {display:flex;align-items:center;gap:7px;min-width:0;overflow-wrap:anywhere;}
  .swatch {display:block;width:24px;height:32px;flex:0 0 24px;border:1px solid #0003;border-radius:4px;}
  small {display:block;font-size:10px;color:#59665d;}
  .preview-boundary {font-size:11px;color:#59665d;margin:16px 0 0;}
</style>
