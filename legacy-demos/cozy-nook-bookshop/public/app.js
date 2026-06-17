/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { initNewsletterValidation } from "./modules/validation.js";
import { initHeroGlow } from "./modules/hero.js";
import { initSignMicroInteraction } from "./modules/signs.js";
import { initCatalogRenderer } from "./modules/catalog-renderer.js";
import { initBasket, addToBasket } from "./modules/basket.js";
import { initFiltering } from "./modules/filtering.js";

/**
 * @function main
 * @description Initializes the application's interactive features across ES modules.
 * 
 * @returns {void}
 */
async function main() {
  initNewsletterValidation();
  initHeroGlow();
  initSignMicroInteraction();
  initBasket();
  await initCatalogRenderer(addToBasket);
  initFiltering();
}

document.addEventListener("DOMContentLoaded", () => main());

