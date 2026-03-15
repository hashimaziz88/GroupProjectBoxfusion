"use client";

import { Tag, Typography } from "antd";
import { useStyles } from "@/app/(auth)/style/style";
import { IAuthHeaderProps } from "@/interfaces/auth/authProps";

const { Paragraph, Title } = Typography;


const AuthHeader = ({ title, subtitle, tenantLabel }: IAuthHeaderProps) => {
  const { styles } = useStyles();

  return (
    <div className={styles.headerBlock}>
      {tenantLabel ? <Tag className={styles.tenantTag}>{tenantLabel}</Tag> : null}
      <Title level={2} className={styles.title}>
        {title}
      </Title>
      <Paragraph className={styles.subtitle}>{subtitle}</Paragraph>
    </div>
  );
};

export default AuthHeader;
