/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @function initHeroGlow
 * @description Adds a soft glow effect that tracks mouse movement across the hero section.
 * 
 * @returns {void}
 */
export function initHeroGlow() {
  const hero = document.querySelector('.hero-home');
  if (!hero) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hero.style.setProperty('--mouse-x', `${x}px`);
    hero.style.setProperty('--mouse-y', `${y}px`);
  });
}
