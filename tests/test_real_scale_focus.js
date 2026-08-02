const { chromium } = require('playwright');
const target = process.argv[2] || process.env.EW2R3_TEST_URL || 'https://claude.rwa.bayern/ew2r3-preview/';

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const geometry=[];
  for(const viewport of [{width:1575,height:1200},{width:1168,height:700},{width:900,height:700}]){
    const page=await browser.newPage({viewport});
    await page.goto(target,{waitUntil:'load'}); await page.waitForTimeout(700);
    await page.evaluate(()=>select('sun')); await page.waitForTimeout(100);
    geometry.push(await page.evaluate((viewport)=>{
      const card=document.querySelector('#card').getBoundingClientRect();
      const rows=['eqbar','noMass','dimline','kepler','gfix'].map(id=>{
        const el=document.querySelector('#'+id),r=el.getBoundingClientRect(),display=getComputedStyle(el).display;
        return {id,display,intersects:display!=='none'&&!(r.right<=card.left||r.left>=card.right||r.bottom<=card.top||r.top>=card.bottom)};
      });
      return {viewport,card:{left:card.left,top:card.top},topRight:getComputedStyle(document.querySelector('#top-right')).display,rows};
    },viewport));
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:1400,height:900}});
  await page.goto(target,{waitUntil:'load'}); await page.waitForTimeout(700);
  await page.evaluate(()=>select('earth'));
  const opened=await page.locator('#card').evaluate(el=>el.classList.contains('show'));
  await page.evaluate(()=>select('earth'));
  const toggledClosed=await page.locator('#card').evaluate(el=>!el.classList.contains('show')&&state.selected===null);
  await page.click('#b-scale'); await page.evaluate(()=>select('earth'));
  const before=await page.evaluate(()=>({earthR:world.earth.rDisp,moonR:world.earth.moons[0].r,moonOrbit:world.earth.moons[0].orbR,label:document.querySelector('#c-focus').textContent}));
  await page.click('#c-focus'); await page.waitForTimeout(100);
  const after=await page.evaluate(()=>({follow:state.follow,targetDistance:state.tgtDist,cardOpen:document.body.classList.contains('card-open'),earthR:world.earth.rDisp,moonR:world.earth.moons[0].r,moonOrbit:world.earth.moons[0].orbR}));
  const overlap=geometry.flatMap(x=>x.rows.map(r=>({...r,viewport:x.viewport}))).filter(x=>x.intersects);
  const unchanged=before.earthR===after.earthR&&before.moonR===after.moonR&&before.moonOrbit===after.moonOrbit;
  const compactControlsHidden=geometry.filter(x=>x.viewport.width<=1200).every(x=>x.topRight==='none');
  const ok=!overlap.length&&opened&&toggledClosed&&compactControlsHidden&&unchanged&&after.follow==='earth'&&!after.cardOpen&&after.targetDistance>=before.moonOrbit*2.79;
  console.log(JSON.stringify({geometry,overlap,opened,toggledClosed,compactControlsHidden,before,after,ratiosUnchanged:unchanged,ok},null,2));
  await browser.close(); if(!ok)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
