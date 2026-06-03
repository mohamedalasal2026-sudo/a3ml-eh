/**
 * Global State Mutators & Action Creators
 */

import { state, saveState } from './store.js';
import { pushSyncUpdate } from '../services/sync.js';

// Safe rendering triggers
export function triggerUIRender() {
  if (window.renderDailyStatusForm) window.renderDailyStatusForm();
  if (window.updateCompletionPercentage) window.updateCompletionPercentage();
  if (window.generateAnalyticsInsight) window.generateAnalyticsInsight();
  if (window.renderSVGChart) window.renderSVGChart();
  if (window.calculateAdvancedCorrelations) window.calculateAdvancedCorrelations();
  if (window.renderMobileBottomNav) window.renderMobileBottomNav();
  if (window.lucide) window.lucide.createIcons();
}

export function setDailyMood(rating) {
  state.dailyStatus.overallMood = rating;
  const todayIdx = 6;
  state.historicalData.scores[todayIdx] = rating;

  triggerUIRender();
  pushSyncUpdate();
  saveState(false); // Silent save to avoid toast spam
}

export function saveDayDescription(val) {
  state.dailyStatus.dayDescription = val;
  pushSyncUpdate();
  saveState(false);
}

export function setHabitState(habit, val) {
  const current = state.dailyStatus.checklist[habit] || 'unset';
  if (current === val) {
    state.dailyStatus.checklist[habit] = 'unset';
  } else {
    state.dailyStatus.checklist[habit] = val;
  }
  
  triggerUIRender();
  pushSyncUpdate();
  saveState(true);
}

export function saveHabitReason(habit, val) {
  state.dailyStatus.checklistReasons = state.dailyStatus.checklistReasons || {};
  state.dailyStatus.checklistReasons[habit] = val;
  pushSyncUpdate();
  saveState(false);
}

export function setTaskState(taskId, val) {
  const task = state.dailyStatus.tasks.find(t => t.id === taskId);
  if (task) {
    const current = task.status || (task.completed ? 'yes' : 'unset');
    if (current === val) {
      task.status = 'unset';
      task.completed = false;
    } else {
      task.status = val;
      task.completed = (val === 'yes');
    }
  }

  triggerUIRender();
  pushSyncUpdate();
  saveState(true);
}

export function saveTaskReason(taskId, val) {
  const task = state.dailyStatus.tasks.find(t => t.id === taskId);
  if (task) {
    task.reason = val;
  }
  pushSyncUpdate();
  saveState(false);
}

export function resetAllTasks() {
  if (confirm('متأكد إنك عايز تمسح إجابات كل مهام اليوم وتصفرها؟')) {
    state.dailyStatus.tasks.forEach(task => {
      task.status = 'unset';
      task.completed = false;
      task.reason = '';
    });
    
    if (window.renderDailyStatusForm) window.renderDailyStatusForm();
    if (window.updateCompletionPercentage) window.updateCompletionPercentage();
    if (window.calculateAdvancedCorrelations) window.calculateAdvancedCorrelations();
    pushSyncUpdate();
    saveState(true);
  }
}

export function setCustomMetricState(metricId, val) {
  const metric = state.dailyStatus.customMetrics.find(m => m.id === metricId);
  if (metric) {
    const current = metric.value || 'unset';
    if (current === val) {
      metric.value = 'unset';
    } else {
      metric.value = val;
    }
  }
  
  triggerUIRender();
  pushSyncUpdate();
  saveState(true);
}

export function saveCustomMetricReason(metricId, val) {
  const metric = state.dailyStatus.customMetrics.find(m => m.id === metricId);
  if (metric) {
    metric.reason = val;
  }
  pushSyncUpdate();
  saveState(false);
}

export function adjustCustomNumeric(metricId, delta) {
  const metric = state.dailyStatus.customMetrics.find(m => m.id === metricId);
  if (metric) {
    let newVal = parseFloat(metric.value) + delta;
    if (newVal >= (metric.min || 0) && newVal <= (metric.max || 100)) {
      metric.value = newVal;
      triggerUIRender();
      pushSyncUpdate();
      saveState(true);
    }
  }
}

export function deleteFeelingLog(logId) {
  if (confirm('متأكد إنك عايز تحذف التسجيل ده؟')) {
    state.dailyStatus.feelingsLog = state.dailyStatus.feelingsLog.filter(l => l.id !== logId);
    if (window.renderDailyStatusForm) window.renderDailyStatusForm();
    saveState(false);
    pushSyncUpdate();
  }
}

export function skipAction(actionId) {
  if (!state.sessionSkippedActions.includes(actionId)) {
    state.sessionSkippedActions.push(actionId);
  }
  if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
  if (window.renderActionStack) window.renderActionStack();
  if (window.renderSkippedTray) window.renderSkippedTray();
  if (window.lucide) window.lucide.createIcons();
  pushSyncUpdate();
  if (window.triggerToastNotification) {
    window.triggerToastNotification("تم تأجيل الخطوة دي مؤقتاً.");
  }
}

export function restoreSkippedAction(actionId) {
  state.sessionSkippedActions = state.sessionSkippedActions.filter(id => id !== actionId);
  if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
  if (window.renderActionStack) window.renderActionStack();
  if (window.renderSkippedTray) window.renderSkippedTray();
  if (window.lucide) window.lucide.createIcons();
  pushSyncUpdate();
  saveState(true);
}

export function clearSkipped() {
  const symptom = state.symptoms.find(s => s.id === state.activeSymptomId);
  if (symptom && symptom.actions[state.activeTab]) {
    const ids = symptom.actions[state.activeTab].map(a => a.id);
    state.sessionSkippedActions = state.sessionSkippedActions.filter(id => !ids.includes(id));
  } else {
    state.sessionSkippedActions = [];
  }
  if (window.renderActionTabsAndCounts) window.renderActionTabsAndCounts();
  if (window.renderActionStack) window.renderActionStack();
  if (window.renderSkippedTray) window.renderSkippedTray();
  if (window.lucide) window.lucide.createIcons();
  pushSyncUpdate();
  saveState(true);
}

// Bind to window for HTML events / inline JS compatibility
window.setDailyMood = setDailyMood;
window.saveDayDescription = saveDayDescription;
window.setHabitState = setHabitState;
window.saveHabitReason = saveHabitReason;
window.setTaskState = setTaskState;
window.saveTaskReason = saveTaskReason;
window.resetAllTasks = resetAllTasks;
window.setCustomMetricState = setCustomMetricState;
window.saveCustomMetricReason = saveCustomMetricReason;
window.adjustCustomNumeric = adjustCustomNumeric;
window.deleteFeelingLog = deleteFeelingLog;
window.skipAction = skipAction;
window.restoreSkippedAction = restoreSkippedAction;
window.clearSkipped = clearSkipped;
