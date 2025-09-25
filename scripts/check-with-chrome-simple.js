const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function checkWithChromeSimple() {
  console.log('=== Starting Chrome test ===');
  console.log(
    'Note: Please close all Chrome windows first if the script fails'
  );

  try {
    // Try to use existing Chrome installation
    const browser = await puppeteer.launch({
      headless: false,
      devtools: false, // Don't auto-open devtools
      executablePath:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--start-maximized',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const consoleMessages = [];

    // Capture console messages
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });

      // Log important messages
      if (type === 'error') {
        console.log(`[ERROR] ${text}`);
      } else if (
        text.includes('upload') ||
        text.includes('storage') ||
        text.includes('bucket')
      ) {
        console.log(`[${type.toUpperCase()}] ${text}`);
      }
    });

    // Monitor network
    page.on('response', (response) => {
      const url = response.url();
      const status = response.status();

      if (
        url.includes('upload') ||
        url.includes('storage') ||
        url.includes('supabase')
      ) {
        console.log(`[NETWORK] ${status} - ${url}`);

        if (status >= 400) {
          response
            .text()
            .then((body) => {
              console.log('[ERROR RESPONSE]', body.substring(0, 300));
            })
            .catch(() => {});
        }
      }
    });

    console.log('\nStep 1: Navigate to homepage...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('Homepage loaded.');
    console.log('\n=== MANUAL STEPS REQUIRED ===');
    console.log('1. Click "Sign In" button');
    console.log('2. Sign in with Google');
    console.log('3. After login, press Enter here to continue...');

    // Wait for user to manually login
    await new Promise((resolve) => {
      process.stdin.once('data', resolve);
    });

    console.log('\nContinuing after manual login...');

    // Navigate to Create Course page
    console.log('Navigating to Create Course page...');
    await page.goto('http://localhost:3000/create-course', {
      waitUntil: 'networkidle2',
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('create-course')) {
      console.log('✓ On Create Course page');

      // Find Add Lesson button
      console.log('\nLooking for Add Lesson button...');

      const addLessonFound = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(
          (b) => b.textContent && b.textContent.includes('Add Lesson')
        );
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (addLessonFound) {
        console.log('Add Lesson button clicked');

        // Wait for modal
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Find file input
        const fileInputs = await page.$$('input[type="file"]');
        console.log(`Found ${fileInputs.length} file input(s)`);

        if (fileInputs.length > 0) {
          const testImagePath = path.join(
            __dirname,
            '../public/images/course/course-01.jpg'
          );

          if (fs.existsSync(testImagePath)) {
            console.log('Uploading test image...');

            // Clear console
            consoleMessages.length = 0;

            await fileInputs[0].uploadFile(testImagePath);
            console.log('File selected');

            // Wait for upload
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Check console messages
            console.log('\n=== Console Messages ===');
            const errors = consoleMessages.filter((m) => m.type === 'error');
            if (errors.length > 0) {
              errors.forEach((e) => console.log('[ERROR]', e.text));
            } else {
              console.log('No errors in console');
            }

            // Check preview
            const preview = await page.evaluate(() => {
              const img = document.querySelector('#lessonFeatureImagePreview');
              if (img) {
                return {
                  src: img.src,
                  visible: img.offsetWidth > 0 && img.offsetHeight > 0,
                };
              }
              return null;
            });

            if (preview) {
              console.log('\nPreview status:');
              console.log('  Source:', preview.src.substring(0, 100));
              console.log('  Visible:', preview.visible);

              if (preview.visible && !preview.src.includes('placeholder')) {
                console.log('✓ Image preview working!');
              } else {
                console.log('✗ Image preview not working');
              }
            }
          } else {
            console.log('Test image not found');
          }
        }
      } else {
        console.log('Add Lesson button not found');
      }
    } else {
      console.log('Not on Create Course page');
    }

    console.log('\nTest complete. Browser will remain open.');
    console.log('Press Ctrl+C to exit.');

    await new Promise(() => {});
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure all Chrome windows are closed');
    console.log('2. Try running as administrator');
    console.log(
      '3. Check if Chrome is installed at: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    );
  }
}

checkWithChromeSimple().catch(console.error);
