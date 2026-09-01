import * as THREE from "three";
import { COLORS, LAYOUT, easeInOutCubic } from "./config.js?v=59";
import { env } from "./env.js?v=59";
import { world, latticePosition, driftCells, fusedSlot } from "./lattice.js?v=59";

export const motion = {
  drifting: true,
  generation: 0,
  reduced: false
};

function run(duration, onUpdate) {
  const id = motion.generation;
  const ms = motion.reduced ? 1 : duration;
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now) => {
      if (id !== motion.generation) {
        resolve();
        return;
      }
      const t = Math.min(1, (now - start) / ms);
      onUpdate(easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

function isBaseLayer(layer, backbone) {
  return layer >= LAYOUT.layerCount - backbone.baseCount;
}

function keepRatio(cell, backbone) {
  const base = isBaseLayer(cell.layer, backbone);
  const dip = cell.layer === LAYOUT.layerCount - backbone.baseCount ? 0.72 : 1;
  if (base) return 0.55 + 0.25 * dip;
  return Math.max(0.38, 0.34 + cell.layer * 0.04);
}

function survivorsOf(backbone) {
  const groups = new Map();
  world.cells.forEach((cell) => {
    if (!cell.mesh.visible) return;
    const key = `${cell.stream}-${cell.layer}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(cell);
  });
  const keep = new Set();
  groups.forEach((group) => {
    const ratio = keepRatio(group[0], backbone);
    const k = Math.max(1, Math.round(ratio * group.length));
    group
      .slice()
      .sort((a, b) => b.importance - a.importance)
      .slice(0, k)
      .forEach((cell) => keep.add(cell));
  });
  return keep;
}

export async function assemble() {
  motion.drifting = false;
  const starts = world.cells.map((cell) => cell.mesh.position.clone());
  await run(2400, (t) => {
    world.cells.forEach((cell, i) => {
      cell.mesh.position.lerpVectors(starts[i], cell.home, t);
    });
    world.sprites.forEach((sprite) => {
      sprite.material.opacity = t;
    });
  });
  const preReadout = world.cells.map((cell) => cell.mesh.position.clone());
  await run(2600, (t) => {
    world.cells.forEach((cell, i) => {
      cell.mesh.position.lerpVectors(preReadout[i], cell.readout, t);
      if (!cell.isReadout) {
        cell.mesh.material.opacity = (1 - t) * (0.2 + Math.pow(cell.value, 1.7) * 0.72);
      } else {
        cell.mesh.material.opacity = 0.28 + cell.value * 0.16;
      }
    });
  });
  world.cells.forEach((cell) => {
    if (!cell.isReadout) cell.mesh.visible = false;
    else cell.mesh.material.opacity = 0.28 + cell.value * 0.16;
  });
}

function layerShift(layer, backbone) {
  return isBaseLayer(layer, backbone) ? LAYOUT.splitShift.base : LAYOUT.splitShift.norm;
}

export async function splitLayers() {
  const backbone = world.backbone;
  await run(2200, (t) => {
    world.cells.forEach((cell) => {
      if (!cell.mesh.visible) return;
      const base = isBaseLayer(cell.layer, backbone);
      const from = new THREE.Color(cell.stream === "query" ? COLORS.brass : COLORS.sage);
      const toward = new THREE.Color(base ? COLORS.brass : COLORS.sage);
      cell.mesh.material.color.copy(from.clone().lerp(toward, t * 0.85));
      const y0 = latticePosition("query", cell.layer, 0, 0, true).y;
      cell.mesh.position.y = y0 + layerShift(cell.layer, backbone) * t;
    });
    world.probes.forEach((probe, layer) => {
      const base = isBaseLayer(layer, backbone);
      probe.material.color.set(base ? 0xc4a07a : 0xc8d0cb);
      probe.material.opacity = 0;
      const y0 = latticePosition("query", layer, 0, 0, true).y;
      probe.position.y = y0 + layerShift(layer, backbone) * t;
    });
    world.sprites.forEach((sprite, layer) => {
      const y0 = latticePosition("query", layer, 0, 0, true).y;
      sprite.position.y = y0 + layerShift(layer, backbone) * t;
    });
    const topY = latticePosition("query", LAYOUT.layerCount - 1, 0, 0, true).y + 1.28;
    world.streamLabels.forEach((sprite) => {
      sprite.position.y = topY + LAYOUT.splitShift.base * t;
    });
    world.bands.forEach((sprite) => {
      sprite.material.opacity = t;
    });
  });
  world.cells.forEach((cell) => {
    const y0 = latticePosition("query", cell.layer, 0, 0, true).y;
    cell.readout.y = y0 + layerShift(cell.layer, backbone);
    if (cell.mesh.visible) cell.mesh.position.y = cell.readout.y;
  });
}

function splinePoints(a, b) {
  const mid = a.clone().lerp(b, 0.5);
  mid.z += 1.1;
  return [a, mid, b];
}

export async function probe() {
  const id = motion.generation;
  if (motion.reduced) {
    setLegend(true);
  } else {
    setTimeout(() => {
      if (id === motion.generation) setLegend(true);
    }, 260);
  }
  const visible = world.cells.filter((cell) => cell.mesh.visible);
  visible.forEach((cell, index) => {
    const start = cell.mesh.position.clone().add(new THREE.Vector3(0, 0, LAYOUT.cube * 0.5));
    const probe = world.probes[cell.layer];
    const end = probe.position.clone().add(new THREE.Vector3(0, 0, -LAYOUT.cube * 0.5));
    const curve = new THREE.CatmullRomCurve3(splinePoints(start, end));
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 18, 0.022, 5, false),
      new THREE.MeshBasicMaterial({
        color: 0xf2f0e9,
        transparent: true,
        opacity: 0
      })
    );
    tube.userData.cell = cell;
    env.scene.add(tube);
    world.tubes.push(tube);
    const target = 0.08 + cell.importance * 0.42;
    if (motion.reduced) {
      tube.material.opacity = target;
    } else {
      setTimeout(() => {
        if (id !== motion.generation) return;
        run(420, (t) => {
          tube.material.opacity = t * target;
        });
      }, index * 10);
    }
  });

  await run(1800, (t) => {
    world.cells.forEach((cell) => {
      if (!cell.mesh.visible) return;
      const from = 0.26 + cell.value * 0.12;
      const to = 0.14 + Math.min(1, cell.importance * 1.55) * 0.82;
      cell.mesh.material.opacity = lerp(from, to, t);
      const lit = new THREE.Color(cell.stream === "query" ? 0xe4c49a : 0xe8eeea);
      const baseCol = new THREE.Color(
        isBaseLayer(cell.layer, world.backbone) ? COLORS.brass : COLORS.sage
      );
      cell.mesh.material.color.copy(baseCol.lerp(lit, t * Math.min(1, cell.importance * 1.2)));
    });
    world.probes.forEach((probe, layer) => {
      const base = isBaseLayer(layer, world.backbone);
      probe.material.color.set(base ? 0xc4a07a : 0xc8d0cb);
      probe.material.opacity = t * 0.95;
    });
    world.bands.forEach((sprite) => {
      sprite.material.opacity = 1 - t;
    });
  });
}

export async function selectNeurons() {
  const keep = survivorsOf(world.backbone);
  const fading = world.cells.filter((cell) => cell.mesh.visible && !keep.has(cell));
  const fadeFrom = fading.map((cell) => cell.mesh.material.opacity);
  const keepFrom = [...keep].map((cell) => cell.mesh.material.opacity);
  const tubeFrom = world.tubes.map((tube) => tube.material.opacity);
  const kept = [...keep];

  await run(2000, (t) => {
    fading.forEach((cell, i) => {
      cell.mesh.material.opacity = fadeFrom[i] * (1 - t);
      cell.mesh.scale.setScalar(1 - t * 0.55);
    });
    kept.forEach((cell, i) => {
      const lit = 0.8 + cell.importance * 0.16;
      cell.mesh.material.opacity = keepFrom[i] + (lit - keepFrom[i]) * t;
      cell.mesh.scale.setScalar(1 + t * 0.08);
    });
    world.tubes.forEach((tube, i) => {
      if (!keep.has(tube.userData.cell)) {
        tube.material.opacity = tubeFrom[i] * (1 - t);
      }
    });
  });

  fading.forEach((cell) => {
    cell.mesh.visible = false;
  });
  kept.forEach((cell) => {
    cell.mesh.material.opacity = 0.8 + cell.importance * 0.16;
    cell.mesh.scale.setScalar(1.08);
  });
  world.tubes.forEach((tube) => {
    if (keep.has(tube.userData.cell)) return;
    env.scene.remove(tube);
    tube.geometry.dispose();
    tube.material.dispose();
  });
  world.tubes = world.tubes.filter((tube) => keep.has(tube.userData.cell));
}

function clearTubes() {
  world.tubes.forEach((tube) => {
    env.scene.remove(tube);
    tube.geometry.dispose();
    tube.material.dispose();
  });
  world.tubes = [];
}

export async function fuse() {
  const backbone = world.backbone;
  const survivors = world.cells.filter((cell) => cell.mesh.visible);
  const selectedNorm = survivors.filter((cell) => !isBaseLayer(cell.layer, backbone));
  const baseKept = survivors.filter((cell) => isBaseLayer(cell.layer, backbone));
  const sage = new THREE.Color(COLORS.sage);
  const aligned = new THREE.Color(0xe2c6a0);
  const fusedColor = {
    query: new THREE.Color(COLORS.brass),
    page: new THREE.Color(COLORS.sage)
  };

  function alignedSlot(cell) {
    const slot = fusedSlot(cell.stream, cell.neuron);
    slot.y = cell.readout.y;
    slot.z = 0;
    return slot;
  }

  const overlay = [...world.probes, ...world.sprites, ...world.bands];
  const tubeFrom = world.tubes.map((tube) => tube.material.opacity);
  const labelStarts = world.streamLabels.map((sprite) => sprite.position.clone());
  const labelTargets = world.streamLabels.map((sprite, i) => {
    const stream = i === 0 ? "query" : "page";
    return new THREE.Vector3(LAYOUT.streamX[stream], 1.05, 0);
  });

  await run(300, (t) => {
    world.tubes.forEach((tube, i) => {
      tube.material.opacity = tubeFrom[i] * (1 - t);
    });
  });
  clearTubes();

  const normStarts = selectedNorm.map((cell) => cell.mesh.position.clone());
  const normGates = selectedNorm.map((cell) => world.probes[cell.layer].position.clone());
  const probeFrom = world.probes.map((probe) => probe.material.opacity);
  const selectedOpacity = selectedNorm.map((cell) => cell.mesh.material.opacity);

  await run(1600, (t) => {
    selectedNorm.forEach((cell, i) => {
      cell.mesh.position.lerpVectors(normStarts[i], normGates[i], t);
      cell.mesh.scale.setScalar(lerp(1.08, 0.08, t));
      cell.mesh.material.opacity = lerp(selectedOpacity[i], 0, t);
    });
    world.probes.forEach((probe, layer) => {
      if (isBaseLayer(layer, backbone)) {
        probe.material.opacity = probeFrom[layer] * (1 - t * 0.35);
        return;
      }
      probe.material.opacity = lerp(probeFrom[layer], 1, t);
      probe.scale.setScalar(1 + t * 0.85);
    });
  });

  selectedNorm.forEach((cell) => {
    cell.mesh.visible = false;
  });

  await run(500, (t) => {
    world.probes.forEach((probe, layer) => {
      if (isBaseLayer(layer, backbone)) return;
      probe.scale.setScalar(1.85 + Math.sin(t * Math.PI) * 0.18);
    });
  });

  const normAll = world.cells.filter(
    (cell) => cell.isReadout && !isBaseLayer(cell.layer, backbone)
  );
  const gateAt = (layer) => world.probes[layer].position.clone();
  const normLayers = [...new Set(normAll.map((cell) => cell.layer))].sort((a, b) => a - b);

  normAll.forEach((cell) => {
    cell.mesh.visible = true;
    cell.mesh.position.copy(gateAt(cell.layer));
    cell.mesh.scale.setScalar(0.12);
    cell.mesh.material.opacity = 0;
    cell.mesh.material.color.copy(sage);
  });

  for (const layer of normLayers) {
    const group = normAll.filter((cell) => cell.layer === layer);
    const starts = group.map(() => gateAt(layer));
    const ends = group.map((cell) => alignedSlot(cell));
    await run(620, (t) => {
      group.forEach((cell, i) => {
        cell.mesh.position.lerpVectors(starts[i], ends[i], t);
        cell.mesh.scale.setScalar(lerp(0.12, 1.12, t));
        cell.mesh.material.color.copy(sage.clone().lerp(aligned, t));
        cell.mesh.material.opacity = lerp(0.25, 0.96, t);
      });
      const probe = world.probes[layer];
      probe.scale.setScalar(lerp(1.9, 1.08, t));
      probe.material.opacity = lerp(1, 0.42, t);
    });
  }

  setLegend(false);
  await run(800, () => {});

  const summing = [...baseKept, ...normAll];
  const weights = new Map();
  summing.forEach((cell) => {
    const key = `${cell.stream}-${cell.neuron}`;
    weights.set(key, (weights.get(key) || 0) + cell.importance);
  });

  const afterAlign = summing.map((cell) => cell.mesh.position.clone());
  const fadeFrom = summing.map((cell) => cell.mesh.material.opacity);
  const scaleFrom = summing.map((cell) => cell.mesh.scale.x);
  const colorFrom = summing.map((cell) => cell.mesh.material.color.clone());
  const destinations = summing.map((cell) => fusedSlot(cell.stream, cell.neuron));
  const overlayFrom = overlay.map((item) => item.material.opacity);
  const probeScaleFrom = world.probes.map((probe) => probe.scale.x);

  await run(2600, (t) => {
    summing.forEach((cell, i) => {
      cell.mesh.position.lerpVectors(afterAlign[i], destinations[i], t);
      cell.mesh.material.opacity = fadeFrom[i] * (1 - t * 0.82);
      cell.mesh.scale.setScalar(scaleFrom[i] * (1 - t * 0.28));
      cell.mesh.material.color.copy(colorFrom[i].clone().lerp(fusedColor[cell.stream], t));
    });
    world.fused.forEach((item) => {
      const weight = weights.get(`${item.stream}-${item.neuron}`) || 0;
      item.mesh.material.opacity = t * (0.82 + Math.min(0.18, weight * 0.12));
    });
    overlay.forEach((item, i) => {
      item.material.opacity = overlayFrom[i] * (1 - t);
    });
    world.probes.forEach((probe, layer) => {
      probe.scale.setScalar(lerp(probeScaleFrom[layer], 1, t));
    });
    world.streamLabels.forEach((sprite, i) => {
      sprite.position.lerpVectors(labelStarts[i], labelTargets[i], t);
    });
  });

  overlay.forEach((item) => {
    item.material.opacity = 0;
    if ("visible" in item) item.visible = false;
  });
  summing.forEach((cell) => {
    cell.mesh.visible = false;
    cell.mesh.scale.setScalar(1);
  });
  world.probes.forEach((probe) => {
    probe.scale.setScalar(1);
  });
  clearTubes();
}

export function tick() {
  if (motion.drifting) driftCells();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function setLegend(on) {
  const el = document.getElementById("miner-demo-legend");
  if (!el) return;
  el.classList.toggle("is-on", on);
  el.setAttribute("aria-hidden", on ? "false" : "true");
}
