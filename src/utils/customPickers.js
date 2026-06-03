/**
 * Premium Custom Input Pickers (Selects, Time, and Date)
 * Centered modal overlays bypassing generic browser UI and native blue selections.
 */

import { state } from '../state/store.js';

// --- Helper: Centered Premium Modal Overlay ---
function createPickerModal(title, contentHTML, onConfirm, onCancel) {
  // Remove any previous custom picker modals
  const existing = document.getElementById('custom-picker-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'custom-picker-modal';
  // Starts transparent/blurless
  modal.className = 'fixed inset-0 bg-neutral-900/0 backdrop-blur-none z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-out select-none';

  const card = document.createElement('div');
  card.className = 'bg-white rounded-3xl w-full max-w-sm border border-neutral-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transform scale-95 opacity-0 translate-y-4 transition-all duration-300 ease-out';

  card.innerHTML = `
    <!-- Header -->
    <div class="px-6 py-4.5 border-b border-neutral-200/50 flex items-center justify-between flex-shrink-0">
      <h3 class="text-xs font-bold text-neutral-900 uppercase tracking-wider font-sans text-right flex-1">${title}</h3>
      <button type="button" id="custom-picker-close-btn" class="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-all duration-200 flex items-center justify-center">
        <i class="ti ti-x text-base"></i>
      </button>
    </div>
    
    <!-- Body -->
    <div id="custom-picker-modal-body" class="p-6 overflow-y-auto flex-1 text-right min-h-0 space-y-4">
      ${contentHTML}
    </div>
  `;

  modal.appendChild(card);
  document.body.appendChild(modal);

  // Trigger smooth transition
  requestAnimationFrame(() => {
    modal.className = 'fixed inset-0 bg-neutral-900/40 backdrop-blur-[2.5px] z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-out select-none';
    card.className = 'bg-white rounded-3xl w-full max-w-sm border border-neutral-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transform scale-100 opacity-100 translate-y-0 transition-all duration-300 ease-out';
  });

  const closeModal = () => {
    card.className = 'bg-white rounded-3xl w-full max-w-sm border border-neutral-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transform scale-95 opacity-0 translate-y-4 transition-all duration-300 ease-out';
    modal.className = 'fixed inset-0 bg-neutral-900/0 backdrop-blur-none z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-out select-none';
    setTimeout(() => {
      modal.remove();
      if (onCancel) onCancel();
    }, 300);
  };

  modal.querySelector('#custom-picker-close-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  return {
    modal,
    modalBody: modal.querySelector('#custom-picker-modal-body'),
    close: closeModal
  };
}

export function applyCustomPickers(parent = document) {
  initCustomSelects(parent);
  initCustomTimePickers(parent);
  initCustomDatePickers(parent);
}
window.applyCustomPickers = applyCustomPickers;

// --- 1. CUSTOM SELECT DROPDOWNS ---
export function initCustomSelects(parent = document) {
  const selects = parent.querySelectorAll('select:not(.customized-select)');

  selects.forEach(select => {
    select.classList.add('customized-select', 'sr-only');

    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-full custom-select-wrapper';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    // Create trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';

    const selectedText = document.createElement('span');
    selectedText.innerText = select.options[select.selectedIndex]?.text || 'اختر...';
    trigger.appendChild(selectedText);

    const arrow = document.createElement('i');
    arrow.className = 'ti ti-chevron-down text-neutral-400 transition-transform duration-200';
    trigger.appendChild(arrow);

    wrapper.appendChild(trigger);

    // Styling and disabled state coordinator
    const updateSelectVisualState = () => {
      selectedText.innerText = select.options[select.selectedIndex]?.text || 'اختر...';
      if (select.disabled) {
        trigger.disabled = true;
        trigger.className = 'w-full px-4 py-3 bg-[#F4F4F3] border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-400 flex items-center justify-between text-right font-sans cursor-not-allowed select-none transition-all duration-200';
      } else {
        trigger.disabled = false;
        trigger.className = 'w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 flex items-center justify-between text-right font-sans focus:outline-none focus:border-black transition-all duration-200 select-none';
      }
    };

    updateSelectVisualState();

    // Listen to native change event to keep in sync programmatically
    select.addEventListener('change', () => {
      updateSelectVisualState();
    });

    // Toggle trigger and open popup modal
    trigger.addEventListener('click', (e) => {
      if (select.disabled) return;
      e.stopPropagation();

      const labelText = select.closest('.space-y-1\\.5')?.querySelector('label')?.innerText || 'اختر من القائمة';

      const contentHTML = `
        <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
          ${Array.from(select.options).map((opt, idx) => {
        const isSelected = select.selectedIndex === idx;
        const activeClass = isSelected
          ? 'bg-black text-white font-bold ring-2 ring-neutral-200/50 shadow-sm p-3'
          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-black p-3';
        return `
              <button type="button" data-idx="${idx}" class="w-full text-right px-4.5 py-3.5 text-xs font-semibold rounded-2xl transition-all select-none flex items-center justify-between ${activeClass}">
                <span>${opt.text}</span>
                ${isSelected ? '<i class="ti ti-check text-sm"></i>' : ''}
              </button>
            `;
      }).join('')}
        </div>
      `;

      const picker = createPickerModal(labelText, contentHTML);

      // Handle selection
      picker.modalBody.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          select.selectedIndex = idx;
          selectedText.innerText = select.options[idx].text;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          picker.close();
        });
      });
    });
  });
}

// --- 2. CUSTOM TIME PICKERS ---
export function initCustomTimePickers(parent = document) {
  const timeInputs = parent.querySelectorAll('input[type="time"]:not(.customized-time)');

  timeInputs.forEach(input => {
    input.classList.add('customized-time', 'sr-only');

    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-full custom-time-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Initial value formatted
    let initialVal = input.value || '08:00';
    let [hourStr, minuteStr] = initialVal.split(':');
    let hour = parseInt(hourStr) || 8;
    let minute = parseInt(minuteStr) || 0;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 flex items-center justify-between text-right font-sans focus:outline-none focus:border-black transition-all duration-200 select-none';

    const timeDisplay = document.createElement('span');
    timeDisplay.innerText = formatTimeLabel(hour, minute);
    trigger.appendChild(timeDisplay);

    const clockIcon = document.createElement('i');
    clockIcon.className = 'ti ti-clock text-neutral-400';
    trigger.appendChild(clockIcon);
    wrapper.appendChild(trigger);

    // Click to open centered time grid modal popup
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();

      const labelText = input.closest('.space-y-1\\.5')?.querySelector('label')?.innerText || 'تحديد وقت الروتين';

      // Parse current values
      let [hStr, mStr] = (input.value || '08:00').split(':');
      let currentHour = parseInt(hStr) || 8;
      let currentMin = parseInt(mStr) || 0;

      let tempHour = currentHour % 12;
      tempHour = tempHour ? tempHour : 12; // 0 should be 12
      let tempMinute = Math.round(currentMin / 5) * 5 % 60;
      let tempPeriod = currentHour < 12 ? 'AM' : 'PM';

      // Notification settings configuration inside Time Picker
      const prefix = input.name.includes('routine') ? 'routine' : input.name.includes('task') ? 'task' : '';
      let hasNotificationConfig = false;
      let initialEnabled = true;
      let initialOffset = 0;

      let isEnabledInput = null;
      let offsetInput = null;

      if (prefix) {
        const form = input.closest('form');
        if (form) {
          isEnabledInput = form.querySelector(`input[name="${prefix}NotificationEnabled"]`);
          offsetInput = form.querySelector(`input[name="${prefix}NotificationOffset"]`);
          if (isEnabledInput && offsetInput) {
            hasNotificationConfig = true;
            initialEnabled = isEnabledInput.value === 'true';
            initialOffset = parseInt(offsetInput.value) || 0;
          }
        }
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

      const contentHTML = `
        <div class="space-y-5 text-right font-sans">
          
          <!-- Manual Time Input -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">حدد الوقت بدقة (بالكتابة)</label>
            <div class="flex items-center justify-center gap-2 font-sans text-xl font-bold bg-neutral-50 p-3 rounded-2xl border border-neutral-100/50">
              <div class="flex flex-col items-center">
                <input type="number" id="manual-hour-input" min="1" max="12" value="${tempHour}" class="w-14 text-center bg-white border border-neutral-200 rounded-xl py-1.5 focus:outline-none focus:border-black font-sans font-bold text-sm">
                <span class="text-[8px] text-neutral-400 mt-0.5 font-bold">ساعة</span>
              </div>
              <span class="text-neutral-400 pb-4 font-bold">:</span>
              <div class="flex flex-col items-center">
                <input type="number" id="manual-minute-input" min="0" max="59" value="${tempMinute.toString().padStart(2, '0')}" class="w-14 text-center bg-white border border-neutral-200 rounded-xl py-1.5 focus:outline-none focus:border-black font-sans font-bold text-sm">
                <span class="text-[8px] text-neutral-400 mt-0.5 font-bold">دقيقة</span>
              </div>
              <div class="flex flex-col items-center ml-2">
                <select id="manual-period-select" class="w-20 text-center bg-white border border-neutral-200 rounded-xl py-2 focus:outline-none focus:border-black font-sans font-bold text-xs select-none">
                  <option value="AM" ${tempPeriod === 'AM' ? 'selected' : ''}>صباحاً (ص)</option>
                  <option value="PM" ${tempPeriod === 'PM' ? 'selected' : ''}>مساءً (م)</option>
                </select>
                <span class="text-[8px] text-neutral-400 mt-0.5 font-bold">الفترة</span>
              </div>
            </div>
          </div>

          <!-- Hours Grid -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">الساعة</label>
            <div class="grid grid-cols-6 gap-1.5" id="hour-grid">
              ${Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
        const isSelected = h === tempHour;
        const activeClass = isSelected
          ? 'bg-black text-white font-bold shadow-md scale-105 ring-2 ring-neutral-200/50'
          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-black';
        return `<button type="button" data-val="${h}" class="py-2.5 text-xs font-bold rounded-xl transition-all h-btn font-sans ${activeClass}">${h.toString().padStart(2, '0')}</button>`;
      }).join('')}
            </div>
          </div>

          <!-- Minutes Grid -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">الدقيقة</label>
            <div class="grid grid-cols-6 gap-1.5" id="minute-grid">
              ${[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => {
        const isSelected = m === tempMinute;
        const activeClass = isSelected
          ? 'bg-black text-white font-bold shadow-md scale-105 ring-2 ring-neutral-200/50'
          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-black';
        return `<button type="button" data-val="${m}" class="py-2.5 text-xs font-bold rounded-xl transition-all m-btn font-sans ${activeClass}">${m.toString().padStart(2, '0')}</button>`;
      }).join('')}
            </div>
          </div>

          <!-- Period Switcher -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">الفترة</label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl" id="period-switch">
              <button type="button" id="period-am-btn" class="py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 ${tempPeriod === 'AM' ? 'bg-white text-black shadow-sm font-bold' : 'text-neutral-500 hover:text-black'}">صباحاً (ص)</button>
              <button type="button" id="period-pm-btn" class="py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 ${tempPeriod === 'PM' ? 'bg-white text-black shadow-sm font-bold' : 'text-neutral-500 hover:text-black'}">مساءً (م)</button>
            </div>
          </div>

          ${hasNotificationConfig ? `
          <!-- Unified Time Picker Notification Config -->
          <div class="space-y-3 pt-3 border-t border-neutral-100" id="picker-notif-widget-container">
            <div class="flex items-center justify-between gap-2">
              <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">تفعيل التنبيه للموعد 🔔</label>
              <button type="button" id="picker-notif-toggle-btn" class="w-10 h-10 rounded-xl transition-all duration-300 transform scale-100 active:scale-95 select-none cursor-pointer flex items-center justify-center">
                <i class="ti text-lg transition-transform duration-300"></i>
              </button>
            </div>
            
            <!-- Expandable Offset Selector inside Picker -->
            <div class="space-y-3 pt-2.5 border-t border-neutral-200/50" id="picker-notif-offset-section">
              <label class="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block font-sans">توقيت التنبيه (اختر أو حدد بالدقيقة):</label>
              <div class="grid grid-cols-2 gap-2" id="picker-presets-grid">
                ${presets.map(p => `
                  <button type="button" data-val="${p.val}" class="preset-btn py-2 px-3 border rounded-xl transition-all select-none text-[10px] font-bold">${p.label}</button>
                `).join('')}
              </div>
              
              <div class="flex items-center gap-2 pt-1.5 border-t border-neutral-100">
                <span class="text-[9px] text-neutral-400 font-bold flex-shrink-0 font-sans">وقت مخصص (بالدقائق):</span>
                <input type="number" id="picker-custom-offset-input" class="w-full px-3 py-1.5 text-center text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans font-bold" value="${initialOffset}">
              </div>
            </div>
          </div>
          ` : ''}

          <!-- Action Confirm Button -->
          <button type="button" id="confirm-time-popup-btn" class="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl transition-all shadow-md select-none mt-2 flex items-center justify-center gap-1.5">
            <span>تأكيد الوقت</span>
            <i class="ti ti-check text-sm"></i>
          </button>

        </div>
      `;

      const picker = createPickerModal(labelText, contentHTML);

      // Manual Inputs
      const manualHour = picker.modalBody.querySelector('#manual-hour-input');
      const manualMin = picker.modalBody.querySelector('#manual-minute-input');
      const manualPeriod = picker.modalBody.querySelector('#manual-period-select');

      const updateManualInputsVal = () => {
        if (manualHour) manualHour.value = tempHour;
        if (manualMin) manualMin.value = tempMinute.toString().padStart(2, '0');
        if (manualPeriod) manualPeriod.value = tempPeriod;
      };

      // Handle Hours interactive clicks
      const hourButtons = picker.modalBody.querySelectorAll('.h-btn');
      hourButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          tempHour = parseInt(btn.getAttribute('data-val'));
          hourButtons.forEach(b => b.className = 'py-2.5 text-xs font-sans font-bold rounded-xl transition-all h-btn bg-neutral-50 hover:bg-neutral-100 text-neutral-600');
          btn.className = 'py-2.5 text-xs font-sans font-bold rounded-xl transition-all h-btn bg-black text-white shadow-md scale-105 ring-2 ring-neutral-200/50';
          updateManualInputsVal();
        });
      });

      // Handle Minutes interactive clicks
      const minButtons = picker.modalBody.querySelectorAll('.m-btn');
      minButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          tempMinute = parseInt(btn.getAttribute('data-val'));
          minButtons.forEach(b => b.className = 'py-2.5 text-xs font-sans font-bold rounded-xl transition-all m-btn bg-neutral-50 hover:bg-neutral-100 text-neutral-600');
          btn.className = 'py-2.5 text-xs font-sans font-bold rounded-xl transition-all m-btn bg-black text-white shadow-md scale-105 ring-2 ring-neutral-200/50';
          updateManualInputsVal();
        });
      });

      // Handle Period interactive clicks
      const amBtn = picker.modalBody.querySelector('#period-am-btn');
      const pmBtn = picker.modalBody.querySelector('#period-pm-btn');

      const updatePeriodUI = (p) => {
        tempPeriod = p;
        if (p === 'AM') {
          amBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 bg-white text-black shadow-sm font-bold';
          pmBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 text-neutral-500 hover:text-black';
        } else {
          pmBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 bg-white text-black shadow-sm font-bold';
          amBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 text-neutral-500 hover:text-black';
        }
        updateManualInputsVal();
      };

      amBtn.addEventListener('click', () => updatePeriodUI('AM'));
      pmBtn.addEventListener('click', () => updatePeriodUI('PM'));

      // Listen to manual typing / changing
      const onManualInputChange = () => {
        let hVal = parseInt(manualHour.value) || 12;
        if (hVal < 1) hVal = 1;
        if (hVal > 12) hVal = 12;
        tempHour = hVal;

        let mVal = parseInt(manualMin.value) || 0;
        if (mVal < 0) mVal = 0;
        if (mVal > 59) mVal = 59;
        tempMinute = mVal;

        tempPeriod = manualPeriod.value;

        // Update hours grid buttons active class
        hourButtons.forEach(btn => {
          const val = parseInt(btn.getAttribute('data-val'));
          if (val === tempHour) {
            btn.className = 'py-2.5 text-xs font-sans font-bold rounded-xl transition-all h-btn bg-black text-white shadow-md scale-105 ring-2 ring-neutral-200/50';
          } else {
            btn.className = 'py-2.5 text-xs font-sans font-bold rounded-xl transition-all h-btn bg-neutral-50 hover:bg-neutral-100 text-neutral-600';
          }
        });

        // Update minutes grid buttons active class
        minButtons.forEach(btn => {
          const val = parseInt(btn.getAttribute('data-val'));
          if (val === tempMinute) {
            btn.className = 'py-2.5 text-xs font-sans font-bold rounded-xl transition-all m-btn bg-black text-white shadow-md scale-105 ring-2 ring-neutral-200/50';
          } else {
            btn.className = 'py-2.5 text-xs font-sans font-bold rounded-xl transition-all m-btn bg-neutral-50 hover:bg-neutral-100 text-neutral-600';
          }
        });

        // Update period buttons
        if (tempPeriod === 'AM') {
          amBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 bg-white text-black shadow-sm font-bold';
          pmBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 text-neutral-500 hover:text-black';
        } else {
          pmBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 bg-white text-black shadow-sm font-bold';
          amBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition-all text-center flex-1 text-neutral-500 hover:text-black';
        }
      };

      manualHour.addEventListener('input', onManualInputChange);
      manualMin.addEventListener('input', onManualInputChange);
      manualPeriod.addEventListener('change', onManualInputChange);

      manualHour.addEventListener('blur', () => {
        let hVal = parseInt(manualHour.value) || 12;
        if (hVal < 1) hVal = 1;
        if (hVal > 12) hVal = 12;
        manualHour.value = hVal;
      });

      manualMin.addEventListener('blur', () => {
        let mVal = parseInt(manualMin.value) || 0;
        if (mVal < 0) mVal = 0;
        if (mVal > 59) mVal = 59;
        manualMin.value = mVal.toString().padStart(2, '0');
      });

      // Unified Notification Config Logic inside Time Picker
      let localEnabled = initialEnabled;
      let localOffset = initialOffset;

      if (hasNotificationConfig) {
        const toggleBtn = picker.modalBody.querySelector('#picker-notif-toggle-btn');
        const offsetSection = picker.modalBody.querySelector('#picker-notif-offset-section');
        const customOffsetInput = picker.modalBody.querySelector('#picker-custom-offset-input');
        const presetButtons = picker.modalBody.querySelectorAll('#picker-presets-grid .preset-btn');
        const notifIcon = toggleBtn.querySelector('i');

        const updateNotifUI = () => {
          if (localEnabled) {
            toggleBtn.className = "w-10 h-10 rounded-xl bg-black text-white hover:bg-neutral-800 flex items-center justify-center transition-all duration-300 transform scale-100 active:scale-95 select-none cursor-pointer";
            if (notifIcon) notifIcon.className = "ti ti-bell-ringing text-lg transition-transform duration-300";
            if (offsetSection) offsetSection.style.display = 'block';
          } else {
            toggleBtn.className = "w-10 h-10 rounded-xl bg-neutral-100 text-neutral-400 hover:bg-neutral-200 flex items-center justify-center transition-all duration-300 transform scale-100 active:scale-95 select-none cursor-pointer";
            if (notifIcon) notifIcon.className = "ti ti-bell-off text-lg transition-transform duration-300";
            if (offsetSection) offsetSection.style.display = 'none';
          }
        };

        const updatePresetsUI = () => {
          presetButtons.forEach(btn => {
            const val = parseInt(btn.getAttribute('data-val'));
            if (val === localOffset) {
              btn.className = "preset-btn py-2 px-3 bg-black text-white border-black rounded-xl transition-all select-none text-[10px] font-bold";
            } else {
              btn.className = "preset-btn py-2 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl transition-all select-none text-[10px] font-bold text-neutral-600";
            }
          });
        };

        toggleBtn.addEventListener('click', () => {
          localEnabled = !localEnabled;
          updateNotifUI();
          if (localEnabled && notifIcon) {
            notifIcon.classList.add('animate-wiggle');
            setTimeout(() => notifIcon.classList.remove('animate-wiggle'), 600);
          }
        });

        presetButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            localOffset = parseInt(btn.getAttribute('data-val'));
            if (customOffsetInput) customOffsetInput.value = localOffset;
            updatePresetsUI();
          });
        });

        if (customOffsetInput) {
          customOffsetInput.addEventListener('input', () => {
            localOffset = parseInt(customOffsetInput.value) || 0;
            updatePresetsUI();
          });
        }

        updateNotifUI();
        updatePresetsUI();
      }

      // Confirm click handler
      picker.modalBody.querySelector('#confirm-time-popup-btn').addEventListener('click', () => {
        let finalHour = tempHour;
        if (tempPeriod === 'PM' && tempHour < 12) finalHour += 12;
        if (tempPeriod === 'AM' && tempHour === 12) finalHour = 0;

        const formattedTime = `${finalHour.toString().padStart(2, '0')}:${tempMinute.toString().padStart(2, '0')}`;
        input.value = formattedTime;
        timeDisplay.innerText = formatTimeLabel(finalHour, tempMinute);

        // Save notification configurations to form fields
        if (hasNotificationConfig && isEnabledInput && offsetInput) {
          isEnabledInput.value = localEnabled ? 'true' : 'false';
          offsetInput.value = localOffset;
          isEnabledInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        input.dispatchEvent(new Event('change', { bubbles: true }));
        picker.close();
      });
    });
  });
}

function formatTimeLabel(h, m) {
  const period = h >= 12 ? 'م' : 'ص';
  let hour12 = h % 12;
  hour12 = hour12 ? hour12 : 12;
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
}

// --- 3. CUSTOM CALENDAR DATE PICKERS ---
export function initCustomDatePickers(parent = document) {
  const dateInputs = parent.querySelectorAll('input[type="date"]:not(.customized-date)');

  dateInputs.forEach(input => {
    input.classList.add('customized-date', 'sr-only');

    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-full custom-date-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const initialDate = input.value ? new Date(input.value) : new Date();

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'w-full px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 flex items-center justify-between text-right font-sans focus:outline-none focus:border-black transition-all duration-200 select-none';

    const dateDisplay = document.createElement('span');
    dateDisplay.innerText = formatSelectedDate(initialDate);
    trigger.appendChild(dateDisplay);

    const calendarIcon = document.createElement('i');
    calendarIcon.className = 'ti ti-calendar-event text-neutral-400';
    trigger.appendChild(calendarIcon);
    wrapper.appendChild(trigger);

    // Open Centered calendar modal popup
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();

      const labelText = input.closest('.space-y-1\\.5')?.querySelector('label')?.innerText || 'تاريخ الاستحقاق';

      const currentVal = input.value ? new Date(input.value) : new Date();
      let calMonth = currentVal.getMonth();
      let calYear = currentVal.getFullYear();

      // Open empty picker overlay and let builder fill the body
      const picker = createPickerPopupSkeleton(labelText);

      const drawDatePickerCalendar = () => {
        const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const weekdaysAr = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

        let cellsHTML = '';
        for (let i = 0; i < firstDayIndex; i++) {
          cellsHTML += `<div class="w-8 h-8"></div>`;
        }

        const activeVal = input.value ? new Date(input.value) : null;
        const activeStr = activeVal ? adjustedDateString(activeVal) : '';

        for (let day = 1; day <= daysInMonth; day++) {
          const curDate = new Date(calYear, calMonth, day);
          const curStr = adjustedDateString(curDate);
          const isSelected = curStr === activeStr;

          let cellClass = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-bold transition-all select-none cursor-pointer ";
          if (isSelected) {
            cellClass += "bg-black text-white scale-110 shadow-sm ring-2 ring-neutral-200/50";
          } else {
            cellClass += "text-neutral-500 hover:bg-neutral-100 hover:text-black";
          }

          cellsHTML += `
            <button type="button" class="${cellClass}" data-date="${curStr}">
              ${day}
            </button>
          `;
        }

        picker.modalBody.innerHTML = `
          <div class="space-y-3 text-right">
            <!-- Calendar Navigation Header -->
            <div class="flex items-center justify-between gap-1 text-[11px] font-bold pb-2.5 border-b border-neutral-200/50">
              <button type="button" id="cal-prev-month-btn" class="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors font-sans text-xs font-bold">&lt;</button>
              <span class="font-sans text-neutral-800 text-xs">${monthNamesAr[calMonth]} ${calYear}</span>
              <button type="button" id="cal-next-month-btn" class="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors font-sans text-xs font-bold">&gt;</button>
            </div>

            <!-- Weekdays Header Grid -->
            <div class="grid grid-cols-7 gap-1.5 text-center font-bold text-neutral-400 text-[10px] font-sans">
              ${weekdaysAr.map(wd => `<div>${wd}</div>`).join('')}
            </div>

            <!-- Days Grid -->
            <div class="grid grid-cols-7 gap-1.5 justify-items-center" id="cal-days-grid">
              ${cellsHTML}
            </div>
          </div>
        `;

        // Bind events inside popup body
        picker.modalBody.querySelector('#cal-prev-month-btn').addEventListener('click', (ev) => {
          ev.stopPropagation();
          calMonth--;
          if (calMonth < 0) {
            calMonth = 11;
            calYear--;
          }
          drawDatePickerCalendar();
        });

        picker.modalBody.querySelector('#cal-next-month-btn').addEventListener('click', (ev) => {
          ev.stopPropagation();
          calMonth++;
          if (calMonth > 11) {
            calMonth = 0;
            calYear++;
          }
          drawDatePickerCalendar();
        });

        picker.modalBody.querySelectorAll('#cal-days-grid button').forEach(btn => {
          btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const selectedDateStr = btn.getAttribute('data-date');
            input.value = selectedDateStr;
            dateDisplay.innerText = formatSelectedDate(new Date(selectedDateStr));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            picker.close();
          });
        });
      };

      // Initial Draw call
      drawDatePickerCalendar();
    });
  });
}

// Sub-helper to create modal picker overlay cleanly for calendar
function createPickerPopupSkeleton(title) {
  return createPickerModal(title, `<div class="animate-fadeIn">جاري التحميل...</div>`);
}

function adjustedDateString(date) {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
}

function formatSelectedDate(date) {
  const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  return `${date.getDate()} ${monthNamesAr[date.getMonth()]} ${date.getFullYear()}`;
}
