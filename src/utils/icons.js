/**
 * Premium Icons Retrieval Utility (Tabler Icons)
 */

export function getIconHTML(iconName, classes = "") {
  if (!iconName) return '';
  if (iconName.startsWith('<svg')) {
    // If it's an inline SVG, return it directly
    return iconName;
  }
  // Otherwise, return the Tabler Icon tag
  return `<i class="ti ti-${iconName} ${classes}"></i>`;
}

// Bind to window for absolute HTML/Inline JS compatibility
window.getIconHTML = getIconHTML;
window.getIconSvg = getIconHTML; // Backwards compatibility fallback
