import { Clock3, Hourglass, ListChecks, Lock, Sparkles, SunMoon, Target } from "lucide-react";
import { Brand } from "@/components/brand";
import { PrimaryCta } from "./CtaButtons";
import { ConsistencyPreview, DashboardPreview, QuickLogPreview, SandboxPreview } from "./Previews";

const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-brand">{children}</p>;
}

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand glow behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[480px] max-w-4xl rounded-full bg-brand/10 blur-3xl"
      />
      <div className={`${container} relative pt-16 pb-12 text-center sm:pt-24`}>
        <div className="mx-auto max-w-3xl animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-panel">
            <Hourglass className="size-3.5 text-brand" aria-hidden />
            A personal tracker for deliberate practice
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
            Put in the hours.
            <br />
            <span className="text-muted-foreground">Watch them add up.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            Log the time you spend getting better at things, run deep-work projects toward an hour target,
            and get a straight answer on your pace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCta signedIn={signedIn} />
            <a
              href="#how"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              See how it works ↓
            </a>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-5xl text-left animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Target,
    title: "Pick a skill and a target",
    body: "Rust, 100 hours. Spanish, 200. Break it into tasks in a simple To do → Doing → Done list if that helps.",
  },
  {
    icon: Clock3,
    title: "Log time after the fact",
    body: "No timer to babysit. Tap +15m, +30m or +1h when you finish, or type “1h 30m”. Undo is one click.",
  },
  {
    icon: Sparkles,
    title: "Read an honest takeaway",
    body: "Your week against last week, your streak, and when you'll hit the target at your real pace.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-border/60 py-20 sm:py-24">
      <div className={container}>
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Three steps, no ceremony.
          </h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-border bg-card p-1.5 shadow-panel">
              <div className="h-full rounded-xl border border-border/60 bg-surface-2 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <s.icon className="size-4" aria-hidden />
                  </span>
                  <span className="tabular text-sm text-subtle-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-medium text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mx-auto mt-6 max-w-xl">
          <QuickLogPreview />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  eyebrow,
  title,
  body,
  points,
  preview,
  flip = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  preview: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={flip ? "lg:order-2" : undefined}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h3>
        <p className="mt-3 text-muted-foreground">{body}</p>
        <ul className="mt-5 space-y-2">
          {points.map((p) => (
            <li key={p} className="flex gap-2.5 text-sm text-foreground">
              <ListChecks className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={flip ? "lg:order-1" : undefined}>{preview}</div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border/60 py-20 sm:py-24">
      <div className={`${container} space-y-24`}>
        <FeatureRow
          eyebrow="Sandboxes"
          title="Deep-work projects with milestones that mean something."
          body="A sandbox is an open-ended project with an hour target: build a compiler, learn Blender, ship the portfolio. Every 20 hours is a marker on the dial, and you can name the ones that matter."
          points={[
            "One-tap sessions: +25m, +50m, +1h, +2h, or a custom amount",
            "Next milestone and an ETA at your recent pace",
            "Keep the articles, videos and repos you're using next to the work",
          ]}
          preview={<SandboxPreview />}
        />
        <FeatureRow
          flip
          eyebrow="Insights"
          title="Consistency you can see, trends that say something."
          body="The dashboard turns your log into a few plain sentences and charts: how this week compares to the last, how many of the last 28 days you showed up, and when you'll reach your target."
          points={[
            "Streaks that survive until the day is actually over",
            "Week-over-week change, not vanity totals",
            "Uses your local date, wherever you are",
          ]}
          preview={<ConsistencyPreview />}
        />
      </div>
    </section>
  );
}

const PRINCIPLES = [
  { icon: Clock3, title: "No timer", body: "Log when you're done. Nothing to forget to stop." },
  { icon: Hourglass, title: "3 hours max per entry", body: "Longer sessions get split, so one typo can't skew a week." },
  { icon: Lock, title: "Private by default", body: "Your skills and sessions are visible to you alone." },
  { icon: SunMoon, title: "Light and dark", body: "Follows your system theme, or pick one." },
];

export function Principles() {
  return (
    <section className="border-t border-border/60 py-16">
      <ul className={`${container} grid gap-6 sm:grid-cols-2 lg:grid-cols-4`}>
        {PRINCIPLES.map((p) => (
          <li key={p.title}>
            <p.icon className="size-5 text-muted-foreground" aria-hidden />
            <h3 className="mt-3 text-sm font-medium text-foreground">{p.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const FAQ = [
  {
    q: "Why isn't there a timer?",
    a: "Timers add a job: remembering to start and stop them. Logging after the fact takes one tap, and the 3-hour cap per entry keeps the numbers honest.",
  },
  {
    q: "What's the difference between a skill and a sandbox?",
    a: "A skill is something you practise over time, broken into tasks (To do → Doing → Done) with time logged on each. A sandbox is a single deep-work project with an hour target and a milestone every 20 hours.",
  },
  {
    q: "How is the finish date estimated?",
    a: "From your average hours per week over the last four weeks. If you haven't logged anything in that window, it says so instead of guessing.",
  },
  {
    q: "Can I fix a mistake?",
    a: "Every log shows an Undo right away, and sessions can be deleted later from their list.",
  },
  {
    q: "How do I sign in, and what do you store?",
    a: "With your Google account. Your name, email and profile photo are used for your profile; everything you track is tied to your account and only shown to you.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border/60 py-20 sm:py-24">
      <div className={`${container} grid gap-10 lg:grid-cols-[1fr_1.6fr]`}>
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Questions, answered.</h2>
        </div>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-panel">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                {f.q}
                <span
                  aria-hidden
                  className="text-lg leading-none text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-t border-border/60 py-20 sm:py-24">
      <div className={`${container} text-center`}>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {signedIn ? "Pick up where you left off." : "Start with one skill."}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {signedIn
            ? "Your skills and sandboxes are waiting."
            : "Add it, set a target, and log your first session today."}
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryCta signedIn={signedIn} />
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className={`${container} flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row`}>
        <Brand />
        <p>© {new Date().getFullYear()} BuildxSkill</p>
      </div>
    </footer>
  );
}
