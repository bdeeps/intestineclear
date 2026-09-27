// Chapter 2: why the inside of the small intestine is so big. Folds (plicae circulares) carry villi,
// villi are covered in cells, and each cell has a brush border of microvilli.
// Numbers: Helander & Fändriks, "Surface area of the digestive tract – revisited", Scand J
// Gastroenterol 49:681, 2014: small intestine ≈ 2.9 m long (as they used), 2.5 cm across; folds ×1.57,
// villi ×6.5, microvilli ×13, giving ≈ 30 m²; whole digestive tract ≈ 32 m² (≈ 2 m² in the colon),
// "about half a badminton court". The old textbook "tennis court" (≈ 260 m², a doubles court is
// 23.77 × 10.97 m) was an overestimate. Villi 0.5–1 mm tall; microvilli ≈ 1 µm tall (Guyton & Hall,
// 14th ed., ch. 66; Alberts, Molecular Biology of the Cell). Lacteals take fats as chylomicrons into
// the lymph; sugars and amino acids go into capillaries and then to the liver (Guyton & Hall ch. 66).
import { THREE, M, latheX, tube, box, clamp, lerp, canvasTexture } from '../kit.js';
import { tint, fitNarrow, compactReadout, villusGeometry, makeCells, fader, rnd, C, tissue } from '../gut.js';

// Area of a plain 2.9 m × 2.5 cm tube, then the three multipliers.
const PLAIN = Math.PI * 0.025 * 2.91;           // ≈ 0.23 m²
const MULT = [1, 1.57, 6.5, 13];
export const areaAt = (lv) => MULT.slice(0, lv + 1).reduce((a, b) => a * b, PLAIN);
const LEVELS = ['The tube', 'Folds', 'Villi', 'Microvilli'];
const SCALE = ['about 2.5 cm across', 'folds up to about 8 mm tall', 'villi 0.5 to 1 mm tall', 'microvilli about 1 µm (a thousandth of a mm) tall'];

export default {
  id: 'surface',
  short: 'Villi',
  title: 'A huge surface in a small tube',
  subtitle: 'Folds on folds on folds: how 3 metres of tube gets about 30 square metres of lining.',
  view: { pos: [-1.5, 4.6, 13.6], target: [-1.6, 3.4, 0] },
  learn: `<p>Food can only get into your body by crossing the lining of the small intestine. The more lining there is, the faster that happens. So the gut folds its lining three times over.</p>
    <p>First, the inside is ridged with <b>circular folds</b> (plicae circulares), which about <b>1.6×</b> the area. The folds are covered in millions of tiny fingers, <b>villi</b>, each 0.5 to 1 mm tall, which add about <b>6.5×</b>. Between them are little pits, the <b>crypts</b>, where new lining cells are made. Each lining cell is topped with a fuzz of <b>microvilli</b>, the <b>brush border</b>, which adds about <b>13×</b> more.</p>
    <p>Together that is about <b>30 m²</b>, roughly half a badminton court. Many books used to say "a tennis court" (about 260 m²). In 2014 Swedish researchers Herbert Helander and Lars Fändriks measured it carefully and found the old figure was far too big. Still, 30 m² packed into a tube you could hold in two hands is impressive.</p>
    <p>Inside each villus are tiny blood vessels, <b>capillaries</b>, which take sugars and amino acids to the liver (see <b>LiverClear</b>), and a central lymph vessel, the <b>lacteal</b>, which takes fats. How the molecules actually get across depends on <b>osmosis</b> and diffusion (see <b>OsmosisClear</b>).</p>
    <p class="tip"><b>Try it:</b> step from the tube down to the microvilli and watch the area readout grow at each step.</p>`,
  terms: [
    { t: 'Plicae circulares', d: 'The permanent circular folds on the inside of the small intestine, also called Kerckring’s folds.' },
    { t: 'Villus', d: 'A tiny finger-like bump, 0.5 to 1 mm tall, on the lining of the small intestine. Plural: villi.' },
    { t: 'Microvilli', d: 'Microscopic fingers, about 1 µm tall, on the top of each lining cell. Together they form the brush border.' },
    { t: 'Crypt', d: 'A small pit between villi where new lining cells are made. Also called a crypt of Lieberkühn.' },
    { t: 'Lacteal', d: 'The lymph vessel in the middle of each villus, which takes in fats.' },
    { t: 'Enterocyte', d: 'A cell of the intestinal lining that absorbs nutrients.' },
  ],
  defaults: { level: 2 },
  controls: [
    { key: 'level', type: 'seg', label: 'Zoom in', options: LEVELS.map((l, i) => ({ v: i, label: l })), fmt: (v) => SCALE[v] },
  ],
  quiz: [
    { q: 'About how big is the inner surface of the small intestine?', options: ['About 1 m²', 'About 30 m², half a badminton court', 'About 260 m², a tennis court', 'About 1 km²'], answer: 1, why: 'Careful measurements in 2014 gave about 30 m² for the small intestine, much less than the old tennis-court claim.' },
    { q: 'Which step multiplies the area the most?', options: ['The circular folds', 'The villi', 'The microvilli', 'The length of the tube'], answer: 2, why: 'Microvilli add about 13×, villi about 6.5×, folds about 1.6×.' },
    { q: 'Where do most fats go after they are absorbed?', options: ['Into the capillaries, straight to the liver', 'Into the lacteal, a lymph vessel', 'Back into the gut', 'Into the bones'], answer: 1, why: 'Fats are packed into particles called chylomicrons, which are too big for capillaries, so they enter the lacteal.' },
  ],
  reel: [
    { ms: 5200, caption: 'The lining is folded, and the folds are covered in tiny fingers called villi.', set: { level: 2 }, view: { pos: [0.6, 4.6, 10.2], target: [0.6, 3.6, 0] }, spin: 0.4 },
    { ms: 5400, caption: 'Each cell has a brush of microvilli: together about 30 square metres, not the tennis court of old textbooks.', set: { level: 3 }, view: { pos: [0.6, 4.4, 10.0], target: [0.6, 3.4, 0] }, spin: 0.3 },
  ],

  build({ stage }) {
    const CEN = new THREE.Vector3(0.9, 4.7, 0), B = 0.95;
    const L = (h, p, parent, cls) => tint(stage.label(h, p, parent), cls);

    // -------------------------------------------------- level 0/1: the tube, cut open, with folds
    const gTube = new THREE.Group(); gTube.position.copy(CEN); stage.root.add(gTube);
    const R = 1.4, open = { phiStart: Math.PI * 0.38, phiLength: Math.PI * 1.24, seg: 64 };
    const wallOut = latheX([[-3.6, R + 0.18], [3.6, R + 0.18]], tissue(C.jejunum, { side: THREE.FrontSide }), open);
    const wallIn = latheX([[-3.6, R], [3.6, R]], tissue(0xf2a7a0, { side: THREE.BackSide, roughness: 0.8, clearcoat: 0.1 }), open);
    gTube.add(wallOut, wallIn);
    // Cut edges, so you can see the wall's thickness.
    [open.phiStart, open.phiStart + open.phiLength].forEach((ph) => {
      const e = box(7.2, 0.18, 0.06, tissue(0xc86a66)); e.position.set(0, -(R + 0.09) * Math.sin(ph), (R + 0.09) * Math.cos(ph)); e.rotation.x = -ph; gTube.add(e);
    });
    const folds = new THREE.Group(); gTube.add(folds);
    const foldMat = tissue(0xf7b7ad, { roughness: 0.75, clearcoat: 0.15 });
    for (let i = 0; i < 14; i++) {
      const x = -3.25 + i * 0.5, a0 = open.phiStart + 0.12 + rnd(i) * 0.2, a1 = open.phiStart + open.phiLength - 0.12 - rnd(i + 9) * 0.35, pts = [];
      for (let k = 0; k <= 18; k++) { const ph = lerp(a0, a1, k / 18), r = R - 0.02; pts.push([x + Math.sin(k) * 0.02, -r * Math.sin(ph), r * Math.cos(ph)]); }
      const f = tube(pts, 0.2, foldMat, false, 40); f.scale.set(0.6, 1, 1); f.position.x = x * 0.4; folds.add(f);
    }
    const chymeT = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), M.matte(C.chyme)); gTube.add(chymeT);
    const tubeLabs = [L('Lining of the small intestine', [0, -R - 0.6, 0.8], gTube, 'pink'), L('Circular folds', [2.2, 1.25, -0.4], gTube, 'gold')];
    const fadeTube = fader(gTube);

    // -------------------------------------------------- level 2: villi
    const gVil = new THREE.Group(); gVil.position.copy(CEN); stage.root.add(gVil);
    const base = box(7.4, 0.7, 4.2, tissue(0xd98a86)); base.position.y = -1.75; gVil.add(base);
    const vGeo = villusGeometry(2.3, 0.33), vMat = tissue(0xf2a9a0, { roughness: 0.6 });
    const crypt = new THREE.Mesh(new THREE.CircleGeometry(0.13, 12), M.matte(0x5a2a30)); crypt.rotation.x = -Math.PI / 2;
    for (let a = 0; a < 9; a++) for (let b = 0; b < 5; b++) {
      const x = -3.3 + a * 0.82 + (b % 2) * 0.41, z = -1.6 + b * 0.75;
      if (Math.abs(x - 0.15) < 0.5 && b === 4) continue;         // room for the cut-open one
      const v = new THREE.Mesh(vGeo, vMat); v.position.set(x, -1.4, z); v.scale.y = 0.85 + 0.3 * rnd(a * 5 + b); v.rotation.z = (rnd(a + b * 13) - 0.5) * 0.15; gVil.add(v);
      const c = crypt.clone(); c.position.set(x + 0.41, -1.39, z + 0.37); gVil.add(c);
    }
    // The featured villus: see-through, with its capillary net and central lacteal.
    const FX = 0.15, FZ = 1.45, FB = -1.4, FH = 2.9;
    const fv = new THREE.Mesh(villusGeometry(FH, 0.52, 28), tissue(0xf4b0a6, { opacity: 0.35, depthWrite: false })); fv.position.set(FX, FB, FZ); gVil.add(fv);
    const capPts = [];
    for (let k = 0; k <= 60; k++) { const t = k / 60, y = FB + 0.1 + t * (FH - 0.45), a = t * Math.PI * 9; capPts.push([FX + Math.cos(a) * 0.36, y, FZ + Math.sin(a) * 0.36]); }
    capPts.push([FX + 0.05, FB + FH - 0.25, FZ]);
    const cap = tube(capPts, 0.035, M.glow(C.artery), false, 240); gVil.add(cap);
    const lact = tube([[FX, FB - 0.4, FZ], [FX, FB + FH - 0.5, FZ]], 0.1, M.glow(C.lacteal, { transparent: true, opacity: 0.9 }), false, 10); gVil.add(lact);
    // Blood and lymph leaving under the lining.
    const vein = tube([[FX + 0.4, FB, FZ], [FX + 0.8, FB - 0.35, FZ - 0.2], [3.6, FB - 0.35, FZ - 0.4]], 0.08, M.glow(C.artery), false, 30); gVil.add(vein);
    const lymph = tube([[FX, FB - 0.4, FZ], [FX - 0.5, FB - 0.5, FZ - 0.2], [-3.6, FB - 0.5, FZ - 0.4]], 0.07, M.glow(C.lacteal), false, 30); gVil.add(lymph);
    const vilLabs = [
      L('Villus, see-through', [FX + 1.2, FB + FH + 0.1, FZ], gVil, 'pink'),
      L('Capillaries: sugars, amino acids → liver', [FX + 2.3, FB - 0.75, FZ + 0.4], gVil, 'red'),
      L('Lacteal: fats → lymph', [FX - 2.3, FB - 0.95, FZ + 0.4], gVil, 'fat'),
      L('Crypts: new cells made here', [-2.6, -1.1, -1.8], gVil, ''),
    ];
    // Nutrient particles falling onto the villus and being absorbed.
    const NP = 42, pGeo = new THREE.SphereGeometry(0.07, 8, 6);
    const pMesh = new THREE.InstancedMesh(pGeo, new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true }), NP);
    pMesh.frustumCulled = false; pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); gVil.add(pMesh);
    const pKind = Array.from({ length: NP }, (_, i) => (i % 3 === 2 ? 'fat' : i % 3 ? 'amino' : 'glucose'));
    pKind.forEach((k, i) => pMesh.setColorAt(i, new THREE.Color(C[k])));
    const fadeVil = fader(gVil);

    // -------------------------------------------------- level 3: cells with a brush border
    const gCell = new THREE.Group(); gCell.position.copy(CEN); stage.root.add(gCell);
    const cells = makeCells(5); cells.grp.position.y = 0.2; gCell.add(cells.grp);
    const capC = tube([[-4, -1.95, 0.4], [4, -1.95, 0.4]], 0.28, M.glow(C.artery, { transparent: true, opacity: 0.55 }), false, 10);
    const lacC = tube([[-4, -2.0, -0.55], [4, -2.0, -0.55]], 0.32, M.glow(C.lacteal, { transparent: true, opacity: 0.5 }), false, 10);
    gCell.add(capC, lacC);
    const cellLabs = [
      L('Microvilli: the brush border', [2.6, 2.6, 0.4], gCell, 'pink'),
      L('Lining cell (enterocyte)', [3.9, 0.3, 0.6], gCell, ''),
      L('Capillary', [3.6, -2.4, 0.5], gCell, 'red'),
      L('Lacteal', [-3.5, -2.5, -0.5], gCell, 'fat'),
    ];
    const NC = 36, cm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), NC);
    cm.frustumCulled = false; cm.instanceMatrix.setUsage(THREE.DynamicDrawUsage); gCell.add(cm);
    const cKind = Array.from({ length: NC }, (_, i) => (i % 3 === 2 ? 'fat' : i % 3 ? 'amino' : 'glucose'));
    cKind.forEach((k, i) => cm.setColorAt(i, new THREE.Color(C[k])));
    const fadeCell = fader(gCell);

    // -------------------------------------------------- the area board
    const board = canvasTexture(1000, 380, (g, w, h, lv = 2) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = 'rgba(7,8,12,0.82)'; g.beginPath(); g.roundRect(0, 0, w, h, 26); g.fill();
      g.fillStyle = '#e8ecf4'; g.font = '600 32px Geist, sans-serif'; g.fillText('Inner surface of the small intestine (log scale)', 28, 46);
      const rows = [
        ['Plain tube', areaAt(0), 0], ['+ folds', areaAt(1), 1], ['+ villi', areaAt(2), 2], ['+ microvilli', areaAt(3), 3], ['Old "tennis court"', 260, 9],
      ];
      const x0 = 250, x1 = w - 150, lg = (v) => (Math.log10(v) + 1) / (Math.log10(300) + 1);
      rows.forEach(([name, v, i], k) => {
        const y = 78 + k * 48, on = i <= lv || i === 9;
        g.fillStyle = on ? '#c8cfdd' : '#555d6e'; g.font = '27px Geist, sans-serif'; g.fillText(name, 28, y + 24);
        g.fillStyle = i === 9 ? '#6b7385' : i === lv ? '#ff8fa3' : on ? '#b8506a' : '#2a2f3a';
        g.fillRect(x0, y + 4, (x1 - x0) * lg(v), 28);
        if (i === 9) { g.strokeStyle = '#ff5c6c'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y + 18); g.lineTo(x0 + (x1 - x0) * lg(v), y + 18); g.stroke(); }
        g.fillStyle = on ? '#e8ecf4' : '#555d6e'; g.fillText(v < 1 ? v.toFixed(2) + ' m²' : v < 10 ? v.toFixed(1) + ' m²' : Math.round(v) + ' m²', x0 + (x1 - x0) * lg(v) + 10, y + 26);
      });
      g.fillStyle = '#8ef0ff'; g.font = '500 26px Geist, sans-serif'; g.fillText('Now showing: ' + SCALE[lv], 28, h - 22);
    });
    const boardM = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 2.66), new THREE.MeshBasicMaterial({ map: board.tex, transparent: true, toneMapped: false }));
    boardM.position.set(0.9, 0.95, 1.6); stage.root.add(boardM);

    let lv = 2, shownLv = -1, t = 0;
    const fit = fitNarrow(stage, { pos: [0.6, 5.0, 14.5], target: [0.6, 4.2, 0] });
    const o = new THREE.Object3D(), tmp = new THREE.Vector3();
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        const narrow = fit();
        lv += (s.level - lv) * Math.min(1, dt * 3);
        if (Math.abs(lv - s.level) < 0.002) lv = s.level;
        // Cross-fade and zoom between the scales.
        const aTube = lv <= 1 ? 1 : clamp(2 - lv, 0, 1), aVil = lv <= 2 ? clamp(lv - 1, 0, 1) : clamp(3 - lv, 0, 1), aCell = clamp(lv - 2, 0, 1);
        fadeTube(aTube); fadeVil(aVil); fadeCell(aCell);
        gTube.scale.setScalar(B * (1 + 2.5 * Math.max(0, lv - 1)));
        gVil.scale.setScalar(B * (lv < 2 ? 0.3 + 0.7 * clamp(lv - 1, 0, 1) : 1 + 2.5 * (lv - 2)));
        gCell.scale.setScalar(B * (0.3 + 0.7 * clamp(lv - 2, 0, 1)));
        const kf = clamp(lv, 0, 1); foldMat.opacity *= kf; foldMat.depthWrite = kf > 0.95; folds.visible = kf > 0.02;
        chymeT.position.set(((t * 0.6) % 7) - 3.5, -0.8, 0); chymeT.visible = aTube > 0.5;
        tubeLabs[1].visible = aTube > 0.6 && kf > 0.5 && !narrow; tubeLabs[0].visible = aTube > 0.6 && !narrow;
        vilLabs.forEach((l, i) => { l.visible = aVil > 0.6 && (!narrow || i < 1); });
        cellLabs.forEach((l, i) => { l.visible = aCell > 0.6 && (!narrow || i < 1); });
        if (s.level !== shownLv) { board.redraw(s.level); shownLv = s.level; }
        boardM.visible = true;
        // Villus particles: fall (0–0.35), then travel down the capillary or lacteal (0.35–1).
        if (aVil > 0.01) {
          for (let i = 0; i < NP; i++) {
            const ph = (t * 0.22 + i / NP) % 1, kind = pKind[i], a = rnd(i) * Math.PI * 2;
            if (ph < 0.35) {
              const k = ph / 0.35, y0 = 2.2, y1 = FB + 0.6 + rnd(i + 3) * (FH - 1.0);
              tmp.set(FX + Math.cos(a) * lerp(1.4, 0.55, k), lerp(y0, y1, k), FZ + Math.sin(a) * lerp(1.0, 0.55, k));
            } else {
              const k = (ph - 0.35) / 0.65, ys = FB + 0.6 + rnd(i + 3) * (FH - 1.0);
              if (kind === 'fat') tmp.set(FX, lerp(ys, FB - 0.4, Math.min(1, k * 1.6)), FZ);
              else tmp.set(FX + Math.cos(a + k * 6) * 0.36, lerp(ys, FB, Math.min(1, k * 1.6)), FZ + Math.sin(a + k * 6) * 0.36);
              if (k > 0.62) { const k2 = (k - 0.62) / 0.38; tmp.x = kind === 'fat' ? lerp(FX, -3.5, k2) : lerp(FX + 0.4, 3.5, k2); tmp.y = kind === 'fat' ? FB - 0.5 : FB - 0.35; tmp.z = FZ - 0.3; }
            }
            o.position.copy(tmp); o.scale.setScalar(kind === 'fat' ? 1.5 : 1); o.updateMatrix(); pMesh.setMatrixAt(i, o.matrix);
          }
          pMesh.instanceMatrix.needsUpdate = true;
        }
        // Cell particles: through the brush border, across the cell, out the bottom.
        if (aCell > 0.01) {
          for (let i = 0; i < NC; i++) {
            const ph = (t * 0.18 + i / NC) % 1, kind = cKind[i], x = -3 + rnd(i) * 6, z = (rnd(i + 5) - 0.5) * 0.8;
            const top = cells.top + 1.2, y = ph < 0.2 ? lerp(top, cells.top - 0.2, ph / 0.2) : ph < 0.75 ? lerp(cells.top - 0.2, -1.4, (ph - 0.2) / 0.55) : -1.4 - (ph - 0.75) * 2.2;
            const zz = ph < 0.75 ? z : lerp(z, kind === 'fat' ? -0.55 : 0.4, clamp((ph - 0.75) * 6, 0, 1));
            const xx = ph < 0.75 ? x : x + (ph - 0.75) * 8 * (kind === 'fat' ? -1 : 1);
            // Fats are re-packed inside the cell into bigger chylomicrons.
            const sc = kind === 'fat' ? (ph < 0.45 ? 0.6 : 1.6) : 0.8;
            o.position.set(xx, y + 0.2, zz); o.scale.setScalar(sc); o.updateMatrix(); cm.setMatrixAt(i, o.matrix);
          }
          cm.instanceMatrix.needsUpdate = true;
        }
      },
      readout: (s) => `<div class="big">${s.level === 0 ? 'About 0.23 m²' : `About ${areaAt(s.level) < 10 ? areaAt(s.level).toFixed(1) : Math.round(areaAt(s.level))} m²`}</div>
        <div class="row"><span>Showing</span><b>${LEVELS[s.level]}</b></div>
        <div class="row"><span>This step multiplies the area by</span><b>${s.level === 0 ? '1 (a plain 2.9 m × 2.5 cm tube)' : '×' + MULT[s.level]}</b></div>
        <div class="row"><span>All three together</span><b>about 30 m², half a badminton court</b></div>
        <small>${s.level === 3 ? 'White: sugars. Blue: amino acids. Yellow: fats, packed into bigger chylomicrons inside the cell.' : 'Area figures from Helander and Fändriks (2014). The old "tennis court" claim was about 8 times too big.'}</small>`,
    });
  },
};
