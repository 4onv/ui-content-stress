import { chromium } from 'playwright';
import { observe } from './fixture.mjs';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const cases = [
    ['broken', 'ordinary', 320],
    ['broken', 'long-name', 768],
    ['broken', 'long-name', 320],
    ['clipped', 'long-name', 320],
    ['fixed', 'ordinary', 320],
    ['fixed', 'long-name', 320],
    ['fixed', 'expanded-action', 320],
    ['fixed', 'long-name', 768],
  ];
  const results = [];
  for (const entry of cases) results.push(await observe(page, ...entry));
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ synthetic: true, cases: results }, null, 2));
  } else {
    console.log('Synthetic demo using a workspace heading in Chromium');
    for (const { mode, fixture, width, issues } of results) {
      const summary = issues.map(issue => issue.id ? issue.kind + ' (' + issue.id + ')' : issue.kind);
      console.log(`${String(width).padStart(3)}px  ${mode.padEnd(8)}  ${fixture.padEnd(16)}  ${summary.join(', ') || 'passes'}`);
    }
  }
} finally {
  await browser.close();
}
