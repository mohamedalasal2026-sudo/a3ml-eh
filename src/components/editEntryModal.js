/**
 * Form Modal for Editing or Deleting Application Items
 */

import { state, saveState } from '../state/store.js';
import { pushSyncUpdate } from '../services/sync.js';
import { getSelectedFormIcon, setSelectedFormIcon, renderVisualIconPicker } from './iconPicker.js';
import { syncTaskNotification, syncRoutineNotification, cancelOneSignalNotification } from '../services/notifications.js';

function calculateImportance(rating, timeVal) {
  const base = Math.min(10, Math.max(2, rating * 2));
  let multiplier = 1;
  if (timeVal === 'near') multiplier = 0.8;
  else if (timeVal === 'mid') multiplier = 1;
  else if (timeVal === 'long') multiplier = 1.2;
  const weight = Math.min(10, Math.max(1, Math.round(base * multiplier)));
  let label = '';
  if (timeVal === 'near') label = 'مسكّن سريع';
  else if (timeVal === 'mid') label = 'تست كومبش';
  else if (timeVal === 'long') label = 'علاج جذري';
  return { weight, label };
}

export function findActionById(actionId) {
  for (let s of state.symptoms) {
    for (let tab of ['near', 'mid', 'long']) {
      if (s.actions && s.actions[tab]) {
        const act = s.actions[tab].find(a => a.id === actionId);
        if (act) return { symptom: s, tab: tab, action: act };
      }
    }
  }
  return null;
}

export function openEditModal(type, id) {
  const modal = document.getElementById('edit-item-modal');
  const card = document.getElementById('edit-item-modal-card');
  const title = document.getElementById('edit-modal-title');
  const formFields = document.getElementById('edit-modal-form-fields');

  if (!modal || !card || !title || !formFields) return;

  document.getElementById('edit-item-id').value = id;
  document.getElementById('edit-item-type').value = type;

  if (type === 'feeling') {
    const symptom = state.symptoms.find(s => s.id === id);
    if (!symptom) return;

    title.innerText = "تعديل إحساس أو شعور مخصص";
    setSelectedFormIcon(symptom.icon.startsWith('<svg') ? 'mood-sad' : symptom.icon);

    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">الاسم بالإنجليزي (EN)</label>
        <input type="text" required name="titleEn" value="${symptom.titleEn}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">الاسم بالعربي (AR)</label>
        <input type="text" required name="titleAr" value="${symptom.titleAr}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">التصنيف المرتبط</label>
        <select name="category" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          ${state.categories.map(cat => '<option value="' + cat + '" ' + (symptom.category === cat ? 'selected' : '') + '>' + cat + '</option>').join('')}
          <option value="عام" ${(symptom.category || 'عام') === 'عام' ? 'selected' : ''}>عام</option>
        </select>
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اختر الأيقونة (أكثر من 100 أيقونة)</label>
          <input type="text" oninput="filterIconPicker(this.value, 'edit-icon-picker-grid')" placeholder="ابحث..." class="px-2 py-1 text-[10px] border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-sans w-24 bg-[#FAFAFA] text-right">
        </div>
        <!-- Quick Category Filters -->
        <div class="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar text-[9px] font-bold">
          <button type="button" onclick="filterIconCategory('الكل', 'edit-icon-picker-grid', this)" class="px-2.5 py-1 bg-black text-white rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">الكل</button>
          <button type="button" onclick="filterIconCategory('مشاعر سلبية', 'edit-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">مشاعر سلبية</button>
          <button type="button" onclick="filterIconCategory('مشاكل نفسية', 'edit-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">مشاكل نفسية</button>
          <button type="button" onclick="filterIconCategory('ألم وإعياء', 'edit-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">ألم وإعياء</button>
          <button type="button" onclick="filterIconCategory('مشاعر إيجابية', 'edit-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">مشاعر إيجابية</button>
          <button type="button" onclick="filterIconCategory('علاقات', 'edit-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">علاقات</button>
        </div>
        <div class="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 border border-neutral-100 rounded-2xl bg-neutral-50/50" id="edit-icon-picker-grid">
          <!-- Populated visually -->
        </div>
      </div>
    `;

    renderVisualIconPicker('edit-icon-picker-grid');
  } else if (type === 'action') {
    const found = findActionById(id);
    if (!found) return;
    const act = found.action;

    title.innerText = "تعديل خطوة علاجية";
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">خطوة العلاج المقترحة</label>
        <input type="text" required name="title" value="${act.title}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">فترة ومدة التنفيذ</label>
        <select name="actionTab" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          <option value="near" ${found.tab === 'near' ? 'selected' : ''}>حاجات تعملها حالاً (ربع ساعة)</option>
          <option value="long" ${found.tab === 'long' ? 'selected' : ''}>نصائح على المدى الطويل (عادة يومية)</option>
        </select>
      </div>
    `;
  } else if (type === 'metric') {
    const metric = state.dailyStatus.customMetrics.find(m => m.id === id);
    if (!metric) return;

    title.innerText = "تعديل مؤشر صحي يومي";
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اسم المؤشر</label>
        <input type="text" required name="label" value="${metric.label}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">طريقة القياس والتقييم</label>
        <select name="metricType" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          <option value="binary" ${metric.type === 'binary' ? 'selected' : ''}>نعم / لا (صح وغلط)</option>
          <option value="numeric" ${metric.type === 'numeric' ? 'selected' : ''}>ساعات أو أرقام (عداد تقييم)</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">التصنيف المرتبط</label>
        <select name="category" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          ${state.categories.map(cat => `<option value="${cat}" ${metric.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
          <option value="عام" ${(metric.category || 'عام') === 'عام' ? 'selected' : ''}>عام</option>
        </select>
      </div>
    `;
  } else if (type === 'task') {
    const task = state.dailyStatus.tasks.find(t => t.id === id);
    if (!task) return;

    title.innerText = "تعديل مهمة يومية";
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اسم المهمة</label>
        <input type="text" required name="label" value="${task.label}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">التصنيف المرتبط</label>
        <select name="category" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          ${state.categories.map(cat => `<option value="${cat}" ${task.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
          <option value="عام" ${(task.category || 'عام') === 'عام' ? 'selected' : ''}>عام</option>
        </select>
      </div>
    `;
  } else if (type === 'routine') {
    const routine = state.routines.find(r => r.id === id);
    if (!routine) return;

    title.innerText = "تعديل الروتين / العادة";
    setSelectedFormIcon(routine.icon);

    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اسم الروتين / العادة</label>
        <input type="text" required name="routineTitle" value="${routine.title}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">الهدف الأساسي</label>
        <input type="text" required name="routineGoal" value="${routine.goal}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">المشكلة / الشعور المستهدف حله</label>
        <select name="routineTarget" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          <option value="" ${!routine.targetSymptomId ? 'selected' : ''}>لا يوجد (شعور عام)</option>
          ${state.symptoms.map(s => `<option value="${s.id}" ${routine.targetSymptomId === s.id ? 'selected' : ''}>${s.titleAr}</option>`).join('')}
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">وقت بداية الروتين</label>
        <input type="time" required name="routineStartTime" value="${routine.startTime || '08:00'}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <input type="hidden" name="routineNotificationEnabled" value="${routine.notificationEnabled !== false ? 'true' : 'false'}">
      <input type="hidden" name="routineNotificationOffset" value="${routine.notificationOffset || 0}">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اختر الأيقونة</label>
          <input type="text" oninput="filterIconPicker(this.value, 'edit-routine-icon-picker-grid')" placeholder="ابحث..." class="px-2 py-1 text-[10px] border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-sans w-24 bg-[#FAFAFA] text-right">
        </div>
        <!-- Quick Category Filters -->
        <div class="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar text-[9px] font-bold">
          <button type="button" onclick="filterIconCategory('الكل', 'edit-routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-black text-white rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">الكل</button>
          <button type="button" onclick="filterIconCategory('مشاعر إيجابية', 'edit-routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">إيجابي</button>
          <button type="button" onclick="filterIconCategory('مشاكل نفسية', 'edit-routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">نفسي</button>
          <button type="button" onclick="filterIconCategory('ألم وإعياء', 'edit-routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">جسدي</button>
        </div>
        <div class="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 border border-neutral-100 rounded-2xl bg-neutral-50/50" id="edit-routine-icon-picker-grid">
          <!-- Populated visually -->
        </div>
      </div>
    `;
    renderVisualIconPicker('edit-routine-icon-picker-grid');
  } else if (type === 'custom-task') {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    title.innerText = "تعديل المهمة الفردية";
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اسم المهمة</label>
        <input type="text" required name="taskTitle" value="${task.title}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">تاريخ الاستحقاق</label>
        <input type="date" required name="taskDueDate" value="${task.dueDate}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">وقت الاستحقاق</label>
        <input type="time" required name="taskDueTime" value="${task.dueTime || '12:00'}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <input type="hidden" name="taskNotificationEnabled" value="${task.notificationEnabled !== false ? 'true' : 'false'}">
      <input type="hidden" name="taskNotificationOffset" value="${task.notificationOffset || 0}">
    `;
  } else if (type === 'category') {
    title.innerText = "تعديل اسم التصنيف";
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اسم التصنيف الجديد</label>
        <input type="text" required name="categoryName" value="${id}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white">
      </div>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
  if (window.applyCustomPickers) window.applyCustomPickers(formFields);

  modal.classList.remove('opacity-0', 'pointer-events-none');
  card.classList.remove('scale-95');
  card.classList.add('scale-100');
  if (window.pushModalHistory) window.pushModalHistory();
}

export function closeEditModal() {
  const modal = document.getElementById('edit-item-modal');
  const card = document.getElementById('edit-item-modal-card');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.add('scale-95');
    card.classList.remove('scale-100');
  }
  if (window.popModalHistory) window.popModalHistory();
}

export async function handleEditModalSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const id = document.getElementById('edit-item-id').value;
  const type = document.getElementById('edit-item-type').value;

  if (type === 'feeling') {
    const symptom = state.symptoms.find(s => s.id === id);
    if (symptom) {
      symptom.titleEn = formData.get('titleEn').trim();
      symptom.titleAr = formData.get('titleAr').trim();
      symptom.category = formData.get('category');
      symptom.icon = getSelectedFormIcon();

      if (window.renderSymptomGrid) window.renderSymptomGrid();
      if (window.showToast) window.showToast("تم تعديل الإحساس بنجاح! ✏️", "success");
    }
  } else if (type === 'action') {
    const found = findActionById(id);
    if (found) {
      const newTitle = formData.get('title').trim();
      const newTab = formData.get('actionTab');

      if (newTitle) {
        found.action.title = newTitle;
        
        let finalWeight = found.action.weight;
        let finalLabel = found.action.importanceLabel;
        if (found.tab !== newTab || !finalWeight) {
          const calculated = calculateImportance(3, newTab);
          finalWeight = calculated.weight;
          finalLabel = calculated.label;
        }
        found.action.weight = finalWeight;
        found.action.importanceLabel = finalLabel;

        if (found.tab !== newTab) {
          found.symptom.actions[found.tab] = found.symptom.actions[found.tab].filter(a => a.id !== id);
          if (!found.symptom.actions[newTab]) {
            found.symptom.actions[newTab] = [];
          }
          found.symptom.actions[newTab].push(found.action);
        }

        if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
        if (window.renderActionStack) window.renderActionStack();
        if (window.renderSkippedTray) window.renderSkippedTray();

        const allActionsContainer = document.getElementById('all-actions-list-container');
        if (allActionsContainer && !allActionsContainer.classList.contains('hidden')) {
          if (window.renderAllActionsList) window.renderAllActionsList();
        }

        if (window.showToast) window.showToast("تم تعديل خطوة العلاج بنجاح! ✏️", "success");
      }
    }
  } else if (type === 'metric') {
    const metric = state.dailyStatus.customMetrics.find(m => m.id === id);
    if (metric) {
      metric.label = formData.get('label').trim();
      const oldType = metric.type;
      const newType = formData.get('metricType');
      metric.type = newType;
      metric.category = formData.get('category');

      if (oldType !== newType) {
        metric.value = newType === 'binary' ? 'unset' : 0;
      }

      if (window.renderDailyStatusForm) window.renderDailyStatusForm();
      if (window.updateCompletionPercentage) window.updateCompletionPercentage();
      if (window.showToast) window.showToast("تم تعديل المؤشر الصحي بنجاح! ✏️", "success");
    }
  } else if (type === 'task') {
    const task = state.dailyStatus.tasks.find(t => t.id === id);
    if (task) {
      task.label = formData.get('label').trim();
      task.category = formData.get('category');

      if (window.renderDailyStatusForm) window.renderDailyStatusForm();
      if (window.updateCompletionPercentage) window.updateCompletionPercentage();
      if (window.showToast) window.showToast("تم تعديل المهمة بنجاح! ✏️", "success");
    }
  } else if (type === 'category') {
    const newCatName = formData.get('categoryName').trim();
    if (newCatName && id !== newCatName) {
      if (state.categories.includes(newCatName)) {
        if (window.showToast) window.showToast("التصنيف ده موجود بالفعل! ⚠️", "error");
        return;
      }

      const idx = state.categories.indexOf(id);
      if (idx !== -1) {
        state.categories[idx] = newCatName;
      }

      state.symptoms.forEach(s => {
        if (s.category === id) s.category = newCatName;
      });
      state.dailyStatus.tasks.forEach(t => {
        if (t.category === id) t.category = newCatName;
      });
      state.dailyStatus.customMetrics.forEach(m => {
        if (m.category === id) m.category = newCatName;
      });

      if (state.activeCategoryFilter === id) {
        state.activeCategoryFilter = newCatName;
      }

      if (window.renderManagerCategoriesList) window.renderManagerCategoriesList();
      if (window.renderCategoryFilterBar) window.renderCategoryFilterBar();
      if (window.renderSymptomGrid) window.renderSymptomGrid();
      if (window.renderDailyStatusForm) window.renderDailyStatusForm();
      if (window.showToast) window.showToast("تم تعديل اسم التصنيف وتحديث كل العناصر المرتبطة به! ✏️", "success");
    }
  } else if (type === 'routine') {
    const routine = state.routines.find(r => r.id === id);
    if (routine) {
      routine.title = formData.get('routineTitle').trim();
      routine.goal = formData.get('routineGoal').trim();
      routine.targetSymptomId = formData.get('routineTarget') || '';
      routine.startTime = formData.get('routineStartTime');
      routine.notificationEnabled = formData.get('routineNotificationEnabled') === 'true';
      routine.notificationOffset = parseInt(formData.get('routineNotificationOffset')) || 0;
      routine.icon = getSelectedFormIcon();

      // Schedule OneSignal notification
      await syncRoutineNotification(routine);

      if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
      if (window.showToast) window.showToast("تم تعديل الروتين وتحديث التنبيه بنجاح! ✏️", "success");
    }
  } else if (type === 'custom-task') {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.title = formData.get('taskTitle').trim();
      task.dueDate = formData.get('taskDueDate');
      task.dueTime = formData.get('taskDueTime') || '12:00';
      task.notificationEnabled = formData.get('taskNotificationEnabled') === 'true';
      task.notificationOffset = parseInt(formData.get('taskNotificationOffset')) || 0;

      // Schedule OneSignal notification
      await syncTaskNotification(task);

      if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
      if (window.showToast) window.showToast("تم تعديل المهمة وتحديث التنبيه بنجاح! ✏️", "success");
    }
  }

  closeEditModal();
  saveState(true);
  pushSyncUpdate();
}

export function handleEditModalDelete() {
  const id = document.getElementById('edit-item-id').value;
  const type = document.getElementById('edit-item-type').value;

  if (type === 'feeling') {
    state.symptoms = state.symptoms.filter(s => s.id !== id);
    if (window.renderSymptomGrid) window.renderSymptomGrid();
    if (window.showToast) window.showToast("تم حذف الإحساس بالكامل! 🗑️", "success");
  } else if (type === 'action') {
    const found = findActionById(id);
    if (found) {
      found.symptom.actions[found.tab] = found.symptom.actions[found.tab].filter(a => a.id !== id);
      state.sessionSkippedActions = state.sessionSkippedActions.filter(aid => aid !== id);

      if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
      if (window.renderActionStack) window.renderActionStack();
      if (window.renderSkippedTray) window.renderSkippedTray();

      const allActionsContainer = document.getElementById('all-actions-list-container');
      if (allActionsContainer && !allActionsContainer.classList.contains('hidden')) {
        if (window.renderAllActionsList) window.renderAllActionsList();
      }

      if (window.showToast) window.showToast("تم حذف خطوة العلاج بنجاح! 🗑️", "success");
    }
  } else if (type === 'metric') {
    state.dailyStatus.customMetrics = state.dailyStatus.customMetrics.filter(m => m.id !== id);
    if (window.renderDailyStatusForm) window.renderDailyStatusForm();
    if (window.updateCompletionPercentage) window.updateCompletionPercentage();
    if (window.showToast) window.showToast("تم حذف المؤشر بنجاح! 🗑️", "success");
  } else if (type === 'routine') {
    const routine = state.routines.find(r => r.id === id);
    if (routine && routine.notificationId) {
      cancelOneSignalNotification(routine.notificationId);
    }
    state.routines = state.routines.filter(r => r.id !== id);
    if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
    if (window.showToast) window.showToast("تم حذف الروتين بنجاح! 🗑️", "success");
  } else if (type === 'custom-task') {
    const task = state.tasks.find(t => t.id === id);
    if (task && task.notificationId) {
      cancelOneSignalNotification(task.notificationId);
    }
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
    if (window.showToast) window.showToast("تم حذف المهمة بنجاح! 🗑️", "success");
  } else if (type === 'task') {
    state.dailyStatus.tasks = state.dailyStatus.tasks.filter(t => t.id !== id);
    if (window.renderDailyStatusForm) window.renderDailyStatusForm();
    if (window.updateCompletionPercentage) window.updateCompletionPercentage();
    if (window.showToast) window.showToast("تم حذف المهمة بنجاح! 🗑️", "success");
  } else if (type === 'category') {
    state.categories = state.categories.filter(c => c !== id);

    state.symptoms.forEach(s => {
      if (s.category === id) s.category = 'عام';
    });
    state.dailyStatus.tasks.forEach(t => {
      if (t.category === id) t.category = 'عام';
    });
    state.dailyStatus.customMetrics.forEach(m => {
      if (m.category === id) m.category = 'عام';
    });

    if (state.activeCategoryFilter === id) {
      state.activeCategoryFilter = 'all';
    }

    if (window.renderManagerCategoriesList) window.renderManagerCategoriesList();
    if (window.renderCategoryFilterBar) window.renderCategoryFilterBar();
    if (window.renderSymptomGrid) window.renderSymptomGrid();
    if (window.renderDailyStatusForm) window.renderDailyStatusForm();
    if (window.showToast) window.showToast("تم حذف التصنيف بنجاح! 🗑️", "success");
  }

  closeEditModal();
  saveState(true);
  pushSyncUpdate();
}

// Bind to window for HTML events / inline JS compatibility
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.handleEditModalSubmit = handleEditModalSubmit;
window.handleEditModalDelete = handleEditModalDelete;
