---
title: Multimodal Learning
nav: research
parent_area: Algorithm
summary: "Putting language next to what a model sees, so text, images, and actions stay aligned rather than living in separate spaces."
keywords:
  - Cross-modal alignment
  - Vision-language models
  - Grounding
---

## Introduction

Multimodal learning asks a model to treat language and perception as one problem. A caption, a query, or an agent's utterance has to land on the right region of an image; a claim has to be checkable against a frame, a slide, or a page. The useful signal is split across modalities and layers. Concatenating encoders is not enough—the representations have to stay aligned, whether the job is retrieval, generation, or deciding what to say about what was seen.

## Current direction

Current work studies frozen vision-language backbones and how their internal states can be read, aligned, and fused. Retrieval is one place this shows up: text and vision can share a probe and a single vector. The same alignment question appears when an agent has to ground its language in what it actually perceived.
