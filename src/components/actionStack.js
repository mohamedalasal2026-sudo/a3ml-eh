/**
 * Therapeutic Actions Deck Stack & Gestures Component
 */

import { state } from '../state/store.js';

let swipeStartX = 0;
let swipeCurrentX = 0;
let isSwiping = false;

export function renderActionStack() {
  const container = document.getElementById('action-stack-container');
  if (!container) return;

  const symptom = state.symptoms.find(s => s.id === state.activeSymptomId);
  if (!symptom) return;

  let actions = symptom.actions[state.activeTab] ? [...symptom.actions[state.activeTab]] : [];
  actions = actions.filter(a => !state.sessionSkippedActions.includes(a.id));
  actions.sort((a, b) => b.weight - a.weight);

  const badge = document.getElementById('stack-count-badge');
  if (badge) {
    badge.innerText = actions.length > 0 ? `خطوة 1 من ${actions.length}` : `تم إنجاز كل الخطوات!`;
  }

  if (actions.length === 0) {
    container.innerHTML = `
      <div class="border border-dashed border-neutral-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 h-[280px]">
        <div class="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-black">
          <i class="ti ti-sparkles text-xl"></i>
        </div>
        <div>
          <h4 class="text-sm font-bold text-neutral-900">عاش جداً يا بطل!</h4>
          <p class="text-xs text-neutral-400 mt-1">خلصت كل خطوات العلاج المتاحة في القسم ده النهاردة.</p>
        </div>
        <button onclick="clearSkipped()" class="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-xs font-bold rounded-pill transition-colors mt-2">
          رجع الخطوات اللي عديتها
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = actions.map((act, index) => {
    let cardClass = "";
    let blurStyle = "";
    let opacityStyle = "";
    let interactiveAttr = "disabled";
    let pointerEvents = "pointer-events-none";
    let hoverSkip = "";
    let indexStyle = `z-index: ${15 - index}; transform: translateY(${index * 14}px) scale(${1 - index * 0.04});`;

    if (index === 0) {
      cardClass = "border-black shadow-xl";
      interactiveAttr = "";
      pointerEvents = "pointer-events-auto cursor-grab active:cursor-grabbing";
      hoverSkip = `
        <button onclick="skipAction('${act.id}')" class="text-neutral-400 hover:text-black transition-colors p-1 flex items-center gap-1 text-[10px] font-bold">
          <i class="ti ti-eye-off text-xs"></i>
          <span>عدي الخطوة دي</span>
        </button>
      `;
    } else if (index === 1) {
      cardClass = "border-neutral-200 select-none";
      blurStyle = "filter: blur(1.5px);";
      opacityStyle = "opacity: 0.35;";
    } else {
      cardClass = "border-neutral-100 select-none";
      blurStyle = "filter: blur(5px);";
      opacityStyle = "opacity: 0.08;";
    }

    return `
      <div id="card-${act.id}" 
           style="${indexStyle} ${blurStyle} ${opacityStyle}" 
           class="absolute inset-x-0 top-0 border bg-white rounded-3xl p-6 transition-all duration-500 ease-out flex flex-col justify-between min-h-[220px] action-card ${cardClass} ${pointerEvents}"
           onmousedown="startCardSwipe(event, '${act.id}', ${index})"
           ontouchstart="startCardSwipe(event, '${act.id}', ${index})">
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-[9px] text-neutral-400 font-bold uppercase tracking-wider font-sans">خطوة مقترحة</span>
              ${index === 0 ? `
              <button onclick="event.stopPropagation(); openEditModal('action', '${act.id}')" class="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-black transition-colors" title="تعديل أو حذف الخطوة">
                <i class="ti ti-edit text-xs"></i>
              </button>
              ` : ''}
            </div>
            <div class="flex items-center gap-1.5 text-[9px] font-bold font-sans text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              <i class="ti ti-trending-up text-xs text-black"></i>
              <span>الأهمية: ${window.getWeightLabel(act.weight)}</span>
            </div>
          </div>
          <h3 class="text-base font-bold text-neutral-900 leading-snug">${act.title}</h3>
        </div>
        
        <div class="flex items-center justify-between pt-4 border-t border-neutral-100">
          ${hoverSkip}
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation(); openActionReminderModal('${act.id}', '${act.title.replace(/'/g, "\\'")}')" ${interactiveAttr} class="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-400 text-neutral-800 text-xs font-bold rounded-pill transition-colors flex items-center gap-1.5">
              <i class="ti ti-bell text-sm"></i>
              <span>هعمله</span>
            </button>
            <button onclick="completeAction('${act.id}')" ${interactiveAttr} class="py-2.5 px-5 bg-black hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-xs font-bold rounded-pill transition-colors flex items-center gap-1.5">
              <i class="ti ti-check text-base"></i>
              <span>خلصتها</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  if (window.lucide) window.lucide.createIcons();
}

export function startCardSwipe(e, actionId, index) {
  if (index !== 0) return;
  // Prevent swipe when clicking interactive buttons
  if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('svg') || e.target.closest('path')) return;
  
  isSwiping = true;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  swipeStartX = clientX;
  swipeCurrentX = clientX;

  const card = document.getElementById(`card-${actionId}`);
  if (!card) return;
  card.style.transition = "none";

  function onMove(ev) {
    if (!isSwiping) return;
    const currentX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    swipeCurrentX = currentX;
    const diffX = swipeCurrentX - swipeStartX;
    card.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.05}deg)`;
  }

  function onEnd() {
    if (!isSwiping) return;
    isSwiping = false;
    card.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";

    const diffX = swipeCurrentX - swipeStartX;
    const threshold = 120;

    if (Math.abs(diffX) > threshold) {
      card.style.transform = `translateX(${diffX > 0 ? 500 : -500}px) rotate(${diffX * 0.1}deg)`;
      card.style.opacity = "0";
      setTimeout(() => {
        if (window.skipAction) window.skipAction(actionId);
      }, 300);
    } else {
      card.style.transform = "translateX(0px) rotate(0deg) scale(1)";
    }

    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchmove', onMove);
  document.addEventListener('touchend', onEnd);
}

export function renderSkippedTray() {
  const trayContainer = document.getElementById('skipped-tray-container');
  const trayPills = document.getElementById('skipped-tray-pills');
  if (!trayContainer || !trayPills) return;

  const symptom = state.symptoms.find(s => s.id === state.activeSymptomId);
  if (!symptom) {
    trayContainer.classList.add('hidden');
    return;
  }

  let skipped = symptom.actions[state.activeTab] ? symptom.actions[state.activeTab].filter(a => state.sessionSkippedActions.includes(a.id)) : [];

  if (skipped.length === 0) {
    trayContainer.classList.add('hidden');
    return;
  }

  trayContainer.classList.remove('hidden');
  trayPills.innerHTML = skipped.map(act => `
    <button onclick="restoreSkippedAction('${act.id}')" class="flex items-center gap-1 bg-white border border-neutral-200 px-3 py-1.5 rounded-full hover:border-black transition-all text-[10px] font-bold font-sans">
      <span>${act.title.substring(0, 18)}...</span>
      <i class="ti ti-plus text-xs text-neutral-400"></i>
    </button>
  `).join('');
  
  if (window.lucide) window.lucide.createIcons();
}

// Bind to window for HTML events / inline JS compatibility
window.renderActionStack = renderActionStack;
window.startCardSwipe = startCardSwipe;
window.renderSkippedTray = renderSkippedTray;
