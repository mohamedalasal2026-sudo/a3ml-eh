/**
 * Premium Emotional Icons Picker Component
 */

// Global sharing of selected icon using window property for maximum reliability across modules
window.selectedFormIcon = 'thumbs-down';

export function getSelectedFormIcon() {
  return window.selectedFormIcon;
}

export function setSelectedFormIcon(val) {
  window.selectedFormIcon = val;
}

let currentPickerCategory = 'الكل';
let currentPickerSearch = '';

// Exclusively emotional icons list for Visual Icon Picker - removes physical items
export const availableIcons = [
  // 1. مشاعر سلبية وضغوطات
  { name: 'mood-sad', label: 'حزن وضيق الكتمان', category: 'مشاعر سلبية' },
  { name: 'mood-neutral', label: 'ملل وزهق ورتابة', category: 'مشاعر سلبية' },
  { name: 'mood-angry', label: 'عصبية ونرفزة سريعة', category: 'مشاعر سلبية' },
  { name: 'mood-nervous', label: 'توتر فائق وقلق حاد', category: 'مشاعر سلبية' },
  { name: 'mood-empty', label: 'فقدان شغف وانطفاء', category: 'مشاعر سلبية' },
  { name: 'mood-sick', label: 'ضيق وإرهاق شديد', category: 'مشاعر سلبية' },
  { name: 'heart-broken', label: 'كسرة قلب خذلان', category: 'مشاعر سلبية' },
  { name: 'cloud-rain', label: 'اكتئاب وانعزال عميق', category: 'مشاعر سلبية' },
  { name: 'cloud-lightning', label: 'غضب متفجر وثورة', category: 'مشاعر سلبية' },
  { name: 'cloud-off', label: 'تشتت ذهني وضبابية', category: 'مشاعر سلبية' },
  { name: 'skull', label: 'أفكار مظلمة يأس', category: 'مشاعر سلبية' },
  { name: 'ghost', label: 'خوف وذعر داخلي', category: 'مشاعر سلبية' },
  { name: 'lock', label: 'انغلاق نفسي وتكتم', category: 'مشاعر سلبية' },
  { name: 'battery-1', label: 'استنزاف طاقة حاد', category: 'مشاعر سلبية' },
  { name: 'droplet', label: 'بكاء ودموع وانهيار', category: 'مشاعر سلبية' },
  { name: 'tempest', label: 'دوامة نفسية مفرطة', category: 'مشاعر سلبية' },
  { name: 'shield-alert', label: 'تحسس دفاعي وخوف', category: 'مشاعر سلبية' },
  { name: 'eye-off', label: 'تجنب اجتماعي وهروب', category: 'مشاعر سلبية' },

  // 2. مشاكل نفسية وعقلية
  { name: 'brain', label: 'تفكير مفرط وسواوس', category: 'مشاكل نفسية' },
  { name: 'brain-cog', label: 'ضغط ذهني وصداع عقلي', category: 'مشاكل نفسية' },
  { name: 'activity', label: 'خفقان وتسارع ضربات قلب', category: 'مشاكل نفسية' },
  { name: 'alarm-clock-off', label: 'أرق وفزع في النوم', category: 'مشاكل نفسية' },
  { name: 'mood-confuzed', label: 'حيرة وتشتت تساؤلات', category: 'مشاكل نفسية' },
  { name: 'infinity', label: 'حلقة مفرغة من الأفكار', category: 'مشاكل نفسية' },
  { name: 'git-branch', label: 'تفرع ذهني تشتتي', category: 'مشاكل نفسية' },
  { name: 'focus-2', label: 'صعوبة بالغة في التركيز', category: 'مشاكل نفسية' },
  { name: 'rotate', label: 'دوار ودوخة شديدة', category: 'مشاكل نفسية' },
  { name: 'hourglass', label: 'انتظار وترقب قاتل', category: 'مشاكل نفسية' },

  // 3. ألم وإرهاق جسدي
  { name: 'headache', label: 'صداع نصفي وعصبي', category: 'ألم وإعياء' },
  { name: 'stethoscope', label: 'إعياء صحي وتعب عام', category: 'ألم وإعياء' },
  { name: 'pill', label: 'علاج ومسكنات مستمرة', category: 'ألم وإعياء' },
  { name: 'thermometer', label: 'سخونة وحمى شديدة', category: 'ألم وإعياء' },
  { name: 'bandage', label: 'جرح جسدي وآلام', category: 'ألم وإعياء' },
  { name: 'lungs', label: 'ضيق تنفس وكتمة هواء', category: 'ألم وإعياء' },
  { name: 'virus', label: 'إعياء فيروسي ومرض', category: 'ألم وإعياء' },
  { name: 'zzz', label: 'خمول شديد ورغبة نوم', category: 'ألم وإعياء' },
  { name: 'bed', label: 'إرهاق ملازم للفراش', category: 'ألم وإعياء' },
  { name: 'droplet-half-2', label: 'عطش وجفاف وإرهاق', category: 'ألم وإعياء' },

  // 4. مشاعر إيجابية وروقان
  { name: 'mood-smile', label: 'روقان وفرحة غامرة', category: 'مشاعر إيجابية' },
  { name: 'sparkles', label: 'شغف ونقاء وراحة بال', category: 'مشاعر إيجابية' },
  { name: 'peace', label: 'سلام داخلي وهدوء', category: 'مشاعر إيجابية' },
  { name: 'bolt', label: 'حماس ونشاط متفجر', category: 'مشاعر إيجابية' },
  { name: 'shield-check', label: 'أمان وطمأنينة نفسية', category: 'مشاعر إيجابية' },
  { name: 'sun', label: 'تفاؤل وأمل متجدد', category: 'مشاعر إيجابية' },
  { name: 'crown', label: 'تقدير وقوة وتغلب ذاتي', category: 'مشاعر إيجابية' },
  { name: 'trophy', label: 'فوز وإنجاز وانتصار', category: 'مشاعر إيجابية' },
  { name: 'gift', label: 'امتنان ولطف وسعادة', category: 'مشاعر إيجابية' },
  { name: 'plant', label: 'نمو وتفتح نفسي وتجدد', category: 'مشاعر إيجابية' },

  // 5. علاقات واجتماعيات
  { name: 'users', label: 'علاقات صحبة ودعم عائلي', category: 'علاقات' },
  { name: 'user-off', label: 'وحدة وانعزال عن الآخرين', category: 'علاقات' },
  { name: 'heart-handshake', label: 'دعم ومساندة وتفاهم', category: 'علاقات' },
  { name: 'message', label: 'فضفضة وحديث مريح', category: 'علاقات' },
  { name: 'phone-calling', label: 'مكالمة دعم واطمئنان', category: 'علاقات' },
  { name: 'phone-off', label: 'انعزال تام وصمت تواصل', category: 'علاقات' }
];

export function renderVisualIconPicker(containerId, activeCategory = 'الكل', searchQuery = '') {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  let filtered = availableIcons;
  if (activeCategory !== 'الكل') {
    filtered = filtered.filter(ic => ic.category === activeCategory);
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(ic =>
      ic.label.toLowerCase().includes(query) ||
      ic.name.toLowerCase().includes(query) ||
      (ic.category && ic.category.toLowerCase().includes(query))
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="col-span-4 text-[10px] text-neutral-400 text-center py-4 font-sans">مفيش أيقونات مطابقة للبحث.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(ic => {
    const isSelected = ic.name === window.selectedFormIcon;
    const selectBorderClass = isSelected ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-black';
    return `
      <button type="button" onclick="selectIconInForm('${ic.name}', this)" class="p-2 border rounded-xl flex flex-col items-center justify-center gap-1 bg-white select-icon-btn transition-all duration-200 ${selectBorderClass}" title="${ic.label}">
        <i class="ti ti-${ic.name} text-neutral-800 text-base"></i>
        <span class="text-[9px] text-neutral-400 font-sans truncate w-full text-center">${ic.label}</span>
      </button>
    `;
  }).join('');
}

export function filterIconCategory(category, containerId, btn) {
  currentPickerCategory = category;

  const container = btn.parentElement;
  const buttons = container.querySelectorAll('.icon-cat-btn');
  buttons.forEach(b => {
    b.className = "px-2 py-1 bg-neutral-100 text-neutral-500 hover:text-black rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none";
  });
  btn.className = "px-2 py-1 bg-black text-white rounded-lg flex-shrink-0 icon-cat-btn transition-colors select-none";

  renderVisualIconPicker(containerId, currentPickerCategory, currentPickerSearch);
}

export function filterIconPicker(searchVal, containerId) {
  currentPickerSearch = searchVal;
  renderVisualIconPicker(containerId, currentPickerCategory, currentPickerSearch);
}

export function selectIconInForm(iconName, btn) {
  window.selectedFormIcon = iconName;
  document.querySelectorAll('.select-icon-btn').forEach(b => {
    b.classList.remove('border-black', 'bg-neutral-50', 'ring-1', 'ring-black');
    b.classList.add('border-neutral-200');
  });
  if (btn) {
    btn.classList.remove('border-neutral-200');
    btn.classList.add('border-black', 'bg-neutral-50', 'ring-1', 'ring-black');
  }
}

// Bind to window for HTML events / inline JS compatibility
window.selectIconInForm = selectIconInForm;
window.filterIconCategory = filterIconCategory;
window.filterIconPicker = filterIconPicker;
window.renderVisualIconPicker = renderVisualIconPicker;
