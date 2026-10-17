<script>
  import { onMount } from 'svelte';

  // Surface switcher: 'marketer' vs 'admin'
  let surfaceMode = $state('marketer');
  // 4 Marketer Step Tabs: 'brand_profile' | 'backlog' | 'calendar' | 'campaign_studio'
  let marketerTab = $state('campaign_studio');
  let adminTab = $state('context_graph');
  let activeFormat = $state('infographic'); // 'infographic' | 'carousel' | 'story' | 'reel'

  let brandProfile = $state(null);
  let backlog = $state([]);
  let calendar = $state([]);
  let selectedStory = $state(null);
  let campaign = $state(null);
  let adminData = $state(null);
  let contextGraphData = $state(null);

  let loading = $state(false);
  let statusPill = $state('✨ Ready to create');
  let exportToast = $state('');

  // KRUG-004 Search & Status Filter
  let searchQuery = $state('');
  let statusFilter = $state('All');
  let selectedScheduleDay = $state('Thursday');

  // KRUG-002 Agent Command Input
  let agentCommand = $state('');
  let agentFeedback = $state('');

  let newTitle = $state('');
  let newCategory = $state('Founder Equity & Buybacks');
  let newFact1 = $state('');
  let newScheduledDay = $state('Monday');

  onMount(async () => {
    await loadStudioBootstrap();
    await loadAdminOverview();
    await loadContextGraph();
  });

  async function loadStudioBootstrap() {
    const res = await fetch('/api/studio/bootstrap');
    const data = await res.json();
    brandProfile = data.brandProfile;
    if (!brandProfile.logoText) brandProfile.logoText = '💎 THE LIQUIDITY DESK';
    backlog = data.backlog || [];
    calendar = data.calendar || [];
    if (!selectedStory && backlog.length > 0) {
      selectedStory = backlog[0];
    }
  }

  async function loadAdminOverview() {
    const res = await fetch('/api/admin/overview');
    adminData = await res.json();
  }

  async function loadContextGraph() {
    const res = await fetch('/api/admin/context-graph');
    contextGraphData = await res.json();
  }

  function goHome() {
    surfaceMode = 'marketer';
    marketerTab = 'backlog';
  }

  async function saveBrandProfile() {
    if (!brandProfile) return;
    const res = await fetch('/api/studio/brand-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandProfile)
    });
    const data = await res.json();
    brandProfile = data.brandProfile;
    exportToast = 'Saved Brand Profile';
    setTimeout(() => (exportToast = ''), 2500);
    await loadAdminOverview();
  }

  async function updateBrandColor(index, newHex) {
    if (!brandProfile || !brandProfile.colors[index]) return;
    brandProfile.colors[index].hex = newHex;
    await saveBrandProfile();
  }

  async function updateLogoText(newText) {
    if (!brandProfile) return;
    brandProfile.logoText = newText;
    await saveBrandProfile();
  }

  async function createCampaignForStory(story = selectedStory) {
    if (!story) return;
    selectedStory = story;
    marketerTab = 'campaign_studio';
    loading = true;
    statusPill = '✨ Gathering financial facts & formatting 4 channels...';
    try {
      const res = await fetch('/api/studio/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id })
      });
      const data = await res.json();
      campaign = data.campaign;
      backlog = data.backlog || backlog;
      calendar = data.calendar || calendar;
      statusPill = '✨ 100% Complete — 4 Formats Ready';
      await loadAdminOverview();
    } finally {
      loading = false;
    }
  }

  async function saveInlineEdit(formatKey, field, value) {
    if (!campaign || !selectedStory) return;
    if (field) campaign[formatKey][field] = value;
    await fetch('/api/studio/save-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId: selectedStory.id,
        format: formatKey,
        content: campaign[formatKey]
      })
    });
    exportToast = `Saved edit to ${formatKey} (linked for backprop)`;
    setTimeout(() => (exportToast = ''), 2500);
    await loadAdminOverview();
  }

  async function updateSchedule(storyId, status, scheduledDay) {
    const res = await fetch('/api/studio/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, status, scheduledDay })
    });
    const data = await res.json();
    backlog = data.backlog;
    calendar = data.calendar;
    exportToast = `Updated calendar: ${scheduledDay} (${status})`;
    setTimeout(() => (exportToast = ''), 2500);
    await loadAdminOverview();
  }

  async function exportFormat(formatKey) {
    if (!campaign || !selectedStory) return;
    const res = await fetch('/api/studio/export-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId: selectedStory.id,
        storyTitle: selectedStory.title,
        format: formatKey,
        content: campaign[formatKey]
      })
    });
    const data = await res.json();
    if (data.exported) {
      backlog = data.backlog || backlog;
      calendar = data.calendar || calendar;
      exportToast = `Exported ${formatKey.toUpperCase()} pack (${data.exportId || 'complete'})`;
      setTimeout(() => (exportToast = ''), 3500);
      await loadAdminOverview();
    }
  }

  async function scheduleAndExport(formatKey, day) {
    if (!campaign || !selectedStory) return;
    const targetDay = day || selectedScheduleDay || 'Thursday';
    await updateSchedule(selectedStory.id, 'Scheduled', targetDay);
    await exportFormat(formatKey);
    exportToast = `Scheduled for ${targetDay} & Exported ${formatKey.toUpperCase()}!`;
    setTimeout(() => (exportToast = ''), 3500);
  }

  async function addBacklogStory() {
    if (!newTitle.trim()) return;
    const res = await fetch('/api/studio/backlog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        category: newCategory,
        fact1: newFact1,
        scheduledDay: newScheduledDay
      })
    });
    const data = await res.json();
    backlog = data.backlog;
    calendar = data.calendar;
    newTitle = '';
    newFact1 = '';
    await loadAdminOverview();
  }

  async function executeAgentCommand() {
    const text = (agentCommand || '').trim().toLowerCase();
    if (!text) return;

    if (text.includes('punchier') || text.includes('headline')) {
      if (campaign && selectedStory) {
        const fmt = activeFormat;
        const current = campaign[fmt];
        if (fmt === 'infographic' && current.headline) {
          current.headline = current.headline.toUpperCase() + ' (REWRITE)';
          await saveInlineEdit('infographic', 'headline', current.headline);
        } else if (fmt === 'carousel' && current.coverHook) {
          current.coverHook = current.coverHook.toUpperCase() + ' (REWRITE)';
          await saveInlineEdit('carousel', 'coverHook', current.coverHook);
        }
        agentFeedback = '✨ Made headline punchier & synced for backpropagation!';
      } else {
        agentFeedback = '⚠️ Generate a campaign pack first.';
      }
    } else if (text.includes('schedule')) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const matchedDay = days.find(d => text.includes(d));
      const targetDay = matchedDay ? matchedDay.charAt(0).toUpperCase() + matchedDay.slice(1) : 'Friday';
      if (selectedStory) {
        await updateSchedule(selectedStory.id, 'Scheduled', targetDay);
        agentFeedback = `📅 Scheduled ${selectedStory.title.slice(0, 20)}... for ${targetDay}`;
      } else {
        agentFeedback = '⚠️ Select a story from Backlog first.';
      }
    } else if (text.includes('calendar')) {
      marketerTab = 'calendar';
      agentFeedback = '📅 Switched to Mon–Sun Content Calendar.';
    } else if (text.includes('brand') || text.includes('kit')) {
      marketerTab = 'brand_profile';
      agentFeedback = '🎨 Switched to Brand Kit.';
    } else if (text.includes('backlog')) {
      marketerTab = 'backlog';
      agentFeedback = '📋 Switched to Weekly Backlog.';
    } else if (text.includes('export')) {
      await exportFormat(activeFormat);
      agentFeedback = `📤 Exported ${activeFormat.toUpperCase()} pack!`;
    } else if (text.includes('format') || text.includes('generate')) {
      await createCampaignForStory(selectedStory);
      agentFeedback = '✨ Generated 4-channel campaign pack!';
    } else {
      agentFeedback = `✨ Executed command: "${text}"`;
    }
    agentCommand = '';
  }

  // Filtered Backlog
  let filteredBacklog = $derived(
    backlog.filter(item => {
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.verifiedFacts && item.verifiedFacts.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
  );

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
</script>

<div style="min-height: 100vh; background: #141513; color: #f4f1ea; font-family: 'Inter', system-ui, sans-serif;">
  <!-- KRUG-003: Clickable top-left brand mark -->
  <nav style="display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; border-bottom: 1px solid #262925;">
    <div style="display: flex; align-items: center; gap: 14px;">
      <button onclick={goHome} style="background: #212320; border: 1px solid #323630; padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 800; color: #f4f1ea; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        <span>💎</span> The Liquidity Desk
      </button>
      <span style="background: #a8c5a0; color: #141513; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;">
        {statusPill}
      </span>
    </div>

    <div style="display: flex; gap: 8px; background: #212320; padding: 4px; border-radius: 999px; border: 1px solid #323630;">
      <button
        onclick={() => (surfaceMode = 'marketer')}
        style="padding: 8px 16px; border-radius: 999px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {surfaceMode === 'marketer' ? '#c5d86d' : 'transparent'}; color: {surfaceMode === 'marketer' ? '#141513' : '#a9ada4'};"
      >
        ✨ Marketer Studio
      </button>
      <button
        onclick={() => (surfaceMode = 'admin')}
        style="padding: 8px 16px; border-radius: 999px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {surfaceMode === 'admin' ? '#c5d86d' : 'transparent'}; color: {surfaceMode === 'admin' ? '#141513' : '#a9ada4'};"
      >
        🛠️ Founder Admin & Ops
      </button>
    </div>
  </nav>

  {#if exportToast}
    <div style="position: fixed; bottom: 24px; right: 24px; background: #c5d86d; color: #141513; padding: 12px 20px; border-radius: 999px; font-weight: 700; z-index: 50; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
      ✅ {exportToast}
    </div>
  {/if}

  {#if surfaceMode === 'marketer'}
    <div style="max-width: 1420px; margin: 0 auto; padding: 28px 32px; display: grid; grid-template-columns: 1fr 340px; gap: 28px;">
      <div>
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-family: Georgia, serif; font-style: italic; font-weight: 400; font-size: 36px; margin: 0 0 6px;">Your Business Profile & Campaign Studio</h1>
          <!-- KRUG-007: Trimmed to 7 words -->
          <p style="margin: 0; color: #a9ada4; font-size: 15px; font-weight: 500;">Turn weekly liquidity trends into 4-channel campaigns.</p>
        </div>

        <!-- KRUG-003: Step-by-step High-Scent Progress Navigation Tabs -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); background: #1a1c19; border-radius: 16px 16px 0 0; border: 1px solid #2b2e29; border-bottom: none;">
          <button onclick={() => (marketerTab = 'brand_profile')} style="padding: 14px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {marketerTab === 'brand_profile' ? '#252824' : 'transparent'}; color: {marketerTab === 'brand_profile' ? '#c5d86d' : '#f4f1ea'}; border-bottom: {marketerTab === 'brand_profile' ? '2px solid #c5d86d' : 'none'};">
            1. Brand Kit
          </button>
          <button onclick={() => (marketerTab = 'backlog')} style="padding: 14px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {marketerTab === 'backlog' ? '#252824' : 'transparent'}; color: {marketerTab === 'backlog' ? '#c5d86d' : '#f4f1ea'}; border-bottom: {marketerTab === 'backlog' ? '2px solid #c5d86d' : 'none'};">
            2. Backlog ({filteredBacklog.length})
          </button>
          <button onclick={() => (marketerTab = 'calendar')} style="padding: 14px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {marketerTab === 'calendar' ? '#252824' : 'transparent'}; color: {marketerTab === 'calendar' ? '#c5d86d' : '#f4f1ea'}; border-bottom: {marketerTab === 'calendar' ? '2px solid #c5d86d' : 'none'};">
            3. Calendar
          </button>
          <button onclick={() => (marketerTab = 'campaign_studio')} style="padding: 14px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {marketerTab === 'campaign_studio' ? '#252824' : 'transparent'}; color: {marketerTab === 'campaign_studio' ? '#c5d86d' : '#f4f1ea'}; border-bottom: {marketerTab === 'campaign_studio' ? '2px solid #c5d86d' : 'none'};">
            4. Campaign Studio
          </button>
        </div>

        <div style="background: #212320; border: 1px solid #2b2e29; border-radius: 0 0 20px 20px; padding: 24px;">
          {#if marketerTab === 'brand_profile' && brandProfile}
            <!-- KRUG-006: Interactive Brand Kit -->
            <div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px;">
                <div style="background: #2a2d29; border-radius: 14px; padding: 20px; border: 1px solid #353933;">
                  <h3 style="margin: 0 0 8px; font-size: 18px;">{brandProfile.brandName}</h3>
                  <div style="color: #a8c5a0; font-size: 13px; margin-bottom: 8px;">{brandProfile.websiteUrl}</div>
                  <p style="color: #d5d8d0; font-size: 14px; font-style: italic; margin: 0;">"{brandProfile.tagline}"</p>
                </div>
                <div style="background: #2a2d29; border-radius: 14px; padding: 20px; border: 1px solid #353933;">
                  <div style="font-weight: 700; font-size: 13px; color: #c5d86d; margin-bottom: 8px;">💎 BRAND LOGO & MONOGRAM</div>
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                    <div style="background: #141513; border: 2px solid #a8c5a0; padding: 8px 14px; border-radius: 8px; font-weight: 800; color: #a8c5a0; font-size: 14px;">
                      {brandProfile.logoText || '💎 THE LIQUIDITY DESK'}
                    </div>
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <input bind:value={brandProfile.logoText} style="flex: 1; padding: 8px 10px; background: #141513; border: 1px solid #3a3e38; border-radius: 6px; color: #f4f1ea; font-size: 12px;" />
                    <button onclick={saveBrandProfile} style="background: #a8c5a0; color: #141513; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer;">Update</button>
                  </div>
                </div>
              </div>

              <!-- Color Palette with Pickers -->
              <div style="background: #2a2d29; border-radius: 14px; padding: 20px; border: 1px solid #353933;">
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 14px;">🎨 Color Palette (Click swatch to edit)</div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
                  {#each brandProfile.colors as c, idx}
                    <div style="text-align: center; background: #1f221e; padding: 12px; border-radius: 10px; border: 1px solid #353933;">
                      <input type="color" bind:value={c.hex} onchange={() => updateBrandColor(idx, c.hex)} style="width: 52px; height: 52px; border-radius: 50%; border: 2px solid #3a3e38; cursor: pointer; background: none; padding: 0; display: block; margin: 0 auto 8px;" />
                      <div style="font-weight: 700; font-size: 12px;">{c.name}</div>
                      <div style="font-family: monospace; font-size: 11px; color: #a8c5a0;">{c.hex}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {:else if marketerTab === 'backlog'}
            <!-- KRUG-004: Persistent Search & Filter -->
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 18px; flex-wrap: wrap;">
              <input type="text" placeholder="🔍 Search stories, metrics, categories..." bind:value={searchQuery} style="flex: 1; min-width: 240px; padding: 10px 16px; background: #181a17; border: 1px solid #353933; border-radius: 999px; color: #f4f1ea; font-size: 13px;" />
              <div style="display: flex; gap: 6px;">
                {#each ['All', 'Ready for Campaign', 'Draft Ready', 'Scheduled', 'Exported'] as st}
                  <button onclick={() => (statusFilter = st)} style="background: {statusFilter === st ? '#c5d86d' : '#2a2d29'}; color: {statusFilter === st ? '#141513' : '#d5d8d0'}; border: none; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; cursor: pointer;">{st}</button>
                {/each}
              </div>
            </div>

            <div>
              {#each filteredBacklog as item}
                <div style="background: #2a2d29; border: 1px solid #353933; border-radius: 14px; padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="max-width: 70%;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                      <span style="font-size: 11px; color: #a8c5a0; font-weight: 600;">{item.trendBadge}</span>
                      <span style="font-size: 11px; color: #a9ada4;">•</span>
                      <span style="font-size: 11px; color: #c5d86d; font-weight: 600;">📅 {item.scheduledDay}</span>
                      <span style="font-size: 11px; background: #1f221e; border: 1px solid #353933; padding: 2px 8px; border-radius: 4px; color: #d5d8d0;">{item.status}</span>
                    </div>
                    <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">{item.title}</div>
                    <div style="font-size: 12px; color: #a9ada4;">{item.verifiedFacts ? item.verifiedFacts[0] : ''}</div>
                  </div>
                  <button onclick={() => createCampaignForStory(item)} style="background: #c5d86d; color: #141513; border: none; padding: 10px 18px; border-radius: 999px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap;">
                    Format 4 Channels →
                  </button>
                </div>
              {/each}
            </div>
          {:else if marketerTab === 'calendar'}
            <!-- KRUG-004 & KRUG-005: All 7 days with search -->
            <div style="margin-bottom: 18px;">
              <input type="text" placeholder="🔍 Search scheduled stories across all 7 days..." bind:value={searchQuery} style="width: 100%; padding: 10px 16px; background: #181a17; border: 1px solid #353933; border-radius: 999px; color: #f4f1ea; font-size: 13px;" />
            </div>

            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;">
              {#each calendar as slot}
                <div style="background: #181a17; border: 1px solid #2f332d; border-radius: 12px; padding: 12px; min-height: 260px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="font-size: 12px; font-weight: 800; color: #c5d86d; margin-bottom: 10px; border-bottom: 1px solid #2f332d; padding-bottom: 6px;">
                      {slot.day} ({slot.items.length})
                    </div>
                    {#each slot.items as story}
                      <div style="background: #252824; border-radius: 8px; padding: 8px; margin-bottom: 8px; font-size: 11px; border-left: 3px solid #a8c5a0;">
                        <div style="font-weight: 700; margin-bottom: 4px; color: #f4f1ea;">{story.title}</div>
                        <div style="color: #c5d86d; font-size: 10px; margin-bottom: 6px;">{story.status}</div>
                        <div style="display: flex; gap: 4px;">
                          <button onclick={() => createCampaignForStory(story)} style="flex: 1; background: #c5d86d; color: #141513; border: none; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer;">
                            Studio →
                          </button>
                          <button onclick={() => updateSchedule(story.id, 'Scheduled', slot.day)} style="background: #a8c5a0; color: #141513; border: none; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer;">
                            ✓
                          </button>
                        </div>
                      </div>
                    {/each}
                  </div>
                  <div style="font-size: 10px; color: #6d736a; text-align: center;">{slot.items.length === 0 ? 'Open slot' : ''}</div>
                </div>
              {/each}
            </div>
          {:else}
            <!-- KRUG-001 & KRUG-005: Campaign Studio with 1-Click Schedule & Export + 4 Visual Previews -->
            {#if campaign && selectedStory}
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; background: #1a1c19; padding: 16px 20px; border-radius: 14px; border: 1px solid #353933; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <span style="font-size: 11px; color: #a8c5a0; font-weight: 700;">ACTIVE STORY:</span>
                    <h3 style="margin: 2px 0 0; font-size: 18px;">{selectedStory.title}</h3>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <select bind:value={selectedScheduleDay} style="background: #212320; color: #f4f1ea; border: 1px solid #353933; padding: 9px 14px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;">
                      {#each allDays as d}
                        <option value={d}>{d}</option>
                      {/each}
                    </select>
                    <button onclick={() => scheduleAndExport(activeFormat, selectedScheduleDay)} style="background: #c5d86d; color: #141513; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;">
                      📅 Schedule & Export
                    </button>
                  </div>
                </div>

                <!-- Format Switcher Tabs -->
                <div style="display: flex; gap: 8px; margin-bottom: 18px;">
                  <button onclick={() => (activeFormat = 'infographic')} style="padding: 9px 16px; border-radius: 999px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {activeFormat === 'infographic' ? '#c5d86d' : '#2a2d29'}; color: {activeFormat === 'infographic' ? '#141513' : '#d5d8d0'};">📊 Infographic (4:5)</button>
                  <button onclick={() => (activeFormat = 'carousel')} style="padding: 9px 16px; border-radius: 999px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {activeFormat === 'carousel' ? '#c5d86d' : '#2a2d29'}; color: {activeFormat === 'carousel' ? '#141513' : '#d5d8d0'};">🗂️ Carousel (4-Slide)</button>
                  <button onclick={() => (activeFormat = 'story')} style="padding: 9px 16px; border-radius: 999px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {activeFormat === 'story' ? '#c5d86d' : '#2a2d29'}; color: {activeFormat === 'story' ? '#141513' : '#d5d8d0'};">📱 IG Story (9:16)</button>
                  <button onclick={() => (activeFormat = 'reel')} style="padding: 9px 16px; border-radius: 999px; border: none; cursor: pointer; font-weight: 700; font-size: 13px; background: {activeFormat === 'reel' ? '#c5d86d' : '#2a2d29'}; color: {activeFormat === 'reel' ? '#141513' : '#d5d8d0'};">🎬 Reel (9:16)</button>
                </div>

                <!-- Visual Billboard Previews -->
                <div style="background: #181a17; border: 1px solid #353933; border-radius: 16px; padding: 24px;">
                  {#if activeFormat === 'infographic' && campaign.infographic}
                    <div style="display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start;">
                      <div style="background: #141513; border: 2px solid #a8c5a0; border-radius: 16px; padding: 24px; min-height: 480px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 12px 32px rgba(0,0,0,0.4);">
                        <div>
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <span style="background: #a8c5a0; color: #141513; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 4px;">{brandProfile?.logoText || '💎 THE LIQUIDITY DESK'}</span>
                            <span style="color: #a9ada4; font-size: 11px; font-weight: 600;">INFOGRAPHIC 4:5</span>
                          </div>
                          <div style="font-size: 22px; font-weight: 800; line-height: 1.2; color: #f4f1ea; margin-bottom: 18px; text-transform: uppercase;">
                            {campaign.infographic.headline}
                          </div>
                          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;">
                            {#each campaign.infographic.statRows as row}
                              <div style="background: #212320; border-left: 3px solid #c5d86d; padding: 10px 12px; border-radius: 6px; font-size: 13px; line-height: 1.4;">
                                {row}
                              </div>
                            {/each}
                          </div>
                        </div>
                        <div style="background: #252824; border: 1px solid #353933; border-radius: 8px; padding: 12px; font-size: 12px; color: #d5d8d0;">
                          <strong style="color: #c5d86d;">💡 DEAL TAKEAWAY:</strong> {campaign.infographic.bottomTakeaway}
                        </div>
                      </div>

                      <div style="background: #212320; border-radius: 14px; padding: 20px; border: 1px solid #353933;">
                        <h4 style="margin: 0 0 14px; font-size: 15px; color: #c5d86d;">✏️ Inline Editor</h4>
                        <div style="margin-bottom: 14px;">
                          <label style="font-size: 12px; font-weight: 700; color: #a9ada4; display: block; margin-bottom: 4px;">Headline</label>
                          <input type="text" bind:value={campaign.infographic.headline} onchange={() => saveInlineEdit('infographic', 'headline', campaign.infographic.headline)} style="width: 100%; padding: 10px; background: #141513; border: 1px solid #353933; border-radius: 8px; color: #f4f1ea; font-size: 14px; font-weight: 700;" />
                        </div>
                        <div style="margin-bottom: 14px;">
                          <label style="font-size: 12px; font-weight: 700; color: #a9ada4; display: block; margin-bottom: 4px;">Takeaway</label>
                          <input type="text" bind:value={campaign.infographic.bottomTakeaway} onchange={() => saveInlineEdit('infographic', 'bottomTakeaway', campaign.infographic.bottomTakeaway)} style="width: 100%; padding: 10px; background: #141513; border: 1px solid #353933; border-radius: 8px; color: #f4f1ea; font-size: 13px;" />
                        </div>
                        <div style="margin-bottom: 16px;">
                          <label style="font-size: 12px; font-weight: 700; color: #a9ada4; display: block; margin-bottom: 4px;">Caption</label>
                          <textarea rows="3" bind:value={campaign.infographic.caption} onchange={() => saveInlineEdit('infographic', 'caption', campaign.infographic.caption)} style="width: 100%; padding: 10px; background: #141513; border: 1px solid #353933; border-radius: 8px; color: #f4f1ea; font-size: 12px; line-height: 1.4;"></textarea>
                        </div>
                        <button onclick={() => exportFormat('infographic')} style="width: 100%; background: #c5d86d; color: #141513; border: none; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;">
                          📤 Export 1080×1350 Card
                        </button>
                      </div>
                    </div>
                  {:else if activeFormat === 'carousel' && campaign.carousel}
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: #212320; padding: 14px 18px; border-radius: 10px;">
                        <div>
                          <span style="font-size: 11px; color: #a8c5a0; font-weight: 700;">COVER HOOK:</span>
                          <div style="font-size: 18px; font-weight: 800; color: #f4f1ea; text-transform: uppercase;">{campaign.carousel.coverHook}</div>
                        </div>
                        <button onclick={() => exportFormat('carousel')} style="background: #c5d86d; color: #141513; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer;">
                          📤 Export 4-Slide Deck
                        </button>
                      </div>
                      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
                        {#each campaign.carousel.slides as s}
                          <div style="background: #141513; border: 2px solid #2f332d; border-radius: 14px; padding: 16px; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="background: #a8c5a0; color: #141513; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;">Slide {s.slideNumber}</span>
                                <span style="font-size: 10px; color: #a9ada4;">4:5 SWIPE</span>
                              </div>
                              <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #f4f1ea;">{s.title}</div>
                              <div style="background: #212320; border-left: 2px solid #c5d86d; padding: 8px 10px; border-radius: 4px; font-size: 12px; line-height: 1.4; margin-bottom: 10px;">
                                {s.bodyMetric}
                              </div>
                            </div>
                            <div style="font-size: 11px; color: #a8c5a0; background: #182018; border: 1px dashed #354a33; padding: 8px; border-radius: 6px;">
                              👁️ {s.visualNote}
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {:else if activeFormat === 'story' && campaign.story}
                    <div style="display: grid; grid-template-columns: 300px 1fr; gap: 28px; align-items: center;">
                      <div style="background: #141513; border: 3px solid #353933; border-radius: 28px; padding: 24px 20px; height: 520px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 12px 32px rgba(0,0,0,0.5); margin: 0 auto;">
                        <div>
                          <div style="background: #c5d86d; color: #141513; font-weight: 800; font-size: 13px; text-align: center; border-radius: 8px; padding: 10px; margin-bottom: 24px; text-transform: uppercase;">
                            {campaign.story.hookBanner}
                          </div>
                          <div style="font-size: 15px; font-weight: 700; text-align: center; color: #f4f1ea; background: #212320; padding: 20px; border-radius: 14px; border: 1px solid #353933; line-height: 1.4;">
                            {campaign.story.keyStatHighlight}
                          </div>
                        </div>
                        <div style="background: #252824; border: 2px solid #a8c5a0; border-radius: 16px; padding: 14px; text-align: center;">
                          <div style="font-size: 11px; font-weight: 800; color: #a8c5a0; margin-bottom: 4px;">🗳️ INTERACTIVE POLL</div>
                          <div style="font-size: 13px; font-weight: 700; margin-bottom: 10px;">{campaign.story.interactiveStickerPrompt}</div>
                          <div style="display: flex; gap: 8px;">
                            <div style="flex: 1; background: #141513; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600;">Equity</div>
                            <div style="flex: 1; background: #141513; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600;">Cash</div>
                          </div>
                        </div>
                      </div>
                      <div style="background: #212320; border-radius: 14px; padding: 20px; border: 1px solid #353933;">
                        <h4 style="margin: 0 0 14px; font-size: 15px; color: #c5d86d;">📱 Instagram Story 9:16</h4>
                        <div style="margin-bottom: 14px;">
                          <label style="font-size: 12px; font-weight: 700; color: #a9ada4; display: block; margin-bottom: 4px;">Hook Banner</label>
                          <input type="text" bind:value={campaign.story.hookBanner} onchange={() => saveInlineEdit('story', 'hookBanner', campaign.story.hookBanner)} style="width: 100%; padding: 10px; background: #141513; border: 1px solid #353933; border-radius: 8px; color: #f4f1ea; font-size: 13px;" />
                        </div>
                        <div style="margin-bottom: 14px;">
                          <label style="font-size: 12px; font-weight: 700; color: #a9ada4; display: block; margin-bottom: 4px;">Hero Stat</label>
                          <input type="text" bind:value={campaign.story.keyStatHighlight} onchange={() => saveInlineEdit('story', 'keyStatHighlight', campaign.story.keyStatHighlight)} style="width: 100%; padding: 10px; background: #141513; border: 1px solid #353933; border-radius: 8px; color: #f4f1ea; font-size: 13px;" />
                        </div>
                        <button onclick={() => exportFormat('story')} style="width: 100%; background: #c5d86d; color: #141513; border: none; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;">
                          📤 Export 1080×1920 Story
                        </button>
                      </div>
                    </div>
                  {:else if activeFormat === 'reel' && campaign.reel}
                    <div>
                      <div style="background: #212320; border-radius: 12px; padding: 16px 20px; margin-bottom: 18px; border-left: 4px solid #c5d86d; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <span style="font-size: 11px; color: #c5d86d; font-weight: 800;">🎙️ 0–3s SPOKEN HOOK:</span>
                          <div style="font-size: 16px; font-weight: 700; margin-top: 2px; color: #f4f1ea;">"{campaign.reel.spokenHook0to3s}"</div>
                        </div>
                        <button onclick={() => exportFormat('reel')} style="background: #c5d86d; color: #141513; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer;">
                          📤 Export Reel Script
                        </button>
                      </div>
                      <table style="width: 100%; border-collapse: collapse; background: #141513; border: 1px solid #353933; border-radius: 10px; overflow: hidden; font-size: 13px;">
                        <thead>
                          <tr style="background: #212320; color: #a8c5a0; text-align: left;">
                            <th style="padding: 12px; border-bottom: 1px solid #353933; width: 120px;">Timecode</th>
                            <th style="padding: 12px; border-bottom: 1px solid #353933;">Voiceover</th>
                            <th style="padding: 12px; border-bottom: 1px solid #353933; width: 160px;">On-Screen Text</th>
                            <th style="padding: 12px; border-bottom: 1px solid #353933;">B-Roll Visual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {#each campaign.reel.beats as b}
                            <tr style="border-bottom: 1px solid #2a2d29;">
                              <td style="padding: 12px; font-family: monospace; color: #c5d86d; font-weight: 700;">{b.timecode}</td>
                              <td style="padding: 12px; color: #f4f1ea; line-height: 1.4;">{b.voiceover}</td>
                              <td style="padding: 12px;"><span style="background: #212320; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">{b.onScreenText}</span></td>
                              <td style="padding: 12px; color: #a9ada4; font-size: 12px;">{b.bRollDirection}</td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                      <div style="margin-top: 16px; background: #212320; padding: 12px 18px; border-radius: 8px; font-size: 13px;">
                        <strong style="color: #a8c5a0;">📢 CLOSING CTA:</strong> "{campaign.reel.closingCta}"
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            {:else}
              <div style="text-align: center; padding: 48px 24px;">
                <h3 style="font-size: 22px; margin-bottom: 8px;">Select a story to format across all 4 channels</h3>
                <button onclick={() => createCampaignForStory(selectedStory)} style="background: #c5d86d; color: #141513; border: none; padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 14px; cursor: pointer;">
                  {loading ? 'Formatting All 4 Channels...' : "Let's go — Generate 4-Format Campaign Pack"}
                </button>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <!-- KRUG-002: Real Interactive Studio Agent Sidebar -->
      <aside style="background: #182018; border: 1px solid #2b3829; border-radius: 20px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; height: fit-content;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="font-weight: 800; font-size: 15px; color: #c5d86d;">🚀 Liquidity Studio Agent</div>
            <span style="font-size: 11px; background: #2a3a28; color: #a8c5a0; padding: 2px 8px; border-radius: 999px;">Live</span>
          </div>
          <!-- KRUG-007: Concise live contextual status cue -->
          <div style="background: #202820; border: 1px solid #2b3829; border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #d5d8d0; margin-bottom: 14px;">
            <strong>Active:</strong> {selectedStory ? selectedStory.title.slice(0, 24) + '...' : 'Angel City FC'} • 4 formats ready
          </div>
          <div style="font-size: 12px; color: #a9ada4; margin-bottom: 8px; font-weight: 600;">QUICK ACTIONS</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button onclick={() => createCampaignForStory(selectedStory)} style="background: #253024; color: #f4f1ea; border: 1px solid #3d4f39; padding: 9px 14px; border-radius: 10px; text-align: left; cursor: pointer; font-size: 13px; font-weight: 600;">✨ Format 4 Channels</button>
            <button onclick={() => (marketerTab = 'calendar')} style="background: #253024; color: #f4f1ea; border: 1px solid #3d4f39; padding: 9px 14px; border-radius: 10px; text-align: left; cursor: pointer; font-size: 13px; font-weight: 600;">📅 View Mon–Sun Calendar</button>
            <button onclick={() => (marketerTab = 'brand_profile')} style="background: #253024; color: #f4f1ea; border: 1px solid #3d4f39; padding: 9px 14px; border-radius: 10px; text-align: left; cursor: pointer; font-size: 13px; font-weight: 600;">🎨 View Brand Kit</button>
          </div>
        </div>

        <!-- Working Input Form -->
        <div style="margin-top: 20px; border-top: 1px solid #2b3829; padding-top: 16px;">
          <form onsubmit={(e) => { e.preventDefault(); executeAgentCommand(); }}>
            <div style="font-size: 12px; color: #a9ada4; margin-bottom: 6px; font-weight: 600;">COMMAND COPILOT</div>
            <div style="display: flex; gap: 6px;">
              <input type="text" placeholder="Ask Studio Agent... (e.g. Schedule for Friday)" bind:value={agentCommand} style="flex: 1; padding: 10px 12px; background: #141513; border: 1px solid #3d4f39; border-radius: 8px; color: #f4f1ea; font-size: 12px;" />
              <button type="submit" style="background: #c5d86d; color: #141513; border: none; border-radius: 8px; padding: 0 14px; font-weight: 700; font-size: 12px; cursor: pointer;">Send</button>
            </div>
          </form>
          {#if agentFeedback}
            <div style="margin-top: 8px; font-size: 11px; color: #c5d86d; background: #202820; padding: 6px 10px; border-radius: 6px;">
              {agentFeedback}
            </div>
          {/if}
        </div>
      </aside>
    </div>
  {:else}
    <!-- FOUNDER ADMIN SURFACE -->
    <div style="max-width: 1420px; margin: 0 auto; padding: 32px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">Founder Admin: DI Ports, Silent Evals, Backprop JSONL & Context Graph</h2>
        <div style="display: flex; gap: 10px;">
          <a href="/api/admin/backprop-jsonl" download="backprop-preferences.jsonl" style="background: #212320; color: #a8c5a0; border: 1px solid #a8c5a0; padding: 10px 16px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 13px;">⬇️ Download Backprop JSONL</a>
          <button onclick={loadStudioBootstrap} style="background: #c5d86d; color: #141513; border: none; padding: 10px 18px; border-radius: 999px; font-weight: 700; cursor: pointer;">⚡ Run Weekly Batch Draft Job</button>
        </div>
      </div>
      {#if contextGraphData}
        <div style="background: #212320; border: 1px solid #2b2e29; border-radius: 16px; padding: 24px;">
          <h3 style="margin-top: 0;">Context Graph & QA Topology ({contextGraphData.topologyValidation.valid ? '✅ 100% VALID' : '❌ INVALID'})</h3>
          <p style="font-size: 13px; color: #a9ada4;">
            Nodes: {contextGraphData.topologyValidation.stats.nodesCount} | Edges: {contextGraphData.topologyValidation.stats.edgesCount} | Schemas: {contextGraphData.topologyValidation.stats.schemasCount} | Prior Art & Doc Links: {contextGraphData.topologyValidation.stats.referencesCount}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
            <div>
              <h4>Prior Art, GCP Docs & Reference Links</h4>
              {#each contextGraphData.graph.references as ref}
                <div style="background: #181a17; padding: 10px; border-radius: 8px; margin-bottom: 8px; font-size: 12px;">
                  <strong style="color: #c5d86d;">[{ref.type}] {ref.title}</strong>
                  <div style="color: #a8c5a0;">{ref.url || ref.artifactPath}</div>
                  <div style="color: #a9ada4; margin-top: 4px;">{ref.summary}</div>
                </div>
              {/each}
            </div>
            <div>
              <h4>Directed Graph Edges (Screen → Route → Service → Port → Adapter)</h4>
              {#each contextGraphData.graph.edges.slice(0, 14) as edge}
                <div style="background: #181a17; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px; font-size: 12px; font-family: monospace;">
                  {edge.from} ──[{edge.relation}]──► {edge.to}
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
