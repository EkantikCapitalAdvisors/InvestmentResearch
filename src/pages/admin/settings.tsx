import { Hono } from 'hono'
import { Layout } from '../../components/layout'

type Bindings = { DB: D1Database }

const settingsRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================================
// SETTINGS
// ============================================================
settingsRoutes.get('/settings', (c) => {
  return c.render(
    <Layout active="settings">
      <div class="fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-white">System <span class="text-ekantik-gold italic">Settings</span></h1>
          <p class="text-gray-400 text-sm mt-1">Platform configuration and scheduled job management</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Slack Integration ── */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4"><i class="fab fa-slack mr-2 text-ekantik-gold"></i>Slack Integration</h3>
            <div id="slack-config-container">
              <div class="text-center py-4 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading Slack configuration...</div>
            </div>
          </div>

          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-sliders-h mr-2 text-ekantik-gold"></i>Portfolio Configuration</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between py-2 border-b border-ekantik-border">
                <span class="text-gray-400 text-sm">Market Mode</span>
                <span class="px-3 py-1 bg-ekantik-green/20 text-ekantik-green rounded-full text-xs font-semibold">BULL</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-ekantik-border">
                <span class="text-gray-400 text-sm">Portfolio Equity</span>
                <span class="text-white font-semibold">$100,000</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-ekantik-border">
                <span class="text-gray-400 text-sm">Heat Ceiling</span>
                <span class="text-white font-semibold">20%</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-ekantik-border">
                <span class="text-gray-400 text-sm">Stocks/LEAPS Risk Cap</span>
                <span class="text-white font-semibold">14%</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-400 text-sm">Options Risk Cap</span>
                <span class="text-white font-semibold">6%</span>
              </div>
            </div>
          </div>
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-clock mr-2 text-ekantik-gold"></i>Scheduled Jobs</h3>
            <div class="space-y-3">
              {[
                { name: 'Daily Macro Scan', cron: 'Mon-Fri 7:00 AM CT', status: 'active' },
                { name: 'Daily Trigger Check', cron: 'Mon-Fri 6:00 PM CT', status: 'active' },
                { name: 'Saturday Weekly Research', cron: 'Sat 9:00 AM CT', status: 'active' },
                { name: 'Earnings Intensification', cron: 'Every 4hrs (earnings week)', status: 'standby' },
                { name: 'Quarterly AOMG Scan', cron: '1st Sat of Q start', status: 'active' },
                { name: 'Monthly Meta-Review', cron: 'Last Sunday of month', status: 'active' },
              ].map(job => (
                <div class="flex items-center justify-between py-2 border-b border-ekantik-border last:border-0">
                  <div>
                    <div class="text-white text-sm font-medium">{job.name}</div>
                    <div class="text-gray-500 text-xs">{job.cron}</div>
                  </div>
                  <span class={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    job.status === 'active' ? 'bg-ekantik-green/20 text-ekantik-green' : 'bg-gray-700 text-gray-400'
                  }`}>{job.status}</span>
                </div>
              ))}
            </div>
          </div>
          {/* ── Daily Digest ── */}
          <div class="bg-ekantik-card border border-ekantik-border rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-newspaper mr-2 text-ekantik-gold"></i>Daily Digest</h3>
            <p class="text-gray-400 text-sm mb-4">Post a summary of today's research, P&L movers, and portfolio snapshot to Slack.</p>
            <button onclick="sendDailyDigest(this)" class="px-5 py-2.5 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-bold hover:bg-ekantik-gold-light transition-colors flex items-center gap-2">
              <i class="fas fa-paper-plane"></i> Send Daily Digest Now
            </button>
            <div id="digest-status" class="mt-3 text-xs text-gray-500"></div>
          </div>
        </div>
        <div class="mt-6 bg-ekantik-card border border-ekantik-border rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4"><i class="fas fa-plug mr-2 text-ekantik-gold"></i>Integration Status</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="integration-grid">
            {[
              { name: 'Claude API', icon: 'fas fa-brain', status: 'Configure', color: 'amber' },
              { name: 'Slack Bot', icon: 'fab fa-slack', status: 'Configure', color: 'amber' },
              { name: 'Alpha Vantage', icon: 'fas fa-chart-area', status: 'Configure', color: 'amber' },
              { name: 'Finnhub', icon: 'fas fa-rss', status: 'Configure', color: 'amber' },
            ].map(svc => (
              <div class="bg-ekantik-bg rounded-lg p-4 border border-ekantik-border">
                <div class="flex items-center gap-3">
                  <i class={`${svc.icon} text-ekantik-${svc.color}`}></i>
                  <div>
                    <div class="text-white text-sm font-medium">{svc.name}</div>
                    <div class={`text-ekantik-${svc.color} text-xs`}>{svc.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
    </Layout>,
    { title: 'Settings — Ekantik Capital' }
  )
})


const settingsScript = `
let _slackChannels = [];
let _slackConfig = {};

(async () => {
  try {
    const configRes = await fetch('/api/slack/config');
    _slackConfig = await configRes.json();
    renderSlackConfig();
  } catch(e) { 
    document.getElementById('slack-config-container').innerHTML = '<div class="text-red-400 text-sm">Failed to load Slack config: ' + e.message + '</div>'; 
  }

  // Update integration status based on slack config
  try {
    var diagHeaders = {};
    var storedCode = getStoredPasscode();
    if (storedCode) diagHeaders['X-Research-Passcode'] = storedCode;
    const diagRes = await fetch('/api/diag/claude', { headers: diagHeaders });
    const diag = await diagRes.json();
    if (diag.code === 'PASSCODE_REQUIRED' || diag.code === 'PASSCODE_INVALID') {
      updateIntegrationStatus('Claude API', 'Passcode Required', 'amber');
    } else {
      updateIntegrationStatus('Claude API', diag.ok ? 'Connected' : 'Error', diag.ok ? 'green' : 'red');
    }
  } catch(e) {}
  if (_slackConfig.botConfigured) {
    updateIntegrationStatus('Slack Bot', _slackConfig.channelId ? 'Connected' : 'Configured', _slackConfig.channelId ? 'green' : 'amber');
  }
})();

function updateIntegrationStatus(name, status, color) {
  const grid = document.getElementById('integration-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.bg-ekantik-bg');
  for (const card of cards) {
    if (card.textContent.includes(name)) {
      const statusEl = card.querySelector('div > div:last-child > div:last-child');
      if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = 'text-ekantik-' + color + ' text-xs';
      }
    }
  }
}

function renderSlackConfig() {
  const container = document.getElementById('slack-config-container');
  if (!_slackConfig.botConfigured) {
    container.innerHTML = 
      '<div class="bg-ekantik-bg border border-ekantik-border rounded-lg p-4">' +
        '<div class="flex items-center gap-3 mb-2">' +
          '<i class="fas fa-exclamation-triangle text-ekantik-amber"></i>' +
          '<span class="text-white text-sm font-semibold">Slack Bot Token Not Set</span>' +
        '</div>' +
        '<p class="text-gray-400 text-xs">Set <code class="bg-ekantik-surface px-1 rounded">SLACK_BOT_TOKEN</code> in Cloudflare Pages secrets to enable Portal → Slack integration.</p>' +
        '<p class="text-gray-500 text-xs mt-2">Required scopes: <code class="bg-ekantik-surface px-1 rounded">chat:write</code>, <code class="bg-ekantik-surface px-1 rounded">channels:read</code></p>' +
      '</div>';
    return;
  }

  const channelInfo = _slackConfig.channelId
    ? '<span class="text-ekantik-green text-xs font-semibold"><i class="fas fa-check-circle mr-1"></i>#' + (_slackConfig.channelName || _slackConfig.channelId) + '</span>'
    : '<span class="text-gray-500 text-xs">Not configured</span>';

  container.innerHTML = 
    '<div class="space-y-4">' +
      // Current channel
      '<div class="flex items-center justify-between py-2 border-b border-ekantik-border">' +
        '<span class="text-gray-400 text-sm">Posting Channel</span>' +
        channelInfo +
      '</div>' +
      // Auto-post toggle
      '<div class="flex items-center justify-between py-2 border-b border-ekantik-border">' +
        '<div>' +
          '<span class="text-gray-400 text-sm">Auto-post portal research</span>' +
          '<div class="text-gray-500 text-xs">Automatically post all portal research results to Slack</div>' +
        '</div>' +
        '<button onclick="toggleAutoPost(this)" class="px-3 py-1 rounded-full text-xs font-semibold transition-colors ' +
          (_slackConfig.autoPost ? 'bg-ekantik-green/20 text-ekantik-green' : 'bg-gray-700 text-gray-400') + '">' +
          (_slackConfig.autoPost ? 'ENABLED' : 'DISABLED') +
        '</button>' +
      '</div>' +
      // Channel picker
      '<div>' +
        '<label class="text-xs text-gray-400 uppercase tracking-wider block mb-2">Slack Channel</label>' +
        '<div class="flex gap-2">' +
          '<div class="flex-1">' +
            '<select id="slack-channel-select" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50 hidden">' +
              '<option value="">Loading channels...</option>' +
            '</select>' +
            '<input id="slack-channel-input" type="text" placeholder="Channel ID (e.g. C0AH7FWP2JU)" value="' + (_slackConfig.channelId || '') + '" class="w-full bg-ekantik-bg border border-ekantik-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-ekantik-gold/50" />' +
          '</div>' +
          '<button onclick="saveSlackChannel()" class="px-4 py-2 bg-ekantik-gold text-ekantik-bg rounded-lg text-sm font-semibold hover:bg-ekantik-gold-light">Save</button>' +
        '</div>' +
        '<p class="text-gray-500 text-[10px] mt-1.5">Find channel ID: open Slack channel → click channel name in header → scroll to bottom of popup</p>' +
        '<div id="slack-save-status" class="mt-2 text-xs text-gray-500"></div>' +
      '</div>' +
      // Test message
      '<div class="pt-2">' +
        '<button onclick="testSlackPost(this)" class="px-4 py-2 bg-ekantik-surface border border-ekantik-border rounded-lg text-sm text-gray-300 hover:border-ekantik-gold/50 flex items-center gap-2">' +
          '<i class="fab fa-slack"></i> Send Test Message' +
        '</button>' +
      '</div>' +
    '</div>';

  loadChannels();
}

async function loadChannels() {
  const select = document.getElementById('slack-channel-select');
  const input = document.getElementById('slack-channel-input');
  try {
    const res = await fetch('/api/slack/channels');
    const data = await res.json();
    if (data.ok && data.channels && data.channels.length > 0) {
      _slackChannels = data.channels.filter(ch => ch.is_member);
      if (_slackChannels.length > 0) {
        // Show dropdown, hide input
        select.classList.remove('hidden');
        input.classList.add('hidden');
        select.innerHTML = '<option value="">— Select a channel —</option>' +
          _slackChannels.map(ch => 
            '<option value="' + ch.id + '"' + (ch.id === _slackConfig.channelId ? ' selected' : '') + '>' +
              (ch.is_private ? ':lock: ' : '#') + ch.name + ' (' + ch.num_members + ' members)' +
            '</option>'
          ).join('');
        return;
      }
    }
    // Fallback: keep manual input visible
  } catch(e) {
    // Fallback: keep manual input visible
  }
}

async function saveSlackChannel() {
  const select = document.getElementById('slack-channel-select');
  const input = document.getElementById('slack-channel-input');
  // Use dropdown if visible, otherwise use text input
  const channelId = !select.classList.contains('hidden') ? select.value : input.value.trim();
  if (!channelId) { alert('Enter a channel ID'); return; }

  const channel = _slackChannels.find(ch => ch.id === channelId);
  const channelName = channel ? channel.name : channelId;

  const status = document.getElementById('slack-save-status');
  status.textContent = 'Saving...';

  try {
    const res = await fetch('/api/slack/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, channelName, autoPost: _slackConfig.autoPost })
    });
    const data = await res.json();
    if (data.success) {
      _slackConfig.channelId = channelId;
      _slackConfig.channelName = channelName;
      status.innerHTML = '<span class="text-ekantik-green"><i class="fas fa-check mr-1"></i>Saved! Channel set to #' + channelName + '</span>';
      renderSlackConfig();
    } else {
      status.innerHTML = '<span class="text-ekantik-red">Error saving</span>';
    }
  } catch(e) {
    status.innerHTML = '<span class="text-ekantik-red">Error: ' + e.message + '</span>';
  }
}

async function toggleAutoPost(btn) {
  const newVal = !_slackConfig.autoPost;
  try {
    const res = await fetch('/api/slack/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoPost: newVal })
    });
    const data = await res.json();
    if (data.success) {
      _slackConfig.autoPost = newVal;
      btn.textContent = newVal ? 'ENABLED' : 'DISABLED';
      btn.className = 'px-3 py-1 rounded-full text-xs font-semibold transition-colors ' +
        (newVal ? 'bg-ekantik-green/20 text-ekantik-green' : 'bg-gray-700 text-gray-400');
    }
  } catch(e) { alert('Error: ' + e.message); }
}

async function testSlackPost(btn) {
  if (!_slackConfig.channelId) { alert('Configure a Slack channel first'); return; }
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  try {
    // Get the latest report and share it
    const feedRes = await fetch('/api/research/feed?limit=1');
    const { reports } = await feedRes.json();
    if (!reports || reports.length === 0) {
      alert('No research reports to share. Run a research first.');
      btn.disabled = false;
      btn.innerHTML = '<i class="fab fa-slack"></i> Send Test Message';
      return;
    }
    const res = await fetch('/api/slack/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: reports[0].id, channelId: _slackConfig.channelId })
    });
    const data = await res.json();
    if (data.success) {
      btn.innerHTML = '<i class="fas fa-check text-ekantik-green"></i> Sent!';
    } else {
      btn.innerHTML = '<i class="fas fa-times text-ekantik-red"></i> ' + (data.error || 'Failed');
    }
  } catch(e) {
    btn.innerHTML = '<i class="fas fa-times text-ekantik-red"></i> Error';
  }
  setTimeout(() => { btn.innerHTML = '<i class="fab fa-slack"></i> Send Test Message'; btn.disabled = false; }, 3000);
}

async function sendDailyDigest(btn) {
  if (!_slackConfig.channelId) {
    alert('Configure a Slack channel in Slack Integration settings first');
    return;
  }
  btn.disabled = true;
  const origHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating digest...';
  const status = document.getElementById('digest-status');
  status.textContent = 'Compiling daily summary...';

  try {
    const res = await fetch('/api/slack/digest', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      status.innerHTML = '<span class="text-ekantik-green"><i class="fas fa-check-circle mr-1"></i>Daily digest sent! ' + data.reportCount + ' reports summarized for ' + data.date + '</span>';
      btn.innerHTML = '<i class="fas fa-check text-ekantik-green mr-2"></i> Digest Sent';
    } else {
      status.innerHTML = '<span class="text-ekantik-red"><i class="fas fa-exclamation-circle mr-1"></i>' + (data.error || 'Failed to send') + '</span>';
      btn.innerHTML = origHtml;
    }
  } catch(e) {
    status.innerHTML = '<span class="text-ekantik-red">Error: ' + e.message + '</span>';
    btn.innerHTML = origHtml;
  }
  btn.disabled = false;
  setTimeout(() => { btn.innerHTML = origHtml; }, 5000);
}
`


export { settingsRoutes }
