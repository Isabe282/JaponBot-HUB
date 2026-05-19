import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { playClick, playPage } from "../lib/sounds";

let firstNav = true;

export const SoundProvider = () => {
  const location = useLocation();

  // Global click sound on buttons & links
  useEffect(() => {
    const handler = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const interactive = t.closest(
        'button, a, [role="button"], [data-sfx-click]'
      );
      if (!interactive) return;
      // Skip disabled controls
      if (interactive.disabled || interactive.getAttribute("aria-disabled") === "true") return;
      // Skip elements that opt-out
      if (interactive.closest('[data-sfx-skip="true"]')) return;
      playClick();
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  // Page transition sound on route change (skip initial mount)
  useEffect(() => {
    if (firstNav) {
      firstNav = false;
      return;
    }
    playPage();
  }, [location.pathname]);

  return null;
};
