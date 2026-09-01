import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { EffectComposer } from "EffectComposer";
import { RenderPass } from "RenderPass";
import { UnrealBloomPass } from "UnrealBloomPass";

const FRUSTUM = 15.6;
const ISOMETRIC = new THREE.Vector3(20, 11, 20);

export const env = {
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  controls: null,
  host: null,
  visible: true,
  bloom: null
};

let rotateGen = 0;

function applyFrustum(camera, aspect) {
  const halfH = FRUSTUM / 2;
  const halfW = halfH * aspect;
  camera.left = -halfW;
  camera.right = halfW;
  camera.top = halfH;
  camera.bottom = -halfH;
  camera.updateProjectionMatrix();
}

export function placeIsometricView() {
  env.camera.position.copy(ISOMETRIC);
  env.camera.lookAt(0, 0, 0);
  if (env.controls) {
    env.controls.target.set(0, 0, 0);
    env.controls.update();
  }
}

export function startRotating() {
  if (!env.controls) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const id = ++rotateGen;
  env.controls.autoRotate = true;
  env.controls.autoRotateSpeed = 0;
  const duration = 4800;
  const maxSpeed = 0.22;
  const start = performance.now();
  const tick = (now) => {
    if (id !== rotateGen) return;
    const t = Math.min(1, (now - start) / duration);
    env.controls.autoRotateSpeed = maxSpeed * t * t * t;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function stopRotating() {
  rotateGen += 1;
  if (!env.controls) return;
  env.controls.autoRotate = false;
  env.controls.autoRotateSpeed = 0;
}

export function resetView() {
  stopRotating();
  placeIsometricView();
}

export function initEnv(host) {
  env.host = host;
  env.scene = new THREE.Scene();
  env.scene.background = null;

  const aspect = Math.max(host.clientWidth / Math.max(host.clientHeight, 1), 0.5);
  env.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.5, 1500);
  applyFrustum(env.camera, aspect);
  env.camera.position.copy(ISOMETRIC);
  env.camera.lookAt(0, 0, 0);

  env.renderer = new THREE.WebGLRenderer({ antialias: true });
  env.renderer.setClearColor(0x000000, 1);
  env.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  env.renderer.setSize(host.clientWidth, host.clientHeight);
  env.renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(env.renderer.domElement);

  env.composer = new EffectComposer(env.renderer);
  env.composer.addPass(new RenderPass(env.scene, env.camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(host.clientWidth, host.clientHeight),
    0.14,
    0.45,
    0.28
  );
  env.composer.addPass(bloom);
  env.bloom = bloom;

  env.controls = new OrbitControls(env.camera, env.renderer.domElement);
  env.controls.enableDamping = true;
  env.controls.dampingFactor = 0.5;
  env.controls.enablePan = false;
  env.controls.minZoom = 0.7;
  env.controls.maxZoom = 2.4;
  env.controls.autoRotate = false;
  env.controls.autoRotateSpeed = 0;
  env.controls.target.set(0, 0, 0);
  env.controls.update();

  const resize = () => {
    const w = host.clientWidth;
    const h = Math.max(host.clientHeight, 1);
    applyFrustum(env.camera, w / h);
    env.renderer.setSize(w, h);
    env.composer.setSize(w, h);
  };

  env.resizeObserver = new ResizeObserver(resize);
  env.resizeObserver.observe(host);

  env.intersection = new IntersectionObserver(
    ([entry]) => {
      env.visible = Boolean(entry && entry.isIntersecting);
    },
    { threshold: 0.08 }
  );
  env.intersection.observe(host);

  return env;
}

export function renderFrame() {
  if (!env.composer || !env.visible) return;
  env.controls.update();
  env.composer.render();
}
