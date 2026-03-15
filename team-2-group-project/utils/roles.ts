export const isAdminOrManager = (roles?: string[] | null) =>
  Array.isArray(roles) &&
  roles.some((role) => ["admin", "user"].includes(role.toLowerCase()));
