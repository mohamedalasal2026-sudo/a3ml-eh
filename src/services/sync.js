/**
 * Ultra-Reliable Peer-to-Peer Real-Time Sync Service
 * Uses ntfy.sh with attachments (free, keyless high-speed file hosting/SSE signaling)
 * to achieve 100% database-less, reliable state sync without CORS or Heroku limits.
 */

import { state } from '../state/store.js';

let sseConnection = null;
let isSyncing = false; // Debounce flag to prevent self-loop

export function addSyncLog(msg, type = 'info') {
  const consoleEl = document.getElementById('sync-console-logs');
  if (!consoleEl) return;

  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  let colorClass = "text-green-400";
  if (type === 'error') colorClass = "text-red-400";
  else if (type === 'warn') colorClass = "text-amber-400";
  else if (type === 'info') colorClass = "text-neutral-300";

  const logLine = document.createElement('div');
  logLine.className = `${colorClass} leading-relaxed`;
  logLine.innerHTML = `<span class="text-neutral-500">[${time}]</span> > ${msg}`;
  
  if (consoleEl.innerText.includes('في انتظار')) {
    consoleEl.innerHTML = '';
  }

  consoleEl.appendChild(logLine);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

export async function pushSyncUpdate() {
  if (!state.syncEnabled || !state.syncCode || isSyncing) return;

  state.lastUpdated = Date.now();
  const payload = {
    username: state.username,
    dailyStatus: state.dailyStatus,
    symptoms: state.symptoms,
    sessionSkippedActions: state.sessionSkippedActions,
    routines: state.routines || [],
    tasks: state.tasks || [],
    pinEnabled: state.pinEnabled || false,
    pinCode: state.pinCode || '',
    lastUpdated: state.lastUpdated
  };

  try {
    addSyncLog("جاري تجهيز حزمة البيانات المحلية للرفع...", "info");
    const signalTopic = `eleven-health-sync-signal-${state.syncCode.toLowerCase()}`;

    // Upload the JSON payload directly as an attachment to ntfy.sh
    const response = await fetch(`https://ntfy.sh/${signalTopic}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        'Filename': `sync_state_${state.syncCode}.json`,
        'X-Title': '11Health State Update',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      addSyncLog("تم إرسال تعديلاتك ومزامنتها بنجاح! 🚀", "success");
    } else {
      throw new Error(`HTTP Status ${response.status}`);
    }
  } catch (err) {
    addSyncLog(`فشل إرسال التحديث: ${err.message}`, "error");
    console.warn("LOG: [sync] Failed to push update:", err);
  }
}

export function initSync() {
  if (!state.syncEnabled || !state.syncCode) return;

  const indicator = document.getElementById('sync-status-indicator');
  const btn = document.getElementById('sync-toggle-btn');

  // Close existing EventSource if active
  if (sseConnection) {
    sseConnection.close();
    sseConnection = null;
  }

  // Update UI to connecting
  if (indicator) {
    indicator.innerText = 'جاري الاتصال...';
    indicator.className = 'text-amber-500 font-bold text-xs font-sans animate-pulse';
  }
  
  addSyncLog(`جاري إنشاء الاتصال الفوري بالقناة: ${state.syncCode}`, "info");

  try {
    const signalTopic = `eleven-health-sync-signal-${state.syncCode.toLowerCase()}`;
    sseConnection = new EventSource(`https://ntfy.sh/${signalTopic}/sse`);

    sseConnection.onopen = () => {
      addSyncLog("تم الربط وتأسيس الاتصال الفوري بنجاح! 🟢", "success");
      if (indicator) {
        indicator.innerText = 'متصل لحظياً ✨';
        indicator.className = 'text-green-600 font-bold text-xs font-sans';
      }
      if (btn) {
        btn.innerText = 'إيقاف';
        btn.className = 'flex-shrink-0 whitespace-nowrap px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-all';
      }
      // Force initial history fetch to sync on first load
      fetchRemoteHistory();
    };

    sseConnection.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.attachment && data.attachment.url) {
          addSyncLog("وصلت إشارة مزامنة جديدة! جاري تحميل البيانات...", "info");
          await fetchAndApplyState(data.attachment.url);
        }
      } catch (e) {
        console.error("LOG: [sync] Error parsing SSE event data:", e);
      }
    };

    sseConnection.onerror = () => {
      addSyncLog("فقدنا الاتصال بالقناة مؤقتاً، جاري المحاولة تلقائياً...", "warn");
      if (indicator) {
        indicator.innerText = 'غير متصل (إعادة محاولة)';
        indicator.className = 'text-neutral-400 font-bold text-xs font-sans animate-pulse';
      }
    };

  } catch (err) {
    addSyncLog(`فشل الربط الأولي: ${err.message}`, "error");
    // Reset sync state to allow user to retry
    state.syncEnabled = false;
    // Update button UI back to initial state
    const btn = document.getElementById('sync-toggle-btn');
    if (btn) {
      btn.innerText = 'ربط ومزامنة';
      btn.className = 'flex-shrink-0 whitespace-nowrap px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all';
    }
    if (indicator) {
      indicator.innerText = 'فشل الاتصال';
      indicator.className = 'text-red-500 font-bold text-xs';
    }
  }
}

async function fetchRemoteHistory() {
  if (isSyncing || !state.syncEnabled) return;
  
  try {
    addSyncLog("جاري فحص السجلات السحابية لأحدث حالة للمزامنة...", "info");
    const signalTopic = `eleven-health-sync-signal-${state.syncCode.toLowerCase()}`;
    const response = await fetch(`https://ntfy.sh/${signalTopic}/json?poll=1`);
    
    if (response.ok) {
      const text = await response.text();
      const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
      
      // Find the last line that contains a valid attachment
      let lastAttachmentUrl = null;
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const entry = JSON.parse(lines[i]);
          if (entry && entry.attachment && entry.attachment.url) {
            lastAttachmentUrl = entry.attachment.url;
            break;
          }
        } catch(e) {}
      }

      if (lastAttachmentUrl) {
        addSyncLog("تم العثور على نسخة سحابية سابقة، جاري تنزيلها...", "info");
        await fetchAndApplyState(lastAttachmentUrl);
      } else {
        addSyncLog("القناة فارغة. لا توجد نسخة سحابية سابقة للتنزيل.", "info");
      }
    }
  } catch (err) {
    addSyncLog("فشل فحص السجلات السحابية السابقة.", "warn");
  }
}

async function fetchAndApplyState(fileUrl) {
  isSyncing = true;
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
    
    const remoteData = await response.json();
    
    if (remoteData && remoteData.lastUpdated !== state.lastUpdated) {
      addSyncLog(`تم العثور على تحديث جديد (${new Date(remoteData.lastUpdated).toLocaleTimeString()})، جاري تطبيق التغييرات...`, "success");

      // Merge remote fields into reactive state
      state.username = remoteData.username;
      state.dailyStatus = remoteData.dailyStatus;
      state.symptoms = remoteData.symptoms;
      state.sessionSkippedActions = remoteData.sessionSkippedActions || [];
      state.routines = remoteData.routines || [];
      state.tasks = remoteData.tasks || [];
      state.pinEnabled = remoteData.pinEnabled || false;
      state.pinCode = remoteData.pinCode || '';
      state.lastUpdated = remoteData.lastUpdated;

      if (window.renderSettingsPinSection) window.renderSettingsPinSection();

      // Save locally
      localStorage.setItem('username', state.username);
      localStorage.setItem('eleven_health_state_v3', JSON.stringify(state));

      // Trigger dynamic reactive updates across the UI
      if (window.updateGreeting) window.updateGreeting();
      if (window.renderDailyStatusForm) window.renderDailyStatusForm();
      if (window.renderSymptomGrid) window.renderSymptomGrid();
      if (window.updateCompletionPercentage) window.updateCompletionPercentage();
      if (window.renderSVGChart) window.renderSVGChart();
      if (window.generateAnalyticsInsight) window.generateAnalyticsInsight();
      if (window.calculateAdvancedCorrelations) window.calculateAdvancedCorrelations();
      
      if (state.activeSymptomId) {
        if (window.renderActionStack) window.renderActionStack();
        if (window.renderSkippedTray) window.renderSkippedTray();
      }
      if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
      if (window.lucide) window.lucide.createIcons();
      
      if (window.showToast) window.showToast("تم تحديث ومزامنة البيانات مع الجهاز الآخر بنجاح! 🔄✨", "success");
    } else {
      addSyncLog("النسخة المحلية مساوية أو أحدث من النسخة السحابية. لم يتم إجراء أي تعديل.", "info");
    }
  } catch (err) {
    addSyncLog(`فشل تنزيل أو معالجة البيانات: ${err.message}`, "error");
  } finally {
    isSyncing = false;
  }
}

export function copySyncLogs() {
  const consoleEl = document.getElementById('sync-console-logs');
  if (!consoleEl) return;
  const text = consoleEl.innerText;
  navigator.clipboard.writeText(text).then(() => {
    if (window.showToast) window.showToast("تم نسخ سجل المزامنة بنجاح! 📋", "success");
  });
}

export function toggleSync() {
  const codeInput = document.getElementById('sync-code-input');
  const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
  if (!code) {
    alert("من فضلك اكتب رمز مزامنة صالح.");
    return;
  }

  if (state.syncEnabled) {
    state.syncEnabled = false;
    
    if (sseConnection) {
      sseConnection.close();
      sseConnection = null;
    }

    const indicator = document.getElementById('sync-status-indicator');
    const btn = document.getElementById('sync-toggle-btn');
    if (indicator) {
      indicator.innerText = 'غير متصل';
      indicator.className = 'text-neutral-400 text-xs font-sans';
    }
    if (btn) {
      btn.innerText = 'ربط ومزامنة';
      btn.className = 'flex-shrink-0 whitespace-nowrap px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all';
    }

    addSyncLog("تم إيقاف المزامنة وإغلاق القناة.", "warn");
    if (window.showToast) {
      window.showToast("تم إيقاف المزامنة اللحظية.", "info");
    }
  } else {
    state.syncCode = code;
    state.syncEnabled = true;
    initSync();
    
    if (window.showToast) {
      window.showToast("تم تشغيل المزامنة اللحظية بنجاح! 🔄", "success");
    }
    
    // Immediately push current local state to start the sync session
    pushSyncUpdate();
  }
}

// Bind to window for HTML events / inline JS compatibility
window.initSync = initSync;
window.toggleSync = toggleSync;
window.pushSyncUpdate = pushSyncUpdate;
window.addSyncLog = addSyncLog;
window.copySyncLogs = copySyncLogs;
