export const toArray = <T,>(value: T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : [];

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  const resolvedDate = new Date(value);

  if (Number.isNaN(resolvedDate.getTime())) {
    return value;
  }

  return resolvedDate.toLocaleString();
};
