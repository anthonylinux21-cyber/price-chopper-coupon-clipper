// Price Chopper Auto Coupon Clipper
// Paste this into your browser's DevTools Console while on the Price Chopper coupons page.

const COUPON_PAGE_URL = "https://shop.pricechopper.com/store/price-chopper-ny/pages/in-store-deals";
const SCROLL_DELAY_MS = 800;
const CLIP_DELAY_MS = 150;
const SCROLL_RESET_DELAY_MS = 300;
const WAIT_TIMEOUT_MS = 5000;

(async () => {
  // Check that we are on the correct page
  if (!window.location.href.startsWith(COUPON_PAGE_URL)) {
    alert("Redirecting to the Price Chopper coupons page. Click the bookmark again once it loads.");
    window.location.href = COUPON_PAGE_URL;
    return;
  }

  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

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
  const msg = `Finished clipping ${plural(clipped, "coupon")}.\nSkipped ${plural(skipped, "coupon")} already clipped.\n\nReload the page and filter by "Clipped" to ensure that all were clipped successfully.\n\nIf not, just click the bookmark again.`;
  console.log(msg);
  alert(msg);
})();
