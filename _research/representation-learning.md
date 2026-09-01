---
title: Representation Learning
nav: research
parent_area: Algorithm
summary: "Turning a frozen model's internal layers into one retrieval-ready vector, without retraining the backbone."
keywords:
  - Internal representations
  - Layer fusion
  - Dense embeddings
---

## Introduction

A pretrained retriever already computes many hidden states. Most serving stacks keep only the last-layer pooled vector. Earlier layers, and the neurons inside them, still hold retrieval-relevant structure if they can be selected, typed, and fused without collapsing the representation too early.

## Current direction

Current work treats layerwise internal states as the object to learn from: CKA and alignment ratio type the layers, probes reweight neurons, and a fusion head writes them back into a single dense embedding.
