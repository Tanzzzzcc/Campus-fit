const $ = selector => document.querySelector(selector);
const form = $('#form'), resume = $('#resume'), job = $('#job'), error = $('#error');

$('#loadExample').addEventListener('click', () => {
  resume.value = 'Computer science student. Built a job board using React, JavaScript, Node.js, Express and MongoDB. Created REST APIs, used Git and solved data structures and algorithms problems. Interested in backend development.';
  job.value = 'Junior Full Stack Engineer. Requirements: JavaScript, React, Node.js, Express, MongoDB, SQL, REST APIs, Git, Docker, testing, data structures and algorithms.';
  error.textContent = '';
});

form.addEventListener('submit', async event => {
  event.preventDefault(); error.textContent = '';
  const button = form.querySelector('button[type="submit"]'); button.disabled = true; button.innerHTML = 'Reading your inputs <span>…</span>';
  try {
    const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: resume.value, job: job.value }) });
    const result = await response.json(); if (!response.ok) throw new Error(result.error);
    render(result);
  } catch (err) { error.textContent = err.message || 'Something went wrong. Is the local server running?'; }
  finally { button.disabled = false; button.innerHTML = 'Find my fit <span>→</span>'; }
});

function render(data) {
  $('#empty').classList.add('hidden'); $('#output').classList.remove('hidden');
  $('#score').textContent = data.score; $('#barFill').style.width = `${data.score}%`;
  $('#scoreCaption').textContent = data.score >= 75 ? 'You have a solid base for this role. Make your experience easy to prove.' : data.score >= 40 ? 'There are relevant skills here. Pick a gap or two to work on next.' : 'A few core skills are missing. That gives you a clear place to start.';
  $('#method').textContent = data.method;
  $('#matchedCount').textContent = `(${data.matched.length})`; $('#missingCount').textContent = `(${data.missing.length})`;
  $('#matched').innerHTML = chips(data.matched, 'good'); $('#missing').innerHTML = chips(data.missing, 'gap');
  if (!data.matched.length) $('#matched').innerHTML = '<span class="chip neutral">No recognized overlap yet</span>';
  if (!data.missing.length) $('#missing').innerHTML = '<span class="chip neutral">No skill gaps found</span>';
  $('#plan').innerHTML = data.plan.length ? data.plan.map(item => `<article class="plan-card"><strong>${escapeHtml(item.skill)}</strong><ol>${item.tasks.map(task => `<li>${escapeHtml(task)}</li>`).join('')}</ol></article>`).join('') : '<p class="method">No recognized skill gaps. Use the time to strengthen examples of the skills you already have.</p>';
}
function chips(items, cls) { return items.map(item => `<span class="chip ${cls}">${escapeHtml(item)}</span>`).join(''); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
