// Chapter 5: the colon and its bacteria.
// Bacteria count: Sender, Fuchs & Milo, "Revised estimates for the number of human and bacteria cells
// in the body", PLoS Biol 14:e1002533, 2016: ≈ 3.8 × 10¹³ bacteria and ≈ 3.0 × 10¹³ human cells in a
// 70 kg "reference man", a ratio of about 1.3 : 1, not the 10 : 1 often quoted (which traces back to a
// rough estimate by Luckey, 1972). Almost all of them live in the colon; together they weigh ≈ 0.2 kg.
// Fermentation: colon bacteria ferment fibre and resistant starch into short-chain fatty acids
// (acetate, propionate, butyrate); fermenting ≈ 50–60 g of carbohydrate a day gives ≈ 500–600 mmol of
// SCFA (Topping & Clifton, Physiol Rev 81:1031, 2001), so about 10 mmol per gram. Butyrate is the main
// fuel of colon lining cells (Roediger, Gut 21:793, 1980). Gut bacteria also make vitamin K and some
// B vitamins, and help train the immune system (NIH Human Microbiome Project; Human Microbiome Project
// Consortium, Nature 486:207, 2012).
// Our fermentation estimate: fermented g/day ≈ 0.7 × fibre + 10 (resistant starch and other residues);
// both the fermentable share and the extra vary a lot between diets and people, so it is only a guide.
// Water: ≈ 8–9 L enters the gut each day (≈ 2 L from food and drink, the rest from saliva, stomach,
// bile, pancreas and intestine); ≈ 1.5 L passes the ileocaecal valve; the colon absorbs most of it,
// leaving ≈ 100 mL in the stool; it can absorb up to 5–8 L a day at most (Guyton & Hall, 14th ed.,
// ch. 66). Fibre: WHO (2023 carbohydrate guideline) advises adults to eat at least 25 g a day.
import { THREE, M, latheX, clamp, lerp, canvasTexture } from '../kit.js';
import { tint, fitNarrow, compactReadout, tissue, rnd, haustra, C } from '../gut.js';

const RC = 1.55, XL = -4.7, XR = 4.7;
export const fermented = (f) => 0.7 * f + 10;
export const scfa = (f) => 10 * fermented(f);
export const thrive = (f) => (f / (f + 15)) / (50 / 65);      // 0→1 share of the fibre-eaters' potential

export default {
  id: 'microbiome',
  short: 'Gut bacteria',
  title: 'Trillions of tiny helpers',
  subtitle: 'The colon saves water and feeds a huge colony of bacteria, which feed you back.',
  view: { pos: [-2.0, 5.8, 15.0], target: [-2.0, 3.4, 0] },
  learn: `<p>By the time chyme reaches the colon, most of the nutrients are gone. What is left is water, salts, fibre and a few other leftovers. The colon has two big jobs: <b>save water</b> and <b>house bacteria</b>.</p>
    <p><b>Water.</b> About 8 to 9 litres of water pass into your gut each day: what you drink plus litres of juices. The small intestine takes most of it back. About <b>1.5 litres</b> reaches the colon, and the colon absorbs nearly all of that, leaving only about <b>100 mL</b> in the stool. That is why the contents go from runny on the right side to firm on the left.</p>
    <p><b>Bacteria.</b> Your colon is home to about <b>38 trillion bacteria</b>, from hundreds of species. You may have read that bacteria outnumber your own cells ten to one. A careful count in 2016 by Ron Sender, Shai Fuchs and Ron Milo found the real ratio is closer to <b>1.3 to 1</b>: about as many bacteria as human cells.</p>
    <p>You can't digest <b>fibre</b>, but many of these bacteria can. They <b>ferment</b> it into <b>short-chain fatty acids</b> such as butyrate, the favourite fuel of your colon's lining cells. Gut bacteria also make <b>vitamin K</b> and some <b>B vitamins</b>, crowd out harmful germs, and help train your <b>immune system</b>. Scientists are still working out how they talk to the rest of the body, including the brain (see <b>BrainClear</b>).</p>
    <p class="tip"><b>Try it:</b> slide the fibre from low to high and watch the bacteria multiply and the orange fatty acids flow into the wall.</p>`,
  terms: [
    { t: 'Microbiome', d: 'All the microbes living in a place, such as your gut, and their genes.' },
    { t: 'Fibre', d: 'Parts of plant foods that your own enzymes can’t digest. Some of it feeds gut bacteria.' },
    { t: 'Fermentation', d: 'How bacteria break down food without oxygen, making gases and acids.' },
    { t: 'Short-chain fatty acids', d: 'Small acids such as butyrate, acetate and propionate made when bacteria ferment fibre. Butyrate fuels the colon’s lining.' },
    { t: 'Haustra', d: 'The row of pouches that gives the colon its bumpy look.' },
  ],
  defaults: { fibre: 20, water: true },
  controls: [
    { key: 'fibre', type: 'range', label: 'Fibre eaten', min: 5, max: 50, step: 1, ends: ['very little', 'lots'], fmt: (v) => Math.round(v) + ' g a day' },
    { key: 'water', type: 'toggle', label: 'Show water being absorbed' },
  ],
  quiz: [
    { q: 'Roughly how do gut bacteria compare in number with your own cells?', options: ['10 times more bacteria', 'About the same, around 1.3 to 1', 'A million times more', 'Far fewer'], answer: 1, why: 'Sender, Fuchs and Milo (2016) estimated about 38 trillion bacteria and 30 trillion human cells.' },
    { q: 'What do colon bacteria make from fibre?', options: ['Glucose for the blood', 'Short-chain fatty acids such as butyrate', 'Bile', 'Stomach acid'], answer: 1, why: 'They ferment fibre into short-chain fatty acids. Butyrate is the main fuel of colon lining cells.' },
    { q: 'About how much water reaches the colon each day, and how much leaves in stool?', options: ['1.5 L in, about 0.1 L out', '10 L in, 10 L out', '0.1 L in, 1.5 L out', 'None at all'], answer: 0, why: 'The colon soaks up nearly all of the roughly 1.5 litres that reaches it.' },
  ],
  reel: [
    { ms: 5800, caption: 'Your colon holds about 38 trillion bacteria, roughly as many as your own cells, and fibre is their food.', set: { water: false }, anim: { fibre: [8, 45] }, view: { pos: [0.4, 4.9, 11.4], target: [0.5, 3.6, 0] }, spin: 0.25 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); root.position.set(0.6, 4.5, 0); stage.root.add(root);
    const open = { phiStart: Math.PI * 0.35, phiLength: Math.PI * 1.3, seg: 64 };
    const prof = (r) => { const p = []; for (let i = 0; i <= 120; i++) { const x = lerp(XL, XR, i / 120); p.push([x, haustra(r, x - XL, 0.16) / 0.9]); } return p; };
    root.add(latheX(prof(RC + 0.14), tissue(C.colon, { side: THREE.FrontSide }), open));
    root.add(latheX(prof(RC), tissue(0xe0ab8f, { side: THREE.BackSide, roughness: 0.8, clearcoat: 0.1 }), open));
    // A strip of lining cells along the back, which take up butyrate and water.
    const back = new THREE.Mesh(new THREE.BoxGeometry(XR - XL, 0.08, 0.5), M.ghost(0xffa94d, 0.18)); back.position.set(0, -RC * 0.95, -0.4); root.add(back);
    const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, XR - XL, 12), M.glow(C.artery)); vessel.rotation.z = Math.PI / 2; vessel.position.set(0, -RC - 0.45, -0.9); root.add(vessel);
    const xAt = (i, n) => lerp(XL + 0.3, XR - 0.3, (i + 0.5) / n);
    const inside = (x, i, k = 0.8) => { const a = rnd(i + 11) * Math.PI * 2, r = Math.sqrt(rnd(i + 23)) * RC * k; return [x, Math.sin(a) * r * 0.9 - 0.15, Math.cos(a) * r * 0.55 - 0.25]; };
    // Stool: loose and pale on the right side of the body (your left), packed and dark lower down the colon.
    const NS = 160, stool = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 8, 6), M.matte(0xffffff), NS);
    stool.instanceMatrix.setUsage(THREE.DynamicDrawUsage); stool.frustumCulled = false; root.add(stool);
    const cA = new THREE.Color(0xd9b26a), cB = new THREE.Color(0x6b4220), col = new THREE.Color(), o = new THREE.Object3D();
    // Bacteria: rods and round cocci in several colours.
    const NB = 260, bCol = [0x5ce1a9, 0x7aa2ff, 0xb18cff, 0xff8fa3, 0x8ef0ff];
    const rods = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.045, 0.16, 4, 8), M.plastic(0xffffff), NB);
    const cocci = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 10, 8), M.plastic(0xffffff), NB);
    [rods, cocci].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; root.add(m); for (let i = 0; i < NB; i++) m.setColorAt(i, new THREE.Color(bCol[(i * 7) % bCol.length])); });
    const NF = 40, fib = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 5), M.plastic(0x7bd35a), NF);
    fib.instanceMatrix.setUsage(THREE.DynamicDrawUsage); fib.frustumCulled = false; root.add(fib);
    const NA = 70, sc = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), M.glow(C.scfa), NA);
    sc.instanceMatrix.setUsage(THREE.DynamicDrawUsage); sc.frustumCulled = false; root.add(sc);
    const NW = 60, wat = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), M.glow(C.water), NW);
    wat.instanceMatrix.setUsage(THREE.DynamicDrawUsage); wat.frustumCulled = false; root.add(wat);
    const L = (h, p, cls) => tint(stage.label(h, p, root), cls);
    const labs = [
      L('Runny at the start', [XL + 1.0, -RC - 0.2, 1.2], 'gold'),
      L('Firmer as water is taken out →', [XR - 1.6, RC + 0.6, 0], 'brown'),
      L('Bacteria ferment fibre', [-0.4, 0.95, 0.9], 'green'),
      L('Fatty acids → wall cells', [3.0, -RC - 0.2, 1.2], 'gold'),
      L('Water → blood', [-0.6, -RC - 0.2, 1.2], 'blue'),
    ];
    // The water and bacteria board.
    const board = canvasTexture(1000, 300, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(7,8,12,0.82)'; g.beginPath(); g.roundRect(0, 0, w, h, 26); g.fill();
      g.fillStyle = '#e8ecf4'; g.font = '600 30px Geist, sans-serif'; g.fillText('Water in the gut each day', 26, 44);
      const bars = [['Enters the gut', 8.5, '#6fb7ff'], ['Reaches the colon', 1.5, '#6fb7ff'], ['Leaves in stool', 0.1, '#8a5a2b']];
      bars.forEach(([n, v, c], k) => { const y = 64 + k * 44; g.fillStyle = '#c8cfdd'; g.font = '25px Geist, sans-serif'; g.fillText(n, 26, y + 26); g.fillStyle = c; g.fillRect(270, y + 6, Math.max(4, (v / 9) * 380), 28); g.fillStyle = '#e8ecf4'; g.fillText(v < 1 ? 'about 0.1 L' : v === 8.5 ? '8 to 9 L' : 'about 1.5 L', 280 + Math.max(4, (v / 9) * 380), y + 28); });
      g.fillStyle = '#e8ecf4'; g.font = '600 26px Geist, sans-serif'; g.fillText('Bacteria : your cells', 26, 262);
      g.font = '25px Geist, sans-serif'; g.fillStyle = '#5ce1a9'; g.fillText('about 1.3 : 1 (Sender et al., 2016)', 300, 262);
      g.fillStyle = '#ff5c6c'; g.fillText('not 10 : 1', 760, 262); g.strokeStyle = '#ff5c6c'; g.lineWidth = 3; g.beginPath(); g.moveTo(752, 254); g.lineTo(876, 254); g.stroke();
    });
    const boardM = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 2.52), new THREE.MeshBasicMaterial({ map: board.tex, transparent: true, toneMapped: false }));
    boardM.position.set(0.6, 1.35, 1.8); stage.root.add(boardM);

    let t = 0, pop = thrive(20);
    const fit = fitNarrow(stage, { pos: [0.6, 5.4, 15.5], target: [0.6, 4.3, 0] });
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        const narrow = fit();
        pop += (thrive(s.fibre) - pop) * Math.min(1, dt * 2);
        for (let i = 0; i < NS; i++) {
          const k = (i + 0.5) / NS, x = lerp(XL + 0.2, XR - 0.2, k) + Math.sin(t * 0.3 + i) * 0.03;
          const p = inside(x, i, lerp(0.85, 0.5, k));
          o.position.set(...p); o.rotation.set(0, 0, 0); o.scale.setScalar(lerp(0.8, 1.8, k)); o.updateMatrix(); stool.setMatrixAt(i, o.matrix);
          col.copy(cA).lerp(cB, k); stool.setColorAt(i, col);
        }
        stool.instanceMatrix.needsUpdate = true; stool.instanceColor.needsUpdate = true;
        // Bacteria: how many are shown follows how well-fed they are.
        const nb = Math.round(NB * (0.25 + 0.75 * pop));
        [rods, cocci].forEach((m, which) => {
          for (let i = 0; i < NB; i++) {
            const on = i < nb, x = xAt(i, NB) + (rnd(i + which * 400) - 0.5) * 0.5;
            const p = inside(x, i + which * 900, 0.85);
            o.position.set(p[0] + Math.sin(t * 2 + i) * 0.05, p[1] + Math.cos(t * 1.7 + i) * 0.05, p[2]);
            o.rotation.set(t * 0.5 + i, i, t * 0.3); o.scale.setScalar(on ? 1 : 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
          }
          m.instanceMatrix.needsUpdate = true;
        });
        const nf = Math.round((NF * s.fibre) / 50);
        for (let i = 0; i < NF; i++) { const p = inside(xAt(i, NF) + (rnd(i + 70) - 0.5) * 0.4, i + 300, 0.7); o.position.set(...p); o.rotation.set(i, i * 2.1, i * 0.7); o.scale.setScalar(i < nf ? 1 : 0); o.updateMatrix(); fib.setMatrixAt(i, o.matrix); }
        fib.instanceMatrix.needsUpdate = true;
        // Short-chain fatty acids: from the bacteria down into the lining.
        const na = Math.round(NA * clamp(scfa(s.fibre) / scfa(50), 0, 1));
        for (let i = 0; i < NA; i++) { const ph = (t * 0.35 + rnd(i + 5)) % 1, x = xAt(i, NA); const p = inside(x, i + 600, 0.5); o.position.set(p[0], lerp(p[1], -RC * 0.95, ph), lerp(p[2], -0.4, ph)); o.scale.setScalar(i < na ? 1 : 0); o.updateMatrix(); sc.setMatrixAt(i, o.matrix); }
        sc.instanceMatrix.needsUpdate = true;
        // Water: more leaves on the right side of the body, where the contents are runny.
        wat.visible = s.water;
        for (let i = 0; i < NW; i++) { const k = Math.pow(rnd(i + 40), 1.6), x = lerp(XL + 0.3, XR - 0.3, k), ph = (t * 0.3 + rnd(i + 8)) % 1; const p = inside(x, i + 800, 0.6); o.position.set(x, lerp(p[1], -RC - 0.45, ph), lerp(p[2], -0.9, ph)); o.scale.setScalar(1); o.updateMatrix(); wat.setMatrixAt(i, o.matrix); }
        wat.instanceMatrix.needsUpdate = true;
        labs.forEach((l, i) => { l.visible = !narrow || i < 2; });
        labs[4].visible = labs[4].visible && s.water;
      },
      readout: (s) => {
        const f = Math.round(s.fibre), S = Math.round(scfa(s.fibre) / 10) * 10;
        return `<div class="big">About 38 trillion bacteria</div>
          <div class="row"><span>Fibre eaten</span><b>${f} g a day${f >= 25 ? ' ✓' : ''}</b></div>
          <div class="row"><span>Fatty acids made (rough)</span><b>about ${S} mmol a day</b></div>
          <div class="row"><span>Fibre-eating bacteria</span><b>${pop < 0.45 ? 'hungry' : pop < 0.75 ? 'doing well' : 'thriving'}</b></div>
          <small>${f < 25 ? 'WHO advises adults to eat at least 25 g of fibre a day, from foods like whole grains, dal, vegetables and fruit.' : 'Fibre from whole grains, dal, vegetables and fruit feeds the bacteria. Each person’s mix of microbes is different.'}</small>`;
      },
    });
  },
};
