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
    gap: 18px;
    margin-bottom: 24px;
    padding: 22px;
    border-radius: 24px;
    background:
      radial-gradient(circle at top left, rgba(251, 191, 36, 0.18), transparent 34%),
      linear-gradient(135deg, #fffdf7 0%, #f8fbff 56%, #f5f9ff 100%);
    border: 1px solid rgba(148, 163, 184, 0.18);
  `,

  heroHeadingRow: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;

    @media (max-width: 960px) {
      flex-direction: column;
    }
  `,

  heroHeadingBlock: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,

  heroTitle: css`
    &.ant-typography {
      margin: 0 0 6px;
      color: #0f172a;
      line-height: 1.15;
    }
  `,

  heroMetaRow: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  `,

  heroMetaDot: css`
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: #94a3b8;
  `,

  heroActionRail: css`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;

    @media (max-width: 960px) {
      width: 100%;
      align-items: flex-start;
    }
  `,

  heroSeverityTag: css`
    &.ant-tag {
      margin: 0;
      padding-inline: 12px;
      border-radius: 999px;
      font-weight: 700;
    }
  `,

  heroStatusTag: css`
    &.ant-tag {
      margin: 0;
      padding-inline: 12px;
      border-radius: 999px;
      font-weight: 700;
    }
  `,

  workflowPill: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      padding-inline: 12px;
      font-weight: 600;
    }
  `,

  heroStatGrid: css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  `,

  heroStatCard: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 108px;
    padding: 16px 18px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  `,

  detailWorkspaceGrid: css`
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.9fr);
    gap: 22px;

    @media (max-width: 1080px) {
      grid-template-columns: 1fr;
    }
  `,

  detailMainColumn: css`
    display: flex;
    flex-direction: column;
    gap: 22px;
  `,

  detailSideColumn: css`
    display: flex;
    flex-direction: column;
    gap: 18px;
  `,

  detailSection: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 20px;
    border-radius: 20px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: #fff;
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
    background: linear-gradient(180deg, #f8fbfd 0%, #fdfefe 100%);
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
    background: linear-gradient(180deg, #f8fbfd 0%, #ffffff 100%);
    padding: 14px 16px;
  `,

  noteCardHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  `,

  noteMeta: css`
    color: #64748b;
    font-size: 12px;
  `,

  internalNoteTag: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      background: #fff7ed;
      color: #c2410c;
      border-color: rgba(251, 146, 60, 0.28);
    }
  `,

  sharedNoteTag: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      border-color: rgba(59, 130, 246, 0.24);
    }
  `,

  drawerActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `,

  aiPanel: css`
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 20px;
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

  summaryLead: css`
    &.ant-typography {
      margin: 0;
      color: #334155;
      font-size: 14px;
      line-height: 1.75;
    }
  `,

  recommendationHeader: css`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #0f172a;
  `,

  recommendationItem: css`
    &.ant-list-item {
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      color: #334155;
    }
  `,

  recommendationIcon: css`
    color: #2563eb;
    margin-top: 2px;
  `,

  actionPanel: css`
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px 20px;
    border-radius: 20px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  `,

  actionPanelHeader: css`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    color: #2563eb;
  `,

  sectionDivider: css`
    &.ant-divider {
      margin: 4px 0;
    }
  `,

  timelineCard: css`
    padding: 10px 14px;
    border-radius: 16px;
    background: #f8fbfd;
    border: 1px solid rgba(148, 163, 184, 0.14);
  `,

  timelineComment: css`
    &.ant-typography {
      margin: 8px 0 0;
      color: #334155;
    }
  `,

  sectionHeaderRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  `,

  countTag: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      padding-inline: 10px;
      background: #f1f5f9;
      color: #334155;
      border: none;
      font-weight: 600;
    }
  `,
}));
