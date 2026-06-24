// Price Chopper Auto Coupon Clipper

const COUPON_PAGE_URL = "https://shop.pricechopper.com/store/price-chopper-ny/pages/in-store-deals";
const SCROLL_DELAY_MS = 800;
const CLIP_DELAY_MS = 150;
const SCROLL_RESET_DELAY_MS = 300;
const WAIT_TIMEOUT_MS = 5000;
const LOAD_INDICATOR_CLASS = ".e-1tpx6fl";
const COUPON_BUTTON_CLASS = ".e-iei4ac";

(async () => {
  console.log("Version 1.2.0");

  // Check that we are on the correct page
  if (!window.location.href.startsWith(COUPON_PAGE_URL)) {
    alert("Redirecting to the Price Chopper coupons page. Click the bookmark again once it loads.");
    window.location.href = COUPON_PAGE_URL;
    return;
  }

  // Wait for the page to fully load before doing anything
  await new Promise(resolve => {
    if (document.readyState === "complete") return resolve();
    window.addEventListener("load", resolve, { once: true });
  });

  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  // Waits up to `timeout` ms for at least one element matching `selector` to have `text` as its innerText
  const waitForText = (selector, text, timeout = WAIT_TIMEOUT_MS) => new Promise(resolve => {
    const hasText = () => [...document.querySelectorAll(selector)].some(el => el.innerText.trim() === text);
    if (hasText()) return resolve(true);
    const observer = new MutationObserver(() => {
      if (hasText()) {
        observer.disconnect();
        resolve(true);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setTimeout(() => { observer.disconnect(); resolve(false); }, timeout);
  });

  // Wait for coupon buttons to appear and have their text rendered before proceeding
  console.log("Waiting for coupons to appear...");
  await waitForText(COUPON_BUTTON_CLASS, "Clip");

  // Step 1: Scroll down until all coupons are loaded
  console.log("Scrolling to load all coupons...");

  let lastHeight = 0;
  while (true) {
    // If the load indicator is in the DOM, scroll to it; otherwise scroll to the bottom
    const indicator = document.querySelector(LOAD_INDICATOR_CLASS);
    if (indicator) {
      indicator.scrollIntoView();
    } else {
      window.scrollTo(0, document.body.scrollHeight);
    }

    await new Promise(r => setTimeout(r, SCROLL_DELAY_MS));

    // Stop when the page height has not grown after scrolling
    const newHeight = document.body.scrollHeight;
    if (newHeight === lastHeight) {
      console.log("Reached end of coupon list.");
      break;
    }
    lastHeight = newHeight;
  }

  // Scroll back to top before clipping
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, SCROLL_RESET_DELAY_MS));

  // Step 2: Click every unclipped "Clip" button
  const buttons = document.querySelectorAll(COUPON_BUTTON_CLASS);
  let clipped = 0;
  let skipped = 0;

  console.log(`Found ${buttons.length} coupon button(s). Clipping...`);

  for (const btn of buttons) {
    if (btn.innerText.trim() === "Clip") {
      btn.scrollIntoView();
      btn.click();
      clipped++;
      await new Promise(r => setTimeout(r, CLIP_DELAY_MS));
    } else {
      skipped++;
    }
  }

  // Step 3: Done
  const msg = `Finished clipping ${plural(clipped, "coupon")}.\nSkipped ${plural(skipped, "coupon")} already clipped.\n\nReload the page and filter by "Clipped" to ensure that all coupons were clipped successfully.\n\nIf not, just click the bookmark again.`;
  console.log(msg);
  alert(msg);
})();
