const puppeteer = require('puppeteer');

async function checkWithLogin() {
  const browser = await puppeteer.launch({
    headless: false, // 브라우저 창 보이기
    devtools: true, // 개발자 도구 열기
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const consoleMessages = [];

    // 모든 콘솔 메시지 캡처
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text, timestamp: new Date().toISOString() });

      // 디버그 메시지나 정보 메시지는 필터링
      if (type === 'error' || type === 'warning') {
        console.log(`[${type.toUpperCase()}] ${text}`);
      } else if (
        text.includes('upload') ||
        text.includes('storage') ||
        text.includes('bucket')
      ) {
        console.log(`[${type.toUpperCase()}] ${text}`);
      }
    });

    // 네트워크 요청 모니터링
    page.on('response', (response) => {
      const url = response.url();
      const status = response.status();

      // 업로드 관련 요청 모니터링
      if (
        url.includes('upload') ||
        url.includes('storage') ||
        url.includes('course-materials') ||
        url.includes('supabase')
      ) {
        console.log(`[NETWORK] ${status} - ${url}`);

        if (status >= 400) {
          response
            .text()
            .then((body) => {
              console.log('[ERROR RESPONSE]', body.substring(0, 500));
            })
            .catch(() => {});
        }
      }
    });

    // 요청 실패 캡처
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure) {
        console.log('[REQUEST FAILED]', failure.errorText, request.url());
      }
    });

    console.log('Step 1: Navigating to home page...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for page to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Step 2: Looking for Sign In button...');

    // Sign In 버튼 클릭
    const signInButton = await page.evaluateHandle(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const signInLink = links.find(
        (link) =>
          link.textContent.includes('Sign In') ||
          link.textContent.includes('Login') ||
          link.href.includes('/api/auth/signin')
      );
      if (signInLink) return signInLink;

      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(
        (btn) =>
          btn.textContent.includes('Sign In') ||
          btn.textContent.includes('Login')
      );
    });

    if (signInButton) {
      await signInButton.click();
      console.log('Sign In button clicked');

      // Wait for auth page
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log('Step 3: Looking for Google login button...');

      // Google로 로그인 버튼 찾기
      const googleButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(
          (btn) =>
            btn.textContent.includes('Google') ||
            btn.textContent.includes('Continue with Google')
        );
      });

      if (googleButton) {
        console.log('Google login button found');
        console.log('Note: Manual login required in the opened browser window');
        console.log('Please complete the Google OAuth login process...');

        await googleButton.click();

        // Google OAuth 로그인 대기 (수동 로그인 필요)
        console.log('Waiting for login to complete (30 seconds)...');
        await new Promise((resolve) => setTimeout(resolve, 30000));

        console.log('Step 4: Checking if logged in...');

        // 로그인 확인
        const currentUrl = page.url();
        console.log('Current URL:', currentUrl);

        if (
          currentUrl.includes('instructor') ||
          currentUrl.includes('student')
        ) {
          console.log('Login successful! Dashboard loaded.');

          console.log('Step 5: Navigating to Create Course page...');
          await page.goto('http://localhost:3000/create-course', {
            waitUntil: 'networkidle2',
            timeout: 30000,
          });

          await new Promise((resolve) => setTimeout(resolve, 3000));

          console.log('Step 6: Looking for Add Lesson button...');

          // Add Lesson 버튼 찾기
          const addLessonButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find((btn) =>
              btn.textContent.includes('Add Lesson')
            );
          });

          if (addLessonButton) {
            console.log('Add Lesson button found, clicking...');
            await addLessonButton.click();

            // 모달 열림 대기
            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log('Step 7: Finding Feature Image input...');

            // Feature Image 입력 찾기
            const fileInputs = await page.$$('input[type="file"]');
            console.log(`Found ${fileInputs.length} file input(s)`);

            if (fileInputs.length > 0) {
              console.log('Attempting to upload test image...');

              const testImagePath = require('path').join(
                __dirname,
                '../public/images/course/course-01.jpg'
              );
              const fs = require('fs');

              if (fs.existsSync(testImagePath)) {
                console.log('Test image found, uploading...');

                // Clear console messages before upload
                consoleMessages.length = 0;

                await fileInputs[0].uploadFile(testImagePath);
                console.log('File selected, waiting for upload process...');

                // Wait for upload
                await new Promise((resolve) => setTimeout(resolve, 5000));

                // Check console messages after upload
                console.log('\n=== Console messages after upload ===');
                const uploadMessages = consoleMessages.filter(
                  (m) =>
                    m.text.includes('upload') ||
                    m.text.includes('storage') ||
                    m.text.includes('bucket') ||
                    m.type === 'error'
                );

                uploadMessages.forEach((msg) => {
                  console.log(`[${msg.type}] ${msg.text}`);
                });

                // Check if preview shows
                const hasPreview = await page.evaluate(() => {
                  const img = document.querySelector(
                    '#lessonFeatureImagePreview'
                  );
                  if (img) {
                    const src = img.src;
                    console.log('Image src:', src);
                    return src && !src.includes('placeholder');
                  }
                  return false;
                });

                if (hasPreview) {
                  console.log('✓ Image preview is showing!');
                } else {
                  console.log('✗ Image preview NOT showing');
                }
              } else {
                console.log('Test image not found at:', testImagePath);
              }
            } else {
              console.log('No file inputs found in modal');
            }
          } else {
            console.log('Add Lesson button not found');
          }
        } else {
          console.log('Login may have failed or redirected to unexpected page');
        }
      } else {
        console.log('Google login button not found');
      }
    } else {
      console.log('Sign In button not found');
    }

    console.log('\nBrowser window is open. Check console for any errors.');
    console.log('Press Ctrl+C to exit...');

    // Keep browser open
    await new Promise(() => {});
  } catch (error) {
    console.error('Error during execution:', error);
  }
}

checkWithLogin().catch(console.error);
