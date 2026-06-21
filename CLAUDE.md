## 1. Project

A cross-platform (iOS + Android) **football live-score app** built with React Native.
The product bar is high: **fluid, fully animated, fresh, playful, premium**. Every screen
should feel alive — motion is a first-class feature, not decoration. If a change makes the
app feel more static or more "default React Native," it's wrong.

Core surfaces: live scores, fixtures, league tables, match detail (events/lineups/stats),
team & competition pages, favourites.

---

## 2. Tech stack

Treat `package.json` as the source of truth for exact versions. Directionally:

- **Expo** (managed, **New Architecture / Fabric enabled** — it's required by the libraries below) with **dev builds** (not Expo Go, because of native modules).
- **Expo Router** — file-based navigation under `app/`.
- **TypeScript**, `strict: true`. No `any` without a `// reason:` comment.
- **react-native-reanimated v4** — animation foundation. **Not v3** (v3 is end-of-life and won't track future RN releases). Runs on the UI thread via worklets.
- **moti** — declarative wrapper over Reanimated (`from` / `animate`). Default choice for micro-interactions and most UI animation.
- **react-native-gesture-handler** — all gestures (swipe, drag, pull-to-refresh).
- **nativewind v4** — styling via Tailwind classes. The colour palette lives in `tailwind.config.js` as semantic tokens (see §5).
- **zustand** — local/UI state only (filters, favourites, theme). Never put server data here.
- **expo-image** — all images (built-in caching). Never use RN `<Image>`.
- **@shopify/flash-list** — all long lists (fixtures, tables). Never `FlatList` for big lists.
- **expo-haptics** — tactile feedback on key interactions.

When adding a dependency, prefer one already in the ecosystem above. Flag any library that
is unmaintained or pulls in the Legacy Architecture.

---

## 3. Commands

```bash
# install
npm install

# run (dev build, not Expo Go)
npx expo run:ios
npx expo run:android
npx expo start --dev-client   # JS-only iteration after a native build exists

# quality gates — run before declaring a task done
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # jest + @testing-library/react-native

# native rebuild needed after changing native deps / config plugins
npx expo prebuild --clean
```

Always run `lint`, `typecheck`, and `test` before finishing. Do not commit if any fail.

---

## 4. Project structure

```
app/                # Expo Router routes (screens only — keep thin)
  (tabs)/
  match/[id].tsx
  team/[id].tsx
src/
  components/        # reusable UI (Button, Card, ScoreBadge, LiveDot...)
  features/          # feature modules (fixtures, match, table, favourites)
    <feature>/
      components/
      hooks/
      api.ts         # react-query hooks for this feature
  ui/                # design-system primitives + theme
    theme.ts         # token definitions, light/dark maps
    motion.ts        # shared durations, easings, spring configs
  lib/               # api client, formatters, date utils
  store/             # zustand stores
assets/
```

Rules:
- Route files in `app/` stay thin — fetch via a feature hook, render a feature component.
- Business logic lives in `features/*/hooks`, never inline in a screen.
- No cross-feature imports except through `src/components` or `src/ui`.

---

## 5. Design system (the heart of this app)

### Colour tokens

The brand palette is a single green ramp (`frosted-mint` → `evergreen`). **Never hardcode
hex in components** — always use the semantic token. Raw ramp values live in one place;
components reference roles. An all-green palette has a real contrast risk, so text roles are
locked to the extremes of the ramp.

Raw ramp:

| Name           | Hex       |
|----------------|-----------|
| frosted-mint   | `#d8f3dc` |
| celadon        | `#b7e4c7` |
| celadon-2      | `#95d5b2` |
| mint-leaf      | `#74c69d` |
| mint-leaf-2    | `#52b788` |
| sea-green      | `#40916c` |
| dark-emerald   | `#2d6a4f` |
| pine-teal      | `#1b4332` |
| evergreen      | `#081c15` |

Semantic roles (define both modes in `src/ui/theme.ts`, expose to NativeWind):

| Role               | Light          | Dark           |
|--------------------|----------------|----------------|
| `bg`               | `#f5fdf8`*     | `evergreen`    |
| `surface`          | `frosted-mint` | `pine-teal`    |
| `surface-elevated` | `celadon`      | `dark-emerald` |
| `border`           | `celadon-2`    | `sea-green`    |
| `primary`          | `sea-green`    | `mint-leaf`    |
| `primary-pressed`  | `dark-emerald` | `celadon-2`    |
| `accent`           | `mint-leaf-2`  | `mint-leaf-2`  |
| `text`             | `evergreen`    | `frosted-mint` |
| `text-muted`       | `dark-emerald` | `celadon-2`    |
| `on-primary`       | `frosted-mint` | `evergreen`    |

\* add a small set of near-neutral mint tints (off-white `bg`, plus a true white for cards if
needed) — the brand ramp has no neutrals, and pure green backgrounds tire the eye.

**LIVE / goal accent (recommended):** reserve ONE warm non-green for live states and goal
moments — e.g. coral `#FF6B5C` or amber `#FFB020`. Everything else green means the live
pulse and goal flash have nothing to pop against. Use it sparingly: live dot, goal flash,
"+1" score bump. Confirm the exact hue with the designer before shipping.

Run every text/background pairing through a WCAG AA check (4.5:1 body, 3:1 large). The
mid-ramp greens (`celadon-2`, `mint-leaf`) fail as text on light surfaces — don't use them
for text.

### Type, spacing, radii

- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48`. No arbitrary margins.
- Radii: cards `16–20`, pills/badges fully rounded, sheets `24` top corners.
- Type: one expressive display family + one clean text family. Tabular figures for all
  scores and clocks (scores must not shift width as they change).
- Generous whitespace. Playful ≠ cluttered.

---

## 6. Motion guidelines

Motion is the product. But it must be smooth on a mid-range Android, not just an iPhone.

**Which tool for what:**
- **Moti** — enters/exits, list item stagger, press feedback, tab transitions, skeleton
  shimmer. 90% of animation work.
- **Reanimated (direct)** — gesture-driven and continuous: swipeable cards, draggable
  bottom sheets, scroll-linked headers, the live score ticker value.
- **Skia** — goal confetti, momentum/xG graphs, shader backgrounds, blur. Only when
  standard views can't do it (a gradient card is `expo-linear-gradient`, NOT Skia).

**Performance rules (non-negotiable):**
- Animate `transform` / `opacity`. Avoid animating `width/height/top/left/margin` — they
  trigger layout and drop frames.
- Keep simultaneously-animated component counts modest (~100 on low-end Android). For more,
  move to a single Skia canvas instead of many animated views.
- Keep logic in JS/state and animation values in shared values — don't mix. Minimise
  `runOnJS`.
- Ensure the iOS 120fps flag (`CADisableMinimumFrameDurationOnPhone`) is enabled so
  ProMotion devices run high refresh.

**Feel:**
- Springs over linear timing for anything interactive (gentle, slightly playful — low
  stiffness, a touch of bounce). Define a small set in `src/ui/motion.ts` and reuse; no
  per-component magic numbers.
- Pair meaningful moments with haptics (goal, favourite toggle, pull-to-refresh release).
- **Signature moments to invest in:** score change (digit roll + accent flash + haptic),
  goal celebration, live-match pulsing dot, pull-to-refresh, screen-to-screen shared
  element (e.g. team crest → match header).

**Accessibility:** respect the OS **Reduce Motion** setting. When on, swap big motion for
quick fades/instant states — never block content behind an animation that won't play.

---

## 7. Data layer

- The app talks **only to our own backend API**, never to SofaScore / upstream score
  sources directly. The backend scrapes/aggregates and caches (Redis). This keeps
  ToS-risky calls off user devices, hides upstream keys, and means an upstream block
  degrades to stale-but-served rather than a crash.
- All fetching goes through **react-query** hooks in `features/*/api.ts`. No `fetch` in
  components.
- Live data: poll in-play matches on a sensible interval (e.g. 15–30s) via react-query
  `refetchInterval`, or subscribe to a backend websocket if available — only while a match
  screen is focused. Stop polling on blur/background.
- Cache reference data (teams, competitions, completed results) aggressively; only live
  fixtures should be hot.
- Every list/detail must handle: loading (skeletons, not spinners), empty, error (friendly
  retry), and stale-while-revalidate.

---

## 8. State management

- **Server state → react-query.** Scores, fixtures, tables, lineups.
- **UI/local state → zustand.** Theme, active filters, favourites (persisted), onboarding.
- **Animation state → Reanimated shared values.** Never store animation values in React
  state or zustand.
- Never duplicate server data into zustand.

---

## 9. Code conventions

- Functional components + hooks only. No class components.
- Components: small, one responsibility. If a file passes ~150 lines, split it.
- Naming: components `PascalCase`, hooks `useX`, files match the export. Feature folders
  `kebab-case`.
- Styling: NativeWind classes referencing semantic tokens (`bg-surface`, `text-text-muted`).
  No inline hex, no inline `StyleSheet` colours.
- Strings/dates: format via `src/lib`. Use the device locale and timezone for kickoff times.
- No console logs in committed code (use the logger util). No commented-out code.
- Prefer composition over props explosion; extract a primitive into `src/ui` when reused 3+ times.

---

## 10. Testing

- **Unit/component:** Jest + `@testing-library/react-native`. Test behaviour and
  accessibility roles, not implementation details. Mock the api client.
- Cover: data hooks (loading/error/empty/success), score formatting, table sorting,
  favourite toggling.
- **E2E (optional but encouraged):** Maestro flows for the critical path (open app → live
  tab → open match → favourite a team).
- A task is not done until new logic has tests and `npm run test` passes.

---

## 11. Accessibility

- Respect Reduce Motion (see §6) and Dynamic Type / font scaling — layouts must not break at
  large text sizes.
- Every interactive element: `accessibilityRole`, label, and a minimum 44×44 hit target
  (use `hitSlop` for small badges).
- Verify colour contrast (§5). Don't encode meaning in colour alone — pair the live/goal
  accent with an icon or label.

---

## 12. Performance checklist

- FlashList for any list > ~20 items; stable `keyExtractor`; memoised row components.
- `expo-image` everywhere with caching; size images to their display box.
- Memoise expensive renders (`React.memo`, `useMemo`, `useCallback`) — but profile first;
  most jank is heavy list renders, not animations.
- Avoid re-rendering animated trees from parent state changes.
- Test on a real mid-range Android device before calling animation work complete.

---

## 13. Do / Don't

**Do**
- Reach for Moti first, Reanimated for gestures, Skia only when necessary.
- Use semantic colour tokens and the spacing scale.
- Add skeletons, empty states, and error retries to every data view.
- Keep all upstream data access behind our backend.

**Don't**
- Hardcode hex colours or arbitrary spacing.
- Use Reanimated v3 APIs, `FlatList` for big lists, or RN `<Image>`.
- Call SofaScore/upstream from the device.
- Animate layout properties or ignore Reduce Motion.
- Put server data in zustand or animation values in React state.

---

## 14. Git

- Conventional commits: `feat:`, `fix:`, `perf:`, `refactor:`, `style:`, `test:`, `chore:`.
- Small, focused PRs. Describe the user-visible change and include before/after for any UI
  or motion work.
- Never commit secrets or API base URLs — use env config.