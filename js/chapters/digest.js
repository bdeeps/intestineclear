// Chapter 4: the chemistry. In the duodenum, bile (made in the liver, stored in the gallbladder)
// and pancreatic juice (enzymes + bicarbonate) arrive through a shared opening, the major duodenal
// papilla (ampulla of Vater). Bicarbonate neutralises the stomach acid (chyme arrives at pH ≈ 2 and
// is brought to ≈ 6–7); bile salts emulsify fat into small droplets so lipase can reach it.
// Daily volumes: pancreatic juice ≈ 1 L, bile ≈ 1 L (Guyton & Hall, 14th ed., ch. 65, Table 65-1).
// Breakdown (Guyton & Hall ch. 66; NIDDK "Your Digestive System & How It Works"):
//   starch → (salivary and pancreatic amylase) → maltose and short chains → (brush-border maltase,
//   sucrase-isomaltase) → glucose; proteins → (pepsin, then trypsin, chymotrypsin) → short peptides →
//   (brush-border peptidases) → amino acids, di- and tripeptides; triglycerides → (bile emulsifies;
//   pancreatic lipase) → 2 free fatty acids + a monoglyceride, carried in micelles.
// Where things are absorbed: sugars, amino acids and fats mostly in the duodenum and jejunum; iron and
// calcium mainly in the duodenum; vitamin B12 and bile salts in the last part of the ileum.
// Meal composition per 100 g as eaten, rounded and approximate (ICMR-NIN Indian Food Composition
// Tables 2017 and USDA FoodData Central; recipes vary): whole-wheat roti, cooked dal (lentils),
// cooked white rice, paneer, ghee.
import { THREE, M, tube, clamp, lerp, smooth } from '../kit.js';
import { FlexTube, PATHS, tint, fitNarrow, compactReadout, tissue, rnd, C } from '../gut.js';

export const MEALS = {
  roti: { name: 'Roti', carb: 46, protein: 9, fat: 3, fibre: 7, note: 'Starch becomes glucose in the duodenum and jejunum. Wheat protein becomes amino acids. Its fibre goes on to feed the bacteria in the colon.' },
  dal: { name: 'Dal', carb: 20, protein: 9, fat: 0.5, fibre: 8, note: 'A good mix of protein and starch, absorbed mostly in the jejunum. Plenty of fibre reaches the colon, where bacteria ferment it.' },
  rice: { name: 'Rice', carb: 28, protein: 2.7, fat: 0.3, fibre: 0.4, note: 'Almost all starch. Its glucose is absorbed quickly, mostly in the duodenum and jejunum.' },
  paneer: { name: 'Paneer', carb: 3, protein: 18, fat: 21, fibre: 0, note: 'Protein and fat. The fat needs bile and lipase. Its calcium is absorbed mainly in the duodenum.' },
  ghee: { name: 'Ghee', carb: 0, protein: 0, fat: 99.5, fibre: 0, note: 'Almost pure fat. Without bile to break it into droplets, lipase could barely reach it. Bile salts are later recycled in the ileum.' },
};
const VIEWS = { duodenum: { pos: [-2.2, 4.5, 14.2], target: [-2.1, 3.6, 0] }, molecules: { pos: [0.3, 3.9, 12.6], target: [0.3, 3.5, 0] } };
const XA = -1.2, XB = 1.4, XE = 3.4, XS = -5.2, SPAN = 10.2;

export default {
  id: 'digest',
  short: 'Digestion',
  title: 'Chemistry in the duodenum',
  subtitle: 'Bile and pancreatic juice arrive, and big food molecules are cut into small ones.',
  view: VIEWS.duodenum,
  learn: `<p>Food is made of molecules far too big to get through the gut lining. Digestion cuts them into small pieces, mostly in the first part of the small intestine, the <b>duodenum</b>.</p>
    <p>Two juices arrive there through one small opening. <b>Bile</b>, made by the liver and stored in the gallbladder (see <b>LiverClear</b>), works like washing-up liquid: it breaks big blobs of fat into tiny droplets so enzymes can reach them. <b>Pancreatic juice</b> from the pancreas (see <b>PancreasClear</b>) carries <b>enzymes</b>, the molecular scissors, plus <b>bicarbonate</b>, which neutralises the stomach acid. Each makes about a litre a day.</p>
    <p>The scissors work in two steps. Pancreatic enzymes do the rough cutting: <b>amylase</b> chops starch, <b>trypsin</b> and others chop proteins, and <b>lipase</b> chops fats. Then enzymes fixed on the villi, in the <b>brush border</b>, do the fine cutting. In the end, <b>carbohydrates</b> become sugars like <b>glucose</b>, <b>proteins</b> become <b>amino acids</b>, and <b>fats</b> become <b>fatty acids</b> and <b>monoglycerides</b>.</p>
    <p>Most of this is absorbed in the duodenum and jejunum. A few things wait for the end: <b>vitamin B12</b> and <b>bile salts</b> are taken up in the last part of the ileum, and fibre is not digested at all, but goes on to the colon.</p>
    <p class="tip"><b>Try it:</b> pick a food and watch its molecules get cut. Then switch off bile with ghee and see the fat go through untouched.</p>`,
  terms: [
    { t: 'Enzyme', d: 'A protein that speeds up a chemical reaction, such as cutting a big food molecule into smaller ones, without being used up.' },
    { t: 'Bile', d: 'A greenish-yellow liquid made by the liver and stored in the gallbladder that breaks fat into tiny droplets.' },
    { t: 'Emulsify', d: 'To break a fat into many tiny droplets that stay spread out in water, giving enzymes more surface to work on.' },
    { t: 'Bicarbonate', d: 'A base in pancreatic juice that neutralises stomach acid.' },
    { t: 'Amylase, trypsin, lipase', d: 'Pancreatic enzymes that cut starch, proteins and fats.' },
    { t: 'Monoglyceride', d: 'Glycerol with one fatty acid still attached: what is left of a fat molecule after lipase removes two fatty acids.' },
  ],
  defaults: { scene: 'duodenum', meal: 'paneer', bile: true, enzymes: true },
  controls: [
    { key: 'scene', type: 'seg', label: 'Show', options: [{ v: 'duodenum', label: 'The duodenum' }, { v: 'molecules', label: 'The molecules' }] },
    { key: 'meal', type: 'seg', label: 'Meal', options: Object.entries(MEALS).map(([v, m]) => ({ v, label: m.name })) },
    { key: 'bile', type: 'toggle', label: 'Bile from the liver' },
    { key: 'enzymes', type: 'toggle', label: 'Pancreatic juice (enzymes and bicarbonate)' },
  ],
  quiz: [
    { q: 'What does bile do to fat?', options: ['Digests it into glucose', 'Breaks it into tiny droplets so lipase can reach it', 'Turns it into protein', 'Stores it'], answer: 1, why: 'Bile emulsifies fat, like washing-up liquid on a greasy plate. Lipase then cuts the fat molecules.' },
    { q: 'Why does the pancreas add bicarbonate?', options: ['To add flavour', 'To neutralise stomach acid', 'To make gas', 'To kill bacteria'], answer: 1, why: 'Chyme arrives acidic (about pH 2). Bicarbonate brings it near neutral, which protects the gut and suits the enzymes.' },
    { q: 'Proteins are finally broken down into…', options: ['Glucose', 'Fatty acids', 'Amino acids', 'Fibre'], answer: 2, why: 'Proteins are chains of amino acids. Trypsin and brush-border peptidases cut them into single amino acids and short pieces.' },
  ],
  reel: [
    { ms: 5200, caption: 'In the duodenum, bile from the liver and juice from the pancreas pour in through one tiny opening.', set: { scene: 'duodenum', bile: true, enzymes: true, meal: 'paneer' }, view: { pos: [0.4, 4.6, 10.4], target: [0.4, 3.7, 0] }, spin: 0.3 },
    { ms: 5600, caption: 'Enzymes cut starch into glucose, proteins into amino acids, and fats into fatty acids.', set: { scene: 'molecules', bile: true, enzymes: true, meal: 'paneer' }, view: { pos: [0.4, 2.4, 8.8], target: [0.4, 1.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const L = (h, p, parent, cls) => tint(stage.label(h, p, parent), cls);
    // ============================================== the duodenum scene
    const dg = new THREE.Group(); dg.position.set(0.6, 1.2, 0); dg.scale.setScalar(1.7); stage.root.add(dg);
    const O = new THREE.Vector3(-0.4, 0, 0);
    const shift = (p) => p.clone().sub(O);
    const duoPts = PATHS.duodenum.map(shift);
    const duo = new FlexTube(duoPts, (u) => 0.36 - 0.06 * u, tissue(C.duodenum, { opacity: 0.42, depthWrite: false }), { segs: 120, radial: 22 });
    dg.add(duo.mesh);
    const antrum = tube([[0.9, 2.5, 0.75], [0.2, 2.45, 0.7], [-0.45, 2.6, 0.55]].map((p) => shift(new THREE.Vector3(...p)).toArray()), 0.5, M.ghost(C.stomach, 0.22), false, 30);
    const pylorus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 10, 24), tissue(0xd66a60)); pylorus.position.copy(shift(new THREE.Vector3(-0.55, 2.6, 0.55))); pylorus.lookAt(pylorus.position.clone().add(new THREE.Vector3(-1, 0.1, -0.15)));
    dg.add(antrum, pylorus);
    const panc = tube([[-1.3, 0.85, -0.6], [-1.15, 1.5, -0.6], [-0.3, 1.9, -0.75], [1.2, 2.3, -0.9], [2.4, 2.65, -0.85]].map((p) => shift(new THREE.Vector3(...p)).toArray()), 0.34, tissue(C.pancreas, { opacity: 0.5, depthWrite: false }), false, 60);
    dg.add(panc);
    const AMP = shift(new THREE.Vector3(-1.52, 1.4, -0.52));
    const cbdPts = [[-1.2, 3.6, 0.1], [-1.3, 3.0, 0.0], [-1.38, 2.4, -0.35], [-1.45, 1.9, -0.55], [-1.52, 1.4, -0.52]].map((p) => shift(new THREE.Vector3(...p)));
    const pdPts = [[2.3, 2.62, -0.85], [1.2, 2.3, -0.9], [-0.3, 1.9, -0.78], [-1.05, 1.55, -0.62], [-1.52, 1.4, -0.52]].map((p) => shift(new THREE.Vector3(...p)));
    const cbd = tube(cbdPts, 0.06, tissue(C.bile, { opacity: 0.8 }), false, 40), pd = tube(pdPts, 0.05, tissue(C.enzyme, { opacity: 0.8 }), false, 40);
    const gb = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), tissue(C.gall, { opacity: 0.55, depthWrite: false })); gb.scale.set(0.28, 0.5, 0.28); gb.position.copy(shift(new THREE.Vector3(-1.85, 3.05, 0.55))); gb.rotation.z = 0.5;
    const cystic = tube([gb.position.toArray(), shift(new THREE.Vector3(-1.5, 3.1, 0.2)).toArray(), cbdPts[1].toArray()], 0.04, tissue(C.bile, { opacity: 0.8 }), false, 16);
    const papilla = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), M.glow(0xffffff)); papilla.position.copy(AMP);
    dg.add(cbd, pd, gb, cystic, papilla);
    const dLabs = [
      L('From the stomach (pylorus)', [1.4, 3.3, 0.9], dg, ''),
      L('Bile duct: from liver and gallbladder', [0.2, 3.85, 0.1], dg, 'green'),
      L('Pancreatic duct: enzymes + bicarbonate', [1.9, 2.75, -0.8], dg, 'blue'),
      L('Shared opening (papilla)', [-2.55, 1.3, -0.5], dg, 'gold'),
      L('Duodenum', [-0.4, -0.35, 0.2], dg, 'pink'),
      L('Pancreas', [2.2, 2.2, -0.9], dg, 'gold'),
    ];
    const cbdCurve = new THREE.CatmullRomCurve3(cbdPts), pdCurve = new THREE.CatmullRomCurve3(pdPts);
    const uAmp = 0.42;   // where the papilla sits along the duodenum
    const NDD = 70, dd = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), NDD);
    dd.frustumCulled = false; dd.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dg.add(dd);
    const NJ = 24, jb = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: C.bile, toneMapped: false }), NJ);
    const jp = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: C.enzyme, toneMapped: false }), NJ);
    [jb, jp].forEach((m) => { m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dg.add(m); });
    const cAcid = new THREE.Color(C.acid), cNeut = new THREE.Color(0x9be37a), col = new THREE.Color();

    // ============================================== the molecules scene
    const mg = new THREE.Group(); mg.position.set(0.4, 1.75, 0); mg.scale.setScalar(0.95); stage.root.add(mg);
    const LANES = [
      { key: 'carb', y: 1.55, a: 'Amylase', b: 'Brush border', to: 'blood', title: 'Starch → glucose', unit: new THREE.CylinderGeometry(0.15, 0.15, 0.1, 6), col: [0xffffff, 0xf2f2f2] },
      { key: 'protein', y: 0, a: 'Trypsin', b: 'Peptidases', to: 'blood', title: 'Protein → amino acids', unit: new THREE.SphereGeometry(0.13, 14, 10), col: [0x7aa2ff, 0xb18cff, 0x5ce1a9, 0xff8fa3, 0xffb547, 0x8ef0ff] },
      { key: 'fat', y: -1.55, a: 'Bile', b: 'Lipase', to: 'lymph', title: 'Fat → fatty acids + monoglyceride', unit: new THREE.SphereGeometry(0.13, 14, 10), col: [0xffd166] },
    ];
    const needBile = (s) => s.bile, needEnz = (s) => s.enzymes;
    const laneObjs = LANES.map((ln) => {
      const lg = new THREE.Group(); lg.position.y = ln.y; mg.add(lg);
      // A faint rail and the two enzyme stations.
      const rail = new THREE.Mesh(new THREE.BoxGeometry(SPAN, 0.02, 0.02), M.ghost(0xffffff, 0.15)); rail.position.set(XS + SPAN / 2, -0.35, 0); lg.add(rail);
      const station = (x, color) => {
        const g = new THREE.Group(); g.position.set(x, 0.62, 0);
        const top = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.plastic(color)); top.rotation.x = Math.PI;
        const bot = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.plastic(color));
        const jawT = new THREE.Group(), jawB = new THREE.Group(); jawT.add(bot); jawB.add(top); g.add(jawT, jawB); lg.add(g);
        return { g, jawT, jawB };
      };
      const colA = ln.key === 'fat' ? C.bile : C.enzyme, colB = ln.key === 'fat' ? C.enzyme : 0xff8fa3;
      const sA = station(XA, colA), sB = station(XB, colB);
      const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.6, 20, 1, true), M.glow(ln.to === 'blood' ? C.artery : C.lacteal, { transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
      vessel.rotation.x = Math.PI / 2; vessel.position.set(XE + 0.9, -0.7, 0); lg.add(vessel);
      const mats = ln.col.map((c) => M.plastic(c, { transparent: true }));
      const mols = [0, 1, 2].map(() => {
        const g = new THREE.Group(); lg.add(g);
        const units = [0, 1, 2, 3, 4, 5].map((j) => { const m = new THREE.Mesh(ln.unit, mats[j % mats.length]); if (ln.key === 'carb') m.rotation.x = Math.PI / 2; g.add(m); return m; });
        const coats = ln.key === 'fat' ? units.map(() => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 8), M.ghost(C.bile, 0.35)); g.add(c); return c; }) : [];
        const blob = ln.key === 'fat' ? new THREE.Mesh(new THREE.SphereGeometry(0.46, 20, 14), M.plastic(C.fat, { transparent: true, opacity: 0.55 })) : null;
        if (blob) g.add(blob);
        const links = ln.key !== 'fat' ? [0, 1, 2, 3, 4].map(() => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), M.matte(0xcfd6e4)); b.rotation.z = Math.PI / 2; g.add(b); return b; }) : [];
        return { g, units, coats, blob, links, mats };
      });
      const labs = [L(`<b>${ln.title}</b>`, [XS + 1.0, 0.62, 0], lg, ln.key === 'fat' ? 'fat' : ln.key === 'carb' ? '' : 'blue'), L(ln.a, [XA + 0.95, 0.62, 0], lg, ln.key === 'fat' ? 'green' : 'blue'), L(ln.b, [XB + 0.95, 0.62, 0], lg, ln.key === 'fat' ? 'blue' : 'pink'), L(ln.to === 'blood' ? 'Into blood' : 'Into lymph', [XE + 1.0, 0.62, 0.3], lg, ln.to === 'blood' ? 'red' : 'fat')];
      return { ln, lg, sA, sB, mols, labs };
    });

    let t = 0, lastScene = null;
    const fit = fitNarrow(stage, { pos: [0.4, 5.1, 15.5], target: [0.4, 4.5, 0] });
    const o = new THREE.Object3D(), p = new THREE.Vector3();
    const phUnits = (s) => (s.enzymes ? 6.5 : 2.5);
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        if (s.scene !== lastScene) { if (lastScene !== null) stage.setView(VIEWS[s.scene].pos, VIEWS[s.scene].target, 0.9); lastScene = s.scene; }
        const narrow = fit();
        dg.visible = s.scene === 'duodenum'; mg.visible = s.scene === 'molecules';
        dLabs.forEach((l, i) => { l.visible = dg.visible && (!narrow || i >= 3 && i <= 4); });
        laneObjs.forEach((lo) => lo.labs.forEach((l, i) => { l.visible = mg.visible && (!narrow || i === 0); }));
        if (dg.visible) {
          // Chyme: acidic orange until the papilla, then neutral green if bicarbonate arrives.
          for (let i = 0; i < NDD; i++) {
            const u = (t * 0.05 + i / NDD) % 1; duo.at(u, p);
            const a = rnd(i) * 6.28, r = 0.16 * rnd(i + 7);
            o.position.set(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, p.z + Math.cos(a * 1.3) * r); o.scale.setScalar(1); o.updateMatrix(); dd.setMatrixAt(i, o.matrix);
            const k = s.enzymes ? smooth((u - uAmp) / 0.18) : 0.15 * smooth((u - uAmp) / 0.18);
            col.copy(cAcid).lerp(cNeut, k); dd.setColorAt(i, col);
          }
          dd.instanceMatrix.needsUpdate = true; dd.instanceColor.needsUpdate = true;
          [[jb, cbdCurve, s.bile], [jp, pdCurve, s.enzymes]].forEach(([m, cv, on]) => {
            m.visible = on;
            if (!on) return;
            for (let i = 0; i < NJ; i++) { const u = (t * 0.12 + i / NJ) % 1; cv.getPointAt(u, p); o.position.copy(p); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
            m.instanceMatrix.needsUpdate = true;
          });
        }
        if (mg.visible) {
          const meal = MEALS[s.meal], mx = Math.max(meal.carb, meal.protein, meal.fat);
          laneObjs.forEach((lo) => {
            const key = lo.ln.key, g = meal[key], n = g < 1.5 ? 0 : Math.max(1, Math.round((3 * g) / mx));
            const cutA = key === 'fat' ? needBile(s) : needEnz(s), cutB = key === 'fat' ? needEnz(s) && needBile(s) : needEnz(s);
            // Chomp when a molecule is near a station.
            let nearA = 0, nearB = 0;
            lo.mols.forEach((m, i) => {
              m.g.visible = i < n;
              if (!m.g.visible) return;
              const x = XS + ((t * 0.85 + i * (SPAN / 3)) % SPAN);
              if (Math.abs(x - XA) < 0.6) nearA = 1; if (Math.abs(x - XB) < 0.6) nearB = 1;
              const k1 = cutA ? smooth((x - XA) / 0.7) : 0, k2 = cutA && cutB ? smooth((x - XB) / 0.7) : 0;
              const absorbed = key === 'fat' ? k2 : key === 'protein' || key === 'carb' ? k2 : 0;
              const k3 = absorbed > 0.99 ? smooth((x - XE) / 0.9) : 0;
              m.g.position.set(x, 0, 0);
              m.units.forEach((u, j) => {
                let dx, dy = 0, dz = 0, sc = [1, 1, 1];
                if (key === 'fat') {
                  const a = j * 1.047, cl = 0.16;
                  const packed = [Math.cos(a) * cl, Math.sin(a) * cl, (j % 2 ? 0.1 : -0.1)];
                  const spread = [(j - 2.5) * 0.36, Math.sin(j * 2.1) * 0.12, 0];
                  dx = lerp(packed[0], spread[0], k1); dy = lerp(packed[1], spread[1], k1); dz = lerp(packed[2], spread[2], k1);
                  // Lipase: each droplet's fat becomes rods (fatty acids) and one small ball (monoglyceride).
                  const rod = j % 3 !== 2; sc = rod ? [lerp(1, 2.2, k2), lerp(1, 0.35, k2), lerp(1, 0.35, k2)] : [1, 1, 1];
                  if (m.coats[j]) { m.coats[j].position.set(dx, dy, dz); m.coats[j].visible = k1 > 0.05 && k2 < 0.95; m.coats[j].scale.setScalar(k1); }
                } else {
                  dx = (j - 2.5) * 0.3 + (Math.floor(j / 2) - 1) * 0.42 * k1 + (j % 2 ? 0.22 : -0.22) * k2;
                }
                dy -= k3 * 0.9; dx += k3 * 0.6;
                u.position.set(dx, dy, dz); u.scale.set(...sc); u.visible = k3 < 0.98;
              });
              m.links.forEach((b, j) => {
                const a = m.units[j].position, c = m.units[j + 1].position, gap = c.x - a.x;
                const cut = (j % 2 === 1 && k1 > 0.3) || k2 > 0.3;
                b.visible = !cut; b.position.set((a.x + c.x) / 2, (a.y + c.y) / 2, 0); b.scale.y = Math.max(0.1, gap / 0.2);
              });
              if (m.blob) { m.blob.visible = k1 < 0.4; m.blob.scale.setScalar(1 - k1); }
            });
            const ch = (st, near, on) => { const a = on ? (near ? 0.35 + 0.35 * Math.abs(Math.sin(t * 9)) : 0.25) : 0.05; st.jawT.rotation.z = a; st.jawB.rotation.z = -a; st.g.visible = on; };
            ch(lo.sA, nearA, cutA); ch(lo.sB, nearB, key === 'fat' ? s.enzymes : s.enzymes);
            lo.labs[1].visible = lo.labs[1].visible && cutA; lo.labs[2].visible = lo.labs[2].visible && (key === 'fat' ? s.enzymes : s.enzymes);
          });
        }
      },
      readout: (s) => {
        if (s.scene === 'duodenum') {
          const ph = phUnits(s);
          return `<div class="big">Chyme leaves at about pH ${ph}</div>
            <div class="row"><span>Arrives from the stomach</span><b>about pH 2 (acid)</b></div>
            <div class="row"><span>Bile per day</span><b>${s.bile ? 'about 1 litre' : 'switched off'}</b></div>
            <div class="row"><span>Pancreatic juice per day</span><b>${s.enzymes ? 'about 1 litre' : 'switched off'}</b></div>
            <small>${s.enzymes ? 'Orange: acidic chyme. Green: neutralised by bicarbonate after the shared opening.' : 'Without bicarbonate the chyme stays acidic, and without enzymes most food can’t be broken down.'}</small>`;
        }
        const m = MEALS[s.meal];
        const warn = !s.enzymes ? 'No pancreatic enzymes: the big molecules pass through uncut.' : !s.bile && m.fat > 2 ? 'No bile: the fat stays in big blobs and lipase can barely reach it.' : m.note;
        return `<div class="big">${m.name}: what 100 g gives</div>
          <div class="row"><span>Carbohydrate → glucose</span><b>about ${m.carb} g</b></div>
          <div class="row"><span>Protein → amino acids</span><b>about ${m.protein} g</b></div>
          <div class="row"><span>Fat → fatty acids + monoglycerides</span><b>about ${m.fat} g</b></div>
          <div class="row"><span>Fibre → on to the colon</span><b>about ${m.fibre} g</b></div>
          <small>${warn} Figures are rough, from Indian and US food tables; recipes vary.</small>`;
      },
    });
  },
};
