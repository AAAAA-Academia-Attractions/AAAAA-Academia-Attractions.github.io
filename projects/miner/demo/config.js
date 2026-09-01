export const COLORS = {
  ink: 0x0e1211,
  paper: 0xf2f0e9,
  pine: 0x183f3a,
  brass: 0xa27d52,
  sage: 0xc8d0cb
};

export const QUERY_TOKENS = ["What", "is", "Q3", "rev?"];
export const PAGE_PATCHES = ["P1", "P2", "P3", "P4", "P5"];

export const BACKBONES = {
  jina: {
    id: "jina",
    label: "Jina-v4",
    readout: "pool",
    layers: ["N-7", "N-6", "N-5", "N-4", "N-3", "N-2", "N-1", "N"],
    baseCount: 3
  },
  eager: {
    id: "eager",
    label: "Eager-v1",
    readout: "eos",
    layers: ["N-7", "N-6", "N-5", "N-4", "N-3", "N-2", "N-1", "N"],
    baseCount: 3
  },
  moca: {
    id: "moca",
    label: "MoCa-3B",
    readout: "pool",
    layers: ["N-7", "N-6", "N-5", "N-4", "N-3", "N-2", "N-1", "N"],
    baseCount: 3
  }
};

export const LAYOUT = {
  layerCount: 8,
  neuronCount: 8,
  cube: 0.52,
  spacing: {
    layer: 1.2,
    neuron: 0.82,
    token: 1.15
  },
  streamX: {
    query: -4.8,
    page: 4.8
  },
  splitShift: {
    norm: -0.82,
    base: 0.64
  },
  probeZ: 2.2
};

export function hash01(a, b, c, d) {
  const n = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719 + d * 4.141) * 43758.5453;
  return n - Math.floor(n);
}

export function activation(layer, neuron, token, stream) {
  const depth = layer / (LAYOUT.layerCount - 1);
  const noise = hash01(layer + 1, neuron + 3, token + 5, stream === "query" ? 1 : 2);
  return Math.min(1, 0.2 + depth * 0.16 + noise * 0.2);
}

function salientNeurons(layer) {
  const n = LAYOUT.neuronCount;
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(hash01(layer + 11, i + 4, 8, 3) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const k = 3 + (hash01(layer + 2, 1, 7, 5) > 0.45 ? 1 : 0);
  return new Set(order.slice(0, k));
}

export function importance(layer, neuron, baseCount) {
  const baseStart = LAYOUT.layerCount - baseCount;
  const isBase = layer >= baseStart;
  const salient = salientNeurons(layer).has(neuron);
  const dip = layer === baseStart ? 0.72 : 1;
  const layerKeep = isBase ? 0.78 * dip : 0.42 + layer * 0.03;
  const n = hash01(layer + 2, neuron + 7, 1, 9);
  return (salient ? 0.9 : 0.16) * layerKeep + n * 0.08;
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
