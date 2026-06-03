/**
 * DOM Helper Utilities
 */

export function $(selector) {
  return document.querySelector(selector);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}

export function toggleElementClass(element, className, force) {
  if (!element) return;
  if (force !== undefined) {
    if (force) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  } else {
    element.classList.toggle(className);
  }
}

export function getWeightLabel(weight) {
  const w = parseInt(weight) || 6;
  if (w <= 2) return "هامشي ";
  if (w <= 4) return "عادي ";
  if (w <= 6) return "مهم ";
  if (w <= 8) return "مهم جداً ";
  return "عالي جدا ";
}

// Bind to window for HTML events / inline JS compatibility
export function calculateImportance(rating, timeVal) {
  // Base weight from rating (1‑5) scaled to 2‑10
  const base = Math.min(10, Math.max(2, rating * 2));
  // Time‑frame adjustment
  let multiplier = 1;
  if (timeVal === 'near') multiplier = 0.8; // quick fixes get slightly lower weight
  else if (timeVal === 'mid') multiplier = 1; // medium stays as is
  else if (timeVal === 'long') multiplier = 1.2; // long‑term gets a boost
  const weight = Math.min(10, Math.max(1, Math.round(base * multiplier)));
  // Human‑readable label
  let label = '';
  if (timeVal === 'near') label = 'مسكّن سريع';
  else if (timeVal === 'mid') label = 'تست كومبش';
  else if (timeVal === 'long') label = 'علاج جذري';
  return { weight, label };
}

window.$ = $;
window.$$ = $$;
window.toggleElementClass = toggleElementClass;
window.getWeightLabel = getWeightLabel;
window.calculateImportance = calculateImportance;
