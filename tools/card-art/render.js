// Card art for cards/ (the Gardenbound trading cards): renders Rabbit & Frog: Gardenbound's own 3D models as
// watercolor pictures and saves them to cards/art/*.webp. It runs inside the game's code, so to use it:
//   1. copy this file to Seed-Game/src/.cardArtRender.js (delete it again afterwards)
//   2. node Seed-Game/node_modules/vite/bin/vite.js --config YvyGrounds/tools/card-art/vite.cards.mjs
//   3. open http://localhost:5188/__cards.html to look, then ?save=1 to save (?only=host-roly,crop-apple for some;
//      &tune={"crop-rye":[yaw,pitch,fill,roll]} to turn or zoom one; the saved set used the tune in TUNE below)
// TUNE = {"hero-rabbit":[-0.35,0.18,0.95],"host-tomato":[-0.3,0.18,0.95],"crop-uala":[-0.5,0.3,0.92],"crop-rye":[-0.4,0.15,0.92,-1.0],"crop-wheat":[-0.4,0.15,0.92,-1.0]}
import * as THREE from 'three';
import { seedRandom } from './seed.js';
import { makeWatercolor } from './watercolor.js';
import { makeCropRefresh } from './cropRefresh.js';
import { makeBunny, makeFrog } from './characters.js';
import { makeWallace, makeRoly, makeSpringy } from './scenes/rotHosts.js';
import { makeSquirrel, makeMole, makeMouse } from './scenes/bloomHosts.js';
import { makeZip, makeBumble, makeDot, makeBarnaby, makeRota, makeHennah } from './scenes/critterHosts.js';
import { makeTomatoHost, makeFlytrapHost, makeJackHost } from './scenes/groveHosts.js';
seedRandom(1018);

const W = 720, H = 480;
const BG = { crop: '#eef3dc', host: '#d9ecf6', hero: '#fbeadb', legend: '#f1e6ff' };
const host = (make, prep) => () => { const h = make(); prep?.(h); return h; };
const pair = () => {
  const g = new THREE.Group();
  const b = makeBunny(), f = makeFrog();
  b.position.set(-0.28, 0, 0); b.rotation.y = 0.25;
  f.position.set(0.5, 0, 0.32); f.rotation.y = -0.35; f.scale.multiplyScalar(1.5);
  g.add(b, f);
  g.userData.parts = [b, f];
  return g;
};
const JOBS = [
  ['hero-rabbit', 'hero', makeBunny, -0.35],
  ['hero-frog', 'hero', () => makeFrog(), -0.45],
  ['legend-rabbit-frog', 'legend', pair, 0],
  ['legend-wallace', 'legend', host(makeWallace), 0.5],
  ['host-roly', 'host', host(makeRoly), -0.4],
  ['host-springy', 'host', host(makeSpringy), -0.4],
  ['host-hazel', 'host', host(makeSquirrel), -0.4],
  ['host-digby', 'host', host(makeMole), -0.4],
  ['host-pip', 'host', host(makeMouse), -0.4],
  ['host-zip', 'host', host(makeZip), -0.4],
  ['host-bumble', 'host', host(makeBumble), -0.4],
  ['host-dot', 'host', host(makeDot), -0.4],
  ['host-barnaby', 'host', host(makeBarnaby), -0.4],
  ['host-rota', 'host', host(makeRota), -0.5],
  ['host-hennah', 'host', host(makeHennah), -0.4],
  ['host-tomato', 'host', host(makeTomatoHost, (h) => { h.mood = 'happy'; }), -0.3],
  ['host-flytrap', 'host', host(() => makeFlytrapHost({ fly: false }), (h) => { h.mood = 'happy'; }), -0.3],
  ['host-jack', 'host', host(() => makeJackHost({ lamp: false }), (h) => h.heal?.()), -0.3],
  ...['apple', 'asparagus', 'banana', 'blackberry', 'broccoli', 'cauliflower', 'celery', 'uala', 'kabocha', 'garlic', 'kalo',
    'peach', 'raspberry', 'rye', 'wheat', 'whiteOnion'].map((k) => [`crop-${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`, 'crop', () => { const o = makeCropRefresh(k, { detail: ['rye', 'wheat'].includes(k) }); o.userData.pull?.(0.6); return o; }, -0.5]),
];

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
const painter = makeWatercolor(renderer);
painter.setSize(W, H);
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight('#fff6e0', '#a9c79a', 1.6));
const sun = new THREE.DirectionalLight('#fff1d6', 2.2);
sun.position.set(-3, 7, 6);
scene.add(sun);
const camera = new THREE.PerspectiveCamera(28, W / H, 0.01, 200);

const params = new URLSearchParams(location.search);
const only = params.get('only')?.split(',');
const save = params.get('save') === '1';
const tune = JSON.parse(params.get('tune') || '{}'); // { name: [yaw, pitch, fill] }
window.__done = [];

for (const [name, bg, make, yaw0] of JOBS) {
  if (only && !only.includes(name)) continue;
  try {
    const made = make();
    const obj = made.isObject3D ? made : made.obj;
    // let animated characters settle into a pose (some build their bodies on the first update)
    const movers = [made, ...(obj.userData.parts ?? [])].filter((m) => typeof m.update === 'function');
    for (let i = 0; i < 40; i++) movers.forEach((m) => m.update(1 / 60, 2 + i / 60));
    const [yaw, pitch, fill, roll = 0] = tune[name] ?? [yaw0, 0.18, 0.86];
    const holder = new THREE.Group();
    holder.add(obj);
    holder.rotation.order = 'ZXY';
    holder.rotation.set(pitch, yaw, roll);
    scene.add(holder);
    holder.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    const flat = (o) => o.geometry?.boundingBox || (o.geometry?.computeBoundingBox(), o.geometry?.boundingBox);
    obj.traverse((o) => {
      if (!o.isMesh || !shown(o)) return;
      const bb = flat(o);
      if (bb && bb.max.y - bb.min.y < 0.002) return; // flat blob shadows
      if (o.material?.transparent && o.material.opacity < 0.6) return;
      box.expandByObject(o);
    });
    if (box.isEmpty()) box.setFromObject(holder);
    const c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    const tanV = Math.tan(THREE.MathUtils.degToRad(14));
    const dist = Math.max((sz.y / 2) / (tanV * fill), (sz.x / 2) / (tanV * (W / H) * fill)) + sz.z / 2;
    camera.position.set(c.x, c.y + sz.y * 0.02, c.z + dist);
    camera.lookAt(c);
    camera.near = dist * 0.05; camera.far = dist * 6;
    camera.updateProjectionMatrix();
    scene.background = new THREE.Color(BG[bg]);
    painter.render(scene, camera);
    scene.remove(holder);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H; cv.title = name;
    cv.style.width = '360px';
    cv.getContext('2d').drawImage(renderer.domElement, 0, 0);
    document.body.append(cv);
    if (save) {
      const blob = await new Promise((r) => cv.toBlob(r, 'image/webp', 0.86));
      await fetch(`/__save?name=${name}.webp`, { method: 'POST', body: blob });
    }
    window.__done.push(name);
  } catch (e) {
    console.error(name, e);
    window.__done.push(name + ':ERROR ' + e.message);
  }
}
window.__finished = true;
