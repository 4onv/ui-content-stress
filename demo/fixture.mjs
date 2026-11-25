import { inspectContentFit } from '../skills/ui-content-stress/scripts/inspect-content-fit.mjs';

const fixtures = {
  ordinary: { title: 'Northwind', action: 'Edit workspace' },
  'long-name': { title: 'northwindfinanceweeklyconsolidationworkspace', action: 'Edit workspace' },
  'expanded-action': { title: 'Northwind', action: 'Workspace access and organization settings' },
};

const adaptations = {
  broken: '',
  clipped: '.workspace-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
  fixed: `.workspace-title { min-width: 0; overflow-wrap: anywhere; }
          .workspace-action { max-width: 55%; overflow-wrap: anywhere; white-space: normal; }`,
};

function html({ title, action }, mode) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Synthetic workspace heading</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 16px; color: #242735; font: 16px sans-serif; }
  .workspace-heading { display: flex; align-items: center; gap: 12px; border: 1px solid;
                       padding: 12px; max-width: 740px; }
  .workspace-title { margin: 0; flex: 1; font-size: 20px; }
  .workspace-action { flex: none; white-space: nowrap; padding: 6px 8px; font: inherit; }
  ${adaptations[mode]}
</style></head><body>
<p>Synthetic data for layout testing</p>
<section class="workspace-heading" aria-label="Workspace">
  <h1 class="workspace-title" data-testid="title">${title}</h1>
  <button class="workspace-action" data-testid="action">${action}</button>
</section></body></html>`;
}

export async function observe(page, mode, fixture, width) {
  await page.setViewportSize({ width, height: 650 });
  await page.setContent(html(fixtures[fixture], mode));
  await page.getByTestId('title').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  const measurement = await page.evaluate(inspectContentFit, {
    slots: [
      { id: 'title', selector: '[data-testid="title"]', within: '.workspace-heading', fit: ['width'] },
      { id: 'action', selector: '[data-testid="action"]', within: '.workspace-heading', fit: ['width'] },
    ],
  });
  return { mode, fixture, width, ...measurement };
}
