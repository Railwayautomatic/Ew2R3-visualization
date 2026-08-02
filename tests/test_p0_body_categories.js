const { chromium } = require('playwright');
const target = process.argv[2] || 'https://claude.rwa.bayern/ew2r3-preview/';
const onlyCase = process.argv[3] || '';

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const cases=[
    {name:'sun-earth',first:'sun',second:'earth'},
    {name:'earth-moon',first:'earth',second:'earth/Moon'},
    {name:'moon-earth',first:'earth/Moon',second:'earth'}
  ].filter(c=>!onlyCase||c.name===onlyCase);
  const viewports=[{name:'desktop',width:1360,height:900},{name:'mobile',width:390,height:844}];
  const results=[],errors=[];
  for(const vp of viewports){
    const page=await browser.newPage({viewport:{width:vp.width,height:vp.height}});
    await page.addInitScript(() => localStorage.setItem('ew2r3:analytics-consent', 'denied'));
    page.on('pageerror',e=>errors.push(vp.name+': '+e.message));
    await page.goto(target,{waitUntil:'load'}); await page.waitForTimeout(600);
    page.setDefaultTimeout(3000);
    await page.click('#btn-field'); await page.waitForTimeout(150);
    // Фіксуємо також орбітальний час: інакше цільовий центр пари
    // планета-супутник безперервно рухається і камера навмисно його переслідує.
    await page.evaluate(()=>{state.running=false});
    for(const c of cases){
      for(const realScale of [false,true]){
        for(const range of ['near','full']){
          await page.evaluate(({c,realScale,range})=>{
            // Direct DOM events test the app logic without Playwright waiting for
            // visual "stability" of controls over a continuously animated canvas.
            if(state.realScale!==realScale) $('b-scale').click();
            const first=$('f-body'); first.value=c.first;
            first.dispatchEvent(new Event('change',{bubbles:true}));
            const second=$('f-body2'); second.value=c.second;
            second.dispatchEvent(new Event('change',{bubbles:true}));
            $(range==='full'?'f-rng-full':'f-rng-near').click();
            FIELD.running=false;
          },{c,realScale,range});
          // Перевіряємо усталений кадр після плавного перельоту камери, а не
          // проміжний кадр анімації. Падіння нижче все одно лишається реальним,
          // якщо цільові тіла не потрапили в кадр після збіжності.
          // Константа згладжування камери дає <0,4% початкової похибки
          // приблизно за 0,9 с. Абсолютний поріг тут некоректний для масштабів
          // від часток одиниці до сотень сценних одиниць.
          await page.waitForTimeout(1600);
          results.push(await page.evaluate(({vp,c,realScale,range})=>{
            const labelId=id=>{if(!id.includes('/'))return id;const m=MOON_BODIES.find(x=>x.id===id);return m.parent.id+'_m'+m.parent.moons.indexOf(m.moonRef)};
            const visible=id=>{const el=labelEls[labelId(id)];return !!el&&getComputedStyle(el).display!=='none'};
            const anchorScreen=id=>{const b=anyBody(id);return b?project(fieldAnchor(b).pos):null};
            const anchorPos=id=>{const b=anyBody(id);return b?Array.from(fieldAnchor(b).pos):null};
            const panel=$('fpanel').getBoundingClientRect(),eq=$('eqbar').getBoundingClientRect();
            const intersects=!(panel.right<=eq.left||panel.left>=eq.right||panel.bottom<=eq.top||panel.top>=eq.bottom);
            const b1=anyBody(c.first),b2=anyBody(c.second);
            const linked=!!b1&&!!b2&&((b1.kind==='moon'&&b1.parent.id===b2.id)||(b2.kind==='moon'&&b2.parent.id===b1.id));
            return {viewport:vp.name,case:c.name,first:c.first,second:c.second,realScale,range,
              body:FIELD.body,secondBody:FIELD2.body,ready:FIELD.ready&&FIELD2.ready,
              finite:Array.from(FIELD.pos).every(Number.isFinite)&&Array.from(FIELD2.pos).every(Number.isFinite),
              firstLabel:visible(c.first),secondLabel:visible(c.second),panelEqOverlap:intersects,
              secondLabelExpected:linked||range==='full',
              firstScreen:anchorScreen(c.first),secondScreen:anchorScreen(c.second),
              firstPos:anchorPos(c.first),secondPos:anchorPos(c.second),
              panelShown:$('fpanel').classList.contains('show'),fieldActive:$('btn-field').classList.contains('on'),
              camera:{center:state.center.slice(),target:state.tgtCenter.slice(),dist:state.camDist,targetDist:state.tgtDist},
              scaleButtonVisible:getComputedStyle($('b-scale')).display!=='none'};
          },{vp,c,realScale,range}));
        }
      }
    }
    await page.close();
  }
  const failed=results.filter(r=>r.body!==r.first||r.secondBody!==r.second||!r.ready||!r.finite||!r.firstLabel||(r.secondLabelExpected&&!r.secondLabel)||r.panelEqOverlap||!r.panelShown||!r.fieldActive);
  console.log(JSON.stringify({target,scenarios:results.length,passed:results.length-failed.length,failed,errors},null,2));
  await Promise.race([browser.close(),new Promise(r=>setTimeout(r,2000))]);
  process.exit(failed.length||errors.length?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
