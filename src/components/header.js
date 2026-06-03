/**
 * Dynamic Header & Progress Indicators Component
 */

import { state } from '../state/store.js';

export function updateGreeting() {
  const greetingEl = document.getElementById('user-greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    const prefix = hour < 12 ? 'صباح الفل يا' : 'مساء الورد يا';
    greetingEl.innerText = `${prefix} ${state.username || 'إيلينا'}`;
  }
}

export function updateCompletionPercentage() {
  const logs = state.improvementsLog || [];
  let recoveryPercentage = 0;
  let hasLogs = logs.length > 0;
  if (hasLogs) {
    const sum = logs.reduce((acc, log) => acc + log.rating, 0);
    recoveryPercentage = Math.round((sum / logs.length) * 10);
  }

  const circle = document.getElementById('progress-circle');
  const text = document.getElementById('progress-text');
  const statusDesc = document.getElementById('progress-status-desc');

  if (circle) {
    const offset = 100.53 - (recoveryPercentage / 100) * 100.53;
    circle.style.strokeDashoffset = offset;
  }
  if (text) text.innerText = hasLogs ? recoveryPercentage + "%" : "--%";
  if (statusDesc) {
    const sum = logs.reduce((acc, log) => acc + log.rating, 0);
    const avg = hasLogs ? (sum / logs.length).toFixed(1) : '0';
    statusDesc.innerText = `متوسط التحسن: ${avg} من 10`;
  }

  return recoveryPercentage;
}

export function renderHeader() {
  updateGreeting();
  updateCompletionPercentage();
}

// Bind to window for HTML events / inline JS compatibility
window.updateGreeting = updateGreeting;
window.updateCompletionPercentage = updateCompletionPercentage;
window.renderHeader = renderHeader;
