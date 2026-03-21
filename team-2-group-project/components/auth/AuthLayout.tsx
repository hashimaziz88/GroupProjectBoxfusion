"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, Typography } from "antd";
import { useStyles } from "@/app/(auth)/style/style";
import { IAuthLayoutProps } from "@/interfaces/auth/authProps";

const { Paragraph, Title } = Typography;



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
          <Link href="/landing" className={styles.heroBrand}>
            <Image
              src="/logoipsum-custom-logo.svg"
              alt="DataSentinel"
              width={164}
              height={28}
              className={styles.heroBrandLogo}
            />
            <span className={styles.heroBrandContext}>Secure access portal</span>
          </Link>
          <span className={styles.eyebrow}>DataSentinel Platform</span>
          <Title level={1} className={styles.heroTitle}>
            {asideTitle}
          </Title>
          <Paragraph className={styles.heroText}>{asideText}</Paragraph>
        </div>
      </section>

      <section className={styles.formSection}>
        <Card className={styles.formCard}>
          <Link href="/landing" className={styles.formBrand}>
            <Image
              src="/logoipsum-custom-logo.svg"
              alt="DataSentinel"
              width={150}
              height={26}
              className={styles.formBrandLogo}
            />
            <span className={styles.formBrandCaption}>
              Tenant-aware security access
            </span>
          </Link>
          {children}
        </Card>
      </section>
    </main>
  );
};

export default AuthLayout;
