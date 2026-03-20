"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import { Alert } from "antd";

type AlertType = "success" | "info" | "warning" | "error";

const DEFAULT_TIMEOUTS: Record<AlertType, number> = {
  success: 6000,
  info: 7000,
  warning: 8000,
  error: 9000,
};

interface ITimedAlertMessageProps {
  type: AlertType;
  title: string;
  className?: string;
  style?: CSSProperties;
  onDismiss?: () => void;
  timeoutMs?: number;
}

const TimedAlertMessage = ({
  type,
  title,
  className,
  style,
  onDismiss,
  timeoutMs,
}: ITimedAlertMessageProps) => {
  useEffect(() => {
    if (!onDismiss) {
      return;
    }

    const timer = window.setTimeout(
      onDismiss,
      timeoutMs ?? DEFAULT_TIMEOUTS[type],
    );

    return () => window.clearTimeout(timer);
  }, [onDismiss, timeoutMs, title, type]);

  return (
    <Alert
      type={type}
      showIcon
      title={title}
      closable={Boolean(onDismiss)}
      onClose={onDismiss}
      className={className}
      style={style}
    />
  );
};

export default TimedAlertMessage;
