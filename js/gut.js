// IntestineClear's shared models and helpers: a flexible tube whose radius can change along its
// length every frame (for haustra, peristalsis and swelling), the whole intestinal tract placed in
// the abdomen, villi, gut-lining cells, labels and small layout helpers.
//
// Orientation: we look at the patient from the front (anterior view), as in an anatomy atlas, so
// the patient's RIGHT side is on YOUR LEFT. Abdomen axes: +x = patient's left, +y = up (towards the
// head), +z = forwards (towards you). Origin ≈ the navel (L3/L4). One model unit ≈ 4 cm.
// Placement follows standard anatomy (Gray's Anatomy, 42nd ed.; NIDDK "Your Digestive System &
// How It Works"; Kenhub/TeachMeAnatomy summaries):
//  - the duodenum (~25 cm) curves in a C around the head of the pancreas, from the pylorus at the
//    transpyloric plane (L1), down the right side, across at L3 and up to the duodenojejunal flexure
//    left of L2; it lies behind the peritoneum (retroperitoneal);
//  - jejunum coils sit mostly upper left, ileum coils lower right and in the pelvis; the mesentery's
//    root (~15 cm) runs obliquely from the DJ flexure down to the right sacroiliac joint;
//  - the ileum joins the caecum at the ileocaecal valve in the right iliac fossa; the appendix hangs
//    from the caecum below it; ascending colon up the right flank to the hepatic flexure (under the
//    liver), the transverse colon sags forwards across, the splenic flexure sits higher than the
//    hepatic one, then descending colon, the S-shaped sigmoid, rectum and anal canal.
// Lengths: small intestine ~3–5 m in a living person (Teitelbaum et al., Clin Anat 26:827, 2013,
// measured ~5 m in relaxed bowel at surgery; tube studies in awake people give ~3 m), but 6–7 m in
// cadavers where muscle tone is lost (Hounnou et al., Surg Radiol Anat 24:290, 2002: whole
// intestine ≈ 7.9 m in 200 cadavers). Large intestine ≈ 1.5 m (NIDDK; Gray's). Diameters: small
// intestine ≈ 2.5 cm, colon ≈ 6 cm, caecum ≈ 7.5 cm (Gray's).
import { THREE, M, tube, clamp, lerp, smooth } from './kit.js';

// ---------------------------------------------------------------- colours
export const C = {
  jejunum: 0xe0837f, ileum: 0xeba79a, duodenum: 0xe39a86, colon: 0xcf9c7c, appendix: 0xd79a80,
  mesentery: 0xf2d58a, artery: 0xe8434f, lacteal: 0xfff1b8, liver: 0x8a3b2e, stomach: 0xe6a39a,
  pancreas: 0xe8c47a, gall: 0x55a85c, chyme: 0xffd27a, stool: 0x8a5a2b, bile: 0x8fd35a,
  enzyme: 0x8fd0ff, acid: 0xff6a3d, water: 0x6fb7ff, glucose: 0xffffff, amino: 0x7aa2ff, fat: 0xffd166,
  scfa: 0xffa94d,
};

// Label tints.
const TINT = { side: '#8ef0ff', gold: '#ffd166', red: '#ff8a94', green: '#9be37a', blue: '#8fb0ff', fat: '#ffe08a', pink: '#ffb3c1', brown: '#e0b08a' };
export function tint(l, cls) { const c = TINT[cls]; if (c) { l.element.style.borderColor = c; l.element.style.color = c; } return l; }

export function sideLabels(stage, parent, y, x) {
  return [
    tint(stage.label("← Patient's right", [-x, y, 1.2], parent), 'side'),
    tint(stage.label("Patient's left →", [x, y, 1.2], parent), 'side'),
  ];
}

// Deterministic "random" numbers so every run (and every video frame) looks the same.
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// On phones, jump straight to a wider framing (unless recording or the viewer has orbited).
export function fitNarrow(stage, view) {
  let done = false;
  return () => {
    const narrow = stage.host.clientWidth < 560;
    if (narrow && !done && !stage.moved && !document.body.classList.contains('gb-reel')) { stage.setView(view.pos, view.target, 0.01); done = true; }
    return narrow;
  };
}

// On phones the readout would cover the model, so keep only its headline and two rows.
export function compactReadout(stage, api) {
  const full = api.readout;
  if (!full) return api;
  api.readout = (s) => {
    const html = full(s);
    if (stage.host.clientWidth >= 560 || !html) return html;
    let rows = 0;
    return html.replace(/<small>[\s\S]*?<\/small>/g, '').replace(/<div class="row">[\s\S]*?<\/div>/g, (m) => (++rows <= 2 ? m : ''));
  };
  return api;
}

// A glossy, living-tissue material that can fade for the X-ray view.
export const tissue = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.35, transparent: true, opacity: 1, side: THREE.DoubleSide, ...o });
export function setOpacity(mat, a) { mat.opacity = a; mat.depthWrite = a > 0.95; mat.visible = a > 0.01; }

// ---------------------------------------------------------------- flexible tube
// A tube along a smooth curve through `points`. radius(u, s, p) gives the radius at fraction u of
// the length (s = distance along, p = the centre point), and can change every frame: call update().
export class FlexTube {
  constructor(points, radius, mat, { segs = 200, radial = 18 } = {}) {
    this.segs = segs; this.radial = radial; this.radius = radius;
    const n = (segs + 1) * radial;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const idx = [];
    for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) {
      const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = a + radial, d = b + radial;
      idx.push(a, c, b, b, c, d);
    }
    g.setIndex(idx);
    this.mesh = new THREE.Mesh(g, mat);
    this.mesh.castShadow = true; this.mesh.receiveShadow = true;
    this.setPoints(points);
  }
  setPoints(points) {
    this.curve = new THREE.CatmullRomCurve3(points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p))), false, 'centripetal');
    this.length = this.curve.getLength();
    this.frames = this.curve.computeFrenetFrames(this.segs, false);
    this.centres = []; for (let i = 0; i <= this.segs; i++) this.centres.push(this.curve.getPointAt(i / this.segs));
    this.update();
  }
  update() {
    const pos = this.mesh.geometry.attributes.position.array, R = this.radial, { normals, binormals } = this.frames;
    for (let i = 0; i <= this.segs; i++) {
      const u = i / this.segs, P = this.centres[i], N = normals[i], B = binormals[i];
      const r = this.radius(u, u * this.length, P);
      for (let j = 0; j < R; j++) {
        const a = (j / R) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), k = (i * R + j) * 3;
        pos[k] = P.x + r * (c * N.x + s * B.x); pos[k + 1] = P.y + r * (c * N.y + s * B.y); pos[k + 2] = P.z + r * (c * N.z + s * B.z);
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
    this.mesh.geometry.computeBoundingSphere();
  }
  at(u, target = new THREE.Vector3()) { return this.curve.getPointAt(clamp(u, 0, 1), target); }
}

// Haustra: the colon's row of pouches, one about every 3–4 cm (≈ 0.9 model units).
export const haustra = (r0, s, depth = 0.14) => r0 * (1 - depth + depth * (0.5 + 0.5 * Math.cos((s / 0.9) * Math.PI * 2)) ** 0.6);

// ---------------------------------------------------------------- the tract in the abdomen
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// The small-intestine coils: rows of loops, jejunum from upper left, ileum ending lower right.
function smallIntestinePath() {
  const pts = [V(0.9, 1.75, -0.55), V(1.5, 1.55, 0.0)];
  const rows = [1.05, 0.3, -0.45, -1.2, -1.95, -2.7];
  rows.forEach((y, r) => {
    const dir = r % 2 ? 1 : -1, xa = dir < 0 ? 2.15 : -1.75, xb = dir < 0 ? -1.75 : 2.15;
    const n = 7, zb = r % 2 ? 0.15 : 0.62;
    for (let k = 0; k <= n; k++) {
      const x = lerp(xa, xb, k / n) + (rnd(r * 17 + k) - 0.5) * 0.18;
      const up = k % 2 ? 1 : -1;
      pts.push(V(x, y + up * 0.3 + (rnd(r * 31 + k) - 0.5) * 0.12, zb + up * 0.22 + (rnd(r * 7 + k) - 0.5) * 0.2));
    }
  });
  // The last ileal segment runs up and right into the caecum's inner (medial) side.
  pts.push(V(-1.2, -2.55, 0.5), V(-1.7, -2.15, 0.25), V(-2.05, -2.05, 0.1));
  return pts;
}

export const PATHS = {
  duodenum: [V(-0.55, 2.6, 0.55), V(-1.15, 2.7, 0.15), V(-1.6, 2.45, -0.35), V(-1.78, 1.75, -0.6), V(-1.75, 0.9, -0.6), V(-1.35, 0.38, -0.5), V(-0.5, 0.25, -0.35), V(0.4, 0.35, -0.45), V(0.85, 0.85, -0.6), V(0.95, 1.5, -0.65), V(0.9, 1.75, -0.55)],
  small: smallIntestinePath(),
  colon: [V(-2.5, -2.85, 0.25), V(-2.65, -2.2, 0.1), V(-2.85, -1.3, -0.1), V(-2.95, 0.2, -0.3), V(-2.85, 1.6, -0.3), V(-2.45, 2.3, 0.15), V(-1.55, 2.05, 0.95), V(-0.4, 1.55, 1.25), V(0.8, 1.6, 1.25), V(2.0, 2.25, 0.9), V(2.85, 3.0, 0.05), V(3.15, 2.2, -0.5), V(3.15, 0.0, -0.5), V(3.0, -1.8, -0.4), V(2.6, -2.6, 0.1), V(1.6, -3.05, 0.6), V(0.6, -2.75, 0.55), V(0.2, -3.35, 0.0), V(0.0, -3.9, -0.6), V(0.0, -4.65, -0.4), V(0.0, -5.2, 0.05)],
  appendix: [V(-2.3, -2.95, -0.05), V(-2.1, -3.45, -0.2), V(-1.75, -3.8, -0.1), V(-1.45, -3.9, 0.05)],
};

// Colon segments as fractions of its path (worked out from the control points above).
export const COLON = { caecum: [0, 0.07], ascending: [0.07, 0.27], transverse: [0.27, 0.55], descending: [0.55, 0.72], sigmoid: [0.72, 0.87], rectum: [0.87, 0.97], anal: [0.97, 1] };
function colonRadius(u, s) {
  // Caecum ≈ 7.5 cm across, colon ≈ 6 cm narrowing to ≈ 5 cm at the sigmoid, rectal ampulla wider.
  const base = u < 0.07 ? lerp(0.95, 0.78, u / 0.07) : u < 0.55 ? lerp(0.74, 0.62, (u - 0.07) / 0.48) : u < 0.87 ? lerp(0.6, 0.5, (u - 0.55) / 0.32) : u < 0.95 ? 0.66 : lerp(0.66, 0.28, (u - 0.95) / 0.05);
  return u > 0.87 ? base : haustra(base, s);
}

// Builds the whole tract. Returns groups (for exploding and dimming), the tubes, and helpers.
export function makeTract(stage, opts = {}) {
  const { ghosts = true, mesentery = true } = opts;
  const root = new THREE.Group();
  const mats = {
    duo: tissue(C.duodenum), jej: tissue(C.jejunum), ile: tissue(C.ileum), col: tissue(C.colon), app: tissue(C.appendix),
  };
  const g = { duodenum: new THREE.Group(), small: new THREE.Group(), colon: new THREE.Group(), ghosts: new THREE.Group(), mesentery: new THREE.Group(), pancreas: new THREE.Group() };
  Object.values(g).forEach((x) => root.add(x));

  const duo = new FlexTube(PATHS.duodenum, (u) => 0.36 - 0.06 * u, mats.duo, { segs: 80 });
  g.duodenum.add(duo.mesh);
  // Jejunum (first ~2/5 of the rest, wider, redder) and ileum (last ~3/5, narrower, paler): Gray's.
  const all = PATHS.small, cut = Math.round(all.length * 0.4);
  const jej = new FlexTube(all.slice(0, cut + 1), (u) => 0.33 - 0.02 * u, mats.jej, { segs: 320, radial: 14 });
  const ile = new FlexTube(all.slice(cut), (u) => 0.3 - 0.04 * u, mats.ile, { segs: 420, radial: 14 });
  g.small.add(jej.mesh, ile.mesh);
  const col = new FlexTube(PATHS.colon, colonRadius, mats.col, { segs: 360, radial: 20 });
  const app = new FlexTube(PATHS.appendix, (u) => 0.12 * (1 - 0.3 * u), mats.app, { segs: 30, radial: 10 });
  g.colon.add(col.mesh, app.mesh);
  // Ileocaecal valve: two lips where the ileum pokes into the caecum.
  const icv = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.07, 10, 24), tissue(0xf4c2b0));
  icv.position.set(-2.12, -2.03, 0.08); icv.lookAt(V(-3, -2.2, 0)); g.colon.add(icv);

  // Mesentery: a fan-pleated fatty sheet from its short root to the whole length of the coils.
  let mesMat = null;
  if (mesentery) {
    const r0 = V(0.9, 1.45, -1.0), r1 = V(-1.55, -2.1, -0.9), N = 360;
    const pos = [], idx = [];
    const curve = new THREE.CatmullRomCurve3(all, false, 'centripetal');
    for (let i = 0; i <= N; i++) {
      const u = i / N, G = curve.getPointAt(u), R = r0.clone().lerp(r1, u);
      const Gb = G.clone().add(R.clone().sub(G).setLength(0.22));  // meet the back of the tube
      pos.push(R.x, R.y, R.z, Gb.x, Gb.y, Gb.z);
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    mesMat = new THREE.MeshStandardMaterial({ color: C.mesentery, transparent: true, opacity: 0.35, roughness: 0.6, side: THREE.DoubleSide, depthWrite: false });
    g.mesentery.add(new THREE.Mesh(geo, mesMat));
    // Superior mesenteric artery along the root, with branches out to the gut (arcades).
    const artMat = M.glow(C.artery);
    g.mesentery.add(tube([r0.toArray(), [-0.3, -0.3, -0.95], r1.toArray()], 0.05, artMat, false, 30));
    for (let k = 0; k < 16; k++) {
      const u = (k + 0.5) / 16, R = r0.clone().lerp(r1, u), G = curve.getPointAt(u);
      const mid = R.clone().lerp(G, 0.55).add(V(0, 0, -0.15));
      g.mesentery.add(tube([R.toArray(), mid.toArray(), G.clone().lerp(R, 0.12).toArray()], 0.022, artMat, false, 16));
    }
  }

  // Neighbours, ghosted: liver (upper right), gallbladder, stomach (upper left), pancreas in the C.
  const ghostMats = [];
  const gm = (c, o = 0.16) => { const m = M.ghost(c, o); ghostMats.push([m, o]); return m; };
  if (ghosts) {
    const liver = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), gm(C.liver, 0.2));
    liver.scale.set(2.5, 1.25, 1.55); liver.position.set(-1.75, 4.05, 0); liver.rotation.z = -0.22;
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), gm(C.liver, 0.2));
    lobe.scale.set(1.4, 0.6, 1.0); lobe.position.set(0.7, 4.35, 0.35); lobe.rotation.z = 0.25;
    const gb = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), gm(C.gall, 0.3)); gb.scale.set(0.3, 0.55, 0.3); gb.position.set(-1.7, 2.95, 0.95); gb.rotation.z = 0.5;
    const stom = tube([[1.5, 4.55, -0.2], [2.0, 3.8, 0.2], [1.8, 2.95, 0.5], [1.0, 2.45, 0.7], [0.1, 2.45, 0.7], [-0.5, 2.6, 0.55]], 0.72, gm(C.stomach, 0.2), false, 60);
    g.ghosts.add(liver, lobe, gb, stom);
    g.ghosts.userData.parts = { liver, stom, gb };
  }
  const panc = tube([[-1.3, 0.9, -0.55], [-1.2, 1.55, -0.6], [-0.3, 1.9, -0.8], [1.2, 2.3, -0.9], [2.6, 2.7, -0.8]], 0.36, gm(C.pancreas, 0.32), false, 60);
  g.pancreas.add(panc);

  // Chyme / stool dots for the X-ray view: they travel the whole way through.
  const route = [
    { t: duo, w: 0.06 }, { t: jej, w: 0.37 }, { t: ile, w: 0.37 }, { t: col, w: 0.2 },
  ];
  const ND = 120;
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), ND);
  dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dots.frustumCulled = false; root.add(dots);
  const du = Float32Array.from({ length: ND }, (_, i) => i / ND);
  const cChyme = new THREE.Color(C.chyme), cStool = new THREE.Color(C.stool), cc = new THREE.Color();
  for (let i = 0; i < ND; i++) dots.setColorAt(i, cChyme);
  const o3 = new THREE.Object3D(), p = new THREE.Vector3();
  const place = (u) => {
    let acc = 0;
    for (let k = 0; k < route.length; k++) { const r = route[k]; if (u <= acc + r.w || k === route.length - 1) { const lu = clamp((u - acc) / r.w, 0, 1); r.t.at(lu, p); return [k, lu, r.t.mesh.parent]; } acc += r.w; }
  };

  const parts = [
    { key: 'ghosts', obj: g.ghosts, off: [0, 3.2, -0.5] },
    { key: 'pancreas', obj: g.pancreas, off: [0, 1.4, -3.2] },
    { key: 'duodenum', obj: g.duodenum, off: [-0.4, 1.0, -2.2] },
    { key: 'colon', obj: g.colon, off: [0, 0, -2.4] },
    { key: 'small', obj: g.small, off: [0, -0.6, 3.0] },
    { key: 'mesentery', obj: g.mesentery, off: [0, -0.6, 1.4] },
  ];
  parts.forEach((q) => { q.home = q.obj.position.clone(); });

  const tissueMats = Object.values(mats).concat([icv.material]);
  const api = {
    root, groups: g, tubes: { duo, jej, ile, col, app }, mats, icv,
    setExplode(k) { const e = smooth(k); parts.forEach((q) => q.obj.position.copy(q.home).add(V(...q.off).multiplyScalar(e))); },
    // x-ray k: 0 = solid walls, 1 = see-through walls with contents visible.
    setXray(k, focus = 'all') {
      const f = { duo: focus !== 'large', jej: focus !== 'large', ile: focus !== 'large', col: focus !== 'small', app: focus !== 'small' };
      Object.entries(mats).forEach(([key, m]) => setOpacity(m, (f[key] ? 1 : 0.12) * lerp(1, 0.3, k)));
      setOpacity(icv.material, (f.col ? 1 : 0.12) * lerp(1, 0.6, k));
      if (mesMat) mesMat.opacity = (focus === 'large' ? 0.08 : 0.35) * lerp(1, 0.5, k);
      g.mesentery.visible = focus !== 'large';
      dots.visible = k > 0.05;
    },
    showGhosts(on) { g.ghosts.visible = on; },
    // Move the contents along. rate: fraction of the whole route per second.
    flow(dt, rate = 0.012) {
      if (!dots.visible) return;
      for (let i = 0; i < ND; i++) {
        du[i] = (du[i] + rate * dt * (du[i] > 0.8 ? 0.35 : 1)) % 1;   // slower in the colon
        const [k, lu, parent] = place(du[i]);
        // Put the dot in root space (groups may be exploded).
        p.add(parent.position);
        const j = 0.12 * (rnd(i) - 0.5), j2 = 0.12 * (rnd(i + 99) - 0.5);
        o3.position.set(p.x + j, p.y + j2, p.z + j * 0.7);
        o3.scale.setScalar(k === 3 ? 1.5 + lu : 1); o3.updateMatrix(); dots.setMatrixAt(i, o3.matrix);
        cc.copy(cChyme).lerp(cStool, k === 3 ? clamp(lu * 1.4, 0, 1) : 0); dots.setColorAt(i, cc);
      }
      dots.instanceMatrix.needsUpdate = true; dots.instanceColor.needsUpdate = true;
    },
    ghostMats, tissueMats,
  };
  api.setXray(0);
  return api;
}

// ---------------------------------------------------------------- villus
// A finger-shaped villus (≈ 0.5–1 mm tall in life) along +y, base at y = 0.
export function villusGeometry(h = 2.4, r = 0.36, seg = 18) {
  const pts = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16, y = t * h; const rr = t < 0.82 ? r * (1.08 - 0.12 * t) : r * 0.98 * Math.sqrt(Math.max(0, 1 - ((t - 0.82) / 0.18) ** 2)); pts.push(new THREE.Vector2(Math.max(0.001, rr), y)); }
  pts.unshift(new THREE.Vector2(r * 1.25, 0));
  const g = new THREE.LatheGeometry(pts, seg); g.computeVertexNormals();
  return g;
}

// A column of gut-lining cells (enterocytes) with a brush border of microvilli on top.
// Each cell is ≈ 20–25 µm tall; microvilli ≈ 1 µm tall and ≈ 0.1 µm wide, a few thousand per cell
// (Alberts, Molecular Biology of the Cell; Crawley et al., J Cell Biol 2014). Drawn stylised.
export function makeCells(n = 5, { w = 1.3, h = 3.2, d = 1.3, mvPerRow = 7 } = {}) {
  const grp = new THREE.Group();
  const cellMat = new THREE.MeshPhysicalMaterial({ color: 0xf0b8b0, roughness: 0.4, clearcoat: 0.4, transparent: true, opacity: 0.55, depthWrite: false });
  const nucMat = M.matte(0x7c5aa8);
  const cells = [];
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * (w + 0.04);
    const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cellMat); c.position.set(x, 0, 0); grp.add(c);
    const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 12), nucMat); nuc.scale.set(1, 1.5, 1); nuc.position.set(x, -h * 0.22, 0); grp.add(nuc);
    cells.push(c);
  }
  const count = n * mvPerRow * mvPerRow;
  const mv = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.055, 0.42, 4, 8), M.plastic(0xf6c8c0), count);
  const o = new THREE.Object3D(); let k = 0;
  for (let i = 0; i < n; i++) for (let a = 0; a < mvPerRow; a++) for (let b = 0; b < mvPerRow; b++) {
    const x = (i - (n - 1) / 2) * (w + 0.04) + ((a + 0.5) / mvPerRow - 0.5) * w * 0.94;
    const z = ((b + 0.5) / mvPerRow - 0.5) * d * 0.94;
    o.position.set(x, h / 2 + 0.26, z); o.updateMatrix(); mv.setMatrixAt(k++, o.matrix);
  }
  grp.add(mv);
  return { grp, cells, mv, top: h / 2 + 0.5, bottom: -h / 2, width: n * (w + 0.04) };
}

// A group whose materials can all fade together (for zoom transitions).
export function fader(group) {
  const mats = [];
  group.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (!mats.find((x) => x[0] === m)) mats.push([m, m.opacity ?? 1, m.transparent]); }); });
  return (a) => {
    group.visible = a > 0.01;
    mats.forEach(([m, o0, tr]) => { m.transparent = tr || a < 0.99; m.opacity = o0 * a; if (!tr) m.depthWrite = a > 0.99; });
  };
}

// Point on a polyline-ish path for particles.
export function pathOf(points) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p))), false, 'centripetal');
  return { curve, at: (u, t = new THREE.Vector3()) => curve.getPointAt(clamp(u, 0, 1), t) };
}
