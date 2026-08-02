const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');

(async () => {
  const html = path.resolve(__dirname, '..', 'deployment-artifacts', '2026-07-31', 'claude-staging-site', 'index.html');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1565, height: 1100 } });
  await page.goto(process.env.EW2R3_TEST_URL || pathToFileURL(html).href, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  await page.evaluate(() => select('sun'));
  await page.waitForTimeout(250);
  const overlap = await page.evaluate(() => {
    const card = document.querySelector('#card').getBoundingClientRect();
    const ids = ['eqbar','noMass','dimline','kepler','gfix'];
    return ids.map(id => {
      const r = document.querySelector('#'+id).getBoundingClientRect();
      const intersects = !(r.right <= card.left || r.left >= card.right || r.bottom <= card.top || r.top >= card.bottom);
      return { id, left:r.left, right:r.right, cardLeft:card.left, intersects };
    });
  });

  await page.click('#b-scale');
  await page.waitForTimeout(300);
  const scale = await page.evaluate(() => {
    updatePositions();
    const bodies = BODIES.map(b => ({
      id:b.id,
      rendered:world[b.id].rDisp,
      expected:(b.radiusKm*1000/AU)*AU_UNITS,
      relErr:Math.abs(world[b.id].rDisp-(b.radiusKm*1000/AU)*AU_UNITS)/((b.radiusKm*1000/AU)*AU_UNITS)
    }));
    const moons=[];
    BODIES.forEach(b => (b.moons||[]).forEach((m,k) => {
      const w=world[b.id].moons[k];
      const expectedOrbit=(m.aKm*1000/AU)*AU_UNITS;
      const expectedRadius=(m.rKm*1000/AU)*AU_UNITS;
      moons.push({id:b.id+'/'+m.name.en,orbit:w.orbR,expectedOrbit,radius:w.r,expectedRadius,
        orbitRelErr:Math.abs(w.orbR-expectedOrbit)/expectedOrbit,
        radiusRelErr:Math.abs(w.r-expectedRadius)/expectedRadius});
    }));
    return {realScale:state.realScale,bodies,moons};
  });

  const failedOverlap = overlap.filter(x => x.intersects);
  const failedBodies = scale.bodies.filter(x => x.relErr > 1e-12);
  const failedMoons = scale.moons.filter(x => x.orbitRelErr > 1e-12 || x.radiusRelErr > 1e-12);
  console.log(JSON.stringify({ overlap, realScale:scale.realScale,
    maxBodyRelErr:Math.max(...scale.bodies.map(x=>x.relErr)),
    maxMoonOrbitRelErr:Math.max(...scale.moons.map(x=>x.orbitRelErr)),
    maxMoonRadiusRelErr:Math.max(...scale.moons.map(x=>x.radiusRelErr)),
    sunRadius:scale.bodies.find(x=>x.id==='sun'),
    earthRadius:scale.bodies.find(x=>x.id==='earth'),
    failures:{overlap:failedOverlap,bodies:failedBodies,moons:failedMoons}
  }, null, 2));
  await browser.close();
  if (failedOverlap.length || failedBodies.length || failedMoons.length || !scale.realScale) process.exit(1);
})().catch(err => { console.error(err); process.exit(1); });
