"use client";

import type { ReactNode } from "react";
import { Button, Layout, Menu, Tag, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { getVisibleNavigationItems } from "@/constants/navigation";
import { useAuthActions, useAuthState } from "@/providers/authProvider";
import { isHostAdmin, isTenantAdmin } from "@/utils/roles";
import { useStyles } from "@/app/style/style";

const { Content, Header, Sider } = Layout;
const { Paragraph, Text, Title } = Typography;

interface IAppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const resolveRoleLabel = (roles?: string[] | null) => {
  if (isHostAdmin(roles)) {
    return "Host admin";
  }

  if (isTenantAdmin(roles)) {
    return "Tenant admin";
  }

  return "Tenant user";
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
          <Text className={styles.brandEyebrow}>Team 2</Text>
          <Title level={4} className={styles.brandTitle}>
            Group Project
          </Title>
          <Paragraph className={styles.brandText}>
            Angular-parity shell with ABP auth, permissions, and tenancy.
          </Paragraph>
          <Tag className={styles.tenantBadge}>
            {currentTenant?.tenancyName ?? "Host context"}
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
              {currentTenant?.tenancyName ?? "Host"}
            </Tag>
            <Button
              className={styles.secondaryButton}
              onClick={() => router.push("/update-password")}
            >
              Update password
            </Button>
            <Button className={styles.primaryButton} onClick={() => void logout()}>
              Log out
            </Button>
          </div>
        </Header>

        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppShell;
