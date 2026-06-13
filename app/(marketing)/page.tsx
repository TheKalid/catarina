"use client";

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
import { useI18n } from "@/lib/i18n";

const SERVICE_ICONS = [EyeIcon, BellIcon, SparklesIcon, CompassIcon, UsersIcon];
const GAP_VARIANTS = ["fog", "fog", "warmMist"] as const;

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
  const { t } = useI18n();
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
          {t.marketing.heroBadge}
        </span>

        <h1 className="max-w-4xl font-display text-display-lg text-ink text-balance md:text-display-xl">
          {t.marketing.heroTitle}
        </h1>

        <p className="max-w-xl text-body text-muted-stone text-pretty md:text-[1.0625rem]">
          {t.marketing.heroBody}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/register" variant="primary" size="lg">
            {t.marketing.heroGetStarted}
          </ButtonLink>
          <ButtonLink href="#how-it-works" variant="ghost" size="lg">
            {t.marketing.heroSeeHow}
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

function ProductGap() {
  const { t } = useI18n();
  return (
    <Section id="product">
      <SectionHeading
        eyebrow={t.marketing.productEyebrow}
        title={t.marketing.productTitle}
        description={t.marketing.productDescription}
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {t.marketing.gapCards.map((card, i) => (
          <Card key={card.title} variant={GAP_VARIANTS[i]} className="flex flex-col gap-3 p-6">
            <h3 className="text-heading font-medium text-ink">{card.title}</h3>
            <p className="text-body text-muted-stone text-pretty">{card.body}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- HowItWorks -- */

function HowItWorks() {
  const { t } = useI18n();
  return (
    <Section id="how-it-works" className="bg-fog">
      <SectionHeading eyebrow={t.marketing.howEyebrow} title={t.marketing.howTitle} />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {t.marketing.steps.map((step, i) => (
          <div key={step.title} className="flex flex-col gap-3">
            <span className="font-display text-heading-lg text-terracotta">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-heading font-medium text-ink">{step.title}</h3>
            <p className="text-body text-muted-stone text-pretty">{step.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ ServiceGrid -- */

function ServiceGrid() {
  const { t } = useI18n();
  return (
    <Section id="service">
      <SectionHeading
        eyebrow={t.marketing.serviceEyebrow}
        title={t.marketing.serviceTitle}
        description={t.marketing.serviceDescription}
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.marketing.serviceFeatures.map(({ title, body }, i) => {
          const Icon = SERVICE_ICONS[i];
          return (
            <Card key={title} className="relative flex flex-col gap-4 overflow-hidden p-6">
              <span className="absolute inset-x-0 top-0 h-0.5 bg-terracotta" />
              <span className="flex size-10 items-center justify-center rounded-image bg-fog text-ink">
                <Icon className="size-5" />
              </span>
              <h3 className="text-heading font-medium text-ink">{title}</h3>
              <p className="text-body text-muted-stone text-pretty">{body}</p>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------- ExplainNotAlert -- */

function ExplainNotAlert() {
  const { t } = useI18n();
  return (
    <Section className="bg-fog">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="flex justify-center md:justify-start">
          <NotificationMock />
        </div>
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow={t.marketing.explainEyebrow}
            title={t.marketing.explainTitle}
            description={t.marketing.explainDescription}
          />
          <ul className="flex flex-col gap-3">
            {t.marketing.explainPoints.map((point) => (
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
  const { t } = useI18n();
  return (
    <Section>
      <SectionHeading
        eyebrow={t.marketing.twoSidesEyebrow}
        title={t.marketing.twoSidesTitle}
        description={t.marketing.twoSidesDescription}
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col gap-5 p-7">
          <span className="flex size-10 items-center justify-center rounded-image bg-fog text-ink">
            <ChipIcon className="size-5" />
          </span>
          <h3 className="text-heading-lg font-medium text-ink">{t.marketing.hardwareTitle}</h3>
          <p className="text-body text-muted-stone text-pretty">{t.marketing.hardwareBody}</p>
          <ul className="flex flex-col gap-2">
            {t.marketing.hardwareFeatures.map((item) => (
              <FeatureLi key={item}>{item}</FeatureLi>
            ))}
          </ul>
        </Card>

        <Card variant="warmMist" className="flex flex-col gap-5 p-7">
          <span className="flex size-10 items-center justify-center rounded-image bg-canvas text-terracotta">
            <SparklesIcon className="size-5" />
          </span>
          <h3 className="text-heading-lg font-medium text-ink">{t.marketing.serviceCardTitle}</h3>
          <p className="text-body text-muted-stone text-pretty">{t.marketing.serviceCardBody}</p>
          <ul className="flex flex-col gap-2">
            {t.marketing.serviceCardFeatures.map((item) => (
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

function Scales() {
  const { t } = useI18n();
  return (
    <Section id="scales" className="bg-fog">
      <SectionHeading eyebrow={t.marketing.scalesEyebrow} title={t.marketing.scalesTitle} />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.marketing.segments.map((seg) => (
          <Card key={seg.title} className="flex flex-col gap-2 p-6">
            <h3 className="text-heading font-medium text-ink">{seg.title}</h3>
            <span className="text-caption font-medium text-terracotta">{seg.example}</span>
            <p className="text-body text-muted-stone text-pretty">{seg.detail}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3 text-body text-muted-stone">
        <CloudOffIcon className="size-5 shrink-0 text-ink" />
        {t.marketing.scalesNote}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- AiRoadmap -- */

function AiRoadmap() {
  const { t } = useI18n();
  const phases = t.marketing.aiPhases;
  return (
    <Section>
      <SectionHeading
        eyebrow={t.marketing.aiEyebrow}
        title={t.marketing.aiTitle}
        description={t.marketing.aiDescription}
      />
      <ol className="mt-12 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2">
        {phases.map((phase, i) => (
          <li key={phase} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col gap-1 rounded-image border border-ink/8 bg-canvas px-4 py-3">
              <span className="text-caption text-light-steel">{t.marketing.aiPhaseLabel(i + 1)}</span>
              <span className="text-body font-medium text-ink">{phase}</span>
            </div>
            {i < phases.length - 1 ? (
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
  const { t } = useI18n();
  return (
    <Section>
      <Card className="flex flex-col items-center gap-6 px-6 py-14 text-center">
        <h2 className="max-w-2xl font-display text-display text-ink text-balance">
          {t.marketing.ctaTitle}
        </h2>
        <p className="max-w-md text-body text-muted-stone text-pretty">
          {t.marketing.ctaBody}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/register" variant="primary" size="lg">
            {t.marketing.ctaGetStarted}
          </ButtonLink>
          <ButtonLink href="/login" variant="ghost" size="lg">
            {t.marketing.ctaLogIn}
          </ButtonLink>
        </div>
      </Card>
    </Section>
  );
}
