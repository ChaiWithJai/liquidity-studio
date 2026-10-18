<script>
  let paused = $state(false);
  const label = '♫ Original audio · storyboard, no audio playback';
</script>

<div class="audio">
  <span class="audio-label">{label}</span>
  <div class="audio-window" aria-hidden="true">
    <span class="audio-track" class:paused>{label}<span class="audio-repeat">{label}</span></span>
  </div>
  <button class="audio-motion-toggle" aria-label={paused ? 'Resume audio label scrolling' : 'Pause audio label scrolling'} aria-pressed={paused} onclick={() => (paused = !paused)}>{paused ? 'Scroll label' : 'Pause label'}</button>
</div>

<style>
  .audio { display: flex; align-items: center; gap: 8px; max-width: 100%; }
  .audio-label { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .audio-window { flex: 1; min-width: 0; overflow: hidden; }
  .audio-track { display: inline-block; white-space: nowrap; animation: audio-label-scroll 14s linear infinite; }
  .audio-repeat { padding-left: 32px; }
  .audio-track.paused { animation-play-state: paused; }
  .audio-motion-toggle { flex: none; padding: 4px; color: inherit; background: transparent; border: 1px solid currentColor; border-radius: 4px; font: inherit; }
  @keyframes audio-label-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @media (prefers-reduced-motion: reduce) {
    .audio-track { animation: none; white-space: normal; }
    .audio-repeat, .audio-motion-toggle { display: none; }
  }
</style>
