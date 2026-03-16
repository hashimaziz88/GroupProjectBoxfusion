"use client";

import { Tag } from "antd";
import { statusColor, statusLabel } from "@/utils/datasentinel/helpers";

interface IStatusTagProps {
  status?: number | null;
}

const StatusTag = ({ status }: IStatusTagProps) => (
  <Tag
    color={statusColor(status)}
    style={{
      margin: 0,
      borderRadius: "999px",
      fontWeight: 600,
      paddingInline: 10,
    }}
  >
    {statusLabel(status)}
  </Tag>
);

export default StatusTag;
