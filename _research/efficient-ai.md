---
title: Efficient AI
nav: research
parent_area: Algorithm
summary: "Keeping retrieval quality while storing one vector per page, so the index and the search stay cheap."
keywords:
  - Index efficiency
  - Single-vector retrieval
  - Serving cost
---

## Introduction

Late-interaction retrievers raise quality by storing many token vectors for every page. That cost grows with the corpus. A dense single-vector index is cheap to store and search, but it usually trails multi-vector matching. The question is how much of the quality gap can be closed without changing what is stored at serving time.

## Current direction

Current work fuses internal representations into one embedding per page, so a dense retriever can move closer to late interaction on quality while keeping the index size and query latency of a single vector.
