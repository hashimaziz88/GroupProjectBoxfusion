import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  alert: css`
    &.ant-alert {
      border-radius: 18px;
    }
  `,

  backRow: css`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 1100px) {
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
    gap: 12px;
    margin-top: 18px;
  `,

  activeFiltersRow: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    margin-bottom: 12px;
  `,

  tableToolbar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;

    @media (max-width: 720px) {
      flex-direction: column;
      align-items: flex-start;
    }
  `,

  bulkToolbar: css`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;

    @media (max-width: 720px) {
      width: 100%;
      align-items: flex-start;
    }
  `,

  selectionSummary: css`
    &.ant-typography {
      margin: 0;
      color: #64748b;
      text-align: right;
    }
  `,

  table: css`
    .ant-table-container {
      border-radius: 18px !important;
      overflow: hidden;
    }
  `,

  cellHint: css`
    color: #64748b;
    font-size: 12px;
    margin-top: 4px;
  `,

  mutedText: css`
    color: #64748b;
    font-size: 13px;
  `,

  riskBadge: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      font-weight: 700;
      padding-inline: 12px;
      border: none;
    }
  `,

  detailHero: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  `,

  detailSection: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 22px;
  `,

  detailGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  `,

  detailMetric: css`
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 18px;
    padding: 14px 16px;
    background: #f8fbfd;
  `,

  metricLabel: css`
    display: block;
    color: #64748b;
    font-size: 12px;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  `,

  actionList: css`
    margin: 0;
    padding-left: 18px;
    color: #334155;

    li + li {
      margin-top: 8px;
    }
  `,

  noteList: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,

  noteCard: css`
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: #f8fbfd;
    padding: 14px 16px;
  `,

  noteMeta: css`
    color: #64748b;
    font-size: 12px;
    margin-bottom: 8px;
  `,

  drawerActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `,

  aiPanel: css`
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 18px;
    background: linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%);
    padding: 20px;
    margin-bottom: 22px;
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

  aiSeverityBlock: css`
    border-left: 3px solid #f59e0b;
    padding-left: 12px;
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
