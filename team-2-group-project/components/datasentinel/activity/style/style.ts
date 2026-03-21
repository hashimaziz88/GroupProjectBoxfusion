import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
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

  cardToolbar: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  `,

  sectionTitle: css`
    &.ant-typography {
      margin: 0 0 12px;
      color: #0f172a;
    }
  `,

  sectionLead: css`
    &.ant-typography {
      margin: 0 0 16px;
      color: #64748b;
    }
  `,

  statGrid: css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  `,

  statCard: css`
    border-radius: 14px;
    padding: 12px 14px;
    background: linear-gradient(180deg, #f8fdff 0%, #eef8fb 100%);
    border: 1px solid #c8e8f0;
    display: flex;
    flex-direction: column;
    gap: 3px;
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
    font-size: 20px;
    font-weight: 700;
  `,

  statHint: css`
    color: #475569;
    font-size: 12px;
  `,

  filterGrid: css`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 1280px) {
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

  filterBar: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  `,

  filterBarControl: css`
    flex: 1;
    min-width: 140px;
    max-width: 260px;
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

  mutedText: css`
    color: #64748b;
    font-size: 13px;
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

  cellHint: css`
    color: #64748b;
    font-size: 12px;
    margin-top: 4px;
  `,

  aiPanel: css`
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 18px;
    background: linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%);
    padding: 20px;
    margin-bottom: 18px;
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

  aiErrorBlock: css`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: #64748b;
  `,
}));
