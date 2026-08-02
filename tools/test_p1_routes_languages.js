const { chromium } = require('playwright');

const base = (process.argv[2] || 'https://claude.rwa.bayern/ew2r3-preview/').replace(/\/$/, '');
const routes = ['about', 'contact', 'faq', 'privacy', 'research', 'support', 'thanks', 'verify'];
const languages = ['en', 'uk', 'de', 'es'];
const researchEnglishOnly = [
  'Paper titles remain private while their structure, evidence, and publication order are refined.',
  '15 works on the horizon · 10 already have prepared research material · the first wave is available as public preprints.'
];
const privateArticleTitles = [
  'The Gravitational Parameter E = ω²R³ as the Primary Constant of a Celestial System: Surface Gravity from Orbital Observations Without Masses or G',
  'From the Hydrogen Atom to the Milky Way',
  'Radial Flow Interpretation of the Gravitational Invariant E = ω²R³: A Hydrodynamic Model for Free-Fall Acceleration Without Mass'
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const results = [];
  const errors = [];
  for (const viewport of [{ width: 1360, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', error => errors.push(String(error)));
    for (const route of routes) {
      const response = await page.goto(`${base}/${route}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(60);
      await page.locator('[data-language-picker]').selectOption('en');
      await page.waitForTimeout(20);
      const original = await page.locator('main').innerText();
      for (const language of languages) {
        await page.locator('[data-language-picker]').selectOption(language);
        await page.waitForTimeout(20);
        const state = await page.evaluate(({ language, original, route, researchEnglishOnly, privateArticleTitles }) => {
          const current = document.querySelector('main')?.innerText || '';
          const links = [...document.querySelectorAll('a[href]')].map(a => a.href);
          return {
            htmlLang: document.documentElement.lang,
            title: document.title,
            changed: language === 'en' || current !== original,
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            emptyMain: current.trim().length === 0,
            links,
            researchTranslated: route !== 'research' || language === 'en' || !researchEnglishOnly.some(text => current.includes(text)),
            privateTitleVisible: route === 'research' && privateArticleTitles.some(text => document.documentElement.innerHTML.includes(text))
          };
        }, { language, original, route, researchEnglishOnly, privateArticleTitles });
        results.push({ viewport, route, language, status: response?.status(), ...state });
      }
    }
    await page.close();
  }
  const internal = [...new Set(results.flatMap(r => r.links).filter(h => h.startsWith(base)))];
  const broken = [];
  await Promise.all(internal.map(async href => {
    try {
      const response = await fetch(href, { signal: AbortSignal.timeout(10000) });
      if (!response || response.status >= 400) broken.push({ href, status: response?.status || 0 });
    } catch (error) {
      broken.push({ href, status: 0, error: String(error) });
    }
  }));
  await browser.close();
  const sourceBodies = [];
  for (const href of [`${base}/research/`, `${base}/assets/page-shell.js`]) {
    const response = await fetch(href, { signal: AbortSignal.timeout(10000) });
    sourceBodies.push({ href, status: response.status, body: await response.text() });
  }
  const privateSourceLeaks = sourceBodies.flatMap(source => privateArticleTitles
    .filter(title => source.body.includes(title))
    .map(title => ({ href: source.href, title })));
  const failed = results.filter(r => r.status !== 200 || r.htmlLang !== r.language || !r.changed || r.overflow || r.emptyMain || !r.researchTranslated || r.privateTitleVisible);
  const report = { base, scenarios: results.length, passed: results.length - failed.length, failed, broken, errors, privateSourceLeaks };
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = failed.length || broken.length || errors.length || privateSourceLeaks.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
