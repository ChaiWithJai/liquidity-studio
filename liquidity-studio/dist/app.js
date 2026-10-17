const state = {
  surfaceMode: 'marketer', // 'marketer' | 'admin'
  marketerTab: 'campaign_studio', // 'brand_profile' | 'backlog' | 'calendar' | 'campaign_studio'
  adminTab: 'context_graph', // 'context_graph' | 'observability'
  activeFormat: 'infographic', // 'infographic' | 'carousel' | 'story' | 'reel'
  brandProfile: null,
  backlog: [],
  calendar: [],
  selectedStory: null,
  campaign: null,
  adminData: null,
  contextGraphData: null,
  statusPill: '✨ Ready to create',
  toast: '',
  loading: false,
  searchQuery: '',
  statusFilter: 'All',
  selectedScheduleDay: 'Thursday',
  agentFeedback: '',
  editingHeadline: false
};

function showToast(msg) {
  state.toast = msg;
  render();
  setTimeout(() => { state.toast = ''; render(); }, 3500);
}

async function bootstrap() {
  const [studioRes, adminRes, graphRes] = await Promise.all([
    fetch('/api/studio/bootstrap').then(r => r.json()),
    fetch('/api/admin/overview').then(r => r.json()),
    fetch('/api/admin/context-graph').then(r => r.json())
  ]);
  state.brandProfile = studioRes.brandProfile;
  if (!state.brandProfile.logoText) state.brandProfile.logoText = '💎 THE LIQUIDITY DESK';
  state.backlog = studioRes.backlog || [];
  state.calendar = studioRes.calendar || [];
  state.selectedStory = state.backlog[0] || null;
  state.campaign = state.selectedStory?.campaignDraft || null;
  state.selectedScheduleDay = state.selectedStory?.scheduledDay || 'Thursday';
  if (state.campaign) state.statusPill = campaignStatus(state.campaign);
  state.adminData = adminRes;
  state.contextGraphData = graphRes;
  render();
}

window.goHome = () => {
  state.surfaceMode = 'marketer';
  state.marketerTab = 'backlog';
  render();
};

window.switchSurface = (mode) => { state.surfaceMode = mode; render(); };
window.switchMarketerTab = (tab) => { state.marketerTab = tab; render(); };
window.switchAdminTab = (tab) => { state.adminTab = tab; render(); };
window.switchFormat = (fmt) => { state.activeFormat = fmt; render(); };
window.setSearch = (q) => { state.searchQuery = q; render(); };
window.setStatusFilter = (st) => { state.statusFilter = st; render(); };
window.setScheduleDay = (day) => { state.selectedScheduleDay = day; };

function campaignStatus(campaign) {
  if (campaign?.provenance?.mode === 'synthetic') return 'Synthetic draft · Degraded mode · Source review required';
  if (campaign?.provenance?.mode === 'provider') return 'Provider draft · Source review required';
  return 'Draft provenance unavailable · Source review required';
}

window.generateCampaign = async (storyId) => {
  const id = storyId || state.selectedStory?.id;
  if (!id) return;
  state.loading = true;
  state.statusPill = 'Generating campaign...';
  state.marketerTab = 'campaign_studio';
  render();
  try {
    const response = await fetch('/api/studio/generate-campaign', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId: id })
    });
    const res = await response.json();
    if (!response.ok || !res.story || !res.campaign) throw new Error('Generation failed');
    state.selectedStory = res.story;
    state.campaign = res.campaign;
    state.selectedScheduleDay = res.story.scheduledDay || 'Thursday';
    state.backlog = res.backlog || state.backlog;
    state.calendar = res.calendar || state.calendar;
    state.statusPill = campaignStatus(state.campaign);
  } catch {
    state.statusPill = 'Generation failed. Check provider configuration and retry. Existing draft preserved.';
  } finally {
    state.loading = false;
    render();
  }
};

window.openStoryInStudio = (storyId) => {
  const story = state.backlog.find(s => s.id === storyId);
  if (story) {
    state.selectedStory = story;
    state.marketerTab = 'campaign_studio';
    state.selectedScheduleDay = story.scheduledDay || 'Thursday';
    state.campaign = story.campaignDraft || null;
    if (state.campaign) {
      state.statusPill = campaignStatus(state.campaign);
      render();
    } else {
      return window.generateCampaign(storyId);
    }
  }
};

window.saveInlineEdit = async (formatKey, field, value) => {
  if (!state.campaign || !state.campaign[formatKey] || !state.selectedStory) return;
  state.campaign[formatKey][field] = value;
  // Keep the local backlog draft current when navigating before the next bootstrap.
  state.selectedStory.campaignDraft = state.campaign;
  const backlogStory = state.backlog.find(s => s.id === state.selectedStory.id);
  if (backlogStory) backlogStory.campaignDraft = state.campaign;
  await fetch('/api/studio/save-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyId: state.selectedStory.id,
      format: formatKey,
      content: state.campaign[formatKey]
    })
  });
  showToast('Saved edit to ' + formatKey.toUpperCase());
};

window.exportAsset = async (formatKey) => {
  if (!state.campaign || !state.selectedStory) return;
  const res = await fetch('/api/studio/export-asset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyId: state.selectedStory.id,
      storyTitle: state.selectedStory.title,
      format: formatKey,
      content: state.campaign[formatKey]
    })
  }).then(r => r.json());
  state.backlog = res.backlog || state.backlog;
  state.calendar = res.calendar || state.calendar;
  state.adminData = await fetch('/api/admin/overview').then(r => r.json());
  showToast('Exported ' + formatKey.toUpperCase() + ' (' + (res.exportId || 'pack') + ')');
};

window.scheduleAndExport = async (formatKey, day) => {
  if (!state.campaign || !state.selectedStory) return;
  const targetDay = day || state.selectedScheduleDay || 'Thursday';
  await fetch('/api/studio/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyId: state.selectedStory.id, status: 'Scheduled', scheduledDay: targetDay })
  });
  const res = await fetch('/api/studio/export-asset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyId: state.selectedStory.id,
      storyTitle: state.selectedStory.title,
      format: formatKey,
      content: state.campaign[formatKey]
    })
  }).then(r => r.json());
  state.backlog = res.backlog || state.backlog;
  state.calendar = res.calendar || state.calendar;
  state.adminData = await fetch('/api/admin/overview').then(r => r.json());
  showToast('Scheduled for ' + targetDay + ' & Exported ' + formatKey.toUpperCase() + '!');
};

window.approveSlot = async (storyId, day) => {
  const res = await fetch('/api/studio/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyId, status: 'Scheduled', scheduledDay: day })
  }).then(r => r.json());
  state.backlog = res.backlog;
  state.calendar = res.calendar;
  state.adminData = await fetch('/api/admin/overview').then(r => r.json());
  showToast('Scheduled for ' + day);
};

window.updateBrandColor = async (index, newHex) => {
  if (!state.brandProfile || !state.brandProfile.colors[index]) return;
  state.brandProfile.colors[index].hex = newHex;
  await fetch('/api/studio/brand-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state.brandProfile)
  });
  showToast('Updated ' + state.brandProfile.colors[index].name + ' to ' + newHex);
};

window.updateLogoText = async (newText) => {
  if (!state.brandProfile) return;
  state.brandProfile.logoText = newText;
  await fetch('/api/studio/brand-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state.brandProfile)
  });
  showToast('Updated Brand Logo Mark');
};

window.executeAgentCommand = async (cmdText) => {
  const text = (cmdText || '').trim().toLowerCase();
  if (!text) return;

  if (text.includes('punchier') || text.includes('headline')) {
    if (state.campaign && state.selectedStory) {
      const fmt = state.activeFormat;
      const current = state.campaign[fmt];
      if (fmt === 'infographic' && current.headline) {
        current.headline = current.headline.toUpperCase() + ' (REWRITE)';
        await window.saveInlineEdit('infographic', 'headline', current.headline);
      } else if (fmt === 'carousel' && current.coverHook) {
        current.coverHook = current.coverHook.toUpperCase() + ' (REWRITE)';
        await window.saveInlineEdit('carousel', 'coverHook', current.coverHook);
      }
      state.agentFeedback = '✨ Made headline punchier & synced for backpropagation!';
      showToast('Updated headline with punchier copy');
    } else {
      state.agentFeedback = '⚠️ Generate a campaign pack first to edit headlines.';
    }
  } else if (text.includes('schedule')) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const matchedDay = days.find(d => text.includes(d));
    const targetDay = matchedDay ? matchedDay.charAt(0).toUpperCase() + matchedDay.slice(1) : 'Friday';
    if (state.selectedStory) {
      await window.approveSlot(state.selectedStory.id, targetDay);
      state.agentFeedback = '📅 Scheduled ' + state.selectedStory.title.slice(0, 20) + '... for ' + targetDay;
    } else {
      state.agentFeedback = '⚠️ Select a story from the Backlog first.';
    }
  } else if (text.includes('add story') || text.includes('new story')) {
    const titleMatch = text.replace(/(add story|new story|add|new)/g, '').trim();
    const storyTitle = titleMatch || 'New Cultural Capital Breakdown';
    const res = await fetch('/api/studio/backlog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: storyTitle,
        category: 'Creator & Founder Liquidity',
        scheduledDay: 'Wednesday'
      })
    }).then(r => r.json());
    state.backlog = res.backlog;
    state.calendar = res.calendar;
    state.agentFeedback = '✨ Added "' + storyTitle + '" to Weekly Backlog!';
    showToast('Added story to queue');
  } else if (text.includes('calendar')) {
    state.marketerTab = 'calendar';
    state.agentFeedback = '📅 Switched to Mon–Sun Content Calendar.';
  } else if (text.includes('brand') || text.includes('kit')) {
    state.marketerTab = 'brand_profile';
    state.agentFeedback = '🎨 Switched to Brand Kit.';
  } else if (text.includes('backlog')) {
    state.marketerTab = 'backlog';
    state.agentFeedback = '📋 Switched to Weekly Backlog.';
  } else if (text.includes('export')) {
    await window.exportAsset(state.activeFormat);
    state.agentFeedback = '📤 Exported ' + state.activeFormat.toUpperCase() + ' pack!';
  } else if (text.includes('format') || text.includes('generate')) {
    await window.generateCampaign();
    state.agentFeedback = '✨ Generated 4-channel campaign pack!';
  } else {
    state.agentFeedback = '✨ Executed quick command: "' + text + '"';
    showToast('Agent processed: ' + text);
  }
  render();
};

window.runBatchJob = async () => {
  state.loading = true;
  state.statusPill = '✨ Running Weekly Batch Draft Producer...';
  render();
  const res = await fetch('/api/admin/run-weekly-batch', { method: 'POST' }).then(r => r.json());
  state.campaign = res.latestCampaign;
  state.loading = false;
  state.statusPill = '✨ Weekly Batch Drafts Ready';
  await bootstrap();
};

function render() {
  const root = document.getElementById('app');
  if (!root) return;
  const bp = state.brandProfile;
  const cg = state.contextGraphData;

  root.innerHTML = `
    <nav style="display:flex;justify-content:space-between;align-items:center;padding:16px 32px;border-bottom:1px solid #262925;background:#141513;">
      <div style="display:flex;align-items:center;gap:14px;">
        <button onclick="goHome()" style="background:#212320;border:1px solid #323630;padding:8px 16px;border-radius:999px;font-size:14px;font-weight:800;color:#f4f1ea;cursor:pointer;display:flex;align-items:center;gap:6px;">
          <span>💎</span> The Liquidity Desk
        </button>
        <span style="background:#a8c5a0;color:#141513;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;">${state.statusPill}</span>
      </div>
      <div style="display:flex;gap:8px;background:#212320;padding:4px;border-radius:999px;border:1px solid #323630;">
        <button onclick="switchSurface('marketer')" style="padding:8px 16px;border-radius:999px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${state.surfaceMode==='marketer'?'#c5d86d':'transparent'};color:${state.surfaceMode==='marketer'?'#141513':'#a9ada4'};">✨ Marketer Studio</button>
        <button onclick="switchSurface('admin')" style="padding:8px 16px;border-radius:999px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${state.surfaceMode==='admin'?'#c5d86d':'transparent'};color:${state.surfaceMode==='admin'?'#141513':'#a9ada4'};">🛠️ Founder Admin & Ops</button>
      </div>
    </nav>
    ${state.toast ? `<div style="position:fixed;bottom:24px;right:24px;background:#c5d86d;color:#141513;padding:12px 20px;border-radius:999px;font-weight:700;z-index:50;box-shadow:0 8px 24px rgba(0,0,0,0.5);">✅ ${state.toast}</div>` : ''}
    ${state.surfaceMode === 'marketer' ? renderMarketer(bp) : renderAdmin(cg)}
  `;
}

function renderMarketer(bp) {
  const filteredBacklog = state.backlog.filter(item => {
    const matchesSearch = !state.searchQuery ||
      item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (item.verifiedFacts && item.verifiedFacts.some(f => f.toLowerCase().includes(state.searchQuery.toLowerCase())));
    const matchesStatus = state.statusFilter === 'All' || item.status === state.statusFilter;
    return matchesSearch && matchesStatus;
  });

  return `
    <div style="max-width:1420px;margin:0 auto;padding:28px 32px;display:grid;grid-template-columns:1fr 340px;gap:28px;">
      <div>
        <div style="text-align:center;margin-bottom:20px;">
          <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:36px;margin:0 0 6px;">Your Business Profile & Campaign Studio</h1>
          <p style="margin:0;color:#a9ada4;font-size:15px;font-weight:500;">Turn weekly liquidity trends into 4-channel campaigns.</p>
        </div>

        <!-- Krug Step-by-Step High-Scent Progress Navigation Tabs -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);background:#1a1c19;border-radius:16px 16px 0 0;border:1px solid #2b2e29;border-bottom:none;">
          <button onclick="switchMarketerTab('brand_profile')" style="padding:14px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${state.marketerTab==='brand_profile'?'#252824':'transparent'};color:${state.marketerTab==='brand_profile'?'#c5d86d':'#f4f1ea'};border-bottom:${state.marketerTab==='brand_profile'?'2px solid #c5d86d':'none'};">
            1. Brand Kit
          </button>
          <button onclick="switchMarketerTab('backlog')" style="padding:14px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${state.marketerTab==='backlog'?'#252824':'transparent'};color:${state.marketerTab==='backlog'?'#c5d86d':'#f4f1ea'};border-bottom:${state.marketerTab==='backlog'?'2px solid #c5d86d':'none'};">
            2. Backlog (${filteredBacklog.length})
          </button>
          <button onclick="switchMarketerTab('calendar')" style="padding:14px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${state.marketerTab==='calendar'?'#252824':'transparent'};color:${state.marketerTab==='calendar'?'#c5d86d':'#f4f1ea'};border-bottom:${state.marketerTab==='calendar'?'2px solid #c5d86d':'none'};">
            3. Calendar
          </button>
          <button onclick="switchMarketerTab('campaign_studio')" style="padding:14px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${state.marketerTab==='campaign_studio'?'#252824':'transparent'};color:${state.marketerTab==='campaign_studio'?'#c5d86d':'#f4f1ea'};border-bottom:${state.marketerTab==='campaign_studio'?'2px solid #c5d86d':'none'};">
            4. Campaign Studio
          </button>
        </div>

        <div style="background:#212320;border:1px solid #2b2e29;border-radius:0 0 20px 20px;padding:24px;">
          ${state.marketerTab === 'brand_profile' ? renderBrandKit(bp) : ''}
          ${state.marketerTab === 'backlog' ? renderBacklogView(filteredBacklog) : ''}
          ${state.marketerTab === 'calendar' ? renderCalendarView() : ''}
          ${state.marketerTab === 'campaign_studio' ? renderCampaignStudio() : ''}
        </div>
      </div>

      <!-- Studio Agent Sidebar -->
      <aside style="background:#182018;border:1px solid #2b3829;border-radius:20px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;height:fit-content;">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div style="font-weight:800;font-size:15px;color:#c5d86d;">🚀 Liquidity Studio Agent</div>
            <span style="font-size:11px;background:#2a3a28;color:#a8c5a0;padding:2px 8px;border-radius:999px;">Live</span>
          </div>
          <!-- KRUG-007: Concise live contextual status cue -->
          <div style="background:#202820;border:1px solid #2b3829;border-radius:10px;padding:10px 12px;font-size:12px;color:#d5d8d0;margin-bottom:14px;">
            <strong>Active:</strong> ${state.selectedStory ? state.selectedStory.title.slice(0, 24) + '...' : 'Angel City FC'} • 4 formats ready
          </div>
          <div style="font-size:12px;color:#a9ada4;margin-bottom:8px;font-weight:600;">QUICK ACTIONS</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button onclick="generateCampaign()" style="background:#253024;color:#f4f1ea;border:1px solid #3d4f39;padding:9px 14px;border-radius:10px;text-align:left;cursor:pointer;font-size:13px;font-weight:600;">✨ Format 4 Channels</button>
            <button onclick="switchMarketerTab('calendar')" style="background:#253024;color:#f4f1ea;border:1px solid #3d4f39;padding:9px 14px;border-radius:10px;text-align:left;cursor:pointer;font-size:13px;font-weight:600;">📅 View Mon–Sun Calendar</button>
            <button onclick="switchMarketerTab('brand_profile')" style="background:#253024;color:#f4f1ea;border:1px solid #3d4f39;padding:9px 14px;border-radius:10px;text-align:left;cursor:pointer;font-size:13px;font-weight:600;">🎨 View Brand Kit</button>
          </div>
        </div>

        <!-- KRUG-002: Real, working interactive input form -->
        <div style="margin-top:20px;border-top:1px solid #2b3829;padding-top:16px;">
          <form onsubmit="event.preventDefault(); const inp = document.getElementById('agentInputBox'); window.executeAgentCommand(inp.value); inp.value='';">
            <div style="font-size:12px;color:#a9ada4;margin-bottom:6px;font-weight:600;">COMMAND COPILOT</div>
            <div style="display:flex;gap:6px;">
              <input id="agentInputBox" type="text" placeholder="Ask Studio Agent... (e.g. Schedule for Friday)" style="flex:1;padding:10px 12px;background:#141513;border:1px solid #3d4f39;border-radius:8px;color:#f4f1ea;font-size:12px;" />
              <button type="submit" style="background:#c5d86d;color:#141513;border:none;border-radius:8px;padding:0 14px;font-weight:700;font-size:12px;cursor:pointer;">Send</button>
            </div>
          </form>
          ${state.agentFeedback ? `<div style="margin-top:8px;font-size:11px;color:#c5d86d;background:#202820;padding:6px 10px;border-radius:6px;">${state.agentFeedback}</div>` : ''}
        </div>
      </aside>
    </div>
  `;
}

function renderBrandKit(bp) {
  if (!bp) return '<div>Loading Brand Profile...</div>';
  return `
    <div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px;">
        <div style="background:#2a2d29;border-radius:14px;padding:20px;border:1px solid #353933;">
          <h3 style="margin:0 0 8px;font-size:18px;">${bp.brandName}</h3>
          <div style="color:#a8c5a0;font-size:13px;margin-bottom:8px;">${bp.websiteUrl}</div>
          <p style="color:#d5d8d0;font-size:14px;font-style:italic;margin:0;">"${bp.tagline}"</p>
        </div>
        <!-- KRUG-006: Interactive logo monogram badge -->
        <div style="background:#2a2d29;border-radius:14px;padding:20px;border:1px solid #353933;">
          <div style="font-weight:700;font-size:13px;color:#c5d86d;margin-bottom:8px;">💎 BRAND LOGO & MONOGRAM</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <div style="background:#141513;border:2px solid #a8c5a0;padding:8px 14px;border-radius:8px;font-weight:800;color:#a8c5a0;font-size:14px;">
              ${bp.logoText || '💎 THE LIQUIDITY DESK'}
            </div>
          </div>
          <div style="display:flex;gap:6px;">
            <input id="logoInputBox" type="text" value="${bp.logoText || '💎 THE LIQUIDITY DESK'}" style="flex:1;padding:8px 10px;background:#141513;border:1px solid #3a3e38;border-radius:6px;color:#f4f1ea;font-size:12px;" />
            <button onclick="window.updateLogoText(document.getElementById('logoInputBox').value)" style="background:#a8c5a0;color:#141513;border:none;padding:8px 14px;border-radius:6px;font-weight:700;font-size:12px;cursor:pointer;">Update</button>
          </div>
        </div>
      </div>

      <!-- KRUG-006: Interactive color pickers -->
      <div style="background:#2a2d29;border-radius:14px;padding:20px;border:1px solid #353933;">
        <div style="font-weight:700;font-size:14px;margin-bottom:14px;">🎨 Color Palette (Click swatch to edit)</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">
          ${bp.colors.map((c, i) => `
            <div style="text-align:center;background:#1f221e;padding:12px;border-radius:10px;border:1px solid #353933;">
              <input type="color" value="${c.hex}" onchange="window.updateBrandColor(${i}, this.value)" style="width:52px;height:52px;border-radius:50%;border:2px solid #3a3e38;cursor:pointer;background:none;padding:0;display:block;margin:0 auto 8px;" />
              <div style="font-weight:700;font-size:12px;">${c.name}</div>
              <div style="font-family:monospace;font-size:11px;color:#a8c5a0;">${c.hex}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderBacklogView(stories) {
  return `
    <div>
      <!-- KRUG-004: Persistent Search & Status Filter bar -->
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:18px;flex-wrap:wrap;">
        <input type="text" placeholder="🔍 Search stories, metrics, categories..." value="${state.searchQuery}" oninput="window.setSearch(this.value)" style="flex:1;min-width:240px;padding:10px 16px;background:#181a17;border:1px solid #353933;border-radius:999px;color:#f4f1ea;font-size:13px;" />
        <div style="display:flex;gap:6px;">
          ${['All', 'Ready for Campaign', 'Draft Ready', 'Scheduled', 'Exported'].map(st => `
            <button onclick="window.setStatusFilter('${st}')" style="background:${state.statusFilter===st?'#c5d86d':'#2a2d29'};color:${state.statusFilter===st?'#141513':'#d5d8d0'};border:none;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:700;cursor:pointer;">${st}</button>
          `).join('')}
        </div>
      </div>

      <div>
        ${stories.length === 0 ? '<div style="padding:32px;text-align:center;color:#a9ada4;">No matching backlog stories found.</div>' : ''}
        ${stories.map(item => `
          <div style="background:#2a2d29;border:1px solid #353933;border-radius:14px;padding:16px 20px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;transition:border-color 0.15s ease;">
            <div style="max-width:70%;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:11px;color:#a8c5a0;font-weight:600;">${item.trendBadge}</span>
                <span style="font-size:11px;color:#a9ada4;">•</span>
                <span style="font-size:11px;color:#c5d86d;font-weight:600;">📅 ${item.scheduledDay}</span>
                <span style="font-size:11px;background:#1f221e;border:1px solid #353933;padding:2px 8px;border-radius:4px;color:#d5d8d0;">${item.status}</span>
              </div>
              <div style="font-size:16px;font-weight:700;margin-bottom:6px;">${item.title}</div>
              <div style="font-size:12px;color:#a9ada4;">${item.verifiedFacts ? item.verifiedFacts[0] : ''}</div>
            </div>
            <button onclick="window.openStoryInStudio('${item.id}')" style="background:#c5d86d;color:#141513;border:none;padding:10px 18px;border-radius:999px;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap;">
              Format 4 Channels →
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCalendarView() {
  return `
    <div>
      <!-- KRUG-004: Persistent Search for Calendar -->
      <div style="margin-bottom:18px;">
        <input type="text" placeholder="🔍 Search scheduled stories or metrics across all 7 days..." value="${state.searchQuery}" oninput="window.setSearch(this.value)" style="width:100%;padding:10px 16px;background:#181a17;border:1px solid #353933;border-radius:999px;color:#f4f1ea;font-size:13px;" />
      </div>

      <!-- KRUG-005: Render ALL 7 days Mon–Sun without slicing! -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;">
        ${state.calendar.map(slot => {
          const items = slot.items.filter(st =>
            !state.searchQuery ||
            st.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            st.category.toLowerCase().includes(state.searchQuery.toLowerCase())
          );
          return `
            <div style="background:#181a17;border:1px solid #2f332d;border-radius:12px;padding:12px;min-height:260px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="font-size:12px;font-weight:800;color:#c5d86d;margin-bottom:10px;border-bottom:1px solid #2f332d;padding-bottom:6px;">
                  ${slot.day} (${items.length})
                </div>
                ${items.map(st => `
                  <div style="background:#252824;border-radius:8px;padding:8px;margin-bottom:8px;font-size:11px;border-left:3px solid #a8c5a0;">
                    <div style="font-weight:700;margin-bottom:4px;color:#f4f1ea;">${st.title}</div>
                    <div style="color:#c5d86d;font-size:10px;margin-bottom:6px;">${st.status}</div>
                    <!-- KRUG-005: Direct 'Open Studio →' button -->
                    <div style="display:flex;gap:4px;">
                      <button onclick="window.openStoryInStudio('${st.id}')" style="flex:1;background:#c5d86d;color:#141513;border:none;padding:4px 6px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;">
                        Studio →
                      </button>
                      <button onclick="window.approveSlot('${st.id}','${slot.day}')" style="background:#a8c5a0;color:#141513;border:none;padding:4px 6px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;">
                        ✓
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div style="font-size:10px;color:#6d736a;text-align:center;">${items.length === 0 ? 'Open slot' : ''}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderCampaignStudio() {
  const story = state.selectedStory;
  const campaign = state.campaign;
  const activeFmt = state.activeFormat;

  if (!campaign) {
    return `
      <div style="text-align:center;padding:48px 24px;">
        <h3 style="font-size:22px;margin-bottom:8px;">Select a story to format across all 4 channels</h3>
        <p style="color:#a9ada4;font-size:14px;max-width:540px;margin:0 auto 24px;">
          Generate structured 4:5 Infographics, 4-Slide Carousels, 9:16 IG Stories with poll stickers, and 9:16 Reel scripts.
        </p>
        <button onclick="generateCampaign()" style="background:#c5d86d;color:#141513;border:none;padding:14px 28px;border-radius:999px;font-weight:700;font-size:14px;cursor:pointer;">
          ${state.loading ? 'Formatting All 4 Channels...' : "Let's go — Generate 4-Format Campaign Pack"}
        </button>
      </div>
    `;
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return `
    <div>
      <p role="status" style="color:#c5d86d;">${campaignStatus(campaign)}</p>
      <!-- KRUG-005: 1-Click Schedule & Export Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;background:#1a1c19;padding:16px 20px;border-radius:14px;border:1px solid #353933;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <div>
          <span style="font-size:11px;color:#a8c5a0;font-weight:700;">ACTIVE STORY:</span>
          <h3 style="margin:2px 0 0;font-size:18px;">${story?.title || 'Selected Story'}</h3>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <select id="scheduleDaySelect" onchange="window.setScheduleDay(this.value)" style="background:#212320;color:#f4f1ea;border:1px solid #353933;padding:9px 14px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;">
            ${days.map(d => `<option value="${d}" ${(state.selectedScheduleDay===d)?'selected':''}>${d}</option>`).join('')}
          </select>
          <button onclick="window.scheduleAndExport('${activeFmt}', document.getElementById('scheduleDaySelect').value)" style="background:#c5d86d;color:#141513;border:none;padding:10px 18px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">
            📅 Schedule & Export
          </button>
        </div>
      </div>

      <!-- Format Switcher Tabs -->
      <div style="display:flex;gap:8px;margin-bottom:18px;">
        <button onclick="switchFormat('infographic')" style="padding:9px 16px;border-radius:999px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${activeFmt==='infographic'?'#c5d86d':'#2a2d29'};color:${activeFmt==='infographic'?'#141513':'#d5d8d0'};">📊 Infographic (4:5)</button>
        <button onclick="switchFormat('carousel')" style="padding:9px 16px;border-radius:999px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${activeFmt==='carousel'?'#c5d86d':'#2a2d29'};color:${activeFmt==='carousel'?'#141513':'#d5d8d0'};">🗂️ Carousel (4-Slide)</button>
        <button onclick="switchFormat('story')" style="padding:9px 16px;border-radius:999px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${activeFmt==='story'?'#c5d86d':'#2a2d29'};color:${activeFmt==='story'?'#141513':'#d5d8d0'};">📱 IG Story (9:16)</button>
        <button onclick="switchFormat('reel')" style="padding:9px 16px;border-radius:999px;border:none;cursor:pointer;font-weight:700;font-size:13px;background:${activeFmt==='reel'?'#c5d86d':'#2a2d29'};color:${activeFmt==='reel'?'#141513':'#d5d8d0'};">🎬 Reel (9:16)</button>
      </div>

      <!-- KRUG-001: Visual Billboard Previews (Eliminates raw JSON dump!) -->
      <div style="background:#181a17;border:1px solid #353933;border-radius:16px;padding:24px;">
        ${activeFmt === 'infographic' ? renderInfographicPreview(campaign.infographic) : ''}
        ${activeFmt === 'carousel' ? renderCarouselPreview(campaign.carousel) : ''}
        ${activeFmt === 'story' ? renderStoryPreview(campaign.story) : ''}
        ${activeFmt === 'reel' ? renderReelPreview(campaign.reel) : ''}
      </div>
    </div>
  `;
}

function renderInfographicPreview(info) {
  if (!info) return '<div>No Infographic data</div>';
  return `
    <div style="display:grid;grid-template-columns:380px 1fr;gap:24px;align-items:start;">
      <!-- Visual 4:5 Card Mockup -->
      <div style="background:#141513;border:2px solid #a8c5a0;border-radius:16px;padding:24px;min-height:480px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 12px 32px rgba(0,0,0,0.4);">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <span style="background:#a8c5a0;color:#141513;font-weight:800;font-size:11px;padding:3px 8px;border-radius:4px;">${state.brandProfile?.logoText || '💎 THE LIQUIDITY DESK'}</span>
            <span style="color:#a9ada4;font-size:11px;font-weight:600;">INFOGRAPHIC 4:5</span>
          </div>
          <div style="font-size:22px;font-weight:800;line-height:1.2;color:#f4f1ea;margin-bottom:18px;text-transform:uppercase;">
            ${info.headline}
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">
            ${(info.statRows || []).map(row => `
              <div style="background:#212320;border-left:3px solid #c5d86d;padding:10px 12px;border-radius:6px;font-size:13px;line-height:1.4;">
                ${row}
              </div>
            `).join('')}
          </div>
        </div>
        <div style="background:#252824;border:1px solid #353933;border-radius:8px;padding:12px;font-size:12px;color:#d5d8d0;">
          <strong style="color:#c5d86d;">💡 DEAL TAKEAWAY:</strong> ${info.bottomTakeaway}
        </div>
      </div>

      <!-- Inline Editor & Export Controls -->
      <div style="background:#212320;border-radius:14px;padding:20px;border:1px solid #353933;">
        <h4 style="margin:0 0 14px;font-size:15px;color:#c5d86d;">✏️ Inline Editor (Synced for Backprop)</h4>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:700;color:#a9ada4;display:block;margin-bottom:4px;">Headline (Punchy Hook)</label>
          <input type="text" value="${info.headline}" onchange="window.saveInlineEdit('infographic', 'headline', this.value)" style="width:100%;padding:10px;background:#141513;border:1px solid #353933;border-radius:8px;color:#f4f1ea;font-size:14px;font-weight:700;" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:700;color:#a9ada4;display:block;margin-bottom:4px;">Deal Takeaway</label>
          <input type="text" value="${info.bottomTakeaway}" onchange="window.saveInlineEdit('infographic', 'bottomTakeaway', this.value)" style="width:100%;padding:10px;background:#141513;border:1px solid #353933;border-radius:8px;color:#f4f1ea;font-size:13px;" />
        </div>
        <div style="margin-bottom:16px;">
          <label style="font-size:12px;font-weight:700;color:#a9ada4;display:block;margin-bottom:4px;">Instagram Caption & Hashtags</label>
          <textarea rows="3" onchange="window.saveInlineEdit('infographic', 'caption', this.value)" style="width:100%;padding:10px;background:#141513;border:1px solid #353933;border-radius:8px;color:#f4f1ea;font-size:12px;line-height:1.4;">${info.caption}</textarea>
        </div>
        <div style="display:flex;gap:10px;">
          <button onclick="window.exportAsset('infographic')" style="flex:1;background:#c5d86d;color:#141513;border:none;padding:12px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;">
            📤 Export 1080×1350 Card
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderCarouselPreview(carousel) {
  if (!carousel) return '<div>No Carousel data</div>';
  return `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;background:#212320;padding:14px 18px;border-radius:10px;">
        <div>
          <span style="font-size:11px;color:#a8c5a0;font-weight:700;">COVER HOOK:</span>
          <div style="font-size:18px;font-weight:800;color:#f4f1ea;text-transform:uppercase;">${carousel.coverHook}</div>
        </div>
        <button onclick="window.exportAsset('carousel')" style="background:#c5d86d;color:#141513;border:none;padding:10px 18px;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;">
          📤 Export 4-Slide Deck
        </button>
      </div>

      <!-- 4 Visual Slide Cards -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">
        ${(carousel.slides || []).map(s => `
          <div style="background:#141513;border:2px solid #2f332d;border-radius:14px;padding:16px;min-height:280px;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="background:#a8c5a0;color:#141513;font-weight:800;font-size:11px;padding:2px 8px;border-radius:4px;">Slide ${s.slideNumber}</span>
                <span style="font-size:10px;color:#a9ada4;">4:5 SWIPE</span>
              </div>
              <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:#f4f1ea;">${s.title}</div>
              <div style="background:#212320;border-left:2px solid #c5d86d;padding:8px 10px;border-radius:4px;font-size:12px;line-height:1.4;margin-bottom:10px;">
                ${s.bodyMetric}
              </div>
            </div>
            <div style="font-size:11px;color:#a8c5a0;background:#182018;border:1px dashed #354a33;padding:8px;border-radius:6px;">
              👁️ ${s.visualNote}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderStoryPreview(story) {
  if (!story) return '<div>No Story data</div>';
  return `
    <div style="display:grid;grid-template-columns:300px 1fr;gap:28px;align-items:center;">
      <!-- 9:16 Vertical Phone Mockup -->
      <div style="background:#141513;border:3px solid #353933;border-radius:28px;padding:24px 20px;height:520px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 12px 32px rgba(0,0,0,0.5);margin:0 auto;">
        <div>
          <div style="background:#c5d86d;color:#141513;font-weight:800;font-size:13px;text-align:center;border-radius:8px;padding:10px;margin-bottom:24px;text-transform:uppercase;">
            ${story.hookBanner}
          </div>
          <div style="font-size:15px;font-weight:700;text-align:center;color:#f4f1ea;background:#212320;padding:20px;border-radius:14px;border:1px solid #353933;line-height:1.4;">
            ${story.keyStatHighlight}
          </div>
        </div>

        <!-- Interactive Poll Sticker Mockup -->
        <div style="background:#252824;border:2px solid #a8c5a0;border-radius:16px;padding:14px;text-align:center;">
          <div style="font-size:11px;font-weight:800;color:#a8c5a0;margin-bottom:4px;">🗳️ INTERACTIVE POLL</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:10px;">${story.interactiveStickerPrompt}</div>
          <div style="display:flex;gap:8px;">
            <div style="flex:1;background:#141513;padding:8px;border-radius:8px;font-size:12px;font-weight:600;">Equity</div>
            <div style="flex:1;background:#141513;padding:8px;border-radius:8px;font-size:12px;font-weight:600;">Cash</div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div style="background:#212320;border-radius:14px;padding:20px;border:1px solid #353933;">
        <h4 style="margin:0 0 14px;font-size:15px;color:#c5d86d;">📱 Instagram Story 9:16 Asset</h4>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:700;color:#a9ada4;display:block;margin-bottom:4px;">Top Hook Banner</label>
          <input type="text" value="${story.hookBanner}" onchange="window.saveInlineEdit('story', 'hookBanner', this.value)" style="width:100%;padding:10px;background:#141513;border:1px solid #353933;border-radius:8px;color:#f4f1ea;font-size:13px;" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:700;color:#a9ada4;display:block;margin-bottom:4px;">Hero Stat Highlight</label>
          <input type="text" value="${story.keyStatHighlight}" onchange="window.saveInlineEdit('story', 'keyStatHighlight', this.value)" style="width:100%;padding:10px;background:#141513;border:1px solid #353933;border-radius:8px;color:#f4f1ea;font-size:13px;" />
        </div>
        <div style="margin-bottom:18px;">
          <label style="font-size:12px;font-weight:700;color:#a9ada4;display:block;margin-bottom:4px;">Poll Sticker Prompt</label>
          <input type="text" value="${story.interactiveStickerPrompt}" onchange="window.saveInlineEdit('story', 'interactiveStickerPrompt', this.value)" style="width:100%;padding:10px;background:#141513;border:1px solid #353933;border-radius:8px;color:#f4f1ea;font-size:13px;" />
        </div>
        <button onclick="window.exportAsset('story')" style="background:#c5d86d;color:#141513;border:none;padding:12px 20px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;width:100%;">
          📤 Export 1080×1920 Story
        </button>
      </div>
    </div>
  `;
}

function renderReelPreview(reel) {
  if (!reel) return '<div>No Reel data</div>';
  return `
    <div>
      <div style="background:#212320;border-radius:12px;padding:16px 20px;margin-bottom:18px;border-left:4px solid #c5d86d;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span style="font-size:11px;color:#c5d86d;font-weight:800;">🎙️ 0–3s SPOKEN HOOK:</span>
          <div style="font-size:16px;font-weight:700;margin-top:2px;color:#f4f1ea;">"${reel.spokenHook0to3s}"</div>
        </div>
        <button onclick="window.exportAsset('reel')" style="background:#c5d86d;color:#141513;border:none;padding:10px 18px;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;">
          📤 Export Reel Script
        </button>
      </div>

      <!-- 3-Beat Storyboard Table -->
      <table style="width:100%;border-collapse:collapse;background:#141513;border:1px solid #353933;border-radius:10px;overflow:hidden;font-size:13px;">
        <thead>
          <tr style="background:#212320;color:#a8c5a0;text-align:left;">
            <th style="padding:12px;border-bottom:1px solid #353933;width:120px;">Timecode</th>
            <th style="padding:12px;border-bottom:1px solid #353933;">Voiceover Script</th>
            <th style="padding:12px;border-bottom:1px solid #353933;width:160px;">On-Screen Text</th>
            <th style="padding:12px;border-bottom:1px solid #353933;">B-Roll Visual Direction</th>
          </tr>
        </thead>
        <tbody>
          ${(reel.beats || []).map((b, idx) => `
            <tr style="border-bottom:1px solid #2a2d29;">
              <td style="padding:12px;font-family:monospace;color:#c5d86d;font-weight:700;">${b.timecode}</td>
              <td style="padding:12px;color:#f4f1ea;line-height:1.4;">${b.voiceover}</td>
              <td style="padding:12px;"><span style="background:#212320;padding:4px 8px;border-radius:4px;font-weight:700;font-size:11px;">${b.onScreenText}</span></td>
              <td style="padding:12px;color:#a9ada4;font-size:12px;">${b.bRollDirection}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top:16px;background:#212320;padding:12px 18px;border-radius:8px;font-size:13px;">
        <strong style="color:#a8c5a0;">📢 CLOSING CTA:</strong> "${reel.closingCta}"
      </div>
    </div>
  `;
}

function renderAdmin(cg) {
  if (!cg || !state.adminData) return '<div style="padding:32px;">Loading Admin & Context Graph...</div>';
  return `
    <div style="max-width:1420px;margin:0 auto;padding:32px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="margin:0;">Founder Admin: DI Ports, Silent Evals, Backprop JSONL & Context Graph</h2>
        <div style="display:flex;gap:10px;">
          <a href="/api/admin/backprop-jsonl" download="backprop-preferences.jsonl" style="background:#212320;color:#a8c5a0;border:1px solid #a8c5a0;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">⬇️ Download Backprop JSONL</a>
          <button onclick="runBatchJob()" style="background:#c5d86d;color:#141513;border:none;padding:10px 18px;border-radius:999px;font-weight:700;cursor:pointer;">⚡ Run Weekly Batch Draft Job</button>
        </div>
      </div>
      <div style="background:#212320;border:1px solid #2b2e29;border-radius:16px;padding:24px;">
        <h3 style="margin-top:0;">Context Graph & QA Topology (${cg.topologyValidation.valid ? '✅ 100% VALID — ZERO ORPHANS' : '❌ INVALID'})</h3>
        <p style="font-size:13px;color:#a9ada4;">Nodes: ${cg.topologyValidation.stats.nodesCount} | Directed Edges: ${cg.topologyValidation.stats.edgesCount} | Schemas: ${cg.topologyValidation.stats.schemasCount} | Reference & Prior Art Links: ${cg.topologyValidation.stats.referencesCount}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;">
          <div>
            <h4>Prior Art, GCP Docs & Reference Links</h4>
            ${cg.graph.references.map(r => `
              <div style="background:#181a17;padding:10px;border-radius:8px;margin-bottom:8px;font-size:12px;">
                <strong style="color:#c5d86d;">[${r.type}] ${r.title}</strong>
                <div style="color:#a8c5a0;">${r.url || r.artifactPath}</div>
                <div style="color:#a9ada4;margin-top:4px;">${r.summary}</div>
              </div>
            `).join('')}
          </div>
          <div>
            <h4>Directed Graph Edges (Screen → Route → Service → Port → Adapter)</h4>
            ${cg.graph.edges.map(e => `
              <div style="background:#181a17;padding:7px 10px;border-radius:6px;margin-bottom:5px;font-size:12px;font-family:monospace;">
                ${e.from} ──[${e.relation}]──► ${e.to}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

bootstrap();
