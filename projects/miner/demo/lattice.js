import * as THREE from "three";
import {
  COLORS,
  LAYOUT,
  QUERY_TOKENS,
  PAGE_PATCHES,
  activation,
  importance
} from "./config.js?v=59";
import { env } from "./env.js?v=59";

function colorFor(stream, value) {
  const base = new THREE.Color(stream === "query" ? COLORS.brass : COLORS.sage);
  const lit = new THREE.Color(stream === "query" ? 0xc4a07a : 0xd5ddd8);
  return base.clone().lerp(lit, value * 0.28);
}

function opacityFor(value) {
  return 0.1 + Math.pow(value, 1.35) * 0.28;
}

export function latticePosition(stream, layer, neuron, token, flattened) {
  const { spacing, streamX, layerCount, neuronCount } = LAYOUT;
  const tokenCount = stream === "query" ? QUERY_TOKENS.length : PAGE_PATCHES.length;
  const x = streamX[stream] + (neuron - (neuronCount - 1) / 2) * spacing.neuron;
  const y = (layer - (layerCount - 1) / 2) * spacing.layer;
  const z = flattened ? 0 : (token - (tokenCount - 1) / 2) * spacing.token;
  return new THREE.Vector3(x, y, z);
}

function driftPosition() {
  return new THREE.Vector3(
    (Math.random() - 0.5) * 48,
    (Math.random() - 0.5) * 28,
    (Math.random() - 0.6) * 36
  );
}

function makeCube(color, opacity) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(LAYOUT.cube, LAYOUT.cube, LAYOUT.cube),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity
    })
  );
  return mesh;
}

function latticeLeft(stream) {
  return (
    LAYOUT.streamX[stream] -
    ((LAYOUT.neuronCount - 1) / 2) * LAYOUT.spacing.neuron -
    LAYOUT.cube * 0.55
  );
}

function latticeRight(stream) {
  return (
    LAYOUT.streamX[stream] +
    ((LAYOUT.neuronCount - 1) / 2) * LAYOUT.spacing.neuron +
    LAYOUT.cube * 0.55
  );
}

function makeSprite(text, color, { align = "left", worldHeight = 0.44, opacity = 0, italic = false } = {}) {
  const lines = String(text).split("\n");
  const font = `${italic ? "italic " : ""}600 64px ${italic ? "Newsreader, Georgia, serif" : "Manrope, Helvetica, sans-serif"}`;
  const canvas = document.createElement("canvas");
  const probe = canvas.getContext("2d");
  probe.font = font;
  const width = Math.ceil(Math.max(...lines.map((line) => probe.measureText(line).width)) + 36);
  canvas.width = width;
  canvas.height = 96 * lines.length;
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 48 + i * 96);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      opacity
    })
  );
  sprite.scale.set(worldHeight * (width / 96), worldHeight * lines.length, 1);
  sprite.center.set(align === "right" ? 1 : align === "center" ? 0.5 : 0, 0.5);
  return sprite;
}

export function fusedSlot(stream, neuron) {
  const x = LAYOUT.streamX[stream] + (neuron - (LAYOUT.neuronCount - 1) / 2) * LAYOUT.spacing.neuron;
  return new THREE.Vector3(x, 0, 0);
}

export const world = {
  cells: [],
  probes: [],
  tubes: [],
  sprites: [],
  bands: [],
  fused: [],
  streamLabels: [],
  score: null,
  backbone: null
};

function clearGroup(items, scene) {
  items.forEach((item) => {
    scene.remove(item.mesh || item);
    const obj = item.mesh || item;
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (obj.material.map) obj.material.map.dispose();
      obj.material.dispose();
    }
  });
  items.length = 0;
}

export function disposeWorld() {
  if (!env.scene) return;
  clearGroup(world.cells, env.scene);
  clearGroup(world.probes, env.scene);
  clearGroup(world.tubes, env.scene);
  clearGroup(world.sprites, env.scene);
  clearGroup(world.bands, env.scene);
  clearGroup(world.fused, env.scene);
  clearGroup(world.streamLabels, env.scene);
  if (world.score) {
    env.scene.remove(world.score);
    world.score.geometry.dispose();
    world.score.material.dispose();
    world.score = null;
  }
}

export function buildWorld(backbone) {
  disposeWorld();
  world.backbone = backbone;
  const scene = env.scene;
  const streams = [
    { id: "query", tokens: QUERY_TOKENS },
    { id: "page", tokens: PAGE_PATCHES }
  ];

  streams.forEach((stream) => {
    for (let layer = 0; layer < LAYOUT.layerCount; layer += 1) {
      for (let neuron = 0; neuron < LAYOUT.neuronCount; neuron += 1) {
        for (let token = 0; token < stream.tokens.length; token += 1) {
          const value = activation(layer, neuron, token, stream.id);
          const mesh = makeCube(colorFor(stream.id, value), opacityFor(value));
          const home = latticePosition(stream.id, layer, neuron, token, false);
          const readout = latticePosition(stream.id, layer, neuron, token, true);
          const drift = driftPosition();
          mesh.position.copy(drift);
          scene.add(mesh);
          world.cells.push({
            mesh,
            stream: stream.id,
            layer,
            neuron,
            token,
            value,
            importance: importance(layer, neuron, backbone.baseCount),
            home,
            readout,
            isReadout: false,
            drift,
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.028,
              (Math.random() - 0.5) * 0.018,
              (Math.random() - 0.5) * 0.024
            )
          });
        }
      }
    }
  });

  const groups = new Map();
  world.cells.forEach((cell) => {
    const key = `${cell.stream}-${cell.layer}-${cell.neuron}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(cell);
  });
  groups.forEach((group) => {
    if (backbone.readout === "eos") {
      const last = Math.max(...group.map((cell) => cell.token));
      group.forEach((cell) => {
        cell.isReadout = cell.token === last;
      });
    } else {
      let best = group[0];
      group.forEach((cell) => {
        if (cell.value > best.value) best = cell;
      });
      group.forEach((cell) => {
        cell.isReadout = cell === best;
      });
    }
  });

  const midX = (LAYOUT.streamX.query + LAYOUT.streamX.page) / 2;

  for (let layer = 0; layer < LAYOUT.layerCount; layer += 1) {
    const probe = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 18, 12),
      new THREE.MeshBasicMaterial({
        color: COLORS.paper,
        transparent: true,
        opacity: 0
      })
    );
    probe.position.set(
      midX,
      latticePosition("query", layer, 0, 0, true).y,
      LAYOUT.probeZ
    );
    scene.add(probe);
    world.probes.push(probe);

    const fromTop = LAYOUT.layerCount - 1 - layer;
    const sprite = makeSprite(fromTop === 0 ? "N" : `N-${fromTop}`, "#F2F0E9", {
      align: "center",
      worldHeight: 0.4
    });
    sprite.position.set(
      midX,
      latticePosition("query", layer, 0, 0, true).y,
      0
    );
    scene.add(sprite);
    world.sprites.push(sprite);
  }

  const split = LAYOUT.layerCount - backbone.baseCount;
  const bandX = latticeRight("page") + 1.35;
  const normY =
    (latticePosition("query", 0, 0, 0, true).y +
      latticePosition("query", split - 1, 0, 0, true).y) /
      2 +
    LAYOUT.splitShift.norm;
  const baseY =
    (latticePosition("query", split, 0, 0, true).y +
      latticePosition("query", LAYOUT.layerCount - 1, 0, 0, true).y) /
      2 +
    LAYOUT.splitShift.base;

  const normLabel = makeSprite("Norm", "#C8D0CB", { align: "left", worldHeight: 0.4 });
  const baseLabel = makeSprite("Base", "#A27D52", { align: "left", worldHeight: 0.4 });
  normLabel.position.set(bandX, normY, 0);
  baseLabel.position.set(bandX, baseY, 0);
  scene.add(normLabel, baseLabel);
  world.bands = [normLabel, baseLabel];

  const topY = latticePosition("query", LAYOUT.layerCount - 1, 0, 0, true).y + 1.28;
  const queryLabel = makeSprite("QUERY", "#A27D52", { align: "center", worldHeight: 0.42, opacity: 1 });
  const pageLabel = makeSprite("PAGE", "#C8D0CB", { align: "center", worldHeight: 0.42, opacity: 1 });
  queryLabel.position.set(LAYOUT.streamX.query, topY, 0);
  pageLabel.position.set(LAYOUT.streamX.page, topY, 0);
  scene.add(queryLabel, pageLabel);
  world.streamLabels = [queryLabel, pageLabel];

  ["query", "page"].forEach((stream) => {
    for (let neuron = 0; neuron < LAYOUT.neuronCount; neuron += 1) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(LAYOUT.cube * 0.88, LAYOUT.cube * 0.72, LAYOUT.cube * 0.72),
        new THREE.MeshBasicMaterial({
          color: stream === "query" ? COLORS.brass : COLORS.sage,
          transparent: true,
          opacity: 0
        })
      );
      mesh.position.copy(fusedSlot(stream, neuron));
      scene.add(mesh);
      world.fused.push({ mesh, stream, neuron });
    }
  });

  world.score = null;
}

export function driftCells() {
  world.cells.forEach((cell) => {
    cell.drift.add(cell.velocity);
    cell.mesh.position.copy(cell.drift);
  });
}
