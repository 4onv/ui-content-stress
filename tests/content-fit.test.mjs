import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';
import { observe } from '../demo/fixture.mjs';
import { inspectContentFit } from '../skills/ui-content-stress/scripts/inspect-content-fit.mjs';

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

async function withPage(run) {
  const page = await browser.newPage({ viewport: { width: 320, height: 650 } });
  try {
    await run(page);
  } finally {
    await page.close();
  }
}

test('ordinary mobile and long desktop cases can miss the defect', () => withPage(async page => {
  assert.deepEqual((await observe(page, 'broken', 'ordinary', 320)).issues, []);
  assert.deepEqual((await observe(page, 'broken', 'long-name', 768)).issues, []);
}));

test('long workspace name overflows mobile and displaces the action', () => withPage(async page => {
  const { issues } = await observe(page, 'broken', 'long-name', 320);
  assert.ok(issues.some(issue => issue.kind === 'viewport-overflow' && issue.scrollWidth > 320));
  assert.ok(issues.some(issue => issue.kind === 'outside-boundary' && issue.id === 'action'));
}));

test('hiding the overflow keeps the viewport clean but clips the title', () => withPage(async page => {
  const { issues } = await observe(page, 'clipped', 'long-name', 320);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].kind, 'slot-overflow');
  assert.equal(issues[0].id, 'title');
  assert.ok(issues[0].scroll > issues[0].client);
}));

test('fix preserves ordinary, long, and expanded content at both widths', () => withPage(async page => {
  for (const width of [320, 768]) {
    for (const fixture of ['ordinary', 'long-name', 'expanded-action']) {
      const result = await observe(page, 'fixed', fixture, width);
      assert.deepEqual(result.issues, [], JSON.stringify({ fixture, width, issues: result.issues }));
    }
  }
}));

test('missing or ambiguous targets produce explicit findings', () => withPage(async page => {
  await page.setContent('<main><p>First</p><p>Second</p></main>');
  const { issues } = await page.evaluate(inspectContentFit, { slots: [
    { id: 'missing', selector: 'h1', fit: ['width'] },
    { id: 'ambiguous', selector: 'p', fit: ['width'] },
  ] });
  assert.deepEqual(issues.map(issue => [issue.kind, issue.count]), [
    ['selector-match-count', 0], ['selector-match-count', 2],
  ]);
}));

test('vertical clipping and wrong ancestor are observable', () => withPage(async page => {
  await page.setContent('<main><p style="height: 10px; overflow:hidden">First<br>Second</p></main><aside>Other</aside>');
  const { issues } = await page.evaluate(inspectContentFit, { slots: [
    { id: 'clamp', selector: 'p', fit: ['height'], within: 'aside' },
  ] });
  assert.deepEqual(issues.map(issue => issue.kind), ['slot-overflow', 'invalid-boundary']);
}));
