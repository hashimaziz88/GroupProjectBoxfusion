import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  wrapper: css`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at top left, #dbeafe 0%, transparent 38%),
      linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
    padding: 24px;
  `,

  card: css`
    min-width: 260px;
    border-radius: 24px;
    padding: 32px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  `,

  label: css`
    color: ${token.colorTextSecondary};
    text-align: center;
  `,
}));
