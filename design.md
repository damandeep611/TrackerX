# design.md — Design system + performance playbook

Portable rules distilled from the TrackerX refactor. Drop this file into a project with the same stack
(Next.js App Router + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Radix + `motion` + TanStack Query 5
+ Drizzle + Postgres) and apply it **without asking for confirmation on each point**. Where the project
differs (e.g. Supabase instead of Neon), see §10.

**For Claude:** read this whole file before changing UI or data code. Treat every "do / don't" here as a
standing decision by the owner. Only ask about things this file doesn't cover (product scope, data that
would be destroyed, external services, pushing/deploying).

---

## 1. Design principles (the look)

- **Calm, not loud.** Near-black / soft-white neutral surfaces, generous spacing, hairline borders, soft
  low-contrast shadows. Nothing glows, pulses or shouts unless it's the one thing that matters on screen.
- **Panel inside panel.** Content sits in a recessed *well* inside a *card* on the *canvas*:
  `background` (canvas) → `card` (panel) → `surface-2` (inner well) → `surface-3` (raised / hover).
- **One accent per view.** `brand` (blue) is for progress, the active nav item, focus and the single main
  call to action. Each metric gets one color from the chart palette. Status colors (success / warning /
  danger) only for status.
- **Numbers are first-class.** Metric values are monospace with tabular digits (`.tabular`), large, with a
  small muted unit next to them: `38.5 h / 100h`. Small inline bar sparklines and segmented progress bars
  instead of big charts where possible. Delta chips: `▲ +12% vs last week`.
- **Insight over data.** Every widget answers "how am I doing / what should I do next". Lead pages with a
  plain-language takeaway sentence generated from the data ("At your recent pace you'll reach 100h around
  May 14. 6.5h this week, 1.5h more than last week."). Prefer week-over-week change, streaks, consistency
  and ETAs over raw totals.
- **Honest copy.** No fake metrics, testimonials, pricing tables, "trusted by" logos, countdowns or mock
  screenshots. Marketing pages render the **real components with sample data**. Copy is short, specific
  and in the second person. No exclamation marks, no sci-fi jargon ("telemetry", "reactor core").
- **Light and dark are equal citizens.** Both themes designed, both checked. The theme follows the system
  by default and the user can switch; never force a theme on navigation or sign-out.
- **Minimum text size 11px** (`text-xs` for meta, `text-[11px]` only for tiny chart/axis labels).
  Never 8–10px.
- **No raw colors in components.** No hex, no `zinc-500`/`blue-600` palette classes; only tokens
  (`bg-card`, `text-muted-foreground`, `border-border`, `bg-brand-soft`…). Exceptions: user-chosen data
  colors (stored as hex, applied via `style`) and third-party brand marks (e.g. the Google "G").

---

## 2. Tokens (copy into `src/app/globals.css`)

Uses Tailwind 4 `@theme inline` + CSS variables in oklch, with a `.dark` class (next-themes,
`attribute="class"`). Requires `tw-animate-css` for `animate-in` utilities.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-subtle-foreground: var(--subtle-foreground);

  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);               /* shadcn "accent" = subtle hover surface, NOT brand */
  --color-accent-foreground: var(--accent-foreground);

  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-brand-soft: var(--brand-soft);

  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
  --color-danger: var(--danger);
  --color-danger-soft: var(--danger-soft);
  --color-destructive: var(--danger);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);

  --shadow-panel: var(--panel-shadow);
  --shadow-raised: var(--raised-shadow);

  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
}

:root {
  --radius: 0.75rem;
  --panel-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 1px 0 rgb(0 0 0 / 0.02);
  --raised-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.12), 0 2px 6px -2px rgb(0 0 0 / 0.06);

  --background: oklch(0.975 0.002 286);
  --foreground: oklch(0.21 0.006 286);
  --card: oklch(1 0 0);
  --card-foreground: var(--foreground);
  --surface-2: oklch(0.958 0.003 286);
  --surface-3: oklch(0.94 0.003 286);
  --popover: oklch(1 0 0);
  --popover-foreground: var(--foreground);

  --muted: var(--surface-2);
  --muted-foreground: oklch(0.5 0.01 286);
  --subtle-foreground: oklch(0.65 0.008 286);

  --border: oklch(0.92 0.003 286);
  --border-strong: oklch(0.87 0.005 286);
  --input: var(--border);
  --ring: oklch(0.62 0.17 255 / 0.5);

  --primary: oklch(0.21 0.006 286);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: var(--surface-2);
  --secondary-foreground: var(--foreground);
  --accent: var(--surface-3);
  --accent-foreground: var(--foreground);

  --brand: oklch(0.58 0.19 256);
  --brand-foreground: oklch(0.985 0 0);
  --brand-soft: oklch(0.58 0.19 256 / 0.1);

  --success: oklch(0.6 0.15 155);
  --success-soft: oklch(0.6 0.15 155 / 0.12);
  --warning: oklch(0.7 0.16 70);
  --warning-soft: oklch(0.7 0.16 70 / 0.14);
  --danger: oklch(0.6 0.21 25);
  --danger-soft: oklch(0.6 0.21 25 / 0.1);

  --chart-1: oklch(0.6 0.19 256);  /* blue */
  --chart-2: oklch(0.58 0.2 293);  /* violet */
  --chart-3: oklch(0.68 0.18 50);  /* orange */
  --chart-4: oklch(0.62 0.15 165); /* emerald */
  --chart-5: oklch(0.63 0.2 15);   /* rose */

  --sidebar: var(--card);
  --sidebar-foreground: var(--muted-foreground);
  --sidebar-primary: var(--foreground);
  --sidebar-primary-foreground: var(--background);
  --sidebar-accent: var(--surface-2);
  --sidebar-accent-foreground: var(--foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);
}

.dark {
  --background: oklch(0.155 0.002 286);
  --foreground: oklch(0.95 0.002 286);
  --card: oklch(0.19 0.003 286);
  --card-foreground: var(--foreground);
  --surface-2: oklch(0.225 0.004 286);
  --surface-3: oklch(0.265 0.005 286);
  --popover: oklch(0.21 0.004 286);
  --popover-foreground: var(--foreground);

  --muted: var(--surface-2);
  --muted-foreground: oklch(0.68 0.008 286);
  --subtle-foreground: oklch(0.52 0.008 286);

  --border: oklch(0.26 0.004 286);
  --border-strong: oklch(0.32 0.005 286);
  --input: var(--border);
  --ring: oklch(0.68 0.16 256 / 0.55);

  --primary: oklch(0.95 0.002 286);
  --primary-foreground: oklch(0.17 0.002 286);
  --secondary: var(--surface-2);
  --secondary-foreground: var(--foreground);
  --accent: var(--surface-3);
  --accent-foreground: var(--foreground);

  --brand: oklch(0.66 0.17 256);
  --brand-foreground: oklch(0.985 0 0);
  --brand-soft: oklch(0.66 0.17 256 / 0.14);

  --success: oklch(0.72 0.15 155);
  --success-soft: oklch(0.72 0.15 155 / 0.14);
  --warning: oklch(0.8 0.15 75);
  --warning-soft: oklch(0.8 0.15 75 / 0.14);
  --danger: oklch(0.68 0.19 22);
  --danger-soft: oklch(0.68 0.19 22 / 0.14);

  --chart-1: oklch(0.66 0.17 256);
  --chart-2: oklch(0.65 0.19 293);
  --chart-3: oklch(0.74 0.16 55);
  --chart-4: oklch(0.72 0.14 165);
  --chart-5: oklch(0.68 0.19 15);

  --sidebar: var(--background);
  --sidebar-foreground: var(--muted-foreground);
  --sidebar-primary: var(--foreground);
  --sidebar-primary-foreground: var(--background);
  --sidebar-accent: var(--surface-2);
  --sidebar-accent-foreground: var(--foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);

  --panel-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --raised-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.6), 0 2px 6px -2px rgb(0 0 0 / 0.4);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
  body { @apply bg-background font-sans text-foreground; font-feature-settings: "cv11", "ss01"; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer utilities {
  /* Metric numerals */
  .tabular { font-family: var(--font-mono); font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
}
```

**Fonts** (`app/layout.tsx`): Inter (`--font-inter`) for UI, Geist Mono (`--font-geist-mono`) for numbers,
both via `next/font/google` with `display: "swap"`, set as classes on `<html>`. Make sure the variables you
reference in `--font-sans` / `--font-mono` are the ones actually loaded.

**Radius:** cards `rounded-2xl`, wells `rounded-xl`, controls `rounded-lg`, chips/badges `rounded-full`.
**Shadows:** `shadow-panel` on cards, `shadow-raised` on hover / popovers / toasts.

---

## 3. Component kit (`src/components/ui/`)

Build these once, then compose every page from them. Never hand-roll a button, modal or card in a feature.

| Primitive | Notes |
|---|---|
| `Button` (cva) | variants: `default` (primary, near-black/near-white), `brand` (**one per view**), `outline`, `secondary`, `ghost`, `destructive`, `destructive-ghost`, `link`; sizes `xs` `sm` `default` `lg` `icon` `icon-sm` `icon-xs`; `asChild` (Radix Slot) for links. Focus: `focus-visible:ring-[3px] ring-ring`. |
| `Card`, `CardHeader`, `CardTitle`, `CardAction`, `CardFooter`, **`Well`** | the panel-in-panel system (code below). `Card interactive` adds a 2px hover lift. |
| `Badge` | `neutral` `outline` `brand` `success` `warning` `danger` `solid`, optional status `dot`. |
| `metric.tsx` | `MetricValue` (big tabular number + muted unit), `AnimatedNumber` (count-up once in view), `DeltaChip` (signed %, green when good, `invert` when lower is better), `BarSparkline`, `SegmentedProgress` (row of ticks with taller milestone `markers`), `ProgressBar`. |
| `StatCard` + `StatGrid` | the KPI card: icon + title, value + unit + sparkline in a Well, footer caption + delta chip. `StatGrid` = `grid gap-4 sm:grid-cols-2 xl:grid-cols-4`. |
| `Dialog` / `Sheet` | Radix (focus trap, Escape, aria). All modals go through these. |
| `Input`, `Textarea` | share one `fieldBase` class string. |
| `Tabs` | pill style (`TabsList` = rounded well, active trigger = card + shadow). |
| `Tooltip` | Radix; wrap pages in `TooltipProvider`. |
| `EmptyState` | icon, one-line title, hint, optional action; dashed border. `compact` variant. |
| `Skeleton` | `animate-pulse rounded-md bg-surface-3`. |
| `PageShell`, `PageHeader`, `SectionHeader` | page layout (code below). |
| `Chip` | small pill toggle for presets/categories (`aria-pressed`). |
| `undoToast(message, onUndo)` | react-hot-toast with an Undo button. |
| `chart.tsx` | shadcn chart wrapper over **Recharts** (the only chart library). |

```tsx
// card.tsx — the panel-in-panel system
function Card({ className, interactive = false, ...props }: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-1.5 text-card-foreground shadow-panel",
        interactive && "transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised",
        className
      )}
      {...props}
    />
  );
}
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex min-h-8 items-center gap-2 px-2.5 pt-1.5 has-data-[slot=card-action]:justify-between", className)} {...props} />;
}
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2 text-sm font-medium text-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground", className)} {...props} />;
}
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("ml-auto flex shrink-0 items-center gap-1", className)} {...props} />;
}
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-between gap-2 px-2.5 pb-1.5 text-xs text-muted-foreground", className)} {...props} />;
}
function Well({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="well" className={cn("rounded-xl border border-border/60 bg-surface-2 p-4", className)} {...props} />;
}

// page.tsx — every page uses this shell
function PageShell({ className, width = "default", ...props }: React.ComponentProps<"div"> & { width?: "default" | "wide" | "narrow" }) {
  const widths = { narrow: "max-w-3xl", default: "max-w-7xl", wide: "max-w-[1600px]" };
  return (
    <div
      className={cn("mx-auto w-full space-y-6 px-4 py-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-500 sm:px-6 lg:py-8", widths[width], className)}
      {...props}
    />
  );
}
function PageHeader({ title, description, eyebrow, actions }: { title: React.ReactNode; description?: React.ReactNode; eyebrow?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        {eyebrow && <div className="text-xs text-muted-foreground">{eyebrow}</div>}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
```

### Composition recipes
- **Page:** `<PageShell><PageHeader eyebrow title description={takeaway} actions={<Button variant="brand">…</Button>} />…</PageShell>`
- **KPI row:** `<StatGrid><StatCard icon={<Clock />} title="Last 7 days" value={6.8} decimals={1} unit="h" sparkline={daily} delta={+7} deltaLabel="vs prior 7 days" />…</StatGrid>`
- **Custom card:** `<Card><CardHeader><CardTitle><Icon />Title</CardTitle><CardAction>…</CardAction></CardHeader><Well>…</Well><CardFooter>…</CardFooter></Card>`
- **List rows:** inside a Well with `p-1.5`; rows `min-h-10 rounded-lg px-2.5 py-1.5 hover:bg-surface-3`; row actions appear on hover (`opacity-0 group-hover:opacity-100 focus-visible:opacity-100`).
- **Empty list:** `<EmptyState icon title description action />`, never a blank area.
- **Clickable card with inner buttons:** a "stretched link" on the title (`after:absolute after:inset-0` on the `<Link>`, card is `relative`), inner buttons `relative z-10`. Never nest `<button>` inside `<a>`.
- **Type scale:** page title `text-2xl font-semibold tracking-tight`; section `text-base font-semibold`; card title `text-sm font-medium`; body `text-sm`; meta `text-xs text-muted-foreground`; big metric `text-[32px] leading-none tabular`.

---

## 4. UX patterns

- **Optimistic everything.** Mutations update the UI immediately and roll back on error with a toast.
- **Undo instead of confirm** for reversible actions (log time, remove a link: Undo re-adds it). **Confirm
  dialog** only for destructive, irreversible actions (delete a project with data, delete an old entry).
  Confirm copy says exactly what is lost.
- **Fast entry:** inline quick-add (type + Enter) instead of a modal for the common case; optional fields
  behind a "Details" toggle. Quick chips for common values (+15m / +30m / +1h) plus a free-form parser
  ("1h 30m", "90", "1:30"). Remember the last used value where it helps.
- **Validation is visible:** inline warnings (`bg-warning-soft text-warning`, `role="alert"`) before submit
  ("Max 3h per entry; split longer sessions"); the same limit is enforced in the server's zod schema.
- **Keyboard shortcuts** for the main action of a page (e.g. `N` = new, `L` = log), ignored while typing in
  inputs or dialogs; show the key as a `<kbd>` hint.
- **Instant navigation feedback:** cards are `<Link>` (automatic prefetch); show a pending state with
  `useLinkStatus()` (spinner / top bar) and add a route `loading.tsx` skeleton **shaped like the real page**.
- **Every async surface has three states:** skeleton while loading, `EmptyState` when empty,
  error state with "Try again" (`refetch`). Route-level `loading.tsx`, `error.tsx`, `not-found.tsx`.
- **Errors are never swallowed.** No `console.log(error)` as error handling: toast a human message;
  keep the button usable for retry.
- **Honest pending states.** "Redirecting to Google…" with a spinner; never fake countdowns or progress.

## 5. Motion (`motion`, import from `"motion/react"`)

- Wrap the whole app in `<MotionConfig reducedMotion="user">` (root layout, so public pages too) and keep
  the CSS `prefers-reduced-motion` rule above.
- Presets in `lib/motion.ts`: ease `[0.22, 1, 0.36, 1]`; durations 0.15 / 0.25 / 0.4s; `fadeIn`
  (opacity + 6px rise), `stagger(0.04)` + `listItem` for grids, `hoverLift` (2px), `popIn` (0.97 → 1),
  `layoutTransition`, a soft spring (stiffness 380, damping 32).
- Use: page/section entrance, list stagger, `AnimatePresence mode="popLayout"` for add/remove, count-up on
  metrics once in view, progress fills. Don't: infinite pulses, parallax, big distances, bouncy UI.
- Charts: pass `isAnimationActive={!useReducedMotion()}` to Recharts series (Recharts ignores the OS setting).

## 6. Accessibility checklist

- Icon-only buttons have `aria-label`; decorative icons `aria-hidden`.
- Every interactive custom element (chips, toggles, markers) has `focus-visible:ring-[3px] focus-visible:ring-ring` and `outline-none`.
- `aria-pressed` for toggles, `aria-expanded` for disclosures, `role="progressbar"` + `aria-valuenow` for progress, `role="alert"` for inline errors, `aria-busy` while loading.
- Illustrations built from real components (marketing previews) are `inert` + `aria-hidden`.
- Images: meaningful `alt`, or `alt=""` when decorative.
- Check 390px width (mobile) for every page: no horizontal scroll, readable truncation.

---

## 7. Data fetching & performance

**One pattern only:** Server Components prefetch → React Query hydrates → client components read through a
domain hook. No `useEffect` fetching, no REST routes for app data, no second fetching style.

```ts
// lib/query-client.ts
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 } },
  });
}
let browserQueryClient: QueryClient | undefined;
export function getQueryClient() {
  if (isServer) return makeQueryClient();           // new per request
  return (browserQueryClient ??= makeQueryClient()); // one per browser session
}

// lib/query-keys.ts — hierarchical, so a prefix invalidates everything under it
export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: () => [...queryKeys.projects.all, "list"] as const,
    detail: (id: string) => [...queryKeys.projects.all, "detail", id] as const,
    logs: (id: string) => [...queryKeys.projects.detail(id), "logs"] as const,
  },
};
```

```tsx
// app/(app)/projects/[id]/page.tsx — server page
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageUser(`/projects/${id}`); // OUTSIDE prefetch: keeps the route dynamic + redirects when signed out
  const qc = getQueryClient();
  await Promise.all([                         // parallel, never sequential awaits
    qc.prefetchQuery({ queryKey: queryKeys.projects.detail(id), queryFn: () => getProject(id) }),
    qc.prefetchQuery({ queryKey: queryKeys.projects.logs(id), queryFn: () => getLogs(id) }),
  ]);
  return <HydrationBoundary state={dehydrate(qc)}><ProjectView id={id} /></HydrationBoundary>;
}
```
(`prefetchQuery` swallows errors, so auth / 404 checks must happen before it. If a 404 is possible, fetch
the main record first, `notFound()` if missing, then `setQueryData` it and prefetch the children.)

**Optimistic mutation template** (in `hooks/useProject.ts`, one hook file per domain):
```ts
useMutation({
  mutationFn: (input) => unwrap(createLog(input)),        // actions return { success, error }; unwrap throws
  onMutate: async (input) => {
    await qc.cancelQueries({ queryKey: key });
    const previous = qc.getQueryData(key);
    qc.setQueryData(key, (old) => old && [tempRow(input), ...old]); // temp id: `temp-${Date.now()}`
    return { previous };
  },
  onError: (_e, _v, ctx) => qc.setQueryData(key, ctx?.previous),
  onSuccess: (saved, _v, ctx) => qc.setQueryData(key, (old) => old?.map((r) => (r.id.startsWith("temp-") ? saved : r))),
  onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) }), // targeted, not everything
});
```
Disable follow-up actions on rows whose id still starts with `temp-`.

**Server / database rules**
- **No N+1.** Aggregate with one `LEFT JOIN … GROUP BY`, `inArray(...)` + `GROUP BY`, or a joined subquery.
  Never a query per item (also not inside `Promise.all`), never queries in a `for` loop.
- **Ranged queries, bucket in JS:** one query for "last 56 days grouped by day", not 7 weekly queries.
- **Derived totals:** compute with `sum()` instead of caching them in a column; if you must cache, recompute
  in the same transaction. Watch numeric precision (`numeric(5,2)` caps at 999.99).
- **Indexes on every FK and filter column**, composite where you filter + sort (`(user_id, logged_date)`).
- **Uniqueness per user** (`unique(user_id, slug)`), not global.
- **`db.transaction`** for multi-table writes.
- **One session lookup per request:** wrap the session getter in React `cache()`.
- **DB client singleton** on `globalThis` in dev (hot reload creates pools otherwise).
- `ON DELETE CASCADE` on child FKs; delete the parent only.
- Serialize dates to ISO strings at the action boundary (stable for RQ hydration).

**Front-end performance**
- `<Link>` everywhere for in-app navigation (prefetch), `loading.tsx` per route segment.
- One chart library (Recharts), one icon library (lucide-react), `motion` (not framer-motion), no gsap /
  echarts / react-icons. Remove unused deps and dead code aggressively.
- `next/font` for fonts; no layout shift from late fonts.
- Keep client components leaf-level; pages stay Server Components.

---

## 8. Security (non-negotiable)

- **Every export of a `"use server"` file is a public POST endpoint.** Internal helpers live in `src/lib/`
  with `import "server-only"`, never in action files.
- **Every Server Action:** `const userId = await requireUser()` → validate input with **zod** (`parseInput`
  throws / `tryParseInput` returns null for actions that return `{ success, error }`) → **check ownership of
  every client-supplied id** (`lib/ownership.ts`: `assertXOwner(id, userId)`, same "not found" for missing
  and not-yours) → scope every query by `userId` (child tables via the parent).
- **Pages:** `requirePageUser(path)` → redirect to `/sign-in?next=path` (not the error page).
- `proxy.ts` (Next 16 name for middleware) only does an *optimistic* redirect on a missing session cookie;
  it is not authorization.
- **Redirect targets** (`?next=`) are sanitized: only known app paths, no `//`, no `\`, no schemes.
- **Never `fetch()` a user-supplied URL directly**: https only, port 443, block private/loopback/link-local
  IPs at connect time (DNS rebinding), re-validate redirects (max 3), timeout (8s), size cap (1MB).
- Links rendered as `href` must be validated as http(s).
- Mutation actions return friendly `{ success: false, error }` messages (thrown errors are masked in prod).
- Keep `next`, the auth library and the ORM patched (`pnpm audit`: 0 critical / 0 high).

## 9. Dates and time zones

- Store "which day did this happen" as the **user's local calendar date** at UTC midnight. The client sends
  `localDateKey()` (`YYYY-MM-DD` from the browser); the server accepts ±2 days of now.
- The server learns "today" for the user from a `tz` cookie written by a tiny client component
  (`Intl.DateTimeFormat().resolvedOptions().timeZone`), validated with `Intl`.
- Bucket by `to_char(date_col, 'YYYY-MM-DD')`; format with `timeZone: "UTC"`; do date math on UTC getters.

---

## 10. Supabase adaptation (instead of Neon)

**Using Drizzle against Supabase Postgres (recommended, keeps everything above unchanged):**
```ts
// src/db/drizzle.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> };
// DATABASE_URL = Supabase *transaction pooler* (port 6543) for the app (serverless-friendly).
const client = globalForDb.client ?? postgres(process.env.DATABASE_URL!, { prepare: false }); // pooler needs prepare:false
if (process.env.NODE_ENV !== "production") globalForDb.client = client;
export const db = drizzle(client, { schema });
```
- **Migrations:** `drizzle.config.ts` uses the **direct / session connection (port 5432)**
  (e.g. `DIRECT_URL`), not the transaction pooler. Workflow: `drizzle-kit generate` → review the SQL by
  hand → `drizzle-kit migrate`. **Never `drizzle-kit push` against production** (it skips data backfills and
  leaves the migration log out of sync). For destructive changes: add columns → hand-written backfill →
  drop old columns in a later migration; deploy code that no longer uses the old columns **before** dropping
  them.
- `drizzle-kit migrate` can exit 1 without printing the error; to see it, run the drizzle-orm migrator
  (`migrate(drizzle(client), { migrationsFolder: "./migrations" })`) in a small node script.
- **RLS:** Drizzle connects as a privileged role and **bypasses RLS**, so the app-level ownership checks in
  §8 remain mandatory. Also **enable RLS on every table** (with no policies, or deny-all) so Supabase's
  auto-generated REST/GraphQL API can't read your tables with the public anon key. If the client ever uses
  `supabase-js` directly against tables, write real per-user policies (`auth.uid() = user_id`).
- **If using Supabase Auth instead of Better Auth:** `@supabase/ssr` with cookie-based clients; on the
  server always use `supabase.auth.getUser()` (verifies the JWT) and never trust `getSession()` for
  authorization; refresh the session in `proxy.ts`. `requireUser()` wraps `getUser()` in React `cache()`
  and returns the id; everything else in §8 stays the same.
- **Storage** (if used): private buckets + signed URLs; validate file type/size server-side.
- Index and `GROUP BY` advice is identical; check slow queries in Supabase's Query Performance report.

---

## 11. Quality gates and workflow

- Every change ends with `pnpm build` + `pnpm lint` passing with **0 errors** (ESLint flat config from
  `eslint-config-next`; `next lint` no longer exists in Next 16). Keep React Compiler rules such as
  `react-hooks/set-state-in-effect` at error; use `useSyncExternalStore` for hydration flags and
  localStorage instead of setState in effects.
- **Visual QA without logging in:** add a temporary public route (e.g. `src/app/design-preview/`) that seeds
  a `QueryClient` with sample data (`setQueryData` + `HydrationBoundary`) and renders the page component;
  `pnpm build && PORT=3458 pnpm start`; screenshot with headless Chromium in light, dark
  (`--blink-settings=preferredColorScheme=0`) and 390px; add `--force-prefers-reduced-motion` to see final
  values of count-ups and chart animations. Delete the route before committing; stop the server by the
  `next-server` PID (`ss -ltnp | grep 3458`), not with `pkill -f`.
- **Work in phases** (cleanup → security + upgrades → data layer → design system → page redesigns →
  polish → marketing/auth), one phase per commit on a working branch, with a `refactor-*.md` file whose top
  section is a session handoff (where work stopped, what's next, what's unapplied).
- Keep `CLAUDE.md` current: stack + versions, folder map, route map (rendering, auth check, data), data
  model, conventions, env var **names** only.
