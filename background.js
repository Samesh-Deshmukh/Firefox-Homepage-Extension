const api = globalThis.browser ?? globalThis.chrome;

const FOCUS_RULE_ID_START = 1000;

async function clearFocusRules() {
  if (!api.declarativeNetRequest?.getDynamicRules) return;
  const rules = await api.declarativeNetRequest.getDynamicRules();
  const ids = rules.filter((r) => r.id >= FOCUS_RULE_ID_START).map((r) => r.id);
  if (ids.length) {
    await api.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ids });
  }
}

async function applyFocusMode({ enabled, blockedHosts }) {
  await clearFocusRules();
  if (!enabled || !blockedHosts?.length) return;

  const addRules = blockedHosts.map((host, i) => {
    const clean = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return {
      id: FOCUS_RULE_ID_START + i,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: `||${clean}^`,
        resourceTypes: ['main_frame'],
      },
    };
  });

  await api.declarativeNetRequest.updateDynamicRules({ addRules });
}

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'focusMode') {
    applyFocusMode(message.payload).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === 'fetchUrl' && message.payload?.url) {
    fetch(message.payload.url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => sendResponse({ text }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
  return false;
});
