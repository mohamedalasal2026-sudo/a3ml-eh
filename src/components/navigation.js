/**
 * Page Views Routing, Navigation Bars & Scroll Orchestrator Component
 */

import { state, saveState } from '../state/store.js';
import { updateCompletionPercentage } from './header.js';
import { calculateAdvancedCorrelations } from '../services/analytics.js';

export function setViewPage(page, keepSymptomId = false) {
  state.activePageView = page;

  // PWA History integration
  if (!window.isPopStateNavigation) {
    window.history.pushState({ page: page, symptomId: keepSymptomId ? state.activeSymptomId : null }, "");
  }

  const dashboardView = document.getElementById('dashboard-view');
  const symptomDetailView = document.getElementById('symptom-detail-view');
  const recoveryView = document.getElementById('recovery-view');
  const analyticsDashboard = document.getElementById('analytics-dashboard');
  const routinesTasksView = document.getElementById('routines-tasks-view');

  const allViews = [
    { el: dashboardView, name: 'dashboard' },
    { el: analyticsDashboard, name: 'dashboard' },
    { el: symptomDetailView, name: 'symptom-detail' },
    { el: recoveryView, name: 'recovery' },
    { el: routinesTasksView, name: 'routines-tasks' }
  ];

  // 1. Identify which views should be visible vs hidden
  const showViews = [];
  const hideViews = [];

  allViews.forEach(item => {
    if (!item.el) return;
    if (item.name === page) {
      showViews.push(item.el);
    } else {
      if (page === 'dashboard' && item.name === 'dashboard') {
        showViews.push(item.el);
      } else {
        hideViews.push(item.el);
      }
    }
  });

  // Special sub-context logic for symptom details within dashboard
  if (page === 'dashboard' && keepSymptomId && state.activeSymptomId) {
    if (symptomDetailView) {
      showViews.push(symptomDetailView);
      const gridIdx = showViews.indexOf(dashboardView);
      if (gridIdx !== -1) showViews.splice(gridIdx, 1);
    }
  } else if (page === 'dashboard' && !keepSymptomId) {
    if (symptomDetailView) hideViews.push(symptomDetailView);
  }

  // 2. Main content background shift to create a "different system" mood
  const mainEl = document.querySelector('main');
  const fadeOverlay = document.getElementById('mobile-bottom-fade');
  if (mainEl) {
    if (page === 'routines-tasks') {
      mainEl.classList.remove('bg-[#FAFAFA]');
      mainEl.classList.add('bg-[#F4F4F3]', 'transition-colors', 'duration-500', 'ease-out');
      if (fadeOverlay) {
        fadeOverlay.className = "fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#F4F4F3] via-[#F4F4F3]/95 to-transparent pointer-events-none z-30 md:hidden transition-all duration-500";
      }
    } else {
      mainEl.classList.remove('bg-[#F4F4F3]');
      mainEl.classList.add('bg-[#FAFAFA]', 'transition-colors', 'duration-500', 'ease-out');
      if (fadeOverlay) {
        fadeOverlay.className = "fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent pointer-events-none z-30 md:hidden transition-all duration-500";
      }
    }
  }

  // 3. Simple yet dramatic screen cross-fade & slide transition
  const currentlyVisible = allViews.map(v => v.el).filter(el => el && !el.classList.contains('hidden'));

  if (currentlyVisible.length > 0) {
    // Phase A: Animate Out Currently Visible elements
    currentlyVisible.forEach(el => {
      el.className = el.className.replace(/animate-\w+/g, ''); // Clear old keyframes
      el.classList.add('transition-all', 'duration-150', 'ease-in', 'opacity-0', 'scale-[0.985]', '-translate-y-1');
    });

    // Phase B: Swap and Animate In
    setTimeout(() => {
      currentlyVisible.forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('transition-all', 'duration-150', 'ease-in', 'opacity-0', 'scale-[0.985]', '-translate-y-1');
      });

      // Prepare target show elements (hidden, transparent, and offset)
      showViews.forEach(el => {
        el.classList.remove('hidden');
        el.className = el.className.replace(/animate-\w+/g, '');
        el.classList.add('transition-all', 'duration-300', 'ease-out', 'opacity-0', 'scale-[0.985]', 'translate-y-2');
      });

      // Run internal data/render sequences
      triggerPageRenders(page, keepSymptomId);

      // Trigger animation frame for transition start
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          showViews.forEach(el => {
            el.classList.remove('opacity-0', 'scale-[0.985]', 'translate-y-2');
            el.classList.add('opacity-100', 'scale-100', 'translate-y-0');
          });

          // Cleanup transition helper classes to maintain layout flexibility
          setTimeout(() => {
            showViews.forEach(el => {
              el.classList.remove('transition-all', 'duration-300', 'ease-out', 'opacity-100', 'scale-100', 'translate-y-0');
            });
          }, 300);
        });
      });
    }, 150);
  } else {
    // Fallback direct swap if nothing was visible
    hideViews.forEach(el => el.classList.add('hidden'));
    showViews.forEach(el => el.classList.remove('hidden'));
    triggerPageRenders(page, keepSymptomId);
  }

  if (window.renderMobileBottomNav) window.renderMobileBottomNav();
  if (window.lucide) window.lucide.createIcons();
  saveState(false);
}

function triggerPageRenders(page, keepSymptomId) {
  if (page === 'dashboard') {
    if (!keepSymptomId) {
      state.activeSymptomId = null;
    }
    updateNavButtons('dashboard');
    calculateAdvancedCorrelations();
  } else if (page === 'recovery') {
    state.activeSymptomId = null;
    updateNavButtons('recovery');
    if (window.renderRecoveryPage) window.renderRecoveryPage();
  } else if (page === 'routines-tasks') {
    state.activeSymptomId = null;
    updateNavButtons('routines-tasks');
    if (window.renderRoutinesTasksPage) window.renderRoutinesTasksPage();
  }
}

export function updateNavButtons(activePage) {
  const navDash = document.getElementById('nav-dashboard');
  const navRec = document.getElementById('nav-recovery');
  const navRoutine = document.getElementById('nav-routines-tasks');
  if (navDash && navRec) {
    navDash.className = activePage === 'dashboard'
      ? "flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold bg-black text-white transition-all duration-200 w-full select-none"
      : "flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold text-neutral-500 hover:text-black hover:bg-neutral-50 border border-transparent w-full transition-all duration-200 select-none";

    navRec.className = activePage === 'recovery'
      ? "flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold bg-black text-white transition-all duration-200 w-full select-none"
      : "flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold text-neutral-500 hover:text-black hover:bg-neutral-50 border border-transparent w-full transition-all duration-200 select-none";

    if (navRoutine) {
      navRoutine.className = activePage === 'routines-tasks'
        ? "flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold bg-black text-white transition-all duration-200 w-full select-none font-sans"
        : "flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold text-neutral-500 hover:text-black hover:bg-neutral-50 border border-transparent w-full transition-all duration-200 select-none font-sans";
    }
  }
}

export function showDashboard() {
  state.lastInteractedContext = 'home';
  setViewPage('dashboard');
  updateCompletionPercentage();
}

// --- Dynamic Mobile Navigation Functions ---
export function renderMobileBottomNav() {
  const navContainer = document.getElementById('mobile-bottom-nav');
  if (!navContainer) return;

  const activePage = state.activePageView;

  const homeActive = (activePage === 'dashboard' && state.activeSymptomId === null);
  const homeClass = homeActive
    ? "flex items-center justify-center text-black font-bold scale-110 transition-all w-12 h-12 select-none"
    : "flex items-center justify-center text-neutral-400 hover:text-black font-semibold transition-all w-12 h-12 select-none";

  const routinesActive = (activePage === 'routines-tasks');
  const routinesClass = routinesActive
    ? "flex items-center justify-center text-black font-bold scale-110 transition-all w-12 h-12 select-none"
    : "flex items-center justify-center text-neutral-400 hover:text-black font-semibold transition-all w-12 h-12 select-none";

  const recoveryActive = (activePage === 'recovery');
  const recoveryClass = recoveryActive
    ? "flex items-center justify-center text-black font-bold scale-110 transition-all w-12 h-12 select-none"
    : "flex items-center justify-center text-neutral-400 hover:text-black font-semibold transition-all w-12 h-12 select-none";

  let addAction = "openHomeFABModal()";
  let addTooltip = "إضافة شعور جديد";
  if (state.activeSymptomId) {
    addAction = "focusSymptomDetailsFAB()";
    addTooltip = "إضافة خطوة علاجية جديدة";
  } else if (activePage === 'routines-tasks') {
    const activeTab = window.currentRoutinesTasksTab || 'routines';
    if (activeTab === 'tasks') {
      addAction = "openAddTaskModal()";
      addTooltip = "إضافة مهمة جديدة";
    } else {
      addAction = "openAddRoutineModal()";
      addTooltip = "إضافة روتين جديد";
    }
  }

  const settingsClass = "flex items-center justify-center text-neutral-400 hover:text-black font-semibold transition-all w-12 h-12 select-none";

  navContainer.innerHTML = `
    <!-- Home -->
    <button onclick="setViewPage('dashboard'); if(window.renderMobileBottomNav) window.renderMobileBottomNav();" class="${homeClass}" title="الرئيسية">
      <i class="ti ti-smart-home text-2xl"></i>
    </button>

    <!-- Routines & Tasks -->
    <button onclick="setViewPage('routines-tasks'); if(window.renderMobileBottomNav) window.renderMobileBottomNav();" class="${routinesClass}" title="الروتين والمهام">
      <i class="ti ti-calendar-event text-2xl"></i>
    </button>

    <!-- Contextual Center Add Button -->
    <button onclick="${addAction}" class="relative w-12 h-12 rounded-full bg-black hover:bg-neutral-900 text-white flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 -translate-y-3 border-4 border-white ring-4 ring-neutral-50" title="${addTooltip}">
      <i class="ti ti-plus text-xl"></i>
    </button>

    <!-- Recovery -->
    <button onclick="setViewPage('recovery'); if(window.renderMobileBottomNav) window.renderMobileBottomNav();" class="${recoveryClass}" title="سجل التحسن والتعافي">
      <i class="ti ti-heart text-2xl"></i>
    </button>

    <!-- Settings -->
    <button onclick="resetSystem()" class="${settingsClass}" title="الإعدادات">
      <i class="ti ti-settings text-2xl"></i>
    </button>
  `;
}

export function scrollMobileToReports() {
  if (state.activePageView !== 'dashboard' || state.activeSymptomId !== null) {
    showDashboard();
    if (window.renderMobileBottomNav) window.renderMobileBottomNav();
  }

  setTimeout(() => {
    const el = document.getElementById('analytics-dashboard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

export function scrollMobileToTreatments() {
  if (state.activePageView !== 'dashboard' || state.activeSymptomId === null) {
    return;
  }

  const el = document.getElementById('action-stack-container') || document.getElementById('feeling-actions-title');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Bind to window for HTML events / inline JS compatibility
window.setViewPage = setViewPage;
window.updateNavButtons = updateNavButtons;
window.showDashboard = showDashboard;
window.renderMobileBottomNav = renderMobileBottomNav;
window.scrollMobileToReports = scrollMobileToReports;
window.scrollMobileToTreatments = scrollMobileToTreatments;
