"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/providers/authProvider";
import { selectBestAuthenticatedRoute } from "@/utils/auth/roles";
import { useStyles } from "@/app/landing/style/style";

const { Paragraph, Text, Title } = Typography;

const FEATURES = [
  {
    icon: "DB",
    title: "Real-Time Activity Monitoring",
    text: "Capture every query, login, schema change, and privileged operation as it happens across all monitored databases.",
  },
  {
    icon: "AL",
    title: "Threat Detection",
    text: "Automatically flag suspicious events, brute-force attempts, and anomalous data access patterns for immediate review.",
  },
  {
    icon: "AU",
    title: "Audit & Compliance",
    text: "Generate detailed audit trails for SOC 2, HIPAA, and GDPR compliance with immutable event records.",
  },
  {
    icon: "SV",
    title: "Infrastructure Inventory",
    text: "Maintain a live catalogue of monitored servers, databases, and tables with environment tagging and health tracking.",
  },
  {
    icon: "IN",
    title: "Flexible Intake Pipelines",
    text: "Ingest activity events via direct API, ABP audit log upload, or seeded simulation - all through the same normalized schema.",
  },
  {
    icon: "TN",
    title: "Multi-Tenant Isolation",
    text: "Every tenant operates in a fully isolated context. Host admins manage tenants and users without crossing data boundaries.",
  },
];

const STATS = [
  { value: "100%", label: "Audit trail coverage" },
  { value: "6 event types", label: "Classified activity categories" },
];

export default function LandingPage() {
  const router = useRouter();
  const { styles } = useStyles();
  const { isAuthenticated, user } = useAuthState();

  const handleEnter = () => {
    if (isAuthenticated) {
      router.push(selectBestAuthenticatedRoute(user));
    } else {
      router.push("/login");
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/landing" className={styles.navBrand}>
          <Image
            src="/logoipsum-custom-logo.svg"
            alt="DataSentinel"
            width={172}
            height={29}
          />
        </Link>
        <div className={styles.navActions}>
          {isAuthenticated ? (
            <Button className={styles.navPrimaryButton} onClick={handleEnter}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button
                className={styles.navSecondaryButton}
                onClick={() => router.push("/login")}
              >
                Sign in
              </Button>
              <Button className={styles.navPrimaryButton} onClick={handleEnter}>
                Get started
              </Button>
            </>
          )}
        </div>
      </nav>

      <section className={styles.hero}>
        <span className={styles.heroBadge}>Database Activity Monitoring</span>
        <Title className={styles.heroTitle}>
          See everything happening{" "}
          <span className={styles.heroAccent}>inside your databases</span>
        </Title>
        <Paragraph className={styles.heroSub}>
          DataSentinel captures, classifies, and surfaces every database event in
          real time - giving security and compliance teams full visibility into
          who accessed what, when, and why.
        </Paragraph>
        <div className={styles.heroActions}>
          <Button className={styles.primaryButton} onClick={handleEnter}>
            {isAuthenticated ? "Go to dashboard" : "Get started free"}
          </Button>
          {!isAuthenticated ? (
            <Button
              className={styles.secondaryButton}
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>
          ) : null}
        </div>
      </section>

      <div className={styles.statsRow}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span className={styles.statValue}>{stat.value}</span>
            <Paragraph className={styles.statLabel}>{stat.label}</Paragraph>
          </div>
        ))}
      </div>

      <section className={styles.featuresSection}>
        <span className={styles.sectionLabel}>Platform capabilities</span>
        <Title level={2} className={styles.sectionTitle}>
          Everything you need to monitor, detect, and audit
        </Title>
        <div className={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <Title level={5} className={styles.featureTitle}>
                {feature.title}
              </Title>
              <Paragraph className={styles.featureText}>
                {feature.text}
              </Paragraph>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.ctaSection}>
        <Title level={2} className={styles.ctaTitle}>
          Ready to take control of your database security?
        </Title>
        <Paragraph className={styles.ctaText}>
          Sign in to your workspace or ask your administrator to provision a
          tenant account. Full audit trail coverage starts immediately.
        </Paragraph>
        <div className={styles.heroActions}>
          <Button className={styles.primaryButton} onClick={handleEnter}>
            {isAuthenticated ? "Go to dashboard" : "Sign in to your workspace"}
          </Button>
        </div>
      </div>

      <footer className={styles.footer}>
        <Text className={styles.footerText}>
          Copyright 2026 DataSentinel. Database activity monitoring platform.
        </Text>
        <Text className={styles.footerBrand}>DataSentinel</Text>
      </footer>
    </div>
  );
}
