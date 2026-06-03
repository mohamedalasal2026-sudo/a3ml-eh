/**
 * Action Completion & Latency Impact Rating Modal Component
 */

import { state, saveState } from '../state/store.js';
import { pushSyncUpdate } from '../services/sync.js';
import { triggerUIRender } from '../state/actions.js';

export function completeAction(actionId) {
  state.completedActionRating.activeCardId = actionId;
  state.completedActionRating.selectedRating = 0;
  state.completedActionRating.selectedImprovementTime = '15m'; // Default

  const stars = document.querySelectorAll('.star-icon');
  stars.forEach(s => {
    s.classList.remove('text-black');
    s.classList.add('text-neutral-200');
  });

  const btns = document.querySelectorAll('.time-btn');
  btns.forEach((btn, idx) => {
    if (idx === 0) {
      btn.className = "py-2 text-[10px] font-bold rounded-xl bg-white text-black shadow-sm border border-neutral-200/50 transition-all text-center time-btn select-none";
    } else {
      btn.className = "py-2 text-[10px] font-bold rounded-xl text-neutral-500 hover:text-black transition-all text-center time-btn select-none";
    }
  });

  const modal = document.getElementById('rating-modal');
  const card = document.getElementById('rating-modal-card');
  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    if (window.pushModalHistory) window.pushModalHistory();
  }
}

export function setImprovementTime(val, btn) {
  state.completedActionRating.selectedImprovementTime = val;
  const btns = document.querySelectorAll('.time-btn');
  btns.forEach(b => {
    b.className = "py-2 text-[10px] font-bold rounded-xl text-neutral-500 hover:text-black transition-all text-center time-btn select-none";
  });
  if (btn) {
    btn.className = "py-2 text-[10px] font-bold rounded-xl bg-white text-black shadow-sm border border-neutral-200/50 transition-all text-center time-btn select-none";
  }
}

export function closeRatingModal() {
  const modal = document.getElementById('rating-modal');
  const card = document.getElementById('rating-modal-card');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.add('scale-95');
    card.classList.remove('scale-100');
  }
  if (window.popModalHistory) window.popModalHistory();
}

export function hoverRating(val) {
  for (let i = 1; i <= 5; i++) {
    const star = document.querySelector(`[data-star="${i}"] .star-icon`);
    if (star) {
      if (i <= val) {
        star.classList.add('text-black');
        star.classList.remove('text-neutral-200');
      } else {
        star.classList.remove('text-black');
        star.classList.add('text-neutral-200');
      }
    }
  }
}

export function resetRatingHover() {
  const selected = state.completedActionRating.selectedRating;
  for (let i = 1; i <= 5; i++) {
    const star = document.querySelector(`[data-star="${i}"] .star-icon`);
    if (star) {
      if (i <= selected) {
        star.classList.add('text-black');
        star.classList.remove('text-neutral-200');
      } else {
        star.classList.remove('text-black');
        star.classList.add('text-neutral-200');
      }
    }
  }
}

export function setRating(val) {
  state.completedActionRating.selectedRating = val;
  resetRatingHover();
}

export function submitRating() {
  const rating = state.completedActionRating.selectedRating;
  const cardId = state.completedActionRating.activeCardId;
  const timeVal = state.completedActionRating.selectedImprovementTime || '15m';

  if (rating === 0) {
    alert("من فضلك قيم تأثير الخطوة دي بنجمة واحدة على الأقل.");
    return;
  }

  const symptom = state.symptoms.find(s => s.id === state.activeSymptomId);
  if (symptom) {
    const act = symptom.actions[state.activeTab].find(a => a.id === cardId);
    if (act) {
      let timeBonus = 0;
      if (timeVal === '15m') timeBonus = 2;
      else if (timeVal === '1h') timeBonus = 1;
      else if (timeVal === '4h') timeBonus = 0;
      else if (timeVal === '1d') timeBonus = -1;

      act.weight = Math.min(10, Math.max(1, act.weight + (rating - 3) + timeBonus));

      const todayIdx = 6;
      state.historicalData.scores[todayIdx] = Math.min(5.0, parseFloat((state.historicalData.scores[todayIdx] + rating * 0.1).toFixed(2)));
      state.historicalData.reactions[todayIdx] = Math.max(2.0, parseFloat((state.historicalData.reactions[todayIdx] - rating * 0.8).toFixed(1)));

      state.ratingsHistory.push({
        actionId: cardId,
        rating: rating,
        timeVal: timeVal,
        timestamp: Date.now()
      });

      state.lastCompletedActionId = cardId;
      state.lastCompletedFeelingId = state.activeSymptomId;

      state.sessionSkippedActions.push(cardId);
    }
  }

  closeRatingModal();
  
  if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
  if (window.renderActionStack) window.renderActionStack();
  if (window.renderSkippedTray) window.renderSkippedTray();
  
  triggerUIRender();
  if (window.renderSidebarWidgets) window.renderSidebarWidgets();
  pushSyncUpdate();
  saveState(true);

  let arabicTimeLabel = "ربع ساعة";
  if (timeVal === '1h') arabicTimeLabel = "ساعة";
  else if (timeVal === '4h') arabicTimeLabel = "4 ساعات";
  else if (timeVal === '1d') arabicTimeLabel = "تاني يوم";

  if (window.showToast) window.showToast(`سجلنا تقييمك (${rating} نجوم) والتحسن خلال ${arabicTimeLabel}! 🎉`, "success");
}

// Bind to window for HTML events / inline JS compatibility
window.completeAction = completeAction;
window.setImprovementTime = setImprovementTime;
window.closeRatingModal = closeRatingModal;
window.hoverRating = hoverRating;
window.resetRatingHover = resetRatingHover;
window.setRating = setRating;
window.submitRating = submitRating;
