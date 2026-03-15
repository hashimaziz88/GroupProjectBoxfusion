"use client";

import type { ReactNode } from "react";
import { Card, Typography } from "antd";
import { useStyles } from "@/app/(auth)/style/style";

const { Paragraph, Title } = Typography;

interface IAuthLayoutProps {
  children: ReactNode;
  asideTitle: string;
  asideText: string;
}

const AuthLayout = ({
  children,
  asideTitle,
  asideText,
}: IAuthLayoutProps) => {
  const { styles } = useStyles();

  return (
    <main className={styles.page}>
      <section className={styles.heroPanel}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>ABP Multi-Tenant Frontend</span>
          <Title level={1} className={styles.heroTitle}>
            {asideTitle}
          </Title>
          <Paragraph className={styles.heroText}>{asideText}</Paragraph>
        </div>
      </section>

      <section className={styles.formSection}>
        <Card className={styles.formCard}>{children}</Card>
      </section>
    </main>
  );
};

export default AuthLayout;
