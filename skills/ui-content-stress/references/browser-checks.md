# Browser checks for content fit

Use the component and application state that own the value. Write down the expected fit for each essential slot before choosing selectors.

| Symptom | Evidence | Useful first inspection |
| --- | --- | --- |
| Whole document scrolls sideways | Document scroll width versus layout viewport client width | Walk ancestors from the first escaping box to find intrinsic sizing constraints. |
| Title appears clipped with no document overflow | Scroll width/height versus client width/height of its dedicated text box | Inspect the actual box that clips or clamps. Use a block or inline-block for measurable dimensions. |
| Action escapes its parent | Child border box versus ancestor client box | Confirm the designated ancestor is the intended boundary and inspect layout wrapping. |
| Intentional truncation or an internal scroller | Project-specific assertion for the affordance, scroll container, and essential content | Exercise keyboard, pointer, or touch behavior as relevant to the affordance. |

## Use the helper with Playwright

The helper is optional. Use an equivalent existing assertion if it expresses the same invariant. Import it in your test runner and pass it to `page.evaluate`. It reads the current document and makes no changes. Set a state-specific selector or wait with the project's normal readiness assertion before measuring. Use selectors that match exactly one visible element.

```js
import { inspectContentFit } from '../skills/ui-content-stress/scripts/inspect-content-fit.mjs';

await page.getByTestId('workspace-title').waitFor({ state: 'visible' });
await page.evaluate(() => document.fonts.ready.then(() => undefined));
const result = await page.evaluate(inspectContentFit, {
  slots: [
    { id: 'title', selector: '[data-testid="workspace-title"]', fit: ['width', 'height'] },
    { id: 'action', selector: '[data-testid="workspace-action"]', within: '.workspace-heading' },
  ],
});
expect(result.issues).toEqual([]);
```

Adapt the import path to where the skill was installed. `fit: ['width']` compares scroll and client widths. `fit: ['height']` compares heights. Use `fit` on a dedicated box expected to fit without scrolling or truncation. `within` checks horizontal containment in a matching ancestor. The default document-width check uses a 1 CSS px tolerance. Set `checkViewport: false` when a scoped component check runs on a page whose separate layout is out of scope. Check the viewport independently if the page itself must reflow.

These checks can flag suspicious geometry, including a case where a CSS patch clipped content to hide a scrollbar. They cannot prove text is readable, controls are unobscured, or a translation is correct. Review overlaps or clipping by ancestors with a scoped screenshot or an interaction assertion. Preserve a case name, viewport, and issue details in failures so someone else can rerun the same test.
