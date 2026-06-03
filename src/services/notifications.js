/**
 * OneSignal Web Push & Scheduled Notification Service
 */

import { state, saveState } from '../state/store.js';

// REST API Credentials
const APP_ID = "d7e6de52-3b7a-404f-b095-996380092c5b";
const API_KEY = "os_v2_app_27tn4ur3pjae7mevtfryacjmlnglhifii3puu7fy5bxaw3mhsqcqa4ixztitltgr6yd5ji7hu23mu45w7u6am35q4yykd2x7pquiy7q";

// Initialize OneSignal SDK
export function initOneSignal() {
  // Check and show permission popup overlay on startup (outside deferred push to run immediately even if SDK blocks/fails)
  try {
    const hasPermission = 'Notification' in window && Notification.permission === 'granted';
    const dismissedBefore = localStorage.getItem('onesignal_permission_prompt_dismissed');

    if (!hasPermission && !dismissedBefore) {
      setTimeout(() => {
        showNotificationPermissionOverlay();
      }, 1500);
    }
  } catch (e) {
    console.warn("Notification permission check on startup failed:", e);
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: APP_ID,
      allowLocalhostAsSecureOrigin: true
    });

    console.log("OneSignal successfully initialized!");

    // Capture Subscription ID
    const isSubscribed = OneSignal.User.PushSubscription.optedIn;
    if (isSubscribed) {
      const subId = OneSignal.User.PushSubscription.id;
      window.onesignalSubscriptionId = subId;
      localStorage.setItem('onesignal_subscription_id', subId);
      console.log("OneSignal Subscribed with ID:", subId);
    }

    // Listen for Subscription Changes
    OneSignal.User.PushSubscription.addEventListener("change", (event) => {
      const current = event.current;
      if (current.id) {
        window.onesignalSubscriptionId = current.id;
        localStorage.setItem('onesignal_subscription_id', current.id);
        console.log("OneSignal Subscription ID Updated:", current.id);
      }
    });

    // After OneSignal has initialized, trigger a sync to schedule notifications for all existing items
    syncAllNotifications();
  });
}

// Custom Notification Permission Prompt Overlay (First-time Entry Popup)
export function showNotificationPermissionOverlay() {
  const modalId = 'notif-permission-overlay-modal';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-[10000] flex items-center justify-center transition-all duration-300 opacity-0 pointer-events-none select-none';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-sm mx-4 p-6 border border-neutral-100 shadow-2xl text-center space-y-5 transform scale-95 transition-all duration-300" id="notif-permission-card">
      <div class="space-y-2">
        <div class="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md animate-wiggle">
          <i class="ti ti-bell-ringing text-2xl"></i>
        </div>
        <h3 class="text-sm font-bold text-neutral-900 uppercase tracking-wider font-sans">تفعيل التنبيهات الخارجية 🔔</h3>
        <p class="text-xs text-neutral-400 font-sans leading-relaxed text-right">
          عشان يوصلك روتينك اليومي، المهام العاجلة، وخطوات العلاج بره البرنامج وتظهرلك دايماً في إشعارات الموبايل الخارجية (System Notifications)، يرجى السماح بتفعيل التنبيهات.
        </p>
      </div>

      <div class="flex flex-col gap-2 pt-2">
        <button type="button" id="notif-allow-btn"
          class="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 font-sans">
          <span>تفعيل الإشعارات الآن ⚡</span>
        </button>
        <button type="button" id="notif-cancel-btn"
          class="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-2xl transition-all">
          ليس الآن
        </button>
      </div>
    </div>
  `;

  const allowBtn = modal.querySelector('#notif-allow-btn');
  const cancelBtn = modal.querySelector('#notif-cancel-btn');

  const closeOverlay = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    const card = document.getElementById('notif-permission-card');
    if (card) {
      card.classList.add('scale-95');
      card.classList.remove('scale-100');
    }
  };

  allowBtn.addEventListener('click', async () => {
    closeOverlay();
    // Use OneSignal push request if loaded, otherwise native fallback
    if (window.OneSignal && window.OneSignal.Notifications) {
      try {
        await window.OneSignal.Notifications.requestPermission();
      } catch (e) {
        console.warn("OneSignal permission request failed, calling native fallback:", e);
        if ('Notification' in window) {
          try {
            await Notification.requestPermission();
          } catch (err) {
            console.warn(err);
          }
        }
      }
    } else if ('Notification' in window) {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn("Native permission request failed:", e);
      }
    }
  });

  cancelBtn.addEventListener('click', () => {
    closeOverlay();
    localStorage.setItem('onesignal_permission_prompt_dismissed', 'true');
  });

  // Open animation
  setTimeout(() => {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    const card = document.getElementById('notif-permission-card');
    if (card) {
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  }, 50);
}
window.showNotificationPermissionOverlay = showNotificationPermissionOverlay;
window.initOneSignal = initOneSignal;

// Schedule a Push Notification via OneSignal REST API
export async function scheduleOneSignalNotification(title, message, date) {
  const subscriptionId = window.onesignalSubscriptionId || localStorage.getItem('onesignal_subscription_id');
  if (!subscriptionId) {
    console.warn("No Push Subscription ID found. Setting up local alert fallback.");
    setupLocalBackupNotification(title, message, date);
    return null;
  }

  // Format date to ISO format
  const sendAfter = date.toISOString();

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${API_KEY}`
      },
      body: JSON.stringify({
        app_id: APP_ID,
        include_subscription_ids: [subscriptionId],
        contents: { en: message, ar: message },
        headings: { en: title, ar: title },
        send_after: sendAfter
      })
    });

    const data = await response.json();
    if (data && data.id) {
      console.log(`Notification scheduled on OneSignal: ${data.id} for ${sendAfter}`);
      return data.id;
    } else {
      console.error("Failed to schedule notification on OneSignal:", data);
      return null;
    }
  } catch (err) {
    console.error("OneSignal API HTTP Call error:", err);
    return null;
  }
}

// Cancel a Scheduled Push Notification via OneSignal REST API
export async function cancelOneSignalNotification(notificationId) {
  if (!notificationId) return;

  try {
    const response = await fetch(`https://onesignal.com/api/v1/notifications/${notificationId}?app_id=${APP_ID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${API_KEY}`
      }
    });
    const data = await response.json();
    console.log(`Cancelled OneSignal Notification ${notificationId}:`, data);
  } catch (err) {
    console.error(`Error deleting notification ${notificationId}:`, err);
  }
}

// Local Timeout Notification Fallback (if offline or not subscribed yet)
function setupLocalBackupNotification(title, message, date) {
  const delay = date.getTime() - Date.now();
  if (delay <= 0) return;

  setTimeout(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body: message,
          icon: './icon-192.png',
          badge: './icon-vector.svg',
          vibrate: [200, 100, 200]
        });
      });
    } else {
      // Fallback to active toast alerts
      if (window.showToast) window.showToast(`${title}: ${message}`, "info");
    }
  }, delay);
}

// --- Scheduler Coordinators ---

// Sync notification for a single non-recurring Task
export async function syncTaskNotification(task) {
  // Cancel previous notification if any
  if (task.notificationId) {
    await cancelOneSignalNotification(task.notificationId);
    delete task.notificationId;
  }

  // If task is completed or notifications are disabled, do not schedule
  if (task.completed || task.notificationEnabled === false) {
    return;
  }

  // Check date & time settings
  if (task.dueDate) {
    const dueTime = task.dueTime || "12:00";
    const targetDate = new Date(`${task.dueDate}T${dueTime}:00`);

    // Apply offset minutes
    const offset = parseInt(task.notificationOffset) || 0;
    targetDate.setMinutes(targetDate.getMinutes() + offset);

    if (targetDate.getTime() > Date.now()) {
      let relativeMsg = `لديك مهمة مستحقة الآن: ${task.title}`;
      if (offset < 0) {
        relativeMsg = `تذكير مبكر بمهمة: ${task.title} بعد ${Math.abs(offset)} دقيقة`;
      } else if (offset > 0) {
        relativeMsg = `تذكير متأخر بمهمة: ${task.title} (مضى عليها ${offset} دقيقة)`;
      }

      const notifId = await scheduleOneSignalNotification(
        `تذكير بمهمة: ${task.title} 📝`,
        relativeMsg,
        targetDate
      );
      if (notifId) {
        task.notificationId = notifId;
      }
    }
  }
}

// Sync notification for a daily recurring Routine
export async function syncRoutineNotification(routine) {
  // Cancel previous notification if any
  if (routine.notificationId) {
    await cancelOneSignalNotification(routine.notificationId);
    delete routine.notificationId;
  }

  // If notifications are disabled, do not schedule
  if (routine.notificationEnabled === false) {
    return;
  }

  if (routine.startTime) {
    const [hours, minutes] = routine.startTime.split(':');
    const targetDate = new Date();
    targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Apply offset minutes
    const offset = parseInt(routine.notificationOffset) || 0;
    targetDate.setMinutes(targetDate.getMinutes() + offset);

    // If computed time has already passed today, schedule for tomorrow
    if (targetDate.getTime() <= Date.now()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const notifId = await scheduleOneSignalNotification(
      `روتينك اليومي: ${routine.title} 🌸`,
      `حان وقت الالتزام بعادتك: ${routine.title} (${routine.goal})`,
      targetDate
    );
    if (notifId) {
      routine.notificationId = notifId;
    }
  }
}

// Sync all notifications (e.g. at boot time after OneSignal initialized)
export async function syncAllNotifications() {
  console.log("Synchronizing all task and routine notifications...");
  
  if (state.tasks) {
    for (let task of state.tasks) {
      await syncTaskNotification(task);
    }
  }

  if (state.routines) {
    for (let routine of state.routines) {
      await syncRoutineNotification(routine);
    }
  }

  // Save the state with the scheduled notification IDs
  saveState(false);
}

// Dynamic Action Reminder Popup Modal
export function openActionReminderModal(actionId, actionTitle) {
  const modalId = 'action-reminder-modal';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-[60] flex items-center justify-center transition-all duration-300 opacity-0 pointer-events-none';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-sm mx-4 overflow-hidden border border-neutral-100 shadow-2xl p-6 space-y-5 text-right transition-all transform scale-95 duration-300" id="action-reminder-card">
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">تذكير بخطوة العلاج ⏰</h3>
        <button onclick="closeActionReminderModal()" class="p-1 rounded-full hover:bg-neutral-100 transition-colors">
          <i class="ti ti-x text-base text-neutral-500"></i>
        </button>
      </div>
      
      <div class="space-y-2">
        <span class="text-[10px] text-neutral-400 block font-bold">الخطوة المستهدفة:</span>
        <p class="text-xs font-bold text-neutral-900 leading-snug">${actionTitle}</p>
      </div>

      <div class="space-y-3">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">فكرني بالخطوة دي بعد قد إيه؟</label>
        
        <div class="grid grid-cols-2 gap-2 text-xs font-bold text-neutral-700">
          <button onclick="selectReminderPreset(15)" class="py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl transition-all select-none">بعد 15 دقيقة</button>
          <button onclick="selectReminderPreset(30)" class="py-2.5 px-3 bg-black text-white hover:bg-neutral-800 border border-black rounded-xl transition-all select-none">بعد 30 دقيقة ⭐</button>
          <button onclick="selectReminderPreset(45)" class="py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl transition-all select-none">بعد 45 دقيقة</button>
          <button onclick="selectReminderPreset(60)" class="py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl transition-all select-none">بعد ساعة (60 د)</button>
        </div>

        <div class="space-y-1 pt-2 border-t border-neutral-100">
          <label class="text-[9px] text-neutral-400 font-bold block">أو اختر وقت مخصص (بالدقائق):</label>
          <div class="flex gap-2">
            <input type="number" id="custom-reminder-minutes" value="30" min="1" class="w-full px-3 py-2 text-center text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans font-bold">
            <button onclick="submitCustomReminder('${actionId}', '${actionTitle.replace(/'/g, "\\'")}')" class="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all select-none flex-shrink-0">
              تفعيل
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind events to window
  window.closeActionReminderModal = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    const card = document.getElementById('action-reminder-card');
    if (card) {
      card.classList.add('scale-95');
      card.classList.remove('scale-100');
    }
  };

  window.selectReminderPreset = (minutes) => {
    const input = document.getElementById('custom-reminder-minutes');
    if (input) input.value = minutes;
    const buttons = modal.querySelectorAll('.grid button');
    buttons.forEach((btn, idx) => {
      const isMatch = (idx === 0 && minutes === 15) || (idx === 1 && minutes === 30) || (idx === 2 && minutes === 45) || (idx === 3 && minutes === 60);
      if (isMatch) {
        btn.className = "py-2.5 px-3 bg-black text-white hover:bg-neutral-800 border border-black rounded-xl transition-all select-none";
      } else {
        btn.className = "py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl transition-all select-none";
      }
    });
  };

  window.submitCustomReminder = async (actId, actTitle) => {
    const input = document.getElementById('custom-reminder-minutes');
    const minutes = parseInt(input ? input.value : '30') || 30;
    
    // Request native permission if not granted yet
    if (window.OneSignal && window.OneSignal.Notifications) {
      if (window.OneSignal.Notifications.permission !== true) {
        try {
          await window.OneSignal.Notifications.requestPermission();
        } catch (e) {
          console.warn("OneSignal permission request failed inside reminder:", e);
        }
      }
    }

    const scheduleTime = new Date(Date.now() + minutes * 60 * 1000);
    const notificationId = await scheduleOneSignalNotification(
      `تذكير بخطوة العلاج 🧠`,
      `حان الوقت لتنفيذ خطوة: ${actTitle}`,
      scheduleTime
    );

    if (notificationId) {
      if (window.showToast) window.showToast(`تم تفعيل التنبيه بنجاح بعد ${minutes} دقيقة! ⏰`, "success");
    } else {
      if (window.showToast) window.showToast(`تم تفعيل تذكير محلي مؤقت لجهازك بعد ${minutes} دقيقة! ⏰`, "success");
    }
    
    window.closeActionReminderModal();
  };

  // Open animation
  setTimeout(() => {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    const card = document.getElementById('action-reminder-card');
    if (card) {
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  }, 50);

  if (window.lucide) window.lucide.createIcons();
}
window.openActionReminderModal = openActionReminderModal;

// Custom Notification Toggle Helper
window.toggleCustomNotificationWidget = async (btn, hiddenInputId, containerId) => {
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!hiddenInput) return;
  
  const isCurrentlyEnabled = hiddenInput.value === 'true';
  const newEnabledState = !isCurrentlyEnabled;
  hiddenInput.value = newEnabledState ? 'true' : 'false';

  // Request native permission if enabling and not granted yet
  if (newEnabledState && window.OneSignal && window.OneSignal.Notifications) {
    if (window.OneSignal.Notifications.permission !== true) {
      try {
        await window.OneSignal.Notifications.requestPermission();
      } catch (e) {
        console.warn("OneSignal permission request failed inside toggle widget:", e);
      }
    }
  }

  const icon = btn.querySelector('i');
  const container = document.getElementById(containerId);

  if (newEnabledState) {
    // Enabled State
    btn.className = "w-10 h-10 rounded-xl bg-black text-white hover:bg-neutral-800 flex items-center justify-center transition-all duration-300 transform scale-100 active:scale-95 select-none cursor-pointer";
    if (icon) {
      icon.className = "ti ti-bell-ringing text-lg transition-transform duration-300 animate-wiggle";
    }
    if (container) {
      container.classList.remove('hidden');
      container.classList.add('animate-fadeIn');
    }
  } else {
    // Disabled State
    btn.className = "w-10 h-10 rounded-xl bg-neutral-100 text-neutral-400 hover:bg-neutral-200 flex items-center justify-center transition-all duration-300 transform scale-100 active:scale-95 select-none cursor-pointer";
    if (icon) {
      icon.className = "ti ti-bell-off text-lg transition-transform duration-300";
    }
    if (container) {
      container.classList.add('hidden');
      container.classList.remove('animate-fadeIn');
    }
  }

  // Clear wiggle class after animation
  setTimeout(() => {
    if (icon) icon.classList.remove('animate-wiggle');
  }, 600);

  // Trigger change event to save/propagate state if needed
  hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
};

// Preset Selection Helper for Custom Notification Widget
window.selectNotificationOffsetPreset = (minutes, hiddenOffsetInputId, containerId) => {
  const hiddenInput = document.getElementById(hiddenOffsetInputId);
  if (!hiddenInput) return;
  hiddenInput.value = minutes;

  const container = document.getElementById(containerId);
  if (!container) return;

  // Sync custom input field
  const customInput = container.querySelector('.custom-offset-input');
  if (customInput) customInput.value = minutes;

  // Highlight selected button
  const buttons = container.querySelectorAll('.preset-btn');
  buttons.forEach(btn => {
    const val = parseInt(btn.getAttribute('data-val'));
    if (val === minutes) {
      btn.className = "preset-btn py-2.5 px-3 bg-black text-white hover:bg-neutral-800 border border-black rounded-xl transition-all select-none text-[10px] font-bold";
    } else {
      btn.className = "preset-btn py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl transition-all select-none text-[10px] font-bold text-neutral-600";
    }
  });

  hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
};

// Custom Input Change Handler for Notification Widget
window.handleCustomOffsetInputChange = (val, hiddenOffsetInputId, containerId) => {
  const minutes = parseInt(val) || 0;
  const hiddenInput = document.getElementById(hiddenOffsetInputId);
  if (hiddenInput) {
    hiddenInput.value = minutes;
    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const container = document.getElementById(containerId);
  if (!container) return;

  // Update preset buttons highlight
  const buttons = container.querySelectorAll('.preset-btn');
  buttons.forEach(btn => {
    const pVal = parseInt(btn.getAttribute('data-val'));
    if (pVal === minutes) {
      btn.className = "preset-btn py-2.5 px-3 bg-black text-white hover:bg-neutral-800 border border-black rounded-xl transition-all select-none text-[10px] font-bold";
    } else {
      btn.className = "preset-btn py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl transition-all select-none text-[10px] font-bold text-neutral-600";
    }
  });
};

// Side Notification Icon Config Popup
export function openNotificationSettingsPopup(prefix) {
  const isEnabledInput = document.getElementById(`${prefix}-notif-enabled-input`);
  const offsetInput = document.getElementById(`${prefix}-notif-offset-input`);
  if (!isEnabledInput || !offsetInput) return;

  const initiallyEnabled = isEnabledInput.value === 'true';
  const initialOffset = parseInt(offsetInput.value) || 0;

  const modalId = 'notif-settings-popup-modal';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center transition-all duration-300 opacity-0 pointer-events-none';
    document.body.appendChild(modal);
  }

  const presets = prefix === 'routine' 
    ? [
        { label: 'في الموعد', val: 0 },
        { label: 'بعده بـ 15 د', val: 15 },
        { label: 'بعده بـ 30 د', val: 30 },
        { label: 'قبله بـ 15 د', val: -15 }
      ]
    : [
        { label: 'في الموعد', val: 0 },
        { label: 'قبل بـ 15 د', val: -15 },
        { label: 'قبل بـ 30 د', val: -30 },
        { label: 'قبل بساعة', val: -60 }
      ];

  modal.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-sm mx-4 overflow-hidden border border-neutral-100 shadow-2xl p-6 space-y-5 text-right transition-all transform scale-95 duration-300" id="notif-settings-card">
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">إعدادات تنبيه الإشعار ⏰</h3>
        <button onclick="closeNotificationSettingsPopup()" class="p-1 rounded-full hover:bg-neutral-100 transition-colors">
          <i class="ti ti-x text-base text-neutral-500"></i>
        </button>
      </div>

      <!-- State Toggle -->
      <div class="flex items-center justify-between gap-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-100/50">
        <span class="text-xs font-bold text-neutral-800">حالة التنبيه للمهمة/الروتين:</span>
        <button type="button" id="popup-notif-state-btn" class="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200">
          تفعيل التنبيه
        </button>
      </div>

      <!-- Offset Configurator (Expandable) -->
      <div class="space-y-4 pt-1" id="popup-offset-config-section">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-sans">توقيت التنبيه (بالدقائق):</label>
        
        <div class="grid grid-cols-2 gap-2 text-xs font-bold text-neutral-700" id="popup-presets-grid">
          ${presets.map(p => `
            <button type="button" class="preset-btn py-2.5 px-3 border rounded-xl transition-all select-none text-[10px] font-bold"></button>
          `).join('')}
        </div>

        <div class="space-y-1.5 pt-2 border-t border-neutral-100">
          <label class="text-[9px] text-neutral-400 font-bold block font-sans">أو حدد وقت مخصص بالدقائق (سالب قبل / موجب بعد):</label>
          <input type="number" id="popup-custom-offset-input" class="w-full px-3 py-2 text-center text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans font-bold">
        </div>
      </div>

      <!-- Confirm Button -->
      <button type="button" id="popup-confirm-notif-btn" class="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl transition-all shadow-md select-none mt-2 flex items-center justify-center gap-1.5 font-sans">
        <span>تأكيد الإعدادات</span>
        <i class="ti ti-check text-sm"></i>
      </button>
    </div>
  `;

  let localEnabled = initiallyEnabled;
  let localOffset = initialOffset;

  const stateBtn = modal.querySelector('#popup-notif-state-btn');
  const offsetSection = modal.querySelector('#popup-offset-config-section');
  const customInput = modal.querySelector('#popup-custom-offset-input');
  const presetsGrid = modal.querySelector('#popup-presets-grid');
  const presetButtons = presetsGrid.querySelectorAll('.preset-btn');
  const confirmBtn = modal.querySelector('#popup-confirm-notif-btn');

  // Populate presets labels
  presetButtons.forEach((btn, idx) => {
    btn.innerText = presets[idx].label;
    btn.addEventListener('click', () => {
      localOffset = presets[idx].val;
      customInput.value = localOffset;
      updatePresetsUI();
    });
  });

  const updatePresetsUI = () => {
    presetButtons.forEach((btn, idx) => {
      if (presets[idx].val === localOffset) {
        btn.className = "preset-btn py-2.5 px-3 bg-black text-white hover:bg-neutral-800 border border-black rounded-xl transition-all select-none text-[10px] font-bold";
      } else {
        btn.className = "preset-btn py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl transition-all select-none text-[10px] font-bold text-neutral-600";
      }
    });
  };

  const updateStateUI = () => {
    if (localEnabled) {
      stateBtn.innerText = "نشط 🔔";
      stateBtn.className = "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 bg-black text-white hover:bg-neutral-800";
      offsetSection.style.display = 'block';
    } else {
      stateBtn.innerText = "معطل 🔕";
      stateBtn.className = "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 bg-neutral-100 text-neutral-400 hover:bg-neutral-200";
      offsetSection.style.display = 'none';
    }
  };

  stateBtn.addEventListener('click', () => {
    localEnabled = !localEnabled;
    updateStateUI();
  });

  customInput.value = localOffset;
  customInput.addEventListener('input', () => {
    localOffset = parseInt(customInput.value) || 0;
    updatePresetsUI();
  });

  updateStateUI();
  updatePresetsUI();

  // Close helper
  window.closeNotificationSettingsPopup = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    const card = document.getElementById('notif-settings-card');
    if (card) {
      card.classList.add('scale-95');
      card.classList.remove('scale-100');
    }
  };

  // Confirm click
  confirmBtn.addEventListener('click', async () => {
    isEnabledInput.value = localEnabled ? 'true' : 'false';
    offsetInput.value = localOffset;

    // Request native permission if enabling and not granted yet
    if (localEnabled && window.OneSignal && window.OneSignal.Notifications) {
      if (window.OneSignal.Notifications.permission !== true) {
        try {
          await window.OneSignal.Notifications.requestPermission();
        } catch (e) {
          console.warn("OneSignal permission request failed inside confirm config:", e);
        }
      }
    }

    // Trigger visual change on side bell button
    const sideBellBtn = document.getElementById(`${prefix}-notif-bell-btn`);
    if (sideBellBtn) {
      const icon = sideBellBtn.querySelector('i');
      if (localEnabled) {
        sideBellBtn.className = "w-10 h-10 rounded-xl bg-black text-white hover:bg-neutral-800 flex items-center justify-center transition-all duration-300 transform scale-100 active:scale-95 select-none cursor-pointer";
        if (icon) icon.className = "ti ti-bell-ringing text-lg transition-transform duration-300 animate-wiggle";
      } else {
        sideBellBtn.className = "w-10 h-10 rounded-xl bg-neutral-100 text-neutral-400 hover:bg-neutral-200 flex items-center justify-center transition-all duration-300 transform scale-100 active:scale-95 select-none cursor-pointer";
        if (icon) icon.className = "ti ti-bell-off text-lg transition-transform duration-300";
      }
      setTimeout(() => {
        if (icon) icon.classList.remove('animate-wiggle');
      }, 600);
    }

    // Trigger change event to save/sync
    isEnabledInput.dispatchEvent(new Event('change', { bubbles: true }));
    window.closeNotificationSettingsPopup();

    if (window.showToast) {
      window.showToast(localEnabled ? "تم تفعيل التنبيه بنجاح! ⏰" : "تم إلغاء تفعيل تنبيه هذا العنصر! 🔕", "info");
    }
  });

  // Open animation
  setTimeout(() => {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    const card = document.getElementById('notif-settings-card');
    if (card) {
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  }, 50);
}
window.openNotificationSettingsPopup = openNotificationSettingsPopup;

// --- Header Notification Popup & Due Items Manager ---

// Helper to get local date string YYYY-MM-DD
function getLocalDateStringHelper(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
}

// Calculate the number of pending/due items for today
export function getPendingDueItems() {
  const todayStr = getLocalDateStringHelper();
  
  // Pending routines: routines created that are not done today
  const pendingRoutines = (state.routines || []).filter(r => !(r.history || []).includes(todayStr));
  
  // Pending tasks: tasks that are not completed
  const pendingTasks = (state.tasks || []).filter(t => !t.completed);
  
  return { pendingRoutines, pendingTasks };
}

// Update the red notification badge on the bell in the header
export function updateHeaderNotificationBadge() {
  const badge = document.getElementById('header-notif-badge');
  if (!badge) return;

  const { pendingRoutines, pendingTasks } = getPendingDueItems();
  const totalCount = pendingRoutines.length + pendingTasks.length;

  if (totalCount > 0) {
    badge.innerText = totalCount;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}
window.updateHeaderNotificationBadge = updateHeaderNotificationBadge;

// Open the due items popup modal
export function openHeaderNotificationsPopup() {
  const modalId = 'header-notif-modal';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center transition-all duration-300 opacity-0 pointer-events-none select-none';
    document.body.appendChild(modal);
  }

  // Pushes this modal to history for back button support
  if (window.pushModalHistory) window.pushModalHistory();

  renderHeaderNotificationsContent(modal);

  // Open animation
  setTimeout(() => {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    const card = document.getElementById('header-notif-card');
    if (card) {
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }
  }, 50);
}
window.openHeaderNotificationsPopup = openHeaderNotificationsPopup;

// Close the due items popup modal
export function closeHeaderNotificationsPopup() {
  const modal = document.getElementById('header-notif-modal');
  const card = document.getElementById('header-notif-card');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    if (card) {
      card.classList.add('scale-95');
      card.classList.remove('scale-100');
    }
  }

  // Pops this modal from history
  if (window.popModalHistory) window.popModalHistory();
}
window.closeHeaderNotificationsPopup = closeHeaderNotificationsPopup;

// Render notification list inside popup modal
export function renderHeaderNotificationsContent(modalElement) {
  const modal = modalElement || document.getElementById('header-notif-modal');
  if (!modal) return;

  const { pendingRoutines, pendingTasks } = getPendingDueItems();
  const totalCount = pendingRoutines.length + pendingTasks.length;

  let contentHTML = "";

  if (totalCount === 0) {
    contentHTML = `
      <div class="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
        <div class="w-14 h-14 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400">
          <i class="ti ti-bell-off text-3xl"></i>
        </div>
        <div class="space-y-1">
          <h4 class="text-xs font-bold text-neutral-900">كل تمام ومخلص! 🎉</h4>
          <p class="text-[10px] text-neutral-400 leading-relaxed max-w-[220px] mx-auto">
            رائع! لا توجد مهام أو روتين مستحق حالياً. يومك ماشي تمام.
          </p>
        </div>
      </div>
    `;
  } else {
    contentHTML = `
      <div class="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        
        <!-- Routines Section -->
        ${pendingRoutines.length > 0 ? `
          <div class="space-y-2">
            <h4 class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider text-right">الروتين والعادات المستحقة اليوم:</h4>
            <div class="space-y-2">
              ${pendingRoutines.map(r => {
                // Find target feeling
                const targetFeeling = state.symptoms.find(s => s.id === r.targetSymptomId);
                const feelingLabel = targetFeeling ? `حل لـ ${targetFeeling.titleAr}` : 'عام';
                return `
                  <div class="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-100 hover:border-neutral-200 rounded-2xl transition-all">
                    <div class="text-right flex-1 min-w-0 pl-3">
                      <span class="text-[8px] font-bold text-neutral-400 block">${feelingLabel}</span>
                      <span class="text-xs font-bold text-neutral-800 truncate block leading-snug">${r.title}</span>
                      <span class="text-[9px] text-neutral-400 font-sans block mt-0.5">${r.startTime ? 'البدء: ' + r.startTime : ''}</span>
                    </div>
                    <button onclick="toggleNotificationPopupRoutineComplete('${r.id}')" class="w-8 h-8 rounded-xl bg-white border border-neutral-200 hover:border-black flex items-center justify-center transition-all flex-shrink-0 text-neutral-500 hover:text-black">
                      <i class="ti ti-circle text-base"></i>
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Tasks Section -->
        ${pendingTasks.length > 0 ? `
          <div class="space-y-2 pt-2 ${pendingRoutines.length > 0 ? 'border-t border-neutral-100' : ''}">
            <h4 class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider text-right">المهام الفردية غير المكتملة:</h4>
            <div class="space-y-2">
              ${pendingTasks.map(t => {
                return `
                  <div class="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-100 hover:border-neutral-200 rounded-2xl transition-all">
                    <div class="text-right flex-1 min-w-0 pl-3">
                      <span class="text-[8px] font-bold text-neutral-400 block">مهمة فردية</span>
                      <span class="text-xs font-bold text-neutral-800 truncate block leading-snug">${t.title}</span>
                      <span class="text-[9px] text-neutral-400 font-sans block mt-0.5">${t.dueDate ? 'تاريخ الاستحقاق: ' + t.dueDate : ''}</span>
                    </div>
                    <button onclick="toggleNotificationPopupTaskComplete('${t.id}')" class="w-8 h-8 rounded-xl bg-white border border-neutral-200 hover:border-black flex items-center justify-center transition-all flex-shrink-0 text-neutral-500 hover:text-black">
                      <i class="ti ti-circle text-base"></i>
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }

  modal.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-sm mx-4 overflow-hidden border border-neutral-100 shadow-2xl p-6 space-y-5 text-right transition-all transform scale-95 duration-300" id="header-notif-card">
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">المهام والعادات المستحقة 🔔</h3>
        <button onclick="closeHeaderNotificationsPopup()" class="p-1 rounded-full hover:bg-neutral-100 transition-colors">
          <i class="ti ti-x text-base text-neutral-500"></i>
        </button>
      </div>

      ${contentHTML}

      <!-- Footer Info -->
      <div class="text-center pt-2 border-t border-neutral-100">
        <span class="text-[8px] text-neutral-400 font-bold uppercase tracking-wider font-sans">اعمل ايه !؟ — حافظ على صحتك النفسية اليومية</span>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
window.renderHeaderNotificationsContent = renderHeaderNotificationsContent;

// Trigger routine completion from inside the notification popup list
export function toggleNotificationPopupRoutineComplete(routineId) {
  if (window.toggleRoutineComplete) {
    window.toggleRoutineComplete(routineId);
    // Re-render the popup content in place
    renderHeaderNotificationsContent();
    updateHeaderNotificationBadge();
  }
}
window.toggleNotificationPopupRoutineComplete = toggleNotificationPopupRoutineComplete;

// Trigger task completion from inside the notification popup list
export function toggleNotificationPopupTaskComplete(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    
    // Cancel OneSignal REST notifications scheduled for this task
    cancelOneSignalNotification(task.notificationId);
    delete task.notificationId;

    if (window.showToast) window.showToast("تم إنجاز المهمة بنجاح! 📝✨", "success");
    
    saveState(true);
    pushSyncUpdate();

    // Re-render other parts of UI if currently viewing Routines/Tasks page
    if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
    
    // Re-render the popup content in place
    renderHeaderNotificationsContent();
    updateHeaderNotificationBadge();
  }
}
window.toggleNotificationPopupTaskComplete = toggleNotificationPopupTaskComplete;

