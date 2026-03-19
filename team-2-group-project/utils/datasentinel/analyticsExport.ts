"use client";

const downloadFile = (fileName: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value).replace(/"/g, '""');
  return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
};

export const downloadJsonFile = (fileName: string, payload: unknown) => {
  downloadFile(fileName, JSON.stringify(payload, null, 2), "application/json");
};

export const downloadCsvFile = (
  fileName: string,
  headers: string[],
  rows: Array<Array<unknown>>,
) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  downloadFile(fileName, csv, "text/csv;charset=utf-8");
};
