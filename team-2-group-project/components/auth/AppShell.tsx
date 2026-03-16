"use client";

import { Button, Layout, Menu, Tag, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { getVisibleNavigationItems } from "@/constants/navigation";
import { useAuthActions, useAuthState } from "@/providers/authProvider";
import {
  isDatabaseAdministrator,
  isHostAdmin,
  isOperationsManager,
  isSecurityAnalyst,
  isTenantAdmin,
} from "@/utils/auth/roles";
import { useStyles } from "@/app/style/style";
import { IAppShellProps } from "@/interfaces/auth/authProps";

const { Content, Header, Sider } = Layout;
const { Paragraph, Text, Title } = Typography;

const resolveRoleLabel = (roles?: string[] | null) => {
  if (isHostAdmin(roles)) {
    return "Platform admin";
  }

  if (isTenantAdmin(roles)) {
    return "Environment admin";
  }

  if (isDatabaseAdministrator(roles)) {
    return "Database administrator";
  }

  if (isOperationsManager(roles)) {
    return "Operations manager";
  }

  if (isSecurityAnalyst(roles)) {
    return "Security analyst";
  }

  return "Security analyst";
};

const AppShell = ({ title, subtitle, children }: IAppShellProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { styles } = useStyles();
  const { logout } = useAuthActions();
  const { currentTenant, permissions, user } = useAuthState();

  const visibleItems = getVisibleNavigationItems(permissions);
  const selectedKey =
    visibleItems.find((item) => pathname.startsWith(item.href))?.key ?? "home";

  return (
    <Layout className={styles.shell}>
      <Sider breakpoint="lg" collapsedWidth="0" className={styles.sider}>
        <div className={styles.brandBlock}>
          <Text className={styles.brandEyebrow}>SQL Security Platform</Text>
          <Title level={4} className={styles.brandTitle}>
            DataSentinel
          </Title>
          <Paragraph className={styles.brandText}>
            Monitor suspicious SQL activity, triage anomaly alerts, and review
            access-sensitive events across tenant environments.
          </Paragraph>
          <Tag className={styles.tenantBadge}>
            Scope: {currentTenant?.tenancyName ?? "Host"}
          </Tag>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={visibleItems.map((item) => ({
            key: item.key,
            label: item.label,
            onClick: () => router.push(item.href),
          }))}
          className={styles.menu}
        />
      </Sider>

      <Layout className={styles.innerLayout}>
        <Header className={styles.header}>
          <div className={styles.headerCopy}>
            <Title level={3} className={styles.pageTitle}>
              {title}
            </Title>
            <Paragraph className={styles.pageSubtitle}>{subtitle}</Paragraph>
          </div>

          <div className={styles.headerActions}>
            <Tag className={styles.headerTag}>{resolveRoleLabel(user?.roles)}</Tag>
            <Tag className={styles.headerTag}>
              {currentTenant?.tenancyName ?? "Host workspace"}
            </Tag>
            <Button
              className={styles.secondaryButton}
              onClick={() => router.push("/update-password")}
            >
              Account security
            </Button>
            <Button className={styles.primaryButton} onClick={() => void logout()}>
              Sign out
            </Button>
          </div>
        </Header>

        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppShell;
