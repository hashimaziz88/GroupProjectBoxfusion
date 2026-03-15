"use client";

import { Spin, Typography } from "antd";
import { useStyles } from "@/components/spinner/style/style";
import { IAppSpinnerProps } from "@/interfaces/spinnerProps";

const { Text } = Typography;

const AppSpinner = ({ label = "Loading..." }: IAppSpinnerProps) => {
  const { styles } = useStyles();

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Spin size="large" />
        <Text className={styles.label}>{label}</Text>
      </div>
    </div>
  );
};

export default AppSpinner;
