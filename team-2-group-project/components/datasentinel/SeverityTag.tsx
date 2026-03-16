"use client";

import { Tag } from "antd";
import { severityColor, severityLabel } from "@/utils/datasentinel/helpers";

interface ISeverityTagProps {
  severity?: number | null;
}

const SeverityTag = ({ severity }: ISeverityTagProps) => {
  const palette = severityColor(severity);

  return (
    <Tag
      style={{
        margin: 0,
        border: "none",
        borderRadius: "999px",
        paddingInline: 10,
        fontWeight: 700,
        color: palette.color,
        background: palette.background,
        textTransform: "uppercase",
      }}
    >
      {severityLabel(severity)}
    </Tag>
  );
};

export default SeverityTag;
