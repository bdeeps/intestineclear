// Chapter 3: how the gut moves things along. Three patterns of the smooth muscle in the wall:
//  - peristalsis: a ring of contraction behind the food with relaxation in front (the "law of the
//    intestine", Bayliss & Starling 1899). Waves travel at about 0.5–2 cm/s and die out after a few
//    cm, so the net progress of chyme is only about 1 cm per minute, and chyme takes about 3–5 hours
//    from pylorus to the ileocaecal valve (Guyton & Hall, Textbook of Medical Physiology, 14th ed.,
//    ch. 64). We show a wave at 1.2 cm/s in real time at 1× (one model unit ≈ 1.4 cm).
//  - segmentation: rings that contract and relax in alternation to mix, at the slow-wave rate, about
//    12 per minute in the duodenum and 8–9 per minute in the ileum (Guyton & Hall ch. 64).
//  - the migrating motor complex (MMC): between meals, every 90–120 minutes, a burst of strong
//    contractions (phase III, lasting about 5–10 minutes) sweeps from the stomach to the ileum,
//    clearing out leftovers; eating stops it (Deloose et al., Nat Rev Gastroenterol Hepatol 9:271,
//    2012). The rumbling ("borborygmi") is gas and fluid being pushed along.
// Transit ranges: small intestine about 2–6 h (Guyton & Hall: 3–5 h; Degen & Phillips, Gut 39:299,
// 1996, show wide variation); colon about 12–48 h or more (Metcalf et al., Gastroenterology 92:40,
// 1987: mean about 35 h). Stomach emptying about 2–5 h for a mixed meal (see StomachClear).
import { THREE, M, clamp, lerp, canvasTexture } from '../kit.js';
import { FlexTube, tint, fitNarrow, compactReadout, tissue, rnd, C } from '../gut.js';

const R = 0.9, X0 = -5.2, X1 = 5.2, CM = 1.4;           // tube radius; ends; cm per model unit
const WAVE = 1.2;                                          // cm/s, a typical peristaltic wave
const bump = (d, w) => Math.exp(-(d * d) / (w * w));

export default {
  id: 'peristalsis',
  short: 'Moving food',
  title: 'Squeeze, mix, sweep',
  subtitle: 'Rings of muscle push food along, slosh it back and forth, and tidy up between meals.',
  view: { pos: [-1.5, 4.9, 14.6], target: [-1.5, 2.9, 0] },
  learn: `<p>The wall of the intestine has two layers of muscle: an inner ring of <b>circular muscle</b> that squeezes the tube narrower, and an outer layer of <b>longitudinal muscle</b> that shortens it. You never have to think about them. A network of nerves in the gut wall, the <b>enteric nervous system</b>, runs them by itself. It talks to your brain in both directions, which is why nerves and stress can upset your stomach: the <b>gut–brain axis</b> (see <b>BrainClear</b>).</p>
    <p><b>Peristalsis</b> is a travelling squeeze. Muscle contracts just behind the food and relaxes just in front, so the food is pushed forwards, like toothpaste squeezed along its tube. Each wave moves at about 0.5 to 2 cm a second, but only for a few centimetres, so chyme creeps along at about <b>1 cm a minute</b>. That is why it takes roughly <b>2 to 6 hours</b> to get through the small intestine. The colon is slower still: often <b>12 to 48 hours</b> or more.</p>
    <p><b>Segmentation</b> is mixing. Rings contract, then relax while the rings between them contract, about 12 times a minute near the start and 8 or 9 times near the end. The chyme sloshes back and forth, mixing with juices and touching the lining again and again.</p>
    <p>Between meals, the gut sweeps itself clean. Every 90 to 120 minutes a strong wave, the <b>migrating motor complex</b>, travels all the way down the small intestine and pushes out leftovers and bacteria. Pushing gas and fluid makes noise: the <b>rumble</b> you hear when you are hungry.</p>
    <p class="tip"><b>Try it:</b> watch one peristaltic wave push the food, switch to mixing to see it slosh, then try the housekeeping wave and listen for the growl.</p>`,
  terms: [
    { t: 'Peristalsis', d: 'A wave of muscle contraction that travels along a tube and pushes its contents forwards.' },
    { t: 'Segmentation', d: 'Alternating contractions of nearby rings of muscle that mix the contents back and forth.' },
    { t: 'Enteric nervous system', d: 'The network of nerves in the gut wall that controls its movements, sometimes called the second brain.' },
    { t: 'Migrating motor complex', d: 'A cleaning wave that sweeps the empty small intestine every 90 to 120 minutes between meals.' },
    { t: 'Borborygmi', d: 'The rumbling noises made by gas and fluid moving through the intestines.' },
  ],
  defaults: { mode: 'peristalsis', speed: 1 },
  controls: [
    { key: 'mode', type: 'seg', label: 'Movement', options: [{ v: 'peristalsis', label: 'Peristalsis' }, { v: 'segment', label: 'Mixing' }, { v: 'mmc', label: 'Housekeeping' }] },
    { key: 'speed', type: 'range', label: 'Time-lapse', min: 0.25, max: 4, step: 0.05, ends: ['slow motion', 'fast'], fmt: (v) => (Math.abs(v - 1) < 0.03 ? 'real time' : v.toFixed(2).replace(/0$/, '') + '×') },
  ],
  quiz: [
    { q: 'In peristalsis, where does the muscle contract?', options: ['In front of the food', 'Just behind the food', 'Everywhere at once', 'Only in the stomach'], answer: 1, why: 'A ring squeezes behind the food while the wall ahead relaxes, so the food is pushed forwards.' },
    { q: 'What is segmentation for?', options: ['Moving food fast', 'Mixing chyme with juices and bringing it to the lining', 'Making gas', 'Stopping digestion'], answer: 1, why: 'Alternating rings slosh the contents back and forth without moving them far.' },
    { q: 'What is the migrating motor complex?', options: ['A type of bacteria', 'A cleaning wave between meals', 'A food allergy', 'A valve'], answer: 1, why: 'Every 90 to 120 minutes on an empty gut, a strong wave sweeps out leftovers. Eating switches it off.' },
  ],
  reel: [
    { ms: 5400, caption: 'A ring of muscle squeezes behind the food and relaxes in front: that is peristalsis.', set: { mode: 'peristalsis', speed: 1.6 }, view: { pos: [0.2, 5.2, 10.5], target: [0.4, 3.3, 0] }, spin: 0.25 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); root.position.set(0.6, 3.6, 0); stage.root.add(root);
    let mode = 'peristalsis', xw = X0 - 1.5, segPh = 0, mmcX = X0 - 2, t = 0, squeeze = [];
    // The wall: its radius at each point comes from the current muscle pattern.
    const rings = [-4.5, -3, -1.5, 0, 1.5, 3, 4.5];
    const radiusAt = (x) => {
      if (mode === 'peristalsis') return R * (1 - 0.72 * bump(x - xw, 0.5)) * (1 + 0.14 * bump(x - xw - 1.25, 0.7));
      if (mode === 'segment') { let r = 1; rings.forEach((xr, k) => { const c = k % 2 ? 0.5 - 0.5 * Math.cos(segPh * Math.PI * 2) : 0.5 + 0.5 * Math.cos(segPh * Math.PI * 2); r -= 0.6 * c * bump(x - xr, 0.35); }); return R * r; }
      return R * (1 - 0.85 * bump(x - mmcX, 0.8)) * (1 - 0.12);   // empty gut is a little narrower
    };
    const pts = []; for (let i = 0; i <= 10; i++) pts.push([lerp(X0, X1, i / 10), 0, 0]);
    const wallMat = tissue(0xe8948c, { opacity: 0.5, depthWrite: false });
    const wall = new FlexTube(pts, (u, s, p) => radiusAt(p.x), wallMat, { segs: 260, radial: 28 });
    root.add(wall.mesh);
    // Muscle bands: glow where the wall is squeezing.
    const bandMat = M.glow(0xff5c7a, { transparent: true, opacity: 0.8 });
    const bands = [];
    for (let i = 0; i < 27; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 40), bandMat.clone()); b.rotation.y = Math.PI / 2; b.position.x = X0 + 0.2 + i * 0.4; root.add(b); bands.push(b); }
    // The bolus of chyme and loose chyme particles.
    const bolus = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 18), M.matte(C.chyme, { roughness: 0.6 })); bolus.scale.set(1.5, 1, 1); root.add(bolus);
    const NP = 90, pm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), M.matte(C.chyme), NP); pm.frustumCulled = false; pm.instanceMatrix.setUsage(THREE.DynamicDrawUsage); root.add(pm);
    const home = Float32Array.from({ length: NP }, (_, i) => lerp(X0 + 0.4, X1 - 0.4, rnd(i)));
    const ang = Float32Array.from({ length: NP }, (_, i) => rnd(i + 50) * Math.PI * 2), rr = Float32Array.from({ length: NP }, (_, i) => Math.sqrt(rnd(i + 90)));
    // Gas bubbles for the housekeeping wave.
    const NB = 14, bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 12, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.6 }), NB);
    bub.frustumCulled = false; bub.instanceMatrix.setUsage(THREE.DynamicDrawUsage); root.add(bub);
    const o = new THREE.Object3D();
    const L = (h, p, cls) => tint(stage.label(h, p, root), cls);
    const labs = { behind: L('Contracts behind', [0, 1.65, 0], 'red'), ahead: L('Relaxes ahead', [0, -1.55, 0], 'green'), dir: L('Towards the colon →', [3.6, 1.6, 0], 'side'), growl: L('<b>Grrr…</b> gas pushed along', [0, 1.7, 0], 'gold') };
    labs.growl.element.style.fontSize = '15px';

    // Transit board.
    const board = canvasTexture(1000, 300, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(7,8,12,0.82)'; g.beginPath(); g.roundRect(0, 0, w, h, 26); g.fill();
      g.fillStyle = '#e8ecf4'; g.font = '600 30px Geist, sans-serif'; g.fillText('How long each part holds a meal (typical ranges)', 26, 44);
      const x0 = 260, x1 = w - 40, H = 72, X = (hr) => x0 + (x1 - x0) * (hr / H);
      g.strokeStyle = '#2c3344'; g.fillStyle = '#8a93a6'; g.font = '22px Geist, sans-serif'; g.lineWidth = 2;
      [0, 12, 24, 36, 48, 60, 72].forEach((hr) => { g.beginPath(); g.moveTo(X(hr), 62); g.lineTo(X(hr), h - 40); g.stroke(); g.fillText(hr + ' h', X(hr) - 16, h - 12); });
      const rows = [['Stomach', 2, 5, '#e6a39a'], ['Small intestine', 2, 6, '#ff8fa3'], ['Colon', 12, 48, '#cf9c7c']];
      rows.forEach(([n, a, b, c], k) => {
        const y = 78 + k * 52; g.fillStyle = '#c8cfdd'; g.font = '26px Geist, sans-serif'; g.fillText(n, 26, y + 26);
        g.fillStyle = c; g.fillRect(X(a), y + 6, Math.max(6, X(b) - X(a)), 28);
        if (n === 'Colon') { g.fillStyle = 'rgba(207,156,124,0.35)'; g.fillRect(X(b), y + 6, X(70) - X(b), 28); }
        g.fillStyle = '#e8ecf4'; g.fillText(n === 'Colon' ? '12 to 48 h, or more' : `${a} to ${b} h`, n === 'Colon' ? X(b) - 250 : X(b) + 10, y + 28);
      });
    });
    const boardM = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 2.46), new THREE.MeshBasicMaterial({ map: board.tex, transparent: true, toneMapped: false }));
    boardM.position.set(0.6, 0.9, 1.4); stage.root.add(boardM);

    const fit = fitNarrow(stage, { pos: [0.6, 5.2, 14], target: [0.6, 4.4, 0] });
    let growlT = 0;
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt); const d = dt * s.speed; t += d;
        const narrow = fit();
        if (s.mode !== mode) { mode = s.mode; xw = X0 - 1.5; mmcX = X0 - 2; }
        if (mode === 'peristalsis') { xw += (WAVE / CM) * d; if (xw > X1 + 1.5) xw = X0 - 1.5; }
        if (mode === 'segment') segPh = (segPh + d * (12 / 60)) % 1;
        if (mode === 'mmc') { mmcX += 0.9 * d; if (mmcX > X1 + 2) mmcX = X0 - 2; }   // sped up: real phase III fronts move a few cm a minute
        wall.update();
        bands.forEach((b) => { const r = radiusAt(b.position.x), c = clamp((R - r) / (R * 0.5), 0, 1); b.scale.setScalar(r + 0.02); b.material.opacity = 0.12 + 0.85 * c; });
        // Bolus: rides just ahead of the squeeze.
        bolus.visible = mode === 'peristalsis';
        if (bolus.visible) { const bx = xw + 1.15; bolus.position.set(clamp(bx, X0 + 0.6, X1 - 0.6), 0, 0); const r = radiusAt(bolus.position.x); bolus.scale.set(1.5, r / 0.66, r / 0.66); bolus.visible = bx > X0 && bx < X1 + 0.6; }
        // Particles.
        pm.visible = mode !== 'mmc';
        if (pm.visible) {
          for (let i = 0; i < NP; i++) {
            let x = home[i];
            if (mode === 'segment') {
              rings.forEach((xr, k) => { const c = k % 2 ? 0.5 - 0.5 * Math.cos(segPh * Math.PI * 2) : 0.5 + 0.5 * Math.cos(segPh * Math.PI * 2); const dd = x - xr; if (Math.abs(dd) < 0.75) x += Math.sign(dd || 1) * c * (0.75 - Math.abs(dd)) * 0.9; });
            } else {
              // Loose chyme gets carried along near the bolus.
              const bx = xw + 1.15; if (x < bx + 0.6 && x > xw - 3) x = Math.max(x, xw + 0.4 + (i % 7) * 0.12);
            }
            const r = radiusAt(x) * 0.75 * rr[i];
            o.position.set(x, Math.cos(ang[i]) * r, Math.sin(ang[i]) * r); o.scale.setScalar(1); o.updateMatrix(); pm.setMatrixAt(i, o.matrix);
          }
          pm.instanceMatrix.needsUpdate = true;
        }
        bub.visible = mode === 'mmc';
        if (bub.visible) {
          for (let i = 0; i < NB; i++) { const x = mmcX + 0.9 + (i % 5) * 0.35 + Math.sin(t * 3 + i) * 0.08, r = radiusAt(x) * 0.5 * rnd(i); o.position.set(x, Math.cos(i * 2.4) * r, Math.sin(i * 2.4) * r); o.scale.setScalar(0.6 + rnd(i + 3)); o.updateMatrix(); bub.setMatrixAt(i, o.matrix); }
          bub.instanceMatrix.needsUpdate = true;
        }
        growlT = mode === 'mmc' && mmcX > X0 && mmcX < X1 ? growlT + dt : 0;
        labs.behind.visible = mode === 'peristalsis' && xw > X0 && xw < X1 && !narrow; labs.behind.position.x = xw;
        labs.ahead.visible = mode === 'peristalsis' && xw + 1.3 > X0 && xw + 1.3 < X1 && !narrow; labs.ahead.position.x = xw + 1.3;
        labs.growl.visible = mode === 'mmc' && mmcX > X0 && mmcX < X1 && Math.sin(growlT * 5) > -0.3; labs.growl.position.x = mmcX + 1.2;
        labs.dir.visible = !narrow;
      },
      readout: (s) => {
        const sp = Math.abs(s.speed - 1) < 0.03 ? 'real time' : `${s.speed.toFixed(2).replace(/0$/, '')}× real time`;
        if (s.mode === 'segment') return `<div class="big">Mixing: about 12 squeezes a minute</div>
          <div class="row"><span>Near the start (duodenum)</span><b>about 12 per minute</b></div>
          <div class="row"><span>Near the end (ileum)</span><b>8 to 9 per minute</b></div>
          <div class="row"><span>Showing</span><b>${sp}</b></div>
          <small>The rhythm is set by slow electrical waves in the gut wall. The chyme sloshes to and fro but hardly moves on.</small>`;
        if (s.mode === 'mmc') return `<div class="big">Housekeeping wave</div>
          <div class="row"><span>Comes every</span><b>90 to 120 minutes, between meals</b></div>
          <div class="row"><span>Strong phase lasts</span><b>about 5 to 10 minutes</b></div>
          <div class="row"><span>Showing</span><b>greatly sped up</b></div>
          <small>It sweeps leftovers and bacteria towards the colon. Eating switches it off. The growl is gas and fluid being pushed along.</small>`;
        return `<div class="big">Wave speed: about ${WAVE} cm/s</div>
          <div class="row"><span>Real waves</span><b>0.5 to 2 cm/s, for a few cm</b></div>
          <div class="row"><span>Net progress of chyme</span><b>about 1 cm per minute</b></div>
          <div class="row"><span>Through the small intestine</span><b>about 2 to 6 hours</b></div>
          <div class="row"><span>Showing</span><b>${sp}</b></div>`;
      },
    });
  },
};
