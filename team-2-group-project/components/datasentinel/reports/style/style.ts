import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  alert: css`
    &.ant-alert {
      border-radius: 18px;
    }
  `,

  pageCard: css`
    &.ant-card {
      border-radius: 18px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);

      .ant-card-body {
        padding: 18px;
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

  controlRow: css`
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 14px;
  `,

  controlField: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 220px;
  `,

  exportGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;

    @media (max-width: 980px) {
      grid-template-columns: 1fr;
    }
  `,

  statGrid: css`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,

  statCard: css`
    border-radius: 16px;
    padding: 16px;
    background: linear-gradient(180deg, #f8fdff 0%, #eef8fb 100%);
    border: 1px solid #c8e8f0;
    display: flex;
    flex-direction: column;
    gap: 6px;
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
    font-size: 24px;
    font-weight: 700;
  `,

  statHint: css`
    color: #475569;
    font-size: 12px;
  `,

  packageList: css`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,

  packageCard: css`
    border-radius: 16px;
    padding: 14px 16px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: #f8fbfd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    @media (max-width: 720px) {
      flex-direction: column;
      align-items: stretch;
    }
  `,

  packageMeta: css`
    color: #475569;
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
}));
