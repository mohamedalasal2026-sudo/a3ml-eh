/**
 * Interactive SVG Bezier Weekly Chart Component
 */

import { state } from '../state/store.js';

export function renderSVGChart() {
  const svg = document.getElementById('analytics-svg');
  if (!svg) return;

  const scoreLine = document.getElementById('svg-score-line');
  const scoreArea = document.getElementById('svg-score-area');
  const reactionLine = document.getElementById('svg-reaction-line');
  const labelGroup = document.getElementById('svg-x-axis-labels');
  const nodeGroup = document.getElementById('svg-interactive-nodes');

  if (!scoreLine || !scoreArea || !reactionLine || !labelGroup || !nodeGroup) return;

  const width = 500;
  const height = 160;
  const paddingTop = 20;
  const paddingBottom = 20;
  const paddingLeft = 40;
  const paddingRight = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const days = state.historicalData.days;
  const scores = state.historicalData.scores;
  const reactions = state.historicalData.reactions;

  const points = [];
  const reactPoints = [];

  for (let i = 0; i < days.length; i++) {
    const x = paddingLeft + (i * (chartWidth / (days.length - 1)));

    const score = scores[i];
    const yScore = paddingTop + chartHeight - ((score - 1.0) / 4.0) * chartHeight;
    points.push({ x, y: yScore, score, day: days[i] });

    const react = reactions[i];
    const yReact = paddingTop + chartHeight - ((react - 2.0) / 10.0) * chartHeight;
    reactPoints.push({ x, y: yReact, react });
  }

  // Draw Smooth Bezier curve for overall health scores
  let dScoreLine = `M ${points[0].x} ${points[0].y}`;
  let dScoreArea = `M ${points[0].x} ${paddingTop + chartHeight} L ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
    const cpY1 = points[i - 1].y;
    const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
    const cpY2 = points[i].y;

    dScoreLine += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    dScoreArea += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
  }

  dScoreArea += ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;

  scoreLine.setAttribute('d', dScoreLine);
  scoreArea.setAttribute('d', dScoreArea);

  // Draw Smooth Bezier curve for recovery speed
  let dReactLine = `M ${reactPoints[0].x} ${reactPoints[0].y}`;
  for (let i = 1; i < reactPoints.length; i++) {
    const cpX1 = reactPoints[i - 1].x + (reactPoints[i].x - reactPoints[i - 1].x) / 2;
    const cpY1 = reactPoints[i - 1].y;
    const cpX2 = reactPoints[i - 1].x + (reactPoints[i].x - reactPoints[i - 1].x) / 2;
    const cpY2 = reactPoints[i].y;

    dReactLine += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${reactPoints[i].x} ${reactPoints[i].y}`;
  }
  reactionLine.setAttribute('d', dReactLine);

  // Clear previous labels & nodes
  labelGroup.innerHTML = '';
  nodeGroup.innerHTML = '';

  points.forEach((pt, idx) => {
    // 1. Draw Axis Day Labels
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', pt.x);
    txt.setAttribute('y', height - 2);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('fill', '#A6A6A1');
    txt.setAttribute('font-size', '8');
    txt.setAttribute('font-weight', '600');
    txt.textContent = pt.day;
    labelGroup.appendChild(txt);

    // 2. Draw Interactive Score Nodes (Mental Health)
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pt.x);
    circle.setAttribute('cy', pt.y);
    circle.setAttribute('r', '3.5');
    circle.setAttribute('fill', '#000000');
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '1.5');
    circle.setAttribute('class', 'cursor-pointer hover:r-5 transition-all');
    circle.innerHTML = `<title>اليوم: ${pt.day}\nمستوى الصحة النفسية: ${pt.score}/5.0\nسرعة تعافيك: ${reactPoints[idx].react} ساعة</title>`;
    nodeGroup.appendChild(circle);

    // 3. Draw Interactive Recovery Speed Nodes
    const rCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    rCircle.setAttribute('cx', reactPoints[idx].x);
    rCircle.setAttribute('cy', reactPoints[idx].y);
    rCircle.setAttribute('r', '2.5');
    rCircle.setAttribute('fill', '#A6A6A1');
    rCircle.setAttribute('stroke', '#ffffff');
    rCircle.setAttribute('stroke-width', '1');
    rCircle.innerHTML = `<title>اليوم: ${pt.day}\nسرعة التعافي: ${reactPoints[idx].react} ساعة</title>`;
    nodeGroup.appendChild(rCircle);
  });
}

// Bind to window for HTML events / inline JS compatibility
window.renderSVGChart = renderSVGChart;
