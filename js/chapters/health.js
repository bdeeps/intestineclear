// Chapter 6: keeping the intestines healthy, and what goes wrong. General facts only, never advice.
// Diarrhoea and ORS: WHO fact sheet "Diarrhoeal disease" (2024): about 443,832 deaths a year in
// children under 5; ORS is clean water, salt and sugar, costs a few cents, and is absorbed in the small
// intestine; zinc shortens episodes by about 25% and cuts stool volume by about 30%. WHO/UNICEF
// low-osmolarity ORS per litre: sodium chloride 2.6 g, glucose (anhydrous) 13.5 g, potassium chloride
// 1.5 g, trisodium citrate dihydrate 2.9 g; 245 mOsm/L (WHO/UNICEF joint statement, 2004). It works
// because sodium and glucose are carried into lining cells together (SGLT1, the co-transport described
// by Robert Crane in 1960), and water follows by osmosis; this route keeps working in cholera, whose
// toxin makes the cells pour chloride and water out (Field, NEJM 1974; Guyton & Hall ch. 67).
// Lactose: lactase on the brush border splits lactose into glucose + galactose; with little lactase,
// lactose reaches the colon, where bacteria ferment it (gas) and it draws in water. Worldwide about
// 68% of people have lactose malabsorption (Storhaug, Fosse & Fadnes, Lancet Gastroenterol Hepatol
// 2:738, 2017). India: one study found 66% in northern and 88% in southern volunteers (Babu et al.,
// Am J Clin Nutr 91:140, 2010). Malabsorption does not always cause symptoms.
// Coeliac disease: an immune reaction to gluten flattens villi. About 1.4% of people worldwide have
// positive blood tests and 0.7% biopsy-confirmed disease (Singh et al., Clin Gastroenterol Hepatol
// 16:823, 2018); about 1% in a north Indian community study (Makharia et al., J Gastroenterol Hepatol
// 26:894, 2011). With flat villi we scale the villus multiplier (×6.5, Helander & Fändriks 2014)
// with villus height, a rough guide to the lost area.
// Appendicitis: lifetime risk ≈ 8.6% in men and 6.7% in women in the USA (Addiss et al., Am J
// Epidemiol 132:910, 1990); pain often starts around the navel and moves to the lower right (NHS).
import { THREE, M, tube, box, clamp, lerp } from '../kit.js';
import { FlexTube, PATHS, tint, fitNarrow, compactReadout, tissue, rnd, makeCells, villusGeometry, haustra, C } from '../gut.js';

const VIEWS = {
  ors: { pos: [-1.2, 5.0, 13.6], target: [-1.2, 3.6, 0] },
  lactose: { pos: [-1.0, 5.0, 13.8], target: [-1.0, 3.6, 0] },
  coeliac: { pos: [-1.2, 6.4, 12.2], target: [-1.2, 3.3, 0] },
  appendix: { pos: [-1.0, 4.4, 12.4], target: [-1.0, 3.7, 0] },
};
export const areaWithVilli = (h) => 30 * (1 + 5.5 * h) / 6.5;    // h: villus height, 1 = healthy

export default {
  id: 'health',
  short: 'Healthy gut',
  title: 'Keeping it healthy, and what goes wrong',
  subtitle: 'Fibre and water, diarrhoea and ORS, milk sugar, gluten and the appendix.',
  view: VIEWS.ors,
  learn: `<p>This chapter shares general facts, not medical advice. If you are worried about your own gut, <b>talk to a doctor</b>.</p>
    <p><b>Fibre and water.</b> Fibre from whole grains, dal, vegetables and fruit keeps stool soft and bulky and feeds your gut bacteria. The WHO advises adults to eat at least 25 g a day. Enough water helps too.</p>
    <p><b>Diarrhoea</b> is when the gut pours out more water than it takes back, often because of an infection. The danger is <b>dehydration</b>: losing water and salts. It still kills about 440,000 children under five each year. The fix is surprisingly simple: <b>oral rehydration solution (ORS)</b>, a measured mix of clean water, salt and sugar. Sugar and sodium are carried into the lining cells together, and water follows them back in, even during cholera. ORS was proven in the 1960s and 70s in Dhaka and Kolkata, and in 1971 the Indian doctor <b>Dilip Mahalanabis</b> used it to save thousands of refugees in camps in West Bengal. <b>The Lancet</b> later called it potentially the most important medical advance of the 20th century. Zinc helps too. A doctor should see anyone very drowsy, not drinking, with blood in their stool, or a baby with diarrhoea.</p>
    <p><b>Lactose intolerance.</b> Milk sugar, lactose, needs the enzyme <b>lactase</b>. Most people worldwide make less of it after childhood, which is normal. Undigested lactose goes to the colon, where bacteria ferment it, and that can cause gas, bloating and loose stools.</p>
    <p><b>Coeliac disease</b> (about 1 in 100 people) is an immune reaction to <b>gluten</b>, a protein in wheat, barley and rye, that flattens the villi. <b>Appendicitis</b> is an inflamed appendix: pain often starts near the navel and moves to the lower right. It needs a doctor urgently. <b>Probiotics</b> (live "good" bacteria) are widely sold; the evidence varies a lot by product and condition, and many claims are not proven.</p>
    <p class="tip"><b>Try it:</b> switch on cholera and watch water pour out, then add ORS and see it pulled back in.</p>`,
  terms: [
    { t: 'Dehydration', d: 'When the body loses more water and salts than it takes in. Severe dehydration is an emergency.' },
    { t: 'ORS', d: 'Oral rehydration solution: water with a measured amount of salts and sugar that the gut can absorb even during diarrhoea.' },
    { t: 'Lactase', d: 'The brush-border enzyme that splits lactose (milk sugar) into glucose and galactose.' },
    { t: 'Coeliac disease', d: 'An immune reaction to gluten that damages the villi of the small intestine.' },
    { t: 'Appendicitis', d: 'Inflammation of the appendix, usually needing urgent medical care.' },
    { t: 'Probiotic', d: 'Live microbes eaten in the hope of a health benefit. Evidence differs by product and condition.' },
  ],
  defaults: { scene: 'ors', cholera: true, ors: false, lactase: 'plenty', damage: 0.7, inflamed: true },
  controls: [
    { key: 'scene', type: 'seg', label: 'Show', options: [{ v: 'ors', label: 'Diarrhoea & ORS' }, { v: 'lactose', label: 'Lactose' }, { v: 'coeliac', label: 'Coeliac' }, { v: 'appendix', label: 'Appendix' }] },
    { key: 'cholera', type: 'toggle', label: 'Diarrhoea: toxin makes the lining pour out water' },
    { key: 'ors', type: 'toggle', label: 'Give ORS (salt + sugar + water)' },
    { key: 'lactase', type: 'seg', label: 'Lactase on the brush border', options: [{ v: 'plenty', label: 'Plenty' }, { v: 'little', label: 'Little' }] },
    { key: 'damage', type: 'range', label: 'Coeliac: villi flattened by gluten reaction', min: 0, max: 1, step: 0.01, ends: ['healthy', 'flat'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'inflamed', type: 'toggle', label: 'Appendix inflamed' },
  ],
  quiz: [
    { q: 'Why does ORS contain sugar as well as salt?', options: ['For taste only', 'Sugar and sodium are absorbed together, and water follows', 'Sugar kills germs', 'To give energy to bacteria'], answer: 1, why: 'Lining cells carry glucose and sodium in together. Water follows by osmosis, and this keeps working even during cholera.' },
    { q: 'What happens to lactose if you make little lactase?', options: ['It is stored in the liver', 'It reaches the colon, where bacteria ferment it', 'It turns into fat', 'Nothing at all'], answer: 1, why: 'Undigested lactose reaches the colon. Bacteria ferment it, making gas, and it draws water in.' },
    { q: 'What does coeliac disease do to the small intestine?', options: ['Makes it longer', 'Flattens the villi, shrinking the absorbing surface', 'Blocks the appendix', 'Adds more bacteria'], answer: 1, why: 'An immune reaction to gluten damages the villi, so less food can be absorbed.' },
  ],
  reel: [
    { ms: 5800, caption: 'In diarrhoea the gut pours out water. ORS, just salt, sugar and water, pulls it back in.', set: { scene: 'ors', cholera: true }, anim: { ors: [false, true] }, view: { pos: [0.4, 4.6, 11.4], target: [0.5, 3.4, 0] }, spin: 0.2 },
  ],

  build({ stage }) {
    const L = (h, p, parent, cls) => tint(stage.label(h, p, parent), cls);
    // ============================================== ORS: lining cells between gut and blood
    const og = new THREE.Group(); og.position.set(0.6, 2.2, 0); stage.root.add(og);
    const cellsO = makeCells(6); og.add(cellsO.grp);
    const lumen = box(8.2, 1.9, 1.6, M.ghost(0x6fb7ff, 0.07)); lumen.position.y = cellsO.top + 1.0; og.add(lumen);
    const blood = tube([[-4.2, cellsO.bottom - 0.5, 0], [4.2, cellsO.bottom - 0.5, 0]], 0.32, M.glow(C.artery, { transparent: true, opacity: 0.5 }), false, 8); og.add(blood);
    const NW = 70, wdrop = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), M.glow(C.water), NW);
    const NI = 36, na = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), M.glow(0xc49bff), NI), gl = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 6), M.glow(0xffffff), NI), cl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), M.glow(0x9be37a), NI);
    [wdrop, na, gl, cl].forEach((m) => { m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); og.add(m); });
    const oLabs = [L('Inside the gut', [-3.2, cellsO.top + 1.6, 0.8], og, 'blue'), L('Lining cells', [-4.6, 0, 0.6], og, 'pink'), L('Blood', [-4.3, cellsO.bottom - 0.5, 0.4], og, 'red'), L('', [2.4, cellsO.top + 1.6, 0.8], og, 'gold')];

    // ============================================== Lactose: brush border, then the colon
    const lg = new THREE.Group(); lg.position.set(0.8, 2.0, 0); stage.root.add(lg);
    const cellsL = makeCells(3); cellsL.grp.position.x = -2.6; lg.add(cellsL.grp);
    const colonBox = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.6, 1.6), tissue(C.colon, { opacity: 0.18, depthWrite: false })); colonBox.position.set(2.6, 0.4, 0); lg.add(colonBox);
    const arrow = tube([[-0.4, cellsL.top + 0.9, 0], [0.5, cellsL.top + 0.9, 0], [1.2, 1.5, 0]], 0.03, M.ghost(0xffffff, 0.35), false, 20); lg.add(arrow);
    const lactase = [];
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0.5, Math.PI * 2 - 1), M.plastic(0xff8fa3)); m.rotation.z = Math.PI / 2; m.position.set(-4.3 + i * 0.68, cellsL.top + 0.1, 0.4); lg.add(m); lactase.push(m); }
    const NLc = 16, lacA = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 6), M.glow(0xffffff), NLc), lacB = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 6), M.glow(0xffd166), NLc);
    const NBa = 60, bac = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.05, 0.16, 4, 8), M.plastic(0x5ce1a9), NBa), NG = 30, gas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 12, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, roughness: 0.1 }), NG);
    [lacA, lacB, bac, gas].forEach((m) => { m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); lg.add(m); });
    const lLabs = [L('Small intestine lining', [-2.6, -2.1, 0.8], lg, 'pink'), L('Lactase enzymes', [-5.0, cellsL.top + 0.2, 0.4], lg, 'pink'), L('Colon: bacteria ferment it', [2.6, 3.0, 0.8], lg, 'brown'), L('Lactose = glucose + galactose', [-2.6, -2.65, 0.8], lg, 'gold')];

    // ============================================== Coeliac: a patch of villi
    const cg = new THREE.Group(); cg.position.set(0.6, 1.9, 0); stage.root.add(cg);
    const baseC = box(7.4, 0.6, 3.4, tissue(0xd98a86)); baseC.position.y = -0.3; cg.add(baseC);
    const vg = villusGeometry(2.2, 0.3), vm = tissue(0xf2a9a0, { roughness: 0.6 }), villi = [];
    for (let a = 0; a < 9; a++) for (let b = 0; b < 4; b++) { const v = new THREE.Mesh(vg, vm); v.position.set(-3.3 + a * 0.82 + (b % 2) * 0.41, 0, -1.2 + b * 0.8); v.userData.h = 0.85 + 0.3 * rnd(a * 4 + b); cg.add(v); villi.push(v); }
    const immune = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 10, 8), M.glow(0xb18cff), 50); immune.frustumCulled = false; immune.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cg.add(immune);
    const cLabs = [L('Villi', [3.2, 2.5, 0.2], cg, 'pink'), L('Immune cells gather in the lining', [2.0, -0.95, 1.8], cg, '')];

    // ============================================== Appendix: caecum, ileum end, appendix
    const ag = new THREE.Group(); ag.position.set(2.8, 4.4, 0); ag.scale.setScalar(1.05); stage.root.add(ag);
    const cae = new FlexTube(PATHS.colon.slice(0, 5), (u, s) => haustra(lerp(0.95, 0.72, u), s), tissue(C.colon), { segs: 80, radial: 20 });
    const ile = new FlexTube([[-0.6, -2.7, 0.6], [-1.2, -2.5, 0.45], [-1.7, -2.15, 0.25], [-2.05, -2.05, 0.1]], () => 0.26, tissue(C.ileum), { segs: 30, radial: 14 });
    let appR = 1;
    const appM = tissue(C.appendix);
    const app = new FlexTube(PATHS.appendix, (u) => 0.12 * appR * (1 - 0.3 * u) * (u > 0.2 ? 1 : lerp(1 / appR, 1, u / 0.2)), appM, { segs: 30, radial: 12 });
    [cae, ile, app].forEach((x) => ag.add(x.mesh));
    const aLabs = [L('Caecum', [-3.9, -2.2, 0.3], ag, 'brown'), L('Appendix', [-1.0, -4.3, 0.2], ag, 'red'), L('End of the ileum', [-0.4, -2.2, 0.8], ag, 'pink'), L('Ascending colon', [-1.5, 0.9, -0.2], ag, 'brown')];
    const cHealthy = new THREE.Color(C.appendix), cInfl = new THREE.Color(0xff3b30);

    let t = 0, lastScene = null, net = 0, dmg = 0.7;
    const o = new THREE.Object3D();
    const fit = fitNarrow(stage, { pos: [0.5, 4.8, 15.5], target: [0.5, 3.9, 0] });
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        if (s.scene !== lastScene) { if (lastScene !== null) stage.setView(VIEWS[s.scene].pos, VIEWS[s.scene].target, 0.9); lastScene = s.scene; }
        const narrow = fit();
        og.visible = s.scene === 'ors'; lg.visible = s.scene === 'lactose'; cg.visible = s.scene === 'coeliac'; ag.visible = s.scene === 'appendix';
        oLabs.forEach((l, i) => { l.visible = og.visible && (!narrow || i === 3); });
        lLabs.forEach((l, i) => { l.visible = lg.visible && (!narrow || i === 2); });
        cLabs.forEach((l) => { l.visible = cg.visible && !narrow; });
        aLabs.forEach((l, i) => { l.visible = ag.visible && (!narrow || i === 1); });
        if (og.visible) {
          // Net water: out with the toxin, back in with ORS (the pictures are illustrative).
          const target = (s.cholera ? -1 : 0.35) + (s.ors ? 1.3 : 0);
          net += (target - net) * Math.min(1, dt * 2);
          for (let i = 0; i < NW; i++) {
            const x = (rnd(i) - 0.5) * 7.4, z = (rnd(i + 3) - 0.5) * 1.0, ph = (t * 0.35 + rnd(i + 7)) % 1;
            const yTop = cellsO.top + 1.5, yBot = cellsO.bottom - 0.5;
            const y = net >= 0 ? lerp(yTop, yBot, ph) : lerp(yBot, yTop, ph);
            o.position.set(x, y, z); o.scale.setScalar(i < Math.round(NW * clamp(Math.abs(net), 0.15, 1)) ? 1 : 0); o.updateMatrix(); wdrop.setMatrixAt(i, o.matrix);
          }
          wdrop.instanceMatrix.needsUpdate = true;
          for (let i = 0; i < NI; i++) {
            const x = (rnd(i + 20) - 0.5) * 7.4, ph = (t * 0.3 + rnd(i + 30)) % 1, y = lerp(cellsO.top + 1.4, cellsO.bottom - 0.5, ph);
            o.position.set(x, y, 0.2); o.scale.setScalar(s.ors ? 1 : 0); o.updateMatrix(); na.setMatrixAt(i, o.matrix);
            o.position.set(x + 0.2, y, 0.2); o.rotation.x = Math.PI / 2; o.updateMatrix(); gl.setMatrixAt(i, o.matrix); o.rotation.set(0, 0, 0);
            o.position.set(x - 0.3, lerp(cellsO.bottom, cellsO.top + 1.4, ph), -0.2); o.scale.setScalar(s.cholera ? 1 : 0); o.updateMatrix(); cl.setMatrixAt(i, o.matrix);
          }
          [na, gl, cl].forEach((m) => { m.instanceMatrix.needsUpdate = true; });
          oLabs[3].element.innerHTML = net < -0.05 ? '<b>Water pouring out: dehydration risk</b>' : s.ors ? '<b>Sodium + glucose go in; water follows</b>' : '<b>Water being absorbed</b>';
        }
        if (lg.visible) {
          const plenty = s.lactase === 'plenty';
          lactase.forEach((m, i) => { m.visible = plenty || i % 3 === 0; m.rotation.x = 0.4 * Math.sin(t * 8 + i); });
          for (let i = 0; i < NLc; i++) {
            const ph = (t * 0.2 + i / NLc) % 1, split = plenty || i % 3 === 0, x0 = -4.4 + (i % 6) * 0.68;
            let a, b;
            if (ph < 0.35) { const y = lerp(cellsL.top + 1.6, cellsL.top + 0.35, ph / 0.35); a = [x0 - 0.13, y, 0.4]; b = [x0 + 0.13, y, 0.4]; }
            else if (split) { const k = (ph - 0.35) / 0.65, y = lerp(cellsL.top + 0.2, cellsL.bottom - 0.2, k); a = [x0 - 0.13 - k * 0.3, y, 0.2]; b = [x0 + 0.13 + k * 0.3, y, 0.2]; }
            else { const k = (ph - 0.35) / 0.65, p = k < 0.5 ? [lerp(x0, 1.0, k * 2), cellsL.top + 0.9 + k, 0.3] : [lerp(1.0, 2.4 + (i % 4) * 0.3, (k - 0.5) * 2), lerp(cellsL.top + 1.4, 0.2, (k - 0.5) * 2), 0.2]; a = [p[0] - 0.13, p[1], p[2]]; b = [p[0] + 0.13, p[1], p[2]]; }
            o.rotation.set(Math.PI / 2, 0, 0); o.scale.setScalar(1);
            o.position.set(...a); o.updateMatrix(); lacA.setMatrixAt(i, o.matrix); o.position.set(...b); o.updateMatrix(); lacB.setMatrixAt(i, o.matrix);
          }
          o.rotation.set(0, 0, 0); lacA.instanceMatrix.needsUpdate = true; lacB.instanceMatrix.needsUpdate = true;
          for (let i = 0; i < NBa; i++) { o.position.set(2.6 + (rnd(i) - 0.5) * 3.2, 0.4 + (rnd(i + 1) - 0.5) * 4.2 + Math.sin(t + i) * 0.05, (rnd(i + 2) - 0.5) * 1.2); o.rotation.set(i, t * 0.6 + i, 0); o.updateMatrix(); bac.setMatrixAt(i, o.matrix); }
          bac.instanceMatrix.needsUpdate = true;
          for (let i = 0; i < NG; i++) { const ph = (t * 0.25 + rnd(i + 9)) % 1; o.position.set(2.6 + (rnd(i + 4) - 0.5) * 3.0, lerp(-1.6, 2.6, ph), (rnd(i + 6) - 0.5) * 1.0); o.scale.setScalar(plenty ? 0 : 0.6 + ph); o.updateMatrix(); gas.setMatrixAt(i, o.matrix); }
          gas.instanceMatrix.needsUpdate = true;
        }
        if (cg.visible) {
          dmg += (s.damage - dmg) * Math.min(1, dt * 3);
          villi.forEach((v) => { v.scale.set(1 + 0.4 * dmg, v.userData.h * lerp(1, 0.1, dmg), 1 + 0.4 * dmg); });
          for (let i = 0; i < 50; i++) { o.position.set((rnd(i) - 0.5) * 7, lerp(-0.05, 0.3, rnd(i + 1)) + Math.sin(t * 2 + i) * 0.03, (rnd(i + 2) - 0.5) * 3.2); o.scale.setScalar(i < 50 * dmg ? 1 : 0); o.updateMatrix(); immune.setMatrixAt(i, o.matrix); }
          immune.instanceMatrix.needsUpdate = true;
        }
        if (ag.visible) {
          const want = s.inflamed ? 2.0 : 1;
          if (Math.abs(appR - want) > 0.005) { appR += (want - appR) * Math.min(1, dt * 3); app.update(); }
          appM.color.copy(cHealthy).lerp(cInfl, clamp((appR - 1), 0, 1)); appM.emissive = appM.emissive || new THREE.Color(); appM.emissive.setRGB(s.inflamed ? 0.25 + 0.15 * Math.sin(t * 4) : 0, 0, 0);
        }
      },
      readout: (s) => {
        if (s.scene === 'lactose') return `<div class="big">${s.lactase === 'plenty' ? 'Lactose split and absorbed' : 'Lactose reaches the colon'}</div>
          <div class="row"><span>Lactase splits lactose into</span><b>glucose + galactose</b></div>
          <div class="row"><span>People worldwide with low lactase</span><b>about two-thirds</b></div>
          <div class="row"><span>One Indian study (north / south)</span><b>about 66% / 88%</b></div>
          <small>${s.lactase === 'plenty' ? 'Most babies make plenty of lactase. Many people make less after childhood, which is normal.' : 'Bacteria ferment the lactose, making gas, and it draws in water. Many people still manage small amounts, curd or paneer. A doctor can advise.'}</small>`;
        if (s.scene === 'coeliac') { const h = 1 - 0.9 * s.damage; return `<div class="big">Absorbing surface: about ${Math.round(areaWithVilli(h))} m²</div>
          <div class="row"><span>Villus height</span><b>${Math.round(h * 100)}% of healthy</b></div>
          <div class="row"><span>Healthy small intestine</span><b>about 30 m²</b></div>
          <div class="row"><span>People with coeliac disease</span><b>about 1 in 100</b></div>
          <small>A rough estimate: villi add about 6.5× to the area. Coeliac disease is diagnosed with blood tests and a biopsy by doctors; the villi can recover on a strict gluten-free diet.</small>`; }
        if (s.scene === 'appendix') return `<div class="big">${s.inflamed ? 'Appendicitis: see a doctor urgently' : 'A healthy appendix'}</div>
          <div class="row"><span>Size</span><b>about 8 to 10 cm, pencil-thin</b></div>
          <div class="row"><span>Lifetime chance (US study)</span><b>about 7 to 9%</b></div>
          <div class="row"><span>Typical pain</span><b>navel, then lower right</b></div>
          <small>It is most common in children and young adults. Doctors treat it with surgery or sometimes antibiotics. The appendix holds immune tissue and some gut bacteria.</small>`;
        return `<div class="big">${net < -0.05 ? 'Losing water' : s.ors ? 'ORS: water coming back' : 'Water being absorbed'}</div>
          <div class="row"><span>Child deaths (under 5)</span><b>about 440,000 a year</b></div>
          <div class="row"><span>WHO ORS, per litre</span><b>2.6 g salt, 13.5 g glucose</b></div>
          <div class="row"><span>Zinc</span><b>about 25% shorter illness</b></div>
          <small>Flows are illustrative. ORS also has potassium and citrate; use ready-made packets. Get medical help for a baby with diarrhoea, blood in the stool, a very sleepy child, or someone who can't drink.</small>`;
      },
    });
  },
};
