import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  alert: css`
    &.ant-alert {
      border-radius: 18px;
    }
  `,

  pageCard: css`
    &.ant-card {
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);

      .ant-card-body {
        padding: 16px 18px;
      }
    }
  `,

  sectionTitle: css`
    &.ant-typography {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
  `,

  sectionLead: css`
    &.ant-typography {
      margin: 0 0 12px;
      font-size: 12px;
      color: #64748b;
    }
  `,

  filterGrid: css`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  `,

  filterField: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  filterActionsRow: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  `,

  statGrid: css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1100px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  `,

  statCard: css`
    border-radius: 14px;
    padding: 14px 16px;
    background: linear-gradient(180deg, #f8fdff 0%, #eef8fb 100%);
    border: 1px solid #c8e8f0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  statLabel: css`
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  `,

  statValue: css`
    color: #0f172a;
    font-size: 22px;
    font-weight: 700;
  `,

  statHint: css`
    color: #475569;
    font-size: 12px;
  `,

  splitGrid: css`
    display: grid;
    grid-template-columns: 1.25fr 0.75fr;
    gap: 18px;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  `,

  threeColumnGrid: css`
    display: grid;
    grid-template-columns: 1.1fr 1fr 1fr;
    gap: 18px;

    @media (max-width: 1280px) {
      grid-template-columns: 1fr;
    }
  `,

  quickLinks: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  `,

  trendGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  `,

  chartCard: css`
    border-radius: 18px;
    padding: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
    border: 1px solid rgba(148, 163, 184, 0.18);
  `,

  chartHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  `,

  chartTitle: css`
    color: #0f172a;
    font-size: 15px;
    font-weight: 700;
  `,

  chartMeta: css`
    color: #64748b;
    font-size: 12px;
  `,

  chartColumns: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(26px, 1fr));
    gap: 8px;
    align-items: end;
    min-height: 180px;
  `,

  chartColumnWrap: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  `,

  chartColumn: css`
    width: 100%;
    min-height: 12px;
    border-radius: 999px 999px 10px 10px;
    transition: opacity 0.2s ease;
  `,

  chartLabel: css`
    color: #64748b;
    font-size: 11px;
    text-align: center;
  `,

  severityList: css`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,

  severityRow: css`
    display: grid;
    grid-template-columns: 110px 1fr auto;
    gap: 12px;
    align-items: center;
  `,

  severityCount: css`
    color: #0f172a;
    font-weight: 700;
  `,

  riskList: css`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,

  riskItem: css`
    border-radius: 18px;
    padding: 14px 16px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: #f8fbfd;
  `,

  riskHeader: css`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  `,

  riskName: css`
    color: #0f172a;
    font-weight: 700;
  `,

  riskMeta: css`
    color: #64748b;
    font-size: 12px;
    margin-top: 8px;
  `,

  entityRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(226, 232, 240, 0.85);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  `,

  entityTitle: css`
    color: #0f172a;
    font-weight: 600;
  `,

  entityMeta: css`
    color: #64748b;
    font-size: 12px;
    margin-top: 4px;
  `,

  timelineMetric: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-right: 10px;
    color: #334155;
    font-size: 12px;
  `,

  table: css`
    width: 100%;

    .ant-table-content,
    .ant-table-body {
      overflow: auto !important;
    }

    .ant-table-container {
      border-radius: 18px !important;
    }
  `,

  aiPanel: css`
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 18px;
    background: linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%);
    padding: 20px;
  `,

  aiPanelHeader: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  `,

  aiPanelTitle: css`
    &.ant-typography {
      margin: 0;
      color: #4338ca;
    }
  `,

  aiSection: css`
    margin-bottom: 14px;

    &:last-child {
      margin-bottom: 0;
    }
  `,

  aiSectionLabel: css`
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #6366f1;
    margin-bottom: 6px;
  `,

  aiNextStepBlock: css`
    border-left: 3px solid #6366f1;
    padding-left: 12px;
  `,

  aiErrorBlock: css`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: #64748b;
  `,
}));
