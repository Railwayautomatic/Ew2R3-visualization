const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'https://claude.rwa.bayern/ew2r3-preview/';
const outDir = path.resolve(process.argv[3] || 'tmp/e-field-matrix');
const width = Number(process.argv[4] || 1600);
const height = Number(process.argv[5] || 1000);
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('#btn-field').click());
  await page.waitForTimeout(500);

  async function scenario(name, first, second, range) {
    await page.selectOption('#f-body', first);
    await page.selectOption('#f-body2', second);
    if (!await page.locator('#f-pair').evaluate(el => el.classList.contains('on'))) {
      await page.evaluate(() => document.querySelector('#f-pair').click());
    }
    await page.click(range === 'full' ? '#f-rng-full' : '#f-rng-near');
    // Camera interpolation is intentionally smooth; inspect the settled frame.
    await page.waitForTimeout(3500);
    const state = await page.evaluate(`(() => {
      const visible = Object.entries(labelEls).filter(([,el]) => getComputedStyle(el).display !== 'none')
        .map(([id,el]) => ({id,text:el.textContent.trim()}));
      return {
        body: FIELD.body, pairWith: FIELD.pairWith, range: FIELD.range,
        pair: FIELD.pair, fieldReady: FIELD.ready,
        field2Ready: FIELD2.ready, field2Body: FIELD2.body,
        mainN: FIELD.N, secondN: FIELD2.N,
        mainFinite: FIELD.pos ? Array.from(FIELD.pos).every(Number.isFinite) : false,
        secondFinite: FIELD2.pos ? Array.from(FIELD2.pos).every(Number.isFinite) : false,
        visibleLabels: visible,
        mainMoonVisible: fieldBody().kind === 'moon' ? fieldMoonVisible(fieldBody().parent, fieldBody().moonRef) : true,
        secondMoonVisible: fieldBody2() && fieldBody2().kind === 'moon' ? fieldMoonVisible(fieldBody2().parent, fieldBody2().moonRef) : true
      };
    })()`);
    await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
    return { name, ...state };
  }

  const results = [];
  results.push(await scenario('sun-earth-full', 'sun', 'earth', 'full'));
  results.push(await page.evaluate(`(() => {
    const earth=anyBody('earth');
    return {
      name:'sun-earth-visibility-metrics',
      ordinaryRadius:world.earth.rDisp,
      fieldBodyRadius:fieldMap(1,earth),
      fieldOuterRadius:fieldOuterRel(earth)*fieldScaleFactor(earth),
      cameraDistance:state.camDist,
      keepsOrdinaryBody:sunPairPartner(earth)
    };
  })()`));
  for (const range of ['near', 'full']) {
    results.push(await scenario(`earth-moon-${range}`, 'earth', 'earth/Moon', range));
    results.push(await scenario(`moon-earth-${range}`, 'earth/Moon', 'earth', range));
  }
  const report = { url, viewport: `${width}x${height}`, results, errors };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
