export const formatPrice = (price: string | number, currency = "USD") => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  }
  
  // For Iranian Rial (IRR) or other currencies
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency: "IRR",
  }).format(numPrice);
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatDate = (date: string | Date, language: "en" | "fa" = "en") => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (language === "fa") {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};
