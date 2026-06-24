// Price Chopper Auto Coupon Clipper

const SCROLL_DELAY_MS = 800;
const CLIP_DELAY_MS = 150;
const SCROLL_RESET_DELAY_MS = 300;
const WAIT_TIMEOUT_MS = 5000;

(async () => {
  // Step 1: Scroll down until all coupons are loaded
  console.log("Scrolling to load all coupons...");

  // Waits up to `timeout` ms for a selector to appear in the DOM
  const waitFor = (selector, timeout = WAIT_TIMEOUT_MS) => new Promise(resolve => {
    const found = document.querySelector(selector);
    if (found) return resolve(true);
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(true);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(false); }, timeout);
  });

  while (true) {
    window.scrollTo(0, document.body.scrollHeight);

    // Wait for the load indicator to appear after scrolling
    const appeared = await waitFor(".e-1tpx6fl", SCROLL_DELAY_MS);

    if (!appeared) {
      // Load indicator did not appear, all coupons are loaded
      console.log("Reached end of coupon list.");
      break;
    }

    await new Promise(r => setTimeout(r, SCROLL_RESET_DELAY_MS));
  }

  // Scroll back to top before clipping
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, SCROLL_RESET_DELAY_MS));

  // Step 2: Click every unclipped "Clip" button
  const buttons = document.querySelectorAll(".e-iei4ac");
  let clipped = 0;
  let skipped = 0;

  console.log(`Found ${buttons.length} coupon button(s). Clipping...`);

  for (const btn of buttons) {
    if (btn.innerText.trim() === "Clip") {
      btn.click();
      clipped++;
      await new Promise(r => setTimeout(r, CLIP_DELAY_MS));
    } else {
      skipped++;
    }
  }

  // Step 3: Done
  const msg = `Done!\n\nClipped: ${clipped} coupon(s)\nSkipped: ${skipped} (already clipped or unavailable)`;
  console.log(msg);
  alert(msg);
})();
