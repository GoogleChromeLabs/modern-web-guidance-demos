/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @function initNavigation
 * @description Initializes legacy navigation toggling.
 * 
 * @returns {void}
 */
export function initNavigation() {
  // Legacy navigation toggling
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && menuClose && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.add("show");
    });
    menuClose.addEventListener("click", () => {
      navMenu.classList.remove("show");
    });
  }
}
