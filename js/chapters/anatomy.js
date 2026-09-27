// Chapter 1: the intestines in the abdomen. Duodenum, jejunum and ileum (the small intestine),
// the mesentery that holds them, and the large intestine from caecum and appendix to rectum,
// with the liver, gallbladder and stomach ghosted in. See gut.js for axes, placement and sources.
import { THREE } from '../kit.js';
import { makeTract, tint, sideLabels, fitNarrow, compactReadout } from '../gut.js';

const SC = 0.72;   // model scale in the scene

export default {
  id: 'anatomy',
  short: 'Inside the belly',
  title: 'The intestines, unpacked',
  subtitle: 'A long, folded tube: the small intestine does the absorbing, the large one saves water.',
  view: { pos: [-2.1, 4.5, 10.6], target: [-2.0, 4.0, 0] },
  learn: `<p>After your stomach (see <b>StomachClear</b>) has churned a meal into a soupy paste called <b>chyme</b>, it lets it out a squirt at a time through a ring of muscle, the <b>pylorus</b>. Everything after that is the intestines. We are looking at the belly from the front, so the patient's <b>right</b> is on <b>your left</b>.</p>
    <p>First comes the <b>small intestine</b>, "small" because it is narrow (about 2.5 cm across), not short. Its first 25 cm is the C-shaped <b>duodenum</b>, where bile from the liver and juices from the pancreas pour in. Then comes the <b>jejunum</b> (about two-fifths of the rest, wider and redder) and the <b>ileum</b> (the last three-fifths). In a living person the small intestine is about <b>3 to 5 metres</b> long. You may read "6 to 7 metres": that figure comes from bodies after death, when the muscle in the wall has relaxed and the tube stretches.</p>
    <p>The coils are not loose. A fan-shaped, fatty sheet called the <b>mesentery</b> ties them to the back wall and carries their blood vessels. Its root is only about 15 cm long, but its free edge is metres long, so it is pleated like a frilly skirt.</p>
    <p>At the lower right, the ileum joins the <b>large intestine</b> through the <b>ileocaecal valve</b>, a one-way door. Below it is a pouch, the <b>caecum</b>, with the finger-like <b>appendix</b>. The <b>colon</b> climbs up (ascending), crosses under the liver and stomach (transverse), comes down the left side (descending), makes an S (sigmoid) and ends in the <b>rectum</b>. It is about <b>1.5 m</b> long and about 6 cm wide, with pouches called <b>haustra</b>.</p>
    <p class="tip"><b>Try it:</b> take it apart to see the duodenum curled around the pancreas, then switch on X-ray and follow the yellow chyme as it slowly turns brown in the colon.</p>`,
  terms: [
    { t: 'Chyme', d: 'The soupy mix of part-digested food and stomach juice that enters the small intestine.' },
    { t: 'Duodenum', d: 'The first 25 cm or so of the small intestine, where bile and pancreatic juice join the chyme.' },
    { t: 'Jejunum and ileum', d: 'The middle and last parts of the small intestine, where most nutrients are absorbed.' },
    { t: 'Mesentery', d: 'The fan-shaped fold of tissue that holds the intestines in place and carries their blood vessels and lymph.' },
    { t: 'Ileocaecal valve', d: 'The one-way valve where the small intestine joins the large intestine.' },
    { t: 'Colon', d: 'The main part of the large intestine, about 1.5 m long, which absorbs water and houses most gut bacteria.' },
  ],
  defaults: { explode: 0, xray: false, focus: 'all', labels: true },
  controls: [
    { key: 'explode', type: 'range', label: 'Take it apart', min: 0, max: 1, step: 0.01, ends: ['in the belly', 'apart'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'xray', type: 'toggle', label: 'X-ray: see the contents moving' },
    { key: 'focus', type: 'seg', label: 'Highlight', options: [{ v: 'all', label: 'Everything' }, { v: 'small', label: 'Small intestine' }, { v: 'large', label: 'Large intestine' }] },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'Why is the small intestine called "small"?', options: ['It is short', 'It is narrow, about 2.5 cm across', 'It does little work', 'It only appears in children'], answer: 1, why: 'It is the longest part of the gut, 3 to 5 m in life, but narrower than the large intestine.' },
    { q: 'Why do some books say the small intestine is 6 to 7 m long?', options: ['People used to be taller', 'It was measured after death, when the muscle had relaxed', 'It grows after meals', 'It is a typing error'], answer: 1, why: 'Living gut muscle has tone that keeps it shorter. After death it relaxes and stretches out.' },
    { q: 'Where does the small intestine join the large intestine?', options: ['At the pylorus', 'At the ileocaecal valve, lower right', 'At the rectum', 'In the middle of the transverse colon'], answer: 1, why: 'The ileum opens into the caecum through the ileocaecal valve, in the lower right of the belly.' },
  ],
  reel: [
    { ms: 5400, caption: 'Below your stomach lies 3 to 5 metres of small intestine, folded into your belly.', set: { explode: 0, xray: false, focus: 'all', labels: false }, view: { pos: [0.3, 4.1, 11.2], target: [0.3, 3.5, 0] }, spin: 0.5 },
    { ms: 5600, caption: 'Food takes hours to travel the whole tube, turning from yellow chyme into brown waste in the colon.', set: { explode: 0, xray: true, focus: 'all', labels: false }, anim: { explode: [0, 0.6] }, view: { pos: [3.5, 5.0, 11.0], target: [0.3, 3.5, 0] }, spin: 0.3 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); root.position.set(0, 4.15, 0); root.scale.setScalar(SC); stage.root.add(root);
    const tr = makeTract(stage);
    root.add(tr.root);
    const G = tr.groups, L = (h, p, parent, cls) => tint(stage.label(h, p, parent), cls);
    const labs = {
      duo: L('Duodenum', [-2.5, 1.2, -0.6], G.duodenum, 'pink'),
      jej: L('Jejunum', [2.4, 0.9, 0.7], G.small, 'pink'),
      ile: L('Ileum', [-0.6, -3.3, 0.8], G.small, 'pink'),
      mes: L('Mesentery', [0.4, -0.9, -1.1], G.mesentery, 'fat'),
      icv: L('Ileocaecal valve', [-1.7, -1.55, 0.6], G.colon, 'gold'),
      cae: L('Caecum', [-3.7, -2.7, 0.2], G.colon, 'brown'),
      app: L('Appendix', [-1.4, -4.3, 0.1], G.colon, 'brown'),
      asc: L('Ascending colon', [-4.1, 0.2, -0.3], G.colon, 'brown'),
      trn: L('Transverse colon', [0.2, 1.95, 1.4], G.colon, 'brown'),
      des: L('Descending colon', [4.3, 0.4, -0.5], G.colon, 'brown'),
      sig: L('Sigmoid colon', [2.3, -3.4, 0.7], G.colon, 'brown'),
      rec: L('Rectum', [0.9, -4.6, -0.4], G.colon, 'brown'),
      liv: L('Liver', [-2.6, 5.1, 0.3], G.ghosts, ''),
      sto: L('Stomach (StomachClear)', [2.4, 4.7, 0.2], G.ghosts, ''),
      pan: L('Pancreas', [1.9, 2.95, -0.8], G.pancreas, 'gold'),
    };
    const minimal = ['duo', 'jej', 'ile', 'trn', 'app'];
    const sides = sideLabels(stage, root, -6.1, 3.2);
    const fit = fitNarrow(stage, { pos: [0.3, 5.2, 11.5], target: [0.3, 5.1, 0] });
    let xr = 0;
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt);
        xr += ((s.xray ? 1 : 0) - xr) * Math.min(1, dt * 5);
        tr.setExplode(s.explode);
        tr.setXray(xr, s.focus);
        tr.flow(dt, 0.01);
        const narrow = fit();
        Object.entries(labs).forEach(([k, l]) => {
          const grpHidden = (s.focus === 'small' && ['icv', 'cae', 'app', 'asc', 'trn', 'des', 'sig', 'rec'].includes(k)) || (s.focus === 'large' && ['duo', 'jej', 'ile', 'mes'].includes(k));
          l.visible = s.labels && !grpHidden && (!narrow || minimal.includes(k));
        });
        sides.forEach((l) => { l.visible = s.labels && !narrow; });
      },
      readout: (s) => {
        if (s.focus === 'large') return `<div class="big">Large intestine: about 1.5 m</div>
          <div class="row"><span>Width</span><b>about 6 cm (caecum 7 to 8 cm)</b></div>
          <div class="row"><span>Parts</span><b>caecum, colon, rectum</b></div>
                    <small>Food leftovers spend most of their journey here: often a day or more.</small>`;
        return `<div class="big">Small intestine: 3 to 5 m</div>
          <div class="row"><span>Duodenum</span><b>about 25 cm</b></div>
          <div class="row"><span>Jejunum, then ileum</span><b>about 2/5, then 3/5 of the rest</b></div>
          <div class="row"><span>After death (muscle relaxed)</span><b>6 to 7 m</b></div>
          <small>${s.xray ? 'Yellow: chyme from the stomach. It turns brown in the colon as water is taken out.' : 'Front view: the patient’s right is on your left. Liver, gallbladder and stomach are ghosted.'}</small>`;
      },
    });
  },
};
