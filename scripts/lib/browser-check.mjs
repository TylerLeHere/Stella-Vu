import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Uses an isolated headless Chrome, never the user's signed-in profile.
export async function withBrowser(url, run) {
  assert(
    ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname),
    'Use a local preview URL',
  );
  const profile = await mkdtemp(path.join(tmpdir(), 'mai-browser-check-'));
  const chrome = spawn(
    process.env.CHROME_PATH ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      `--user-data-dir=${profile}`,
      '--remote-debugging-port=0',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let ws;
  const timeout = setTimeout(() => {
    chrome.kill();
    process.exitCode = 1;
    ws?.close();
  }, 90000);
  try {
    let port;
    for (let i = 0; i < 100 && !port; i++) {
      try {
        port = (
          await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')
        ).split('\n')[0];
      } catch {
        await pause(100);
      }
    }
    assert(port, 'Chrome starts');
    const version = await (
      await fetch(`http://127.0.0.1:${port}/json/version`)
    ).json();
    ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });
    let id = 0;
    const pending = new Map();
    const errors = [];
    ws.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        pending.get(message.id)?.(message);
        pending.delete(message.id);
      }
      if (message.method === 'Runtime.exceptionThrown')
        errors.push(message.params.exceptionDetails.text);
    });
    const send = (method, params = {}, sessionId) =>
      new Promise((resolve, reject) => {
        const next = ++id;
        pending.set(next, (message) =>
          message.error
            ? reject(new Error(JSON.stringify(message.error)))
            : resolve(message.result),
        );
        ws.send(JSON.stringify({ id: next, method, params, sessionId }));
      });
    const { targetId } = await send('Target.createTarget', {
      url: 'about:blank',
    });
    const { sessionId } = await send('Target.attachToTarget', {
      targetId,
      flatten: true,
    });
    const command = (method, params) => send(method, params, sessionId);
    const evaluate = async (expression) => {
      const result = await command('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await send('Target.activateTarget', { targetId });
    await command('Emulation.setFocusEmulationEnabled', { enabled: true });
    await command('Page.enable');
    await command('Runtime.enable');
    await run({ command, evaluate, errors, pause });
  } finally {
    clearTimeout(timeout);
    ws?.close();
    const stopped = new Promise((resolve) => chrome.once('exit', resolve));
    if (chrome.exitCode === null) {
      chrome.kill();
      await stopped;
    }
    await rm(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  }
}
