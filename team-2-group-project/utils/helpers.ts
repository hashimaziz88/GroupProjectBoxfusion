export const toArray = <T,>(value: T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : [];
