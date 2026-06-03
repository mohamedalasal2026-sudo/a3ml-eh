/**
 * Global Application State Store & Persistence Layer
 */

import { pushSyncUpdate } from '../services/sync.js';

export function getDefaultSymptoms() {
  return [
    {
      id: 'anxiety-stress',
      titleEn: 'Anxiety & Stress',
      titleAr: 'قلق وتوتر شديد',
      category: 'الصحة',
      icon: `<svg class="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 1 9 9c0 2.3-1 4.5-2.7 6M3 12a9 9 0 0 1 9-9" stroke-dasharray="3 3"/><path d="m8 15 2-3 2 3 2-3"/><path d="M12 9v1"/></svg>`,
      actions: {
        near: [
          { id: 'anx-n1', title: 'اعمل تمرين تنفس بطيء (4-7-8) لمدة 5 دقائق', weight: 10 },
          { id: 'anx-n2', title: 'اغسل وشك بميه ساقعة تفوقك وتهديك', weight: 8 },
          { id: 'anx-n3', title: 'سيب اللي في إيدك واخرج اتمشى 5 دقائق', weight: 7 }
        ],
        mid: [
          { id: 'anx-m1', title: 'قلل شرب قهوة وشاي خالص على مدار اليوم', weight: 9 },
          { id: 'anx-m2', title: 'اكتب كل الأفكار اللي مخوفاك في ورقة وارميها', weight: 8 }
        ],
        long: [
          { id: 'anx-l1', title: 'اعمل تمرين تأمل أو يوجا ربع ساعة يومياً', weight: 10 },
          { id: 'anx-l2', title: 'حافظ على مواعيد نوم منتظمة وصحية', weight: 8 }
        ]
      }
    },
    {
      id: 'feeling-failure',
      titleEn: 'Feeling of Failure',
      titleAr: 'إحساس بالفشل والتقصير',
      category: 'الشغل',
      icon: `<svg class="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 6l-1 4 2 2-2 4h1"/></svg>`,
      actions: {
        near: [
          { id: 'fail-n1', title: 'اكتب 3 حاجات عملتها النهاردة حتى لو صغيرة جداً', weight: 10 },
          { id: 'fail-n2', title: 'كلم حد بتحبه وبيشجعك دايماً واسمع رأيه فيك', weight: 8 },
          { id: 'fail-n3', title: 'فكر نفسك إن قيمتك مش في إنتاجيتك بس', weight: 7 }
        ],
        mid: [
          { id: 'fail-m1', title: 'بلاش مقارنة نفسك بغيرك على السوشيال ميديا خالص', weight: 9 },
          { id: 'fail-m2', title: 'قسم أهدافك لحاجات متناهية الصغر تقدر تنجزها', weight: 7 }
        ],
        long: [
          { id: 'fail-l1', title: 'اكتب مذكرات يومية للحاجات الجميلة اللي بتحصلك', weight: 9 },
          { id: 'fail-l2', title: 'اتعلم تتقبل فترات التعب من غير جلد ذات', weight: 8 }
        ]
      }
    },
    {
      id: 'depression-sadness',
      titleEn: 'Depression & Sadness',
      titleAr: 'إحباط وضيق واكتئاب',
      category: 'الصحة',
      icon: `<svg class="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19A5.5 5.5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25"/><path d="M8 20v2M12 20v2M16 20v2"/></svg>`,
      actions: {
        near: [
          { id: 'sad-n1', title: 'شغل حاجة بتحب تسمعها أو اتفرج على فيديو كوميدي', weight: 10 },
          { id: 'sad-n2', title: 'اشرب كوباية شاي أو كاكاو دافي بهدوء', weight: 8 },
          { id: 'sad-n3', title: 'خد دوش دافي يريح عضلاتك وأعصابك', weight: 7 }
        ],
        mid: [
          { id: 'sad-m1', title: 'حاول تنزل تقابل صديق مقرب أو تتمشى بره البيت', weight: 9 },
          { id: 'sad-m2', title: 'اقرأ كتاب خفيف أو رواية مسلية تفصلك عن تفكيرك', weight: 7 }
        ],
        long: [
          { id: 'sad-l1', title: 'حافظ على المشي في الشمس 20 دقيقة كل يوم', weight: 10 },
          { id: 'sad-l2', title: 'اتعلم عادة جديدة بتحبها زي الرسم أو القراءة', weight: 8 }
        ]
      }
    },
    {
      id: 'passion-enthusiasm',
      titleEn: 'Passion & Enthusiasm',
      titleAr: 'شغف وحماس زايد',
      category: 'الشغل',
      icon: `<svg class="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-2 10h9L9 22l2-10H3L13 2z"/></svg>`,
      actions: {
        near: [
          { id: 'pas-n1', title: 'استغل الطاقة دي واكتب خطة مهامك النهاردة', weight: 10 },
          { id: 'pas-n2', title: 'ابدأ في أصعب مهمة كنت مأجلها بقالك كتير', weight: 9 }
        ],
        mid: [
          { id: 'pas-m1', title: 'ركز في حاجة واحدة وخلصها وماتشتتش نفسك', weight: 10 },
          { id: 'pas-m2', title: 'شارك حماسك مع حد من أصحابك وشجعوا بعض', weight: 8 }
        ],
        long: [
          { id: 'pas-l1', title: 'وجه الشغف ده لمشروع أو هواية جديدة تطورها', weight: 9 },
          { id: 'pas-l2', title: 'اعمل توازن عشان ماتفصلش وتجيلك حالة خمول بعد كدة', weight: 8 }
        ]
      }
    },
    {
      id: 'joy-happiness',
      titleEn: 'Joy & Happiness',
      titleAr: 'روقان وفرحة وسعادة',
      category: 'الترفيه',
      icon: `<svg class="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
      actions: {
        near: [
          { id: 'joy-n1', title: 'شارك فرحتك بكلمة حلوة أو رسالة لطيفة لحد بتحبه', weight: 10 },
          { id: 'joy-n2', title: 'شغل أغنيتك المفضلة وسجل اللحظة دي في ذاكرتك', weight: 9 }
        ],
        mid: [
          { id: 'joy-m1', title: 'اعمل حاجة حلوة لنفسك أو كافئها بأكلة بتحبها', weight: 9 },
          { id: 'joy-m2', title: 'استغل طاقتك الإيجابية في مساعدة حد محتاجها', weight: 8 }
        ],
        long: [
          { id: 'joy-l1', title: 'روق بالك وعيش الامتنان والرضا في كل خطوة باليوم', weight: 10 },
          { id: 'joy-l2', title: 'اشكر ربنا واكتب مذكرات للامتنان اليومي', weight: 8 }
        ]
      }
    },
    {
      id: 'boredom-apathy',
      titleEn: 'Boredom & Apathy',
      titleAr: 'ملل وزهق وتشتت',
      category: 'الترفيه',
      icon: `<svg class="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01M15 9h.01"/></svg>`,
      actions: {
        near: [
          { id: 'bor-n1', title: 'اكسر الروتين وغير مكان قعدتك حالاً', weight: 10 },
          { id: 'bor-n2', title: 'قوم اعمل حركة أو رياضة خفيفة تنشط بيها الدورة الدموية', weight: 8 }
        ],
        mid: [
          { id: 'bor-m1', title: 'جرب تلعب لعبة ذكاء أو تحل سودوكو تنشط دماغك', weight: 9 },
          { id: 'bor-m2', title: 'اتعلم حاجة جديدة تماماً لمدة 10 دقائق', weight: 8 }
        ],
        long: [
          { id: 'bor-l1', title: 'حط لنفسك تحديات أسبوعية جديدة تكسر بيها الملل', weight: 9 },
          { id: 'bor-l2', title: 'نظم وقت استخدامك للسوشيال ميديا والشاشات', weight: 8 }
        ]
      }
    },
    {
      id: 'anger-frustration',
      titleEn: 'Anger & Frustration',
      titleAr: 'عصبية ونرفزة سريعة',
      category: 'الصحة',
      icon: `<svg class="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3 5 5 1-3.5 3.5 1 5.5-5.5-3-5.5 3 1-5.5L3.5 11.5l5-1 3-5.5z"/></svg>`,
      actions: {
        near: [
          { id: 'ang-n1', title: 'اسكت خالص وخد نفس عميق 10 مرات قبل ما ترد', weight: 10 },
          { id: 'ang-n2', title: 'اخرج من المكان اللي اتعصبت فيه لبلكونة أو هوا طلق', weight: 9 },
          { id: 'ang-n3', title: 'اضغط على كرة التوتر (Stress Ball) أو اغسل وشك بميه', weight: 8 }
        ],
        mid: [
          { id: 'ang-m1', title: 'مارس رياضة عنيفة شوية زي الجري عشان تطلع الشحنة', weight: 9 },
          { id: 'ang-m2', title: 'اكتب اللي معصبك في ورقة وقطعها تماماً', weight: 8 }
        ],
        long: [
          { id: 'ang-l1', title: 'اتدرب على مهارات التحكم في الغضب والهدوء النفسي', weight: 10 },
          { id: 'ang-l2', title: 'قلل الكافيين والمنبهات اللي بتزود التوتر العصبي', weight: 8 }
        ]
      }
    },
    {
      id: 'calm-peace',
      titleEn: 'Calm & Peace',
      titleAr: 'هدوء وراحة بال ونقاء',
      category: 'الروحانيات',
      icon: `<svg class="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
      actions: {
        near: [
          { id: 'clm-n1', title: 'اقعد في صمت تام لمدة 10 دقائق واستمتع باللحظة', weight: 10 },
          { id: 'clm-n2', title: 'اشرب مشروب دافي تحبه زي البابونج أو الينسون', weight: 9 }
        ],
        mid: [
          { id: 'clm-m1', title: 'رتب مكتبك أو مكان قعدتك عشان تحافظ على هدوء بصرك', weight: 9 },
          { id: 'clm-m2', title: 'اقرأ صفحات من كتاب روحي أو تأملي يريح فكرك', weight: 8 }
        ],
        long: [
          { id: 'clm-l1', title: 'عود نفسك على جلسات الاسترخاء اليومية قبل النوم', weight: 10 },
          { id: 'clm-l2', title: 'ابعد عن الناس السلبية اللي بتعكر سلامك الداخلي', weight: 9 }
        ]
      }
    }
  ];
}

export function getInitialDefaultState() {
  return {
    username: '',
    syncCode: '11H-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    syncEnabled: false,
    lastUpdated: 0,
    lastInteractedContext: 'home',
    symptoms: getDefaultSymptoms(),
    routines: [],
    tasks: [],
    pinEnabled: false,
    pinCode: '',

    categories: ['الشغل', 'الصحة', 'العلاقات', 'الروحانيات', 'الترفيه'],
    activeCategoryFilter: 'all',

    // Daily tracker variables
    dailyStatus: {
      sleepHours: 7.5,
      overallMood: 3,
      dayDescription: '',
      checklist: {
        hydration: 'unset', // 'yes' | 'no' | 'unset'
        meals: 'unset',
        meds: 'unset'
      },
      checklistReasons: {}, // e.g. { hydration: "كنت برة البيت" }
      customMetrics: [
        { id: 'custom-reading', label: 'قراءة وتغذية فكرية (30 دقيقة)', type: 'binary', value: 'unset', reason: '', category: 'الروحانيات' },
        { id: 'custom-screentime', label: 'ساعات استخدام السوشيال ميديا', type: 'numeric', value: 3, min: 0, max: 12, step: 0.5, category: 'الترفيه' }
      ],
      tasks: [
        { id: 'task-1', label: 'شغل وتركيز وإنتاجية بضمير', status: 'unset', reason: '', completed: false, category: 'الشغل' },
        { id: 'task-2', label: 'حركة ورياضة وفك جسم', status: 'unset', reason: '', completed: false, category: 'الصحة' },
        { id: 'task-3', label: 'روقت الأوضة ومكان قعدتي', status: 'unset', reason: '', completed: false, category: 'عام' }
      ],
      tags: []
    },

    availableTags: ['قلق وتوتر', 'فشل وتقصير', 'إحباط وضيق', 'رضا وراحة بال', 'نشاط وطاقة', 'ملل وزهق', 'شغف وحماس'],

    // Navigation & Page State
    activePageView: 'dashboard', // 'dashboard' | 'recovery'
    improvementsLog: [],
    lastCompletedActionId: null,
    lastCompletedFeelingId: null,
    autoLinkActive: true,

    // Interaction State
    activeSymptomId: null, // null = home dashboard view
    activeTab: 'near', // 'near' | 'mid' | 'long'

    // Temporary Skip Tray (Session based - resets on reload)
    sessionSkippedActions: [],

    // Stars/Ratings logs for completion
    completedActionRating: {
      activeCardId: null,
      selectedRating: 0,
      selectedImprovementTime: '15m'
    },

    // Historical data (7 Days)
    historicalData: {
      days: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
      scores: [3.8, 4.2, 3.5, 4.6, 3.2, 4.0, 3.7], // Performance/Feeling score (1.0 - 5.0)
      reactions: [7.5, 6.0, 8.0, 4.5, 9.5, 5.0, 7.0] // Recovery latency in hours
    },

    // Correlation stats arrays
    ratingsHistory: [
      { actionId: 'anx-n1', rating: 5, timeVal: '15m' },
      { actionId: 'fail-n1', rating: 4, timeVal: '1h' },
      { actionId: 'sad-n1', rating: 4, timeVal: '1h' },
      { actionId: 'pas-n1', rating: 5, timeVal: '15m' }
    ],
    dailyHistory: [
      { day: 'الإثنين', sleepHours: 6, checklist: { hydration: 'yes', meals: 'no', meds: 'yes' }, tasks: { 'task-1': 'yes', 'task-2': 'no', 'task-3': 'yes' }, customMetrics: { 'custom-reading': 'yes' }, score: 3.8, overallMood: 3, dayDescription: 'يوم مرهق وتعبت في الشغل ومفيش نوم كافي وبذلت مجهود زيادة في الشغل برضه', reaction: 7.5 },
      { day: 'الثلاثاء', sleepHours: 8, checklist: { hydration: 'yes', meals: 'yes', meds: 'yes' }, tasks: { 'task-1': 'yes', 'task-2': 'yes', 'task-3': 'yes' }, customMetrics: { 'custom-reading': 'yes' }, score: 4.2, overallMood: 4, dayDescription: 'يوم جميل جداً ورياضي وروقت مكاني والإنتاجية كانت ممتازة والحمد لله', reaction: 6.0 },
      { day: 'الأربعاء', sleepHours: 5, checklist: { hydration: 'no', meals: 'no', meds: 'no' }, tasks: { 'task-1': 'no', 'task-2': 'no', 'task-3': 'no' }, customMetrics: { 'custom-reading': 'no' }, score: 3.5, overallMood: 2, dayDescription: 'تعب ومجهود وتوتر شديد ومفيش رياضة ولا ترتيب خالص كسل تام وتعب الشغل زاد', reaction: 8.0 },
      { day: 'الخميس', sleepHours: 8.5, checklist: { hydration: 'yes', meals: 'yes', meds: 'yes' }, tasks: { 'task-1': 'yes', 'task-2': 'yes', 'task-3': 'yes' }, customMetrics: { 'custom-reading': 'yes' }, score: 4.6, overallMood: 5, dayDescription: 'يوم روعة روقان ممتاز وصحة ونوم عميق وسعادة تامة وإنجاز كبير وراحة بال', reaction: 4.5 },
      { day: 'الجمعة', sleepHours: 7, checklist: { hydration: 'yes', meals: 'no', meds: 'yes' }, tasks: { 'task-1': 'yes', 'task-2': 'no', 'task-3': 'no' }, customMetrics: { 'custom-reading': 'yes' }, score: 3.2, overallMood: 3, dayDescription: 'يوم هادئ روقان متوسط بس مفيش رياضة أو حركة وتفكير شوية في مشاكل بسيطة', reaction: 9.5 },
      { day: 'السبت', sleepHours: 8, checklist: { hydration: 'yes', meals: 'yes', meds: 'yes' }, tasks: { 'task-1': 'yes', 'task-2': 'yes', 'task-3': 'yes' }, customMetrics: { 'custom-reading': 'yes' }, score: 4.0, overallMood: 4, dayDescription: 'شغل وترتيب صحة ورشاقة وراحة بال ومود رايق وجميل مع الأهل والراحة روعة', reaction: 5.0 },
      { day: 'الأحد', sleepHours: 7.5, checklist: { hydration: 'unset', meals: 'unset', meds: 'unset' }, tasks: {}, customMetrics: {}, score: 3.7, overallMood: 3, dayDescription: '', reaction: 7.0 }
    ]
  };
}

// Global active state reference
export const state = getInitialDefaultState();

export function migrateState(oldState) {
  const defaultState = getInitialDefaultState();
  const merged = { ...defaultState, ...oldState };

  if (!merged.routines) merged.routines = [];
  if (!merged.tasks) merged.tasks = [];
  if (merged.pinEnabled === undefined) merged.pinEnabled = false;
  if (merged.pinCode === undefined) merged.pinCode = '';

  if (merged.activePageView === undefined) merged.activePageView = 'dashboard';
  if (!merged.improvementsLog) merged.improvementsLog = [];
  if (merged.lastCompletedActionId === undefined) merged.lastCompletedActionId = null;
  if (merged.lastCompletedFeelingId === undefined) merged.lastCompletedFeelingId = null;
  if (merged.autoLinkActive === undefined) merged.autoLinkActive = true;

  // Restore categories if empty
  if (!merged.categories || merged.categories.length === 0) {
    merged.categories = defaultState.categories;
  }

  // Migrate checklist boolean to three-state
  if (merged.dailyStatus && merged.dailyStatus.checklist) {
    const check = merged.dailyStatus.checklist;
    if (check.hydration === true) check.hydration = 'yes';
    else if (check.hydration === false) check.hydration = 'unset';

    if (check.meals === true) check.meals = 'yes';
    else if (check.meals === false) check.meals = 'unset';

    if (check.meds === true) check.meds = 'yes';
    else if (check.meds === false) check.meds = 'unset';
  } else {
    merged.dailyStatus.checklist = defaultState.dailyStatus.checklist;
  }

  if (!merged.dailyStatus.checklistReasons) {
    merged.dailyStatus.checklistReasons = {};
  }

  // Migrate Tasks array
  if (merged.dailyStatus && merged.dailyStatus.tasks) {
    merged.dailyStatus.tasks.forEach(t => {
      if (t.status === undefined) {
        t.status = t.completed ? 'yes' : 'unset';
      }
      if (t.reason === undefined) {
        t.reason = '';
      }
      if (t.category === undefined) {
        t.category = 'عام';
      }
    });
  } else {
    merged.dailyStatus.tasks = defaultState.dailyStatus.tasks;
  }

  // Migrate Custom Metrics
  if (merged.dailyStatus && merged.dailyStatus.customMetrics) {
    merged.dailyStatus.customMetrics.forEach(m => {
      if (m.type === 'binary' && (m.value === true || m.value === false)) {
        m.value = m.value ? 'yes' : 'unset';
      }
      if (m.reason === undefined) {
        m.reason = '';
      }
      if (m.category === undefined) {
        m.category = 'عام';
      }
    });
  } else {
    merged.dailyStatus.customMetrics = defaultState.dailyStatus.customMetrics;
  }

  // Symptoms and Categories fallbacks
  if (merged.symptoms) {
    merged.symptoms.forEach(s => {
      if (s.category === undefined) {
        s.category = 'عام';
      }
    });
  } else {
    merged.symptoms = defaultState.symptoms;
  }

  if (merged.dailyStatus.overallMood === undefined) {
    merged.dailyStatus.overallMood = 3;
  }

  if (merged.dailyStatus.dayDescription === undefined) {
    merged.dailyStatus.dayDescription = '';
  }

  if (!merged.dailyStatus.feelingsLog) {
    merged.dailyStatus.feelingsLog = [];
  }

  return merged;
}

export function initializeState() {
  try {
    const localData = localStorage.getItem('eleven_health_state_v3');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        const migrated = migrateState(parsed);
        Object.assign(state, migrated);
        state.sessionSkippedActions = []; // Always restore skipped steps on page refresh
        return state;
      } catch (e) {
        console.error("LOG: [initializeState] Error parsing localStorage data, using defaults.", e);
      }
    }
  } catch (err) {
    console.warn("LOG: [initializeState] localStorage access blocked or failed:", err);
  }

  // Fallback to default name if only username is saved
  try {
    const savedName = localStorage.getItem('username');
    if (savedName) {
      state.username = savedName;
    }
  } catch (e) {}

  return state;
}

export function saveState(showPopup = true) {
  try {
    localStorage.setItem('eleven_health_state_v3', JSON.stringify(state));
    if (state.username) {
      localStorage.setItem('username', state.username);
    }
    
    // Sync remotely if peer connections are active
    if (state.syncEnabled) {
      pushSyncUpdate();
    }

    if (window.updateHeaderNotificationBadge) {
      window.updateHeaderNotificationBadge();
    }

    if (showPopup && window.triggerToastNotification) {
      window.triggerToastNotification("تم حفظ التعديلات تلقائياً! 💾");
    }
  } catch (err) {
    console.error("LOG: [saveState] Failed writing state to localStorage:", err);
  }
}

// Make globally accessible
window.initializeState = initializeState;
window.saveToLocalStorage = () => saveState(true);
window.state = state;
