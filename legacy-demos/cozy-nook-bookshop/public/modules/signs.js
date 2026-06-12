/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @function initSignMicroInteraction
 * @description Adds hover micro-interactions to swinging store signs.
 * 
 * @returns {void}
 */
export function initSignMicroInteraction() {
  document.querySelectorAll('.shop-sign-swing').forEach(sign => {
    sign.addEventListener('mouseenter', () => {
      sign.style.animationPlayState = 'paused';
      sign.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      sign.style.transform = 'scale(1.05) rotate(0deg)';
    });
    sign.addEventListener('mouseleave', () => {
      sign.style.animationPlayState = 'running';
      sign.style.transform = '';
    });
  });
}
