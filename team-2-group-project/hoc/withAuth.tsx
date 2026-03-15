"use client";

import type { ComponentType } from "react";

export const withAuth = <P extends object>(Component: ComponentType<P>) => {
  return function WithAuth(props: P) {
    return <Component {...props} />;
  };
};
