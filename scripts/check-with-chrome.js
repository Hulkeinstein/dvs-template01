const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function checkWithChrome() {
  console.log('=== Starting Chrome with existing profile ===');
  console.log('This will use your logged-in Chrome session');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    executablePath:
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    userDataDir: 'C:\\Users\\jangk\\AppData\\Local\\Google\\Chrome\\User Data',
    args: [
      '--profile-directory=Default', // Use Default profile
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  try {
    const page = await browser.newPage();
    const consoleMessages = [];

    // Capture all console messages
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text, timestamp: new Date().toISOString() });

      // Filter important messages
      if (type === 'error' || type === 'warning') {
        console.log(`[${type.toUpperCase()}] ${text}`);
      } else if (
        text.includes('upload') ||
        text.includes('storage') ||
        text.includes('bucket') ||
        text.includes('Supabase')
      ) {
        console.log(`[${type.toUpperCase()}] ${text}`);
      } else if (
        text.includes('LessonModal') ||
        text.includes('featureImage')
      ) {
        console.log(`[DEBUG] ${text}`);
      }
    });

    // Monitor network requests
    page.on('response', (response) => {
      const url = response.url();
      const status = response.status();

      // Monitor upload-related requests
      if (
        url.includes('upload') ||
        url.includes('storage') ||
        url.includes('course-materials') ||
        url.includes('supabase') ||
        url.includes('lesson')
      ) {
        console.log(`[NETWORK] ${status} - ${url}`);

        // Log error responses
        if (status >= 400) {
          console.log(`[ERROR RESPONSE] Status ${status} from ${url}`);
          response
            .text()
            .then((body) => {
              console.log('[ERROR BODY]', body.substring(0, 500));

              // Try to parse JSON error
              try {
                const jsonError = JSON.parse(body);
                console.log(
                  '[PARSED ERROR]',
                  JSON.stringify(jsonError, null, 2)
                );
              } catch (e) {
                // Not JSON, already logged as text
              }
            })
            .catch(() => {});
        }
      }
    });

    // Monitor failed requests
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure) {
        const url = request.url();
        if (url.includes('upload') || url.includes('storage')) {
          console.log('[REQUEST FAILED]', failure.errorText, url);
        }
      }
    });

    // Page errors
    page.on('pageerror', (error) => {
      console.log('[PAGE ERROR]', error.message);
    });

    console.log('\nStep 1: Navigating to Create Course page...');
    await page.goto('http://localhost:3000/create-course', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for page to fully load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check if we're on the right page
    const pageUrl = page.url();
    console.log('Current URL:', pageUrl);

    if (pageUrl.includes('create-course')) {
      console.log('✓ Successfully on Create Course page');

      console.log('\nStep 2: Looking for Add Lesson button...');

      // Find and click Add Lesson button
      const addLessonButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(
          (b) => b.textContent && b.textContent.includes('Add Lesson')
        );
        if (btn) {
          console.log('Add Lesson button found:', btn.textContent);
        }
        return btn;
      });

      if (addLessonButton) {
        const jsHandle = addLessonButton.asElement();
        if (jsHandle) {
          console.log('Clicking Add Lesson button...');
          await jsHandle.click();

          // Wait for modal to open
          await new Promise((resolve) => setTimeout(resolve, 2000));

          console.log('\nStep 3: Looking for Feature Image input...');

          // Find file inputs
          const fileInputs = await page.$$('input[type="file"]');
          console.log(`Found ${fileInputs.length} file input(s)`);

          if (fileInputs.length > 0) {
            // Test image path
            const testImagePath = path.join(
              __dirname,
              '../public/images/course/course-01.jpg'
            );

            if (fs.existsSync(testImagePath)) {
              console.log('Test image found at:', testImagePath);
              console.log('\nStep 4: Attempting to upload image...');

              // Clear previous console messages
              consoleMessages.length = 0;

              // Upload file
              await fileInputs[0].uploadFile(testImagePath);
              console.log('File selected, waiting for upload process...');

              // Wait for upload to complete
              await new Promise((resolve) => setTimeout(resolve, 5000));

              // Analyze console messages
              console.log('\n=== Console Messages After Upload ===');
              const relevantMessages = consoleMessages.filter(
                (m) =>
                  m.text.includes('upload') ||
                  m.text.includes('storage') ||
                  m.text.includes('bucket') ||
                  m.text.includes('error') ||
                  m.text.includes('LessonModal') ||
                  m.text.includes('featureImage')
              );

              if (relevantMessages.length > 0) {
                relevantMessages.forEach((msg) => {
                  console.log(`[${msg.type}] ${msg.text}`);
                });
              } else {
                console.log('No relevant console messages captured');
              }

              // Check if preview is showing
              console.log('\nStep 5: Checking if preview is displayed...');

              const previewCheck = await page.evaluate(() => {
                const img = document.querySelector(
                  '#lessonFeatureImagePreview'
                );
                if (img) {
                  const src = img.src;
                  const computed = window.getComputedStyle(img);
                  return {
                    found: true,
                    src: src,
                    display: computed.display,
                    visible:
                      computed.display !== 'none' &&
                      computed.visibility !== 'hidden',
                    width: img.width,
                    height: img.height,
                  };
                }
                return { found: false };
              });

              if (previewCheck.found) {
                console.log('Preview image element found:');
                console.log('  - Source:', previewCheck.src);
                console.log('  - Display:', previewCheck.display);
                console.log('  - Visible:', previewCheck.visible);
                console.log(
                  '  - Dimensions:',
                  previewCheck.width,
                  'x',
                  previewCheck.height
                );

                if (
                  previewCheck.visible &&
                  !previewCheck.src.includes('placeholder')
                ) {
                  console.log('✓ Image preview is showing correctly!');
                } else {
                  console.log(
                    '✗ Image preview element exists but not showing properly'
                  );
                }
              } else {
                console.log('✗ Preview image element not found');
              }

              // Check Supabase storage state
              console.log('\nStep 6: Checking state variables...');

              const stateCheck = await page.evaluate(() => {
                // Try to access React DevTools if available
                const reactRoot = document.querySelector('#__next');
                if (reactRoot && reactRoot._reactRootContainer) {
                  console.log('React root found');
                }

                // Check for any visible error messages
                const errorElements = document.querySelectorAll(
                  '.text-danger, .error, [class*="error"]'
                );
                const errors = [];
                errorElements.forEach((el) => {
                  const text = el.textContent.trim();
                  if (text) errors.push(text);
                });

                return { errors };
              });

              if (stateCheck.errors.length > 0) {
                console.log('\nError messages found on page:');
                stateCheck.errors.forEach((err) => console.log('  -', err));
              }
            } else {
              console.log('Test image not found at:', testImagePath);
            }
          } else {
            console.log('No file inputs found in modal');
          }
        }
      } else {
        console.log('Add Lesson button not found');
      }
    } else if (pageUrl.includes('signin')) {
      console.log('Redirected to signin page - not logged in');
      console.log('Please log in manually in the browser window');
    } else {
      console.log('Unexpected page:', pageUrl);
    }

    // Summary
    console.log('\n=== Test Summary ===');
    const errorCount = consoleMessages.filter((m) => m.type === 'error').length;
    const warningCount = consoleMessages.filter(
      (m) => m.type === 'warning'
    ).length;

    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Warnings: ${warningCount}`);

    console.log('\nBrowser window is open for manual inspection.');
    console.log(
      'Check the DevTools Console and Network tabs for more details.'
    );
    console.log('Press Ctrl+C to exit...');

    // Keep browser open
    await new Promise(() => {});
  } catch (error) {
    console.error('Error during execution:', error);
  }
}

checkWithChrome().catch(console.error);
