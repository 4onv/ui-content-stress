/**
 * Inspect selected content boxes in the current browser document.
 * Pure browser-side function that can be serialized by page.evaluate.
 */
export function inspectContentFit({ slots = [], checkViewport = true, tolerance = 1 } = {}) {
  if (!Array.isArray(slots) || !Number.isFinite(tolerance) || tolerance < 0) {
    throw new TypeError('Expected an array of slots and a nonnegative finite tolerance.');
  }

  const issues = [];
  const root = document.documentElement;
  const viewport = { clientWidth: root.clientWidth, scrollWidth: (document.scrollingElement ?? root).scrollWidth };
  if (checkViewport && viewport.scrollWidth - viewport.clientWidth > tolerance) {
    issues.push({ kind: 'viewport-overflow', ...viewport });
  }

  function findVisible(selector, id, role) {
    const matches = document.querySelectorAll(selector);
    if (matches.length !== 1) {
      issues.push({ kind: 'selector-match-count', id, role, selector, count: matches.length });
      return null;
    }
    const element = matches[0];
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (style.visibility !== 'visible' || rect.width === 0 || rect.height === 0) {
      issues.push({ kind: 'unmeasurable-box', id, role, selector });
      return null;
    }
    return element;
  }

  const ids = new Set();
  for (const { id, selector, fit = [], within } of slots) {
    if (typeof id !== 'string' || !id || ids.has(id) || typeof selector !== 'string' || !selector
        || !Array.isArray(fit) || fit.some(axis => axis !== 'width' && axis !== 'height')
        || (within !== undefined && (typeof within !== 'string' || !within))
        || (!fit.length && !within)) {
      throw new TypeError('Each slot needs a unique id, a selector, and a fit axis or containment boundary.');
    }
    ids.add(id);
    const element = findVisible(selector, id, 'slot');
    if (!element) continue;

    for (const axis of new Set(fit)) {
      const client = axis === 'width' ? element.clientWidth : element.clientHeight;
      const scroll = axis === 'width' ? element.scrollWidth : element.scrollHeight;
      if (client === 0) {
        issues.push({ kind: 'unmeasurable-axis', id, selector, axis });
      } else if (scroll - client > tolerance) {
        issues.push({ kind: 'slot-overflow', id, selector, axis, client, scroll });
      }
    }

    if (within) {
      const boundary = findVisible(within, id, 'boundary');
      if (!boundary) continue;
      if (boundary === element || !boundary.contains(element) || boundary.clientWidth === 0) {
        issues.push({ kind: 'invalid-boundary', id, selector, within });
        continue;
      }
      const elementBox = element.getBoundingClientRect();
      const left = boundary.getBoundingClientRect().left + boundary.clientLeft;
      const pastLeft = Math.max(0, left - elementBox.left);
      const pastRight = Math.max(0, elementBox.right - (left + boundary.clientWidth));
      if (Math.max(pastLeft, pastRight) > tolerance) {
        issues.push({ kind: 'outside-boundary', id, selector, within, pastLeft, pastRight });
      }
    }
  }

  return { version: 1, viewport, issues };
}
