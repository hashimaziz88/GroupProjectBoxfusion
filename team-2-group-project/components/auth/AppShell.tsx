"use client";

import Image from "next/image";
import { Button, Layout, Menu, Tag, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { getVisibleNavigationItems } from "@/constants/navigation";
import { useAuthActions, useAuthState } from "@/providers/authProvider";
import { isHostAdmin, isTenantAdmin } from "@/utils/auth/roles";
import { useStyles } from "@/components/auth/style/style";
import { IAppShellProps } from "@/interfaces/auth/authProps";

const { Content, Header, Sider } = Layout;
const { Paragraph, Title } = Typography;

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

  const visibleItems = getVisibleNavigationItems(
    permissions,
    Boolean(currentTenant?.tenantId),
  );
  const selectedKey =
    visibleItems.find((item) => pathname.startsWith(item.href))?.key ?? "home";

  return (
    <Layout className={styles.shell}>
      <Sider breakpoint="lg" collapsedWidth="0" className={styles.sider}>
        <div
          className={styles.brandBlock}
          onClick={() => router.push("/landing")}
          style={{ cursor: "pointer" }}
        >
          <Image
            src="/logoipsum-custom-logo.svg"
            alt="DataSentinel"
            width={160}
            height={27}
            className={styles.brandLogo}
          />
          <Paragraph className={styles.brandText}>
            Database activity monitoring and security intelligence platform.
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
