import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  page: css`
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(300px, 1.05fr) minmax(380px, 0.95fr);
    background:
      radial-gradient(circle at top left, rgba(8, 145, 178, 0.20) 0%, transparent 34%),
      radial-gradient(circle at bottom right, rgba(8, 145, 178, 0.08) 0%, transparent 28%),
      linear-gradient(160deg, #f2f8fb 0%, #eaf4f8 48%, #f6fbfd 100%);

    @media (max-width: 980px) {
      grid-template-columns: 1fr;
    }
  `,

  heroPanel: css`
    padding: 56px;
    display: flex;
    align-items: center;

    @media (max-width: 980px) {
      padding: 48px 24px 12px;
    }
  `,

  heroContent: css`
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  `,

  eyebrow: css`
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.08);
    color: #0f172a;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  `,

  heroTitle: css`
    &.ant-typography {
      margin: 0;
      color: #0f172a;
      font-size: clamp(2.5rem, 5vw, 4.25rem);
      line-height: 0.98;
    }
  `,

  heroText: css`
    &.ant-typography {
      margin: 0;
      color: #475569;
      font-size: 16px;
      line-height: 1.7;
    }
  `,

  formSection: css`
    padding: 48px 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 980px) {
      padding: 12px 20px 40px;
    }
  `,

  formCard: css`
    &.ant-card {
      width: min(100%, 540px);
      border: 1px solid rgba(148, 163, 184, 0.25);
      box-shadow: 0 30px 80px rgba(15, 23, 42, 0.12);
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px);
    }
  `,

  headerBlock: css`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 28px;
  `,

  tenantTag: css`
    &.ant-tag {
      width: fit-content;
      border-radius: 999px;
      border: none;
      background: rgba(8, 145, 178, 0.14);
      color: #0c4a58;
      padding: 6px 12px;
      font-weight: 600;
    }
  `,

  title: css`
    &.ant-typography {
      margin: 0;
      color: #0f172a;
    }
  `,

  subtitle: css`
    &.ant-typography {
      margin: 0;
      color: #64748b;
    }
  `,

  sectionCard: css`
    border-radius: 20px;
    background: #f8fbff;
    border: 1px solid #d9e6fb;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 18px;
  `,

  tenantSummary: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  tenantName: css`
    &.ant-typography {
      margin: 0;
      color: #0f172a;
      font-weight: 700;
    }
  `,

  tenantHint: css`
    &.ant-typography {
      margin: 0;
      color: #64748b;
      font-size: 13px;
    }
  `,

  fieldStack: css`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,

  fieldLabel: css`
    color: #334155;
    font-weight: 600;
    font-size: 13px;
  `,

  formActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 6px;
  `,

  primaryButton: css`
    &.ant-btn {
      border: none;
      min-width: 148px;
      height: 44px;
      border-radius: 999px;
      background: linear-gradient(135deg, #0891b2 0%, #0e4f6b 100%);
      color: white;
      font-weight: 600;
      box-shadow: 0 16px 32px rgba(8, 145, 178, 0.28);
    }

    &.ant-btn:hover,
    &.ant-btn:focus {
      color: white !important;
      background: linear-gradient(135deg, #0e9fc3 0%, #0f5a7a 100%) !important;
    }
  `,

  secondaryButton: css`
    &.ant-btn {
      height: 44px;
      border-radius: 999px;
      font-weight: 600;
      border-color: #b0cfd8;
      color: #0c1a2e;
      background: white;
    }
  `,

  alert: css`
    &.ant-alert {
      border-radius: 16px;
    }
  `,

  footerLinkRow: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 20px;
  `,

  footerText: css`
    color: ${token.colorTextSecondary};
  `,

  footerLink: css`
    color: #0891b2;
    font-weight: 600;

    &:hover {
      color: #0c4a58;
    }
  `,
}));
