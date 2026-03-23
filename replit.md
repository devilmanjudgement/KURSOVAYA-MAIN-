# КГУ СПОРТ — Web Application

Платформа записи на спортивные секции КГУ (Кыргызский Государственный Университет). Студенты просматривают и записываются на секции, тренеры управляют секциями и заявками, администратор контролирует всю систему.

## Архитектура

- **Frontend**: React + Vite (порт 5000)
- **Backend**: Express.js (порт 3001)
- **Database**: SQLite via better-sqlite3 (`web-prilojenie/server/kgusport.db`)
- **Workflow**: единый — `node web-prilojenie/server/index.js & cd web-prilojenie && npm run dev`

## Структура проекта

```
web-prilojenie/
  src/
    App.jsx            # Роутинг
    Login.jsx          # Страница входа (без галочки 152-ФЗ)
    Register.jsx       # Регистрация студентов (2 шага + SMS-верификация)
    Home.jsx           # Главная с карточками секций
    Section.jsx        # Страница секции + запись
    BookingConfirm.jsx # Подтверждение записи (реальный пользователь из localStorage)
    Profile.jsx        # Профиль студента/тренера
    TeacherPanel.jsx   # Панель тренера (секции, заявки)
    Schedule.jsx       # Красивое расписание по дням
    ScheduleEdit.jsx   # Редактирование расписания тренером
    SearchPage.jsx     # Поиск секций
    SectionsList.jsx   # Список всех секций
    Chat.jsx           # Мессенджер с эмодзи и прочитанными
    Navbar.jsx         # Навбар с красным бейджем непрочитанных
    AdminPanel.jsx     # Полноэкранная панель администратора
  server/
    index.js           # Полный сервер (API + безопасность + сид)
  vite.config.js       # Прокси /api и /images → localhost:3001
```

## Безопасность

- **Параметризованные SQL-запросы** — защита от SQL-инъекций
- **Санитизация входящих строк** — убирает `< > ' " ; \ \``
- **Rate Limiting** — 10 попыток входа в минуту, 5 регистраций, 5 SMS-кодов
- **Security Headers** — X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Лимит файлов** — 5 МБ, только изображения и PDF
- **Журнал безопасности** — хранит до 200 последних событий в памяти

## Пользователи по умолчанию

| Роль | Логин | Пароль |
|------|-------|--------|
| Администратор | `admin` | `admin123` |
| Тренер | `coach1` | `sport123` |
| Тренер | `coach2` | `sport123` |
| Тренер | `coach3` | `sport123` |
| Студент | `student1` | `pass123` |
| Студент | `student2` | `pass123` |
| Студент | `student3` | `pass123` |
| Студент | `student4` | `pass123` |
| Студент | `student5` | `pass123` |

Сид запускается при пустой БД. При наличии существующей БД без администратора — добавляет только admin.

## API Endpoints

### Авторизация
- `POST /api/login` — вход (rate limit: 10/мин)
- `POST /api/register` — регистрация студента (rate limit: 5/мин)
- `POST /api/auth/send-code` — фейковая отправка SMS (rate limit: 5/мин)
- `POST /api/auth/verify-code` — проверка SMS-кода

### Секции
- `GET /api/sections` — все секции
- `GET /api/sections/:id` — одна секция
- `GET /api/sections/:id/enrolled` — список студентов (GROUP BY, без дублей)
- `POST /api/sections` — создать (multipart)
- `PUT /api/sections/:id` — обновить
- `DELETE /api/sections/:id` — удалить

### Бронирования
- `POST /api/bookings` — создать
- `PUT /api/bookings/:id/status` — изменить статус (pending/approved/cancelled)
- `DELETE /api/bookings/:id` — отменить (→ cancelled)
- `GET /api/teacher/:id/bookings` — заявки тренера
- `GET /api/student/:name/enrollments` — записи студента

### Расписание
- `GET /api/schedule` — всё расписание с деталями
- `POST /api/schedule` — добавить
- `PUT /api/schedule/:id` — изменить
- `DELETE /api/schedule/:id` — удалить

### Мессенджер
- `GET /api/users/coaches` — список тренеров
- `GET /api/users/students` — список студентов
- `GET /api/messages/unread/:userId` — счётчик непрочитанных
- `PUT /api/messages/read/:userId/:senderId` — пометить прочитанными
- `GET /api/messages/:userId/:otherId` — переписка
- `POST /api/messages` — отправить

### Профиль
- `PUT /api/profile/:id` — обновить имя/группу/аватар
- `PUT /api/profile/:id/password` — сменить пароль
- `POST /api/student/:id/healthdoc` — загрузить справку

### Администратор
- `GET /api/admin/stats` — статистика
- `GET /api/admin/users` — все пользователи
- `DELETE /api/admin/users/:id` — удалить пользователя
- `GET /api/admin/bookings` — все бронирования
- `DELETE /api/admin/bookings/:id` — удалить бронирование
- `GET /api/admin/logs` — журнал безопасности

## Известные особенности

- `bookings.user` хранит имя (TEXT), не user_id — исторически сложившийся дизайн
- SMS-верификация фиктивная: код отображается в ответе (`_devCode`) и в консоли сервера
- Тренеры не могут регистрироваться через форму — только через сид или прямой запрос к БД
- Изображения хранятся локально в `web-prilojenie/server/images/`
