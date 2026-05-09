---
title: "Static sites and CI"
description: "Treat the build like part of the product."
date: "May 5 2026"
---

When the site is static, the pipeline is the runtime: lint, typecheck, build, and preview on every change. Failures should be obvious and fast, so you never wonder whether `main` actually deploys.

Keep dependencies boring, cache install steps, and let the build output be the single source of truth for what users receive.
