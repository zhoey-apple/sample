import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "zh";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

// Simple dictionary for key UI elements
const translations: Translations = {
  en: {
    "search": "Search",
    "principles": "Principles",
    "usage_guide": "Usage Guide",
    "sign_out": "Sign Out",
    "yearly": "Yearly",
    "monthly": "Monthly",
    "weekly": "Weekly",
    "daily": "Daily",
    "empty": "Empty",
    "delete": "Delete",
    "direction": "Monthly Direction",
    "task_flow": "Task Flow",
    "carried_over": "Carried Over",
    "today_tasks": "Today's Tasks",
    "creative_thoughts": "Creative Thoughts",
    "habit_tracker": "Habit Tracker",
    "notes_goals": "Notes & Goals"
  },
  zh: {
    "search": "搜索",
    "principles": "原则",
    "usage_guide": "使用指南",
    "sign_out": "退出登录",
    "yearly": "年度",
    "monthly": "月度",
    "weekly": "周度",
    "daily": "每日",
    "empty": "空",
    "delete": "删除",
    "direction": "月度方向",
    "task_flow": "任务流",
    "carried_over": "延期任务",
    "today_tasks": "今日任务",
    "creative_thoughts": "创意灵感",
    "habit_tracker": "习惯打卡",
    "notes_goals": "笔记与目标"
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Try to load from localStorage or default to 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved === "en" || saved === "zh") ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
