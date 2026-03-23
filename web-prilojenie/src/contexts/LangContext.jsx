import React, { createContext, useContext, useState } from "react";

export const T = {
  ru: {
    nav_home: "Домой",
    nav_sections: "Секции",
    nav_schedule: "Расписание",
    nav_chat: "Чат",
    nav_profile: "Профиль",
    login_title: "Вход в систему",
    login_btn: "Войти",
    login_loading: "Вход...",
    no_account: "Нет аккаунта?",
    reg_title: "Регистрация",
    reg_subtitle: "Только для студентов",
    reg_step1: "Шаг 1 из 2 — данные аккаунта",
    reg_step2: "Шаг 2 из 2 — подтверждение",
    reg_send_code: "Получить SMS-код →",
    reg_confirm: "Подтвердить и зарегистрироваться",
    reg_back_login: "← Уже есть аккаунт",
    reg_back_data: "← Изменить данные",
    field_name: "ФИО",
    field_login: "Логин",
    field_password: "Пароль (мин. 6 символов)",
    field_group: "Группа (например гК-31)",
    field_phone: "+996 700 000 000",
    search_placeholder: "🔍 Поиск секции",
    sections_empty: "Секции ещё не созданы",
    sections_not_found: "Ничего не найдено",
    schedule_title: "Расписание",
    schedule_count: "занятий на неделе",
    schedule_empty: "Расписание пока пустое",
    all_sections: "Все секции",
    sections_available: "секций доступно",
    sections_none: "Секций пока нет",
    loading: "Загрузка...",
    logout: "Выйти",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    send: "Отправить",
    attend_title: "Посещаемость",
    attend_mark: "Отметить посещаемость",
    attend_present: "Присутствовал",
    attend_absent: "Отсутствовал",
    attend_save: "Сохранить отметки",
    notif_approved: "Заявка одобрена",
    notif_cancelled: "Заявка отклонена",
    notif_pending: "Новая заявка",
  },
  en: {
    nav_home: "Home",
    nav_sections: "Sections",
    nav_schedule: "Schedule",
    nav_chat: "Chat",
    nav_profile: "Profile",
    login_title: "Sign In",
    login_btn: "Sign In",
    login_loading: "Signing in...",
    no_account: "No account?",
    reg_title: "Register",
    reg_subtitle: "Students only",
    reg_step1: "Step 1 of 2 — account details",
    reg_step2: "Step 2 of 2 — verification",
    reg_send_code: "Get SMS Code →",
    reg_confirm: "Confirm & Register",
    reg_back_login: "← Already have an account",
    reg_back_data: "← Edit details",
    field_name: "Full name",
    field_login: "Username",
    field_password: "Password (min. 6 chars)",
    field_group: "Group (e.g. gK-31)",
    field_phone: "+996 700 000 000",
    search_placeholder: "🔍 Search sections",
    sections_empty: "No sections yet",
    sections_not_found: "Nothing found",
    schedule_title: "Schedule",
    schedule_count: "sessions this week",
    schedule_empty: "Schedule is empty",
    all_sections: "All Sections",
    sections_available: "sections available",
    sections_none: "No sections yet",
    loading: "Loading...",
    logout: "Sign Out",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    send: "Send",
    attend_title: "Attendance",
    attend_mark: "Mark Attendance",
    attend_present: "Present",
    attend_absent: "Absent",
    attend_save: "Save Attendance",
    notif_approved: "Application approved",
    notif_cancelled: "Application rejected",
    notif_pending: "New application",
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ru");

  const toggleLang = () => {
    const next = lang === "ru" ? "en" : "ru";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  const t = (key) => T[lang]?.[key] ?? T.ru[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
