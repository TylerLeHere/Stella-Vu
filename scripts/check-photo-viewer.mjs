import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { withBrowser } from './lib/browser-check.mjs';

const url = process.argv[2] || 'http://127.0.0.1:4322/';
await withBrowser(url, async ({ command, evaluate, errors, pause }) => {
  const waitFor = async (expression, label) => {
    for (let i = 0; i < 100; i++) {
      if (await evaluate(expression)) return;
      await pause(50);
    }
    assert.fail(label);
  };
  const render = async () => {
    await command('Page.captureScreenshot', { format: 'png' });
    await pause(320);
    await command('Page.captureScreenshot', { format: 'png' });
  };
  const key = async (key, modifiers = 0) => {
    await command('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key,
      modifiers,
    });
    await command('Input.dispatchKeyEvent', { type: 'keyUp', key, modifiers });
  };
  const click = async (selector) => {
    const point = await evaluate(
      `(() => { const e=document.querySelector(${JSON.stringify(selector)}); e.scrollIntoView({block:'nearest'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`,
    );
    await command('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
    await command('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      ...point,
      button: 'left',
      clickCount: 1,
    });
    await command('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      ...point,
      button: 'left',
      clickCount: 1,
    });
  };
  const opened = async (index) => {
    await waitFor(
      `document.querySelector('.pswp__counter')?.textContent.trim() === '${index + 1} of 7'`,
      'Correct collection position',
    );
    await render();
    await waitFor(
      `(() => {const image=document.querySelector('.pswp__item[aria-hidden="false"] img:not(.pswp__img--placeholder)');return image?.complete && image.naturalWidth>0;})()`,
      'Full-size image loads',
    );
  };
  const close = async (selector) => {
    if (selector) await click(selector);
    else await key('Escape');
    await render();
    await waitFor(`!document.querySelector('.pswp')`, 'Viewer closes');
  };
  await command('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await command('Page.navigate', { url });
  await waitFor(
    `document.readyState === 'complete' && document.querySelectorAll('[data-photo-id]').length === 3`,
    'Homepage loaded',
  );
  await evaluate('document.fonts.ready.then(() => true)');
  assert.equal(
    await evaluate(
      `performance.getEntriesByType('resource').filter(e=>/photoswipe.*\.js/.test(e.name)).length`,
    ),
    0,
    'Core is not loaded at startup',
  );
  const photos = await evaluate(
    `JSON.parse(document.querySelector('#photo-viewer-data').textContent)`,
  );
  assert.equal(photos.length, 7);
  assert.equal(new Set(photos.map((photo) => photo.id)).size, 7);
  const ids = await evaluate(
    `[...document.querySelectorAll('[data-photo-id]')].map(e=>e.dataset.photoId)`,
  );

  for (const id of ids) {
    const index = photos.findIndex((photo) => photo.id === id);
    await evaluate('window.scrollTo(0,100)');
    await pause(50);
    const savedScroll = await evaluate('scrollY');
    await click(`[data-photo-id="${id}"]`);
    await opened(index);
    assert.equal(
      await evaluate(
        `document.querySelector('.pswp').getAttribute('aria-modal')`,
      ),
      'true',
    );
    assert.equal(
      await evaluate(`document.body.style.position`),
      'fixed',
      'Scroll locked',
    );
    assert(
      await evaluate(
        `[...document.body.children].filter(e=>e instanceof HTMLElement && !e.matches('.pswp')).every(e=>e.inert)`,
      ),
      'Background is inert',
    );
    assert(
      await evaluate(
        `['.pswp__button--close','.pswp__button--arrow--prev','.pswp__button--arrow--next','.pswp__button--zoom'].every(s=>document.querySelector(s)?.getAttribute('aria-label'))`,
      ),
      'Controls have accessible names',
    );
    assert(
      await evaluate(
        `document.querySelector('.pswp__personal-caption').hidden`,
      ),
      'No invented captions',
    );
    assert(
      await evaluate(`!document.querySelector('[data-tilting]')`),
      'Tilt suspended while open',
    );
    for (let i = 0; i < 8; i++) {
      await key('Tab', i % 2 ? 8 : 0);
      assert(
        await evaluate(
          `document.querySelector('.pswp').contains(document.activeElement)`,
        ),
        'Focus remains contained',
      );
    }
    await close(id === ids[0] ? '.pswp__button--close' : undefined);
    assert.equal(
      await evaluate(`document.activeElement.dataset.photoId`),
      id,
      'Focus restored to exact opener',
    );
    assert.equal(await evaluate('scrollY'), savedScroll, 'Scroll restored');
    assert.equal(await evaluate('document.body.style.position'), '');
    assert(
      await evaluate(`[...document.body.children].every(e=>!e.inert)`),
      'Background restored',
    );
  }
  assert(
    await evaluate(
      `performance.getEntriesByType('resource').some(e=>/photoswipe.*\.js/.test(e.name))`,
    ),
    'Core loads on demand',
  );

  await click(`[data-photo-id="${ids[0]}"]`);
  await opened(0);
  for (let index = 1; index < 7; index++) {
    if (index % 2) await click('.pswp__button--arrow--next');
    else await key('ArrowRight');
    await opened(index);
    const current = await evaluate(
      `(() => {const e=document.querySelector('.pswp__item[aria-hidden="false"] img:not(.pswp__img--placeholder)');return {alt:e.alt,srcset:e.srcset,w:e.naturalWidth,h:e.naturalHeight};})()`,
    );
    assert.equal(current.alt, photos[index].alt);
    assert(
      current.srcset.includes('640w') && current.srcset.includes('1280w'),
      'Responsive sources',
    );
    assert(
      Math.abs(
        current.w / current.h - photos[index].width / photos[index].height,
      ) < 0.002,
      'Image proportions preserved',
    );
  }
  await key('ArrowLeft');
  await opened(5);
  await click('.pswp__button--arrow--prev');
  await opened(4);
  await mkdir('.taste-skill/shots', { recursive: true });
  let shot = await command('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    '.taste-skill/shots/viewer-desktop.png',
    Buffer.from(shot.data, 'base64'),
  );
  await close();

  await command('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await click(`[data-photo-id="${ids[1]}"]`);
  await opened(1);
  assert(
    await evaluate(
      `[...document.querySelectorAll('.pswp,.pswp *')].every(e=>getComputedStyle(e).transitionDuration.split(',').every(v=>parseFloat(v)===0))`,
    ),
    'Reduced-motion transitions are disabled',
  );
  await close();
  assert.equal(
    await evaluate('document.activeElement.dataset.photoId'),
    ids[1],
  );
  await command('Emulation.setEmulatedMedia', { features: [] });

  await command('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 2,
  });
  await command('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate('scrollTo(0,0)');
  await pause(100);
  const touchAt = async (selector) => {
    const point = await evaluate(
      `(() => {const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`,
    );
    await command('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point],
    });
    await command('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  };
  await touchAt(`[data-photo-id="${ids[2]}"]`);
  await opened(2);
  for (const selector of [
    '.pswp__button--arrow--prev',
    '.pswp__button--arrow--next',
    '.pswp__button--close',
  ]) {
    assert(
      await evaluate(
        `(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return r.width>=44&&r.height>=44&&getComputedStyle(document.querySelector(${JSON.stringify(selector)})).visibility==='visible';})()`,
      ),
      'Visible phone controls with adequate targets',
    );
  }
  await command('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 315, y: 370 }],
  });
  for (const x of [270, 220, 160, 100, 60]) {
    await command('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: 370 }],
    });
    await pause(20);
  }
  await command('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await opened(3);
  await touchAt('.pswp__button--arrow--prev');
  await opened(2);
  shot = await command('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    '.taste-skill/shots/viewer-mobile.png',
    Buffer.from(shot.data, 'base64'),
  );
  await touchAt('.pswp__button--close');
  await render();
  await waitFor(`!document.querySelector('.pswp')`, 'Touch close');
  assert.equal(
    await evaluate('document.activeElement.dataset.photoId'),
    ids[2],
  );

  // With scripting disabled, the original image link must still work.
  await command('Emulation.setTouchEmulationEnabled', { enabled: false });
  await command('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await command('Emulation.setScriptExecutionDisabled', { value: true });
  await command('Page.navigate', { url });
  await pause(250);
  const fallback = await evaluate(
    `document.querySelector('[data-photo-id]').href`,
  );
  await click('[data-photo-id]');
  await pause(150);
  assert.equal(
    await evaluate('location.href'),
    fallback,
    'No-JavaScript fallback',
  );
  await command('Emulation.setScriptExecutionDisabled', { value: false });
  // Synthetic fixture only: verify supplied caption text is never parsed as HTML.
  await command('Page.addScriptToEvaluateOnNewDocument', {
    source: `
    const observer = new MutationObserver(() => {
      const e=document.querySelector('#photo-viewer-data');
      if (!e?.textContent.trim().endsWith(']')) return;
      const photos=JSON.parse(e.textContent);
      photos[0].caption='Test caption <strong>plain text</strong>';
      observer.disconnect();
      e.textContent=JSON.stringify(photos);
    });
    observer.observe(document,{subtree:true,childList:true,characterData:true});
  `,
  });
  await command('Page.navigate', { url });
  await waitFor(
    `document.readyState === 'complete' && document.querySelector('[data-photo-id]')`,
    'Caption fixture page',
  );
  await click('[data-photo-id]');
  await opened(0);
  assert.equal(
    await evaluate(
      `document.querySelector('.pswp__personal-caption').textContent`,
    ),
    'Test caption <strong>plain text</strong>',
  );
  assert.equal(
    await evaluate(`document.querySelector('.pswp__personal-caption strong')`),
    null,
    'Caption is text, not HTML',
  );
  assert.equal(
    await evaluate(`document.querySelector('.pswp__personal-caption').hidden`),
    false,
    'Supplied caption appears',
  );
  await evaluate(`dispatchEvent(new PageTransitionEvent('pagehide'))`);
  await waitFor(
    `!document.querySelector('.pswp') && !document.documentElement.hasAttribute('data-photo-viewer-open')`,
    'Open viewer disposal unlocks page',
  );
  await evaluate(
    `dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))`,
  );
  await click('[data-photo-id]');
  await opened(0);
  await close();
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  console.log(
    'PASS: lazy core, three opening positions, all seven photos, arrows, keyboard, close/reopen, focus trap/return, scroll lock/return, responsive images, reduced motion, touch swipe/buttons, and no-JS fallback.',
  );
});
