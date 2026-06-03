/**
 * Recovery & Improvement Logger Component
 */

import { state, saveState } from '../state/store.js';
import { pushSyncUpdate } from '../services/sync.js';

let selectedRecoveryRatingVal = 8;

export function selectRecoveryRating(val) {
  selectedRecoveryRatingVal = val;
  const buttons = document.querySelectorAll('.recovery-rating-btn');
  buttons.forEach(btn => {
    const v = parseInt(btn.getAttribute('data-val'));
    if (v <= val) {
      btn.className = "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-sans font-bold transition-all select-none bg-black text-white scale-110 shadow-md ring-2 ring-neutral-200 recovery-rating-btn";
    } else {
      btn.className = "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-sans font-bold transition-all select-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-500 recovery-rating-btn";
    }
  });
}

export function handleRecoveryFeelingChange(feelingId) {
  const symptom = state.symptoms.find(s => s.id === feelingId);
  const actionSelect = document.getElementById('recovery-action-select');
  if (!actionSelect) return;

  if (!symptom) {
    actionSelect.innerHTML = `<option value="">-- لا توجد خطوات علاجية --</option>`;
    actionSelect.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  const actionsList = (symptom.actions.near || []).concat(symptom.actions.long || []);
  if (actionsList.length === 0) {
    actionSelect.innerHTML = `<option value="">-- لا توجد خطوات علاجية --</option>`;
  } else {
    actionSelect.innerHTML = actionsList.map(a => `
      <option value="${a.id}" ${a.id === state.lastCompletedActionId ? 'selected' : ''}>${a.title}</option>
    `).join('');
  }
  actionSelect.dispatchEvent(new Event('change', { bubbles: true }));
}

export function submitRecoveryEntry(event) {
  if (event) event.preventDefault();

  const feelingSelect = document.getElementById('recovery-feeling-select');
  const actionSelect = document.getElementById('recovery-action-select');
  const notesTextarea = document.getElementById('recovery-notes-textarea');

  let feelingId = feelingSelect ? feelingSelect.value : '';
  let actionId = actionSelect ? actionSelect.value : '';
  const notes = notesTextarea ? notesTextarea.value.trim() : '';

  if (state.autoLinkActive) {
    feelingId = state.lastCompletedFeelingId || feelingId || (state.symptoms[0] ? state.symptoms[0].id : '');
    actionId = state.lastCompletedActionId || actionId || '';
  }

  if (!feelingId) {
    if (window.showToast) window.showToast("من فضلك اختر الشعور المرتبط بالتحسن. ⚠️", "error");
    return;
  }

  const newLog = {
    id: 'log-' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    feelingId: feelingId,
    actionId: actionId,
    rating: selectedRecoveryRatingVal,
    notes: notes
  };

  if (!state.improvementsLog) state.improvementsLog = [];
  state.improvementsLog.push(newLog);

  // Reset notes field
  if (notesTextarea) notesTextarea.value = '';

  if (window.showToast) window.showToast("تم توثيق رصد التحسن بنجاح! 💾✨", "success");

  saveState(true);
  pushSyncUpdate();

  // Redraw
  renderDailyHealthLogger();
  if (window.renderSVGChart) window.renderSVGChart();
  if (window.lucide) window.lucide.createIcons();
}

export function deleteRecoveryLog(logId) {
  if (!confirm("هل أنت متأكد من حذف هذا السجل التاريخي نهائياً؟")) return;

  state.improvementsLog = state.improvementsLog.filter(l => l.id !== logId);

  if (window.showToast) window.showToast("تم حذف سجل التحسن. 🗑️", "success");

  saveState(true);
  pushSyncUpdate();

  renderDailyHealthLogger();
  if (window.renderSVGChart) window.renderSVGChart();
}

function renderRecoverySVGChartHTML() {
  const logs = [...(state.improvementsLog || [])].sort((a, b) => a.timestamp - b.timestamp);
  const last7 = logs.slice(-7);

  if (last7.length === 0) {
    return `
      <div class="h-32 flex items-center justify-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/30">
        <p class="text-[10px] text-neutral-400 text-center font-sans">سجل نسبة تحسنك لرسم المخطط البياني للتعافي 📈</p>
      </div>
    `;
  }

  const width = 360;
  const height = 120;
  const padding = 20;

  const points = last7.map((log, idx) => {
    const x = padding + (idx * (width - 2 * padding)) / Math.max(1, last7.length - 1);
    const y = height - padding - ((log.rating - 1) * (height - 2 * padding)) / 9;
    return { x, y, val: log.rating };
  });

  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
  }

  const circles = points.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="3" fill="#000000" stroke="#FFFFFF" stroke-width="1" />
    <text x="${p.x}" y="${p.y - 6}" font-size="7" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#555555">${p.val}</text>
  `).join('');

  return `
    <div class="p-3 border border-neutral-200 bg-white rounded-2xl">
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none">
        <path d="${pathD}" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" />
        ${circles}
      </svg>
      <div class="flex justify-between mt-1 text-[8px] font-bold text-neutral-400 font-sans">
        <span>أقدم سجل</span>
        <span>أحدث سجل</span>
      </div>
    </div>
  `;
}

function renderEfficacyMatrixHTML() {
  const logs = state.improvementsLog || [];
  if (logs.length === 0) {
    return `<p class="text-[10px] text-neutral-400 text-center py-4 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">لا توجد سجلات كافية لترتيب خطوات العلاج حالياً.</p>`;
  }

  const actionStats = {};
  logs.forEach(log => {
    if (!log.actionId) return;
    if (!actionStats[log.actionId]) {
      actionStats[log.actionId] = { sum: 0, count: 0, feelingId: log.feelingId };
    }
    actionStats[log.actionId].sum += log.rating;
    actionStats[log.actionId].count++;
  });

  const sortedActions = Object.keys(actionStats).map(actionId => {
    const stats = actionStats[actionId];
    const avg = parseFloat((stats.sum / stats.count).toFixed(1));

    let title = "خطوة علاجية مخصصة";
    let feelingTitle = "إحساس عام";
    const symptom = state.symptoms.find(s => s.id === stats.feelingId);
    if (symptom) {
      feelingTitle = symptom.titleAr;
      const act = (symptom.actions.near || []).concat(symptom.actions.long || []).find(a => a.id === actionId);
      if (act) title = act.title;
    }

    return { actionId, avg, count: stats.count, title, feelingTitle };
  }).sort((a, b) => b.avg - a.avg);

  return `
    <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
      ${sortedActions.map(a => `
        <div class="flex items-center justify-between p-3 bg-[#FAFAFA] border border-neutral-100 hover:border-neutral-200 rounded-xl transition-all">
          <div class="space-y-0.5 text-right flex-1 pl-2">
            <h5 class="text-xs font-bold text-neutral-900 leading-tight">${a.title}</h5>
            <span class="inline-block text-[8px] font-bold bg-neutral-100 text-neutral-400 px-1.5 py-0.2 rounded-md font-sans">${a.feelingTitle}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0 font-sans">
            <span class="text-[9px] font-bold text-white bg-black px-2 py-0.5 rounded-full select-none">${a.avg} / 10</span>
            <span class="text-[8px] font-bold text-neutral-400">(${a.count} رصد)</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderSidebarWidgets() {
  const container = document.getElementById('desktop-sidebar-widgets');
  if (!container) return;

  const logs = state.improvementsLog || [];
  let recoveryPercentage = 0;
  let hasLogs = logs.length > 0;
  if (hasLogs) {
    const sum = logs.reduce((acc, log) => acc + log.rating, 0);
    recoveryPercentage = Math.round((sum / logs.length) * 10);
  }

  let lastActivityHTML = `
    <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-right space-y-1.5 select-none">
      <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">آخر خطوة تم إنجازها</span>
      <p class="text-[10px] text-neutral-400 leading-normal">لم تسجل أي خطوات بعد. ابدأ العلاج من لوحة التحكم.</p>
    </div>
  `;

  if (state.lastCompletedActionId && state.lastCompletedFeelingId) {
    const symptom = state.symptoms.find(s => s.id === state.lastCompletedFeelingId);
    if (symptom) {
      let actionTitle = "خطوة مخصصة";
      const act = (symptom.actions.near || []).concat(symptom.actions.long || []).find(a => a.id === state.lastCompletedActionId);
      if (act) actionTitle = act.title;

      lastActivityHTML = `
        <div class="p-4 rounded-2xl bg-black border border-neutral-900 text-white text-right space-y-2 flex flex-col justify-between group relative overflow-hidden transition-all duration-300">
          <div class="space-y-1.5 relative z-10">
            <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">آخر خطوة منجزة ⚡</span>
            <h4 class="text-xs font-bold leading-relaxed text-neutral-100 line-clamp-2">${actionTitle}</h4>
            <span class="inline-block text-[9px] font-bold bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-sans">${symptom.titleAr}</span>
          </div>
          <button onclick="setViewPage('recovery')" class="relative z-10 w-full mt-2 py-2 px-3 bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1 select-none">
            <span>سجل نسبة تحسنك الآن</span>
            <i class="ti ti-arrow-left text-xs"></i>
          </button>
          <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full filter blur-lg group-hover:scale-110 transition-transform duration-500"></div>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <!-- Recovery Index Widget -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">مؤشر التعافي الموحد</label>
        <span class="text-xs font-bold text-neutral-900 font-sans">${hasLogs ? recoveryPercentage + '%' : 'لا يوجد رصد'}</span>
      </div>
      <div class="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200/50">
        <div class="bg-black h-full rounded-full transition-all duration-500 ease-out" style="width: ${hasLogs ? recoveryPercentage : 0}%"></div>
      </div>
      <p class="text-[10px] text-neutral-400 leading-normal">يتم احتسابه تلقائياً بناءً على متوسط تقييمات تحسن حالتك بعد الأنشطة العلاجية.</p>
    </div>

    <!-- Last Activity Widget -->
    <div class="space-y-3 pt-4 border-t border-neutral-100">
      <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">النشاط الأخير</label>
      ${lastActivityHTML}
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

export function toggleAutoLink() {
  state.autoLinkActive = !state.autoLinkActive;

  if (state.autoLinkActive) {
    if (window.showToast) {
      window.showToast("تم تفعيل الربط التلقائي بأحدث الأنشطة! 🤖✨", "info");
    }
  } else {
    if (window.showToast) {
      window.showToast("تم إيقاف الربط التلقائي، يمكنك الاختيار يدوياً. 🔓", "info");
    }
  }

  saveState(false);
  renderDailyHealthLogger();
}

export function renderRecoveryPage() {
  const container = document.getElementById('recovery-view');
  if (!container) return;

  const logs = [...(state.improvementsLog || [])].sort((a, b) => b.timestamp - a.timestamp);

  const isAutoLink = state.autoLinkActive;
  const defaultFeelingId = state.lastCompletedFeelingId || (state.symptoms[0] ? state.symptoms[0].id : '');
  const symptom = state.symptoms.find(s => s.id === defaultFeelingId);
  const defaultActionsList = symptom ? (symptom.actions.near || []).concat(symptom.actions.long || []) : [];

  let ratingButtonsHTML = "";
  for (let i = 1; i <= 10; i++) {
    const isActive = i <= selectedRecoveryRatingVal;
    const activeClass = isActive
      ? "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-sans font-bold transition-all select-none bg-black text-white scale-110 shadow-md ring-2 ring-neutral-200 recovery-rating-btn"
      : "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-sans font-bold transition-all select-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-500 recovery-rating-btn";

    ratingButtonsHTML += `
      <button type="button" data-val="${i}" onclick="selectRecoveryRating(${i})" class="${activeClass}">
        ${i}
      </button>
    `;
  }

  container.innerHTML = `
    <div class="flex flex-col lg:flex-row lg:gap-8 space-y-8 lg:space-y-0 text-right">
      <!-- Right Column: Form to log recovery progress -->
      <div class="w-full lg:w-[45%] space-y-6">
        <div class="border border-neutral-200 bg-white rounded-3xl p-6 space-y-5 shadow-sm">
          <div>
            <h3 class="text-sm font-bold text-neutral-900 flex items-center gap-1.5 justify-end font-sans">
              <span>رصد وتوثيق حالة تحسن جديدة</span>
              <i class="ti ti-edit text-base text-black"></i>
            </h3>
            <p class="text-[10px] text-neutral-400 mt-1">اربط نسبة تحسنك تلقائياً بآخر نشاط علاجي أو حدده يدوياً.</p>
          </div>

          <form onsubmit="submitRecoveryEntry(event)" class="space-y-4">
            <!-- Smart Auto-Link Switch -->
            <div class="flex items-center justify-between pb-3.5 border-b border-neutral-100/80">
              <div class="text-right">
                <span class="text-xs font-bold text-neutral-900 block font-sans">الربط التلقائي الذكي ✨</span>
                <span class="text-[9px] text-neutral-400 font-sans">ربط التقييم بأحدث خطوة علاجية ومشكلة تم حلها تلقائياً</span>
              </div>
              <button type="button" onclick="toggleAutoLink()" 
                class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isAutoLink ? 'bg-black' : 'bg-neutral-200'}">
                <span class="absolute top-[2px] bottom-[2px] w-[20px] h-[20px] rounded-full bg-white shadow ring-0 transition-all duration-200 ${isAutoLink ? 'right-[2px]' : 'right-[22px]'}"></span>
              </button>
            </div>

            <!-- Dropdown: Feeling Select -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">اختر الشعور المرتبط:</label>
              <select id="recovery-feeling-select" onchange="handleRecoveryFeelingChange(this.value)" 
                ${isAutoLink ? 'disabled class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-xs focus:outline-none focus:border-black font-sans text-right bg-neutral-50 text-neutral-400 cursor-not-allowed select-none"' : 'class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-xs focus:outline-none focus:border-black font-sans text-right bg-white select-arrow"'}>
                ${state.symptoms.map(s => `<option value="${s.id}" ${s.id === defaultFeelingId ? 'selected' : ''}>${s.titleAr}</option>`).join('')}
              </select>
            </div>

            <!-- Dropdown: Action Select -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">اختر الخطوة العلاجية المنجزة:</label>
              <select id="recovery-action-select" 
                ${isAutoLink ? 'disabled class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-xs focus:outline-none focus:border-black font-sans text-right bg-neutral-50 text-neutral-400 cursor-not-allowed select-none"' : 'class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-xs focus:outline-none focus:border-black font-sans text-right bg-white select-arrow"'}>
                ${defaultActionsList.length === 0
      ? '<option value="">-- لا توجد خطوات علاجية --</option>'
      : defaultActionsList.map(a => `<option value="${a.id}" ${a.id === state.lastCompletedActionId ? 'selected' : ''}>${a.title}</option>`).join('')}
              </select>
            </div>

            ${isAutoLink ? `
              <div class="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between animate-fadeIn select-none">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 bg-black rounded-full animate-ping"></div>
                  <span class="text-[9px] font-bold text-neutral-700 font-sans">الربط التلقائي نشط ومقفل</span>
                </div>
                <span class="text-[8px] font-bold text-neutral-400 font-sans">أحدث إنجاز علاج</span>
              </div>
            ` : ''}

            <!-- Numerical Rating: 1 to 10 -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">قيم نسبة التحسن الحالية بعد الإنجاز (1 إلى 10):</label>
              <div class="flex items-center justify-center  gap-1 mt-1 flex-wrap">
                ${ratingButtonsHTML}
              </div>
              <div class="flex justify-between text-[8px] font-bold text-neutral-400 font-sans px-1">
                <span>1 (لا تحسن)</span>
                <span>5 (متوسط)</span>
                <span>10 (تعافي تام ورضا)</span>
              </div>
            </div>

            <!-- Notes Textarea -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">اليوميات والملاحظات (اختياري):</label>
              <textarea id="recovery-notes-textarea" placeholder="أوصف مدى فرق الخطوة دي معاك، إيه اللي حسيته؟..." class="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-xs focus:outline-none focus:border-black font-sans bg-white resize-none h-20 text-right"></textarea>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 text-xs select-none">
              توثيق وتحليل رصد التحسن 💾
            </button>
          </form>
        </div>
      </div>

      <!-- Left Column: Analytics, Charts, Timeline logs -->
      <div class="flex-1 space-y-6">
        <!-- SVG recovery chart widget -->
        <div class="border border-neutral-200 bg-white rounded-3xl p-5 space-y-3 shadow-sm">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">منحنى التعافي ومؤشر التحسن (آخر 7 رصود)</h3>
          ${renderRecoverySVGChartHTML()}
        </div>

        <!-- Efficacy Leaderboard Matrix -->
        <div class="border border-neutral-200 bg-white rounded-3xl p-5 space-y-3 shadow-sm">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">مصفوفة فاعلية خطوات العلاج الأكثر فاعلية لديك 🏆</h3>
          ${renderEfficacyMatrixHTML()}
        </div>

        <!-- Recovery timeline history list -->
        <div class="border border-neutral-200 bg-white rounded-3xl p-5 space-y-3 shadow-sm">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">السجل التاريخي لعمليات رصد التعافي</h3>
          <div class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            ${logs.length === 0
      ? '<p class="text-[10px] text-neutral-400 text-center py-4">مفيش سجلات تحسن موثقة بعد.</p>'
      : logs.map(l => {
        const symptom = state.symptoms.find(s => s.id === l.feelingId);
        const feelingName = symptom ? symptom.titleAr : 'إحساس مجهول';

        let actionTitle = "خطوة علاجية مخصصة";
        if (symptom) {
          const act = (symptom.actions.near || []).concat(symptom.actions.long || []).find(a => a.id === l.actionId);
          if (act) actionTitle = act.title;
        }

        const dateStr = new Date(l.timestamp).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        return `
                    <div class="flex flex-col p-3 rounded-2xl border border-neutral-100 bg-[#FAFAFA] relative group">
                      <button onclick="deleteRecoveryLog('${l.id}')" class="absolute top-2 left-2 p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="مسح">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-neutral-900">${feelingName}</span>
                          <span class="text-[9px] font-bold px-2 py-0.5 rounded-md bg-black text-white font-sans">${l.rating} / 10 تحسن</span>
                        </div>
                        <span class="text-[8px] font-bold text-neutral-400 font-sans">${dateStr}</span>
                      </div>
                      <p class="text-[10px] text-neutral-500 mt-1.5 font-sans leading-relaxed">الخطوة: ${actionTitle}</p>
                      ${l.notes ? '<p class="text-[10px] text-neutral-400 mt-1 border-t border-neutral-200/50 pt-1 italic">' + l.notes + '</p>' : ''}
                    </div>
                  `;
      }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
  if (window.applyCustomPickers) window.applyCustomPickers(container);
}

export function renderDailyHealthLogger() {
  renderSidebarWidgets();
  renderRecoveryPage();
}

// Bind to window for HTML events / inline JS compatibility
window.renderDailyStatusForm = renderDailyHealthLogger;
window.renderDailyHealthLogger = renderDailyHealthLogger;
window.selectRecoveryRating = selectRecoveryRating;
window.handleRecoveryFeelingChange = handleRecoveryFeelingChange;
window.submitRecoveryEntry = submitRecoveryEntry;
window.deleteRecoveryLog = deleteRecoveryLog;
window.renderSidebarWidgets = renderSidebarWidgets;
window.renderRecoveryPage = renderRecoveryPage;
window.toggleAutoLink = toggleAutoLink;
