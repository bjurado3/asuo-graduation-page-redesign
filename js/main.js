import { initNav } from "./nav.js";
import { initPhotoStrip } from "./photo-strip.js";
import { initModeToggle } from "./mode-toggle.js?v=7";
import { initHeaderHeightVar, initToggleBarScrollOffset } from "./header-height.js?v=4";
import { autoStartGraduationEffectsOnMobile } from "./graduation-effects.js?v=8";
import { initCeremonyAccordion } from "./ceremony-accordion.js";

initNav();
initPhotoStrip();
initHeaderHeightVar();
initToggleBarScrollOffset();
initModeToggle();
autoStartGraduationEffectsOnMobile();
initCeremonyAccordion();
