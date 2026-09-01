import { BACKBONES } from "./config.js?v=59";
import { initEnv, env, renderFrame, startRotating, resetView } from "./env.js?v=59";
import { buildWorld, disposeWorld } from "./lattice.js?v=59";
import * as Animation from "./animation.js?v=59";

const BACKBONE = BACKBONES.jina;

const STEPS = [
  {
    index: "01",
    title: "Dual readout",
    lead: "Two inputs. One frozen backbone.",
    paras: [
      "Query tokens on the left. Page patches on the right. Both pass through the same model.",
      "The readout then collapses each layer into **one vector** per stream."
    ],
    run: Animation.assemble
  },
  {
    index: "02",
    title: "CKA selects, AR types",
    lead: "Not every layer carries the same kind of signal.",
    paras: [
      "**Normalized CKA** keeps layers close to the retrieval space.",
      "Alignment ratio types them: the last three are **Base**. Earlier layers are **Norm**."
    ],
    run: Animation.splitLayers
  },
  {
    index: "03",
    title: "Two probes",
    lead: "Saliency is the probe weight.",
    paras: [
      "L1 logistic weights mark each neuron's contribution to the prediction.",
      "**BaseProbe** only reweights. **NormProbe** reweights, then row-normalizes.",
      "Text and vision share the **same probe**."
    ],
    run: Animation.probe
  },
  {
    index: "04",
    title: "Adaptive Top-P",
    lead: "Keep the neurons that actually matter.",
    paras: [
      "Rank by saliency. A threshold $\\eta$ keeps the cumulative contribution.",
      "Stronger layers keep more. A **floor** stops any layer from going empty."
    ],
    run: Animation.selectNeurons
  },
  {
    index: "05",
    title: "One vector",
    lead: "Norm is realigned first. Then every layer adds.",
    paras: [
      "Selected **Norm** neurons are pulled into $\\tilde{W}$, then released as a **full** re-aligned vector.",
      "**Base** neurons stay in place:",
      "$$h = m \\odot x$$",
      "Then the fusion head sums:",
      "$$e = \\sum_{l} u_{l} \\odot h^{(l)} + b$$"
    ],
    run: Animation.fuse
  }
];

const state = {
  step: -1,
  busy: false
};

function $(id) {
  return document.getElementById(id);
}

function renderTex(tex, display = false) {
  const span = document.createElement("span");
  span.className = display ? "miner-demo__math miner-demo__math--display" : "miner-demo__math";
  if (window.katex) {
    window.katex.render(tex, span, {
      throwOnError: false,
      displayMode: display,
      output: "html"
    });
  } else {
    span.textContent = tex;
  }
  return span;
}

function formatLine(text) {
  const p = document.createElement("p");
  text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$|\*\*[^*]+\*\*)/g).forEach((part) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      p.append(renderTex(part.slice(2, -2), true));
    } else if (part.startsWith("$") && part.endsWith("$")) {
      p.append(renderTex(part.slice(1, -1), false));
    } else if (part.startsWith("**") && part.endsWith("**")) {
      const mark = document.createElement("strong");
      mark.textContent = part.slice(2, -2);
      p.append(mark);
    } else if (part) {
      p.append(part);
    }
  });
  return p;
}

function renderLegendMath() {
  document.querySelectorAll("#miner-demo-legend [data-tex]").forEach((el) => {
    const tex = el.getAttribute("data-tex");
    if (!tex || !window.katex) return;
    window.katex.render(tex, el, {
      throwOnError: false,
      displayMode: false,
      output: "html"
    });
  });
}

function setCaption(step) {
  $("miner-demo-index").textContent = step.index;
  $("miner-demo-title").textContent = step.title;
  const body = $("miner-demo-body");
  body.replaceChildren();
  const lead = document.createElement("p");
  lead.className = "miner-demo__lead";
  lead.textContent = step.lead;
  body.append(lead);
  step.paras.forEach((line) => body.append(formatLine(line)));
}

function setNav() {
  const prev = $("miner-demo-prev");
  const next = $("miner-demo-next");
  const playing = state.step >= 0;
  prev.hidden = !playing;
  next.hidden = !playing;
  prev.disabled = state.busy;
  next.disabled = state.busy;
  next.textContent = state.step >= STEPS.length - 1 ? "Replay" : "Next";
}

function rebuild() {
  Animation.motion.generation += 1;
  Animation.motion.drifting = false;
  Animation.setLegend(false);
  disposeWorld();
  buildWorld(BACKBONE);
}

async function snapTo(index) {
  const prevReduced = Animation.motion.reduced;
  Animation.motion.reduced = true;
  rebuild();
  for (let i = 0; i <= index; i += 1) {
    await STEPS[i].run();
  }
  Animation.motion.reduced = prevReduced;
}

async function goTo(index, { animate } = { animate: true }) {
  if (state.busy) return;
  if (index < 0) {
    resetDemo();
    return;
  }

  const from = state.step;
  state.busy = true;
  state.step = index;
  setCaption(STEPS[index]);
  setNav();
  $("miner-demo-gate").classList.add("is-gone");
  $("miner-demo-dock").classList.add("is-on");
  $("miner-demo-stage").dataset.playing = "true";
  if (from < 0) startRotating();

  const goingBack = index < from;
  const goingForward = index === from + 1;
  if (!animate || goingBack || from < 0 && index > 0) {
    await snapTo(index);
  } else if (goingForward || from === -1) {
    await STEPS[index].run();
  } else {
    await snapTo(index);
  }

  state.busy = false;
  setNav();
}

async function onNext() {
  if (state.busy) return;
  if (state.step >= STEPS.length - 1) {
    resetDemo();
    return;
  }
  await goTo(state.step + 1, { animate: true });
}

async function onPrev() {
  if (state.busy) return;
  await goTo(state.step - 1, { animate: false });
}

function resetDemo() {
  Animation.motion.generation += 1;
  Animation.motion.drifting = true;
  resetView();
  disposeWorld();
  buildWorld(BACKBONE);
  state.step = -1;
  state.busy = false;
  $("miner-demo-gate").classList.remove("is-gone");
  $("miner-demo-dock").classList.remove("is-on");
  $("miner-demo-stage").dataset.playing = "false";
  Animation.setLegend(false);
  setNav();
}

function loop() {
  requestAnimationFrame(loop);
  Animation.tick();
  renderFrame();
}

function init() {
  const host = $("miner-demo-host");
  if (!host) return;

  Animation.motion.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderLegendMath();
  initEnv(host);
  buildWorld(BACKBONE);
  loop();

  $("miner-demo-play").addEventListener("click", () => goTo(0, { animate: true }));
  $("miner-demo-next").addEventListener("click", onNext);
  $("miner-demo-prev").addEventListener("click", onPrev);

  $("miner-demo-stage").addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      if (state.step < 0) goTo(0, { animate: true });
      else onNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onPrev();
    }
  });

  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
    Animation.motion.reduced = event.matches;
  });
}

init();
