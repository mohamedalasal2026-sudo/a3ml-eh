/**
 * Routines & Tasks (الروتين والمهام) Dashboard Component
 */

import { state, saveState } from '../state/store.js';
import { pushSyncUpdate } from '../services/sync.js';
import { openAddRoutineModal, openAddTaskModal } from './addEntryModal.js';
import { openEditModal } from './editEntryModal.js';
import { getIconHTML } from '../utils/icons.js';

// Active Tab state: 'routines' | 'tasks'
window.currentRoutinesTasksTab = 'routines';
// Tasks filter state: 'today' | 'all'
window.currentTasksFilter = 'today';
// Active calendar viewing month/year for routines: { routineId: { month, year } }
window.routineCalendarDate = {};

// Helper to get local date string YYYY-MM-DD
export function getLocalDateString(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
}

export function renderRoutinesTasksPage() {
  const container = document.getElementById('routines-tasks-view');
  if (!container) return;

  const activeTab = window.currentRoutinesTasksTab;
  const isRoutines = activeTab === 'routines';
  const isTasks = activeTab === 'tasks';

  const routinesClass = isRoutines
    ? "bg-black text-white shadow-sm border border-black"
    : "bg-white text-neutral-500 hover:text-black border border-neutral-200/60";

  const tasksClass = isTasks
    ? "bg-black text-white shadow-sm border border-black"
    : "bg-white text-neutral-500 hover:text-black border border-neutral-200/60";

  container.innerHTML = `
    <!-- Page Header & Tab Swapper -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
      <div>
        <h2 class="text-xl font-bold tracking-tight text-neutral-900">الروتين والمهام اليومية 📅</h2>
        <p class="text-xs text-neutral-400 mt-1">تتبع عاداتك الصحية المستمرة ونظم مهامك الفردية لليوم.</p>
      </div>

      <!-- Tab Switcher -->
      <div class="flex gap-2 p-1 bg-neutral-100 rounded-2xl self-start md:self-center">
        <button onclick="switchRoutinesTasksTab('routines')" class="py-2.5 px-5 text-xs font-bold rounded-xl transition-all duration-200 select-none ${routinesClass}">
          <i class="ti ti-rotate text-sm inline-block ml-1"></i>
          <span>الروتين والعادات اليومية</span>
        </button>
        <button onclick="switchRoutinesTasksTab('tasks')" class="py-2.5 px-5 text-xs font-bold rounded-xl transition-all duration-200 select-none ${tasksClass}">
          <i class="ti ti-checklist text-sm inline-block ml-1"></i>
          <span>المهام الفردية</span>
        </button>
      </div>
    </div>

    <!-- Active View Area -->
    <div id="routines-tasks-active-content" class="space-y-6">
      ${isRoutines ? renderRoutinesSection() : renderTasksSection()}
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

window.renderRoutinesTasksPage = renderRoutinesTasksPage;

// --- Tab Swapper ---
export function switchRoutinesTasksTab(tab) {
  window.currentRoutinesTasksTab = tab;
  renderRoutinesTasksPage();
  if (window.renderMobileBottomNav) window.renderMobileBottomNav();
}
window.switchRoutinesTasksTab = switchRoutinesTasksTab;

// --- Routines Section Rendering ---
function renderRoutinesSection() {
  const routines = state.routines || [];

  return `
    <div class="flex items-center justify-between gap-4 pt-2">
      <div>
        <h3 class="text-sm font-bold text-neutral-800">بناء واستمرارية العادات</h3>
        <p class="text-xs text-neutral-400">العادات المكررة بتساعدك على التعافي وحماية صحتك النفسية.</p>
      </div>
      <button onclick="openAddRoutineModal()" class="py-2.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm select-none">
        <i class="ti ti-plus text-xs"></i>
        <span>إضافة روتين جديد</span>
      </button>
    </div>

    ${routines.length === 0 ? renderRoutinesEmptyState() : renderRoutinesGrid(routines)}
  `;
}

function renderRoutinesEmptyState() {
  return `
    <div class="border border-dashed border-neutral-200 bg-white rounded-3xl p-12 text-center max-w-lg mx-auto space-y-5 my-6">
      <div class="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
        <i class="ti ti-rotate text-2xl"></i>
      </div>
      <div class="space-y-1.5">
        <h4 class="text-sm font-bold text-neutral-900">مفيش أي عادات أو روتين حالياً</h4>
        <p class="text-xs text-neutral-400">ابدأ بإضافة أول روتين يومي مخصص ليك عشان تتابعه وتسجل التزامك بيه.</p>
      </div>
      <button onclick="openAddRoutineModal()" class="py-2.5 px-5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all inline-block select-none">
        إنشاء أول روتين
      </button>
    </div>
  `;
}

function renderRoutinesGrid(routines) {
  const todayStr = getLocalDateString();

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      ${routines.map(routine => {
        const isDoneToday = (routine.history || []).includes(todayStr);
        const streak = calculateRoutineStreak(routine);

        // Find linked feeling
        const linkedSymptom = state.symptoms.find(s => s.id === routine.targetSymptomId);
        const linkedFeelingHTML = linkedSymptom
          ? `<div class="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAFAFA] border border-neutral-100 rounded-full text-[10px] text-neutral-500 font-sans" title="المشكلة المستهدفة">
               ${getIconHTML(linkedSymptom.icon, "text-neutral-400 text-xs")}
               <span>حل: ${linkedSymptom.titleAr}</span>
             </div>`
          : `<div class="flex items-center gap-1 px-2.5 py-1 bg-neutral-50 border border-neutral-100 rounded-full text-[10px] text-neutral-400 font-sans">
               <span>عادي / عام</span>
             </div>`;

        // Done today button class
        const doneBtnClass = isDoneToday
          ? "bg-black text-white hover:bg-neutral-800 shadow-sm"
          : "bg-white text-neutral-800 border border-neutral-200/80 hover:border-black hover:bg-neutral-50";

        return `
          <div class="border border-neutral-200/80 bg-white rounded-3xl p-6 space-y-5 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between">
            
            <div class="space-y-4">
              <!-- Top Row: Icon, Goal & Actions -->
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-black">
                    <i class="ti ti-${routine.icon || 'sparkles'} text-lg"></i>
                  </div>
                  <div>
                    <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block font-sans">الهدف: ${routine.goal || 'تحسين الصحة'}</span>
                    <h4 class="text-sm font-bold text-neutral-900 leading-snug">${routine.title}</h4>
                  </div>
                </div>
                
                <div class="flex items-center gap-1">
                  <button onclick="openEditModal('routine', '${routine.id}')" class="p-1.5 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-black transition-colors" title="تعديل الروتين">
                    <i class="ti ti-edit text-base"></i>
                  </button>
                </div>
              </div>

              <!-- Mid Row: Linked Feeling, Time & Streak -->
              <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100 pt-3">
                ${linkedFeelingHTML}
                
                <div class="flex items-center gap-1 px-2.5 py-1 bg-[#FAFAFA] border border-neutral-100 rounded-full text-[10px] text-neutral-500 font-sans">
                  <i class="ti ti-clock text-xs text-neutral-400"></i>
                  <span>البدء: ${formatTimeString(routine.startTime)}</span>
                </div>

                <div class="flex items-center gap-1 px-2.5 py-1 bg-neutral-50 border border-neutral-100 rounded-full text-[10px] text-neutral-600 font-sans font-bold">
                  <i class="ti ti-flame text-xs text-orange-500 animate-pulse"></i>
                  <span>سلسلة: ${streak} أيام</span>
                </div>
              </div>
            </div>

            <!-- Calendar & Logger -->
            <div class="space-y-3 pt-3 border-t border-neutral-100 mt-2">
              <!-- Log Today Action Button -->
              <button onclick="toggleRoutineComplete('${routine.id}')" class="w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 select-none ${doneBtnClass}">
                <i class="ti ti-${isDoneToday ? 'circle-check' : 'circle'} text-sm"></i>
                <span>${isDoneToday ? '✓ تم إنجاز الروتين لليوم!' : 'إضافة علامة صح (إنجاز لليوم)'}</span>
              </button>

              <!-- Monthly Interactive Calendar Grid -->
              <div class="bg-neutral-50/50 rounded-2xl p-3 border border-neutral-100">
                ${renderRoutineCalendar(routine)}
              </div>
            </div>

          </div>
        `;
      }).join('')}
    </div>
  `;
}

// --- Streak calculation ---
function calculateRoutineStreak(routine) {
  const history = routine.history || [];
  if (history.length === 0) return 0;

  const sorted = [...new Set(history)].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let expected = new Date();

  // If not completed today, check if it was completed yesterday to maintain streak
  const todayStr = getLocalDateString(expected);
  const yesterdayStr = getLocalDateString(new Date(expected.getTime() - 86400000));

  if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) {
    return 0;
  }

  // Set initial expected date to either today or yesterday (whichever is in the list)
  let startIdx = 0;
  if (!sorted.includes(todayStr) && sorted.includes(yesterdayStr)) {
    expected = new Date(expected.getTime() - 86400000);
  }

  for (let i = 0; i < 365; i++) {
    const curStr = getLocalDateString(expected);
    if (sorted.includes(curStr)) {
      streak++;
      expected = new Date(expected.getTime() - 86400000); // step backward 1 day
    } else {
      break;
    }
  }

  return streak;
}

// --- Toggle completion for today ---
export function toggleRoutineComplete(routineId) {
  const routine = state.routines.find(r => r.id === routineId);
  if (!routine) return;

  const todayStr = getLocalDateString();
  routine.history = routine.history || [];

  const idx = routine.history.indexOf(todayStr);
  if (idx === -1) {
    routine.history.push(todayStr);
    if (window.showToast) window.showToast("تم إنجاز الروتين! رائع ومستمر! 🔥", "success");
  } else {
    routine.history.splice(idx, 1);
    if (window.showToast) window.showToast("تم إلغاء تسجيل الإنجاز لليوم.", "info");
  }

  saveState(true);
  pushSyncUpdate();
  renderRoutinesTasksPage();
}
window.toggleRoutineComplete = toggleRoutineComplete;

// --- Calendar Rendering and Day Click toggling ---
function renderRoutineCalendar(routine) {
  if (!window.routineCalendarDate[routine.id]) {
    const now = new Date();
    window.routineCalendarDate[routine.id] = {
      month: now.getMonth(),
      year: now.getFullYear()
    };
  }

  const viewing = window.routineCalendarDate[routine.id];
  const { month, year } = viewing;

  const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1...

  const weekdaysAr = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
  const todayStr = getLocalDateString();

  // Navigation handlers
  const prevMonthClick = `navigateRoutineCalendar('${routine.id}', -1)`;
  const nextMonthClick = `navigateRoutineCalendar('${routine.id}', 1)`;

  let cellsHTML = '';

  // Blank slots for layout alignment
  for (let i = 0; i < firstDayIndex; i++) {
    cellsHTML += `<div class="w-6 h-6"></div>`;
  }

  // Day slots
  for (let day = 1; day <= daysInMonth; day++) {
    const curDate = new Date(year, month, day);
    const dateStr = getLocalDateString(curDate);
    const isCompleted = (routine.history || []).includes(dateStr);
    const isToday = dateStr === todayStr;

    let cellClass = "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-sans font-bold transition-all select-none cursor-pointer ";
    if (isCompleted) {
      cellClass += "bg-black text-white hover:bg-neutral-800 scale-105 shadow-sm";
    } else if (isToday) {
      cellClass += "border border-black text-black hover:bg-neutral-100";
    } else {
      cellClass += "text-neutral-500 hover:bg-neutral-100 hover:text-black";
    }

    cellsHTML += `
      <button type="button" onclick="toggleRoutineCalendarDay('${routine.id}', '${dateStr}')" class="${cellClass}" title="${dateStr}">
        ${day}
      </button>
    `;
  }

  return `
    <div class="space-y-2">
      <!-- Calendar Header -->
      <div class="flex items-center justify-between gap-1 text-[10px] font-bold pb-1 border-b border-neutral-200/50">
        <button type="button" onclick="${prevMonthClick}" class="p-1 hover:bg-neutral-200 rounded-lg transition-colors font-sans">&lt;</button>
        <span class="font-sans text-neutral-800">${monthNamesAr[month]} ${year}</span>
        <button type="button" onclick="${nextMonthClick}" class="p-1 hover:bg-neutral-200 rounded-lg transition-colors font-sans">&gt;</button>
      </div>

      <!-- Weekdays -->
      <div class="grid grid-cols-7 gap-1 text-center font-bold text-neutral-400 text-[8px] font-sans">
        ${weekdaysAr.map(wd => `<div>${wd}</div>`).join('')}
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 gap-1 justify-items-center">
        ${cellsHTML}
      </div>
    </div>
  `;
}

export function navigateRoutineCalendar(routineId, offset) {
  const viewing = window.routineCalendarDate[routineId];
  if (!viewing) return;

  let newMonth = viewing.month + offset;
  let newYear = viewing.year;

  if (newMonth < 0) {
    newMonth = 11;
    newYear -= 1;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear += 1;
  }

  window.routineCalendarDate[routineId] = { month: newMonth, year: newYear };
  renderRoutinesTasksPage();
}
window.navigateRoutineCalendar = navigateRoutineCalendar;

export function toggleRoutineCalendarDay(routineId, dateStr) {
  const routine = state.routines.find(r => r.id === routineId);
  if (!routine) return;

  routine.history = routine.history || [];
  const idx = routine.history.indexOf(dateStr);

  if (idx === -1) {
    routine.history.push(dateStr);
    if (window.showToast) window.showToast(`تم تسجيل إنجاز العادة ليوم ${dateStr}!`, "success");
  } else {
    routine.history.splice(idx, 1);
    if (window.showToast) window.showToast(`تم إلغاء إنجاز العادة ليوم ${dateStr}.`, "info");
  }

  saveState(true);
  pushSyncUpdate();
  renderRoutinesTasksPage();
}
window.toggleRoutineCalendarDay = toggleRoutineCalendarDay;

// --- Helper formatting ---
function formatTimeString(timeStr) {
  if (!timeStr) return '--:--';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0]);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'م' : 'ص';
  hour = hour % 12;
  hour = hour ? hour : 12; // 0 should be 12
  return `${hour}:${minute} ${ampm}`;
}

// --- Tasks Section Rendering ---
function renderTasksSection() {
  const tasks = state.tasks || [];
  const todayStr = getLocalDateString();
  const filter = window.currentTasksFilter;

  // Filter Tasks
  let filtered = tasks;
  if (filter === 'today') {
    filtered = tasks.filter(t => t.dueDate === todayStr);
  }

  // Sort Tasks: uncompleted first, then by date, then by create time
  filtered.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const todayActive = filter === 'today'
    ? "bg-black text-white"
    : "bg-white text-neutral-500 hover:text-black border border-neutral-200/60";

  const allActive = filter === 'all'
    ? "bg-black text-white"
    : "bg-white text-neutral-500 hover:text-black border border-neutral-200/60";

  return `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      <div>
        <h3 class="text-sm font-bold text-neutral-800">المهام الفردية غير المتكررة</h3>
        <p class="text-xs text-neutral-400">مهام محددة بوقت استحقاق تنجزها مرة واحدة.</p>
      </div>
      
      <!-- Filter and Add Row -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex p-0.5 bg-neutral-100 rounded-xl text-[10px] font-bold">
          <button onclick="switchTasksFilter('today')" class="py-1.5 px-3 rounded-lg transition-all ${todayActive}">
            مهام اليوم فقط
          </button>
          <button onclick="switchTasksFilter('all')" class="py-1.5 px-3 rounded-lg transition-all ${allActive}">
            عرض الكل
          </button>
        </div>

        <button onclick="openAddTaskModal()" class="py-2.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm select-none">
          <i class="ti ti-plus text-xs"></i>
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>
    </div>

    ${filtered.length === 0 ? renderTasksEmptyState(filter) : renderTasksList(filtered)}
  `;
}

function renderTasksEmptyState(filter) {
  const desc = filter === 'today'
    ? "مفيش أي مهام مستحقة النهاردة! روق بالك واستمتع بوقتك. 🌸"
    : "لم تقم بإضافة أي مهام فردية حتى الآن. ابدأ بإضافة مهمة جديدة.";

  return `
    <div class="border border-dashed border-neutral-200 bg-white rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 my-6">
      <div class="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
        <i class="ti ti-checkbox text-2xl"></i>
      </div>
      <div class="space-y-1.5">
        <h4 class="text-sm font-bold text-neutral-900">مفيش مهام معروضة</h4>
        <p class="text-xs text-neutral-400">${desc}</p>
      </div>
      ${filter === 'today' ? '' : `
        <button onclick="openAddTaskModal()" class="py-2.5 px-5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all inline-block select-none">
          إضافة أول مهمة
        </button>
      `}
    </div>
  `;
}

function renderTasksList(tasks) {
  const todayStr = getLocalDateString();
 
  return `
    <div class="border border-neutral-200/80 bg-white rounded-3xl p-4 md:p-6 space-y-3.5 shadow-sm max-w-3xl mx-auto pt-4">
      ${tasks.map(task => {
        const isOverdue = !task.completed && new Date(task.dueDate) < new Date(todayStr);
        const isToday = task.dueDate === todayStr;
 
        let dateBadgeClass = "px-2 py-0.5 rounded-full font-sans text-[9px] font-bold ";
        let dateLabel = formatBadgeDate(task.dueDate);
        if (task.dueTime) {
          dateLabel += ` الساعة ${formatTimeString(task.dueTime)}`;
        }
 
        if (task.completed) {
          dateBadgeClass += "bg-neutral-100 text-neutral-400 line-through";
        } else if (isOverdue) {
          dateBadgeClass += "bg-red-50 text-red-600 border border-red-100";
          dateLabel = `متأخرة! (${dateLabel})`;
        } else if (isToday) {
          dateBadgeClass += "bg-black text-white";
          dateLabel = `اليوم (${formatTimeString(task.dueTime || '12:00')})`;
        } else {
          dateBadgeClass += "bg-neutral-100 text-neutral-600";
        }
 
        const titleClass = task.completed
          ? "text-sm text-neutral-400 line-through font-medium"
          : "text-sm text-neutral-800 font-bold";

        const hasNotification = task.notificationEnabled !== false;
        const bellIconClass = hasNotification ? 'ti ti-bell-filled text-neutral-800' : 'ti ti-bell-off text-neutral-300';
        const bellTitle = hasNotification ? 'إيقاف التنبيه' : 'تفعيل التنبيه';
 
        return `
          <div class="flex items-center justify-between gap-4 p-3 hover:bg-neutral-50 rounded-2xl transition-all border border-neutral-100/50 hover:border-neutral-200/60">
            <div class="flex items-center gap-3.5 flex-1 min-w-0">
              <!-- Custom Sleek Checkbox -->
              <button onclick="toggleTaskComplete('${task.id}')" class="w-5 h-5 rounded-md border-2 border-neutral-300 hover:border-black flex items-center justify-center transition-all bg-white flex-shrink-0">
                ${task.completed ? '<i class="ti ti-check text-xs text-black font-bold"></i>' : ''}
              </button>
 
              <div class="flex-1 min-w-0 leading-tight space-y-1">
                <span class="${titleClass} block truncate">${task.title}</span>
                <span class="${dateBadgeClass}">${dateLabel}</span>
              </div>
            </div>
 
            <!-- Edit / Notification / Delete actions -->
            <div class="flex items-center gap-1 flex-shrink-0">
              ${task.completed ? '' : `
                <button onclick="event.stopPropagation(); toggleTaskNotification('${task.id}')" class="p-1.5 hover:bg-neutral-100 rounded-xl transition-colors" title="${bellTitle}">
                  <i class="${bellIconClass} text-base"></i>
                </button>
              `}
              <button onclick="openEditModal('custom-task', '${task.id}')" class="p-1.5 hover:bg-neutral-200/60 rounded-xl text-neutral-400 hover:text-black transition-colors" title="تعديل المهمة">
                <i class="ti ti-edit text-base"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// --- Toggle task completion ---
export function toggleTaskComplete(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;

  if (task.completed) {
    if (window.showToast) window.showToast("عاش! تم إنجاز المهمة بنجاح! 🏆", "success");
  }

  saveState(true);
  pushSyncUpdate();
  renderRoutinesTasksPage();
}
window.toggleTaskComplete = toggleTaskComplete;

// --- Task Filter Switcher ---
export function switchTasksFilter(filter) {
  window.currentTasksFilter = filter;
  renderRoutinesTasksPage();
}
window.switchTasksFilter = switchTasksFilter;

// --- Date Formatter Helper ---
function formatBadgeDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  return `${date.getDate()} ${monthNamesAr[date.getMonth()]}`;
}

// --- Toggle task notification status ---
export async function toggleTaskNotification(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.notificationEnabled = task.notificationEnabled === false ? true : false;

  // Sync notification
  const { syncTaskNotification } = await import('../services/notifications.js');
  await syncTaskNotification(task);

  saveState(true);
  pushSyncUpdate();
  renderRoutinesTasksPage();
}
window.toggleTaskNotification = toggleTaskNotification;
