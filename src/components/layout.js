/**
 * App Layout Template & Dynamic DOM Skeleton Ingestor Component
 */

export function injectAppLayout() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <!-- SECURITY LOCK SCREEN OVERLAY -->
    <div id="lock-screen"
      class="fixed inset-0 bg-[#FAFAFA] z-[100] flex flex-col items-center justify-center p-6 transition-all duration-500 hidden opacity-0">
      <div class="max-w-md w-full text-center space-y-8 animate-fadeIn flex flex-col items-center justify-center">
        <div class="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto text-black">
          <i class="ti ti-shield-lock text-3xl"></i>
        </div>
        
        <div class="space-y-2">
          <h2 class="text-xl font-bold tracking-tight">نظام الحماية والأمان 🔒</h2>
          <p class="text-xs text-neutral-400 font-sans" id="lock-screen-user-desc">من فضلك أدخل رمز PIN المكون من 6 أرقام لمتابعة صحتك.</p>
        </div>

        <!-- Dots Display -->
        <div class="flex items-center justify-center gap-3 py-4">
          <div class="w-4 h-4 rounded-full border-2 border-neutral-300 transition-all duration-200 pin-dot" id="dot-0"></div>
          <div class="w-4 h-4 rounded-full border-2 border-neutral-300 transition-all duration-200 pin-dot" id="dot-1"></div>
          <div class="w-4 h-4 rounded-full border-2 border-neutral-300 transition-all duration-200 pin-dot" id="dot-2"></div>
          <div class="w-4 h-4 rounded-full border-2 border-neutral-300 transition-all duration-200 pin-dot" id="dot-3"></div>
          <div class="w-4 h-4 rounded-full border-2 border-neutral-300 transition-all duration-200 pin-dot" id="dot-4"></div>
          <div class="w-4 h-4 rounded-full border-2 border-neutral-300 transition-all duration-200 pin-dot" id="dot-5"></div>
        </div>

        <!-- Numeric Keypad Grid -->
        <div class="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto pt-2">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `
            <button type="button" onclick="handlePinInput('${num}')"
              class="w-16 h-16 rounded-full bg-white hover:bg-neutral-100 border border-neutral-100 flex items-center justify-center text-lg font-bold font-sans transition-all duration-200 shadow-sm active:scale-95 mx-auto select-none">
              ${num}
            </button>
          `).join('')}
          <button type="button" onclick="handlePinInput('C')"
            class="w-16 h-16 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-xs font-bold font-sans transition-all duration-200 active:scale-95 mx-auto select-none text-neutral-500 font-sans">
            تصفير
          </button>
          <button type="button" onclick="handlePinInput('0')"
            class="w-16 h-16 rounded-full bg-white hover:bg-neutral-100 border border-neutral-100 flex items-center justify-center text-lg font-bold font-sans transition-all duration-200 shadow-sm active:scale-95 mx-auto select-none">
            0
          </button>
          <button type="button" onclick="handlePinInput('delete')"
            class="w-16 h-16 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-xs font-bold font-sans transition-all duration-200 active:scale-95 mx-auto select-none text-neutral-500">
            ⌫
          </button>
        </div>
        
        <p class="text-[10px] text-neutral-400 pt-4">رمز PIN آمن ومحفوظ محلياً على جهازك لحماية خصوصيتك.</p>
      </div>
    </div>

    <!-- LOCAL USER ONBOARDING SCREEN -->
    <div id="onboarding-screen"
      class="fixed inset-0 bg-[#FAFAFA] z-50 flex flex-col items-center justify-center p-6 transition-all duration-500 hidden opacity-0">
      <div class="max-w-md w-full text-center space-y-8 animate-fadeIn">
        <div class="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
          <div class="w-4 h-4 bg-white rounded-full"></div>
        </div>
        <div class="space-y-3">
          <h2 class="text-2xl font-bold tracking-tight">يا مرحب بيك في أعمل ايه !؟ 🌸</h2>
          <p class="text-sm text-neutral-500">من فضلك قولنا اسمك الأول عشان نخصص لك التجربة ونتابع صحتك سوا.</p>
        </div>
        <form onsubmit="saveOnboardingName(event)" class="space-y-4">
          <input type="text" id="onboarding-name-input" required placeholder="اكتب اسمك هنا..."
            class="w-full px-5 py-4 rounded-2xl border border-neutral-200 text-center text-lg focus:outline-none focus:border-black font-sans bg-white shadow-sm">
          <button type="submit"
            class="w-full py-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-lg transition-all duration-300">
            يلا بينا نبتدي
          </button>
        </form>
      </div>
    </div>

    <!-- Outer Split-View Container -->
    <div class="flex flex-col md:flex-row min-h-screen">

      <!-- DESKTOP STICKY SIDEBAR (30% Width, border-l separating it in RTL) -->
      <aside
        class="hidden md:block md:w-[30%] border-l border-neutral-200/80 bg-white p-8 h-screen sticky top-0 overflow-y-auto z-10">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-black rounded-full flex flex-row items-center justify-center">
              <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
            </div>
            <span class="text-base font-bold tracking-tight font-sans">اعمل.ايه!؟</span>
          </div>
          <button onclick="resetSystem()" title="تصفير النظام ومسح كل البيانات"
            class="p-2 hover:bg-neutral-100 rounded-xl transition-all duration-200 flex items-center justify-center text-neutral-400 hover:text-black gap-1.5 text-xs font-bold font-sans">
            <i class="ti ti-refresh text-xs"></i>
            <span>تصفير</span>
          </button>
        </div>

        <div class="space-y-6">
          <div>
            <h2 class="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3">قائمة التنقل</h2>
            <nav class="flex flex-col space-y-2" id="sidebar-nav">
              <button onclick="setViewPage('dashboard')" id="nav-dashboard" class="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold bg-black text-white transition-all duration-200 w-full select-none">
                <i class="ti ti-layout-dashboard text-base"></i>
                <span>لوحة التحكم (الرئيسية)</span>
              </button>
              <button onclick="setViewPage('routines-tasks')" id="nav-routines-tasks" class="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold text-neutral-500 hover:text-black hover:bg-neutral-50 border border-transparent w-full transition-all duration-200 select-none font-sans">
                <i class="ti ti-calendar-event text-base"></i>
                <span>الروتين والمهام</span>
              </button>
              <button onclick="setViewPage('recovery')" id="nav-recovery" class="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold text-neutral-500 hover:text-black hover:bg-neutral-50 border border-transparent w-full transition-all duration-200 select-none">
                <i class="ti ti-heart text-base"></i>
                <span>سجل التحسن والتعافي</span>
              </button>
              <button onclick="openTreatmentHistoryModal()" id="nav-treatment-history" class="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-right text-xs font-bold text-neutral-500 hover:text-black hover:bg-neutral-50 border border-transparent w-full transition-all duration-200 select-none">
                <i class="ti ti-history text-base"></i>
                <span>سجل العلاج والخطوات</span>
              </button>
            </nav>
          </div>

          <!-- Dynamic Sidebar Widgets Container (Recovery Index & Last Activity) -->
          <div id="desktop-sidebar-widgets" class="space-y-6 pt-6 border-t border-neutral-100"></div>
        </div>
      </aside>

      <!-- MAIN VIEW AREA (70% on desktop, 100% on mobile) -->
      <main class="flex-1 flex flex-col min-h-screen bg-[#FAFAFA] relative pb-20 md:pb-0">

        <!-- Top Header / Greeting Bar -->
        <header
          class="border-b border-neutral-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 md:px-10 md:py-6 flex items-center justify-between"
          style="transform: translateZ(0); -webkit-transform: translateZ(0);">

          <div class="flex items-center gap-2">
            <div>
              <h1 id="user-greeting" class="text-base md:text-xl font-bold tracking-tight text-neutral-900">صباح الفل يا إيلينا</h1>
              <p class="text-xs md:text-sm text-neutral-400 hidden sm:block">دي حالتك الصحية وعاداتك النهاردة.</p>
            </div>
            <!-- Notification Bell Icon -->
            <button onclick="openHeaderNotificationsPopup()" id="header-notif-btn" title="التنبيهات والمهام المستحقة"
              class="relative p-2 hover:bg-neutral-100 rounded-full transition-all duration-200 flex items-center justify-center text-neutral-400 hover:text-black">
              <i class="ti ti-bell text-base"></i>
              <span id="header-notif-badge" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full border border-white text-[8px] font-bold flex items-center justify-center hidden"></span>
            </button>
          </div>

          <!-- Mini Circular Progress Widget -->
          <div class="flex items-center gap-3 cursor-pointer select-none" onclick="setViewPage('recovery')"
            title="مؤشر التعافي العام">
            <div class="relative w-10 h-10 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#EAEAE8" stroke-width="3" fill="transparent" />
                <circle id="progress-circle" cx="20" cy="20" r="16" stroke="#000000" stroke-width="3" fill="transparent"
                  stroke-dasharray="100.53" stroke-dashoffset="100.53" class="transition-all duration-500 ease-out" />
              </svg>
              <span id="progress-text" class="absolute text-[10px] font-bold text-neutral-900 font-sans">0%</span>
            </div>
            <div class="hidden lg:block leading-none text-right">
              <span class="text-xs font-bold text-neutral-900 block font-sans">مؤشر التعافي العام</span>
              <span id="progress-status-desc" class="text-[10px] text-neutral-400">متوسط التحسن: 0 من 10</span>
            </div>
          </div>
        </header>

        <!-- Main Contents -->
        <div class="flex-1 p-6 md:p-10 space-y-8 md:space-y-12 max-w-5xl w-full mx-auto">

          <!-- FIXED BOTTOM MOBILE NAVIGATION FADE GRADIENT -->
          <div id="mobile-bottom-fade" class="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent pointer-events-none z-30 md:hidden transition-all duration-500"></div>

          <!-- FIXED BOTTOM MOBILE NAVIGATION BAR -->
          <div id="mobile-bottom-nav" class="fixed bottom-4 left-4 right-4 z-40 bg-white border border-neutral-200 rounded-[32px] shadow-[0_10px_35px_rgba(0,0,0,0.15)] md:hidden flex justify-around items-center h-16 px-2 max-w-lg mx-auto"></div>

          <!-- DASHBOARD CONTAINER: SYMPTOMS & METRICS -->
          <section id="dashboard-view" class="space-y-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 class="text-xs font-bold text-neutral-400 uppercase tracking-wider">المشاعر والأحاسيس الحالية</h2>
                <p class="text-xs text-neutral-500 mt-1">دوس على أي إحساس عشان تشوف خطوات بسيطة تحسن بيها مودك وتتعافى.</p>
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <button onclick="openTreatmentHistoryModal()" class="flex-1 sm:flex-none py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/80 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow select-none">
                  <i class="ti ti-history text-sm"></i>
                  <span>سجل العلاج</span>
                </button>
                <button onclick="openHomeFABModal()" class="flex-1 sm:flex-none py-3 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow select-none">
                  <i class="ti ti-plus text-sm"></i>
                  <span>إحساس جديد</span>
                </button>
              </div>
            </div>

            <!-- Category Filter Bar and Management Trigger -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar" id="category-filter-pills"></div>
              <button type="button" onclick="toggleCategoryManager()"
                class="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-black transition-colors py-1.5 px-3 bg-white border border-neutral-200/80 rounded-pill shadow-sm select-none">
                <i class="ti ti-settings text-xs"></i>
                <span>إدارة التصنيفات</span>
              </button>
            </div>

            <!-- Collapsible Category Manager Panel -->
            <div id="category-manager-panel"
              class="hidden border border-neutral-200/80 bg-white rounded-3xl p-5 space-y-4 shadow-sm transition-all duration-300 animate-slideDown">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-400">إدارة التصنيفات الخاصة بك</h4>
                <button type="button" onclick="toggleCategoryManager()" class="text-neutral-400 hover:text-black">
                  <i class="ti ti-x text-base"></i>
                </button>
              </div>
              <div class="flex flex-wrap gap-2" id="manager-categories-list"></div>
              <form onsubmit="handleAddCategory(event)" class="flex gap-2 max-w-sm pt-2 border-t border-neutral-100">
                <input type="text" id="new-category-input" required placeholder="مثال: الرياضة، القراءة..."
                  class="flex-1 px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans bg-neutral-50 text-right">
                <button type="submit"
                  class="py-2 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors">إضافة تصنيف</button>
              </form>
            </div>

            <!-- Symptom Card Double-Row Grid -->
            <div id="symptom-grid" class="grid grid-cols-2 gap-4"></div>
          </section>

          <!-- SYMPTOM DETAIL INTERVENTIONS PANEL (Switches view dynamically) -->
          <section id="symptom-detail-view" class="hidden space-y-6 animate-fadeIn">
            <div class="flex items-center justify-between border-b border-neutral-200 pb-4">
              <button onclick="showDashboard()"
                class="group flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-black transition-colors">
                <i class="ti ti-arrow-right text-base transition-transform group-hover:translate-x-1"></i>
                <span>رجوع للمشاعر والأحاسيس</span>
              </button>
              <div class="text-right">
                <span id="symptom-ar-badge"
                  class="text-xs font-medium text-neutral-400 font-sans px-2.5 py-1 bg-neutral-100 rounded-full"></span>
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8 space-y-6 lg:space-y-0">
              <!-- Detail Intro & Tab Navigation -->
              <div class="w-full lg:w-[35%] space-y-6">
                <div class="flex items-center gap-3">
                  <div id="symptom-icon-box" class="p-3 bg-black text-white rounded-2xl"></div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h2 id="symptom-title-en" class="text-xl font-bold tracking-tight font-sans"></h2>
                      <button onclick="openEditModal('feeling', state.activeSymptomId)"
                        class="p-1.5 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-black transition-colors"
                        title="تعديل الشعور">
                        <i class="ti ti-edit text-base"></i>
                      </button>
                    </div>
                    <p id="symptom-title-ar" class="text-sm text-neutral-400 font-sans"></p>
                  </div>
                </div>

                <div class="border border-neutral-200/80 bg-white rounded-2xl p-5 space-y-3">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">هتعمل إيه وتتعافى إزاي؟</h3>
                  <div class="flex flex-col space-y-1.5" id="timeline-tabs">
                    <button onclick="switchTab('near')" id="tab-near"
                      class="flex items-center justify-between px-4 py-2.5 rounded-xl text-right text-xs font-bold transition-all duration-200">
                      <span>حاجات تعملها حالاً</span>
                      <span class="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full font-sans" id="tab-near-count">0</span>
                    </button>
                    <button onclick="switchTab('long')" id="tab-long"
                      class="flex items-center justify-between px-4 py-2.5 rounded-xl text-right text-xs font-bold transition-all duration-200">
                      <span>نصائح على المدى الطويل</span>
                      <span class="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full font-sans" id="tab-long-count">0</span>
                    </button>
                  </div>
                </div>

                <!-- All Actions management panel -->
                <div class="border border-neutral-200/80 bg-white rounded-2xl p-5 space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">خطوات العلاج لهذا الشعور</h3>
                    <div class="flex items-center gap-2">
                      <button onclick="focusSymptomDetailsFAB()"
                        class="text-[9px] font-bold text-black bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-md flex items-center gap-0.5 font-sans transition-colors">+ خطوة</button>
                      <button onclick="toggleAllActionsList()"
                        class="text-[10px] font-bold text-neutral-400 hover:text-black flex items-center gap-1 select-none">
                        <span id="all-actions-toggle-text">عرض الكل</span>
                        <i id="toggle-all-actions-icon" class="ti ti-chevron-down text-xs transition-transform duration-200"></i>
                      </button>
                    </div>
                  </div>
                  <div id="all-actions-list-container" class="hidden space-y-3 pt-2 max-h-60 overflow-y-auto pr-1"></div>
                </div>
              </div>

              <!-- Interventions Action Stack Panel -->
              <div class="flex-1 space-y-6">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-2">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">خطوات العلاج مقترحة</h3>
                    <button onclick="focusSymptomDetailsFAB()"
                      class="text-[9px] font-bold text-black bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-md flex items-center gap-1 font-sans transition-colors">+ خطوة جديدة</button>
                  </div>
                  <span class="text-xs text-neutral-400 font-sans" id="stack-count-badge">خطوة 1 من 3</span>
                </div>

                <!-- Main Interactive Stack Container -->
                <div class="relative min-h-[280px] w-full" id="action-stack-container"></div>

                <!-- Minimized Skipped Tray -->
                <div id="skipped-tray-container"
                  class="hidden border border-neutral-200/80 bg-neutral-100/50 rounded-2xl p-4 space-y-2 animate-fadeIn">
                  <div class="flex items-center justify-between">
                    <h4 class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">خطوات عديتها مؤقتاً</h4>
                    <button onclick="clearSkipped()"
                      class="text-[10px] font-bold underline hover:text-black transition-colors">رجعهم كلهم</button>
                  </div>
                  <div class="flex flex-wrap gap-2" id="skipped-tray-pills"></div>
                </div>
              </div>
            </div>

            <!-- Track B: Specific Therapeutic Actions -->
            <div class="space-y-4 mt-8 pt-6 border-t border-neutral-200">
              <div class="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <div class="w-1.5 h-4 bg-black rounded-full"></div>
                <h4 class="text-xs font-bold text-neutral-900" id="feeling-actions-title">تحليل تأثير خطوات العلاج الخاصة بالشعور المختار</h4>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Card: Best Near Action (مسكّن سريع) -->
                <div class="p-5 rounded-2xl bg-white border border-neutral-100 hover:border-black/20 hover:shadow-sm transition-all duration-300 flex flex-col justify-between min-h-[145px] relative group">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between gap-1.5">
                      <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block" id="best-near-label">مسكّن سريع (حالاً)</span>
                      <div class="flex items-center gap-1">
                        <span id="best-near-time" class="text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full font-sans select-none flex-shrink-0">--</span>
                        <span id="best-near-rating" class="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full font-sans select-none flex-shrink-0">⭐ --</span>
                      </div>
                    </div>
                    <h5 id="best-near-impact" class="text-xs font-bold text-neutral-900 leading-tight">--</h5>
                  </div>
                  <p class="text-[10px] text-neutral-500 leading-relaxed font-medium mt-2" id="best-near-desc">
                    أكتر خطوة سريعة بتعملها وبتديك راحة ومفعول لحظي بناءً على تقييمك وسرعة التشافي.
                  </p>
                </div>

                <!-- Card: Best Long Action (علاج جذري) -->
                <div class="p-5 rounded-2xl bg-white border border-neutral-100 hover:border-black/20 hover:shadow-sm transition-all duration-300 flex flex-col justify-between min-h-[145px] relative group">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between gap-1.5">
                      <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block" id="best-long-label">علاج جذري (المدى الطويل)</span>
                      <span id="best-long-rating" class="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full font-sans select-none flex-shrink-0">⭐ --</span>
                    </div>
                    <h5 id="best-long-impact" class="text-xs font-bold text-neutral-900 leading-tight">--</h5>
                  </div>
                  <p class="text-[10px] text-neutral-500 leading-relaxed font-medium mt-2" id="best-long-desc">
                    نصيحة المدى الطويل الأكثر تأثيراً وجودة في علاج الشعور من جذوره، بغض النظر عن وقتها.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- RECOVERY & IMPROVEMENT LOGS PANEL -->
          <section id="recovery-view" class="hidden space-y-8 animate-fadeIn">
            <!-- Populated dynamically via renderRecoveryPage() -->
          </section>

          <!-- ROUTINES & TASKS PANEL -->
          <section id="routines-tasks-view" class="hidden space-y-8 animate-fadeIn">
            <!-- Populated dynamically via renderRoutinesTasksPage() -->
          </section>

          <!-- CORRELATED ANALYTICS DASHBOARD -->
          <section id="analytics-dashboard" class="space-y-6 pt-6 border-t border-neutral-200">
            <div class="border border-neutral-200/80 bg-white rounded-3xl p-6 space-y-6">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-neutral-100 rounded-2xl flex items-center justify-center text-black flex-shrink-0">
                    <i class="ti ti-chart-line text-lg"></i>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-neutral-900">أرقامك وتحليلاتك الذكية 🧠</h3>
                    <p class="text-xs text-neutral-400">تحليلات ذكية بتوضح إزاي عاداتك المخصصة بتأثر على نسبة روقانك.</p>
                  </div>
                </div>

                <div class="flex items-center gap-2 self-start md:self-center">
                  <select id="correlation-feeling-select" onchange="calculateAdvancedCorrelations()"
                    class="text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer font-sans bg-white select-arrow text-right select-none">
                    <option value="all">كل المشاعر (الروقان العام)</option>
                  </select>
                  <button type="button" onclick="calculateAdvancedCorrelations()"
                    class="text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-colors py-2.5 px-4 rounded-xl select-none text-center">
                    تحديث التحليل
                  </button>
                </div>
              </div>

              <!-- Main Track -->
              <div class="pt-2 space-y-8">
                <!-- Track A: Daily Habits & General Metrics -->
                <div class="space-y-4">
                  <div class="flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <div class="w-1.5 h-4 bg-neutral-900 rounded-full"></div>
                    <h4 class="text-xs font-bold text-neutral-900">أولاً: تتبع العادات والمؤشرات اليومية العامة</h4>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Card: Single Best Habit -->
                    <div class="p-5 rounded-2xl bg-white border border-neutral-100 hover:border-black/20 hover:shadow-sm transition-all duration-300 flex flex-col justify-between min-h-[145px] relative group">
                      <div class="space-y-2">
                        <div class="flex items-center justify-between gap-1.5">
                          <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">العادة الأكثر تأثيراً</span>
                          <span id="single-habit-percent" class="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-sans select-none flex-shrink-0">--</span>
                        </div>
                        <h5 id="single-habit-impact" class="text-xs font-bold text-neutral-900 leading-tight">--</h5>
                      </div>
                      <p class="text-[10px] text-neutral-500 leading-relaxed font-medium mt-2" id="single-habit-desc">
                        العادة الفردية صاحبة أعلى نسبة تأثير إيجابي مباشر على روقانك وراحة بالك.
                      </p>
                    </div>

                    <!-- Card: Combined Habit Combo -->
                    <div class="p-5 rounded-2xl bg-white border border-neutral-100 hover:border-black/20 hover:shadow-sm transition-all duration-300 flex flex-col justify-between min-h-[145px] relative group">
                      <div class="space-y-2">
                        <div class="flex items-center justify-between gap-1.5">
                          <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">التوليفة الذهبية الثنائية</span>
                          <span id="combo-habit-percent" class="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-sans select-none flex-shrink-0">--</span>
                        </div>
                        <h5 id="combo-habit-impact" class="text-xs font-bold text-neutral-900 leading-tight">--</h5>
                      </div>
                      <p class="text-[10px] text-neutral-500 leading-relaxed font-medium mt-2" id="combo-habit-desc">
                        أقوى مزيج من العادات لما بتعملهم سوا بيسرعوا تعافيك وراحتك لأعادة نسبة ممكنة!
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Weekly SVG Line Chart -->
                <div class="space-y-4 pt-4 border-t border-neutral-100">
                  <div class="flex items-center justify-between">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">مخطط الأداء الأسبوعي 📈</label>
                    <div class="flex items-center gap-3 text-[9px] font-bold font-sans">
                      <span class="flex items-center gap-1"><span class="w-2 h-2 bg-black rounded-full"></span>الصحة النفسية</span>
                      <span class="flex items-center gap-1"><span class="w-2 h-2 bg-neutral-400 rounded-full"></span>سرعة التعافي</span>
                    </div>
                  </div>
                  <div class="bg-neutral-50/50 p-4 border border-neutral-100 rounded-2xl flex items-center justify-center">
                    <svg id="analytics-svg" viewBox="0 0 500 160" class="w-full h-auto overflow-visible select-none">
                      <!-- Grid horizontal lines -->
                      <line x1="40" y1="20" x2="460" y2="20" stroke="#F4F4F3" stroke-width="1" stroke-dasharray="2 2" />
                      <line x1="40" y1="55" x2="460" y2="55" stroke="#F4F4F3" stroke-width="1" stroke-dasharray="2 2" />
                      <line x1="40" y1="90" x2="460" y2="90" stroke="#F4F4F3" stroke-width="1" stroke-dasharray="2 2" />
                      <line x1="40" y1="125" x2="460" y2="125" stroke="#F4F4F3" stroke-width="1" stroke-dasharray="2 2" />
                      <line x1="40" y1="140" x2="460" y2="140" stroke="#EAEAE8" stroke-width="1.5" />
                      
                      <!-- Curves and areas -->
                      <path id="svg-score-area" fill="rgba(0,0,0,0.015)" d="" />
                      <path id="svg-score-line" fill="none" stroke="#000000" stroke-width="2" d="" />
                      <path id="svg-reaction-line" fill="none" stroke="#A6A6A1" stroke-width="1.5" stroke-dasharray="3 3" d="" />
                      
                      <!-- Dynamic Axis Labels and Nodes -->
                      <g id="svg-x-axis-labels"></g>
                      <g id="svg-interactive-nodes"></g>
                    </svg>
                  </div>
                </div>

                <!-- Smart summary card -->
                <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden group shadow-lg">
                  <div class="space-y-1.5 relative z-10 flex-1">
                    <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">الاستنتاج الذكي (Smart Insights) 💡</span>
                    <p id="insight-text-container" class="text-xs text-neutral-300 leading-relaxed font-medium pl-2">جاري دراسة البيانات...</p>
                  </div>
                  <button type="button" onclick="triggerRegenInsight()" class="py-2.5 px-4 bg-white/10 hover:bg-white/20 transition-all text-xs font-bold rounded-xl flex-shrink-0 z-10 select-none text-center">
                    تحديث
                  </button>
                  <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full filter blur-xl group-hover:scale-110 transition-transform duration-500"></div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- FOOTER copyright info -->
        <footer class="border-t border-neutral-200/50 py-6 px-10 text-center text-xs text-neutral-400 mt-auto bg-white/40 font-sans">
          <p>© 2026 أعمل ايه !؟ — معمول ببساطة ودقة عشان راحتك.</p>
        </footer>

      </main>

    </div>

    <!-- CONTEXTUAL FORM MODAL -->
    <div id="fab-modal"
      class="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center opacity-0 pointer-events-none transition-all duration-300">
      <div
        class="bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden border border-neutral-100 shadow-2xl transform scale-95 transition-all duration-300 flex flex-col max-h-[90vh]"
        id="fab-modal-card">
        <div class="px-6 py-5 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
          <h3 id="modal-title" class="text-sm font-bold text-neutral-900 uppercase tracking-wider">إضافة جديد</h3>
          <button onclick="closeFABModal()" class="p-1 rounded-full hover:bg-neutral-100 transition-colors">
            <i class="ti ti-x text-base text-neutral-500"></i>
          </button>
        </div>
        <form id="modal-form" onsubmit="handleModalSubmit(event)" class="flex flex-col flex-1 overflow-hidden">
          <div class="p-6 overflow-y-auto flex-1 space-y-4 min-h-0">
            <div id="modal-form-fields" class="space-y-4"></div>
          </div>
          <div class="px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center gap-3 flex-shrink-0">
            <button type="button" onclick="closeFABModal()"
              class="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-pill transition-colors">إلغاء</button>
            <button type="submit"
              class="flex-1 py-3 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-pill transition-colors">تأكيد وإضافة</button>
          </div>
        </form>
      </div>
    </div>

    <!-- EDIT ITEM MODAL -->
    <div id="edit-item-modal"
      class="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center opacity-0 pointer-events-none transition-all duration-300">
      <div
        class="bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden border border-neutral-100 shadow-2xl transform scale-95 transition-all duration-300 flex flex-col max-h-[90vh]"
        id="edit-item-modal-card">
        <div class="px-6 py-5 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
          <h3 id="edit-modal-title" class="text-sm font-bold text-neutral-900 uppercase tracking-wider">تعديل وتخصيص العنصر</h3>
          <button type="button" onclick="closeEditModal()" class="p-1 rounded-full hover:bg-neutral-100 transition-colors">
            <i class="ti ti-x text-base text-neutral-500"></i>
          </button>
        </div>
        <form id="edit-modal-form" onsubmit="handleEditModalSubmit(event)" class="flex flex-col flex-1 overflow-hidden">
          <input type="hidden" id="edit-item-id">
          <input type="hidden" id="edit-item-type">
          <div class="p-6 overflow-y-auto flex-1 space-y-4 min-h-0">
            <div id="edit-modal-form-fields" class="space-y-4"></div>
          </div>
          <div class="px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center gap-3 flex-shrink-0">
            <button type="button" onclick="handleEditModalDelete()"
              class="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-pill transition-colors flex items-center justify-center gap-1.5 select-none">
              <i class="ti ti-trash text-base"></i>
              <span>حذف العنصر</span>
            </button>
            <button type="submit"
              class="flex-1 py-3 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-pill transition-colors text-center select-none">حفظ التعديلات</button>
          </div>
        </form>
      </div>
    </div>

    <!-- RESET CONFIRMATION MODAL -->
    <div id="reset-confirm-modal"
      class="fixed inset-0 bg-neutral-900/40 backdrop-blur-[4px] z-50 flex items-center justify-center opacity-0 pointer-events-none transition-all duration-300">
      <div
        class="bg-white rounded-3xl w-full max-w-md mx-4 border border-neutral-100 shadow-2xl transform scale-95 transition-all duration-300 flex flex-col max-h-[90vh]"
        id="reset-confirm-card">
        
        <!-- Header (Fixed) -->
        <div class="px-6 py-5 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-neutral-100 rounded-xl flex items-center justify-center text-black">
              <i class="ti ti-settings text-base"></i>
            </div>
            <div class="text-right">
              <h3 class="text-sm font-bold text-neutral-900 font-sans">الإعدادات والمزامنة العامة</h3>
              <p class="text-[10px] text-neutral-400 font-sans">تحكم في مزامنة بياناتك وإعادة الضبط</p>
            </div>
          </div>
          <button onclick="closeResetModal()" class="p-1 rounded-full hover:bg-neutral-100 transition-colors">
            <i class="ti ti-x text-base text-neutral-500"></i>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6 min-h-0 text-right">
          <!-- Section 1: P2P Device Sync -->
          <div class="border border-neutral-200/80 bg-neutral-50/50 rounded-2xl p-4 space-y-4">
            <div class="flex items-center gap-2 border-b border-neutral-100 pb-2">
              <i class="ti ti-refresh text-neutral-700 text-sm"></i>
              <h4 class="text-xs font-bold text-neutral-900">المزامنة بين الموبايل والكمبيوتر</h4>
            </div>
            
            <p class="text-[10px] text-neutral-500 leading-relaxed font-sans">
              لمزامنة بياناتك مع جهاز آخر، تأكد من إدخال رمز الجهاز الثاني هنا أو شاركه رمزه ليقوم بربط جهازك.
            </p>

            <!-- Current device code display -->
            <div class="bg-white border border-neutral-200/60 rounded-xl p-3 flex items-center justify-between">
              <div class="text-right">
                <span class="text-[9px] text-neutral-400 block">رمز جهازك الحالي</span>
                <span class="text-xs font-mono font-bold text-black" id="sync-code-display">--</span>
              </div>
              <button onclick="navigator.clipboard.writeText(document.getElementById('sync-code-display').innerText).then(() => showToast('تم نسخ رمز المزامنة! 📋', 'success'))" 
                class="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-black flex items-center justify-center" 
                title="نسخ رمز المزامنة">
                <i class="ti ti-copy text-base"></i>
              </button>
            </div>

            <!-- Connection inputs -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-neutral-400 block">ربط جهاز آخر (ادخل رمز الجهاز الآخر)</label>
              <div class="flex gap-2">
                <input type="text" id="sync-code-input" placeholder="مثال: 11H-XYZ..."
                  class=" w-2/3 flex-1 px-3 py-2 text-xs font-mono font-bold border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans bg-white text-right uppercase">
                <button id="sync-toggle-btn" onclick="toggleSync()"
                  class="flex-shrink-0 whitespace-nowrap px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all select-none">
                  ربط ومزامنة
                </button>
              </div>
              <div class="flex items-center justify-between pt-1">
                <span class="text-[9px] text-neutral-400">الحالة:</span>
                <span id="sync-status-indicator" class="text-[10px] font-bold text-neutral-400 font-sans">غير متصل</span>
                <button id="sync-reconnect-btn" onclick="reconnectSync()" class="ml-2 px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-xs rounded" title="إعادة ربط">⟳</button>
              </div>
            </div>

            <!-- Real-Time Sync Console Logs -->
            <div class="mt-3 border-t border-neutral-100 pt-3">
              <div class="flex items-center justify-between mb-1.5">
                <button onclick="copySyncLogs()" class="text-[9px] font-bold text-black bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-md transition-colors select-none">نسخ السجل</button>
                <label class="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">شاشة المراقبة واللوج اللحظي 📺</label>
              </div>
              <div id="sync-console-logs" class="bg-neutral-950 text-green-400 font-mono text-[9px] p-3 rounded-xl h-24 overflow-y-auto space-y-1 text-left select-all shadow-inner leading-relaxed" style="direction: ltr;">
                <div class="text-neutral-500">> في انتظار تشغيل المزامنة...</div>
              </div>
            </div>
          </div>

          <!-- Section 2: Data Export / Import -->
          <div class="border border-neutral-200/80 bg-neutral-50/50 rounded-2xl p-4 space-y-4">
            <div class="flex items-center gap-2 border-b border-neutral-100 pb-2">
              <i class="ti ti-package text-neutral-700 text-sm"></i>
              <h4 class="text-xs font-bold text-neutral-900">تصدير واستيراد البيانات</h4>
            </div>

            <p class="text-[10px] text-neutral-500 leading-relaxed font-sans">
              صدّر كل بياناتك كملف JSON احتياطي، أو استورد بيانات سابقة.
            </p>

            <div class="space-y-2">
              <!-- Export Button -->
              <button onclick="exportAllData()"
                class="w-full p-3 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl transition-all text-xs font-bold flex items-center justify-between group">
                <span class="flex items-center gap-2.5">
                  <span class="w-8 h-8 bg-neutral-100 group-hover:bg-black group-hover:text-white rounded-lg flex items-center justify-center transition-all duration-200">
                    <i class="ti ti-download text-sm"></i>
                  </span>
                  <span class="text-right">
                    <span class="block text-neutral-900">تصدير جميع البيانات</span>
                    <span class="block text-[9px] font-normal text-neutral-400">تحميل نسخة احتياطية كاملة كملف JSON</span>
                  </span>
                </span>
                <i class="ti ti-chevron-left text-xs text-neutral-300 group-hover:text-black transition-colors"></i>
              </button>

              <!-- Import Button -->
              <button onclick="triggerImportFileDialog()"
                class="w-full p-3 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl transition-all text-xs font-bold flex items-center justify-between group">
                <span class="flex items-center gap-2.5">
                  <span class="w-8 h-8 bg-neutral-100 group-hover:bg-black group-hover:text-white rounded-lg flex items-center justify-center transition-all duration-200">
                    <i class="ti ti-upload text-sm"></i>
                  </span>
                  <span class="text-right">
                    <span class="block text-neutral-900">استيراد بيانات من ملف</span>
                    <span class="block text-[9px] font-normal text-neutral-400">استعادة بيانات من نسخة احتياطية JSON سابقة</span>
                  </span>
                </span>
                <i class="ti ti-chevron-left text-xs text-neutral-300 group-hover:text-black transition-colors"></i>
              </button>
            </div>
          </div>

          <!-- Section 2.5: PIN Protection -->
          <div class="border border-neutral-200/80 bg-neutral-50/50 rounded-2xl p-4 space-y-4">
            <div class="flex items-center gap-2 border-b border-neutral-100 pb-2">
              <i class="ti ti-lock text-neutral-700 text-sm"></i>
              <h4 class="text-xs font-bold text-neutral-900">قفل الحماية وكلمة المرور (PIN)</h4>
            </div>

            <p class="text-[10px] text-neutral-500 leading-relaxed font-sans">
              احمِ خصوصيتك بوضع رمز PIN مكون من 4 أرقام يطلب منك عند فتح التطبيق.
            </p>

            <div id="settings-pin-container" class="space-y-3">
              <!-- Rendered dynamically via renderSettingsPinSection() -->
            </div>
          </div>

          <!-- Section 2.6: PWA App Installation -->
          <div id="settings-pwa-section" class="border border-neutral-200/80 bg-neutral-50/50 rounded-2xl p-4 space-y-4">
            <div class="flex items-center gap-2 border-b border-neutral-100 pb-2">
              <i class="ti ti-device-mobile text-neutral-700 text-sm"></i>
              <h4 class="text-xs font-bold text-neutral-900">تثبيت التطبيق على جهازك</h4>
            </div>

            <p class="text-[10px] text-neutral-500 leading-relaxed font-sans">
              ثبّت \"اعمل ايه!؟\" على شاشتك الرئيسية للوصول السريع والعمل بدون إنترنت تماماً كالتطبيق الأصلي.
            </p>

            <button id="pwa-install-btn" onclick="triggerPwaInstall()"
              class="w-full p-3 bg-black hover:bg-neutral-800 text-white border border-neutral-200/80 rounded-xl transition-all text-xs font-bold flex items-center justify-between group">
              <span class="flex items-center gap-2.5">
                <span class="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center transition-all duration-200">
                  <i class="ti ti-download text-sm"></i>
                </span>
                <span class="text-right">
                  <span class="block text-white">تثبيت التطبيق الآن</span>
                  <span class="block text-[9px] font-normal text-neutral-400">تثبيت سريع ومريح على جهازك</span>
                </span>
              </span>
              <i class="ti ti-chevron-left text-xs text-neutral-400 group-hover:text-white transition-colors"></i>
            </button>

            <div id="pwa-ios-tip" class="hidden bg-white border border-neutral-200/60 rounded-xl p-3.5 text-right space-y-2">
              <span class="text-xs font-bold text-neutral-900 block">خطوات التثبيت على الآيفون (iOS) 📲</span>
              <p class="text-[10px] text-neutral-500 leading-relaxed font-sans">
                1. اضغط على زر المشاركة <span class="font-bold">"Share"</span> <i class="ti ti-share text-xs"></i> في شريط Safari السفلي.
                <br>
                2. اختر من القائمة <span class="font-bold">"إضافة إلى الشاشة الرئيسية"</span> (Add to Home Screen).
              </p>
            </div>

            <div id="pwa-status-msg" class="hidden"></div>
          </div>

          <!-- Section 3: Danger Zone / Reset options -->
          <div class="border border-neutral-200/80 rounded-2xl p-4 space-y-3">
            <button onclick="toggleSettingsDangerZone()" class="w-full flex items-center justify-between text-neutral-400 hover:text-black transition-colors select-none">
              <div class="flex items-center gap-2">
                <i class="ti ti-alert-triangle text-red-500 text-sm"></i>
                <h4 class="text-xs font-bold text-neutral-900">خيارات تصفير وحذف البيانات</h4>
              </div>
              <i id="settings-danger-chevron" class="ti ti-chevron-down text-xs transition-transform duration-200"></i>
            </button>
            
            <div id="settings-danger-content" class="hidden space-y-2 pt-2 border-t border-neutral-100/60 transition-all duration-300">
              <button onclick="confirmDeleteAllData()"
                class="w-full p-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all text-xs font-bold flex items-center justify-between border border-red-100">
                <span class="flex items-center gap-2">
                  <i class="ti ti-bomb text-base"></i>
                  <span>حذف كل البيانات والمشاريع نهائياً</span>
                </span>
                <i class="ti ti-chevron-left text-xs"></i>
              </button>
              <button onclick="confirmResetSystem()"
                class="w-full p-2.5 hover:bg-neutral-50 text-neutral-700 rounded-xl transition-all text-xs font-bold flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <i class="ti ti-trash text-base text-neutral-400"></i>
                  <span>تصفير النظام بالكامل (الوضع الافتراضي)</span>
                </span>
                <i class="ti ti-chevron-left text-xs"></i>
              </button>
              <button onclick="confirmResetAllFeelings()"
                class="w-full p-2.5 hover:bg-neutral-50 text-neutral-700 rounded-xl transition-all text-xs font-bold flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <i class="ti ti-mood-empty text-base text-neutral-400"></i>
                  <span>حذف جميع المشاعر بالكامل</span>
                </span>
                <i class="ti ti-chevron-left text-xs"></i>
              </button>
              <button onclick="confirmResetAllTherapeuticActions()"
                class="w-full p-2.5 hover:bg-neutral-50 text-neutral-700 rounded-xl transition-all text-xs font-bold flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <i class="ti ti-bolt-off text-base text-neutral-400"></i>
                  <span>حذف خطوات العلاج للمشاعر</span>
                </span>
                <i class="ti ti-chevron-left text-xs"></i>
              </button>
              <button onclick="confirmResetDailyLogs()"
                class="w-full p-2.5 hover:bg-neutral-50 text-neutral-700 rounded-xl transition-all text-xs font-bold flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <i class="ti ti-checkbox text-base text-neutral-400"></i>
                  <span>تصفير أفعال وعادات اليوم بالكامل</span>
                </span>
                <i class="ti ti-chevron-left text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions (Fixed) -->
        <div class="px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex-shrink-0 flex gap-2">
          <button type="button" onclick="closeResetModal()"
            class="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-pill transition-colors text-center">إغلاق الإعدادات</button>
        </div>
      </div>
    </div>

    <!-- RATING MICRO-MODAL (For Card Interventions) -->
    <div id="rating-modal"
      class="fixed inset-0 bg-neutral-900/30 backdrop-blur-[2px] z-50 flex items-center justify-center opacity-0 pointer-events-none transition-all duration-300">
      <div
        class="bg-white rounded-3xl w-full max-w-sm mx-4 p-6 border border-neutral-100 shadow-2xl transform scale-95 transition-all duration-300 text-center space-y-5"
        id="rating-modal-card">
        <div class="space-y-1">
          <div class="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-neutral-900 uppercase tracking-wider font-sans">الخطوة دي جابت نتيجة؟</h3>
          <p class="text-[11px] text-neutral-400 font-sans">الحاجة دي ريحتك بنسبة قد إيه؟</p>
        </div>

        <!-- Stars (1-5) -->
        <div class="flex items-center justify-center space-x-1.5 py-1">
          ${[1, 2, 3, 4, 5].map(i => `
            <button type="button" onclick="setRating(${i})" onmouseover="hoverRating(${i})" onmouseout="resetRatingHover()"
              class="p-1 text-neutral-200 hover:text-black focus:outline-none transition-colors" data-star="${i}">
              <svg class="w-7 h-7 star-icon fill-current transition-colors" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          `).join('')}
        </div>

        <!-- Segmented Picker: Expected Improvement Time -->
        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-center font-sans">الراحة حست بيها بعد قد إيه؟ (وقت التحسن)</label>
          <div class="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-2xl" id="improvement-time-picker">
            <button type="button" onclick="setImprovementTime('15m', this)"
              class="py-2 text-[10px] font-bold rounded-xl bg-white text-black shadow-sm border border-neutral-200/50 transition-all text-center time-btn select-none">ربع ساعة</button>
            <button type="button" onclick="setImprovementTime('1h', this)"
              class="py-2 text-[10px] font-bold rounded-xl text-neutral-500 hover:text-black transition-all text-center time-btn select-none">ساعة</button>
            <button type="button" onclick="setImprovementTime('4h', this)"
              class="py-2 text-[10px] font-bold rounded-xl text-neutral-500 hover:text-black transition-all text-center time-btn select-none">4 ساعات</button>
            <button type="button" onclick="setImprovementTime('1d', this)"
              class="py-2 text-[10px] font-bold rounded-xl text-neutral-500 hover:text-black transition-all text-center time-btn select-none">تاني يوم</button>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="button" onclick="closeRatingModal()"
            class="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-pill transition-colors">إلغاء</button>
          <button type="button" onclick="submitRating()"
            class="flex-1 py-3 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-pill transition-colors">سجل التقييم</button>
        </div>
      </div>
    </div>

    <!-- TREATMENT HISTORY MODAL -->
    <div id="treatment-history-modal"
      class="fixed inset-0 bg-neutral-900/40 backdrop-blur-[3px] z-50 flex items-center justify-center opacity-0 pointer-events-none transition-all duration-300">
      <div
        class="bg-white rounded-3xl w-full max-w-xl mx-4 p-6 border border-neutral-100 shadow-2xl transform scale-95 transition-all duration-300 text-right space-y-5 max-h-[85vh] flex flex-col"
        id="treatment-history-card">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-neutral-100 pb-3 flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center text-black">
              <i class="ti ti-history text-lg"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-neutral-900 font-sans">سجل العلاج والخطوات المكتملة</h3>
              <p class="text-[10px] text-neutral-400 font-sans">تاريخ وجدول الخطوات التي قمت بتطبيقها وتقييمها</p>
            </div>
          </div>
          <button onclick="closeTreatmentHistoryModal()" class="p-1 rounded-full hover:bg-neutral-100 transition-colors">
            <i class="ti ti-x text-base text-neutral-500"></i>
          </button>
        </div>

        <!-- History Content (Scrollable) -->
        <div id="treatment-history-content" class="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[250px] max-h-[50vh]">
          <!-- Dynamic Content goes here -->
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-3 pt-3 border-t border-neutral-100 flex-shrink-0">
          <button type="button" onclick="closeTreatmentHistoryModal()"
            class="w-full py-3 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-pill transition-colors text-center font-sans">إغلاق السجل</button>
        </div>
      </div>
    </div>
  `;
}

// Bind to window for HTML events / inline JS compatibility
window.injectAppLayout = injectAppLayout;
