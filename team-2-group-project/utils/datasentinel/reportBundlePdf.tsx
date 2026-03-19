import React from "react";
import type { IActivityEventListItem } from "@/interfaces/datasentinel/activity";
import type { ISecurityAlertListItem } from "@/interfaces/datasentinel/alerts";

interface IReportBundlePdfInput {
  tenancyName?: string | null;
  windowDays: number;
  alerts: ISecurityAlertListItem[];
  activityEvents: IActivityEventListItem[];
}

const MAX_ALERT_ROWS = 18;
const MAX_ACTIVITY_ROWS = 24;

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  const resolvedDate = new Date(value);
  if (Number.isNaN(resolvedDate.getTime())) {
    return value;
  }

  return resolvedDate.toLocaleString();
};

const createStyles = async () => {
  const { StyleSheet } = await import("@react-pdf/renderer");

  return StyleSheet.create({
    page: {
      padding: 28,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#0f172a",
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 10,
      color: "#475569",
      marginBottom: 16,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 16,
    },
    metaCard: {
      width: "48%",
      border: "1 solid #cbd5e1",
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
    },
    metaLabel: {
      fontSize: 9,
      color: "#64748b",
      marginBottom: 4,
      textTransform: "uppercase",
    },
    metaValue: {
      fontSize: 16,
      fontWeight: 700,
    },
    section: {
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 8,
    },
    sectionLead: {
      fontSize: 9,
      color: "#475569",
      marginBottom: 8,
    },
    table: {
      width: "100%",
      border: "1 solid #cbd5e1",
      borderRadius: 6,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#e2e8f0",
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderTop: "1 solid #e2e8f0",
    },
    cellWide: {
      width: "30%",
      paddingRight: 8,
    },
    cellMedium: {
      width: "18%",
      paddingRight: 8,
    },
    cellSmall: {
      width: "17%",
      paddingRight: 8,
    },
    cellValue: {
      fontSize: 9,
    },
    footer: {
      marginTop: 10,
      fontSize: 8,
      color: "#64748b",
    },
  });
};

export const downloadReportBundlePdf = async ({
  tenancyName,
  windowDays,
  alerts,
  activityEvents,
}: IReportBundlePdfInput) => {
  const [{ Document, Page, Text, View, pdf }, styles] = await Promise.all([
    import("@react-pdf/renderer"),
    createStyles(),
  ]);

  const failedOperations = activityEvents.filter((event) => !event.isSuccess).length;
  const outOfHoursOperations = activityEvents.filter((event) => event.isOutOfHours).length;
  const criticalAlerts = alerts.filter((alert) => alert.severity >= 4).length;
  const reviewedAlerts = alerts.filter((alert) => alert.status !== 0).length;

  const reportDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>DataSentinel Report Bundle</Text>
        <Text style={styles.subtitle}>
          {tenancyName || "Current tenant"} | Last {windowDays} day(s) | Generated{" "}
          {formatDateTime(new Date().toISOString())}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Alert rows</Text>
            <Text style={styles.metaValue}>{alerts.length}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Activity rows</Text>
            <Text style={styles.metaValue}>{activityEvents.length}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Critical alerts</Text>
            <Text style={styles.metaValue}>{criticalAlerts}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Failed operations</Text>
            <Text style={styles.metaValue}>{failedOperations}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Reviewed alerts</Text>
            <Text style={styles.metaValue}>{reviewedAlerts}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Out-of-hours activity</Text>
            <Text style={styles.metaValue}>{outOfHoursOperations}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Register</Text>
          <Text style={styles.sectionLead}>
            Showing the first {Math.min(alerts.length, MAX_ALERT_ROWS)} alert row(s)
            from the active export window.
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellWide}>Alert</Text>
              <Text style={styles.cellSmall}>Severity</Text>
              <Text style={styles.cellSmall}>Status</Text>
              <Text style={styles.cellMedium}>Actor</Text>
              <Text style={styles.cellMedium}>Triggered</Text>
            </View>
            {alerts.slice(0, MAX_ALERT_ROWS).map((alert) => (
              <View key={alert.id} style={styles.tableRow}>
                <Text style={[styles.cellWide, styles.cellValue]}>
                  {alert.alertId} | {alert.title}
                </Text>
                <Text style={[styles.cellSmall, styles.cellValue]}>
                  {String(alert.severity)}
                </Text>
                <Text style={[styles.cellSmall, styles.cellValue]}>
                  {String(alert.status)}
                </Text>
                <Text style={[styles.cellMedium, styles.cellValue]}>
                  {alert.primaryActorUser || alert.primaryActorIp || "Unknown actor"}
                </Text>
                <Text style={[styles.cellMedium, styles.cellValue]}>
                  {formatDateTime(alert.triggeredAt)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Register</Text>
          <Text style={styles.sectionLead}>
            Showing the first {Math.min(activityEvents.length, MAX_ACTIVITY_ROWS)} activity
            row(s) from the active export window.
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellWide}>Event</Text>
              <Text style={styles.cellMedium}>Database</Text>
              <Text style={styles.cellMedium}>Actor</Text>
              <Text style={styles.cellSmall}>Success</Text>
              <Text style={styles.cellSmall}>When</Text>
            </View>
            {activityEvents.slice(0, MAX_ACTIVITY_ROWS).map((event) => (
              <View key={event.id} style={styles.tableRow}>
                <Text style={[styles.cellWide, styles.cellValue]}>
                  {(event.operation || event.eventType || "Unknown event").toString()}
                </Text>
                <Text style={[styles.cellMedium, styles.cellValue]}>
                  {event.databaseName || "Database not linked"}
                </Text>
                <Text style={[styles.cellMedium, styles.cellValue]}>
                  {event.actorUser || event.actorIp || "Unknown actor"}
                </Text>
                <Text style={[styles.cellSmall, styles.cellValue]}>
                  {event.isSuccess ? "Yes" : "No"}
                </Text>
                <Text style={[styles.cellSmall, styles.cellValue]}>
                  {formatDateTime(event.eventTime)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          This PDF bundle is a compact export summary. Use the CSV exports for full row-level
          analysis and the incident PDF export for a single alert investigation packet.
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(reportDocument).toBlob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `datasentinel-report-bundle-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};
