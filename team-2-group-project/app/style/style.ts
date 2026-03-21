import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  shell: css`
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(8, 145, 178, 0.10) 0%, transparent 28%),
      linear-gradient(180deg, #f3f7fa 0%, #eaf4f8 100%);
  `,

  sider: css`
    &.ant-layout-sider {
      background: #0f172a;
      border-right: 1px solid rgba(148, 163, 184, 0.14);
      height: auto !important;
      min-height: 100vh;
      overflow: visible;
    }

    .ant-layout-sider-children {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      height: auto;
    }
  `,

  brandBlock: css`
    padding: 28px 22px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,

  brandEyebrow: css`
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
  `,

  brandTitle: css`
    &.ant-typography {
      margin: 0;
      color: white;
    }
  `,

  brandText: css`
    &.ant-typography {
      margin: 0;
      color: rgba(226, 232, 240, 0.72);
      font-size: 13px;
      line-height: 1.6;
    }
  `,

  tenantBadge: css`
    &.ant-tag {
      width: fit-content;
      margin: 0;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.22);
      background: rgba(255, 255, 255, 0.08);
      color: white;
      padding: 6px 12px;
    }
  `,

  menu: css`
    &.ant-menu {
      flex: 1;
      background: transparent;
      border-inline-end: none;
      padding: 8px 12px 24px;
    }

    .ant-menu-item {
      border-radius: 14px;
      margin-block: 6px;
    }
  `,

  innerLayout: css`
    &.ant-layout {
      background: transparent;
    }
  `,

  header: css`
    &.ant-layout-header {
      height: auto;
      width: min(100%, 1440px);
      min-height: 92px;
      margin: 0 auto;
      padding: 18px 22px 12px;
      background: transparent;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 14px;
      align-items: flex-start;
    }
  `,

  headerCopy: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  pageTitle: css`
    &.ant-typography {
      margin: 0;
      color: #0f172a;
    }
  `,

  pageSubtitle: css`
    &.ant-typography {
      margin: 0;
      color: #64748b;
      max-width: 760px;
    }
  `,

  headerActions: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    align-items: center;
  `,

  headerTag: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      border: none;
      background: rgba(15, 23, 42, 0.08);
      color: #0f172a;
      padding: 7px 12px;
      font-weight: 600;
    }
  `,

  primaryButton: css`
    &.ant-btn {
      height: 42px;
      border: none;
      border-radius: 999px;
      padding-inline: 18px;
      color: white;
      font-weight: 600;
      background: linear-gradient(135deg, #1f6feb 0%, #3251a8 100%);
    }
  `,

  secondaryButton: css`
    &.ant-btn {
      height: 42px;
      border-radius: 999px;
      border-color: #cbd5e1;
      color: #0f172a;
      font-weight: 600;
      background: white;
    }
  `,

  content: css`
    width: min(100%, 1440px);
    margin: 0 auto;
    padding: 0 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,

  pageCard: css`
    &.ant-card {
      border-radius: 20px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
    }
  `,

  statGrid: css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  `,

  statCard: css`
    border-radius: 18px;
    padding: 18px;
    background: linear-gradient(180deg, #f8fdff 0%, #eef8fb 100%);
    border: 1px solid #c8e8f0;
    display: flex;
    flex-direction: column;
    gap: 6px;
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
    font-size: 24px;
    font-weight: 700;
  `,

  statHint: css`
    color: #475569;
    font-size: 14px;
  `,

  tagRow: css`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `,

  infoTag: css`
    &.ant-tag {
      margin: 0;
      border-radius: 999px;
      padding: 7px 12px;
      border: 1px solid #b8dfe8;
      background: #f0fafd;
      color: #0c4a58;
    }
  `,

  sectionTitle: css`
    &.ant-typography {
      margin: 0 0 12px;
      color: #0f172a;
    }
  `,

  sectionLead: css`
    &.ant-typography {
      margin: 0 0 14px;
      color: #64748b;
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

  alert: css`
    &.ant-alert {
      border-radius: 18px;
    }
  `,

  formStack: css`
    display: flex;
    flex-direction: column;
    gap: 18px;
  `,

  formActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  `,

  filterGrid: css`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

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

  splitGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  `,

  tripleGrid: css`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  `,

  stackedCards: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
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

  monoText: css`
    font-family: "Consolas", "SFMono-Regular", "Liberation Mono", monospace;
    font-size: 12px;
    color: #475569;
  `,

  jsonTextArea: css`
    textarea {
      min-height: 240px;
      font-family: "Consolas", "SFMono-Regular", "Liberation Mono", monospace;
      font-size: 12px;
      line-height: 1.6;
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

  inlineActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  `,

  toolbarControl: css`
    min-width: 220px;
  `,

  fullWidthControl: css`
    width: 100%;

    &.ant-input-number,
    &.ant-select {
      width: 100%;
    }
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

  profileHeader: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  `,

  profileAvatar: css`
    &.ant-avatar {
      background: linear-gradient(135deg, #1f6feb 0%, #3251a8 100%);
      color: white;
      font-weight: 700;
      font-size: 24px;
      flex-shrink: 0;
    }
  `,

  profileName: css`
    &.ant-typography {
      margin: 0;
      color: #0f172a;
    }
  `,

  profileDescriptions: css`
    .ant-descriptions-item-label {
      color: #64748b;
      font-weight: 600;
      font-size: 13px;
      min-width: 90px;
    }
    .ant-descriptions-item-content {
      color: #0f172a;
      font-size: 14px;
    }
  `,
}));
