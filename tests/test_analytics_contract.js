const { chromium } = require('playwright');

const base = process.argv[2] || 'https://claude.rwa.bayern/ew2r3-preview/';
const expectedUtm = {
  utm_source: 'codex_test',
  utm_medium: 'qa',
  utm_campaign: 'p4_contract',
  utm_content: 'analytics_contract_01',
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const externalAnalytics = [];
  page.on('request', (request) => {
    if (/googletagmanager|google-analytics|posthog|umami|plausible/i.test(request.url())) {
      externalAnalytics.push(request.url());
    }
  });

  const query = new URLSearchParams(expectedUtm).toString();
  await page.goto(base + '?' + query, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Array.isArray(window.EW2R3_ANALYTICS_DEBUG));
  await page.waitForFunction(() => window.EW2R3_ANALYTICS_DEBUG.some(event => event.name === 'model_ready'));
  const systemEvents = await page.evaluate(() => window.EW2R3_ANALYTICS_DEBUG.map(event => event.name));
  const pageViewCount = systemEvents.filter(name => name === 'page_view').length;
  const modelReadyCount = systemEvents.filter(name => name === 'model_ready').length;
  await page.evaluate(() => window.ewTrack('field_panel_open', { body: 'Earth', view_mode: 'full' }));

  const first = await page.evaluate(() => window.EW2R3_ANALYTICS_DEBUG.at(-1));
  const firstErrors = [];
  if (first.name !== 'field_panel_open') firstErrors.push(`name=${first.name}`);
  for (const [key, value] of Object.entries(expectedUtm)) {
    if (first.params[key] !== value) firstErrors.push(`${key}=${first.params[key]}`);
  }
  if (first.params.schema_version !== 1) firstErrors.push(`schema_version=${first.params.schema_version}`);
  if (first.params.viewport_class !== 'mobile') firstErrors.push(`viewport_class=${first.params.viewport_class}`);
  if (pageViewCount !== 1) firstErrors.push(`page_view_count=${pageViewCount}`);
  if (modelReadyCount !== 1) firstErrors.push(`model_ready_count=${modelReadyCount}`);

  const noWebglPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await noWebglPage.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await noWebglPage.goto(base, { waitUntil: 'domcontentloaded' });
  await noWebglPage.waitForFunction(() => Array.isArray(window.EW2R3_ANALYTICS_DEBUG));
  const webglError = await noWebglPage.evaluate(() =>
    window.EW2R3_ANALYTICS_DEBUG.find(event => event.name === 'webgl_error'));
  if (!webglError || webglError.params.stage !== 'context_init') firstErrors.push('webgl_error_missing');

  await page.goto(base + 'verify/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Array.isArray(window.EW2R3_ANALYTICS_DEBUG) && window.EW2R3_ANALYTICS_DEBUG.length > 0);
  const second = await page.evaluate(() => window.EW2R3_ANALYTICS_DEBUG.at(-1));
  const persisted = Object.entries(expectedUtm).every(([key, value]) => second.params[key] === value);

  const result = {
    pass: firstErrors.length === 0 && persisted && externalAnalytics.length === 0,
    firstEvent: first,
    systemEvents,
    webglError,
    utmPersistedAcrossRoute: persisted,
    externalAnalyticsRequests: externalAnalytics,
    errors: firstErrors,
  };
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  process.exit(result.pass ? 0 : 1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
