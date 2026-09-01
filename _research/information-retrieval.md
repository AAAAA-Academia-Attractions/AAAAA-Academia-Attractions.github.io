---
title: Information Retrieval
nav: research
parent_area: Algorithm
summary: "Retrieving visually rich documents without giving up the storage and serving cost of a single dense vector."
keywords:
  - Visual document retrieval
  - Dense retrieval
  - Multimodal embeddings
---

## Introduction

Visual document retrieval asks a model to find the right page from a slide, scan, or poster, using the rendered image rather than a brittle OCR pipeline. Late-interaction retrievers keep token-level matching and high quality; dense single-vector retrievers keep a compact index. The open question is how much of that quality can be recovered without multiplying the stored vectors.

## Current direction

Current work probes internal transformer layers for retrieval-relevant signal and fuses it into one embedding, so a dense retriever can close the gap to late interaction without changing the backbone or the serving footprint.
