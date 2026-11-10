import type PhotoSwipe from 'photoswipe';
import type { ViewerPhoto } from '../data/types';

export function initPhotoViewer(): () => void {
  const data = document.querySelector('#photo-viewer-data');
  if (!data?.textContent) return () => {};
  const photos: ViewerPhoto[] = JSON.parse(data.textContent);
  const listeners = new AbortController();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let viewer: PhotoSwipe | null = null;
  let loading = false;
  let disposed = false;
  let restorePage: (() => void) | null = null;

  const onClick = async (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const opener = (event.target as Element | null)?.closest<HTMLAnchorElement>(
      'a[data-photo-id]',
    );
    if (!opener) return;
    const index = photos.findIndex(
      (photo) => photo.id === opener.dataset.photoId,
    );
    if (index < 0) return;
    event.preventDefault();
    if (loading || viewer) return;
    loading = true;
    try {
      // Neither the viewer core nor its styles are requested before the first open.
      const [{ default: PhotoSwipeCore }] = await Promise.all([
        import('photoswipe'),
        import('../styles/photo-viewer.css'),
      ]);
      if (disposed || !opener.isConnected) return;
      const pswp = new PhotoSwipeCore({
        dataSource: photos,
        index,
        mainClass: 'mai-photo-viewer',
        bgOpacity: 1,
        showHideAnimationType: reducedMotion.matches ? 'none' : 'fade',
        showAnimationDuration: 280,
        hideAnimationDuration: 280,
        zoomAnimationDuration: reducedMotion.matches ? 0 : 250,
        trapFocus: true,
        returnFocus: false,
        escKey: true,
        arrowKeys: true,
        closeTitle: 'Close photo viewer',
        arrowPrevTitle: 'Previous photograph',
        arrowNextTitle: 'Next photograph',
        zoomTitle: 'Zoom photograph',
        indexIndicatorSep: ' of ',
        // Keep controls visible and separate from the photograph on phones.
        paddingFn: (size) => ({
          top: 72,
          bottom: 104,
          left: size.x < 600 ? 16 : 80,
          right: size.x < 600 ? 16 : 80,
        }),
        tapAction: false,
        imageClickAction: 'zoom',
        bgClickAction: false,
      });
      viewer = pswp;
      // PhotoSwipe guards focusin; explicitly cycle Tab as well so focus never
      // escapes to browser chrome when a control is first or last in the dialog.
      pswp.on('keydown', (event) => {
        if (event.originalEvent.key !== 'Tab' || !pswp.element) return;
        const controls = [
          ...pswp.element.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
          ),
        ].filter(
          (element) =>
            element.getClientRects().length > 0 &&
            getComputedStyle(element).visibility !== 'hidden',
        );
        if (!controls.length) return;
        event.preventDefault();
        event.originalEvent.preventDefault();
        const current = controls.indexOf(document.activeElement as HTMLElement);
        const next = event.originalEvent.shiftKey
          ? current <= 0
            ? controls.length - 1
            : current - 1
          : (current + 1) % controls.length;
        controls[next]?.focus({ preventScroll: true });
      });
      let caption: HTMLElement | undefined;
      pswp.on('uiRegister', () => {
        pswp.ui?.registerElement({
          name: 'personal-caption',
          appendTo: 'root',
          order: 9,
          onInit: (element) => {
            caption = element;
            element.setAttribute('aria-live', 'polite');
          },
        });
      });
      pswp.on('change', () => {
        const photo = photos[pswp.currIndex];
        if (caption) {
          caption.textContent = photo?.caption ?? '';
          caption.hidden = !photo?.caption;
          caption.tabIndex = photo?.caption ? 0 : -1;
        }
        pswp.element?.setAttribute(
          'aria-label',
          `Mai’s photographs, ${pswp.currIndex + 1} of ${photos.length}`,
        );
      });
      pswp.on('afterInit', () => {
        const dialog = pswp.element!;
        dialog.setAttribute('aria-modal', 'true');
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const bodyStyle = document.body.getAttribute('style');
        const overflow = document.documentElement.style.overflow;
        const scrollbar =
          window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.setAttribute('data-photo-viewer-open', '');
        document.dispatchEvent(new Event('photo-viewer:open'));
        document.documentElement.style.overflow = 'hidden';
        Object.assign(document.body.style, {
          position: 'fixed',
          top: `${-scrollY}px`,
          left: `${-scrollX}px`,
          width: '100%',
          overflow: 'hidden',
          paddingRight: `${scrollbar}px`,
        });
        const background = [...document.body.children].filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement && element !== dialog,
        );
        const inert = background.map((element) => element.inert);
        background.forEach((element) => {
          element.inert = true;
        });
        restorePage = () => {
          background.forEach((element, i) => {
            element.inert = inert[i]!;
          });
          if (bodyStyle === null) document.body.removeAttribute('style');
          else document.body.setAttribute('style', bodyStyle);
          document.documentElement.style.overflow = overflow;
          document.documentElement.removeAttribute('data-photo-viewer-open');
          window.scrollTo(scrollX, scrollY);
          if (!disposed && opener.isConnected)
            opener.focus({ preventScroll: true });
        };
      });
      pswp.on('openingAnimationEnd', () => {
        pswp.element
          ?.querySelector<HTMLButtonElement>('.pswp__button--close')
          ?.focus({ preventScroll: true });
      });
      pswp.on('destroy', () => {
        restorePage?.();
        restorePage = null;
        viewer = null;
      });
      pswp.init();
    } catch (error) {
      viewer?.destroy();
      viewer = null;
      // A failed chunk download still leaves a working full-size image action.
      if (!disposed) window.location.assign(opener.href);
      console.error('Photo viewer could not open', error);
    } finally {
      loading = false;
    }
  };

  document.addEventListener('click', onClick, { signal: listeners.signal });
  reducedMotion.addEventListener(
    'change',
    () => {
      if (viewer && reducedMotion.matches) {
        viewer.options.showHideAnimationType = 'none';
        viewer.options.showAnimationDuration = 0;
        viewer.options.hideAnimationDuration = 0;
        viewer.options.zoomAnimationDuration = 0;
        viewer.animations.stopAll();
      }
    },
    { signal: listeners.signal },
  );
  return () => {
    disposed = true;
    listeners.abort();
    viewer?.destroy();
    restorePage?.();
    restorePage = null;
  };
}
