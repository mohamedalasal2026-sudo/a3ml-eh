/**
 * Premium Floating Toast Notifications Component
 */

export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  
  let typeClasses = "bg-black"; // Premium editorial black
  if (type === 'error') {
    typeClasses = "bg-red-600 border border-red-500/30";
  } else if (type === 'info') {
    typeClasses = "bg-neutral-900 border border-neutral-800";
  }

  toast.className = `fixed bottom-10 left-1/2 transform -translate-x-1/2 ${typeClasses} text-white text-xs font-bold py-3 px-6 rounded-pill shadow-2xl z-50 transition-all duration-300 opacity-0 font-sans text-center select-none`;
  toast.innerText = message;
  
  document.body.appendChild(toast);

  // Trigger smooth Spring-like fade in
  setTimeout(() => {
    toast.classList.remove('opacity-0');
    toast.classList.add('translate-y-[-4px]');
  }, 50);

  // Fade out and self destruct
  setTimeout(() => {
    toast.classList.add('opacity-0');
    toast.classList.remove('translate-y-[-4px]');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Bind to window for immediate HTML/Inline JS compatibility
window.showToast = showToast;
window.triggerToastNotification = (msg) => showToast(msg, 'success');
