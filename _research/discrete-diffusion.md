---
title: Discrete Diffusion
nav: research
parent_area: Algorithm
summary: "A tokenization-first view of discrete denoising diffusion, from state-space design through training, sampling, and evaluation."
lead: Ye Yuan
keywords:
  - Discrete diffusion
  - Tokenization
  - Generative models
---

## Introduction

Discrete diffusion generates sequences by corrupting and then iteratively denoising categorical states, rather than emitting tokens left to right. The corruption process, the reverse denoiser, and the sampler are all shaped by how the discrete state space is built: subword vocabularies, codebook topologies, and domain alphabets such as amino acids or graph primitives.

## Current direction

Current work organizes the field as one design space from tokenization to generation, covering text and code, tokenized multimodal media, and scientific discrete structures, with a public companion repository of taxonomies and resources.
