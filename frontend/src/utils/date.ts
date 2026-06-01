export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const formatDateTime = (value: string): string => {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

export const isOverdue = (value?: string | null): boolean => {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() < Date.now();
};

export const toDateInputValue = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
};