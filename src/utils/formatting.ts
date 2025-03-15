
export const formatNumber = (num: number): string => {
  return num.toFixed(1);
};

export const formatDate = (input: Date | string) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
};
