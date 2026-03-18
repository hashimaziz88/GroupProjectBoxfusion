import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  page: css`
    min-height: 100vh;
    background:
      radial-gradient(circle at 20% 10%, rgba(8, 145, 178, 0.14) 0%, transparent 38%),
      radial-gradient(circle at 80% 90%, rgba(12, 26, 46, 0.08) 0%, transparent 30%),
      linear-gradient(160deg, #f0f8fb 0%, #e8f4f8 50%, #f4fbfd 100%);
  `,

  nav: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 48px;
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(240, 248, 251, 0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(8, 145, 178, 0.12);

    @media (max-width: 768px) {
      padding: 16px 24px;
    }
  `,

  navBrand: css`
    display: flex;
    flex-direction: column;
    gap: 2px;
  `,

  navEyebrow: css`
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: #0891b2;
  `,

  navTitle: css`
    &.ant-typography {
      margin: 0;
      color: #0c1a2e;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
  `,

  navActions: css`
    display: flex;
    gap: 12px;
    align-items: center;
  `,

  hero: css`
    max-width: 1160px;
    margin: 0 auto;
    padding: 96px 48px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 32px;

    @media (max-width: 768px) {
      padding: 64px 24px 56px;
    }
  `,

  heroBadge: css`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    background: rgba(8, 145, 178, 0.12);
    border: 1px solid rgba(8, 145, 178, 0.28);
    color: #0c4a58;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  `,

  heroTitle: css`
    &.ant-typography {
      margin: 0;
      color: #0c1a2e;
      font-size: clamp(2.8rem, 6vw, 5rem);
      font-weight: 900;
      line-height: 0.96;
      letter-spacing: -0.03em;
      max-width: 820px;
    }
  `,

  heroAccent: css`
    color: #0891b2;
  `,

  heroSub: css`
    &.ant-typography {
      margin: 0;
      color: #4a6a7c;
      font-size: clamp(1rem, 2vw, 1.2rem);
      line-height: 1.7;
      max-width: 620px;
    }
  `,

  heroActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    justify-content: center;
  `,

  primaryButton: css`
    &.ant-btn {
      height: 50px;
      padding-inline: 32px;
      font-size: 15px;
      font-weight: 700;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #0891b2 0%, #0e4f6b 100%);
      color: white;
      box-shadow: 0 16px 40px rgba(8, 145, 178, 0.32);
    }

    &.ant-btn:hover,
    &.ant-btn:focus {
      color: white !important;
      background: linear-gradient(135deg, #0e9fc3 0%, #0f5a7a 100%) !important;
    }
  `,

  secondaryButton: css`
    &.ant-btn {
      height: 50px;
      padding-inline: 32px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 999px;
      border-color: #b0cfd8;
      color: #0c1a2e;
      background: white;
    }
  `,

  navPrimaryButton: css`
    &.ant-btn {
      height: 38px;
      padding-inline: 20px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #0891b2 0%, #0e4f6b 100%);
      color: white;
    }

    &.ant-btn:hover,
    &.ant-btn:focus {
      color: white !important;
      background: linear-gradient(135deg, #0e9fc3 0%, #0f5a7a 100%) !important;
    }
  `,

  navSecondaryButton: css`
    &.ant-btn {
      height: 38px;
      padding-inline: 20px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 999px;
      border-color: #b0cfd8;
      color: #0c1a2e;
      background: white;
    }
  `,

  statsRow: css`
    max-width: 1160px;
    margin: 0 auto 80px;
    padding: 0 48px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      padding: 0 24px;
    }
  `,

  statCard: css`
    border-radius: 24px;
    padding: 28px 32px;
    background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,250,253,0.95) 100%);
    border: 1px solid rgba(8, 145, 178, 0.18);
    box-shadow: 0 8px 32px rgba(12, 26, 46, 0.06);
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  statValue: css`
    font-size: 2.4rem;
    font-weight: 900;
    color: #0891b2;
    letter-spacing: -0.03em;
    line-height: 1;
  `,

  statLabel: css`
    &.ant-typography {
      margin: 0;
      color: #4a6a7c;
      font-size: 14px;
    }
  `,

  featuresSection: css`
    max-width: 1160px;
    margin: 0 auto 100px;
    padding: 0 48px;

    @media (max-width: 768px) {
      padding: 0 24px;
      margin-bottom: 64px;
    }
  `,

  sectionLabel: css`
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0891b2;
    margin-bottom: 12px;
    display: block;
  `,

  sectionTitle: css`
    &.ant-typography {
      margin: 0 0 48px;
      color: #0c1a2e;
      font-size: clamp(1.8rem, 3.5vw, 2.6rem);
      font-weight: 800;
      letter-spacing: -0.02em;
    }
  `,

  featureGrid: css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  `,

  featureCard: css`
    border-radius: 20px;
    padding: 28px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(8, 145, 178, 0.14);
    box-shadow: 0 4px 20px rgba(12, 26, 46, 0.05);
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,

  featureIcon: css`
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(8, 145, 178, 0.15) 0%, rgba(8, 145, 178, 0.06) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  `,

  featureTitle: css`
    &.ant-typography {
      margin: 0;
      color: #0c1a2e;
      font-size: 16px;
      font-weight: 700;
    }
  `,

  featureText: css`
    &.ant-typography {
      margin: 0;
      color: #4a6a7c;
      font-size: 14px;
      line-height: 1.65;
    }
  `,

  ctaSection: css`
    background: linear-gradient(135deg, #0c1a2e 0%, #0e3347 100%);
    margin: 0 48px 80px;
    border-radius: 28px;
    padding: 64px 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
    max-width: 1064px;
    margin-inline: auto;

    @media (max-width: 768px) {
      margin: 0 24px 56px;
      padding: 48px 32px;
    }
  `,

  ctaTitle: css`
    &.ant-typography {
      margin: 0;
      color: white;
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 800;
      letter-spacing: -0.02em;
    }
  `,

  ctaText: css`
    &.ant-typography {
      margin: 0;
      color: rgba(186, 218, 230, 0.8);
      font-size: 16px;
      line-height: 1.65;
      max-width: 520px;
    }
  `,

  footer: css`
    border-top: 1px solid rgba(8, 145, 178, 0.12);
    padding: 32px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 12px;
      padding: 24px;
      text-align: center;
    }
  `,

  footerText: css`
    &.ant-typography {
      margin: 0;
      color: #7a9aaa;
      font-size: 13px;
    }
  `,

  footerBrand: css`
    &.ant-typography {
      margin: 0;
      color: #0891b2;
      font-weight: 700;
      font-size: 13px;
    }
  `,
}));
