<script>
  import { onMount, tick } from "svelte";
  import { renderSvg } from "../server/artwork.js";
  import { computePreflight } from "../server/preflight.js";

  let {
    campaign,
    brandProfile,
    format = "infographic",
    backlog = [],
    onpreflight = () => {},
  } = $props();
  let mode = $state("instagram");
  let zoom = $state(85);
  let phoneWidth = $state(402);
  let safeZones = $state(false);
  let captionRuler = $state(true);
  let captionThreshold = $state(125);
  let slide = $state(0);
  let liked = $state(false);
  let saved = $state(false);
  let expanded = $state(false);
  let comment = $state("");
  let comments = $state([]);
  let commentsOpen = $state(false);
  let notice = $state("");
  let poll = $state(null);
  let storyFrame = $state(0);
  let storyTime = $state(0);
  let storyPlaying = $state(false);
  let reelTime = $state(0);
  let reelPlaying = $state(false);
  let following = $state(false);
  let pointerStart = 0;
  let artworkElement = $state();
  let evidence = $state(null);
  // Only the canonical renderer's XML-escaped, fixed SVG markup reaches @html.
  // Never pass user HTML or provider-supplied markup through this boundary.
  function artwork(props) {
    try {
      return renderSvg(props);
    } catch {
      return '<div class="artwork-error">Artwork exceeds its layout. Shorten the copy and save before export.</div>';
    }
  }
  let artifactHtml = $derived(
    artwork({ campaign, brandProfile, format, slideIndex: slide }),
  );
  let handle = $derived(
    (brandProfile?.handle || brandProfile?.brandName || "studio")
      .replace(/[^a-zA-Z0-9_.]/g, "")
      .toLowerCase(),
  );
  let caption = $derived(
    campaign?.infographic?.caption || campaign?.story?.hookBanner || "",
  );
  let beat = $derived(Math.min(2, Math.floor(reelTime / 10)));
  let reelBeats = $derived(campaign?.reel?.beats || []);
  let carouselSlides = $derived(campaign?.carousel?.slides || []);
  let gridItems = $derived([
    { id: "active", campaignDraft: campaign, title: "Active campaign" },
    ...backlog
      .filter((s) => s.campaignDraft && s.campaignDraft !== campaign)
      .slice(0, 8),
  ]);

  $effect(() => {
    JSON.stringify(campaign);
    format;
    mode;
    phoneWidth;
    zoom;
    slide;
    captionThreshold;
    const timer = setTimeout(() => {
      measure();
    }, 160);
    return () => clearTimeout(timer);
  });
  onMount(() => {
    if (window.innerWidth < 700) zoom = 75;
    const timer = setInterval(() => {
      if (reelPlaying) {
        reelTime = Math.min(30, reelTime + 0.25);
        if (reelTime >= 30) reelPlaying = false;
      }
      if (storyPlaying) {
        storyTime += 0.25;
        if (storyTime >= 5) {
          storyTime = 0;
          storyFrame = (storyFrame + 1) % 4;
        }
      }
    }, 250);
    return () => clearInterval(timer);
  });
  function navigate(direction) {
    if (format === "carousel")
      slide = Math.max(
        0,
        Math.min(carouselSlides.length - 1, slide + direction),
      );
    if (format === "story") {
      storyFrame = (storyFrame + direction + 4) % 4;
      storyTime = 0;
    }
  }
  function onKey(event) {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)) return;
    if (event.key === "ArrowRight") navigate(1);
    if (event.key === "ArrowLeft") navigate(-1);
  }
  function rgbToHex(value) {
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    const values = value.match(/[\d.]+/g);
    return values?.length >= 3
      ? "#" +
          values
            .slice(0, 3)
            .map((c) => Math.round(Number(c)).toString(16).padStart(2, "0"))
            .join("")
      : null;
  }
  async function measure() {
    await tick();
    if (!artworkElement || mode === "grid") {
      evidence = null;
      return;
    }
    const rect = artworkElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const texts = [
      ...artworkElement.querySelectorAll("svg [data-preflight-text]"),
    ];
    const background = rgbToHex(
      artworkElement.querySelector("svg rect")?.getAttribute("fill") ||
        "#141513",
    );
    const textBoxes = texts.map((node) => {
      const box = node.getBoundingClientRect();
      return {
        x: box.x - rect.x,
        y: box.y - rect.y,
        width: box.width,
        height: box.height,
        foreground: rgbToHex(getComputedStyle(node).fill),
      };
    });
    const stage = artworkElement.parentElement;
    const obstructionBoxes =
      mode === "instagram"
        ? [
            ...stage.querySelectorAll(
              ".poll-sticker,.reel-rail,.reel-meta,.story-chrome,.story-reply",
            ),
          ].map((node) => {
            const box = node.getBoundingClientRect();
            return {
              x: box.x - rect.x,
              y: box.y - rect.y,
              width: box.width,
              height: box.height,
            };
          })
        : [];
    const payload = {
      format,
      obstructionBoxes,
      canvas: { width: rect.width, height: rect.height },
      textBoxes,
      background,
      caption,
      captionLimit: Number(captionThreshold),
    };
    const result = computePreflight(payload);
    evidence = result.metrics;
    onpreflight(payload);
  }

  function addComment() {
    if (!comment.trim()) return;
    comments = [...comments, comment.trim()];
    comment = "";
  }
  async function share() {
    notice = "Local share preview opened. Nothing was published.";
  }
</script>

<svelte:window onkeydown={onKey} />
<section class="emulator" aria-label="Instagram preview simulator">
  <div class="preview-heading">
    <div>
      <span class="eyebrow">PREVIEW LAB</span>
      <h3>See it in context.</h3>
    </div>
    <span class="simulation">Local simulation</span>
  </div>
  <div class="segmented" aria-label="Preview mode">
    <button class:active={mode === "design"} onclick={() => (mode = "design")}
      >Design Mode</button
    >
    <button
      class:active={mode === "instagram"}
      onclick={() => (mode = "instagram")}>In-Situ Instagram</button
    >
    <button class:active={mode === "grid"} onclick={() => (mode = "grid")}
      >3×3 Profile Grid</button
    >
  </div>
  <div class="preview-controls">
    <label
      >Phone width <select bind:value={phoneWidth}
        ><option value={375}>375 px</option><option value={390}
          >390 px · generic</option
        ><option value={402}>402 px · iPhone 16 Pro</option><option value={430}
          >430 px</option
        ></select
      ></label
    >
    <label
      >Zoom <input
        aria-label="Preview zoom"
        type="range"
        min="55"
        max="125"
        step="5"
        bind:value={zoom}
      /><output>{zoom}%</output></label
    >
    <label><input type="checkbox" bind:checked={safeZones} />Safe zones</label>
    <label
      ><input type="checkbox" bind:checked={captionRuler} />Caption ruler</label
    >
  </div>
  <p class="muted small">
    Approximate Instagram chrome. Local interactions only. Validate final assets
    in Instagram before publishing.
  </p>
  <div class="phone-well">
    <div
      class:raw={mode === "design"}
      class="phone"
      aria-label="Simulated phone viewport"
      style:width="{phoneWidth}px"
      style:height={mode === "design"
        ? "auto"
        : `${Math.round((phoneWidth * 874) / 402)}px`}
      style:zoom={zoom / 100}
    >
      {#if mode !== "design"}<div class="statusbar">
          <span>9:41</span><span class="island"></span><span>▴ ▰ ▮</span>
        </div>{/if}
      {#if mode === "grid"}
        <div class="profile-header">
          <b>{handle}</b><button
            aria-label="Profile options"
            onclick={() => (notice = "Profile options are a local simulation.")}
            >☰</button
          >
        </div>
        <div class="profile-summary">
          <span class="avatar large"
            >{brandProfile?.logoText?.slice(0, 2) || handle.slice(0, 2)}</span
          ><span
            ><b>{backlog.filter((s) => s.campaignDraft).length}</b> drafts</span
          ><span>Private<br />preview</span>
        </div>
        <div class="profile-bio">
          <b>{brandProfile?.brandName}</b>
          <p>{brandProfile?.tagline}</p>
          <small>Draft grid · empty cells are unscheduled space</small>
        </div>
        <div class="profile-grid">
          {#each Array(9) as _, i (i)}<div
              class="grid-cell"
              class:current={i === 0}
            >
              {#if gridItems[i]}{@html artwork({
                  campaign: gridItems[i].campaignDraft,
                  brandProfile,
                  format: "infographic",
                })}<span>{i === 0 ? "Active" : "Saved"}</span>{:else}<span
                  class="empty-cell">No saved post</span
                >{/if}
            </div>{/each}
        </div>
      {:else}
        {#if mode === "instagram" && !["story", "reel"].includes(format)}<header
            class="ig-header"
          >
            <span class="avatar">{handle.slice(0, 2)}</span>
            <div><b>{handle}</b><small>Editorial draft</small></div>
            <button
              aria-label="Post options"
              onclick={() =>
                (notice = "Post menu preview. Export to save an actual file.")}
              >•••</button
            >
          </header>{/if}
        <div
          class="asset-stage"
          class:vertical={["story", "reel"].includes(format)}
          role="group"
          aria-label="Artwork preview"
          onpointerdown={(e) => (pointerStart = e.clientX)}
          onpointerup={(e) => {
            if (Math.abs(e.clientX - pointerStart) > 40)
              navigate(e.clientX < pointerStart ? 1 : -1);
          }}
          ondblclick={() => {
            liked = true;
            notice = "Liked in this simulation";
          }}
        >
          <div class="artwork" bind:this={artworkElement}>
            {@html artifactHtml}
          </div>
          {#if mode === "instagram" && format === "carousel"}<span
              class="slide-count">{slide + 1}/{carouselSlides.length}</span
            ><button
              class="previous"
              aria-label="Previous slide"
              disabled={slide === 0}
              onclick={() => navigate(-1)}>‹</button
            ><button
              class="next"
              aria-label="Next slide"
              disabled={slide === carouselSlides.length - 1}
              onclick={() => navigate(1)}>›</button
            >{/if}
          {#if mode === "instagram" && format === "story"}
            <div class="story-chrome">
              <div class="timer-bars">
                {#each [0, 1, 2, 3] as n (n)}<span
                    ><i
                      style:width="{n < storyFrame
                        ? 100
                        : n === storyFrame
                          ? storyTime * 20
                          : 0}%"
                    ></i></span
                  >{/each}
              </div>
              <div class="story-header">
                <span class="avatar">{handle.slice(0, 2)}</span><b>{handle}</b
                ><span>Draft</span><button
                  aria-label={storyPlaying ? "Pause story" : "Play story"}
                  onclick={() => (storyPlaying = !storyPlaying)}
                  >{storyPlaying ? "Ⅱ" : "▶"}</button
                ><button
                  aria-label="Close story preview"
                  onclick={() => (mode = "design")}>×</button
                >
              </div>
            </div>
            <div class="poll-sticker">
              <b>{campaign?.story?.interactiveStickerPrompt}</b>
              <div>
                <button class:voted={poll === "A"} onclick={() => (poll = "A")}
                  >Investigate {poll
                    ? poll === "A"
                      ? "✓ 100%"
                      : "0%"
                    : ""}</button
                ><button class:voted={poll === "B"} onclick={() => (poll = "B")}
                  >Read sources {poll
                    ? poll === "B"
                      ? "✓ 100%"
                      : "0%"
                    : ""}</button
                >
              </div>
              <small
                >{poll
                  ? "Your one local vote · simulated result"
                  : "Try a local poll vote"}</small
              >
            </div>
            <div class="story-reply">
              <input
                aria-label="Story reply preview"
                placeholder="Send message…"
              /><button
                aria-label="Like story"
                aria-pressed={liked}
                onclick={() => (liked = !liked)}>{liked ? "♥" : "♡"}</button
              ><button aria-label="Share story preview" onclick={share}
                >➤</button
              >
            </div>
          {/if}
          {#if mode === "instagram" && format === "reel"}
            <div class="reel-top">
              <b>Reels</b><span>Storyboard simulation</span>
            </div>
            <div class="beat-text" data-testid="active-beat">
              <small>BEAT {beat + 1} · {reelBeats[beat]?.timecode || ""}</small
              ><strong
                >{reelBeats[beat]?.onScreenText ||
                  reelBeats[beat]?.voiceover}</strong
              >
            </div>
            <div class="reel-rail">
              <button
                aria-label="Like reel"
                aria-pressed={liked}
                onclick={() => (liked = !liked)}
                >{liked ? "♥" : "♡"}<small>{liked ? 1 : 0}</small></button
              ><button
                aria-label="Comment on reel"
                onclick={() => (commentsOpen = !commentsOpen)}
                >♧<small>{comments.length}</small></button
              ><button aria-label="Share reel preview" onclick={share}>➤</button
              ><button
                aria-label="Reel options"
                onclick={() =>
                  (notice = "Reel options preview; nothing is published.")}
                >•••</button
              ><span class:spinning={reelPlaying} class="vinyl">♫</span>
            </div>
            <div class="reel-meta">
              <b>{handle}</b><button
                aria-pressed={following}
                onclick={() => (following = !following)}
                >{following ? "Following" : "+ Follow"}</button
              >
              <p>
                {caption.slice(0, captionThreshold)}{caption.length >
                captionThreshold
                  ? "…"
                  : ""}
              </p>
              <div class="audio">
                ♫ Original audio · storyboard, no audio playback
              </div>
            </div>
          {/if}
          {#if safeZones && ["story", "reel"].includes(format)}<div
              class="safe-mask"
              aria-label="Simulated safe-zone overlay"
            >
              <div class="danger top">Top 14% · chrome risk</div>
              <div class="danger bottom">Bottom 18% · caption / reply risk</div>
              {#if format === "reel"}<div class="danger right">18%</div>{/if}
              <div class="clear-zone">Inspect text clearance</div>
            </div>{/if}
          {#if liked && notice.includes("Liked")}<span class="floating-heart"
              >♥</span
            >{/if}
        </div>
        {#if format === "reel"}<div class="reel-controls">
            <button onclick={() => (reelPlaying = !reelPlaying)}
              >{reelPlaying ? "Pause reel" : "Play reel"}</button
            ><input
              aria-label="Reel scrubber"
              type="range"
              min="0"
              max="30"
              step=".25"
              bind:value={reelTime}
            /><output>{Math.floor(reelTime)} / 30s</output>
          </div>{/if}
        {#if mode === "instagram" && !["story", "reel"].includes(format)}
          <div class="engagement">
            <button
              aria-label="Like post"
              aria-pressed={liked}
              onclick={() => (liked = !liked)}>{liked ? "♥" : "♡"}</button
            ><button
              aria-label="Comment on post"
              onclick={() => (commentsOpen = !commentsOpen)}>♧</button
            ><button aria-label="Share post preview" onclick={share}>➤</button
            >{#if format === "carousel"}<div class="dots">
                {#each carouselSlides as _, i (i)}<button
                    aria-label="Go to slide {i + 1}"
                    class:active={slide === i}
                    onclick={() => (slide = i)}>●</button
                  >{/each}
              </div>{/if}<button
              class="bookmark"
              aria-label="Save post locally"
              aria-pressed={saved}
              onclick={() => (saved = !saved)}>{saved ? "▣" : "♧"}</button
            >
          </div>
          <p class="local-count">
            {liked ? 1 : 0} local likes · {saved
              ? "Saved in preview"
              : "Preview only"}
          </p>
          <div class="caption">
            <b>{handle}</b>
            {expanded
              ? caption
              : caption.slice(
                  0,
                  captionThreshold,
                )}{#if caption.length > captionThreshold}<button
                onclick={() => (expanded = !expanded)}
                >{expanded ? "less" : "… more"}</button
              >{/if}<small>LOCAL DRAFT · NO INSTAGRAM CONNECTION</small>
          </div>
        {/if}
        {#if captionRuler}<div class="fold-ruler">
            <label
              >Approximate fold <input
                aria-label="Caption fold threshold"
                type="number"
                min="40"
                max="500"
                bind:value={captionThreshold}
              /> characters</label
            >
            <p>
              <mark>{caption.slice(0, captionThreshold)}</mark><span
                class="fold-line">│</span
              >{caption.slice(captionThreshold)}
            </p>
            <small
              >Configurable simulation. Actual truncation varies by app, device
              and layout.</small
            >
          </div>{/if}
      {/if}
      {#if commentsOpen}<div class="comment-panel">
          <b>Local comments</b>{#each comments as text, i (i)}<p>
              {text}
            </p>{/each}
          <form
            onsubmit={(e) => {
              e.preventDefault();
              addComment();
            }}
          >
            <input
              aria-label="Local comment"
              bind:value={comment}
              placeholder="Write a preview comment"
            /><button>Add</button>
          </form>
        </div>{/if}
      {#if notice}<p class="local-notice" role="status">{notice}</p>{/if}
    </div>
  </div>
  <div class="evidence">
    <div class="evidence-title">
      <b>Measured preflight</b><button onclick={measure}>Measure again</button>
    </div>
    {#if evidence}<div class="measurements">
        <span
          ><b>{evidence.occludedElementsCount}</b> text boxes in chrome zones</span
        ><span
          ><b>{evidence.overflowElementsCount}</b> text boxes outside artwork</span
        ><span
          ><b
            >{evidence.contrastRatio ?? "Unmeasured"}{evidence.contrastRatio !==
            null
              ? ":1"
              : ""}</b
          >
          minimum text/background contrast{evidence.unmeasuredColorCount
            ? ` · ${evidence.unmeasuredColorCount} unmeasured`
            : ""}</span
        ><span
          ><b>{evidence.expectedAspectRatio}</b> target ratio · {evidence.aspectRatioDeviation <=
          0.01
            ? "matched"
            : "check dimensions"}</span
        ><span
          ><b>{evidence.firstLookCharacters}</b> caption characters before simulated
          fold</span
        >
      </div>
      <p class="small muted">
        Measured SVG text boxes and fill contrast against the base background;
        images, glyph shapes and all native app variations are not covered.
        Review required. No confidence score is inferred.
      </p>{:else}<p class="small muted">
        Open a design or Instagram surface to measure the rendered SVG.
      </p>{/if}
  </div>
</section>
