/**
 * Treatment History Modal Component
 * Displays the complete log of completed and rated therapeutic actions
 */

import { state, saveState } from '../state/store.js';

export function openTreatmentHistoryModal() {
  const modal = document.getElementById('treatment-history-modal');
  const card = document.getElementById('treatment-history-card');
  if (modal && card) {
    renderTreatmentHistory();
    modal.classList.remove('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    if (window.pushModalHistory) window.pushModalHistory();
  }
}

export function closeTreatmentHistoryModal() {
  const modal = document.getElementById('treatment-history-modal');
  const card = document.getElementById('treatment-history-card');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.add('scale-95');
    card.classList.remove('scale-100');
  }
  if (window.popModalHistory) window.popModalHistory();
}

export function renderTreatmentHistory() {
  const container = document.getElementById('treatment-history-content');
  if (!container) return;

  const history = [...(state.ratingsHistory || [])].sort((a, b) => b.timestamp - a.timestamp);

  if (history.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
        <div class="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400">
          <i class="ti ti-history-off text-2xl"></i>
        </div>
        <div>
          <h4 class="text-xs font-bold text-neutral-900">سجل العلاج فارغ</h4>
          <p class="text-[10px] text-neutral-400 mt-1 leading-relaxed">
            لم تقم بتقييم أي خطوات علاجية بعد. بمجرد إكمال خطوة علاجية لأي شعور وتقييمها، ستظهر هنا بالتفصيل.
          </p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = history.map(item => {
    let actionTitle = "خطوة علاجية غير معروفة";
    let feelingTitleAr = "شعور عام";
    let feelingIcon = "ti-heart";
    let feelingCategory = "عام";

    // Locate the action and its parent symptom to display context
    for (const symptom of state.symptoms) {
      const allActions = [
        ...(symptom.actions.near || []),
        ...(symptom.actions.mid || []),
        ...(symptom.actions.long || [])
      ];
      const foundAction = allActions.find(a => a.id === item.actionId);
      if (foundAction) {
        actionTitle = foundAction.title;
        feelingTitleAr = symptom.titleAr;
        feelingIcon = symptom.icon;
        feelingCategory = symptom.category || "عام";
        break;
      }
    }

    // Format Arabic time label
    let timeLabel = "ربع ساعة";
    if (item.timeVal === '1h') timeLabel = "ساعة";
    else if (item.timeVal === '4h') timeLabel = "4 ساعات";
    else if (item.timeVal === '1d') timeLabel = "تاني يوم";

    // Format Timestamp
    const date = new Date(item.timestamp);
    const timeString = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateString = date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    const relativeDay = getRelativeDayName(date);

    // Stars HTML
    const starsHTML = Array.from({ length: 5 }, (_, i) => {
      const active = i < item.rating;
      return `<svg class="w-3.5 h-3.5 ${active ? 'text-amber-500' : 'text-neutral-200'} fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
    }).join('');

    const isSvg = feelingIcon.startsWith('<svg');
    const iconHTML = isSvg
      ? feelingIcon.replace('w-6 h-6', 'w-4 h-4 text-neutral-800')
      : `<i class="ti ti-${feelingIcon} text-sm text-neutral-800"></i>`;

    return `
      <div class="border border-neutral-200/80 bg-[#FAFAFA]/50 hover:bg-white rounded-2xl p-4 transition-all duration-200 text-right space-y-3 group shadow-sm hover:shadow">
        <div class="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2">
          <!-- Feeling Badge -->
          <div class="flex items-center gap-2">
            <span class="p-1.5 bg-neutral-100 rounded-lg flex items-center justify-center">
              ${iconHTML}
            </span>
            <div class="leading-none">
              <span class="text-xs font-bold text-neutral-900 block">${feelingTitleAr}</span>
              <span class="text-[8px] text-neutral-400 font-sans">${feelingCategory}</span>
            </div>
          </div>

          <!-- Timestamp -->
          <div class="text-left font-sans leading-none">
            <span class="text-[9px] font-bold text-neutral-500 block">${relativeDay}</span>
            <span class="text-[8px] text-neutral-400 block mt-0.5">${timeString}</span>
          </div>
        </div>

        <!-- Action description -->
        <p class="text-xs text-neutral-800 leading-relaxed font-sans font-medium">
          ${actionTitle}
        </p>

        <!-- Rating and Impact time -->
        <div class="flex items-center justify-between pt-1 text-[10px] text-neutral-500 font-sans">
          <!-- Stars -->
          <div class="flex items-center gap-0.5">
            ${starsHTML}
          </div>

          <!-- Time impact badge -->
          <div class="flex items-center gap-1 bg-neutral-100/80 text-neutral-600 px-2 py-0.5 rounded-md font-bold text-[9px]">
            <i class="ti ti-hourglass-low text-[10px]"></i>
            <span>تأثير خلال: ${timeLabel}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getRelativeDayName(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'اليوم';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'أمس';
  } else {
    return date.toLocaleDateString('ar-EG', { weekday: 'long', month: 'short', day: 'numeric' });
  }
}

// Bind to window for HTML events / inline JS compatibility
window.openTreatmentHistoryModal = openTreatmentHistoryModal;
window.closeTreatmentHistoryModal = closeTreatmentHistoryModal;
window.renderTreatmentHistory = renderTreatmentHistory;
