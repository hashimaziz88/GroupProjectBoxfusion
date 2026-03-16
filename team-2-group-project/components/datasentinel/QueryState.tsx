"use client";

import type { ReactNode } from "react";
import { Alert, Card, Empty, Spin } from "antd";
import { useStyles } from "@/app/style/style";

interface IQueryStateProps {
  isLoading?: boolean;
  errorMessage?: string | null;
  isEmpty?: boolean;
  emptyDescription?: string;
  children: ReactNode;
}

const QueryState = ({
  isLoading,
  errorMessage,
  isEmpty,
  emptyDescription,
  children,
}: IQueryStateProps) => {
  const { styles } = useStyles();

  if (isLoading) {
    return (
      <Card className={styles.pageCard}>
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Alert
        type="error"
        showIcon
        message={errorMessage}
        className={styles.alert}
      />
    );
  }

  if (isEmpty) {
    return (
      <Card className={styles.pageCard}>
        <Empty description={emptyDescription} />
      </Card>
    );
  }

  return <>{children}</>;
};

export default QueryState;
