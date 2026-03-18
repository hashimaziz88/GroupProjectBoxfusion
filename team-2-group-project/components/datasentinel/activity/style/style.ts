import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  pageCard: css`
    &.ant-card {
      border-radius: 24px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);
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
    border-radius: 20px;
    padding: 20px;
    background: linear-gradient(180deg, #fbfdff 0%, #f4f8ff 100%);
    border: 1px solid #dbe5f4;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  statLabel: css`
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  `,

  statValue: css`
    color: #0f172a;
    font-size: 28px;
    font-weight: 700;
  `,

  statHint: css`
    color: #475569;
    font-size: 14px;
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
}));
