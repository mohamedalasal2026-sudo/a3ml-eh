/**
 * Symptom Detailed Interventions View & Tab Managers Component
 */

import { state, saveState } from '../state/store.js';
import { calculateAdvancedCorrelations } from '../services/analytics.js';
import { updateNavButtons } from './navigation.js';

export function showSymptomDetail(id) {
  state.activeSymptomId = id;
  state.lastInteractedContext = 'symptom-details';
  state.activeTab = 'near';

  // PWA History integration
  if (!window.isPopStateNavigation) {
    window.history.pushState({ page: 'symptom-detail', symptomId: id }, "");
  }

  const symptom = state.symptoms.find(s => s.id === id);
  if (!symptom) return;

  document.getElementById('dashboard-view').classList.add('hidden');
  document.getElementById('recovery-view').classList.add('hidden');
  document.getElementById('symptom-detail-view').classList.remove('hidden');

  const analyticsDashboard = document.getElementById('analytics-dashboard');
  if (analyticsDashboard) analyticsDashboard.classList.add('hidden');

  document.getElementById('symptom-title-en').innerText = symptom.titleEn;
  document.getElementById('symptom-title-ar').innerText = symptom.titleAr;
  document.getElementById('symptom-ar-badge').innerText = symptom.titleAr;

  const iconBox = document.getElementById('symptom-icon-box');
  if (iconBox) {
    const isSvg = symptom.icon.startsWith('<svg');
    iconBox.innerHTML = isSvg
      ? symptom.icon.replace('w-6 h-6', 'w-6 h-6 text-white')
      : `<i class="ti ti-${symptom.icon} text-xl text-white"></i>`;
  }

  const allActionsContainer = document.getElementById('all-actions-list-container');
  const allActionsIcon = document.getElementById('toggle-all-actions-icon');
  const allActionsText = document.getElementById('all-actions-toggle-text');
  if (allActionsContainer) allActionsContainer.classList.add('hidden');
  if (allActionsIcon) allActionsIcon.style.transform = 'rotate(0deg)';
  if (allActionsText) allActionsText.innerText = 'عرض الكل';

  updateNavButtons('details'); // Deselect navigation highlight

  if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
  if (window.renderActionStack) window.renderActionStack();
  if (window.renderSkippedTray) window.renderSkippedTray();
  calculateAdvancedCorrelations();
  if (window.renderMobileBottomNav) window.renderMobileBottomNav();
  saveState(false);
}

export function switchTab(tabName) {
  state.activeTab = tabName;
  if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
  if (window.renderActionStack) window.renderActionStack();
}

export function renderActionTabsAndCounts() {
  const symptom = state.symptoms.find(s => s.id === state.activeSymptomId);
  if (!symptom) return;

  const tabs = ['near', 'long'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    const countEl = document.getElementById(`tab-${t}-count`);
    const activeActions = symptom.actions[t] ? symptom.actions[t].filter(a => !state.sessionSkippedActions.includes(a.id)) : [];

    if (countEl) countEl.innerText = activeActions.length;

    if (btn) {
      if (state.activeTab === t) {
        btn.className = "flex items-center justify-between px-4 py-2.5 rounded-xl text-right text-xs font-bold bg-black text-white transition-all duration-200 w-full";
      } else {
        btn.className = "flex items-center justify-between px-4 py-2.5 rounded-xl text-right text-xs font-bold hover:bg-neutral-100 text-neutral-600 transition-all duration-200 border border-transparent w-full";
      }
    }
  });
}

export function toggleAllActionsList() {
  const container = document.getElementById('all-actions-list-container');
  const icon = document.getElementById('toggle-all-actions-icon');
  const text = document.getElementById('all-actions-toggle-text');
  if (!container || !icon || !text) return;

  container.classList.toggle('hidden');
  if (container.classList.contains('hidden')) {
    icon.style.transform = 'rotate(0deg)';
    text.innerText = 'عرض الكل';
  } else {
    icon.style.transform = 'rotate(180deg)';
    text.innerText = 'إخفاء الكل';
    renderAllActionsList();
  }
}

export function renderAllActionsList() {
  const container = document.getElementById('all-actions-list-container');
  if (!container) return;

  const symptom = state.symptoms.find(s => s.id === state.activeSymptomId);
  if (!symptom) return;

  const tabs = [
    { key: 'near', label: 'حاجات تعملها حالاً (ربع ساعة)' },
    { key: 'long', label: 'نصائح على المدى الطويل (عادة يومية)' }
  ];

  let html = "";
  tabs.forEach(t => {
    const actions = symptom.actions[t.key] || [];
    html += `
      <div class="space-y-2 pt-2 border-b border-neutral-100/50 pb-3">
        <h4 class="text-[10px] font-bold text-neutral-400 font-sans tracking-wide block text-right">${t.label}</h4>
        <div class="space-y-1.5">
          ${actions.length === 0 ? `
            <p class="text-[10px] text-neutral-400 italic text-center py-2 bg-neutral-50/50 rounded-xl">لا توجد خطوات في هذا القسم.</p>
          ` : actions.map(act => `
            <div class="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-100 hover:border-neutral-200 rounded-2xl transition-all animate-fadeIn">
              <span class="text-xs text-neutral-700 font-medium font-sans truncate flex-1 pl-3 text-right">${act.title}</span>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-[9px] font-bold font-sans text-neutral-500 bg-neutral-100/80 px-2 py-0.5 rounded-md">أهمية: ${window.getWeightLabel(act.weight)}</span>
                <button onclick="openEditModal('action', '${act.id}')" class="p-1 hover:bg-neutral-200 text-neutral-400 hover:text-black rounded-lg transition-colors" title="تعديل أو حذف الخطوة">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

// Bind to window for HTML events / inline JS compatibility
window.showSymptomDetail = showSymptomDetail;
window.switchTab = switchTab;
window.renderActionTabsAndCounts = renderActionTabsAndCounts;
window.toggleAllActionsList = toggleAllActionsList;
window.renderAllActionsList = renderAllActionsList;
