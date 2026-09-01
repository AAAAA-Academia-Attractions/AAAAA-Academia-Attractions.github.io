---
title: BBO
nav: research
parent_area: Algorithm
summary: "Finding high-scoring designs from a static dataset, without an online oracle, while staying on the support of the observed data."
keywords:
  - Offline BBO
  - Diffusion surrogate
  - Conservative search
---

## Introduction

Offline black-box optimization searches for a high-scoring design when the only evidence is a fixed set of past evaluations. There is no extra query to the true objective, so a surrogate that is optimistic off the data manifold will send the search into regions the dataset never supported.

## Current direction

Current work treats the forward map from design to score as a calibrated conditional diffusion problem, then regularizes predictions with a support-proximity prior so acquisition stays conservative in low-density regions.
