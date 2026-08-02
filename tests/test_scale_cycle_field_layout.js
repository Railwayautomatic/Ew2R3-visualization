const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');

const html = path.resolve(__dirname, '..', 'deployment-artifacts', '2026-07-31', 'claude-staging-site', 'index.html');
const target = process.env.EW2R3_TEST_URL || pathToFileURL(html).href;
const intersects = (a,b) => !(a.right<=b.left || a.left>=b.right || a.bottom<=b.top || a.top>=b.bottom);

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const results=[];
  for(const viewport of [{width:1360,height:900},{width:1200,height:800},{width:980,height:700}]){
    const page=await browser.newPage({viewport});
    await page.goto(target,{waitUntil:'load'}); await page.waitForTimeout(700);
    await page.click('#btn-field'); await page.waitForTimeout(250);
    await page.selectOption('#f-body','earth'); await page.waitForTimeout(250);
    const before=await page.evaluate(()=>({
      radii:Object.fromEntries(BODIES.map(b=>[b.id,world[b.id].rDisp])),
      fieldScale:fieldScaleFactor(fieldBody()), ready:FIELD.ready,
      positions:FIELD.positions, body:FIELD.body, realScale:state.realScale
    }));
    await page.click('#b-scale'); await page.waitForTimeout(250);
    const middle=await page.evaluate(()=>({
      radii:Object.fromEntries(BODIES.map(b=>[b.id,world[b.id].rDisp])),
      fieldScale:fieldScaleFactor(fieldBody()), ready:FIELD.ready,
      positions:FIELD.positions, body:FIELD.body, realScale:state.realScale
    }));
    await page.click('#b-scale'); await page.waitForTimeout(250);
    const after=await page.evaluate(()=>({
      radii:Object.fromEntries(BODIES.map(b=>[b.id,world[b.id].rDisp])),
      fieldScale:fieldScaleFactor(fieldBody()), ready:FIELD.ready,
      positions:FIELD.positions, body:FIELD.body, realScale:state.realScale
    }));
    const layout=await page.evaluate(()=>{
      const rect=id=>{const r=document.querySelector(id).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,display:getComputedStyle(document.querySelector(id)).display}};
      return {panel:rect('#fpanel'),eq:rect('#eqbar'),noMass:rect('#noMass'),topRight:rect('#top-right')};
    });
    const radiiRestored=Object.keys(before.radii).every(k=>before.radii[k]===after.radii[k]);
    const fieldScaleRelErr=Math.abs(before.fieldScale-after.fieldScale)/before.fieldScale;
    const fieldRestored=fieldScaleRelErr<1e-8 && before.ready && middle.ready && after.ready;
    const panelOverlap=(layout.eq.display!=='none'&&intersects(layout.panel,layout.eq))||(layout.noMass.display!=='none'&&intersects(layout.panel,layout.noMass));
    const topOverlap=layout.topRight.display!=='none'&&(intersects(layout.topRight,layout.eq)||intersects(layout.topRight,layout.noMass));
    results.push({viewport,before:{...before,positions:'buffer'},middle:{...middle,positions:'buffer'},after:{...after,positions:'buffer'},radiiRestored,fieldScaleRelErr,fieldRestored,layout,panelOverlap,topOverlap});
    await page.close();
  }
  const ok=results.every(x=>x.radiiRestored&&x.fieldRestored&&!x.panelOverlap&&!x.topOverlap);
  console.log(JSON.stringify({target,results,ok},null,2));
  await browser.close(); if(!ok)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
