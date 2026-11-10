import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { withBrowser } from './lib/browser-check.mjs';
const url = process.argv[2] || 'http://127.0.0.1:4321/';
await withBrowser(url, async ({ command, evaluate, errors, pause }) => {
  await command('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await command('Page.addScriptToEvaluateOnNewDocument', {
    source: `
    // Isolate the tilt suite's native-link assertions; the viewer suite checks integration.
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-photo-id]').forEach(el => el.removeAttribute('data-photo-id'));
    });
    window.tiltQA = { frames: 0, reads: 0 };
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = function(fn) { window.tiltQA.frames++; return raf.call(this, fn); };
    const rect = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function() { if (this.hasAttribute('data-tilt-photo')) window.tiltQA.reads++; return rect.call(this); };
  `,
  });
  await command('Page.navigate', { url });
  for (let i = 0; i < 100; i++) {
    if (
      await evaluate(
        `document.querySelectorAll('[data-tilt-photo]').length === 3 && document.readyState === 'complete'`,
      )
    )
      break;
    await pause(50);
  }
  await evaluate('document.fonts.ready.then(() => true)');
  await pause(150);
  assert(
    await evaluate(`matchMedia('(hover: hover) and (pointer: fine)').matches`),
    'Desktop fine pointer',
  );
  const geometry = () =>
    evaluate(
      `[...document.querySelectorAll('[data-tilt-photo]')].map(e => { const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })`,
    );
  const state = () =>
    evaluate(
      `[...document.querySelectorAll('[data-tilt-photo]')].map(e => ({active:e.hasAttribute('data-tilting'),x:parseFloat(e.style.getPropertyValue('--tilt-x'))||0,y:parseFloat(e.style.getPropertyValue('--tilt-y'))||0,lift:e.style.getPropertyValue('--lift'),matrix:getComputedStyle(e.firstElementChild).transform,reflection:getComputedStyle(e.querySelector('.reflection')).opacity}))`,
    );
  const boxes = await geometry();
  const rest = await state();
  const move = (x, y) =>
    command('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  const enter = async (index, fx = 0.75, fy = 0.25) => {
    const box = boxes[index];
    await move(box.x + box.w * fx, box.y + box.h * fy);
    await command('Page.captureScreenshot', { format: 'png' });
    await pause(180);
    await command('Page.captureScreenshot', { format: 'png' });
  };
  await enter(0);
  let current = await state();
  assert(
    current[0].active && current[0].x > 0 && current[0].y > 0,
    'Pointer entry tilts toward pointer',
  );
  assert.equal(current[0].lift, '-8px');
  assert(Number(current[0].reflection) > 0, 'Reflection appears');
  assert.notEqual(current[0].matrix, rest[0].matrix);
  assert.deepEqual(
    await geometry(),
    boxes,
    'Hit areas and layout remain fixed',
  );
  const beforeIdle = await evaluate('window.tiltQA.frames');
  await pause(200);
  assert.equal(
    await evaluate('window.tiltQA.frames'),
    beforeIdle,
    'No idle frame loop',
  );
  await enter(0, 0.05, 0.95);
  current = await state();
  assert(
    current[0].x < 0 && current[0].y < 0,
    'Pointer movement updates both axes',
  );
  assert(
    Math.abs(current[0].x) <= 8 && Math.abs(current[0].y) <= 8,
    'Tilt is bounded',
  );

  // Coalesced events must read the stable wrapper only once in the next frame.
  const batch = await evaluate(`(() => {
    dispatchEvent(new Event('resize'));
    const e=document.querySelector('[data-tilt-photo]'), r=window.tiltQA.reads, f=window.tiltQA.frames;
    for(let i=0;i<50;i++) e.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:400+i,clientY:500}));
    return new Promise(resolve => setTimeout(() => resolve({reads:window.tiltQA.reads-r,frames:window.tiltQA.frames-f}),50));
  })()`);
  assert.equal(batch.reads, 1, 'Batched geometry read');
  assert(batch.frames <= 1, 'Batched transform writes');
  for (const index of [1, 2, 0, 2, 1]) {
    await enter(index);
    current = await state();
    assert.equal(
      current.filter((p) => p.active).length,
      1,
      'Only one photo active during rapid switching',
    );
    assert(current[index].active, 'Neighbor receives the pointer');
  }
  await move(20, 20);
  await pause(520);
  current = await state();
  assert(
    current.every(
      (p) => !p.active && p.lift === '' && Number(p.reflection) === 0,
    ),
    'Exit settles',
  );
  assert.deepEqual(
    current.map((p) => p.matrix),
    rest.map((p) => p.matrix),
    'Resting rotations restored',
  );

  // Keyboard focus stays on the stable native link, without spatial motion.
  await evaluate(`document.querySelector('[data-tilt-photo]').focus()`);
  await command('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Tab',
    code: 'Tab',
    windowsVirtualKeyCode: 9,
  });
  await command('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Tab',
    code: 'Tab',
    windowsVirtualKeyCode: 9,
  });
  assert(
    await evaluate(
      `document.activeElement === document.querySelectorAll('[data-tilt-photo]')[1] && getComputedStyle(document.activeElement.querySelector('.photo-frame')).outlineStyle !== 'none'`,
    ),
    'Keyboard order and visible focus',
  );

  await enter(0);
  await command('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await pause(80);
  current = await state();
  assert(
    current.every((p) => !p.active),
    'Live reduced-motion change clears tilt',
  );
  await enter(1);
  assert(
    (await state()).every((p) => !p.active),
    'Reduced motion ignores pointer movement',
  );
  assert.equal(
    await evaluate(
      `getComputedStyle(document.querySelector('.reflection')).display`,
    ),
    'none',
  );
  assert.equal(
    await evaluate(
      `getComputedStyle(document.querySelector('.photo-frame')).transitionDuration`,
    ),
    '0s',
  );
  await command('Emulation.setEmulatedMedia', { features: [] });
  await move(20, 20);
  await enter(0);
  assert((await state())[0].active, 'Motion preference can be re-enabled');

  // Touch events on hybrid devices must also clear an existing mouse effect.
  await evaluate(
    `document.querySelector('[data-tilt-photo]').dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch'}))`,
  );
  await pause(50);
  assert(
    (await state()).every((p) => !p.active),
    'Hybrid touch clears mouse tilt',
  );
  await command('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  await command('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await pause(80);
  assert(
    await evaluate(
      `matchMedia('(pointer: coarse)').matches && !matchMedia('(hover: hover)').matches`,
    ),
    'Touch-only device emulation',
  );
  const phone = (await geometry())[0];
  const touchPoint = { x: phone.x + phone.w / 2, y: phone.y + phone.h / 2 };
  await command('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [touchPoint],
  });
  assert(
    (await state()).every((p) => !p.active),
    'Touch does not tilt',
  );
  const imageURL = await evaluate(
    `document.querySelector('[data-tilt-photo]').href`,
  );
  await command('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await pause(200);
  assert.equal(
    await evaluate('location.href'),
    imageURL,
    'Tap opens full-size image',
  );
  await command('Page.navigate', { url });
  await pause(200);

  // Lifecycle cleanup cancels pending work and removes pointer listeners.
  await command('Emulation.setTouchEmulationEnabled', { enabled: false });
  await command('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await pause(100);
  await evaluate(
    `(() => { const e=document.querySelector('[data-tilt-photo]'); e.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse',clientX:450,clientY:500})); dispatchEvent(new PageTransitionEvent('pagehide')); e.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:460,clientY:510})); })()`,
  );
  await pause(80);
  assert(
    (await state()).every((p) => !p.active && p.lift === ''),
    'Cleanup cancels pending frame and listeners',
  );
  await evaluate(
    `dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))`,
  );
  await move(20, 20);
  await enter(0);
  assert(
    (await state())[0].active,
    'Back-forward cache restoration initializes once',
  );
  const fullSizeURL = await evaluate(
    `document.querySelector('[data-tilt-photo]').href`,
  );
  const clickBox = boxes[0];
  const mousePoint = {
    x: clickBox.x + clickBox.w * 0.75,
    y: clickBox.y + clickBox.h * 0.25,
    button: 'left',
    clickCount: 1,
  };
  await command('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    ...mousePoint,
  });
  await command('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    ...mousePoint,
  });
  await pause(150);
  assert.equal(
    await evaluate('location.href'),
    fullSizeURL,
    'Mouse click opens full-size image',
  );
  await command('Page.navigate', { url });
  await pause(150);
  await move(20, 20);
  await enter(0);
  await mkdir('.taste-skill/shots', { recursive: true });
  const shot = await command('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    '.taste-skill/shots/tilt-active.png',
    Buffer.from(shot.data, 'base64'),
  );
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  console.log(
    'PASS: entry, movement, 8-degree bounds, 8px lift, reflection, stable geometry, idle frames, batching, rapid switching, exit, keyboard focus, reduced motion, touch tap, cleanup, and restoration.',
  );
});
