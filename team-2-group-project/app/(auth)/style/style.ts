import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  page: css`
    min-height: 100vh;
    min-height: 100dvh;
    height: 100dvh;
    display: grid;
    grid-template-columns: minmax(300px, 1fr) minmax(380px, 0.92fr);
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(8, 145, 178, 0.20) 0%, transparent 34%),
      radial-gradient(circle at bottom right, rgba(8, 145, 178, 0.08) 0%, transparent 28%),
      linear-gradient(160deg, #f2f8fb 0%, #eaf4f8 48%, #f6fbfd 100%);

    @media (max-width: 980px) {
      grid-template-columns: 1fr;
      height: auto;
      overflow: visible;
    }
  `,

  heroPanel: css`
    min-height: 0;
    padding: clamp(24px, 3.2vh, 34px);
    display: flex;
    align-items: center;
    background:
      radial-gradient(circle at top left, rgba(8, 145, 178, 0.22) 0%, transparent 34%),
      linear-gradient(180deg, #0c1a2e 0%, #10243c 100%);
    border-right: 1px solid rgba(8, 145, 178, 0.16);

    @media (max-width: 980px) {
      padding: 48px 24px 12px;
      min-height: auto;
      border-right: none;
      border-bottom: 1px solid rgba(8, 145, 178, 0.16);
    }
  `,

  heroContent: css`
    max-width: 460px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,

  heroBrand: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 6px;
  `,

  heroBrandLogo: css`
    width: auto;
    height: auto;
    filter: brightness(0) invert(1);
    opacity: 0.94;
  `,

  heroBrandContext: css`
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    border: 1px solid rgba(125, 211, 232, 0.2);
    background: rgba(8, 145, 178, 0.14);
    color: #7dd3e8;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
  `,

  eyebrow: css`
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: rgba(125, 211, 232, 0.12);
    color: #b9ecf7;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  `,

  heroTitle: css`
    &.ant-typography {
      margin: 0;
      color: #f8fbfd;
      font-size: clamp(1.95rem, 3.4vw, 3rem);
      line-height: 0.98;
    }
  `,

  heroText: css`
    &.ant-typography {
      margin: 0;
      color: rgba(220, 235, 244, 0.82);
      font-size: 14px;
      line-height: 1.5;
    }
  `,

  formSection: css`
    min-height: 0;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    @media (max-width: 980px) {
      padding: 12px 20px 40px;
      min-height: auto;
      overflow: visible;
    }
  `,

  formCard: css`
    &.ant-card {
      width: min(100%, 470px);
      border: 1px solid rgba(148, 163, 184, 0.25);
      box-shadow: 0 20px 48px rgba(15, 23, 42, 0.1);
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px);

      .ant-card-body {
        padding: 16px 16px 14px;
      }

      .ant-form-item {
        margin-bottom: 10px;
      }

      .ant-input,
      .ant-input-affix-wrapper,
      .ant-input-password,
      .ant-select-selector {
        height: 38px;
        min-height: 38px;
        border-radius: 18px;
        background: #eef3fb !important;
        border-color: #d5deec !important;
      }

      .ant-input.ant-input-outlined {
        padding-inline: 14px;
        box-shadow: none !important;
        overflow: hidden;
        background-clip: padding-box;
      }

      .ant-input-affix-wrapper,
      .ant-input-affix-wrapper.ant-input-outlined,
      .ant-input-affix-wrapper.ant-input-outlined:hover,
      .ant-input-affix-wrapper.ant-input-outlined:focus-within,
      .ant-input-affix-wrapper-focused {
        background: #eef3fb !important;
      }

      .ant-input,
      .ant-input-affix-wrapper > input.ant-input,
      .ant-input-password input.ant-input {
        background: transparent !important;
        color: #0f172a;
      }

      .ant-input-password input.ant-input,
      .ant-input-affix-wrapper > input.ant-input {
        height: auto !important;
        min-height: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        line-height: 1.4;
      }

      .ant-input-affix-wrapper,
      .ant-input-password,
      .ant-input-affix-wrapper.ant-input-outlined,
      .ant-input-password.ant-input-outlined {
        padding-inline: 14px;
        display: flex;
        align-items: center;
        box-shadow: none !important;
        background: #eef3fb !important;
        border-color: #d5deec !important;
      }

      .ant-input-affix-wrapper .ant-input,
      .ant-input-password .ant-input {
        box-shadow: none !important;
      }

      .ant-input-affix-wrapper .ant-input-suffix,
      .ant-input-affix-wrapper .ant-input-prefix,
      .ant-input-password .ant-input-suffix,
      .ant-input-password .ant-input-prefix {
        background: transparent !important;
        color: #7b8aa0;
      }

      .ant-input-affix-wrapper .ant-input-password-icon {
        color: #7b8aa0;
      }

      .ant-input::placeholder,
      .ant-input-affix-wrapper > input.ant-input::placeholder,
      .ant-input-password input.ant-input::placeholder {
        color: #7b8aa0;
      }

      .ant-input-affix-wrapper:hover,
      .ant-input-password:hover,
      .ant-input-affix-wrapper-focused,
      .ant-input:focus,
      .ant-input-focused {
        background: #eef3fb !important;
        border-color: #0891b2 !important;
      }

      .ant-input-affix-wrapper-status-error,
      .ant-input-affix-wrapper-status-error:hover,
      .ant-input-affix-wrapper-status-error.ant-input-affix-wrapper-focused {
        background: #eef3fb !important;
      }

      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      .ant-input-affix-wrapper input:-webkit-autofill,
      .ant-input-affix-wrapper input:-webkit-autofill:hover,
      .ant-input-affix-wrapper input:-webkit-autofill:focus {
        -webkit-text-fill-color: #0f172a !important;
        -webkit-box-shadow: 0 0 0 1000px #eef3fb inset !important;
        box-shadow: 0 0 0 1000px #eef3fb inset !important;
        caret-color: #0f172a;
        border-radius: 18px !important;
        -webkit-background-clip: padding-box;
      }

      .ant-btn {
        min-height: 38px;
      }

      @media (max-width: 980px) {
        width: min(100%, 540px);
      }
    }
  `,

  formBrand: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-bottom: 8px;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  `,

  formBrandLogo: css`
    width: auto;
    height: auto;
    max-width: 138px;
  `,

  formBrandCaption: css`
    color: #4a6a7c;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  `,

  headerBlock: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  `,

  tenantTag: css`
    &.ant-tag {
      width: fit-content;
      border-radius: 999px;
      border: none;
      background: rgba(8, 145, 178, 0.14);
      color: #0c4a58;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
    }
  `,

  title: css`
    &.ant-typography {
      margin: 0;
      color: #0f172a;
      font-size: 26px;
    }
  `,

  subtitle: css`
    &.ant-typography {
      margin: 0;
      color: #64748b;
      font-size: 13px;
    }
  `,

  sectionCard: css`
    border-radius: 18px;
    background: #f8fbff;
    border: 1px solid #d9e6fb;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
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
      font-size: 12px;
    }
  `,

  fieldStack: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  fieldLabel: css`
    color: #334155;
    font-weight: 600;
    font-size: 12px;
  `,

  formActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 0;
  `,

  primaryButton: css`
    &.ant-btn {
      border: none;
      min-width: 148px;
      height: 38px;
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
      height: 38px;
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
    gap: 6px;
    justify-content: center;
    margin-top: 12px;
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
