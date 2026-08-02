const { chromium } = require('playwright');
const target = process.argv[2] || process.env.EW2R3_TEST_URL || 'https://claude.rwa.bayern/ew2r3-preview/';

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page=await browser.newPage({viewport:{width:1400,height:900}});
  await page.goto(target,{waitUntil:'load'}); await page.waitForTimeout(500);
  const result=await page.evaluate(()=>{
    state.realScale=false;
    return PLANETS.map(b=>{
      const T=(state.jd-J2000)/36525;
      const a=b.el[0]+b.el[1]*T, e=b.el[2]+b.el[3]*T;
      const peri=[a*(1-e),0,0], aphe=[-a*(1+e),0,0], p=[0,0,0], q=[0,0,0];
      warpOrbitPos(peri,a,p); warpOrbitPos(aphe,a,q);
      const centre=[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2];
      const semi=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])/2;
      const focusOffset=Math.hypot(...centre);
      return {id:b.id,e,renderedE:focusOffset/semi,error:Math.abs(focusOffset/semi-e)};
    });
  });
  const failures=result.filter(x=>x.error>1e-12);
  console.log(JSON.stringify({result,maxError:Math.max(...result.map(x=>x.error)),failures},null,2));
  await browser.close(); if(failures.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
