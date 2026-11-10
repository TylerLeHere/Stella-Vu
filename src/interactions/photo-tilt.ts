const POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MAX_TILT = 8;
const LIFT = 8;
const properties = [
  '--tilt-x',
  '--tilt-y',
  '--lift',
  '--shine-x',
  '--shine-y',
  '--shadow-x',
  '--shadow-y',
  '--effect-opacity',
];

/** Enhance native photo links; no animation loop or click interception. */
export function initPhotoTilt(root: ParentNode = document): () => void {
  const elements = [...root.querySelectorAll<HTMLElement>('[data-tilt-photo]')];
  const finePointer = matchMedia(POINTER_QUERY);
  const reducedMotion = matchMedia(MOTION_QUERY);
  const listeners = new AbortController();
  const options = { signal: listeners.signal, passive: true };
  const resetQueue = new Set<HTMLElement>();
  let active: HTMLElement | null = null;
  let bounds: DOMRect | null = null;
  let point = { x: 0, y: 0 };
  let frame = 0;
  let disposed = false;

  const enabled = () => finePointer.matches && !reducedMotion.matches;
  const clear = (element: HTMLElement) => {
    element.removeAttribute('data-tilting');
    for (const property of properties) element.style.removeProperty(property);
  };

  function render() {
    frame = 0;
    // All geometry reads precede style writes, including during rapid switching.
    if (active && !bounds) bounds = active.getBoundingClientRect();
    for (const element of resetQueue) clear(element);
    resetQueue.clear();
    if (!active || !bounds || !enabled()) return;

    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    const x = clamp(
      ((point.x - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
    );
    const y = clamp(
      ((point.y - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1,
    );
    const values = [
      `${-y * MAX_TILT}deg`,
      `${x * MAX_TILT}deg`,
      `${-LIFT}px`,
      `${x * 22}%`,
      `${y * 12}%`,
      `${-x * 5}px`,
      `${-y * 3}px`,
      '1',
    ];
    active.setAttribute('data-tilting', '');
    properties.forEach((property, index) =>
      active!.style.setProperty(property, values[index]!),
    );
  }

  function schedule() {
    if (!frame && !disposed) frame = requestAnimationFrame(render);
  }

  function release() {
    if (!active) return;
    resetQueue.add(active);
    active = null;
    bounds = null;
    schedule();
  }

  function track(element: HTMLElement, event: PointerEvent) {
    if (!enabled() || event.pointerType === 'touch') {
      release();
      return;
    }
    if (
      active === element &&
      point.x === event.clientX &&
      point.y === event.clientY
    )
      return;
    if (active !== element) {
      release();
      active = element;
      bounds = null;
    }
    resetQueue.delete(element);
    point = { x: event.clientX, y: event.clientY };
    schedule();
  }

  for (const element of elements) {
    element.addEventListener(
      'pointerenter',
      (event) => track(element, event),
      options,
    );
    element.addEventListener(
      'pointermove',
      (event) => track(element, event),
      options,
    );
    for (const event of ['pointerleave', 'pointercancel'] as const) {
      element.addEventListener(
        event,
        () => {
          if (active === element) release();
        },
        options,
      );
    }
    // Hybrid devices may switch to touch while a mouse remains over the photo.
    element.addEventListener(
      'pointerdown',
      (event) => {
        if (event.pointerType === 'touch') release();
      },
      options,
    );
  }

  const mediaChanged = () => {
    if (!enabled()) release();
  };
  finePointer.addEventListener('change', mediaChanged, options);
  reducedMotion.addEventListener('change', mediaChanged, options);
  const invalidate = () => {
    if (active) {
      bounds = null;
      schedule();
    }
  };
  window.addEventListener('resize', invalidate, options);
  window.addEventListener('scroll', invalidate, { ...options, capture: true });
  window.addEventListener('blur', release, options);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) release();
    },
    options,
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Tab') release();
    },
    options,
  );

  return () => {
    disposed = true;
    listeners.abort();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    active = null;
    bounds = null;
    resetQueue.clear();
    for (const element of elements) clear(element);
  };
}
