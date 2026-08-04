# Frontend Accessibility Acceptance Checklist

Target: WCAG 2.2 AA for the consumer web experience.

## Keyboard and focus

- [ ] Every interactive control is reachable with a keyboard.
- [ ] Focus order follows the visible reading order.
- [ ] Focus is always visible in light, dark, and forced-colors modes.
- [ ] Escape closes optional menus and source panels without losing task context.
- [ ] Enter submits the selected Omniprompt intent; Shift+Enter inserts a new line.
- [ ] No high-risk action depends on hovering, dragging, sliding, or holding a pointer.

## Structure and screen readers

- [ ] Every page has one descriptive `h1`.
- [ ] Landmarks identify header, navigation, main content, complementary content, and footer.
- [ ] Buttons have accessible names that describe the action.
- [ ] Icon-only controls have labels and at least a 44×44 CSS pixel target.
- [ ] Status changes use appropriate live regions without repeatedly interrupting the user.
- [ ] Tables, lists, definitions, and headings preserve semantic relationships.

## Text and layout

- [ ] Body text remains readable at 200% browser zoom.
- [ ] Layout works at 320 CSS pixels without horizontal page scrolling.
- [ ] Important disclosures use at least 14px equivalent text and adequate contrast.
- [ ] Text containers allow expansion for translation.
- [ ] LTR and RTL layouts preserve reading and focus order.
- [ ] Content does not rely on fixed desktop or mobile artboards.

## Color and motion

- [ ] Text and controls meet WCAG AA contrast requirements.
- [ ] Meaning is never communicated by color alone.
- [ ] Brand accent, success, warning, danger, and sponsored content remain distinguishable.
- [ ] Forced-colors mode exposes boundaries, focus, controls, and selected states.
- [ ] `prefers-reduced-motion` removes nonessential movement.
- [ ] Loading states include useful text, not animation alone.

## Forms, errors, and confirmation

- [ ] Inputs have persistent labels or accessible names.
- [ ] Errors appear next to the affected control and explain recovery.
- [ ] Error text is announced and remains visible until resolved.
- [ ] Duplicate submission is prevented.
- [ ] High-risk confirmation displays destination, recipient, amount, shared data, and reversibility before execution.
- [ ] Cancel is neutral and clearly different from destructive actions.
- [ ] System authentication has keyboard and assistive-technology-compatible alternatives.

## Validation viewports

- [ ] 320×568
- [ ] 390×844
- [ ] 768×1024
- [ ] 1024×768
- [ ] 1280×800
- [ ] 1440×900

## Initial assistive technology matrix

- [ ] VoiceOver with Safari on current iOS.
- [ ] VoiceOver with Safari on current macOS.
- [ ] NVDA with Chrome on current Windows.
- [ ] TalkBack with Chrome on current Android.
- [ ] Keyboard-only operation on Chrome, Firefox, Safari, and Edge.
