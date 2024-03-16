#!/usr/bin/bash

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs
mkdir /tmp/playwright-project
cd /tmp/playwright-project && npm install playwright

echo """
const { chromium, devices } = require('playwright');

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = await browser.newContext(devices['iPhone 11']);
  const page = await context.newPage();

  await page.goto('https://example.com/');
  console.log('page title', await page.title());

  await context.close();
  await browser.close();
}

(async () => await main())();
""" > /tmp/playwright-project/script.js

xvfb-run \
  --server-num=1 \
  --auto-servernum \
  --server-args="-screen 0 800x600x24 -ac -nolisten tcp -dpi 96 +extension RANDR" \
    chromium \
      --no-sandbox \
      --disable-namespace-sandbox \
      --disable-dev-shm-usage \
      --disable-notifications \
      --use-mock-keychain \
      --no-default-browser-check \
      --disable-sync \
      --no-first-run \
      --window-position=0,0 \
      --window-size=1920,1080 \
      --remote-debugging-port=9222 \
      --auto-open-devtools-for-tabs &

# give some time for browser to start
sleep 5

cd /tmp/playwright-project && node script.js
