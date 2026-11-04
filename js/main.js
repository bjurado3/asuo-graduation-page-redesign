import { initNav } from "./nav.js";
import { initPhotoStrip } from "./photo-strip.js?v=6";
import { initModeToggle } from "./mode-toggle.js?v=11";
import { initHeaderHeightVar, initToggleBarScrollOffset } from "./header-height.js?v=4";
import { autoStartGraduationEffectsOnMobile } from "./graduation-effects.js?v=9";
import { initReadyTabs } from "./ready-tabs.js";
import { initScrollReveal } from "./scroll-reveal.js?v=3";
import { initTasselChat } from "./tassel-chat.js";
import { initFaq } from "./faq.js";
import { initAlumniOrbit } from "./alumni-orbit.js?v=2";
import { initRfiForm } from "./rfi-form.js";
import { initVideoModal } from "./video-modal.js?v=3";

initNav();
initPhotoStrip();
initHeaderHeightVar();
// Toggle is pinned bottom-center (CSS); no scroll tracking needed.

initModeToggle();
autoStartGraduationEffectsOnMobile();
initReadyTabs();
initScrollReveal();
initTasselChat();
initFaq();
initAlumniOrbit();
initRfiForm();
initVideoModal();
