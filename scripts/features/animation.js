/**
 * Copyright © 2025 Asgard Innovations / RNK™
 * All Rights Reserved
 * 
 * Animation Feature Module
 */

import { SETTINGS } from "../constants.js";
import { getSetting } from "../utils.js";

/**
 * Get animation CSS for transitions
 * @returns {string} CSS for animations
 */
export function getAnimationCSS() {
  const duration = getSetting(SETTINGS.ANIMATION_DURATION);
  
  return `
    /* Smooth transitions for all hotbar elements */
    #hotbar .macro,
    #hotbar li[data-slot],
    #hotbar .bar-controls {
      transition: 
        opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1),
        transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1),
        visibility ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* Hidden state animation */
    #hotbar .macro.rnk-hidden,
    #hotbar li[data-slot].rnk-hidden {
      animation: rnk-fade-out ${duration}ms ease-in-out forwards;
    }

    /* Visible state animation */
    #hotbar .macro.rnk-visible,
    #hotbar li[data-slot].rnk-visible {
      animation: rnk-fade-in ${duration}ms ease-in-out forwards;
    }

    @keyframes rnk-fade-out {
      0% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      50% {
        transform: scale(0.95) translateY(-5px);
      }
      100% {
        opacity: 0;
        transform: scale(0.8) translateY(0);
        visibility: hidden;
        pointer-events: none;
      }
    }

    @keyframes rnk-fade-in {
      0% {
        opacity: 0;
        transform: scale(0.8) translateY(0);
      }
      50% {
        transform: scale(1.05) translateY(-5px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Pulse effect on hover for visible slots */
    #hotbar .macro:not(.rnk-hidden):hover {
      animation: rnk-pulse 0.3s ease-in-out;
    }

    @keyframes rnk-pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
  `;
}

/**
 * Apply animation class to element
 * @param {HTMLElement} element - Target element
 * @param {boolean} hidden - Whether to hide or show
 */
export function animateElement(element, hidden) {
  if (!element) return;
  
  const duration = getSetting(SETTINGS.ANIMATION_DURATION);
  
  if (hidden) {
    element.classList.remove("rnk-visible");
    element.classList.add("rnk-hidden");
  } else {
    element.classList.remove("rnk-hidden");
    element.classList.add("rnk-visible");
  }
  
  // Clean up classes after animation
  setTimeout(() => {
    element.classList.remove("rnk-hidden", "rnk-visible");
  }, duration + 50);
}
