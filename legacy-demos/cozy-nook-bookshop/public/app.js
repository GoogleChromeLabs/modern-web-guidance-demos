/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { initCarousel } from "./modules/carousel.js";
import { initNavigation } from "./modules/navigation.js";
import { initNewsletterValidation } from "./modules/validation.js";
import { initHeroGlow } from "./modules/hero.js";

/**
 * @function main
 * @description Initializes the application's interactive features across ES modules.
 * 
 * @returns {void}
 */
function main() {
  initCarousel();
  initNavigation();
  initNewsletterValidation();
  initHeroGlow();
}

document.addEventListener("DOMContentLoaded", () => main());
