---
name: ui-content-stress
description: Reproduce and fix layout failures caused by long user content or expanded labels in a rendered web UI. Use for flex or grid overflow, clipped essential text, or responsive content-fit checks with realistic fixtures.
---

# UI Content Stress

Use the rendered component with realistic content to test whether its layout preserves the information and actions people need.

1. Identify the affected route, component, and essential content. Establish what should wrap, stay visible, or truncate with a usable full-value affordance. Name any deliberately scrollable region, such as a table. Keep those behaviors in the test.
2. Reproduce with ordinary content and with one plausible stress value in the same slot. Choose values from the app's data model or test fixtures. Use a long unbroken workspace name or identifier for user data, or a longer translated label for interface copy. Reach the state through the app's normal fixture, story, test setup, or local mock. Label generated data. Direct DOM text edits can help isolate a symptom, then reproduce it through the normal rendering path for the regression.
3. Start at the reported viewport. Include the closest supported narrow width and a representative wide width. For responsive reflow work, 320 CSS px is a useful narrow case where the product supports it. Wait for the view, fonts, and target state to settle. Use the project's existing browser tests or the [browser check recipe](references/browser-checks.md). Capture the failing fixture, width, selector, and measured invariant before changing code.
4. Trace the first constrained ancestor. Check flex/grid intrinsic sizing and wrapping, fixed widths, line clamps, or a layout that cannot accommodate a longer action. Fix the responsible component and preserve nearby behavior. If intentional truncation is the design, exercise the full-value affordance through its normal interaction and check the information stays available to users.
5. Rerun the original ordinary and stressed cases. Keep the smallest useful regression in the project's test framework when appropriate. Report which case failed, how it changed, and what the browser verified. Flag checks you could only inspect in code.

Keep the task scoped to the requested UI and content. Use fixtures in local or test environments and preserve real data. Keep existing typography, hierarchy, and interaction patterns unless the defect calls for a specific change.
