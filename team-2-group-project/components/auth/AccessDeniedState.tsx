"use client";

import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

interface AccessDeniedStateProps {
  title?: string;
  subtitle?: string;
  redirectHref?: string;
  redirectLabel?: string;
}

const AccessDeniedState = ({
  title = "Access denied",
  subtitle = "You do not have access to this page in the current role or tenant context.",
  redirectHref = "/home",
  redirectLabel = "Go to an allowed page",
}: AccessDeniedStateProps) => {
  const router = useRouter();

  return (
    <Result
      status="403"
      title={title}
      subTitle={subtitle}
      extra={
        <Button type="primary" onClick={() => router.replace(redirectHref)}>
          {redirectLabel}
        </Button>
      }
    />
  );
};

export default AccessDeniedState;
