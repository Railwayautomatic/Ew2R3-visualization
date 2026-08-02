const { chromium } = require('playwright');

const url = process.argv[2] || 'https://claude.rwa.bayern/ew2r3-preview/';
const planetFilter = process.argv[3] || '';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.click('#btn-field');
  let pairs = await page.evaluate(`MOON_BODIES.reduce((a,m) => {
    if (!a.some(x => x.planet === m.parent.id)) a.push({planet:m.parent.id, moon:m.id});
    return a;
  }, [])`);
  if (planetFilter) pairs = pairs.filter(x => x.planet === planetFilter);
  const results = [];
  for (const { planet, moon } of pairs) {
    for (const range of ['near', 'full']) {
      for (const [first, second] of [[planet, moon], [moon, planet]]) {
        await page.selectOption('#f-body', first);
        await page.selectOption('#f-body2', second);
        if (!await page.locator('#f-pair').evaluate(el => el.classList.contains('on'))) await page.click('#f-pair');
        await page.click(range === 'full' ? '#f-rng-full' : '#f-rng-near');
        // This matrix validates deterministic seed/state/labels, not the long-running
        // animation. Freezing tracer integration keeps each WebGL scenario bounded.
        await page.evaluate(() => { FIELD.running=false; });
        await page.waitForTimeout(120);
        results.push(await page.evaluate(`(() => {
          const first='${first}', second='${second}', range='${range}';
          const labelId=id => {
            if(!id.includes('/')) return id;
            const m=MOON_BODIES.find(x=>x.id===id);
            return m.parent.id+'_m'+m.parent.moons.indexOf(m.moonRef);
          };
          const visible=id => {
            const el=labelEls[labelId(id)]; return !!el && getComputedStyle(el).display!=='none';
          };
          return {
            first,second,range,body:FIELD.body,secondBody:FIELD2.body,
            ready:FIELD.ready&&FIELD2.ready,
            finite:Array.from(FIELD.pos).every(Number.isFinite)&&Array.from(FIELD2.pos).every(Number.isFinite),
            firstLabel:visible(first),secondLabel:visible(second)
          };
        })()`));
      }
    }
  }
  const failed=results.filter(r=>r.body!==r.first||r.secondBody!==r.second||!r.ready||!r.finite||!r.firstLabel||!r.secondLabel);
  const report={url,pairs,scenarios:results.length,passed:results.length-failed.length,failed,errors};
  console.log(JSON.stringify(report,null,2));
  // Some Windows/Chrome WebGL sessions finish all assertions but hang while the
  // browser process is closing. Bound teardown so a passed matrix is reportable.
  await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,2000))]);
  process.exit(failed.length||errors.length?1:0);
})().catch(err=>{ console.error(err); process.exit(1); });
