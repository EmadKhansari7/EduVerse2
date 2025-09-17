export const COURSE_LEVELS = [
  { value: "beginner", label: "Beginner", labelFa: "مقدماتی" },
  { value: "intermediate", label: "Intermediate", labelFa: "متوسط" },
  { value: "advanced", label: "Advanced", labelFa: "پیشرفته" },
];

export const COURSE_STATUSES = [
  { value: "draft", label: "Draft", labelFa: "پیش‌نویس" },
  { value: "pending", label: "Pending Review", labelFa: "در انتظار بررسی" },
  { value: "published", label: "Published", labelFa: "منتشر شده" },
  { value: "rejected", label: "Rejected", labelFa: "رد شده" },
];

export const USER_ROLES = [
  { value: "student", label: "Student", labelFa: "دانشجو" },
  { value: "instructor", label: "Instructor", labelFa: "مربی" },
  { value: "admin", label: "Admin", labelFa: "مدیر" },
];

export const DEFAULT_COURSE_THUMBNAIL = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";

export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";

export const PAGINATION_LIMITS = {
  COURSES: 12,
  BLOG_POSTS: 9,
  REVIEWS: 10,
  COMMENTS: 20,
};

export const CATEGORY_ICONS = {
  programming: "code",
  business: "briefcase",
  design: "palette",
  marketing: "megaphone",
  "data-science": "bar-chart",
  languages: "globe",
  "personal-development": "user",
  science: "flask",
};

export const CATEGORY_COLORS = {
  programming: "#3b82f6",
  business: "#10b981",
  design: "#8b5cf6",
  marketing: "#f59e0b",
  "data-science": "#06b6d4",
  languages: "#ef4444",
  "personal-development": "#f97316",
  science: "#84cc16",
};
