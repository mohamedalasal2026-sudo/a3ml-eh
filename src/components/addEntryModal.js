/**
 * Form Modal for Adding New Application Items (FAB Modal Contexts)
 */

import { state, saveState } from '../state/store.js';
import { pushSyncUpdate } from '../services/sync.js';
import { getSelectedFormIcon, setSelectedFormIcon, renderVisualIconPicker } from './iconPicker.js';
import { syncTaskNotification, syncRoutineNotification } from '../services/notifications.js';

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

export function openFABModal() {
  const modal = document.getElementById('fab-modal');
  const card = document.getElementById('fab-modal-card');
  const title = document.getElementById('modal-title');
  const formFields = document.getElementById('modal-form-fields');

  if (!modal || !card || !title || !formFields) return;

  const context = state.lastInteractedContext;

  if (context === 'home') {
    title.innerText = "إضافة إحساس جديد للوحة التحكم";
    setSelectedFormIcon('mood-sad');
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">الاسم بالإنجليزي (EN)</label>
        <input type="text" required name="titleEn" placeholder="مثال: Grief, Apathy" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">الاسم بالعربي (AR)</label>
        <input type="text" required name="titleAr" placeholder="مثال: حزن وفقد، زهد وتشتت" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">التصنيف المرتبط</label>
        <select name="category" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          ${state.categories.map(cat => '<option value="' + cat + '">' + cat + '</option>').join('')}
          <option value="عام">عام</option>
        </select>
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اختر الأيقونة (أكثر من 100 أيقونة)</label>
          <input type="text" oninput="filterIconPicker(this.value, 'icon-picker-grid')" placeholder="ابحث..." class="px-2 py-1 text-[10px] border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-sans w-24 bg-[#FAFAFA] text-right">
        </div>
        <!-- Quick Category Filters -->
        <div class="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar text-[9px] font-bold">
          <button type="button" onclick="filterIconCategory('الكل', 'icon-picker-grid', this)" class="px-2.5 py-1 bg-black text-white rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">الكل</button>
          <button type="button" onclick="filterIconCategory('مشاعر سلبية', 'icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">مشاعر سلبية</button>
          <button type="button" onclick="filterIconCategory('مشاكل نفسية', 'icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">مشاكل نفسية</button>
          <button type="button" onclick="filterIconCategory('ألم وإعياء', 'icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">ألم وإعياء</button>
          <button type="button" onclick="filterIconCategory('مشاعر إيجابية', 'icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">مشاعر إيجابية</button>
          <button type="button" onclick="filterIconCategory('علاقات', 'icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">علاقات</button>
        </div>
        <div class="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 border border-neutral-100 rounded-2xl bg-neutral-50/50" id="icon-picker-grid">
          <!-- Populated visually -->
        </div>
      </div>
    `;

    renderVisualIconPicker('icon-picker-grid');
  } else if (context === 'daily-status') {
    title.innerText = "إضافة مؤشر أو مهمة مخصصة";
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اسم المؤشر أو المهمة اليومية</label>
        <input type="text" required name="metricName" placeholder="مثال: قراءة كتب، يوجا، قعدت في الشمس" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">طريقة القياس والتقييم</label>
        <select name="metricType" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          <option value="binary">نعم / لا (صح وغلط) كمؤشر</option>
          <option value="numeric">عداد ساعات أو أرقام كمؤشر</option>
          <option value="task">مهمة يومية لإنجازها</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">التصنيف المرتبط</label>
        <select name="category" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          ${state.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          <option value="عام">عام</option>
        </select>
      </div>
    `;
  } else if (context === 'symptom-details') {
    title.innerText = "إضافة خطوة علاجية مخصصة";
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">خطوة العلاج المقترحة</label>
        <input type="text" required name="actionTitle" placeholder="اكتب حاجة بتريحك، مثال: تمارين التأمل" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>

      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">فترة ومدة التنفيذ</label>
        <select name="actionTab" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          <option value="near">حاجات تعملها حالاً (في ربع ساعة)</option>
          <option value="long">نصائح على المدى الطويل (عادة يومية)</option>
        </select>
      </div>
    `;
  } else if (context === 'feeling-log') {
    title.innerText = "تسجيل شعور أو ألم جديد";
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">الشعور أو الإحساس</label>
        <select name="feelingName" required class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          <option value="" disabled selected>اختر شعور...</option>
          ${state.symptoms.map(s => '<option value="' + s.titleAr + '">' + s.titleAr + '</option>').join('')}
          <option value="other">آخر (اكتبه في السبب)</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">الدرجة (من سيء جداً لجيد جداً)</label>
        <div class="flex items-center justify-between gap-1 mt-1">
          ${[
            { val: 1, label: '😢', text: 'سيء جداً' },
            { val: 2, label: '😕', text: 'سيء' },
            { val: 3, label: '😐', text: 'متوسط' },
            { val: 4, label: '🙂', text: 'جيد' },
            { val: 5, label: '😀', text: 'جيد جداً' }
          ].map(m => `
            <label class="flex flex-col items-center gap-1 cursor-pointer">
              <input type="radio" name="feelingSeverity" value="${m.val}" required class="peer sr-only" ${m.val === 3 ? 'checked' : ''}>
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-neutral-200 bg-neutral-50 peer-checked:bg-black peer-checked:border-black peer-checked:text-white transition-all peer-checked:shadow-md peer-checked:scale-110" title="${m.text}">
                ${m.label}
              </div>
              <span class="text-[9px] text-neutral-500 font-bold">${m.text}</span>
            </label>
          `).join('')}
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">السبب أو الملاحظة</label>
        <input type="text" name="feelingReason" placeholder="إيه السبب؟ (موقف معين، تفكير، ألم جسدي)..." class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
    `;
  } else if (context === 'routine') {
    title.innerText = "إضافة عادة / روتين جديد";
    setSelectedFormIcon('sparkles');
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اسم العادة / الروتين</label>
        <input type="text" required name="routineTitle" placeholder="مثال: ممارسة رياضة المشي، قراءة كتاب" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">الهدف الأساسي</label>
        <input type="text" required name="routineGoal" placeholder="مثال: تحسين الصحة، التخلص من الأرق، زيادة الهدوء" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">المشكلة / الشعور المستهدف حله</label>
        <select name="routineTarget" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right bg-white select-arrow">
          <option value="" selected>لا يوجد (شعور عام)</option>
          ${state.symptoms.map(s => `<option value="${s.id}">${s.titleAr}</option>`).join('')}
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">وقت بداية الروتين</label>
        <input type="time" required name="routineStartTime" value="08:00" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <input type="hidden" name="routineNotificationEnabled" value="true">
      <input type="hidden" name="routineNotificationOffset" value="0">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اختر أيقونة العادة</label>
          <input type="text" oninput="filterIconPicker(this.value, 'routine-icon-picker-grid')" placeholder="ابحث..." class="px-2 py-1 text-[10px] border border-neutral-200 rounded-lg focus:outline-none focus:border-black font-sans w-24 bg-[#FAFAFA] text-right">
        </div>
        <!-- Quick Category Filters -->
        <div class="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar text-[9px] font-bold">
          <button type="button" onclick="filterIconCategory('الكل', 'routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-black text-white rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">الكل</button>
          <button type="button" onclick="filterIconCategory('مشاعر إيجابية', 'routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">إيجابي</button>
          <button type="button" onclick="filterIconCategory('مشاكل نفسية', 'routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">نفسي</button>
          <button type="button" onclick="filterIconCategory('ألم وإعياء', 'routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">جسدي</button>
          <button type="button" onclick="filterIconCategory('علاقات', 'routine-icon-picker-grid', this)" class="px-2.5 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none">علاقات</button>
        </div>
        <div class="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 border border-neutral-100 rounded-2xl bg-neutral-50/50" id="routine-icon-picker-grid">
          <!-- Populated visually -->
        </div>
      </div>
    `;
    renderVisualIconPicker('routine-icon-picker-grid');
  } else if (context === 'task') {
    title.innerText = "إضافة مهمة فردية جديدة";
    const todayStr = new Date().toISOString().split('T')[0];
    formFields.innerHTML = `
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">اسم المهمة</label>
        <input type="text" required name="taskTitle" placeholder="مثال: تسليم التقرير، مراجعة الطبيب" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">تاريخ الاستحقاق</label>
        <input type="date" required name="taskDueDate" value="${todayStr}" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">وقت الاستحقاق</label>
        <input type="time" required name="taskDueTime" value="12:00" class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:border-black font-sans text-right">
      </div>
      <input type="hidden" name="taskNotificationEnabled" value="true">
      <input type="hidden" name="taskNotificationOffset" value="0">
    `;
  }

  if (window.lucide) window.lucide.createIcons();
  if (window.applyCustomPickers) window.applyCustomPickers(formFields);

  modal.classList.remove('opacity-0', 'pointer-events-none');
  card.classList.remove('scale-95');
  card.classList.add('scale-100');

  const fabIcon = document.getElementById('fab-icon');
  if (fabIcon) fabIcon.style.transform = 'rotate(135deg)';

  if (window.pushModalHistory) window.pushModalHistory();
}

export function closeFABModal() {
  const modal = document.getElementById('fab-modal');
  const card = document.getElementById('fab-modal-card');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.add('scale-95');
    card.classList.remove('scale-100');
  }

  const fabIcon = document.getElementById('fab-icon');
  if (fabIcon) fabIcon.style.transform = 'rotate(0deg)';
  if (window.popModalHistory) window.popModalHistory();
}

export function openHomeFABModal() {
  state.lastInteractedContext = 'home';
  openFABModal();
}

export function focusSymptomDetailsFAB() {
  state.lastInteractedContext = 'symptom-details';
  openFABModal();
}

export async function handleModalSubmit(event) {
  event.preventDefault();
  const context = state.lastInteractedContext;
  const form = event.target;
  const formData = new FormData(form);

  if (context === 'home') {
    const titleEn = formData.get('titleEn').trim();
    const titleAr = formData.get('titleAr').trim();
    const category = formData.get('category') || 'عام';

    if (titleEn && titleAr) {
      const newSymptom = {
        id: 'feeling-' + Math.random().toString(36).substring(2, 7),
        titleEn: titleEn,
        titleAr: titleAr,
        icon: getSelectedFormIcon(),
        category: category,
        actions: { near: [], mid: [], long: [] }
      };

      state.symptoms.push(newSymptom);
      if (window.renderSymptomGrid) window.renderSymptomGrid();
      if (window.showToast) window.showToast("ضفنا الإحساس الجديد بنجاح! 🎉", "success");
    }
  } else if (context === 'daily-status') {
    const metricName = formData.get('metricName').trim();
    const metricType = formData.get('metricType');
    const category = formData.get('category') || 'عام';

    if (metricName) {
      if (metricType === 'task') {
        const newTask = {
          id: 'task-' + Math.random().toString(36).substring(2, 7),
          label: metricName,
          status: 'unset',
          reason: '',
          completed: false,
          category: category
        };
        if (!state.dailyStatus.tasks) state.dailyStatus.tasks = [];
        state.dailyStatus.tasks.push(newTask);
        if (window.showToast) window.showToast("ضفنا المهمة اليومية الجديدة بنجاح! ✅", "success");
      } else {
        const newMetric = {
          id: 'custom-metric-' + Math.random().toString(36).substring(2, 7),
          label: metricName,
          type: metricType,
          value: metricType === 'binary' ? 'unset' : 0,
          min: 0,
          max: 24,
          step: 1,
          category: category
        };

        if (!state.dailyStatus.customMetrics) state.dailyStatus.customMetrics = [];
        state.dailyStatus.customMetrics.push(newMetric);
        if (window.showToast) window.showToast("ضفنا العادة المخصصة اليومية بنجاح! 📊", "success");
      }

      if (window.renderDailyStatusForm) window.renderDailyStatusForm();
      if (window.updateCompletionPercentage) window.updateCompletionPercentage();
    }
  } else if (context === 'symptom-details') {
    const actionTitle = formData.get('actionTitle').trim();
    const actionTab = formData.get('actionTab');

    if (actionTitle) {
      const symptom = state.symptoms.find(s => s.id === state.activeSymptomId);
      if (symptom) {
        const { weight, label } = calculateImportance(3, actionTab); // default rating 3 (neutral)
        const newAction = {
          id: 'custom-act-' + Math.random().toString(36).substring(2, 7),
          title: actionTitle,
          weight: weight,
          importanceLabel: label
        };

        if (!symptom.actions[actionTab]) symptom.actions[actionTab] = [];
        symptom.actions[actionTab].push(newAction);

        if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
        if (window.renderActionStack) window.renderActionStack();
        if (window.showToast) window.showToast("ضفنا خطوة العلاج الجديدة بالإحساس بنجاح! 🚀", "success");
      }
    }
  } else if (context === 'feeling-log') {
    const feelingName = formData.get('feelingName');
    const severity = parseInt(formData.get('feelingSeverity')) || 3;
    const reason = formData.get('feelingReason').trim();

    if (feelingName) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
      const newLog = {
        id: 'log-' + Math.random().toString(36).substring(2, 7),
        feelingName: feelingName,
        reason: reason,
        severity: severity,
        time: timeStr
      };

      if (!state.dailyStatus.feelingsLog) state.dailyStatus.feelingsLog = [];
      state.dailyStatus.feelingsLog.push(newLog);
      
      if (window.renderDailyStatusForm) window.renderDailyStatusForm();
      if (window.showToast) window.showToast("تم تسجيل حالتك اللحظية بنجاح! ⏱", "success");
    }
  } else if (context === 'routine') {
    const rTitle = formData.get('routineTitle').trim();
    const goal = formData.get('routineGoal').trim();
    const targetSymptomId = formData.get('routineTarget') || '';
    const startTime = formData.get('routineStartTime');
    const notificationEnabled = formData.get('routineNotificationEnabled') === 'true';
    const notificationOffset = parseInt(formData.get('routineNotificationOffset')) || 0;
    const icon = getSelectedFormIcon();

    if (rTitle && goal && startTime) {
      const newRoutine = {
        id: 'routine-' + Math.random().toString(36).substring(2, 7),
        title: rTitle,
        goal: goal,
        targetSymptomId: targetSymptomId,
        startTime: startTime,
        icon: icon,
        notificationEnabled: notificationEnabled,
        notificationOffset: notificationOffset,
        history: []
      };

      if (!state.routines) state.routines = [];
      state.routines.push(newRoutine);
      
      // Schedule OneSignal notification
      syncRoutineNotification(newRoutine);

      if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
      if (window.showToast) window.showToast("تمت إضافة الروتين الجديد بنجاح! 🌸", "success");
    }
  } else if (context === 'task') {
    const tTitle = formData.get('taskTitle').trim();
    const dueDate = formData.get('taskDueDate');
    const dueTime = formData.get('taskDueTime') || '12:00';
    const notificationEnabled = formData.get('taskNotificationEnabled') === 'true';
    const notificationOffset = parseInt(formData.get('taskNotificationOffset')) || 0;

    if (tTitle && dueDate) {
      const newTask = {
        id: 'task-' + Math.random().toString(36).substring(2, 7),
        title: tTitle,
        dueDate: dueDate,
        dueTime: dueTime,
        notificationEnabled: notificationEnabled,
        notificationOffset: notificationOffset,
        completed: false,
        createdAt: Date.now()
      };

      if (!state.tasks) state.tasks = [];
      state.tasks.push(newTask);

      // Schedule OneSignal notification
      syncTaskNotification(newTask);

      if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
      if (window.showToast) window.showToast("تمت إضافة المهمة بنجاح! 📝", "success");
    }
  }

  closeFABModal();
  form.reset();
  pushSyncUpdate();
  saveState(true);
}

export function openAddRoutineModal() {
  state.lastInteractedContext = 'routine';
  openFABModal();
}

export function openAddTaskModal() {
  state.lastInteractedContext = 'task';
  openFABModal();
}

// Bind to window for HTML events / inline JS compatibility
window.openFABModal = openFABModal;
window.closeFABModal = closeFABModal;
window.openHomeFABModal = openHomeFABModal;
window.focusSymptomDetailsFAB = focusSymptomDetailsFAB;
window.handleModalSubmit = handleModalSubmit;
window.openAddRoutineModal = openAddRoutineModal;
window.openAddTaskModal = openAddTaskModal;
