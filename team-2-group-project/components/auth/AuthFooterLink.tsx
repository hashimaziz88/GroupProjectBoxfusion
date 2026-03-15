"use client";

import Link from "next/link";
import { Typography } from "antd";
import { useStyles } from "@/app/(auth)/style/style";
import { IAuthFooterLinkProps } from "@/interfaces/auth/authProps";

const { Text } = Typography;

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
