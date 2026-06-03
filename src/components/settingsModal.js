/**
 * Settings, Mappings & System Diagnostics Modal Component
 */

import { state, saveState, getDefaultSymptoms } from '../state/store.js';
import { pushSyncUpdate } from '../services/sync.js';
import { triggerUIRender } from '../state/actions.js';

export function resetSystem() {
  const modal = document.getElementById('reset-confirm-modal');
  const card = document.getElementById('reset-confirm-card');
  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    if (window.pushModalHistory) window.pushModalHistory();

    // Update Sync info dynamically on open
    const codeDisplay = document.getElementById('sync-code-display');
    if (codeDisplay) {
      codeDisplay.innerText = state.syncCode || '';
    }

    const codeInput = document.getElementById('sync-code-input');
    if (codeInput && !codeInput.value) {
      codeInput.value = state.syncCode || '';
    }

    const indicator = document.getElementById('sync-status-indicator');
    const btn = document.getElementById('sync-toggle-btn');
    if (indicator && btn) {
      if (state.syncEnabled) {
        indicator.innerText = 'متصل لحظياً ✨';
        indicator.className = 'text-green-600 font-bold text-xs font-sans';
        btn.innerText = 'إيقاف';
        btn.className = 'flex-shrink-0 whitespace-nowrap px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-all';
        if (window.addSyncLog) {
          window.addSyncLog("نظام المزامنة والربط نشط بالفعل ومستعد للإرسال والاستقبال. 🟢", "success");
        }
      } else {
        indicator.innerText = 'غير متصل';
        indicator.className = 'text-neutral-400 font-bold text-xs font-sans';
        btn.innerText = 'ربط ومزامنة';
        btn.className = 'flex-shrink-0 whitespace-nowrap px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all';
      }
    }

    // Close danger zone accordion by default
    const dangerContent = document.getElementById('settings-danger-content');
    const dangerChevron = document.getElementById('settings-danger-chevron');
    if (dangerContent) dangerContent.classList.add('hidden');
    if (dangerChevron) dangerChevron.style.transform = 'rotate(0deg)';

    if (window.lucide) window.lucide.createIcons();
    if (window.renderSettingsPinSection) window.renderSettingsPinSection();

    // Update PWA Install Section based on prompt presence & device type
    const pwaSection = document.getElementById('settings-pwa-section');
    if (pwaSection) {
      pwaSection.classList.remove('hidden');

      const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
      
      const installBtn = document.getElementById('pwa-install-btn');
      const iosTip = document.getElementById('pwa-ios-tip');
      const pwaStatusMsg = document.getElementById('pwa-status-msg');

      if (isStandalone) {
        if (installBtn) installBtn.classList.add('hidden');
        if (iosTip) iosTip.classList.add('hidden');
        if (pwaStatusMsg) {
          pwaStatusMsg.innerHTML = `
            <div class="bg-green-50 border border-green-200 text-green-800 rounded-xl p-3.5 text-center text-xs font-bold font-sans">
              تم تثبيت التطبيق بنجاح وهو يعمل الآن كمنصة مستقلة! 🟢✨
            </div>
          `;
          pwaStatusMsg.classList.remove('hidden');
        }
      } else if (window.deferredPrompt) {
        if (installBtn) installBtn.classList.remove('hidden');
        if (iosTip) iosTip.classList.add('hidden');
        if (pwaStatusMsg) pwaStatusMsg.classList.add('hidden');
      } else if (isiOS) {
        if (installBtn) installBtn.classList.add('hidden');
        if (iosTip) iosTip.classList.remove('hidden');
        if (pwaStatusMsg) pwaStatusMsg.classList.add('hidden');
      } else {
        if (installBtn) installBtn.classList.add('hidden');
        if (iosTip) iosTip.classList.add('hidden');
        if (pwaStatusMsg) {
          pwaStatusMsg.innerHTML = `
            <div class="bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-xl p-3 text-right text-[10px] leading-relaxed font-sans">
              التثبيت متاح من قائمة المتصفح: 
              <br>
              اضغط على النقاط الثلاث <span class="font-bold">⋮</span> في أعلى المتصفح ثم اختر <span class="font-bold">"تثبيت التطبيق"</span> (Install App).
            </div>
          `;
          pwaStatusMsg.classList.remove('hidden');
        }
      }
    }
  }
}

export function closeResetModal() {
  const modal = document.getElementById('reset-confirm-modal');
  const card = document.getElementById('reset-confirm-card');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.add('scale-95');
    card.classList.remove('scale-100');
  }
  if (window.popModalHistory) window.popModalHistory();
}

export function toggleSettingsDangerZone() {
  const content = document.getElementById('settings-danger-content');
  const chevron = document.getElementById('settings-danger-chevron');
  if (content && chevron) {
    content.classList.toggle('hidden');
    if (content.classList.contains('hidden')) {
      chevron.style.transform = 'rotate(0deg)';
    } else {
      chevron.style.transform = 'rotate(180deg)';
    }
  }
}

export function confirmResetAllFeelings() {
  state.symptoms = [];
  closeResetModal();
  if (window.showDashboard) window.showDashboard();
  if (window.renderSymptomGrid) window.renderSymptomGrid();
  saveState(true);
  pushSyncUpdate();
  if (window.showToast) window.showToast("تم مسح جميع المشاعر بالكامل! 🗑️", "success");
}

export function confirmResetAllTherapeuticActions() {
  state.symptoms.forEach(s => {
    s.actions = { near: [], mid: [], long: [] };
  });
  closeResetModal();
  if (state.activeSymptomId) {
    if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
    if (window.renderActionStack) window.renderActionStack();
    if (window.renderSkippedTray) window.renderSkippedTray();
    
    const allActionsContainer = document.getElementById('all-actions-list-container');
    if (allActionsContainer && !allActionsContainer.classList.contains('hidden')) {
      if (window.renderAllActionsList) window.renderAllActionsList();
    }
  }
  if (window.renderSymptomGrid) window.renderSymptomGrid();
  saveState(true);
  pushSyncUpdate();
  if (window.showToast) window.showToast("تم تصفير جميع خطوات العلاج للمشاعر! 🗑️", "success");
}

export function confirmResetDailyLogs() {
  state.dailyStatus.sleepHours = 7.5;
  state.dailyStatus.overallMood = 3;
  state.dailyStatus.dayDescription = '';
  state.dailyStatus.checklist = { hydration: 'unset', meals: 'unset', meds: 'unset' };
  state.dailyStatus.checklistReasons = {};
  
  if (state.dailyStatus.tasks) {
    state.dailyStatus.tasks.forEach(t => {
      t.status = 'unset';
      t.completed = false;
      t.reason = '';
    });
  }
  if (state.dailyStatus.customMetrics) {
    state.dailyStatus.customMetrics.forEach(m => {
      m.value = m.type === 'binary' ? 'unset' : 0;
      m.reason = '';
    });
  }
  closeResetModal();
  triggerUIRender();
  pushSyncUpdate();
  saveState(true);
  if (window.showToast) window.showToast("تم تصفير عادات ومهام اليوم بالكامل! 🧹", "success");
}

export function confirmDeleteAllData() {
  if (!confirm("تحذير: هل أنت متأكد من حذف كل البيانات والمشاريع نهائياً؟ (لن يتم استعادة البيانات الافتراضية)")) {
    return;
  }
  closeResetModal();
  localStorage.clear();
  
  state.username = '';
  state.syncEnabled = false;
  state.syncCode = '11H-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  state.dailyStatus.sleepHours = 7.5;
  state.dailyStatus.overallMood = 3;
  state.dailyStatus.dayDescription = '';
  state.dailyStatus.checklist = {};
  state.dailyStatus.checklistReasons = {};
  state.dailyStatus.tasks = [];
  state.dailyStatus.tags = [];
  state.dailyStatus.customMetrics = [];
  state.sessionSkippedActions = [];
  state.activeSymptomId = null;
  state.categories = [];
  state.activeCategoryFilter = 'all';
  state.ratingsHistory = [];
  state.dailyHistory = [];
  state.symptoms = [];
  state.routines = [];
  state.tasks = [];

  // Display onboarding screen
  const onboarding = document.getElementById('onboarding-screen');
  if (onboarding) {
    document.getElementById('onboarding-name-input').value = '';
    onboarding.classList.remove('hidden', 'opacity-0');
  }

  if (window.showDashboard) window.showDashboard();
  triggerUIRender();
  if (window.renderCategoryFilterBar) window.renderCategoryFilterBar();
  if (window.renderSymptomGrid) window.renderSymptomGrid();

  if (window.showToast) window.showToast("تم حذف جميع البيانات والمشاريع نهائياً! 💣", "error");
}

export function confirmResetSystem() {
  closeResetModal();
  localStorage.clear();
  
  state.username = '';
  state.syncEnabled = false;
  state.syncCode = '11H-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  state.dailyStatus.sleepHours = 7.5;
  state.dailyStatus.overallMood = 3;
  state.dailyStatus.dayDescription = '';
  state.dailyStatus.checklist = { hydration: 'unset', meals: 'unset', meds: 'unset' };
  state.dailyStatus.checklistReasons = {};
  state.dailyStatus.tasks = [
    { id: 'task-1', label: 'شغل وتركيز وإنتاجية بضمير', status: 'unset', reason: '', completed: false, category: 'الشغل' },
    { id: 'task-2', label: 'حركة ورياضة وفك جسم', status: 'unset', reason: '', completed: false, category: 'الصحة' },
    { id: 'task-3', label: 'روقت الأوضة ومكان قعدتي', status: 'unset', reason: '', completed: false, category: 'عام' }
  ];
  state.dailyStatus.tags = [];
  state.dailyStatus.customMetrics = [
    { id: 'custom-reading', label: 'قراءة وتغذية فكرية (30 دقيقة)', type: 'binary', value: 'unset', reason: '', category: 'الروحانيات' },
    { id: 'custom-screentime', label: 'ساعات استخدام السوشيال ميديا', type: 'numeric', value: 3, min: 0, max: 12, step: 0.5, category: 'الترفيه' }
  ];
  state.sessionSkippedActions = [];
  state.activeSymptomId = null;
  state.categories = ['الشغل', 'الصحة', 'العلاقات', 'الروحانيات', 'الترفيه'];
  state.activeCategoryFilter = 'all';
  state.ratingsHistory = [];
  state.dailyHistory = [];
  state.symptoms = getDefaultSymptoms();
  state.routines = [];
  state.tasks = [];

  // Show onboarding screen
  const onboarding = document.getElementById('onboarding-screen');
  if (onboarding) {
    document.getElementById('onboarding-name-input').value = '';
    onboarding.classList.remove('hidden', 'opacity-0');
  }

  if (window.showDashboard) window.showDashboard();
  triggerUIRender();
  if (window.renderCategoryFilterBar) window.renderCategoryFilterBar();
  if (window.renderSymptomGrid) window.renderSymptomGrid();

  if (window.showToast) window.showToast("تم تصفير النظام بالكامل وبدأنا من جديد! 💾", "success");
}

// Bind to window for HTML events / inline JS compatibility
window.resetSystem = resetSystem;
window.closeResetModal = closeResetModal;
window.toggleSettingsDangerZone = toggleSettingsDangerZone;
window.confirmResetAllFeelings = confirmResetAllFeelings;
window.confirmResetAllTherapeuticActions = confirmResetAllTherapeuticActions;
window.confirmResetDailyLogs = confirmResetDailyLogs;
window.confirmDeleteAllData = confirmDeleteAllData;
window.confirmResetSystem = confirmResetSystem;

// --- PIN Locks & Keys Management ---
window.currentEnteredPin = '';
window.settingPinStep = 'none';

export function renderSettingsPinSection() {
  const container = document.getElementById('settings-pin-container');
  if (!container) return;

  const step = window.settingPinStep || 'none';

  if (state.pinEnabled && state.pinCode) {
    if (step === 'enter_to_disable') {
      container.innerHTML = `
        <div class="bg-white border border-neutral-200/60 rounded-xl p-4 text-right space-y-3">
          <span class="text-xs font-bold text-neutral-900 block text-red-600">أدخل رمز PIN الحالي لتعطيل القفل:</span>
          <div class="flex gap-2">
            <input type="password" id="disable-pin-input" placeholder="الرمز الحالي (6 أرقام)..." maxlength="6" inputmode="numeric"
              class="w-full px-3 py-2 text-center text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans font-bold">
            <button onclick="submitDisablePin()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all select-none flex-shrink-0">
              تعطيل
            </button>
            <button onclick="cancelSettingPin()" class="px-3 py-2 bg-neutral-100 text-neutral-500 hover:text-black text-xs font-bold rounded-xl transition-all select-none flex-shrink-0">
              إلغاء
            </button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center justify-between bg-white border border-neutral-200/60 rounded-xl p-3.5">
          <div class="text-right">
            <span class="text-xs font-bold text-neutral-900 block">قفل الحماية نشط حالياً 🔒</span>
            <span class="text-[10px] text-neutral-400 font-sans">مفعل برمز PIN مكون من 6 أرقام</span>
          </div>
          <button onclick="disablePinOption()" class="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg transition-colors select-none">
            تعطيل القفل
          </button>
        </div>
      `;
    }
  } else {
    if (step === 'enter_new') {
      container.innerHTML = `
        <div class="bg-white border border-neutral-200/60 rounded-xl p-4 text-right space-y-3">
          <span class="text-xs font-bold text-neutral-900 block">اختر رمز PIN جديد لحماية خصوصيتك (6 أرقام):</span>
          <div class="flex gap-2">
            <input type="password" id="new-pin-input" placeholder="رمز PIN الجديد..." maxlength="6" inputmode="numeric"
              class="w-full px-3 py-2 text-center text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans font-bold">
            <button onclick="submitNewPin()" class="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all select-none flex-shrink-0">
              تفعيل القفل
            </button>
            <button onclick="cancelSettingPin()" class="px-3 py-2 bg-neutral-100 text-neutral-500 hover:text-black text-xs font-bold rounded-xl transition-all select-none flex-shrink-0">
              إلغاء
            </button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button onclick="startSettingPin()" class="w-full p-3 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl transition-all text-xs font-bold flex items-center justify-between group">
          <span class="flex items-center gap-2.5">
            <span class="w-8 h-8 bg-neutral-100 group-hover:bg-black group-hover:text-white rounded-lg flex items-center justify-center transition-all duration-200">
              <i class="ti ti-shield-lock text-sm"></i>
            </span>
            <span class="text-right">
              <span class="block text-neutral-900">تفعيل قفل الأمان (PIN)</span>
              <span class="block text-[9px] font-normal text-neutral-400">وضع كلمة مرور 6 أرقام لحماية التطبيق عند البدء</span>
            </span>
          </span>
          <i class="ti ti-chevron-left text-xs text-neutral-300 group-hover:text-black transition-colors"></i>
        </button>
      `;
    }
  }
}
window.renderSettingsPinSection = renderSettingsPinSection;

export function startSettingPin() {
  window.settingPinStep = 'enter_new';
  renderSettingsPinSection();
}
window.startSettingPin = startSettingPin;

export function cancelSettingPin() {
  window.settingPinStep = 'none';
  renderSettingsPinSection();
}
window.cancelSettingPin = cancelSettingPin;

export function submitNewPin() {
  const pinInput = document.getElementById('new-pin-input');
  const val = pinInput ? pinInput.value.trim() : '';

  if (val.length !== 6 || isNaN(val)) {
    if (window.showToast) window.showToast("من فضلك أدخل رمز PIN صالح مكون من 6 أرقام فقط! ⚠️", "error");
    return;
  }

  state.pinCode = val;
  state.pinEnabled = true;
  window.settingPinStep = 'none';
  
  saveState(true);
  pushSyncUpdate();
  renderSettingsPinSection();

  if (window.showToast) window.showToast("تم تفعيل قفل الحماية (PIN) بنجاح! 🔒", "success");
}
window.submitNewPin = submitNewPin;

export function disablePinOption() {
  window.settingPinStep = 'enter_to_disable';
  renderSettingsPinSection();
}
window.disablePinOption = disablePinOption;

export function submitDisablePin() {
  const pinInput = document.getElementById('disable-pin-input');
  const val = pinInput ? pinInput.value.trim() : '';

  if (val !== state.pinCode) {
    if (window.showToast) window.showToast("رمز PIN غير صحيح! لا يمكن تعطيل القفل. ❌", "error");
    return;
  }

  state.pinCode = '';
  state.pinEnabled = false;
  window.settingPinStep = 'none';

  saveState(true);
  pushSyncUpdate();
  renderSettingsPinSection();

  if (window.showToast) window.showToast("تم تعطيل قفل الحماية بنجاح.", "success");
}
window.submitDisablePin = submitDisablePin;

export function updatePinDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, idx) => {
    if (idx < window.currentEnteredPin.length) {
      dot.className = "w-4 h-4 rounded-full bg-black border-2 border-black transition-all duration-200 pin-dot scale-110 shadow-sm";
    } else {
      dot.className = "w-4 h-4 rounded-full border-2 border-neutral-300 transition-all duration-200 pin-dot";
    }
  });
}
window.updatePinDots = updatePinDots;

export function handlePinInput(val) {
  if (!state.pinEnabled || !state.pinCode) {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) lockScreen.classList.add('hidden');
    return;
  }

  if (val === 'C') {
    window.currentEnteredPin = '';
  } else if (val === 'delete') {
    window.currentEnteredPin = window.currentEnteredPin.slice(0, -1);
  } else {
    if (window.currentEnteredPin.length < 6) {
      window.currentEnteredPin += val;
    }
  }

  updatePinDots();

  if (window.currentEnteredPin.length === 6) {
    if (window.currentEnteredPin === state.pinCode) {
      const lockScreen = document.getElementById('lock-screen');
      if (lockScreen) {
        lockScreen.classList.remove('opacity-100');
        lockScreen.classList.add('opacity-0');
        setTimeout(() => lockScreen.classList.add('hidden'), 500);
      }
      window.currentEnteredPin = '';
      if (window.showToast) window.showToast("أهلاً بك مجدداً، تم فتح قفل الحماية بنجاح! 🔓✨", "success");
    } else {
      window.currentEnteredPin = '';
      const lockCard = document.getElementById('lock-screen');
      if (lockCard) {
        lockCard.classList.add('animate-shake');
        setTimeout(() => lockCard.classList.remove('animate-shake'), 500);
      }
      setTimeout(() => updatePinDots(), 100);
      if (window.showToast) window.showToast("رمز PIN خاطئ! أعد المحاولة. ❌", "error");
    }
  }
}
window.handlePinInput = handlePinInput;

// Physical Keyboard event listener
window.addEventListener('keydown', (e) => {
  const lockScreen = document.getElementById('lock-screen');
  if (lockScreen && !lockScreen.classList.contains('hidden') && state.pinEnabled) {
    if (e.key >= '0' && e.key <= '9') {
      handlePinInput(e.key);
    } else if (e.key === 'Backspace') {
      handlePinInput('delete');
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
      handlePinInput('C');
    }
  }
});

// PWA Install helper function
export function triggerPwaInstall() {
  const promptEvent = window.deferredPrompt;
  if (!promptEvent) return;
  
  promptEvent.prompt();
  promptEvent.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      if (window.showToast) window.showToast("تم تثبيت التطبيق بنجاح! 🎉", "success");
    } else {
      console.log('User dismissed the install prompt');
    }
    window.deferredPrompt = null;
    const pwaSection = document.getElementById('settings-pwa-section');
    if (pwaSection) {
      pwaSection.classList.add('hidden');
    }
  });
}
window.triggerPwaInstall = triggerPwaInstall;

