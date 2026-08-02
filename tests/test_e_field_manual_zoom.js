const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');

const html = path.resolve(__dirname, '..', 'deployment-artifacts', '2026-07-31', 'claude-staging-site', 'index.html');
const target = process.env.EW2R3_TEST_URL || pathToFileURL(html).href;

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page=await browser.newPage({viewport:{width:1360,height:900}});
  await page.goto(target,{waitUntil:'load'}); await page.waitForTimeout(700);
  await page.click('#btn-field');
  await page.selectOption('#f-body','earth');
  const moon=await page.evaluate(()=>MOON_BODIES.find(m=>m.parent.id==='earth').id);
  await page.selectOption('#f-body2',moon);
  if(!await page.locator('#f-pair').evaluate(el=>el.classList.contains('on'))) await page.click('#f-pair');
  const results=[];
  for(const range of ['near','full']){
    await page.click(range==='near'?'#f-rng-near':'#f-rng-full');
    await page.waitForTimeout(350);
    const before=await page.evaluate(()=>({target:state.tgtDist,camera:state.camDist,manual:state.fieldManualZoom}));
    await page.locator('#gl').hover({position:{x:700,y:450}});
    for(let i=0;i<14;i++) await page.mouse.wheel(0,-160);
    await page.waitForTimeout(900);
    const after=await page.evaluate(()=>({target:state.tgtDist,camera:state.camDist,manual:state.fieldManualZoom}));
    const zoomed=after.target<before.target*0.7 && after.camera<before.camera*0.8 && after.manual===true;
    results.push({range,before,after,zoomed});
  }
  const ok=results.every(x=>x.zoomed);
  console.log(JSON.stringify({target,results,ok},null,2));
  await browser.close(); if(!ok)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
