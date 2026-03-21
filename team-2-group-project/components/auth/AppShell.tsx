"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Layout, Menu, Tag, Typography } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import { usePathname, useRouter } from "next/navigation";
import {
  getVisibleNavigationItems,
  INavigationItem,
} from "@/constants/navigation";
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

const buildMenuItems = (
  items: INavigationItem[],
  onNavigate: (href: string) => void,
): ItemType[] =>
  items.map((item) => {
    if (item.children?.length) {
      return {
        key: item.key,
        label: item.label,
        icon: item.icon,
        children: buildMenuItems(item.children, onNavigate),
      };
    }

    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      onClick: item.href ? () => onNavigate(item.href!) : undefined,
    };
  });

const resolveMenuSelection = (
  items: INavigationItem[],
  pathname: string,
  ancestorKeys: string[] = [],
): { selectedKey: string; openKeys: string[] } | null => {
  const sorted = [...items].sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0));

  for (const item of sorted) {
    if (item.children?.length) {
      const childSelection = resolveMenuSelection(item.children, pathname, [
        ...ancestorKeys,
        item.key,
      ]);

      if (childSelection) {
        return childSelection;
      }
    }

    if (item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))) {
      return {
        selectedKey: item.key,
        openKeys: ancestorKeys,
      };
    }
  }

  return null;
};

const AppShell = ({ title, subtitle, children }: IAppShellProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { styles } = useStyles();
  const { logout } = useAuthActions();
  const { currentTenant, permissions, user } = useAuthState();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const visibleItems = getVisibleNavigationItems(
    permissions,
    user?.roles,
    Boolean(currentTenant?.tenantId),
  );
  const menuSelection = resolveMenuSelection(visibleItems, pathname) ?? {
    selectedKey: visibleItems[0]?.key ?? "profile",
    openKeys: [],
  };
  const [userOpenKeys, setUserOpenKeys] = useState<string[]>([]);
  const openKeys =
    userOpenKeys.length > 0 || menuSelection.openKeys.length === 0
      ? userOpenKeys
      : menuSelection.openKeys;

  const handleNavigate = (href: string) => {
    if (isMobile) {
      setCollapsed(true);
      setUserOpenKeys([]);
    }
    router.push(href);
  };

  return (
    <Layout className={styles.shell}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        collapsed={collapsed}
        onCollapse={(c) => setCollapsed(c)}
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          setCollapsed(broken);
        }}
        className={styles.sider}
      >
        <Link className={styles.brandBlock} href="/landing">
          <Image
            src="/logoipsum-custom-logo.svg"
            alt="DataSentinel"
            width={140}
            height={24}
            className={styles.brandLogo}
          />
          <Tag className={styles.tenantBadge}>
            {currentTenant?.tenancyName ?? "Host context"}
          </Tag>
        </Link>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[menuSelection.selectedKey]}
          openKeys={openKeys}
          onOpenChange={(nextKeys) => setUserOpenKeys(nextKeys)}
          items={buildMenuItems(visibleItems, handleNavigate)}
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
