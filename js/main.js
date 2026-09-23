import { initNav } from "./nav.js";
import { initPhotoStrip } from "./photo-strip.js";
import { initModeToggle } from "./mode-toggle.js?v=7";
import { initHeaderHeightVar } from "./header-height.js";
import { autoStartGraduationEffectsOnMobile } from "./graduation-effects.js?v=8";
import { initCeremonyAccordion } from "./ceremony-accordion.js";

initNav();
initPhotoStrip();
initHeaderHeightVar();
initModeToggle();
autoStartGraduationEffectsOnMobile();
initCeremonyAccordion();
