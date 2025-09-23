const puppeteer = require('puppeteer');

async function checkConsoleErrors() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const consoleMessages = [];

    // 모든 콘솔 메시지 캡처
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });
      console.log(`[${type.toUpperCase()}] ${text}`);
    });

    // 네트워크 요청 모니터링
    page.on('response', (response) => {
      const url = response.url();
      const status = response.status();

      if (url.includes('upload') || url.includes('storage')) {
        console.log(`[NETWORK] ${status} - ${url}`);

        if (status >= 400) {
          response
            .text()
            .then((body) => {
              console.log('[ERROR BODY]', body.substring(0, 200));
            })
            .catch(() => {});
        }
      }
    });

    console.log('Navigating to Create Course page...');
    await page.goto('http://localhost:3000/create-course', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.waitForTimeout(3000);
    console.log('Page loaded. Check browser window for manual testing.');
    console.log('Open DevTools Console to see all messages.');
    console.log('Press Ctrl+C to exit.');

    await new Promise(() => {});
  } catch (error) {
    console.error('Error:', error);
  }
}

checkConsoleErrors().catch(console.error);
