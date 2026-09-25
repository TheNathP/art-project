const DEFAULT_TRANSITION_TYPE = "page-forward";
let activeTransitionId = 0;

function createFallbackTransition(update) {
  const finished = Promise.resolve().then(update);

  return {
    ready: finished,
    updateCallbackDone: finished,
    finished,
    skipTransition() {},
  };
}

export function startPageViewTransition({
  update,
  type = DEFAULT_TRANSITION_TYPE,
  respectReducedMotion = true,
}) {
  const cannotAnimate =
    typeof document === "undefined" ||
    typeof document.startViewTransition !== "function" ||
    (respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  if (cannotAnimate) {
    return createFallbackTransition(update);
  }

  document.activeViewTransition?.skipTransition();
  document.documentElement.dataset.pageTransition = type;
  activeTransitionId += 1;
  const transitionId = activeTransitionId;

  let transition;

  try {
    transition = document.startViewTransition({
      update,
      types: [type],
    });
  } catch {
    transition = document.startViewTransition(update);
  }

  transition.finished
    .catch(() => {})
    .finally(() => {
      if (activeTransitionId === transitionId) {
        delete document.documentElement.dataset.pageTransition;
      }
    });

  return transition;
}

export { DEFAULT_TRANSITION_TYPE };
