import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "fa";
type Direction = "ltr" | "rtl";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: Direction;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

// Basic translations - in a real app, this would come from translation files
const translations = {
  en: {
    // Navigation
    "nav.courses": "Courses",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.search": "Search courses...",
    
    // Hero
    "hero.title": "Learn Skills For Your Future Career",
    "hero.subtitle": "Join thousands of students learning from world-class instructors. Build in-demand skills with our comprehensive course library.",
    "hero.explore": "Explore Courses",
    "hero.instructor": "Become Instructor",
    "hero.students": "Students",
    "hero.instructors": "Instructors",
    
    // Categories
    "categories.title": "Explore Course Categories",
    "categories.subtitle": "Choose from a wide range of topics and start your learning journey today",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
  },
  fa: {
    // Navigation
    "nav.courses": "دوره‌ها",
    "nav.blog": "وبلاگ",
    "nav.about": "درباره ما",
    "nav.login": "ورود",
    "nav.signup": "ثبت نام",
    "nav.search": "جستجوی دوره‌ها...",
    
    // Hero
    "hero.title": "مهارت‌های آینده شغلی خود را بیاموزید",
    "hero.subtitle": "به هزاران دانشجو بپیوندید که از مربیان کلاس جهانی یاد می‌گیرند. با کتابخانه جامع دوره‌های ما مهارت‌های مورد نیاز بازار کار را بسازید.",
    "hero.explore": "مشاهده دوره‌ها",
    "hero.instructor": "مربی شوید",
    "hero.students": "دانشجو",
    "hero.instructors": "مربی",
    
    // Categories
    "categories.title": "دسته‌بندی دوره‌ها را کاوش کنید",
    "categories.subtitle": "از طیف گسترده‌ای از موضوعات انتخاب کنید و سفر یادگیری خود را امروز شروع کنید",
    
    // Common
    "common.loading": "در حال بارگذاری...",
    "common.error": "خطایی رخ داد",
    "common.save": "ذخیره",
    "common.cancel": "لغو",
    "common.delete": "حذف",
    "common.edit": "ویرایش",
    "common.view": "مشاهده",
    "common.back": "بازگشت",
    "common.next": "بعدی",
    "common.previous": "قبلی",
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("edu-platform-language") as Language) || "en";
    }
    return "en";
  });

  const direction: Direction = language === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    localStorage.setItem("edu-platform-language", language);
  }, [language, direction]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value = {
    language,
    setLanguage,
    direction,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
