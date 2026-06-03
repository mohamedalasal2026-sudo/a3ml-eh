/**
 * Data Portability Service: Export & Import Data
 * Handles full system state backup/restore as JSON files
 */

import { state, saveState, migrateState, getDefaultSymptoms } from '../state/store.js';
import { triggerUIRender } from '../state/actions.js';
import { pushSyncUpdate } from '../services/sync.js';

// ─────────────────────────────────────────────────────────────
// 1. EXPORT ALL DATA
// ─────────────────────────────────────────────────────────────

export function exportAllData() {
  try {
    const exportPayload = {
      _meta: {
        appName: 'أعمل ايه !؟ (Eleven Health)',
        exportDate: new Date().toISOString(),
        dataVersion: 'v3',
        exportTimestamp: Date.now()
      },
      // Core data
      username: state.username,
      syncCode: state.syncCode,
      syncEnabled: state.syncEnabled,
      lastUpdated: state.lastUpdated,

      // Symptoms & Categories
      symptoms: state.symptoms,
      categories: state.categories,

      // Daily Status
      dailyStatus: state.dailyStatus,

      // Tags
      availableTags: state.availableTags,

      // Historical Data
      historicalData: state.historicalData,

      // Ratings & Logs
      ratingsHistory: state.ratingsHistory,
      dailyHistory: state.dailyHistory,
      improvementsLog: state.improvementsLog || [],

      // Navigation & Interaction State
      activePageView: state.activePageView,
      lastCompletedActionId: state.lastCompletedActionId,
      lastCompletedFeelingId: state.lastCompletedFeelingId,
      autoLinkActive: state.autoLinkActive
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `اعمل_ايه_backup_${dateStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);

    if (window.showToast) {
      window.showToast("تم تصدير جميع بياناتك بنجاح كملف JSON! 📦✨", "success");
    }
  } catch (err) {
    console.error("LOG: [exportAllData] Export failed:", err);
    if (window.showToast) {
      window.showToast("حدث خطأ أثناء التصدير. حاول مرة تانية. ⚠️", "error");
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 2. IMPORT DATA FROM FILE
// ─────────────────────────────────────────────────────────────

export function triggerImportFileDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.style.display = 'none';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      if (window.showToast) window.showToast("الملف لازم يكون بصيغة JSON فقط. ⚠️", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        importParsedData(parsed);
      } catch (parseErr) {
        console.error("LOG: [importData] JSON parse error:", parseErr);
        if (window.showToast) window.showToast("الملف تالف أو مش بصيغة JSON صحيحة. ⚠️", "error");
      }
    };
    reader.onerror = () => {
      if (window.showToast) window.showToast("فشل قراءة الملف. حاول تاني. ⚠️", "error");
    };
    reader.readAsText(file);
  });

  document.body.appendChild(input);
  input.click();
  setTimeout(() => document.body.removeChild(input), 5000);
}

function importParsedData(parsed) {
  // Basic validation
  if (!parsed || typeof parsed !== 'object') {
    if (window.showToast) window.showToast("هيكل الملف مش صحيح. تأكد إنه ملف بيانات نظام أعمل ايه!؟ ⚠️", "error");
    return;
  }

  // Check for key indicators that this is a valid export
  const hasSymptoms = Array.isArray(parsed.symptoms);
  const hasDailyStatus = parsed.dailyStatus && typeof parsed.dailyStatus === 'object';
  const hasHistorical = parsed.historicalData && typeof parsed.historicalData === 'object';

  if (!hasSymptoms && !hasDailyStatus && !hasHistorical) {
    if (window.showToast) window.showToast("الملف ده مش ملف بيانات صالح لنظام أعمل ايه!؟ ⚠️", "error");
    return;
  }

  if (!confirm("⚠️ تحذير: استيراد البيانات هيستبدل كل بياناتك الحالية.\n\nمتأكد إنك عايز تكمل؟")) {
    return;
  }

  try {
    // Remove meta fields before merging
    const { _meta, ...dataToImport } = parsed;

    // Run migration for compatibility
    const migrated = migrateState(dataToImport);

    // Apply all data to active state
    Object.keys(migrated).forEach(key => {
      if (key !== 'sessionSkippedActions') {
        state[key] = migrated[key];
      }
    });

    // Reset session-only data
    state.sessionSkippedActions = [];

    // Persist and refresh
    saveState(false);
    pushSyncUpdate();

    // Refresh entire UI
    refreshFullUI();

    if (window.showToast) {
      window.showToast("تم استيراد البيانات بنجاح! كل حاجة اتحملت 🎉", "success");
    }
  } catch (err) {
    console.error("LOG: [importParsedData] Import failed:", err);
    if (window.showToast) window.showToast("حدث خطأ أثناء الاستيراد. ⚠️", "error");
  }
}


// ─────────────────────────────────────────────────────────────
// 4. UI REFRESH HELPER
// ─────────────────────────────────────────────────────────────

function refreshFullUI() {
  // Update greeting
  if (window.updateGreeting) window.updateGreeting();

  // Close settings modal
  if (window.closeResetModal) window.closeResetModal();

  // Show dashboard
  if (window.showDashboard) window.showDashboard();

  // Re-render all components
  triggerUIRender();
  if (window.renderCategoryFilterBar) window.renderCategoryFilterBar();
  if (window.renderSymptomGrid) window.renderSymptomGrid();
  if (window.renderDailyHealthLogger) window.renderDailyHealthLogger();
  if (window.renderSidebarWidgets) window.renderSidebarWidgets();
  if (window.renderSVGChart) window.renderSVGChart();
  if (window.generateAnalyticsInsight) window.generateAnalyticsInsight();
  if (window.calculateAdvancedCorrelations) window.calculateAdvancedCorrelations();
  if (window.renderMobileBottomNav) window.renderMobileBottomNav();
  if (window.lucide) window.lucide.createIcons();
}



// ─────────────────────────────────────────────────────────────
// 6. WINDOW BINDINGS
// ─────────────────────────────────────────────────────────────

window.exportAllData = exportAllData;
window.triggerImportFileDialog = triggerImportFileDialog;
