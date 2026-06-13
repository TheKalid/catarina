import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section, SectionHeading } from "@/components/ui/section";
import {
  BellIcon,
  ChipIcon,
  CloudOffIcon,
  CompassIcon,
  EyeIcon,
  SparklesIcon,
  UsersIcon,
  CheckIcon,
} from "@/components/ui/icons";
import { DeviceMock, NotificationMock } from "@/components/marketing/product-mocks";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProductGap />
      <HowItWorks />
      <ServiceGrid />
      <ExplainNotAlert />
      <TwoSides />
      <Scales />
      <AiRoadmap />
      <FinalCta />
    </>
  );
}

/* ------------------------------------------------------------------ Hero -- */

function Hero() {
  return (
    <section className="relative overflow-hidden" id="top">
      {/* Soft, almost-imperceptible warm gradient wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, #fbe1d180 0%, #ffffff00 70%), linear-gradient(#fafafa, #ffffff)",
        }}
      />
      <Container className="flex flex-col items-center gap-10 pt-20 pb-16 text-center md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-pill border border-ink/10 bg-canvas px-3.5 py-1.5 text-caption text-muted-stone">
          <span className="size-1.5 rounded-pill bg-terracotta" />
          Hydroponics, made approachable
        </span>

        <h1 className="max-w-4xl font-display text-display-lg text-ink text-balance md:text-display-xl">
          Grow food, not expertise.
        </h1>

        <p className="max-w-xl text-body text-muted-stone text-pretty md:text-[1.0625rem]">
          Catarina is smart growing hardware that runs on its own, plus a cloud
          service that turns sensor data into insight — monitoring, alerts, and
          AI-assisted care that tells you what to do, and why.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/register" variant="primary" size="lg">
            Get started
          </ButtonLink>
          <ButtonLink href="#how-it-works" variant="ghost" size="lg">
            See how it works
          </ButtonLink>
        </div>

        {/* Floating UI — overlapping product mocks. */}
        <div className="relative mt-6 flex w-full items-center justify-center">
          <DeviceMock className="rotate-[-3deg] md:-mr-10" />
          <NotificationMock className="hidden rotate-[3deg] md:block" />
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------- ProductGap -- */

const GAP_CARDS = [
  {
    title: "Too simple",
    body: "Basic kits leave you guessing — constant manual checks and a lot of trial and error.",
    variant: "fog" as const,
  },
  {
    title: "Too complex",
    body: "Pro rigs are powerful but demand real expertise just to keep them running.",
    variant: "fog" as const,
  },
  {
    title: "Catarina",
    body: "A living system that communicates its needs — approachable for beginners, deep enough for pros.",
    variant: "warmMist" as const,
  },
];

function ProductGap() {
  return (
    <Section id="product">
      <SectionHeading
        eyebrow="Why Catarina"
        title="Caring for plants, not operating equipment."
        description="Most hydroponic systems force a choice between simple-but-manual and powerful-but-complex. Catarina closes that gap."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {GAP_CARDS.map((card) => (
          <Card key={card.title} variant={card.variant} className="flex flex-col gap-3 p-6">
            <h3 className="text-heading font-medium text-ink">{card.title}</h3>
            <p className="text-body text-muted-stone text-pretty">{card.body}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- HowItWorks -- */

const STEPS = [
  {
    n: "01",
    title: "The hardware senses",
    body: "Temperature, humidity, light, water and nutrient levels — captured continuously, on device.",
  },
  {
    n: "02",
    title: "Data syncs",
    body: "Stored locally and synced over Bluetooth or the cloud — late, batched, or out of order is fine.",
  },
  {
    n: "03",
    title: "Software explains",
    body: "Readings become plain-language insight, trends, and recommendations you can act on.",
  },
];

function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-fog">
      <SectionHeading
        eyebrow="How it works"
        title="The hardware gathers data. The software makes it make sense."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="flex flex-col gap-3">
            <span className="font-display text-heading-lg text-terracotta">{step.n}</span>
            <h3 className="text-heading font-medium text-ink">{step.title}</h3>
            <p className="text-body text-muted-stone text-pretty">{step.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ ServiceGrid -- */

const SERVICE_FEATURES = [
  {
    icon: EyeIcon,
    title: "Visibility",
    body: "Real-time and historical data from anywhere — multi-device, with remote access.",
  },
  {
    icon: BellIcon,
    title: "Awareness",
    body: "Alerts when conditions need attention: low water, anomalies, equipment, maintenance.",
  },
  {
    icon: SparklesIcon,
    title: "Understanding",
    body: "Plant-health analysis and trend identification that turn data into meaning.",
  },
  {
    icon: CompassIcon,
    title: "Guidance",
    body: "Recommendations for watering, nutrients, and environment that improve outcomes.",
  },
  {
    icon: UsersIcon,
    title: "Collaboration",
    body: "Share devices, give household access, and invite read-only followers.",
  },
];

function ServiceGrid() {
  return (
    <Section id="service">
      <SectionHeading
        eyebrow="The service"
        title="A cloud layer that helps you grow healthier plants with less effort."
        description="An optional subscription on top of the hardware — additive, never a paywall for basic functionality."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="relative flex flex-col gap-4 overflow-hidden p-6">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-terracotta" />
            <span className="flex size-10 items-center justify-center rounded-image bg-fog text-ink">
              <Icon className="size-5" />
            </span>
            <h3 className="text-heading font-medium text-ink">{title}</h3>
            <p className="text-body text-muted-stone text-pretty">{body}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------- ExplainNotAlert -- */

const EXPLAIN_POINTS = [
  { label: "What happened", body: "The reservoir is down to about a day of water." },
  { label: "Why it matters", body: "Fruiting basil drinks faster; low water stresses roots." },
  { label: "What to do", body: "Top up to 2L now to keep growth on track." },
];

function ExplainNotAlert() {
  return (
    <Section className="bg-fog">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="flex justify-center md:justify-start">
          <NotificationMock />
        </div>
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="A principle"
            title="Explain, don't just alert."
            description="Every notification tells you what happened, why it matters, and what to do — so you can act with confidence, no expertise required."
          />
          <ul className="flex flex-col gap-3">
            {EXPLAIN_POINTS.map((point) => (
              <li key={point.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill bg-terracotta/15 text-terracotta">
                  <CheckIcon className="size-3.5" />
                </span>
                <span className="text-body text-ink">
                  <span className="font-medium">{point.label}.</span>{" "}
                  <span className="text-muted-stone">{point.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- TwoSides -- */

function TwoSides() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Two sides, one platform"
        title="The hardware stays valuable on its own."
        description="Buy the device once and it grows plants and records data with no subscription. The cloud service is there to enhance the experience — not to unlock it."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col gap-5 p-7">
          <span className="flex size-10 items-center justify-center rounded-image bg-fog text-ink">
            <ChipIcon className="size-5" />
          </span>
          <h3 className="text-heading-lg font-medium text-ink">Hardware</h3>
          <p className="text-body text-muted-stone text-pretty">
            Smart growing devices — from a single pot to industrial racks. A
            one-time purchase that works fully offline.
          </p>
          <ul className="flex flex-col gap-2">
            {[
              "Local monitoring & on-device storage",
              "Bluetooth sync, works without the cloud",
              "Use it indefinitely",
            ].map((item) => (
              <FeatureLi key={item}>{item}</FeatureLi>
            ))}
          </ul>
        </Card>

        <Card variant="warmMist" className="flex flex-col gap-5 p-7">
          <span className="flex size-10 items-center justify-center rounded-image bg-canvas text-terracotta">
            <SparklesIcon className="size-5" />
          </span>
          <h3 className="text-heading-lg font-medium text-ink">Service</h3>
          <p className="text-body text-muted-stone text-pretty">
            An optional subscription that turns device data into monitoring,
            alerts, AI guidance, and remote access across every device you own.
          </p>
          <ul className="flex flex-col gap-2">
            {[
              "Cloud sync & historical analytics",
              "Smart alerts and plant-health insight",
              "Sharing, followers & remote access",
            ].map((item) => (
              <FeatureLi key={item} accent>
                {item}
              </FeatureLi>
            ))}
          </ul>
        </Card>
      </div>
    </Section>
  );
}

function FeatureLi({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-body text-muted-stone">
      <CheckIcon className={accent ? "mt-0.5 size-4 text-terracotta" : "mt-0.5 size-4 text-ink"} />
      {children}
    </li>
  );
}

/* ----------------------------------------------------------------- Scales -- */

const SEGMENTS = [
  { title: "Home", example: "Kitchen herbs", detail: "One device, a few plants." },
  { title: "Household", example: "Family food", detail: "Multiple devices or larger systems." },
  { title: "Commercial", example: "Restaurants & markets", detail: "Many devices, operational monitoring." },
  { title: "Industrial", example: "Large-scale", detail: "Hundreds of plants, high-volume telemetry." },
];

function Scales() {
  return (
    <Section id="scales" className="bg-fog">
      <SectionHeading
        eyebrow="Who it's for"
        title="From one plant to one greenhouse — without changing platforms."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SEGMENTS.map((seg) => (
          <Card key={seg.title} className="flex flex-col gap-2 p-6">
            <h3 className="text-heading font-medium text-ink">{seg.title}</h3>
            <span className="text-caption font-medium text-terracotta">{seg.example}</span>
            <p className="text-body text-muted-stone text-pretty">{seg.detail}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3 text-body text-muted-stone">
        <CloudOffIcon className="size-5 shrink-0 text-ink" />
        Hardware-first: every device keeps working even when the cloud is away.
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- AiRoadmap -- */

const PHASES = ["Observe", "Detect", "Recommend", "Predict", "Assist"];

function AiRoadmap() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Where it's going"
        title="From monitoring platform to growing assistant."
        description="Catarina is built to evolve — collecting data today, and increasingly helping you make decisions over time."
      />
      <ol className="mt-12 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2">
        {PHASES.map((phase, i) => (
          <li key={phase} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col gap-1 rounded-image border border-ink/8 bg-canvas px-4 py-3">
              <span className="text-caption text-light-steel">Phase {i + 1}</span>
              <span className="text-body font-medium text-ink">{phase}</span>
            </div>
            {i < PHASES.length - 1 ? (
              <span className="hidden text-hint-of-grey md:inline">→</span>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* --------------------------------------------------------------- FinalCta -- */

function FinalCta() {
  return (
    <Section>
      <Card className="flex flex-col items-center gap-6 px-6 py-14 text-center">
        <h2 className="max-w-2xl font-display text-display text-ink text-balance">
          Start growing with less guesswork.
        </h2>
        <p className="max-w-md text-body text-muted-stone text-pretty">
          Create an account, register your device, and let Catarina help you grow
          more food with less expertise.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/register" variant="primary" size="lg">
            Get started
          </ButtonLink>
          <ButtonLink href="/login" variant="ghost" size="lg">
            Log in
          </ButtonLink>
        </div>
      </Card>
    </Section>
  );
}
