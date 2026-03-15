"use client";

import Link from "next/link";
import { Typography } from "antd";
import { useStyles } from "@/app/(auth)/style/style";

const { Text } = Typography;

interface IAuthFooterLinkProps {
  question: string;
  label: string;
  href: string;
}

const AuthFooterLink = ({
  question,
  label,
  href,
}: IAuthFooterLinkProps) => {
  const { styles } = useStyles();

  return (
    <div className={styles.footerLinkRow}>
      <Text className={styles.footerText}>{question}</Text>
      <Link href={href} className={styles.footerLink}>
        {label}
      </Link>
    </div>
  );
};

export default AuthFooterLink;
