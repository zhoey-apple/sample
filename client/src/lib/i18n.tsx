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
    "notes_goals": "Notes & Goals",
    
    // Login
    "login_title": "Life Principles Diary",
    "login_subtitle": "A structured system for continuity and growth.",
    "email_label": "Email Address",
    "enter_diary": "Enter Diary",
    "login_footer": "Simple email login. No password required for this MVP.",

    // Principles
    "principles_title": "Life Principles",
    "principles_subtitle": "The foundation of all your plans. Review often.",
    "save_changes": "Save Changes",
    "saved": "Saved",
    "principles_placeholder": "# Write your principles here...",

    // Onboarding
    "welcome_title": "Welcome to your Life Diary",
    "welcome_desc": "This system is designed to align your daily actions with your life principles and long-term goals.",
    "step_foundation": "Foundation",
    "step_foundation_desc": "Start by defining your Core Principles and Yearly Goals. These guide everything else.",
    "step_foundation_action": "Create Principles & Year Plan",
    "step_monthly": "Monthly Direction",
    "step_monthly_desc": "Break down your yearly goals into actionable monthly initiatives.",
    "step_monthly_action": "Create Monthly Plan",
    "step_weekly": "Weekly Focus",
    "step_weekly_desc": "Plan your week to align with your monthly direction.",
    "step_weekly_action": "Create Weekly Plan",
    "step_daily": "Daily Execution",
    "step_daily_desc": "Execute on your tasks day by day, guided by your higher-level plans.",
    "step_daily_action": "Create Daily Plan",
    "dont_show_again": "Don't show this again",
    "back": "Back",
    "next_step": "Next Step",
    "finish_guide": "Finish Guide",

    // Daily Plan
    "yesterday": "Yesterday",
    "today": "Today",
    "tomorrow": "Tomorrow",
    "monthly_direction": "Monthly Direction",
    "yearly_goals": "Yearly Goals",
    "unfinished_tasks_header": "Unfinished Tasks from Yesterday",
    "from_yesterday": "From yesterday",
    "linked": "Linked",
    "new_task_placeholder": "New task...",
    "goals_vision": "Goals & Vision",
    "reflection_initiatives": "Reflection & Initiatives",
    "notes_ideas": "Notes & Ideas",
    "view_month_plan": "View Month Plan",
    "create_month_plan": "Create Monthly Plan",
    "create_year_plan": "Create Yearly Plan",
    "plan_not_created": "Plan not created",
    "annual_plan": "Annual Plan",

    // Tooltips
    "tooltip_monthly_direction": "Align your day with your monthly goals. Edited in the Monthly Plan.",
    "tooltip_yearly_goals": "Align your month with your yearly vision. Edited in the Yearly Plan.",
    "tooltip_task_flow": "Your daily execution list. Use Tab to indent tasks.",
    "tooltip_notes": "Free-form space for reflection, ideas, and detailed planning.",
    "tooltip_habits": "Track up to 2 key habits to build consistency.",

    // Cover Selection
    "choose_companion": "Choose your companion for",
    "your_companion": "Your companion for",
    "the_journey": "The Journey",
    "diary": "Diary",
    "select": "Select",
    "selected": "Selected",
    "preparing_space": "Preparing your space...",
    "explore_cursor": "Move cursor to explore",
    
    // Placeholders
    "set_monthly_direction": "Set monthly direction...",
    "set_yearly_goals": "Set yearly goals...",
    "start_typing": "Start typing..."
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
    "notes_goals": "笔记与目标",

    // Login
    "login_title": "人生原则日记",
    "login_subtitle": "一个注重连续性与成长的结构化系统。",
    "email_label": "邮箱地址",
    "enter_diary": "进入日记",
    "login_footer": "简单邮箱登录。MVP版本无需密码。",

    // Principles
    "principles_title": "人生原则",
    "principles_subtitle": "所有计划的基石。请经常回顾。",
    "save_changes": "保存更改",
    "saved": "已保存",
    "principles_placeholder": "# 在此写下你的原则...",

    // Onboarding
    "welcome_title": "欢迎来到你的人生日记",
    "welcome_desc": "本系统旨在将你的日常行动与人生原则及长期目标保持一致。",
    "step_foundation": "基石",
    "step_foundation_desc": "首先定义你的核心原则和年度目标。它们指引一切。",
    "step_foundation_action": "创建原则与年度计划",
    "step_monthly": "月度方向",
    "step_monthly_desc": "将年度目标分解为可执行的月度举措。",
    "step_monthly_action": "创建月度计划",
    "step_weekly": "周度聚焦",
    "step_weekly_desc": "规划每周安排，以与月度方向保持一致。",
    "step_weekly_action": "创建周度计划",
    "step_daily": "每日执行",
    "step_daily_desc": "在更高层级计划的指引下，逐日执行任务。",
    "step_daily_action": "创建每日计划",
    "dont_show_again": "不再显示",
    "back": "上一步",
    "next_step": "下一步",
    "finish_guide": "完成指南",

    // Daily Plan
    "yesterday": "昨天",
    "today": "今天",
    "tomorrow": "明天",
    "monthly_direction": "月度方向",
    "yearly_goals": "年度目标",
    "unfinished_tasks_header": "昨日未完成任务",
    "from_yesterday": "来自昨天",
    "linked": "已关联",
    "new_task_placeholder": "新任务...",
    "goals_vision": "目标与愿景",
    "reflection_initiatives": "反思与举措",
    "notes_ideas": "笔记与想法",
    "view_month_plan": "查看月度计划",
    "create_month_plan": "创建月度计划",
    "create_year_plan": "创建年度计划",
    "plan_not_created": "暂未创建对应的计划",
    "annual_plan": "年度计划",

    // Tooltips
    "tooltip_monthly_direction": "让每一天与月度目标保持一致。在月度计划中编辑。",
    "tooltip_yearly_goals": "让每一月与年度愿景保持一致。在年度计划中编辑。",
    "tooltip_task_flow": "你的每日执行清单。使用 Tab 键缩进任务。",
    "tooltip_notes": "用于反思、记录想法和详细规划的自由空间。",
    "tooltip_habits": "追踪最多2个关键习惯，建立一致性。",

    // Cover Selection
    "choose_companion": "选择你的伙伴",
    "your_companion": "你的伙伴",
    "the_journey": "旅程",
    "diary": "日记",
    "select": "选择",
    "selected": "已选择",
    "preparing_space": "正在准备空间...",
    "explore_cursor": "移动光标探索",

    // Placeholders
    "set_monthly_direction": "设定月度方向...",
    "set_yearly_goals": "设定年度目标...",
    "start_typing": "开始输入..."
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
