/**
 * Feelings Grid and Categories Manager Component
 */

import { state, saveState } from '../state/store.js';
import { pushSyncUpdate } from '../services/sync.js';

export function renderFeelingsDashboard() {
  const grid = document.getElementById('symptom-grid');
  if (!grid) return;

  let filteredSymptoms = state.symptoms;
  if (state.activeCategoryFilter && state.activeCategoryFilter !== 'all') {
    filteredSymptoms = state.symptoms.filter(s => (s.category || 'عام') === state.activeCategoryFilter);
  }

  if (filteredSymptoms.length === 0) {
    grid.innerHTML = `
      <div class="col-span-2 border border-dashed border-neutral-200 bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
        <div class="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400 mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-neutral-900">مفيش مشاعر هنا</h4>
          <p class="text-xs text-neutral-400 mt-1">مفيش أي مشاعر أو أحاسيس متسجلة تحت تصنيف "${state.activeCategoryFilter}" حالياً.</p>
        </div>
        <button onclick="openHomeFABModal()" class="py-2 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors mx-auto">
          + ضيف إحساس مخصص
        </button>
      </div>
    `;
    return;
  }

  const addCardHTML = `
    <div onclick="openHomeFABModal()" class="relative border border-dashed border-neutral-300 hover:border-black bg-[#FAFAFA]/50 hover:bg-white rounded-3xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-center items-center h-40 group text-center space-y-2 shadow-sm">
      <div class="p-3 bg-neutral-50 group-hover:bg-black rounded-2xl transition-all duration-300 flex items-center justify-center">
        <i class="ti ti-plus text-lg text-neutral-800 transition-colors group-hover:text-white"></i>
      </div>
      <div>
        <h4 class="text-xs font-bold text-neutral-900 font-sans">إضافة إحساس مخصص</h4>
        <p class="text-[9px] text-neutral-400 mt-0.5 font-sans">اضغط لإضافة شعور أو ألم مخصص</p>
      </div>
    </div>
  `;

  grid.innerHTML = filteredSymptoms.map(symptom => {
    const nearCount = symptom.actions.near ? symptom.actions.near.filter(a => !state.sessionSkippedActions.includes(a.id)).length : 0;
    const longCount = symptom.actions.long ? symptom.actions.long.filter(a => !state.sessionSkippedActions.includes(a.id)).length : 0;
    const totalActiveActions = nearCount + longCount;

    const isSvg = symptom.icon.startsWith('<svg');
    const iconHTML = isSvg
      ? symptom.icon.replace('w-6 h-6', 'w-5 h-5 text-neutral-800 transition-all duration-300 group-hover:text-white')
      : `<i class="ti ti-${symptom.icon} text-lg text-neutral-800 transition-all duration-300 group-hover:text-white"></i>`;

    return `
      <div onclick="showSymptomDetail('${symptom.id}')" class="relative feeling-card border border-neutral-200 bg-white rounded-3xl p-5 hover:border-black transition-all duration-300 cursor-pointer flex flex-col justify-between h-40 group shadow-sm hover:shadow">
        <!-- Edit Button Trigger -->
        <button onclick="event.stopPropagation(); openEditModal('feeling', '${symptom.id}')" class="absolute top-3 left-3 p-1.5 bg-neutral-50 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100" title="تعديل أو حذف الإحساس">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <div class="flex items-start justify-between">
          <div class="p-3 bg-neutral-50 group-hover:bg-black group-hover:text-white rounded-2xl transition-all duration-300">
            ${iconHTML}
          </div>
          <span class="text-[9px] bg-neutral-100 group-hover:bg-neutral-200 text-neutral-500 font-bold px-2.5 py-1 rounded-full font-sans">${totalActiveActions} خطوة</span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h3 class="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-sans">${symptom.titleEn}</h3>
            <span class="text-[9px] bg-neutral-50 text-neutral-400 px-1.5 py-0.5 rounded-md font-sans">${symptom.category || 'عام'}</span>
          </div>
          <h4 class="text-sm font-bold text-neutral-900 mt-0.5">${symptom.titleAr}</h4>
        </div>
      </div>
    `;
  }).join('') + addCardHTML;
  
  if (window.lucide) window.lucide.createIcons();
}

export function renderCategoryFilterBar() {
  const pillsContainer = document.getElementById('category-filter-pills');
  if (!pillsContainer) return;

  const allActive = state.activeCategoryFilter === 'all' ? 'bg-black text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:text-black';

  let pillsHTML = `
    <button onclick="setCategoryFilter('all')" class="flex-shrink-0 px-3.5 py-1.5 rounded-pill text-xs font-bold transition-all duration-200 border shadow-sm select-none ${allActive}">
      الكل
    </button>
  `;

  state.categories.forEach(cat => {
    const isActive = state.activeCategoryFilter === cat;
    const activeClass = isActive ? 'bg-black text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:text-black';
    pillsHTML += `
      <button onclick="setCategoryFilter('${cat}')" class="flex-shrink-0 px-3.5 py-1.5 rounded-pill text-xs font-bold transition-all duration-200 border shadow-sm select-none ${activeClass}">
        ${cat}
      </button>
    `;
  });

  pillsContainer.innerHTML = pillsHTML;
}

export function setCategoryFilter(cat) {
  state.activeCategoryFilter = cat;
  renderCategoryFilterBar();
  renderFeelingsDashboard();
  saveState(false); // Silent save
}

export function toggleCategoryManager() {
  const panel = document.getElementById('category-manager-panel');
  if (panel) {
    panel.classList.toggle('hidden');
    renderManagerCategoriesList();
  }
}

export function renderManagerCategoriesList() {
  const listContainer = document.getElementById('manager-categories-list');
  if (!listContainer) return;

  if (state.categories.length === 0) {
    listContainer.innerHTML = `<span class="text-xs text-neutral-400 py-1">لا توجد تصنيفات حالياً.</span>`;
    return;
  }

  listContainer.innerHTML = state.categories.map(cat => `
    <div class="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/80 px-3 py-1.5 rounded-pill text-xs font-bold">
      <span>${cat}</span>
      <button type="button" onclick="openEditModal('category', '${cat}')" class="text-neutral-400 hover:text-black transition-colors" title="تعديل أو حذف التصنيف">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </button>
    </div>
  `).join('');
}

export function handleAddCategory(e) {
  e.preventDefault();
  const input = document.getElementById('new-category-input');
  const catName = input ? input.value.trim() : '';
  if (!catName) return;

  if (state.categories.includes(catName)) {
    if (window.triggerToastNotification) {
      window.triggerToastNotification("التصنيف ده موجود بالفعل! ⚠️");
    }
    return;
  }

  state.categories.push(catName);
  input.value = '';

  renderManagerCategoriesList();
  renderCategoryFilterBar();
  saveState(true);
  pushSyncUpdate();
  if (window.triggerToastNotification) {
    window.triggerToastNotification("ضفنا التصنيف الجديد بنجاح! 🎉");
  }
}

// Bind to window for HTML events / inline JS compatibility
window.renderSymptomGrid = renderFeelingsDashboard;
window.renderFeelingsDashboard = renderFeelingsDashboard;
window.renderCategoryFilterBar = renderCategoryFilterBar;
window.setCategoryFilter = setCategoryFilter;
window.toggleCategoryManager = toggleCategoryManager;
window.renderManagerCategoriesList = renderManagerCategoriesList;
window.handleAddCategory = handleAddCategory;
