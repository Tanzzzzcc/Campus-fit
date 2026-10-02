const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };

// A small, transparent skill vocabulary. Aliases let ordinary resume wording map to one skill.
const SKILLS = {
  JavaScript: ['javascript', 'js', 'ecmascript'], TypeScript: ['typescript', 'ts'], React: ['react', 'react.js'],
  Node: ['node.js', 'nodejs', 'node'], Express: ['express', 'express.js'], MongoDB: ['mongodb', 'mongo'],
  SQL: ['sql', 'mysql', 'postgresql', 'postgres'], Python: ['python'], Java: ['java'],
  'Data structures': ['data structures', 'dsa', 'algorithms', 'problem solving'],
  REST: ['rest api', 'restful', 'rest apis'], Git: ['git', 'github'], Docker: ['docker', 'containerization'],
  AWS: ['aws', 'amazon web services'], 'Machine learning': ['machine learning', ' ml ', 'scikit-learn', 'sklearn'],
  'Natural language processing': ['nlp', 'natural language processing'], 'LLM APIs': ['llm', 'openai api', 'generative ai'],
  Testing: ['testing', 'jest', 'unit tests', 'pytest'], 'System design': ['system design', 'scalability', 'distributed systems']
};
const PLANS = {
  React: ['Build a searchable list with reusable components', 'Practice state, props, and controlled forms'],
  Node: ['Create a small REST endpoint with validation', 'Explain event loop and async/await'],
  MongoDB: ['Model a user and job collection', 'Practice indexes and document references'],
  SQL: ['Write joins, grouping, and subqueries', 'Compare relational tables with document storage'],
  Python: ['Solve 5 array and hash-map problems', 'Write a small script that reads and validates JSON'],
  'Data structures': ['Review arrays, hash maps, stacks, and trees', 'Solve two problems and state time/space complexity'],
  REST: ['Design CRUD endpoints and status codes', 'Add request validation and error responses'],
  Git: ['Practice branches, commits, and resolving a merge conflict', 'Write a concise README with setup steps'],
  Docker: ['Containerize a small web service', 'Explain image, container, and port mapping'],
  'Machine learning': ['Train a baseline classifier on a small dataset', 'Compare precision, recall, and a baseline'],
  'Natural language processing': ['Try tokenization and TF-IDF on short text', 'Inspect false matches and refine preprocessing'],
  'LLM APIs': ['Build a prompt with structured JSON output', 'Add input limits and handle API errors'],
  Testing: ['Write unit tests for edge cases', 'Test one API route with valid and invalid input'],
  TypeScript: ['Add types to a small API response', 'Practice unions, interfaces, and narrowing'],
  JavaScript: ['Review closures, promises, and array methods', 'Solve a hash-map problem in JavaScript'],
  Express: ['Add middleware and route-level validation', 'Handle errors in one consistent place'],
  MongoDB: ['Model a user and job collection', 'Practice indexes and document references'],
  AWS: ['Deploy a static app or small API', 'Explain environment variables and basic cloud networking'],
  'System design': ['Sketch a job-search API and its data model', 'Discuss pagination, caching, and bottlenecks']
};

function extractSkills(text) {
  const source = ` ${String(text || '').toLowerCase().replace(/[^a-z0-9.+#\s-]/g, ' ')} `;
  return Object.entries(SKILLS).filter(([, aliases]) => aliases.some(alias => {
    const key = alias.toLowerCase();
    return source.includes(` ${key} `) || source.includes(` ${key.replace(/\s+/g, ' ')} `);
  })).map(([skill]) => skill);
}

function analyze({ resume = '', job = '' }) {
  if (!resume.trim() || !job.trim()) throw new Error('Add both your resume text and a job description.');
  const resumeSkills = extractSkills(resume), jobSkills = extractSkills(job);
  if (!jobSkills.length) throw new Error('I could not find recognized skills in the job description. Try adding skills such as React, SQL, or Python.');
  const matched = jobSkills.filter(skill => resumeSkills.includes(skill));
  const missing = jobSkills.filter(skill => !resumeSkills.includes(skill));
  const score = Math.round(100 * matched.length / jobSkills.length);
  const plan = missing.slice(0, 4).map(skill => ({ skill, tasks: PLANS[skill] || [`Build a tiny example using ${skill}`, `Explain one core concept of ${skill} aloud`] }));
  return { score, matched, missing, jobSkills, resumeSkills, plan, method: 'Recognized-skill coverage: matched job skills ÷ recognized job skills. Each skill has equal weight.' };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'POST' && url.pathname === '/api/analyze') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 100_000) req.destroy(); });
    req.on('end', () => {
      try { const result = analyze(JSON.parse(body)); res.writeHead(200, { 'Content-Type': MIME['.json'] }); res.end(JSON.stringify(result)); }
      catch (err) { res.writeHead(400, { 'Content-Type': MIME['.json'] }); res.end(JSON.stringify({ error: err.message || 'Could not analyze these inputs.' })); }
    });
    return;
  }
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(PUBLIC, requested);
  if (!file.startsWith(PUBLIC + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }); res.end(data);
  });
});
server.listen(PORT, '0.0.0.0', () => console.log(`CampusFit running at http://localhost:${PORT}`));

module.exports = { analyze, extractSkills };
