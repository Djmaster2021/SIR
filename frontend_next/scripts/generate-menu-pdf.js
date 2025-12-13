// Generate a PDF of the /menu.pdf page using Playwright Chromium.
const path = require("node:path");
const { chromium } = require("playwright-chromium");

async function run() {
  const targetUrl = process.env.MENU_URL || "http://localhost:3001/menu.pdf";
  const outputPath = process.env.OUTPUT_PATH || path.join(__dirname, "..", "public", "menu-static.pdf");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });

  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "screen" });
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
  console.log(`PDF generado en: ${outputPath}`);
}

run().catch((err) => {
  console.error("Error generando PDF:", err);
  process.exit(1);
});
