/**
 * Smart Inference & Statistical Correlation Analytics Service
 */

import { state } from '../state/store.js';

export function syncTodayHistory() {
  // Retained for backwards compatibility if needed elsewhere
}

export function generateAnalyticsInsight() {
  const container = document.getElementById('insight-text-container');
  if (!container) return;

  const logs = state.improvementsLog || [];
  if (logs.length === 0) {
    container.innerText = "يا فنان، ابدأ برصد وتوثيق تحسن حالتك بعد تنفيذ الأنشطة العلاجية من صفحة سجل التحسن والتعافي، وهنقدملك هنا تحليلات واستنتاجات ذكية مخصصة عن تعافيك!";
    return;
  }

  const sum = logs.reduce((acc, log) => acc + log.rating, 0);
  const avg = parseFloat((sum / logs.length).toFixed(1));

  let insight = "";
  if (avg >= 7.5) {
    insight = `عاش جداً يا بطل! متوسط مؤشر التعافي والتحسن العام عندك ممتاز (${avg} من 10). الأنشطة العلاجية اللي بتعملها بتديك راحة ونقاء نفسي حقيقي ومفعولها مستقر. واصل سعي التعافي الجميل! 🌸`;
  } else if (avg >= 5.0) {
    insight = `مؤشر التعافي العام الحالي هو (${avg} من 10). بعض الأنشطة بتخفف عنك جزئياً بس لسه محتاجة تكرار أو دعم بسيط من النوم الكافي والراحة. ركز على الخطوات اللي بتديك أعلى درجات تحسن! 🌟`;
  } else {
    insight = `مؤشر التحسن العام مسجل (${avg} من 10). واضح إنك بتمر بفترة ضغط مأثرة على فاعلية الخطوات. بلاش جلد ذات خالص، روق على نفسك وجرب تغير روتينك وتتمشى 10 دقائق لتسرع التشافي. 🌱`;
  }

  container.innerText = insight;
}

export function triggerRegenInsight() {
  if (window.triggerToastNotification) {
    window.triggerToastNotification("بنراجع تحليلاتك القديمة حالاً...");
  }
  setTimeout(() => {
    generateAnalyticsInsight();
    if (window.triggerToastNotification) {
      window.triggerToastNotification("تم تحديث الاستنتاج الذكي!");
    }
  }, 600);
}

export function calculateAdvancedCorrelations() {
  const select = document.getElementById('correlation-feeling-select');
  let selectedFeelingId = 'all';

  if (select) {
    const stateOptionIds = ['all', ...state.symptoms.map(s => s.id)];
    const currentOptionIds = Array.from(select.options).map(o => o.value);
    
    if (JSON.stringify(currentOptionIds) !== JSON.stringify(stateOptionIds)) {
      select.innerHTML = `<option value="all">كل المشاعر (الروقان العام)</option>` +
        state.symptoms.map(s => `<option value="${s.id}">${s.titleAr}</option>`).join('');
      // Trigger update of the custom selector text
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    selectedFeelingId = select.value;
  } else {
    selectedFeelingId = state.activeSymptomId || 'all';
  }

  const selectedSymptom = state.symptoms.find(s => s.id === selectedFeelingId);
  const feelingName = selectedSymptom ? selectedSymptom.titleAr : 'كل المشاعر';

  // Update UI Header in Track B
  const actionsTitle = document.getElementById('feeling-actions-title');
  if (actionsTitle) {
    actionsTitle.innerText = selectedFeelingId === 'all'
      ? `ثانياً: خطوات العلاج الأكثر إراحة بشكل عام`
      : `ثانياً: تأثير خطوات علاج (${feelingName})`;
  }

  const bestActionLabel = document.getElementById('best-action-label');
  if (bestActionLabel) {
    bestActionLabel.innerText = selectedFeelingId === 'all'
      ? `الخطوة العلاجية الأكثر إراحة بشكل عام`
      : `الخطوة الأكثر إراحة لـ (${feelingName})`;
  }

  // Calculate Efficacy from improvementsLog
  const logs = state.improvementsLog || [];

  // Card A elements: Best Action Impact
  const singleHabitImpact = document.getElementById('single-habit-impact');
  const singleHabitPercent = document.getElementById('single-habit-percent');
  const singleHabitDesc = document.getElementById('single-habit-desc');

  // Card B elements: Most Responsive Feeling Impact
  const comboHabitImpact = document.getElementById('combo-habit-impact');
  const comboHabitPercent = document.getElementById('combo-habit-percent');
  const comboHabitDesc = document.getElementById('combo-habit-desc');

  if (logs.length === 0) {
    // Default Fallbacks if no logs
    if (singleHabitImpact) singleHabitImpact.innerText = "اعمل أول خطوة علاجية";
    if (singleHabitPercent) singleHabitPercent.innerText = "جاهز";
    if (singleHabitDesc) singleHabitDesc.innerText = "سجل نسبة تحسنك بعد إنجاز الخطوات لمعرفة العادة العلاجية الأكثر تأثيراً.";

    if (comboHabitImpact) comboHabitImpact.innerText = "الربط التلقائي للمشاعر";
    if (comboHabitPercent) comboHabitPercent.innerText = "جاهز";
    if (comboHabitDesc) comboHabitDesc.innerText = "سنحسب لك تلقائياً أكثر شعور يستجيب للتعافي السريع والتحسن.";
  } else {
    // 1. Calculate best overall completed action
    const actionStats = {};
    logs.forEach(log => {
      if (!log.actionId) return;
      if (!actionStats[log.actionId]) {
        actionStats[log.actionId] = { sum: 0, count: 0, feelingId: log.feelingId };
      }
      actionStats[log.actionId].sum += log.rating;
      actionStats[log.actionId].count++;
    });

    let bestActionId = null;
    let bestActionAvg = 0;
    Object.keys(actionStats).forEach(id => {
      const avg = actionStats[id].sum / actionStats[id].count;
      if (avg > bestActionAvg) {
        bestActionAvg = avg;
        bestActionId = id;
      }
    });

    if (bestActionId) {
      let actTitle = "خطوة مخصصة";
      const stats = actionStats[bestActionId];
      const symptom = state.symptoms.find(s => s.id === stats.feelingId);
      if (symptom) {
        const act = (symptom.actions.near || []).concat(symptom.actions.long || []).find(a => a.id === bestActionId);
        if (act) actTitle = act.title;
      }

      if (singleHabitImpact) singleHabitImpact.innerText = actTitle;
      if (singleHabitPercent) singleHabitPercent.innerText = `${(bestActionAvg * 10).toFixed(0)}% فاعلية`;
      if (singleHabitDesc) {
        singleHabitDesc.innerText = `الخطوة العلاجية المنجزة (${actTitle}) هي الأقوى تأثيراً على تحسين مزاجك بمتوسط تحسن رقمي (${bestActionAvg.toFixed(1)} من 10).`;
      }
    }

    // 2. Calculate most responsive feeling
    const feelingStats = {};
    logs.forEach(log => {
      if (!log.feelingId) return;
      if (!feelingStats[log.feelingId]) {
        feelingStats[log.feelingId] = { sum: 0, count: 0 };
      }
      feelingStats[log.feelingId].sum += log.rating;
      feelingStats[log.feelingId].count++;
    });

    let bestFeelingId = null;
    let bestFeelingAvg = 0;
    Object.keys(feelingStats).forEach(id => {
      const avg = feelingStats[id].sum / feelingStats[id].count;
      if (avg > bestFeelingAvg) {
        bestFeelingAvg = avg;
        bestFeelingId = id;
      }
    });

    if (bestFeelingId) {
      const symptom = state.symptoms.find(s => s.id === bestFeelingId);
      const feelingNameAr = symptom ? symptom.titleAr : 'إحساس مجهول';

      if (comboHabitImpact) comboHabitImpact.innerText = feelingNameAr;
      if (comboHabitPercent) comboHabitPercent.innerText = `${(bestFeelingAvg * 10).toFixed(0)}% استجابة`;
      if (comboHabitDesc) {
        comboHabitDesc.innerText = `الشعور بـ (${feelingNameAr}) هو الأكثر تجاوباً وتعافياً بعد إنجازك للأنشطة العلاجية بمتوسط تحسن (${bestFeelingAvg.toFixed(1)} من 10).`;
      }
    }
  }

  // 3. Calculate Feeling Specific Actions Impact (Near vs Long)
  const nearActionIds = [];
  const nearActionLabels = {};
  const longActionIds = [];
  const longActionLabels = {};

  if (selectedFeelingId === 'all') {
    state.symptoms.forEach(s => {
      if (s.actions['near']) {
        s.actions['near'].forEach(a => {
          nearActionIds.push(a.id);
          nearActionLabels[a.id] = a.title;
        });
      }
      if (s.actions['long']) {
        s.actions['long'].forEach(a => {
          longActionIds.push(a.id);
          longActionLabels[a.id] = a.title;
        });
      }
    });
  } else if (selectedSymptom) {
    if (selectedSymptom.actions['near']) {
      selectedSymptom.actions['near'].forEach(a => {
        nearActionIds.push(a.id);
        nearActionLabels[a.id] = a.title;
      });
    }
    if (selectedSymptom.actions['long']) {
      selectedSymptom.actions['long'].forEach(a => {
        longActionIds.push(a.id);
        longActionLabels[a.id] = a.title;
      });
    }
  }

  const nearActionRatings = {};
  nearActionIds.forEach(id => {
    nearActionRatings[id] = { sumStars: 0, count: 0, sumTimeHours: 0, label: nearActionLabels[id] };
  });
  const longActionRatings = {};
  longActionIds.forEach(id => {
    longActionRatings[id] = { sumStars: 0, count: 0, label: longActionLabels[id] };
  });

  state.ratingsHistory.forEach(r => {
    if (nearActionRatings[r.actionId]) {
      nearActionRatings[r.actionId].sumStars += r.rating;
      nearActionRatings[r.actionId].count++;
      
      let timeInHours = 1.0;
      if (r.timeVal === '15m') timeInHours = 0.25;
      else if (r.timeVal === '1h') timeInHours = 1.0;
      else if (r.timeVal === '4h') timeInHours = 4.0;
      else if (r.timeVal === '1d') timeInHours = 24.0;
      
      nearActionRatings[r.actionId].sumTimeHours += timeInHours;
    }
    
    if (longActionRatings[r.actionId]) {
      longActionRatings[r.actionId].sumStars += r.rating;
      longActionRatings[r.actionId].count++;
    }
  });

  // Best Near Action: Score = Avg Stars * Speed Points
  let bestNear = null;
  let maxNearScore = 0;
  let bestNearAvgRecovery = "15 دقيقة";
  
  Object.keys(nearActionRatings).forEach(id => {
    const item = nearActionRatings[id];
    if (item.count > 0) {
      const avgStars = item.sumStars / item.count;
      const avgTimeHours = item.sumTimeHours / item.count;
      
      let speedPoints = 5;
      if (avgTimeHours <= 0.25) speedPoints = 10;
      else if (avgTimeHours <= 1.0) speedPoints = 8;
      else if (avgTimeHours <= 4.0) speedPoints = 5;
      else speedPoints = 1;

      const score = avgStars * speedPoints;
      if (score > maxNearScore) {
        maxNearScore = score;
        bestNear = { ...item, avgStars };
        bestNearAvgRecovery = avgTimeHours < 1 ? (avgTimeHours * 60).toFixed(0) + " دقيقة" : avgTimeHours.toFixed(1) + " ساعة";
      }
    }
  });

  // Best Long Action: Score = Avg Stars
  let bestLong = null;
  let maxLongScore = 0;
  
  Object.keys(longActionRatings).forEach(id => {
    const item = longActionRatings[id];
    if (item.count > 0) {
      const avgStars = item.sumStars / item.count;
      if (avgStars > maxLongScore) {
        maxLongScore = avgStars;
        bestLong = { ...item, avgStars };
      }
    }
  });

  // Update UI for Near Action
  const bestNearImpact = document.getElementById('best-near-impact');
  const bestNearRating = document.getElementById('best-near-rating');
  const bestNearTime = document.getElementById('best-near-time');
  const bestNearDesc = document.getElementById('best-near-desc');

  if (bestNear && maxNearScore > 0) {
    if (bestNearImpact) bestNearImpact.innerText = bestNear.label;
    if (bestNearRating) bestNearRating.innerText = `⭐ ${bestNear.avgStars.toFixed(1)}`;
    if (bestNearTime) bestNearTime.innerText = `⏱ ${bestNearAvgRecovery}`;
    if (bestNearDesc) {
      bestNearDesc.innerText = selectedFeelingId === 'all'
        ? `أكتر خطوة سريعة بتعملها بشكل عام وبتديك مفعول لحظي.`
        : `الخطوة السريعة دي بتريحك من (${feelingName}) في أسرع وقت وبأعلى نتيجة!`;
    }
  } else {
    if (bestNearImpact) bestNearImpact.innerText = selectedFeelingId === 'all' ? "تمارين التنفس البطيء" : "خطوات علاج سريعة";
    if (bestNearRating) bestNearRating.innerText = "⭐ 4.5";
    if (bestNearTime) bestNearTime.innerText = "⏱ 15 دقيقة";
    if (bestNearDesc) {
      bestNearDesc.innerText = `قم بتقييم خطوات العلاج السريعة لنحسب لك أفضل وأسرع مسكن.`;
    }
  }

  // Update UI for Long Action
  const bestLongImpact = document.getElementById('best-long-impact');
  const bestLongRating = document.getElementById('best-long-rating');
  const bestLongDesc = document.getElementById('best-long-desc');

  if (bestLong && maxLongScore > 0) {
    if (bestLongImpact) bestLongImpact.innerText = bestLong.label;
    if (bestLongRating) bestLongRating.innerText = `⭐ ${bestLong.avgStars.toFixed(1)}`;
    if (bestLongDesc) {
      bestLongDesc.innerText = selectedFeelingId === 'all'
        ? `نصيحة المدى الطويل الأكثر تأثيراً في روتينك العام.`
        : `النصيحة الأفضل لمعالجة (${feelingName}) من جذوره على المدى الطويل.`;
    }
  } else {
    if (bestLongImpact) bestLongImpact.innerText = selectedFeelingId === 'all' ? "الاستمرار على الرياضة" : "علاج جذري مخصص";
    if (bestLongRating) bestLongRating.innerText = "⭐ 5.0";
    if (bestLongDesc) {
      bestLongDesc.innerText = `قيم نصائح المدى الطويل لمعرفة أيهما يعالج المشكلة من جذورها.`;
    }
  }
}

// Bind to window for HTML events / inline JS compatibility
window.syncTodayHistory = syncTodayHistory;
window.generateAnalyticsInsight = generateAnalyticsInsight;
window.triggerRegenInsight = triggerRegenInsight;
window.calculateAdvancedCorrelations = calculateAdvancedCorrelations;

// Bind to window for HTML events / inline JS compatibility
window.syncTodayHistory = syncTodayHistory;
window.generateAnalyticsInsight = generateAnalyticsInsight;
window.triggerRegenInsight = triggerRegenInsight;
window.calculateAdvancedCorrelations = calculateAdvancedCorrelations;
