import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const html = readFileSync(join(root, "index.html"), "utf8");
const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
assert.equal(styleBlocks.length, 1, "Expected exactly one inline stylesheet");
const css = styleBlocks[0][1];

function assertBalanced(source, label) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let comment = false;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (comment) {
      if (ch === "*" && next === "/") { comment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === "/" && next === "*") { comment = true; i += 1; continue; }
    if (ch === "'" || ch === '"' || ch === String.fromCharCode(96)) { quote = ch; continue; }
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    assert.ok(depth >= 0, label + " has an unexpected closing brace at offset " + i);
  }
  assert.equal(depth, 0, label + " has unclosed braces");
  assert.equal(quote, "", label + " has an unterminated string");
  assert.equal(comment, false, label + " has an unterminated comment");
}

assertBalanced(css, "CSS");

const scriptBlocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter((match) => !/\bsrc\s*=/i.test(match[1]))
  .map((match) => match[2]);
assert.ok(scriptBlocks.length >= 1, "Expected the application JavaScript");
const tempDir = mkdtempSync(join(tmpdir(), "finzaro-ui-audit-"));
try {
  scriptBlocks.forEach((source, index) => {
    const file = join(tempDir, "inline-" + index + ".js");
    writeFileSync(file, source, "utf8");
    const checked = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    assert.equal(
      checked.status,
      0,
      "JavaScript syntax check failed for inline script " + index + ":\n" + checked.stderr + checked.stdout
    );
  });
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

const themes = ["dark", "light", "winter", "autumn", "summer", "spring", "minimal", "maximal", "peach"];
for (const theme of themes) {
  const selector = '[data-theme="' + theme + '"]';
  assert.ok(css.includes(selector), "Missing theme CSS: " + theme);
  const rule = new RegExp("\\\\[data-theme=\\\"" + theme + "\\\"\\\\]\\\\s*\\\\{[^}]*--cs:\\\\s*dark\\\\b");
  assert.ok(rule.test(css), "Theme must force a dark color scheme: " + theme);
}
assert.ok(!/--cs\s*:\s*light\b/i.test(css), "A light color-scheme declaration remains");
assert.ok(
  css.includes("Force a consistent dark UI across every preset"),
  "The final dark-surface safety layer is missing"
);

function luminance(hex) {
  let value = hex.slice(1);
  if (value.length === 3) value = value.split("").map((part) => part + part).join("");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrastRatio(foreground, background) {
  const fg = luminance(foreground);
  const bg = luminance(background);
  if (fg === null || bg === null) return null;
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}
function hexColors(value) {
  return [...value.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})(?![0-9a-f])/gi)].map((match) => "#" + match[1]);
}

const failures = [];
for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const selector = match[1].trim();
  const body = match[2];
  const foreground = body.match(/(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3}|#[0-9a-f]{6})\s*(?:!important)?\s*(?:;|$)/i);
  const background = body.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)\s*(?:!important)?\s*(?:;|$)/i);
  if (!foreground || !background) continue;
  const foregroundColors = hexColors(foreground[1]);
  const backgroundColors = hexColors(background[1]);
  for (const fg of foregroundColors) {
    for (const bg of backgroundColors) {
      const ratio = contrastRatio(fg, bg);
      if (ratio !== null && ratio < 4.5) {
        failures.push({
          selector: selector.slice(0, 140),
          foreground: fg,
          background: bg,
          ratio: Number(ratio.toFixed(2))
        });
      }
    }
  }
}
assert.deepEqual(failures, [], "Hard-coded CSS text/background pairs below 4.5:1:\n" + JSON.stringify(failures, null, 2));

const goalButtonRule = css.slice(css.lastIndexOf("Keep action labels readable"));
assert.ok(goalButtonRule.includes("color: #f0f2f7 !important"), "Goal button needs a light foreground");
assert.ok(goalButtonRule.includes("background: #1b2027 !important"), "Goal button needs an explicit dark surface");
assert.ok(contrastRatio("#f0f2f7", "#1b2027") >= 4.5, "Goal button contrast must meet WCAG AA");
assert.ok(css.includes("color: #241108; background: linear-gradient(135deg, #ffb347, #f2682a)"), "The orange toast must use a high-contrast dark label");
assert.ok(Math.min(contrastRatio("#241108", "#ffb347"), contrastRatio("#241108", "#f2682a")) >= 4.5, "Toast contrast must meet WCAG AA");

const shareStart = html.indexOf("function drawShare()");
const shareEnd = html.indexOf('$("#bShare").onclick', shareStart);
assert.ok(shareStart >= 0 && shareEnd > shareStart, "Share-card generator could not be located");
const shareCard = html.slice(shareStart, shareEnd);
for (const oldLightToken of ['"#fff1e6"', 'rgba(255,255,255,.62)', 'rgba(255,255,255,.7)', '"#3a2013"', '"#8a5d44"']) {
  assert.ok(!shareCard.includes(oldLightToken), "Light share-card styling remains: " + oldLightToken);
}

assert.ok(html.includes('id="fcGoalBtn"'), "Monthly forecast goal button is missing");
assert.ok(html.includes('return { actual, history, baseRate, forecastRate, projected: actual + forecastRate * daysLeft };'), "Monthly forecast formula changed unexpectedly");

console.log("Finzaro UI audit passed.");
console.log("Checked: inline JavaScript syntax, CSS structure, 9 dark themes, hard-coded foreground/background contrast, goal-button contrast and dark share-card palette.");
console.log("Hard-coded low-contrast CSS text pairs found: " + failures.length);
