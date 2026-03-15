import { ReactNode } from "react";

export interface IAuthLayoutProps {
  children: ReactNode;
  asideTitle: string;
  asideText: string;
}

export interface IAuthHeaderProps {
  title: string;
  subtitle: string;
  tenantLabel?: string;
}

export interface IAuthFooterLinkProps {
  question: string;
  label: string;
  href: string;
}

export interface IAppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export interface IRegisterFormValues {
  name: string;
  surname: string;
  emailAddress: string;
  userName: string;
  password: string;
}

export interface ILoginFormValues {
  userNameOrEmailAddress: string;
  password: string;
  rememberClient: boolean;
}
