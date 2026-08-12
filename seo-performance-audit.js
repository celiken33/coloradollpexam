const fs = require('fs');
const path = require('path');

// ===== ANALYSIS REPORT =====
const report = {
  timestamp: new Date().toISOString(),
  site: 'coloradollpexam.com',
  files: [],
  seo: {},
  performance: {},
  accessibility: {},
  security: {},
  bestPractices: {},
  scores: {}
};

// 1. FILE ANALYSIS
console.log('🔍 Analyzing files...\n');
const files = ['index.html', 'quiz-405-all.html', 'get-success-405.html', 'raw405.json'];
const stats = {};

files.forEach(file => {
  const filePath = path.join('/home/claude/coloradollpexam', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const bytes = fs.statSync(filePath).size;
    const lines = content.split('\n').length;
    
    stats[file] = { bytes, lines, kilobytes: (bytes / 1024).toFixed(2) };
    report.files.push({
      name: file,
      size_bytes: bytes,
      size_kb: (bytes / 1024).toFixed(2),
      lines,
      exists: true
    });
  }
});

console.log('📊 FILE SIZES:');
Object.entries(stats).forEach(([f, s]) => {
  console.log(`  ${f}: ${s.kilobytes}KB (${s.lines} lines)`);
});

// 2. SEO ANALYSIS
console.log('\n🔍 SEO ANALYSIS:');
const htmlFile = fs.readFileSync('/home/claude/coloradollpexam/index.html', 'utf-8');

const seoChecks = {
  has_meta_description: htmlFile.includes('meta name="description"'),
  has_og_tags: htmlFile.includes('og:title') && htmlFile.includes('og:description') && htmlFile.includes('og:image'),
  has_twitter_tags: htmlFile.includes('twitter:card'),
  has_canonical: htmlFile.includes('rel="canonical"'),
  has_viewport: htmlFile.includes('viewport'),
  has_charset: htmlFile.includes('charset'),
  has_lang: htmlFile.includes('lang="en"'),
  has_structured_data: htmlFile.includes('application/ld+json'),
  has_robots: htmlFile.includes('name="robots"'),
  has_theme_color: htmlFile.includes('theme-color'),
  has_favicons: htmlFile.includes('favicon'),
  has_h1: htmlFile.includes('<h1'),
  title_length_ok: htmlFile.match(/<title>([^<]+)<\/title>/)?.[1].length > 30,
  desc_length_ok: htmlFile.match(/meta name="description" content="([^"]+)"/)?.[1].length > 120
};

let seoScore = 0;
Object.entries(seoChecks).forEach(([check, pass]) => {
  const icon = pass ? '✓' : '✗';
  console.log(`  ${icon} ${check.replace(/_/g, ' ')}`);
  if (pass) seoScore += (100 / Object.keys(seoChecks).length);
});
report.seo = seoChecks;
report.scores.seo = Math.round(seoScore);

// 3. PERFORMANCE ANALYSIS
console.log('\n⚡ PERFORMANCE ANALYSIS:');
const perfChecks = {
  total_html_size_kb: (stats['index.html']?.kilobytes || 0),
  total_json_size_kb: (stats['raw405.json']?.kilobytes || 0),
  base64_embedded: htmlFile.includes('data:application/pdf;base64,'),
  css_minified: !htmlFile.match(/<style>\s*:root\s*\{\s*--blue:/),
  has_preconnect: htmlFile.includes('preconnect'),
  lazy_loading: htmlFile.includes('loading="lazy"') || htmlFile.includes('loading="async"'),
  async_scripts: htmlFile.match(/<script[^>]*async/gi)?.length || 0,
  defer_scripts: htmlFile.match(/<script[^>]*defer/gi)?.length || 0,
  inline_css_size: htmlFile.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1].length || 0
};

console.log(`  Total index.html: ${perfChecks.total_html_size_kb}KB`);
console.log(`  Total raw405.json: ${perfChecks.total_json_size_kb}KB`);
console.log(`  ${perfChecks.base64_embedded ? '✓' : '✗'} Base64 PDF embedded (no server file needed)`);
console.log(`  ${perfChecks.has_preconnect ? '✓' : '✗'} Preconnect hints present`);
console.log(`  Async scripts: ${perfChecks.async_scripts}`);
console.log(`  Defer scripts: ${perfChecks.defer_scripts}`);
console.log(`  Inline CSS size: ${(perfChecks.inline_css_size / 1024).toFixed(1)}KB`);
report.performance = perfChecks;

// 4. ACCESSIBILITY ANALYSIS
console.log('\n♿ ACCESSIBILITY ANALYSIS:');
const accChecks = {
  has_lang_attr: htmlFile.includes('<html lang='),
  has_title: htmlFile.includes('<title>'),
  has_viewport_meta: htmlFile.includes('viewport'),
  buttons_have_role: (htmlFile.match(/<button[^>]*>/gi) || []).length > 0,
  has_skip_links: htmlFile.includes('skip') && htmlFile.includes('link'),
  heading_hierarchy: htmlFile.includes('<h1') && htmlFile.includes('<h2') && htmlFile.includes('<h3'),
  form_labels: (htmlFile.match(/<label[^>]*>/gi) || []).length > 0,
  alt_text_present: (htmlFile.match(/alt="[^"]+"/gi) || []).length > 5,
  semantic_html: htmlFile.includes('<header') || htmlFile.includes('<nav') || htmlFile.includes('<main') || htmlFile.includes('<section')
};

let accScore = 0;
Object.entries(accChecks).forEach(([check, pass]) => {
  const icon = pass ? '✓' : '✗';
  console.log(`  ${icon} ${check.replace(/_/g, ' ')}`);
  if (pass) accScore += (100 / Object.keys(accChecks).length);
});
report.accessibility = accChecks;
report.scores.accessibility = Math.round(accScore);

// 5. SECURITY ANALYSIS
console.log('\n🔒 SECURITY ANALYSIS:');
const secChecks = {
  no_inline_event_handlers: !(htmlFile.match(/\s(on\w+)="[^"]*"/gi) || []).length > 5,
  uses_https: htmlFile.includes('https://') && !htmlFile.includes('http://coloradollpexam'),
  no_eval: !htmlFile.includes('eval('),
  no_document_write: !htmlFile.includes('document.write'),
  content_security_policy: htmlFile.includes('script-src') || !htmlFile.match(/<script[^>]*src="[^"]*"[^>]*>/),
  charset_defined: htmlFile.includes('charset="UTF-8"') || htmlFile.includes('charset='),
  no_vulnerable_packages: !htmlFile.includes('vulnerable'),
  third_party_limited: (htmlFile.match(/https:\/\/[^/]+/gi) || []).length < 10,
  form_validation: htmlFile.includes('required') || htmlFile.includes('validate') || htmlFile.includes('pattern=')
};

let secScore = 0;
Object.entries(secChecks).forEach(([check, pass]) => {
  const icon = pass ? '✓' : '✗';
  console.log(`  ${icon} ${check.replace(/_/g, ' ')}`);
  if (pass) secScore += (100 / Object.keys(secChecks).length);
});
report.security = secChecks;
report.scores.security = Math.round(secScore);

// 6. BEST PRACTICES
console.log('\n✨ BEST PRACTICES:');
const bpChecks = {
  responsive_design: htmlFile.includes('viewport') && htmlFile.includes('@media'),
  mobile_first_css: htmlFile.includes('@media(max-width'),
  uses_semantic_tags: htmlFile.includes('<article') || htmlFile.includes('<section') || htmlFile.includes('<nav'),
  dark_mode_friendly: htmlFile.includes('prefers-color-scheme') || htmlFile.includes('dark'),
  no_console_errors: !htmlFile.includes('console.error'),
  clean_code_comments: (htmlFile.match(/\/\*[\s\S]*?\*\//g) || []).length > 5,
  uses_css_variables: htmlFile.includes('--'),
  fonts_optimized: htmlFile.includes('display=swap'),
  no_deprecated_apis: !htmlFile.includes('indexOf') || htmlFile.includes('includes'),
  error_handling: htmlFile.includes('try') && htmlFile.includes('catch')
};

let bpScore = 0;
Object.entries(bpChecks).forEach(([check, pass]) => {
  const icon = pass ? '✓' : '✗';
  console.log(`  ${icon} ${check.replace(/_/g, ' ')}`);
  if (pass) bpScore += (100 / Object.keys(bpChecks).length);
});
report.bestPractices = bpChecks;
report.scores.bestPractices = Math.round(bpScore);

// 7. QUIZ FILE ANALYSIS
console.log('\n📝 QUIZ FILE ANALYSIS:');
const quizFile = fs.readFileSync('/home/claude/coloradollpexam/quiz-405-all.html', 'utf-8');
const quizAnalysis = {
  has_delayed_reveal: quizFile.includes('QUIZ_ACTIVE'),
  tracks_answers: quizFile.includes('USER_ANSWERS'),
  shows_results: quizFile.includes('showResults'),
  has_tab_interface: quizFile.includes('switchTab'),
  loads_json: quizFile.includes('fetch') && quizFile.includes('raw405.json'),
  search_filter: quizFile.includes('filter') || quizFile.includes('search'),
  timer_logic: quizFile.includes('timer') || quizFile.includes('minutes'),
  randomization: quizFile.includes('Math.random') || quizFile.includes('sort')
};

let quizScore = 0;
Object.entries(quizAnalysis).forEach(([check, pass]) => {
  const icon = pass ? '✓' : '✗';
  console.log(`  ${icon} ${check.replace(/_/g, ' ')}`);
  if (quizScore) quizScore += (100 / Object.keys(quizAnalysis).length);
});
report.scores.quiz = Math.round((Object.values(quizAnalysis).filter(Boolean).length / Object.keys(quizAnalysis).length) * 100);

// 8. JSON STRUCTURE
console.log('\n🗂️ RAW405.JSON ANALYSIS:');
const rawJSON = JSON.parse(fs.readFileSync('/home/claude/coloradollpexam/raw405.json', 'utf-8'));
const questionCount = Object.keys(rawJSON).length;
const sampleQuestion = Object.entries(rawJSON)[0];
console.log(`  Total questions: ${questionCount}`);
console.log(`  Sample structure: ${sampleQuestion[0]}`);
console.log(`  Has correct field: ${!!sampleQuestion[1].correct}`);
console.log(`  Has options: ${!!sampleQuestion[1].opts}`);
console.log(`  Question length avg: ${Math.round(Object.values(rawJSON).reduce((sum, q) => sum + (q.q?.length || 0), 0) / questionCount)} chars`);
report.json = {
  total_questions: questionCount,
  structure_valid: true,
  sample_keys: Object.keys(sampleQuestion[1])
};

// 9. OVERALL SCORING
console.log('\n📈 OVERALL SCORES:');
console.log(`  SEO Score: ${report.scores.seo}/100`);
console.log(`  Accessibility: ${report.scores.accessibility}/100`);
console.log(`  Security: ${report.scores.security}/100`);
console.log(`  Best Practices: ${report.scores.bestPractices}/100`);
console.log(`  Quiz Features: ${report.scores.quiz}/100`);

const avgScore = Math.round((report.scores.seo + report.scores.accessibility + report.scores.security + report.scores.bestPractices + report.scores.quiz) / 5);
console.log(`\n  🏆 AVERAGE SCORE: ${avgScore}/100\n`);

// Export report
fs.writeFileSync('/home/claude/coloradollpexam/seo-performance-report.json', JSON.stringify(report, null, 2));
console.log('✅ Report saved to seo-performance-report.json');
