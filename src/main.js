/**
 * Central Bootstrapper & App Lifecycle Coordinator
 */

import { initializeState, saveState, state } from './state/store.js';
import { renderHeader, updateGreeting } from './components/header.js';
import { renderFeelingsDashboard, renderCategoryFilterBar } from './components/feelings.js';
import { renderDailyHealthLogger } from './components/healthLogger.js';
import { renderSVGChart } from './components/charts.js';
import { showToast } from './components/toast.js';
import { initSync, pushSyncUpdate } from './services/sync.js';
import { generateAnalyticsInsight, calculateAdvancedCorrelations, syncTodayHistory } from './services/analytics.js';
import { initOneSignal } from './services/notifications.js';

// Evaluate modules for side-effects (attaching actions, modals, and helper functions to window)
import './utils/dom.js';
import './utils/icons.js';
import './utils/customPickers.js';
import './state/actions.js';
import './components/modals.js';
import './components/actionStack.js';
import './services/dataPortability.js';

// Import split modular components for side-effects registration
import './components/layout.js';
import './components/navigation.js';
import './components/symptomDetails.js';
import './components/routinesTasks.js';


// --- 1. ONBOARDING SCREEN TRIGGER ---
export function saveOnboardingName(e) {
  try {
    e.preventDefault();
    const input = document.getElementById('onboarding-name-input');
    const name = input ? input.value.trim() : '';

    if (name) {
      try {
        localStorage.setItem('username', name);
      } catch (storageErr) { }

      state.username = name;

      const screen = document.getElementById('onboarding-screen');
      if (screen) {
        screen.classList.add('opacity-0');
        setTimeout(() => screen.classList.add('hidden'), 500);
      }

      updateGreeting();
      saveState(false);
      pushSyncUpdate();
      showToast(`أهلاً بك يا ${name} في نظام اعمل ايه!؟ 🌸`, "info");
    }
  } catch (err) {
    console.error("LOG: [saveOnboardingName] Error:", err);
  }
}

// --- 2. APP BOOTSTRAPPER MOUNT ---
export function mountApp() {
  // 1. Inject skeleton dynamic grid layout
  if (window.injectAppLayout) {
    window.injectAppLayout();
  }

  // 2. Initialize store data
  initializeState();

  // Set boot state to prevent pushing initial view to history
  window.isPopStateNavigation = true;
  window.history.replaceState({
    page: state.activePageView || 'dashboard',
    symptomId: (state.activePageView === 'dashboard') ? state.activeSymptomId : null
  }, "");

  // 2.2. Initialize OneSignal Push Notifications
  initOneSignal();

  // 2.5. PIN Protection Lock Screen Trigger
  if (state.pinEnabled && state.pinCode) {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) {
      lockScreen.classList.remove('hidden');
      setTimeout(() => lockScreen.classList.add('opacity-100'), 50);
      window.currentEnteredPin = '';
      if (window.updatePinDots) window.updatePinDots();
    }
  }

  // 3. Coordinate Onboarding triggers
  const localUser = state.username || localStorage.getItem('username');
  const onboarding = document.getElementById('onboarding-screen');

  if (localUser) {
    state.username = localUser;
    updateGreeting();
    if (onboarding) {
      onboarding.classList.add('hidden', 'opacity-0');
    }
  } else {
    if (onboarding) {
      onboarding.classList.remove('hidden', 'opacity-0');
    }
  }

  // 4. Initialize real-time P2P Gun connections if enabled
  if (state.syncEnabled) {
    initSync();
  }

  // 5. Fire initial rendering sequences
  syncTodayHistory();
  renderDailyHealthLogger();
  renderCategoryFilterBar();
  renderFeelingsDashboard();
  renderHeader();
  renderSVGChart();
  calculateAdvancedCorrelations();

  // Set initial page view based on stored state
  if (state.activePageView === 'dashboard' && state.activeSymptomId) {
    if (window.setViewPage) window.setViewPage('dashboard', true);
    if (window.showSymptomDetail) window.showSymptomDetail(state.activeSymptomId);
  } else {
    if (window.setViewPage) window.setViewPage(state.activePageView || 'dashboard');
  }

  // 6. Lucide icons bindings
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 7. Apply Premium Custom Pickers
  if (window.applyCustomPickers) {
    window.applyCustomPickers(document);
  }

  // Reset boot state
  window.isPopStateNavigation = false;

  // Initialize notification badge count
  if (window.updateHeaderNotificationBadge) {
    window.updateHeaderNotificationBadge();
  }

  showToast("أهلاً بك في نظام اعمل ايه!؟ 🌸", "info");
}

// Global scope coordinator bindings
window.saveOnboardingName = saveOnboardingName;

// Mount Central Bootstrapper on DOM loaded
window.addEventListener('DOMContentLoaded', mountApp);

// --- Progressive Web App (PWA) Integration ---
// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// --- History API routing coordinator for Mobile back button ---
window.isPopStateNavigation = false;
window.bypassPopStateForModalClose = false;
window.isPopStateModalClose = false;

window.pushModalHistory = function() {
  window.history.pushState({ modalOpen: true }, "");
};

window.popModalHistory = function() {
  if (window.history.state && window.history.state.modalOpen) {
    window.bypassPopStateForModalClose = true;
    window.history.back();
  }
};

window.closeAnyOpenModal = function() {
  // Check picker modal
  const pickerModal = document.getElementById('custom-picker-modal');
  if (pickerModal && !pickerModal.classList.contains('pointer-events-none') && !pickerModal.classList.contains('hidden')) {
    const closeBtn = document.getElementById('custom-picker-close-btn');
    if (closeBtn) closeBtn.click();
    else pickerModal.remove();
    return true;
  }

  // Check reset-confirm-modal (Settings Modal)
  const settingsModal = document.getElementById('reset-confirm-modal');
  if (settingsModal && !settingsModal.classList.contains('pointer-events-none') && !settingsModal.classList.contains('hidden')) {
    if (window.closeResetModal) window.closeResetModal();
    return true;
  }

  // Check fab-modal (Add entry Modal)
  const fabModal = document.getElementById('fab-modal');
  if (fabModal && !fabModal.classList.contains('pointer-events-none') && !fabModal.classList.contains('hidden')) {
    if (window.closeFABModal) window.closeFABModal();
    return true;
  }

  // Check edit-item-modal (Edit entry Modal)
  const editModal = document.getElementById('edit-item-modal');
  if (editModal && !editModal.classList.contains('pointer-events-none') && !editModal.classList.contains('hidden')) {
    if (window.closeEditModal) window.closeEditModal();
    return true;
  }

  // Check action-reminder-modal (Reminder Modal)
  const reminderModal = document.getElementById('action-reminder-modal');
  if (reminderModal && !reminderModal.classList.contains('pointer-events-none') && !reminderModal.classList.contains('hidden')) {
    if (window.closeActionReminderModal) window.closeActionReminderModal();
    return true;
  }

  // Check notif-settings-popup-modal (Settings Popup Modal)
  const popupModal = document.getElementById('notif-settings-popup-modal');
  if (popupModal && !popupModal.classList.contains('pointer-events-none') && !popupModal.classList.contains('hidden')) {
    if (window.closeNotificationSettingsPopup) window.closeNotificationSettingsPopup();
    return true;
  }

  // Check header-notif-modal (Header Notifications Modal)
  const headerNotifModal = document.getElementById('header-notif-modal');
  if (headerNotifModal && !headerNotifModal.classList.contains('pointer-events-none') && !headerNotifModal.classList.contains('hidden')) {
    if (window.closeHeaderNotificationsPopup) window.closeHeaderNotificationsPopup();
    return true;
  }

  // Check rating-modal
  const ratingModal = document.getElementById('rating-modal');
  if (ratingModal && !ratingModal.classList.contains('pointer-events-none') && !ratingModal.classList.contains('hidden')) {
    if (window.closeRatingModal) window.closeRatingModal();
    return true;
  }

  // Check treatment-history-modal
  const historyModal = document.getElementById('treatment-history-modal');
  if (historyModal && !historyModal.classList.contains('pointer-events-none') && !historyModal.classList.contains('hidden')) {
    if (window.closeTreatmentHistoryModal) window.closeTreatmentHistoryModal();
    return true;
  }

  return false;
};

window.addEventListener('popstate', (event) => {
  if (window.bypassPopStateForModalClose) {
    window.bypassPopStateForModalClose = false;
    return;
  }

  // 1. Check if there are any open modals and close them
  window.isPopStateModalClose = true;
  const closedSomeModal = window.closeAnyOpenModal && window.closeAnyOpenModal();
  window.isPopStateModalClose = false;
  
  if (closedSomeModal) {
    // A modal was open and we closed it, stay on page
    return;
  }

  // 2. Otherwise navigate to the popped page state
  if (event.state) {
    const { page, symptomId } = event.state;
    window.isPopStateNavigation = true;
    if (page === 'symptom-detail' && symptomId) {
      if (window.showSymptomDetail) window.showSymptomDetail(symptomId);
    } else if (page) {
      if (window.setViewPage) window.setViewPage(page);
    }
    window.isPopStateNavigation = false;
  }
});
