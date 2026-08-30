/**
 * Реестр текстов консоли — ключи `console.*` с русскими значениями по умолчанию.
 *
 * Единственный источник UI-строк видимых разделов панели: компоненты получают
 * тексты через `t()` (или хук `useConsoleText`), а не через строковые литералы.
 * Словарь переводов проекта может переопределить любой ключ: плоская выдача
 * словаря по локали оператора отбирается по префиксу `console.` и накладывается
 * поверх реестра. Отсутствие ключа в словаре означает значение по умолчанию,
 * а не пустую строку; недоступность словаря панель не замечает.
 *
 * Кэш переопределений живёт в localStorage под ключом
 * `console_texts:<локаль>:<версия>` и инвалидируется по
 * `bootstrap.translations_version` (загрузка — `data-source/console-overrides.ts`).
 */

export const CONSOLE_TEXTS = {
  // Общие действия и состояния
  "console.common.cancel": "Отмена",
  "console.common.close": "Закрыть",
  "console.common.save": "Сохранить",
  "console.common.delete": "Удалить",
  "console.common.edit": "Изменить",
  "console.common.create": "Создать",
  "console.common.loading": "Загрузка…",
  "console.common.actions": "Действия",
  "console.common.breadcrumb-admin": "Админпанель",

  // Навигация: группы, пункты меню, быстрые действия
  "console.nav.group.overview": "Обзор",
  "console.nav.group.content": "Контент",
  "console.nav.group.payments": "Оплата",
  "console.nav.group.workspace": "Рабочее пространство",
  "console.nav.quick-actions": "Быстрые действия",
  "console.nav.dashboard": "Дашборд",
  "console.nav.categories": "Категории",
  "console.nav.customers": "Клиенты",
  "console.nav.blogs": "Блог",
  "console.nav.research": "Ресёрч",
  "console.nav.instructs": "Инструкции",
  "console.nav.seo": "SEO",
  "console.nav.cities": "Города",
  "console.nav.payments": "Транзакции оплат",
  "console.nav.subscriptions": "Подписки",
  "console.nav.plans": "Тарифные планы",
  "console.nav.license-plans": "Тарифные планы лицензий",
  "console.nav.licenses": "Лицензии",
  "console.nav.organizations": "Организации",
  "console.nav.releases": "Релизы",
  "console.nav.team": "Команда",
  "console.nav.settings": "Настройки",
  // Фоновые задачи проекта: индикатор в панели и состояние по месту
  "console.tasks.title": "Фоновые задачи",
  "console.tasks.subtitle": "Что платформа делает прямо сейчас и чем закончились последние работы.",
  "console.tasks.indicator": "Задачи ({count})",
  "console.tasks.empty": "Выполняющихся задач нет.",
  "console.tasks.state.queued": "Принята",
  "console.tasks.state.running": "Выполняется",
  "console.tasks.state.succeeded": "Готово",
  "console.tasks.state.failed": "Отклонена",
  "console.tasks.kind.post_generation": "Написание поста",
  "console.tasks.kind.post_rebuild": "Пересборка поста",
  "console.tasks.kind.research": "Исследование",
  "console.tasks.kind.research_indexing": "Индексация исследования",
  "console.tasks.kind.project_buildout": "Сборка проекта",
  "console.tasks.kind.media_import": "Импорт медиа",
  "console.tasks.kind.seo_rebuild": "Пересборка SEO",
  "console.tasks.kind.city_seo_adaptation": "Адаптация SEO городов",
  "console.tasks.stage.preparing": "Подготовка темы",
  "console.tasks.stage.ai_request": "Запрос к ИИ",
  "console.tasks.stage.assembling": "Сборка блоков",
  "console.tasks.stage.saving": "Сохранение",
  "console.tasks.stage.starting": "Подготовка",
  "console.tasks.stage.searching": "Поиск источников",
  "console.tasks.stage.writing": "Сборка текста",
  "console.tasks.stage.completed": "Завершение",
  "console.tasks.stage.embedding": "Векторизация материалов",
  "console.tasks.stage.downloading": "Скачивание файла",
  "console.tasks.stage.categories": "Создание категорий",
  "console.tasks.stage.project_profile": "Профиль проекта",
  "console.tasks.subject.post": "Пост",
  "console.tasks.subject.topic": "Тема",
  "console.tasks.subject.research": "Исследование",
  "console.tasks.subject.buildout": "Сборка",
  "console.tasks.subject.url": "Ссылка",
  "console.tasks.failed-hint": "Задачу можно запустить заново.",
  // Карточка проекта на дашборде
  "console.project.title": "Проект",
  "console.project.id": "Идентификатор",
  "console.project.name": "Название",
  "console.project.description": "Описание",
  "console.project.dialog.title": "Проект",
  "console.project.dialog.subtitle":
    "Текущий проект, его последние события и переход в другой проект.",
  "console.project.dialog.current": "Текущий",
  "console.project.dialog.only-one": "Других проектов у вас пока нет.",
  "console.project.dialog.events": "Последние события",
  "console.project.dialog.events-empty": "Событий в проекте пока нет.",
  "console.project.switch.failed": "Не удалось перейти в выбранный проект.",
  "console.project.create.action": "Новый проект",
  "console.project.create.title": "Новый проект",
  "console.project.create.subtitle":
    "Введите название — ключ проекта платформа выведет сама. Проект будет пустым, а вы станете его владельцем.",
  "console.project.create.name-required": "Введите название проекта",
  "console.project.create.failed": "Не удалось создать проект.",
  "console.project.description-empty": "Описание проекта не заполнено",
  "console.project.copy-id": "Скопировать идентификатор",
  "console.project.save": "Сохранить",
  "console.project.saved": "Изменения сохранены",
  "console.project.build": "Собрать проект по AI",
  "console.project.build-description":
    "AI заполнит описание проекта и соберёт дерево категорий по тематике.",
  "console.project.build-topic-placeholder": "например: автомобили",
  "console.project.build-running": "Сборка идёт…",
  "console.project.build-done": "Сборка завершена",
  "console.project.build-failed": "Сборка не удалась",
  "console.project.build-categories": "Создано категорий",

  // Ресёрч
  "console.research.title": "Ресёрч",
  "console.research.subtitle": "Сбор материалов по теме и темы для постов",
  "console.research.new": "Новое исследование",
  "console.research.query": "Запрос",
  "console.research.query-placeholder": "например: Расскажи про топ 10 автомобилей",
  "console.research.start": "Запустить",
  "console.research.cancel": "Отменить",
  "console.research.status": "Состояние",
  "console.research.sources": "Источники",
  "console.research.summary": "Сводный материал",
  "console.research.empty": "Исследований пока нет",
  "console.research.filter-all": "Все",
  "console.research.topics": "Темы",
  "console.research.extract-topics": "Извлечь темы",
  "console.research.topics-empty": "Темы ещё не извлечены",
  "console.research.write-post": "Написать пост",
  "console.research.reject-topic": "Отклонить",
  "console.research.topic-category": "Категория",
  "console.research.open-post": "Открыть пост",
  "console.research.back": "К списку исследований",
  "console.research.new-subtitle":
    "Платформа соберёт материалы по запросу и предложит темы для постов.",
  "console.research.empty-hint": "Запустите первое исследование — материалы появятся здесь.",
  "console.research.sources-hint": "Страницы, из которых собран материал исследования.",
  "console.research.topics-hint": "Темы будущих постов, выведенные из собранного материала.",
  "console.research.status.process": "В работе",
  "console.research.status.done": "Завершено",
  "console.research.status.failed": "Ошибка",
  "console.research.status.canceled": "Отменено",

  // Инструкции
  "console.instructs.title": "Инструкции",
  "console.instructs.subtitle": "Правила генерации и схема ответа модели",
  "console.instructs.new": "Новая инструкция",
  "console.instructs.name": "Название",
  "console.instructs.category": "Категория",
  "console.instructs.rule": "Правило",
  "console.instructs.schema": "Схема ответа (JSON)",
  "console.instructs.schema-invalid": "Схема не является корректным JSON",
  "console.instructs.published": "Опубликована",
  "console.instructs.system": "Предустановленная",
  "console.instructs.own": "Своя",
  "console.instructs.applied": "Применяется",
  "console.instructs.read-only": "Предустановленная инструкция доступна только для чтения",
  "console.instructs.duplicate": "Создать свою на её основе",
  "console.instructs.save": "Сохранить",
  "console.instructs.cancel": "Отмена",
  "console.instructs.delete": "Удалить",
  "console.instructs.empty": "Инструкций пока нет",
  "console.instructs.filter-all": "Все категории",
  "console.instructs.form.details": "Данные инструкции",
  "console.instructs.form.details-hint":
    "Название, категория генерации и правило, по которому модель пишет ответ.",
  "console.instructs.delete.title": "Удалить инструкцию",
  "console.instructs.delete.question": "Удалить инструкцию «{name}»? Действие нельзя отменить.",
  "console.instructs.schema.preset": "Пресет полей",
  "console.instructs.schema.preset-apply": "Применить пресет",
  "console.instructs.schema.preset-replace-title": "Заменить поля схемы",
  "console.instructs.schema.preset-replace-question":
    "Пресет «{name}» заменит уже заданные поля схемы. Продолжить?",
  "console.instructs.schema.add-field": "Добавить поле",
  "console.instructs.schema.remove-field": "Убрать поле",
  "console.instructs.schema.empty": "Полей пока нет — добавьте первое или примените пресет.",
  "console.instructs.schema.too-complex":
    "Схема сложнее редактора полей — она открыта в режиме JSON.",
  "console.instructs.schema.field-name": "Имя поля",
  "console.instructs.schema.field-type": "Тип",
  "console.instructs.schema.field-description": "Назначение",
  "console.instructs.schema.field-required": "Обязательное",
  "console.instructs.schema.type-string": "Строка",
  "console.instructs.schema.type-number": "Число",
  "console.instructs.schema.type-boolean": "Да/нет",
  "console.instructs.schema.type-object": "Объект",
  "console.instructs.schema.type-array": "Список",
  "console.quick-actions.invite-teammate": "Пригласить участника",

  // Роли операторов
  "console.role.admin": "Администратор",
  "console.role.manager": "Менеджер",
  "console.role.staff": "Сотрудник",

  // Топбар и футер
  "console.topbar.expand-sidebar": "Развернуть меню",
  "console.topbar.collapse-sidebar": "Свернуть меню",
  "console.topbar.sign-out": "Выйти",
  "console.topbar.signed-out": "Вы вышли из системы",
  "console.topbar.sign-out-failed": "Не удалось выйти. Попробуйте ещё раз.",
  "console.footer.system-healthy": "Система работает",

  // Экран входа
  "console.login.title": "Вход в консоль",
  "console.login.subtitle":
    "Введите свои данные, чтобы войти в консоль управления.",
  "console.login.email-label": "Рабочий email",
  "console.login.password-label": "Пароль",
  "console.login.password-placeholder": "Введите пароль",
  "console.login.show-password": "Показать пароль",
  "console.login.hide-password": "Скрыть пароль",
  "console.login.forgot-password": "Забыли пароль?",
  "console.login.remember-me": "Оставаться в системе 30 дней",
  "console.login.submit": "Войти",
  "console.login.submitting": "Входим…",
  "console.login.welcome": "С возвращением, {name}",
  "console.login.failed": "Не удалось войти. Проверьте email и пароль.",
  "console.login.need-account": "Нужен доступ?",
  "console.login.request-access": "Запросить доступ",
  "console.login.email-required": "Введите рабочий email.",
  "console.login.email-invalid": "Введите корректный email.",
  "console.login.password-min": "Пароль должен быть не короче 8 символов.",
  "console.login.showcase-tagline": "Консоль управления",
  "console.login.showcase-badge": "Мультибрендовая beauty-платформа",
  "console.login.showcase-title":
    "Управляйте всеми брендами из одного спокойного пространства.",
  "console.login.showcase-subtitle":
    "Каталоги, заказы, акции и аналитика — с ясностью, которую заслуживает ваша команда.",
  "console.login.metric-brands": "Бьюти-брендов",
  "console.login.metric-skus": "SKU под управлением",
  "console.login.metric-uptime": "Uptime SLA",
  "console.login.showcase-compliance":
    "Инфраструктура соответствует SOC 2 Type II",

  // Дашборд
  "console.dashboard.eyebrow": "Обзор",
  "console.dashboard.greeting": "Здравствуйте, {name}",
  "console.dashboard.greeting-generic": "Здравствуйте",
  "console.dashboard.subtitle":
    "Ключевые показатели проекта за выбранный период.",
  "console.dashboard.export": "Экспорт",
  "console.dashboard.range-7d": "Последние 7 дней",
  "console.dashboard.range-30d": "Последние 30 дней",
  "console.dashboard.range-90d": "Последние 90 дней",
  "console.dashboard.range-year": "Этот год",
  "console.dashboard.kpi-revenue": "Выручка",
  "console.dashboard.kpi-payments": "Платежи",
  "console.dashboard.kpi-average-payment": "Средний чек",
  "console.dashboard.kpi-customers": "Пользователи",
  "console.dashboard.kpi-vs-prior": "к предыдущим 30 дням",
  "console.dashboard.revenue-title": "Обзор выручки",
  "console.dashboard.revenue-subtitle": "динамика к предыдущему периоду",
  "console.dashboard.this-period": "Текущий период",
  "console.dashboard.prior-period": "Предыдущий период",
  "console.dashboard.legend-current": "Текущий",
  "console.dashboard.legend-previous": "Предыдущий",
  "console.dashboard.tab-revenue": "Выручка",
  "console.dashboard.tab-orders": "Платежи",
  "console.dashboard.tab-aov": "Средний чек",
  "console.dashboard.recent-posts": "Свежие материалы",
  "console.dashboard.recent-posts-subtitle": "Последние публикации проекта",
  "console.dashboard.recent-posts-empty": "Публикаций пока нет.",
  "console.dashboard.view-all": "Смотреть все",
  "console.dashboard.top-pages": "Топ страниц",
  "console.dashboard.top-pages-subtitle": "Самые посещаемые страницы за период",
  "console.dashboard.top-pages-empty": "Данных за период нет.",
  "console.dashboard.column.title": "Заголовок",
  "console.dashboard.column.status": "Статус",
  "console.dashboard.column.published": "Опубликован",
  "console.dashboard.column.page": "Страница",
  "console.dashboard.column.hits": "Просмотры",
  "console.dashboard.column.sessions": "Сессии",

  // Статусы постов
  "console.post-status.draft": "Черновик",
  "console.post-status.scheduled": "Запланирован",
  "console.post-status.published": "Опубликован",
  "console.post-status.archived": "В архиве",

  // Блог: список, карточки, фильтры
  "console.blogs.subtitle":
    "Публикация материалов, руководств и статей проекта.",
  "console.blogs.new-article": "Новая статья",
  "console.blogs.stats.published": "Опубликованные статьи",
  "console.blogs.stats.categories": "Рубрики",
  "console.blogs.stats.authors": "Авторы",
  "console.blogs.stats.avg-read": "Среднее время чтения",
  "console.blogs.minutes": "{count} мин",
  "console.blogs.featured-badge": "Выбор редакции",
  "console.blogs.read-article": "Читать статью",
  "console.blogs.preview": "Предпросмотр",
  "console.blogs.open-article": "Открыть статью: {title}",
  "console.blogs.search-placeholder": "Поиск по статьям, авторам и тегам…",
  "console.blogs.filter.all-statuses": "Все статусы",
  "console.blogs.filter.all-categories": "Все рубрики",
  "console.blogs.empty-filtered": "Нет статей, подходящих под фильтры.",
  "console.blogs.footer-unit": "статей",

  // Блог: формы создания и редактирования
  "console.blogs.back": "Назад к блогу",
  "console.blogs.autofill": "Автозаполнение",
  "console.blogs.loading-article": "Загружаем статью…",
  "console.blogs.not-found-title": "Статья не найдена",
  "console.blogs.not-found-description": "Статья «{slug}» не найдена в блоге.",
  "console.blogs.form.save": "Сохранить статью",
  "console.blogs.form.save-changes": "Сохранить изменения",
  "console.blogs.form.publishing": "Публикуем…",
  "console.blogs.form.saving": "Сохраняем…",
  "console.blogs.form.edit-title": "Редактирование статьи",
  "console.blogs.form.basics-title": "Основное о статье",
  "console.blogs.form.basics-subtitle":
    "Заголовок, подводка и то, как читатели найдут материал.",
  "console.blogs.form.title-label": "Заголовок",
  "console.blogs.form.subtitle-label": "Подзаголовок",
  "console.blogs.form.category-label": "Рубрика",
  "console.blogs.form.category-aria": "Рубрика статьи",
  "console.blogs.form.tags-label": "Теги",
  "console.blogs.form.tags-hint": "через запятую",
  "console.blogs.form.tags-placeholder": "уход, руководство, сыворотка",
  "console.blogs.form.project-categories": "Категории проекта",
  "console.blogs.form.block-title": "Название блока",
  "console.blogs.form.block-text": "Текст блока",
  "console.blogs.form.block-text-placeholder": "Текст в markdown: ## заголовок, **жирный**, списки",
  "console.blogs.form.blocks-empty": "Блоков пока нет — добавьте первый.",
  "console.blogs.form.media-title": "Медиа",
  "console.blogs.form.media-subtitle": "Обложки для сетки блога и шапки статьи",
  "console.blogs.form.thumbnail-label": "Миниатюра",
  "console.blogs.form.thumbnail-upload": "Загрузите миниатюру",
  "console.blogs.form.thumbnail-hint":
    "Квадратное изображение для карточек в сетке блога",
  "console.blogs.form.banner-label": "Баннер",
  "console.blogs.form.banner-upload": "Загрузите баннер",
  "console.blogs.form.banner-hint": "Широкое изображение для шапки статьи",
  "console.blogs.form.content-title": "Содержимое",
  "console.blogs.form.content-subtitle":
    "Соберите материал из заголовков, абзацев, цитат и изображений.",
  "console.blogs.form.add-block": "Добавить блок",
  "console.blogs.form.remove-block": "Удалить блок",
  "console.blogs.form.publish-title": "Параметры публикации",
  "console.blogs.form.reading-time": "Время чтения (мин)",
  "console.blogs.form.layout-label": "Стиль оформления",
  "console.blogs.form.layout.minimalist": "Минималистичный",
  "console.blogs.form.layout.editorial": "Редакционный",
  "console.blogs.form.layout.botanical": "Ботанический",
  "console.blogs.form.category.rituals": "Ритуалы",
  "console.blogs.form.category.ingredients": "Ингредиенты",
  "console.blogs.form.category.science": "Наука",
  "console.blogs.form.category.wellness": "Здоровье",
  "console.blogs.form.category.trends": "Тренды",

  "console.blogs.form.featured": "Закрепить сверху раздела",

  // Блог: пересборка поста через AI (режим api)
  "console.blogs.rebuild.title": "Пересборка через AI",
  "console.blogs.rebuild.description":
    "Заголовок, содержимое и SEO будут написаны заново по материалам базы знаний. Адрес, категории, теги, изображения и статус останутся прежними.",
  "console.blogs.rebuild.action": "Пересобрать через AI",
  "console.blogs.rebuild.confirm-title": "Пересобрать пост через AI?",
  "console.blogs.rebuild.confirm": "Пересобрать",
  "console.blogs.rebuild.cancel": "Отмена",
  "console.blogs.rebuild.started": "Пересборка запущена.",
  "console.blogs.rebuild.start-failed": "Не удалось запустить пересборку.",
  "console.blogs.rebuild.finished": "Пост пересобран.",

  // Блог: статус-машина поста и ревизии (режим api)
  "console.blogs.lifecycle.title": "Статус поста",
  "console.blogs.lifecycle.publish": "Опубликовать",
  "console.blogs.lifecycle.archive": "Архивировать",
  "console.blogs.lifecycle.to-draft": "Вернуть в черновик",
  "console.blogs.lifecycle.status-changed": "Статус поста: {status}.",
  "console.blogs.lifecycle.action-failed":
    "Не удалось выполнить действие «{action}».",
  "console.blogs.lifecycle.revisions": "Ревизии",
  "console.blogs.lifecycle.restore": "Восстановить",
  "console.blogs.lifecycle.revision-restored": "Версия {number} восстановлена.",
  "console.blogs.lifecycle.restore-failed": "Не удалось восстановить версию.",
  "console.blogs.lifecycle.revision-label": "Версия {number}",
  "console.blogs.lifecycle.revision-delete": "Удалить",
  "console.blogs.lifecycle.revision-delete-title": "Удалить версию {number}?",
  "console.blogs.lifecycle.revision-delete-description":
    "Версия исчезнет из истории поста. Сам пост не изменится.",
  "console.blogs.lifecycle.revision-delete-confirm": "Удалить версию",
  "console.blogs.lifecycle.revision-delete-cancel": "Отмена",
  "console.blogs.lifecycle.revision-deleted": "Версия {number} удалена.",
  "console.blogs.lifecycle.revision-delete-failed": "Не удалось удалить версию.",

  // Блог: валидация формы статьи
  "console.blogs.validation.title-min":
    "Заголовок должен быть не короче 4 символов.",
  "console.blogs.validation.subtitle-min":
    "Подзаголовок должен быть не короче 4 символов.",
  "console.blogs.validation.category-required": "Выберите рубрику.",
  "console.blogs.validation.reading-time-min":
    "Время чтения — не менее 1 минуты.",
  "console.blogs.validation.block-content-required":
    "Заполните содержимое блока.",

  // Блог: уведомления операций
  "console.blogs.toast.deleted": "Статья «{title}» удалена.",
  "console.blogs.toast.delete-failed": "Не удалось удалить статью.",
  "console.blogs.toast.created": "Статья сохранена как черновик.",
  "console.blogs.toast.create-failed": "Не удалось создать статью.",
  "console.blogs.toast.updated": "Статья обновлена.",
  "console.blogs.toast.update-failed": "Не удалось обновить статью.",

  // Категории: список и операции
  "console.categories.subtitle":
    "Управляйте деревом категорий проекта, иерархией и SEO-параметрами.",
  "console.categories.export": "Экспорт",
  "console.categories.export-started": "Генерируем PDF-отчёт по категориям…",
  "console.categories.export-empty":
    "Пока нечего экспортировать: категорий нет.",
  "console.categories.add": "Добавить категорию",
  "console.categories.add-subtitle":
    "Создайте новый узел таксономии: задайте иерархию, оформление и SEO.",
  "console.categories.save": "Сохранить категорию",
  "console.categories.saving": "Сохраняем…",
  "console.categories.saving-ellipsis": "Сохраняем…",
  "console.categories.back": "Назад к категориям",
  "console.categories.search-placeholder":
    "Поиск категорий по имени или слагу…",
  "console.categories.filter.status": "Статус",
  "console.categories.filter.all-statuses": "Все статусы",
  "console.categories.status.active": "Активные",
  "console.categories.status.draft": "Черновики",
  "console.categories.status.archived": "В архиве",
  "console.categories.empty-filtered": "Нет категорий, подходящих под фильтры.",
  "console.categories.footer-unit": "категорий",
  "console.categories.bulk-selected": "Выбрано категорий:",
  "console.categories.move.menu": "Переместить…",
  "console.categories.delete": "Удалить категорию",
  "console.categories.move.title": "Переместить категорию",
  "console.categories.move.subtitle":
    "Выберите нового родителя для «{name}». Подкатегории переедут вместе с категорией.",
  "console.categories.move.parent-label": "Новый родитель",
  "console.categories.move.root": "Без родителя (корень)",
  "console.categories.move.moving": "Перемещаем…",
  "console.categories.move.submit": "Переместить категорию",

  // Категории: таблица и диалог удаления
  "console.categories.column.name": "Категория",
  "console.categories.column.slug": "Слаг",
  "console.categories.column.status": "Статус",
  "console.categories.column.children": "Вложенных категорий",
  "console.categories.card.children": "Вложенных категорий",
  "console.categories.card.no-description": "Описание не задано.",
  "console.categories.delete.title": "Удалить категорию",
  "console.categories.delete.title-bulk": "Удалить категории: {count}",
  "console.categories.delete.question": "Удалить категорию «{name}»?",
  "console.categories.delete.question-plain": "Удалить эту категорию?",
  "console.categories.delete.question-bulk":
    "Будут безвозвратно удалены выбранные категории ({count}) и всё их вложенное дерево.",
  "console.categories.delete.subtree-note":
    "Вложенные категории ({count}) удалятся вместе с ней.",
  "console.categories.delete.posts-note":
    "Материалы сохранятся — они лишь потеряют привязку к удалённым категориям.",
  "console.categories.delete.irreversible": "Действие нельзя отменить.",
  "console.categories.delete.confirm": "Удалить",
  "console.categories.delete.paths-label": "Полные пути удаляемых категорий:",
  "console.categories.delete.done": "Категория «{name}» удалена.",
  "console.categories.delete.done-bulk": "Удалено категорий: {count}.",
  "console.categories.delete.failed": "Не удалось удалить категорию.",
  "console.categories.move.done": "Категория «{name}» перемещена.",
  "console.categories.move.failed": "Не удалось переместить категорию.",

  // Подбор изображения материала
  "console.images.title": "Подбор изображения",
  "console.images.subtitle":
    "Найдите изображение по запросу и выберите подходящее — оно попадёт в медиатеку проекта.",
  "console.images.query-placeholder": "например: красный седан на трассе",
  "console.images.search": "Найти",
  "console.images.pick": "Подобрать изображение",
  "console.images.hint": "Введите запрос и нажмите «Найти».",
  "console.images.empty": "По запросу ничего не найдено.",
  "console.images.source-unknown": "Источник неизвестен",
  "console.images.search-failed": "Не удалось выполнить поиск изображений.",
  "console.images.import-failed": "Не удалось перенести изображение в медиатеку проекта.",
  "console.images.upload-failed": "Не удалось загрузить изображение.",
  "console.images.placeholder": "Обложка не задана",

  // Категории: очистка каталога — отдельное опасное действие
  "console.categories.purge.action": "Удалить все категории",
  "console.categories.purge.title": "Удалить все категории проекта",
  "console.categories.purge.question":
    "Будут безвозвратно удалены все категории проекта ({count}) вместе со всем деревом.",
  "console.categories.purge.acknowledge":
    "Понимаю: весь каталог категорий проекта будет удалён.",
  "console.categories.purge.confirm": "Удалить весь каталог",
  "console.categories.purge.done": "Каталог категорий очищен.",

  // Категории: форма
  "console.categories.form.details": "Данные категории",
  "console.categories.form.details-hint":
    "Как категория называется и отображается в каталоге материалов.",
  "console.categories.form.name": "Название категории",
  "console.categories.form.name-default":
    "Название категории ({locale} · по умолчанию)",
  "console.categories.form.name-locale": "Название категории ({locale})",
  "console.categories.form.name-placeholder": "например, Аналитика рынка",
  "console.categories.form.name-locale-placeholder":
    "Пусто — будет использовано название на локали по умолчанию",
  "console.categories.form.slug": "Слаг",
  "console.categories.form.slug-placeholder": "например, analitika-rynka",
  "console.categories.form.slug-manual": "Ввести вручную",
  "console.categories.form.slug-auto": "Синхронизировать",
  "console.categories.form.description": "Описание",
  "console.categories.form.description-placeholder": "Опишите категорию…",
  "console.categories.form.status": "Статус",
  "console.categories.form.parent": "Родительская категория",
  "console.categories.form.visual-title": "Внешний вид",
  "console.categories.form.visual-subtitle":
    "Выберите обложку, градиент и иконку категории.",
  "console.categories.form.visual-design": "Оформление",
  "console.categories.form.thumbnail": "Миниатюра (1:1)",
  "console.categories.form.thumbnail-placeholder":
    "Загрузите миниатюру категории",
  "console.categories.form.thumbnail-hint":
    "Квадратная обложка для карточки категории (1:1).",
  "console.categories.form.gradient-preset": "Градиент обложки",
  "console.categories.form.icon": "Иконка категории",
  "console.categories.form.display-order": "Порядок отображения",
  "console.categories.preview.title": "Живой предпросмотр",
  "console.categories.preview.subtitle":
    "Так карточка категории будет выглядеть на витрине.",
  "console.categories.preview.name-placeholder": "Название категории",

  // Категории: редактирование и уведомления
  "console.categories.edit.title": "Редактирование категории: {name}",
  "console.categories.edit.breadcrumb": "Редактирование «{name}»",
  "console.categories.edit.breadcrumb-plain": "Редактирование категории",
  "console.categories.edit.subtitle":
    "Измените название, положение в дереве и оформление категории.",
  "console.categories.edit.sticky-title": "Редактирование «{name}»",
  "console.categories.edit.save": "Сохранить изменения",
  "console.categories.not-found.title": "Категория не найдена",
  "console.categories.not-found.text":
    "Категория с идентификатором «{id}» не найдена: возможно, она удалена.",
  "console.categories.toast.created": "Категория «{name}» создана.",
  "console.categories.toast.create-failed": "Не удалось создать категорию.",
  "console.categories.toast.updated": "Категория «{name}» обновлена.",
  "console.categories.toast.update-failed": "Не удалось обновить категорию.",
  "console.categories.toast.not-found": "Категория не найдена.",

  // Категории: сообщения валидации формы
  "console.categories.validation.name-min":
    "Название категории — минимум 2 символа.",
  "console.categories.validation.slug-min": "Слаг — минимум 2 символа.",
  "console.categories.validation.slug-format":
    "Слаг может содержать только строчные латинские буквы, цифры и дефисы.",
  "console.categories.validation.icon-required": "Выберите иконку.",
  "console.categories.validation.thumbnail-required":
    "Загрузите обложку категории.",
  "console.categories.validation.hex-color":
    "Укажите корректный HEX-код цвета.",
  "console.categories.validation.display-order-min":
    "Порядок отображения — минимум 1.",

  // Клиенты: заголовок раздела, панель и экспорт
  "console.customers.title": "Клиенты",
  "console.customers.subtitle":
    "Пользователи проекта: профили, статусы и блокировки.",
  "console.customers.export": "Экспорт клиентов",
  "console.customers.search-placeholder":
    "Поиск по имени, email или предпочтениям…",
  "console.customers.footer-unit": "клиентов",
  "console.customers.empty-filtered": "Нет клиентов, подходящих под фильтры.",
  "console.customers.bulk-selected": "Выбрано клиентов: {count}",
  "console.customers.orders-count": "Заказов: {count}",

  // Клиенты: фильтры списка
  "console.customers.filter.all-tiers": "Все уровни",
  "console.customers.filter.skin-type": "Тип кожи",
  "console.customers.filter.all-skin-types": "Все типы кожи",
  "console.customers.filter.skin-concern": "Запрос",
  "console.customers.filter.all-concerns": "Все запросы",

  // Клиенты: уровни лояльности, типы кожи и запросы
  "console.customers.tier.bronze": "Бронза",
  "console.customers.tier.silver": "Серебро",
  "console.customers.tier.gold": "Золото",
  "console.customers.tier.platinum": "Платина",
  "console.customers.skin-type.dry": "Сухая",
  "console.customers.skin-type.oily": "Жирная",
  "console.customers.skin-type.sensitive": "Чувствительная",
  "console.customers.skin-type.combination": "Комбинированная",
  "console.customers.skin-type.normal": "Нормальная",
  "console.customers.concern.acne": "Акне",
  "console.customers.concern.aging": "Возрастные изменения",
  "console.customers.concern.hydration": "Увлажнение",
  "console.customers.concern.redness": "Покраснения",
  "console.customers.concern.brightening": "Выравнивание тона",

  // Клиенты: колонки таблицы и действия в строке
  "console.customers.column.id": "ID клиента",
  "console.customers.column.name": "Клиент",
  "console.customers.column.tier": "Уровень лояльности",
  "console.customers.column.skin-profile": "Профиль кожи",
  "console.customers.column.orders": "Заказы",
  "console.customers.column.spent": "Всего оплачено",
  "console.customers.column.joined": "Дата регистрации",
  "console.customers.action.view": "Открыть профиль",
  "console.customers.action.block": "Заблокировать клиента",
  "console.customers.action.unblock": "Разблокировать клиента",
  "console.customers.action.delete": "Удалить клиента",

  // Клиенты: KPI-карточки
  "console.customers.stats.total": "Всего пользователей",
  "console.customers.stats.active": "Активные",
  "console.customers.stats.blocked": "Заблокированные",
  "console.customers.stats.active-rate": "Доля активных",

  // Клиенты: удаление
  "console.customers.delete.title": "Удалить клиента",
  "console.customers.delete.question": "Удалить клиента «{name}»?",
  "console.customers.delete.irreversible":
    "Действие нельзя отменить: учётная запись и её доступ к проекту будут удалены.",
  "console.customers.delete.confirm": "Подтвердить удаление",

  // Клиенты: карточка профиля
  "console.customers.detail.tier-badge": "Уровень «{tier}»",
  "console.customers.detail.meta": "ID клиента: {id} · в проекте с {date}",
  "console.customers.detail.total-spent": "Всего оплачено",
  "console.customers.detail.total-orders": "Всего заказов",
  "console.customers.detail.orders-value": "{count} шт.",
  "console.customers.detail.contact": "Контактные данные",
  "console.customers.detail.skin-profile": "Профиль кожи и предпочтения",
  "console.customers.detail.skin-type": "Тип кожи:",
  "console.customers.detail.concerns": "Основные запросы:",
  "console.customers.detail.addresses": "Адреса в профиле",
  "console.customers.detail.shipping-address": "Адрес доставки",
  "console.customers.detail.billing-address": "Адрес для счетов",
  "console.customers.detail.activity": "История активности",

  // Клиенты: уведомления об операциях
  "console.customers.toast.blocked": "Клиент заблокирован.",
  "console.customers.toast.unblocked": "Клиент разблокирован.",
  "console.customers.toast.deleted": "Клиент удалён.",
  "console.customers.toast.export-loading": "Готовим выгрузку клиентов в CSV…",
  "console.customers.toast.export-success": "Список клиентов выгружен в CSV.",
  "console.customers.toast.export-failed":
    "Не удалось сформировать файл выгрузки.",

  // Команда: заголовок раздела и карточка участника
  "console.team.title": "Команда",
  "console.team.subtitle":
    "Операторы контент-платформы: управляйте доступом, статусами и ролями участников проекта.",
  "console.team.invite-action": "Пригласить участника",
  "console.team.card.you": "Это вы",
  "console.team.card.actions": "Действия с участником",
  "console.team.card.delete": "Удалить участника",

  // Команда: вкладки раздела
  "console.team.tab.members": "Участники",
  "console.team.tab.roles": "Роли",

  // Команда: системные роли проекта и статусы участников
  "console.team.role.owner": "Владелец",
  "console.team.role.admin": "Администратор",
  "console.team.role.editor": "Редактор",
  "console.team.role.analyst": "Аналитик",
  "console.team.role.billing": "Оплата",
  "console.team.role.licensing": "Лицензирование",
  "console.team.role.viewer": "Наблюдатель",
  "console.team.status.active": "Активен",
  "console.team.status.inactive": "Отключён",

  // Команда: вкладка «Роли»
  "console.team.roles.title": "Роли проекта",
  "console.team.roles.subtitle":
    "Набор прав, который получает участник вместе с ролью.",
  "console.team.roles.create-action": "Создать роль",
  "console.team.roles.system-badge": "Системная",
  "console.team.roles.permissions-count": "Прав: {count}",
  "console.team.roles.empty": "Ролей пока нет.",
  "console.team.roles.no-permissions": "Прав не выбрано.",
  "console.team.roles.card.actions": "Действия с ролью",
  "console.team.roles.card.edit": "Изменить состав прав",
  "console.team.roles.card.delete": "Удалить роль",
  "console.team.roles.load-failed": "Не удалось загрузить роли проекта.",
  "console.team.roles.created": "Роль «{name}» создана.",
  "console.team.roles.updated": "Состав прав роли «{name}» сохранён.",
  "console.team.roles.deleted": "Роль «{name}» удалена.",

  // Команда: диалог роли
  "console.team.role-dialog.create-title": "Новая роль",
  "console.team.role-dialog.edit-title": "Роль «{name}»",
  "console.team.role-dialog.description":
    "Отметьте права, которые открывает роль. Права выключенных сервисов проекту недоступны.",
  "console.team.role-dialog.name-label": "Название роли",
  "console.team.role-dialog.name-placeholder": "например, moderator",
  "console.team.role-dialog.name-required": "Укажите название роли.",
  "console.team.role-dialog.empty-catalog": "Каталог прав проекта пуст.",
  "console.team.role-dialog.submit": "Сохранить роль",

  // Команда: удаление роли
  "console.team.role-delete.title": "Удалить роль",
  "console.team.role-delete.question": "Удалить роль «{name}»?",
  "console.team.role-delete.irreversible":
    "Участники этой роли потеряют её права сразу после удаления.",
  "console.team.role-delete.confirm": "Подтвердить удаление",

  // Команда: сервисы платформы в каталоге прав
  "console.team.roles.service.auth": "Доступ",
  "console.team.roles.service.content": "Контент",
  "console.team.roles.service.analytics": "Аналитика",
  "console.team.roles.service.pay": "Оплата",

  // Команда: группы каталога прав
  "console.team.roles.group.audit": "Журнал действий",
  "console.team.roles.group.keys": "API-ключи",
  "console.team.roles.group.members": "Участники",
  "console.team.roles.group.projects": "Проект",
  "console.team.roles.group.roles": "Роли",
  "console.team.roles.group.services": "Сервисы",
  "console.team.roles.group.settings": "Настройки",
  "console.team.roles.group.users": "Пользователи сайта",
  "console.team.roles.group.categories": "Категории",
  "console.team.roles.group.instructs": "Инструкции",
  "console.team.roles.group.media": "Медиа",
  "console.team.roles.group.pages": "Страницы",
  "console.team.roles.group.posts": "Посты",
  "console.team.roles.group.research": "Ресёрч",
  "console.team.roles.group.seo": "SEO",
  "console.team.roles.group.tasks": "Фоновые задачи",
  "console.team.roles.group.topics": "Темы",
  "console.team.roles.group.translations": "Переводы",
  "console.team.roles.group.history": "История пользователей",
  "console.team.roles.group.reports": "Отчёты",
  "console.team.roles.group.licensing": "Лицензирование",
  "console.team.roles.group.payments": "Платежи",
  "console.team.roles.group.plans": "Тарифные планы",
  "console.team.roles.group.subscriptions": "Подписки",

  // Команда: приглашение участника
  "console.team.invite.title": "Пригласить участника",
  "console.team.invite.description":
    "Отправьте приглашение в консоль управления проектом.",
  "console.team.invite.name-label": "Имя и фамилия",
  "console.team.invite.name-placeholder": "Иван Петров",
  "console.team.invite.email-label": "Рабочий email",
  "console.team.invite.email-placeholder": "например, ivan@example.com",
  "console.team.invite.role-label": "Роль",
  "console.team.invite.role-placeholder": "Выберите роль",
  "console.team.invite.submit": "Отправить приглашение",

  // Команда: удаление участника
  "console.team.delete.title": "Удалить участника",
  "console.team.delete.question": "Удалить участника «{name}»?",
  "console.team.delete.irreversible":
    "Действие нельзя отменить: все права участника на проект будут отозваны безвозвратно.",
  "console.team.delete.confirm": "Подтвердить удаление",

  // Команда: уведомления об операциях
  "console.team.toast.load-failed":
    "Не удалось загрузить участников проекта.",
  "console.team.toast.invited": "Участник {name} приглашён с ролью «{role}».",
  "console.team.toast.deleted": "Участник {name} удалён.",
  "console.team.toast.role-updated":
    "Участнику {name} назначена роль «{role}».",

  // Команда: валидация приглашения
  "console.team.validation.name-required": "Укажите имя участника.",
  "console.team.validation.email-required": "Укажите рабочий email.",
  "console.team.validation.email-format": "Укажите корректный email.",
  "console.team.validation.role-required": "Выберите роль.",

  // Ошибки API платформы
  "console.api.forbidden": "Недостаточно прав для этого действия.",
  "console.api.not-found": "Запрошенный ресурс не найден.",
  "console.api.invalid": "Переданные данные не прошли проверку.",
  "console.api.failed-with-status": "Запрос завершился ошибкой {status}.",
  "console.api.unreachable": "Платформа недоступна. Попробуйте ещё раз.",
  "console.api.session-expired": "Сессия истекла. Войдите снова.",
  "console.api.project-missing": "Для оператора не выбран проект.",

  // Ошибки входа
  "console.login.platform-unreachable":
    "Не удалось войти: платформа недоступна.",
  "console.login.invalid-credentials": "Неверный email или пароль.",
  "console.login.failed-with-status": "Не удалось войти (ошибка {status}).",
  "console.login.unexpected-response":
    "Не удалось войти: неожиданный ответ платформы.",

  // Возможности разделов: чего нет в платформе
  "console.settings.no-platform-counterpart":
    "У этого раздела нет аналога в платформе (витринные уведомления/безопасность). Значения остаются демонстрационными.",

  // Экран «доступ запрещён»
  "console.unauthorized.title": "Доступ запрещён",
  "console.unauthorized.description":
    "У вас нет прав для просмотра этого раздела консоли. Если вы считаете это ошибкой, обратитесь к администратору.",
  "console.unauthorized.back": "Вернуться на дашборд",

  // Настройки: шапка и вкладки
  "console.settings.title": "Настройки",
  "console.settings.subtitle":
    "Профиль проекта, платежи, доступ команды и безопасность в одном месте.",
  "console.settings.tab.general": "Основное",
  "console.settings.tab.payments": "Платежи",
  "console.settings.tab.languages": "Языки",
  "console.settings.saving": "Сохраняем…",
  "console.settings.save": "Сохранить изменения",
  "console.settings.save-failed": "Не удалось сохранить настройки.",

  // Настройки: главные настройки сайта
  "console.settings.general.title": "Главные настройки сайта",
  "console.settings.general.description": "Настройки сайта, управление данными",
  "console.settings.general.site-name": "Название сайта",
  "console.settings.general.site-description": "Описание сайта",
  "console.settings.general.project-type": "Тип проекта",
  "console.settings.general.project-type-blog": "Блог",
  "console.settings.general.project-type-shop": "Интернет-магазин",
  "console.settings.general.project-type-corporate": "Корпоративный сайт",
  "console.settings.general.project-type-landing": "Лендинг",
  "console.settings.general.timezone": "Часовой пояс",
  "console.settings.general.currencies": "Валюты",
  "console.settings.general.currency": "Валюта по умолчанию",
  "console.settings.general.default-language": "Язык по умолчанию",
  "console.settings.general.saved": "Настройки сайта сохранены.",
  "console.settings.general.validation.name-required": "Укажите название сайта.",
  "console.settings.general.validation.name-max":
    "Название сайта — не больше 80 символов.",
  "console.settings.general.validation.description-max":
    "Описание — не больше 500 символов.",
  "console.settings.general.validation.project-type": "Выберите тип проекта.",
  "console.settings.general.validation.timezone": "Выберите часовой пояс.",
  "console.settings.general.validation.currencies": "Выберите хотя бы одну валюту.",
  "console.settings.general.validation.currency": "Выберите валюту по умолчанию.",
  "console.settings.general.validation.currency-in-list":
    "Валюта по умолчанию должна входить в выбранные валюты.",
  "console.settings.general.validation.language": "Выберите язык по умолчанию.",

  // Настройки: платежи
  "console.settings.payments.title": "Платёжная система",
  "console.settings.payments.description":
    "Приём платежей в проекте идёт через выбранного платёжного провайдера.",
  "console.settings.payments.platega-description":
    "Платёжный шлюз Platega: приём и обработка платежей проекта.",
  "console.settings.payments.active": "Активен",
  "console.settings.payments.activate": "Сделать активным",
  "console.settings.payments.activated":
    "Platega назначен платёжным провайдером проекта.",
  "console.settings.payments.save-failed":
    "Не удалось сохранить настройки платежей.",

  // Настройки: платежи — модальное окно настроек провайдера
  "console.settings.payments.provider.configure": "Настройки провайдера",
  "console.settings.payments.provider.title": "Настройки {name}",
  "console.settings.payments.provider.description":
    "Ключи доступа, URL-ы возврата и статус платёжного шлюза этого проекта.",
  "console.settings.payments.provider.credentials": "Ключи доступа (credentials)",
  "console.settings.payments.provider.properties":
    "Дополнительные параметры (properties)",
  "console.settings.payments.provider.return-url": "URL успешной оплаты",
  "console.settings.payments.provider.fail-url": "URL неуспешной оплаты",
  "console.settings.payments.provider.status": "Провайдер активен",
  "console.settings.payments.provider.status-hint":
    "В архиве данные сохраняются, но платежи через провайдера не принимаются.",
  "console.settings.payments.provider.mode-pairs": "Ключ → значение",
  "console.settings.payments.provider.mode-json": "JSON",
  "console.settings.payments.provider.add-pair": "Добавить пару",
  "console.settings.payments.provider.key-placeholder": "ключ",
  "console.settings.payments.provider.value-placeholder": "значение",
  "console.settings.payments.provider.invalid-json":
    "Невалидный JSON — исправьте, чтобы сохранить.",
  "console.settings.payments.provider.json-not-object":
    "JSON должен быть объектом «ключ → значение».",
  "console.settings.payments.provider.copy-from": "Скопировать с проекта",
  "console.settings.payments.provider.copy-source-placeholder":
    "Проект-источник",
  "console.settings.payments.provider.copy-loaded":
    "Настройки подставлены в форму — проверьте и сохраните.",
  "console.settings.payments.provider.copy-failed":
    "Не удалось получить настройки проекта-источника.",
  "console.settings.payments.provider.save": "Сохранить",
  "console.settings.payments.provider.cancel": "Отмена",
  "console.settings.payments.provider.saved": "Настройки провайдера сохранены.",
  "console.settings.payments.provider.save-failed":
    "Не удалось сохранить настройки провайдера.",
  "console.settings.payments.provider.load-failed":
    "Не удалось загрузить настройки провайдера.",

  // Настройки: значения списков
  "console.settings.option.timeout-15": "15 минут",
  "console.settings.option.timeout-30": "30 минут",
  "console.settings.option.timeout-60": "1 час",
  "console.settings.option.timeout-240": "4 часа",
  "console.settings.option.timeout-480": "8 часов",

  // Настройки: приглашение участника
  "console.settings.invite.title": "Пригласить участника",
  "console.settings.invite.description":
    "Отправьте приглашение в рабочее пространство с нужной ролью. До принятия участник будет со статусом «Приглашён».",
  "console.settings.invite.name": "Имя и фамилия",
  "console.settings.invite.email": "Рабочий email",
  "console.settings.invite.role": "Роль",
  "console.settings.invite.role-placeholder": "Выберите роль",
  "console.settings.invite.note": "Личное сообщение (необязательно)",
  "console.settings.invite.sending": "Отправляем…",
  "console.settings.invite.submit": "Отправить приглашение",
  "console.settings.invite.sent": "Приглашение отправлено на {email}",
  "console.settings.invite.sent-description":
    "{name} добавлен с ролью {role}. Подключите бэкенд, чтобы отправлять реальные приглашения.",

  // Настройки: языки проекта и словарь переводов
  "console.languages.locales.title": "Локали проекта",
  "console.languages.locales.description":
    "Языки, доступные для переводов. Первая локаль — основная.",
  "console.languages.locales.default": "· основная",
  "console.languages.locales.remove": "Удалить локаль {locale}",
  "console.languages.locales.empty": "Локали не настроены.",
  "console.languages.locales.placeholder": "например, en",
  "console.languages.locales.add": "Добавить",
  "console.languages.locales.added": "Локаль «{locale}» добавлена.",
  "console.languages.locales.removed":
    "Локаль «{locale}» удалена. Её переводы сохранены и вернутся, если локаль добавить снова.",
  "console.languages.dictionary.title": "Словарь переводов",
  "console.languages.dictionary.description":
    "Строки интерфейса по локалям. Машинные переводы помечаются до проверки.",
  "console.languages.dictionary.search": "Поиск по ключам…",
  "console.languages.dictionary.translate-missing": "Перевести пропуски",
  "console.languages.dictionary.translate-queued":
    "Автоперевод поставлен в очередь. Пропущенные локали заполнятся в фоне.",
  "console.languages.dictionary.new-key":
    "Новый ключ, например nav.dashboard",
  "console.languages.dictionary.add-key": "Добавить ключ",
  "console.languages.dictionary.key-added": "Ключ добавлен.",
  "console.languages.dictionary.column-key": "Ключ",
  "console.languages.dictionary.empty": "Ключей в словаре пока нет.",
  "console.languages.dictionary.machine": "машинный",
  "console.languages.dictionary.saved": "«{key}» сохранён.",
  "console.languages.dictionary.deleted": "«{key}» удалён.",
  "console.languages.dictionary.delete": "Удалить {key}",

  // Настройки: сервисы проекта
  "console.settings.tab.services": "Сервисы",
  "console.settings.services.title": "Сервисы проекта",
  "console.settings.services.description":
    "Какие сервисы платформы включены для этого проекта. Разделы выключенного сервиса скрываются из меню консоли; данные сервиса при этом сохраняются.",
  "console.settings.services.content.title": "Контент",
  "console.settings.services.content.description":
    "Материалы, категории, медиа и словарь переводов.",
  "console.settings.services.analytics.title": "Аналитика",
  "console.settings.services.analytics.description":
    "События, сессии и отчёты дашборда.",
  "console.settings.services.pay.title": "Оплата",
  "console.settings.services.pay.description":
    "Платежи, провайдеры и тарифные планы.",
  "console.settings.services.licensing.title": "Лицензирование",
  "console.settings.services.licensing.description":
    "Организации-покупатели, планы поставки и лицензионные ключи проекта.",
  "console.settings.services.enabled": "Сервис «{name}» включён.",
  "console.settings.services.disabled": "Сервис «{name}» выключен.",
  "console.settings.services.save-failed": "Не удалось переключить сервис.",
  "console.settings.services.read-only":
    "У вас нет права управления сервисами — состояние доступно только для просмотра.",
  "console.settings.services.empty": "Переключаемых сервисов нет.",

  // Контент: раздел SEO
  "console.seo.description":
    "SEO-поля постов, страниц и категорий проекта в одной таблице.",
  "console.seo.empty": "Записей пока нет.",
  "console.seo.load-more": "Показать ещё",
  "console.seo.filter.type": "Тип сущности",
  "console.seo.filter.all": "Все",
  "console.seo.filter.sort": "Сортировка",
  "console.seo.filter.direction": "Порядок",
  "console.seo.sort.type": "По типу",
  "console.seo.sort.title": "По названию",
  "console.seo.sort.updated_at": "По дате изменения",
  "console.seo.direction.asc": "По возрастанию",
  "console.seo.direction.desc": "По убыванию",
  "console.seo.type.post": "Пост",
  "console.seo.type.page": "Страница",
  "console.seo.type.category": "Категория",
  "console.seo.table.entity": "Сущность",
  "console.seo.table.type": "Тип",
  "console.seo.table.title": "Заголовок",
  "console.seo.table.description": "Описание",
  "console.seo.table.keywords": "Ключевые слова",
  "console.seo.table.canonical": "Канонический адрес",
  "console.seo.table.robots": "Индексация (robots)",
  "console.seo.table.og-title": "OG заголовок",
  "console.seo.table.og-description": "OG описание",
  "console.seo.table.og-image": "OG картинка",
  "console.seo.table.twitter-card": "Карточка Twitter",
  "console.seo.table.json-ld": "JSON-LD",
  "console.seo.table.state": "Состояние",
  "console.seo.state.filled": "Заполнено",
  "console.seo.state.empty": "Не заполнено",
  "console.seo.json-ld.present": "Задан",
  "console.seo.form.hint":
    "Канонический адрес, robots, картинку и JSON-LD задаёт оператор: AI их не трогает.",
  "console.seo.form.json-invalid": "JSON-LD должен быть объектом JSON",
  "console.seo.toast.saved": "SEO сохранено",
  "console.seo.toast.save-failed": "Не удалось сохранить SEO",
  "console.seo.rebuild.selected": "Пересобрать выбранные",
  "console.seo.rebuild.all": "Пересобрать всё по AI",
  "console.seo.rebuild.running": "Идёт пересборка SEO по AI",
  "console.seo.rebuild.started": "Пересборка SEO запущена",
  "console.seo.rebuild.finished": "Пересборка SEO завершена",
  "console.seo.rebuild.failed": "Пересборка SEO не удалась",
  "console.seo.rebuild.start-failed": "Не удалось запустить пересборку SEO",

  // Города проекта: состав справочника, SEO города и AI-адаптация
  "console.cities.description":
    "Города справочника платформы: какие включены в проекте, их SEO и адаптация под тематику.",
  "console.cities.empty": "Городов пока нет. Справочник наполняется командой city:sync.",
  "console.cities.load-more": "Показать ещё",
  "console.cities.filter.search": "Поиск по названию",
  "console.cities.filter.region": "Регион",
  "console.cities.filter.all": "Все",
  "console.cities.filter.state": "Включённость",
  "console.cities.filter.enabled": "Только включённые",
  "console.cities.filter.disabled": "Только выключенные",
  "console.cities.filter.sort": "Сортировка",
  "console.cities.filter.direction": "Порядок",
  "console.cities.sort.population": "По населению",
  "console.cities.sort.name": "По названию",
  "console.cities.direction.asc": "По возрастанию",
  "console.cities.direction.desc": "По убыванию",
  "console.cities.table.name": "Город",
  "console.cities.table.region": "Регион",
  "console.cities.table.population": "Население",
  "console.cities.table.enabled": "Включён",
  "console.cities.table.seo": "SEO",
  "console.cities.seo.filled": "Заполнено",
  "console.cities.seo.empty": "Не заполнено",
  "console.cities.toggle.failed": "Не удалось изменить состав городов",
  "console.cities.bulk.enable-all": "Включить все",
  "console.cities.bulk.enable-all-title": "Включить все города справочника?",
  "console.cities.bulk.enable-all-description":
    "Все города справочника станут включёнными в этом проекте.",
  "console.cities.bulk.reset": "Вернуться к 10 крупнейшим",
  "console.cities.bulk.reset-title": "Вернуться к 10 крупнейшим городам?",
  "console.cities.bulk.reset-description":
    "Включёнными останутся 10 крупнейших по населению, остальные будут выключены.",
  "console.cities.bulk.done": "Включённых городов: {count}",
  "console.cities.bulk.failed": "Не удалось выполнить массовое действие",
  "console.cities.seo.title": "SEO города",
  "console.cities.seo.hint":
    "Поля страницы города для этого проекта. У другого проекта тот же город описан по-своему.",
  "console.cities.seo.saved": "SEO города сохранено",
  "console.cities.seo.save-failed": "Не удалось сохранить SEO города",
  "console.cities.seo.read-only": "Нет права на изменение: SEO открыто на просмотр.",
  "console.cities.adapt.action": "AI: адаптировать под проект",
  "console.cities.adapt.title": "Адаптация SEO городов",
  "console.cities.adapt.description":
    "Платформа заполнит SEO включённых городов под указанную тематику.",
  "console.cities.adapt.topic": "Тематика",
  "console.cities.adapt.topic-required": "Укажите тематику: у проекта она не задана.",
  "console.cities.adapt.affected": "Затрагиваются включённые города: {count}",
  "console.cities.adapt.submit": "Запустить",
  "console.cities.adapt.started": "Адаптация SEO городов запущена",
  "console.cities.adapt.running": "Идёт адаптация SEO городов",
  "console.cities.adapt.finished": "Адаптация SEO городов завершена",
  "console.cities.adapt.failed": "Адаптация SEO городов не удалась",
  "console.cities.adapt.start-failed": "Не удалось запустить адаптацию SEO городов",

  // Оплата: транзакции
  "console.payments.description":
    "Платежи проекта: подтверждение счетов и возвраты.",
  "console.payments.empty": "Платежей пока нет.",
  "console.payments.load-more": "Показать ещё",
  "console.payments.filter.status": "Статус",
  "console.payments.filter.all": "Все",
  "console.payments.table.payer": "Плательщик",
  "console.payments.table.amount": "Сумма",
  "console.payments.table.refunded": "Возвращено",
  "console.payments.table.status": "Статус",
  "console.payments.table.provider": "Провайдер",
  "console.payments.table.created": "Создан",
  "console.payments.status.created": "Создан",
  "console.payments.status.pending": "Ожидает оплаты",
  "console.payments.status.succeeded": "Оплачен",
  "console.payments.status.failed": "Отклонён",
  "console.payments.status.canceled": "Отменён",
  "console.payments.status.refunded_partial": "Возвращён частично",
  "console.payments.status.refunded_full": "Возвращён полностью",
  "console.payments.confirm": "Подтвердить оплату",
  "console.payments.refund": "Вернуть",
  "console.payments.refund-hint":
    "Пустая сумма означает полный возврат платежа.",
  "console.payments.refund-amount": "Сумма возврата",
  "console.payments.toast.confirmed": "Оплата подтверждена",
  "console.payments.toast.confirm-failed": "Не удалось подтвердить оплату",
  "console.payments.toast.refunded": "Возврат оформлен",
  "console.payments.toast.refund-failed": "Не удалось оформить возврат",

  // Оплата: подписки
  "console.subscriptions.description":
    "Подписки проекта: на тарифные планы и на планы лицензий.",
  "console.subscriptions.empty": "Подписок пока нет.",
  "console.subscriptions.load-more": "Показать ещё",
  "console.subscriptions.filter.subject": "Предмет подписки",
  "console.subscriptions.filter.all": "Все",
  "console.subscriptions.subject.plan": "Тарифный план",
  "console.subscriptions.subject.license-plan": "Тарифный план лицензий",
  "console.subscriptions.table.subscriber": "Подписчик",
  "console.subscriptions.table.subject": "Предмет",
  "console.subscriptions.table.subject-type": "Тип предмета",
  "console.subscriptions.table.status": "Статус",
  "console.subscriptions.table.period-ends": "Период до",
  "console.subscriptions.action.cancel": "Отменить подписку",
  "console.subscriptions.action.resume": "Возобновить подписку",
  "console.subscriptions.action.pause": "Приостановить подписку",
  "console.subscriptions.action.delete": "Удалить подписку",
  "console.subscriptions.toast.changed": "Подписка обновлена",
  "console.subscriptions.toast.change-failed": "Не удалось изменить подписку",

  // Оплата: тарифные планы подписок
  "console.plans.description":
    "Тарифные планы подписок проекта: цена периода и состав возможностей.",
  "console.plans.empty": "Тарифных планов пока нет.",
  "console.plans.load-more": "Показать ещё",
  "console.plans.add": "Добавить план",
  "console.plans.archive": "В архив",
  "console.plans.table.code": "Код",
  "console.plans.table.name": "Название",
  "console.plans.table.price": "Цена",
  "console.plans.table.interval": "Период",
  "console.plans.table.state": "Состояние",
  "console.plans.state.active": "Действует",
  "console.plans.state.archived": "В архиве",
  "console.plans.interval.day": "День",
  "console.plans.interval.month": "Месяц",
  "console.plans.interval.year": "Год",
  "console.plans.form.create-title": "Новый тарифный план",
  "console.plans.form.edit-title": "Редактирование тарифного плана",
  "console.plans.form.code": "Код",
  "console.plans.form.name": "Название",
  "console.plans.form.price-minor": "Цена (в минорных единицах)",
  "console.plans.form.currency": "Валюта",
  "console.plans.form.interval": "Период",
  "console.plans.toast.created": "Тарифный план создан",
  "console.plans.toast.updated": "Тарифный план обновлён",
  "console.plans.toast.save-failed": "Не удалось сохранить тарифный план",
  "console.plans.toast.archived": "Тарифный план отправлен в архив",
  "console.plans.toast.archive-failed": "Не удалось отправить план в архив",

  // Лицензирование: раздел консоли
  "console.licensing.description":
    "Организации-покупатели, планы поставки и лицензионные ключи проекта.",
  "console.licensing.read-only":
    "Права ограничены просмотром: изменяющие действия недоступны.",
  "console.licensing.load-more": "Показать ещё",
  "console.licensing.organizations.description":
    "Организации-покупатели: анкета, контакты и сфера деятельности.",
  "console.licensing.plans.description":
    "Планы поставки: состав возможностей и цена подписки на лицензию.",
  "console.licensing.licenses.description":
    "Лицензионные ключи проекта: выпуск, продление, отзыв и установки.",
  "console.licensing.releases.description":
    "Каталог релизов продукта: версии, доступные лицензиям проекта.",

  // Лицензирование: организации
  "console.licensing.organizations.add": "Добавить организацию",
  "console.licensing.organizations.empty": "Организаций пока нет.",
  "console.licensing.organizations.table.name": "Название",
  "console.licensing.organizations.table.contact": "Контактное лицо",
  "console.licensing.organizations.table.email": "Email",
  "console.licensing.organizations.table.phone": "Телефон",
  "console.licensing.organizations.table.created": "Создана",
  "console.licensing.organizations.form.create-title": "Новая организация",
  "console.licensing.organizations.form.edit-title": "Редактирование организации",
  "console.licensing.organizations.form.name": "Название",
  "console.licensing.organizations.form.contact-first-name": "Имя контактного лица",
  "console.licensing.organizations.form.contact-last-name": "Фамилия контактного лица",
  "console.licensing.organizations.form.email": "Email",
  "console.licensing.organizations.form.phone": "Телефон",
  "console.licensing.organizations.form.telegram": "Телеграм",
  "console.licensing.organizations.form.activity": "Сфера деятельности",
  "console.licensing.organizations.form.employees-count": "Число сотрудников",
  "console.licensing.organizations.form.usage-purpose": "Цель использования",
  "console.licensing.organizations.delete.title": "Удалить организацию?",
  "console.licensing.organizations.delete.description":
    "Анкета «{name}» будет удалена. Организацию с выпущенными лицензиями удалить нельзя.",
  "console.licensing.organizations.toast.created": "Организация создана.",
  "console.licensing.organizations.toast.updated": "Организация обновлена.",
  "console.licensing.organizations.toast.deleted": "Организация удалена.",
  "console.licensing.organizations.toast.save-failed":
    "Не удалось сохранить организацию.",
  "console.licensing.organizations.toast.delete-failed":
    "Не удалось удалить организацию.",

  // Лицензирование: планы
  "console.licensing.plans.add": "Добавить план",
  "console.licensing.plans.empty": "Планов поставки пока нет.",
  "console.licensing.plans.table.code": "Код",
  "console.licensing.plans.table.name": "Название",
  "console.licensing.plans.table.price": "Цена периода",
  "console.licensing.plans.table.features": "Фичи",
  "console.licensing.plans.price.free": "Без цены",
  "console.licensing.plans.form.create-title": "Новый план",
  "console.licensing.plans.form.edit-title": "Редактирование плана",
  "console.licensing.plans.form.code": "Код плана",
  "console.licensing.plans.form.name": "Название",
  "console.licensing.plans.form.price-minor": "Сумма (в минорных единицах)",
  "console.licensing.plans.form.currency": "Валюта",
  "console.licensing.plans.form.interval": "Интервал",
  "console.licensing.plans.form.price-hint":
    "Цена периода задаётся целиком: сумма, валюта и интервал — все три вместе или ни одного.",
  "console.licensing.plans.interval.day": "День",
  "console.licensing.plans.interval.month": "Месяц",
  "console.licensing.plans.interval.year": "Год",
  "console.licensing.plans.delete.title": "Удалить план?",
  "console.licensing.plans.delete.description":
    "План «{name}» будет удалён вместе с настройками фич.",
  "console.licensing.plans.toast.created": "План создан.",
  "console.licensing.plans.toast.updated": "План обновлён.",
  "console.licensing.plans.toast.deleted": "План удалён.",
  "console.licensing.plans.toast.save-failed": "Не удалось сохранить план.",
  "console.licensing.plans.toast.delete-failed": "Не удалось удалить план.",
  "console.licensing.plans.features.title": "Базовые фичи",
  "console.licensing.plans.features.overrides": "Переопределения организаций",
  "console.licensing.plans.features.add": "Добавить фичу",
  "console.licensing.plans.features.code": "Код фичи",
  "console.licensing.plans.features.name": "Название",
  "console.licensing.plans.features.organization": "Организация",
  "console.licensing.plans.features.base": "Базовая — для всех организаций",
  "console.licensing.plans.features.empty": "Фич пока нет.",
  "console.licensing.plans.features.toast.added": "Фича добавлена.",
  "console.licensing.plans.features.toast.updated": "Фича обновлена.",
  "console.licensing.plans.features.toast.deleted": "Фича удалена.",
  "console.licensing.plans.features.toast.failed": "Не удалось сохранить фичу.",

  // Лицензирование: лицензии
  "console.licensing.licenses.issue": "Выпустить лицензию",
  "console.licensing.licenses.empty": "Лицензий пока нет.",
  "console.licensing.licenses.table.organization": "Организация",
  "console.licensing.licenses.table.plan": "План",
  "console.licensing.licenses.table.key": "Ключ",
  "console.licensing.licenses.table.entitled-version": "Версия",
  "console.licensing.licenses.table.updates-until": "Обновления до",
  "console.licensing.licenses.table.installations": "Установки",
  "console.licensing.licenses.table.status": "Статус",
  "console.licensing.licenses.status.active": "Действует",
  "console.licensing.licenses.status.revoked": "Отозвана",
  "console.licensing.licenses.filter.organization": "Организация",
  "console.licensing.licenses.filter.status": "Статус",
  "console.licensing.licenses.filter.all": "Все",
  "console.licensing.licenses.issue.title": "Выпуск лицензии",
  "console.licensing.licenses.issue.description":
    "Лицензия бессрочна: оплачивается только окно обновлений. Ключ будет показан один раз.",
  "console.licensing.licenses.issue.organization": "Организация",
  "console.licensing.licenses.issue.plan": "План",
  "console.licensing.licenses.issue.updates-until": "Обновления до",
  "console.licensing.licenses.issue.max-installations": "Лимит установок",
  "console.licensing.licenses.issue.entitled-version":
    "Версия права (по умолчанию — последний релиз)",
  "console.licensing.licenses.issue.note": "Заметка",
  "console.licensing.licenses.key-modal.title": "Активационный ключ",
  "console.licensing.licenses.key-modal.warning":
    "Сохраните ключ: он показывается только один раз, на сервере остаётся только его хэш.",
  "console.licensing.licenses.key-modal.copy": "Скопировать ключ",
  "console.licensing.licenses.reveal": "Показать ключ",
  "console.licensing.licenses.renew": "Продлить",
  "console.licensing.licenses.renew.title": "Продление окна обновлений",
  "console.licensing.licenses.renew.description":
    "Дата должна быть позже текущего окна; право на версии поднимется по каталогу релизов.",
  "console.licensing.licenses.renew.updates-until": "Новая дата окна",
  "console.licensing.licenses.offline": "Офлайн-активация",
  "console.licensing.licenses.offline.title": "Офлайн-активация",
  "console.licensing.licenses.offline.description":
    "Загрузите файл-запрос установки из закрытого контура — будет выпущен токен со сроком 1 год.",
  "console.licensing.licenses.offline.file": "Загрузить файл-запрос",
  "console.licensing.licenses.offline.file-invalid":
    "Не удалось разобрать файл-запрос установки.",
  "console.licensing.licenses.offline.install-id": "Установка",
  "console.licensing.licenses.offline.domain": "Домен",
  "console.licensing.licenses.offline.app-version": "Версия",
  "console.licensing.licenses.offline.submit": "Выпустить токен",
  "console.licensing.licenses.installations": "Установки",
  "console.licensing.licenses.installations.title": "Установки лицензии",
  "console.licensing.licenses.installations.empty": "Установок пока нет.",
  "console.licensing.licenses.installations.table.domain": "Домен",
  "console.licensing.licenses.installations.table.version": "Версия",
  "console.licensing.licenses.installations.table.last-seen": "Активность",
  "console.licensing.licenses.installations.table.status": "Статус",
  "console.licensing.licenses.installations.filter.app-version-below":
    "Версия ниже",
  "console.licensing.licenses.installations.status.active": "Активна",
  "console.licensing.licenses.installations.status.revoked": "Отозвана",
  "console.licensing.licenses.installations.revoke": "Отозвать копию",
  "console.licensing.licenses.revoke": "Отозвать",
  "console.licensing.licenses.revoke.title": "Отозвать лицензию?",
  "console.licensing.licenses.revoke.description":
    "Ключ «{key}…» получит статус «отозвана», токены перестанут подтверждать право. Действие необратимо.",
  "console.licensing.licenses.signing-key": "Ключ подписи",
  "console.licensing.licenses.signing-key.title": "Публичный ключ подписи",
  "console.licensing.licenses.signing-key.description":
    "Поставки проверяют подпись лицензионных токенов этим ключом.",
  "console.licensing.licenses.signing-key.copy": "Скопировать",
  "console.licensing.licenses.toast.issued": "Лицензия выпущена.",
  "console.licensing.licenses.toast.issue-failed": "Не удалось выпустить лицензию.",
  "console.licensing.licenses.toast.renewed": "Окно обновлений продлено.",
  "console.licensing.licenses.toast.renew-failed": "Не удалось продлить лицензию.",
  "console.licensing.licenses.toast.reveal-failed": "Не удалось показать ключ.",
  "console.licensing.licenses.toast.offline-issued":
    "Офлайн-токен выпущен и скачан.",
  "console.licensing.licenses.toast.offline-failed":
    "Не удалось выполнить офлайн-активацию.",
  "console.licensing.licenses.toast.revoked": "Лицензия отозвана.",
  "console.licensing.licenses.toast.revoke-failed": "Не удалось отозвать лицензию.",
  "console.licensing.licenses.toast.installation-revoked": "Установка отозвана.",
  "console.licensing.licenses.toast.installation-revoke-failed":
    "Не удалось отозвать установку.",
  "console.licensing.licenses.toast.key-copied": "Ключ скопирован.",

  // Лицензирование: каталог релизов
  "console.licensing.releases.add": "Добавить релиз",
  "console.licensing.releases.empty": "Релизов пока нет.",
  "console.licensing.releases.table.version": "Версия",
  "console.licensing.releases.table.train": "Трейн",
  "console.licensing.releases.table.repository": "Репозиторий",
  "console.licensing.releases.table.released": "Дата выхода",
  "console.licensing.releases.table.security": "Security-патч",
  "console.licensing.releases.table.changelog": "Изменения",
  "console.licensing.releases.security.badge": "Security-патч",
  "console.licensing.releases.form.create-title": "Новый релиз",
  "console.licensing.releases.form.edit-title": "Редактирование релиза",
  "console.licensing.releases.form.version": "Версия (SemVer)",
  "console.licensing.releases.form.train": "Релиз-трейн",
  "console.licensing.releases.form.repository": "Репозиторий образа",
  "console.licensing.releases.form.released-at": "Дата выхода",
  "console.licensing.releases.form.is-security": "Security-патч",
  "console.licensing.releases.form.min-upgrade-from":
    "Минимальная версия для апгрейда",
  "console.licensing.releases.form.changelog-url": "Ссылка на изменения",
  "console.licensing.releases.delete.title": "Удалить релиз?",
  "console.licensing.releases.delete.description":
    "Релиз «{version}» исчезнет из каталога; уже поднятые права лицензий не изменятся.",
  "console.licensing.releases.toast.created": "Релиз добавлен.",
  "console.licensing.releases.toast.updated": "Релиз обновлён.",
  "console.licensing.releases.toast.deleted": "Релиз удалён.",
  "console.licensing.releases.toast.save-failed": "Не удалось сохранить релиз.",
  "console.licensing.releases.toast.delete-failed": "Не удалось удалить релиз.",

  // Метаданные маршрутов
  "console.meta.login-description": "Вход в консоль управления проектом.",
  "console.meta.unauthorized-description":
    "Недостаточно прав для просмотра этой страницы.",
  "console.meta.blogs-description":
    "Публикация материалов, руководств и статей проекта.",
  "console.meta.blogs-add-description": "Создание новой статьи блога.",
  "console.meta.blogs-edit-description":
    "Редактирование статьи блога «{slug}».",
  "console.meta.categories-description":
    "Управление таксономией каталога: дерево категорий и SEO.",
  "console.meta.customers-description":
    "Пользователи проекта: профили, статусы, блокировки.",
  "console.meta.team-description": "Операторы консоли: роли и доступ.",
  "console.meta.settings-description":
    "Настройки проекта: профиль, сервисы, локализация и доступ.",
  "console.meta.seo-description":
    "SEO-поля контента проекта: просмотр, правка и пересборка по AI.",
  "console.meta.cities-description":
    "Города проекта: состав, SEO города и адаптация SEO по AI.",
  "console.meta.payments-description":
    "Транзакции оплат проекта: подтверждение и возвраты.",
  "console.meta.subscriptions-description":
    "Подписки проекта: на тарифные планы и планы лицензий.",
  "console.meta.plans-description":
    "Тарифные планы подписок: цена периода и возможности.",
  "console.meta.organizations-description":
    "Организации-покупатели лицензий: анкеты и контакты.",
  "console.meta.license-plans-description":
    "Тарифные планы лицензий: состав возможностей и цена.",
  "console.meta.licenses-description":
    "Лицензионные ключи проекта: выпуск, продление и отзыв.",
  "console.meta.releases-description":
    "Каталог релизов продукта: версии для лицензий проекта.",
} as const;

export type ConsoleTextKey = keyof typeof CONSOLE_TEXTS;

/** Префикс ключей реестра в словаре переводов проекта. */
export const CONSOLE_TEXTS_KEY_PREFIX = "console.";

/** Префикс ключа кэша переопределений в localStorage. */
export const CONSOLE_TEXTS_STORAGE_PREFIX = "console_texts:";

// --- Контекст переопределений ---------------------------------------------
//
// Модульный store вместо React-контекста: тексты нужны и вне дерева React
// (конфигурация меню, zod-схемы, колонки таблиц). Компоненты подписываются
// через `useConsoleText` (useSyncExternalStore) и ре-рендерятся, когда словарь
// проекта доехал.

let overrides: Record<string, string> = {};
let revision = 0;
const listeners = new Set<() => void>();

function notify() {
  revision += 1;
  for (const listener of listeners) listener();
}

/** Ключи `console.*` с непустыми строковыми значениями из плоского словаря проекта. */
export function selectConsoleTextOverrides(
  dictionary: Record<string, unknown>,
): Record<string, string> {
  const selected: Record<string, string> = {};
  for (const [key, value] of Object.entries(dictionary)) {
    if (!key.startsWith(CONSOLE_TEXTS_KEY_PREFIX)) continue;
    if (typeof value !== "string" || value.trim() === "") continue;
    selected[key] = value;
  }
  return selected;
}

/**
 * Наложить словарь проекта поверх реестра. Берутся только ключи `console.*`
 * с непустыми строковыми значениями; предыдущие переопределения заменяются
 * целиком (удалённый из словаря ключ возвращается к значению по умолчанию).
 */
export function applyConsoleTextOverrides(dictionary: Record<string, unknown>) {
  overrides = selectConsoleTextOverrides(dictionary);
  notify();
}

export function clearConsoleTextOverrides() {
  overrides = {};
  notify();
}

/** Текст консоли: переопределение из словаря проекта или русское значение по умолчанию. */
export function t(key: ConsoleTextKey): string {
  return overrides[key] ?? CONSOLE_TEXTS[key] ?? key;
}

/** Текст с подстановкой `{параметров}`; неизвестные плейсхолдеры остаются как есть. */
export function tf(
  key: ConsoleTextKey,
  params: Record<string, string | number>,
): string {
  return t(key).replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}

/** Подписка на смену переопределений (для `useConsoleText`). */
export function subscribeConsoleTexts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Монотонная версия store — снапшот для useSyncExternalStore. */
export function consoleTextsRevision() {
  return revision;
}

// --- Загрузка переопределений из словаря проекта ---------------------------

export type ConsoleTextsSource = {
  /** Локаль оператора (`bootstrap.user.locale`). */
  locale: string;
  /** Версия словаря (`bootstrap.translations_version`) — инвалидация кэша. */
  version: string;
};

function cacheStorageKey(source: ConsoleTextsSource): string {
  return `${CONSOLE_TEXTS_STORAGE_PREFIX}${source.locale}:${source.version}`;
}

function readCachedOverrides(
  storageKey: string,
): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return undefined;
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return undefined;
  }
}

/** Запись кэша: устаревшие версии/локали удаляются, живёт только текущий ключ. */
function writeCachedOverrides(
  storageKey: string,
  values: Record<string, string>,
) {
  if (typeof window === "undefined") return;
  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const existingKey = window.localStorage.key(index);
      if (
        existingKey?.startsWith(CONSOLE_TEXTS_STORAGE_PREFIX) &&
        existingKey !== storageKey
      ) {
        window.localStorage.removeItem(existingKey);
      }
    }
    window.localStorage.setItem(storageKey, JSON.stringify(values));
  } catch {
    // Кэш — только ускорение: сбой записи не мешает работе на свежих данных.
  }
}

/**
 * Обновить переопределения по словарю проекта: точное попадание в кэш
 * (`локаль:версия`) применяется без сети, иначе запрашивается плоский словарь.
 * Любой сбой (content выключен, запрос упал) молча оставляет текущие значения —
 * панель продолжает работать на русских значениях по умолчанию.
 */
export async function refreshConsoleTexts(
  source: ConsoleTextsSource,
  fetchDictionary: (
    locale: string,
  ) => Promise<Record<string, unknown> | null | undefined>,
): Promise<void> {
  const storageKey = cacheStorageKey(source);

  const cached = readCachedOverrides(storageKey);
  if (cached) {
    applyConsoleTextOverrides(cached);
    return;
  }

  try {
    const dictionary = (await fetchDictionary(source.locale)) ?? {};
    applyConsoleTextOverrides(dictionary);
    writeCachedOverrides(storageKey, selectConsoleTextOverrides(dictionary));
  } catch {
    // Словарь недоступен — работаем на значениях по умолчанию без ошибок UI.
  }
}

/**
 * Синхронное применение кэша переопределений при загрузке модуля: строки,
 * вычисляемые на уровне модулей (меню, схемы), получают переопределения до
 * первого рендера, не дожидаясь сети. Битый кэш равен отсутствию кэша.
 */
export function hydrateConsoleTextsFromCache() {
  if (typeof window === "undefined") return;
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const storageKey = window.localStorage.key(index);
      if (!storageKey?.startsWith(CONSOLE_TEXTS_STORAGE_PREFIX)) continue;
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) continue;
      applyConsoleTextOverrides(JSON.parse(raw) as Record<string, unknown>);
      return;
    }
  } catch {
    // Кэш — только ускорение: любые сбои чтения игнорируются.
  }
}

hydrateConsoleTextsFromCache();
