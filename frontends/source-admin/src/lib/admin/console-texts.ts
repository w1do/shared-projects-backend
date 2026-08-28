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
  "console.common.search": "Поиск",
  "console.common.loading": "Загрузка…",
  "console.common.actions": "Действия",
  "console.common.mark-all-read": "Прочитать все",
  "console.common.breadcrumb-admin": "Админпанель",

  // Навигация: группы, пункты меню, быстрые действия
  "console.nav.group.overview": "Обзор",
  "console.nav.group.catalog": "Каталог",
  "console.nav.group.commerce": "Продажи",
  "console.nav.group.workspace": "Рабочее пространство",
  "console.nav.quick-actions": "Быстрые действия",
  "console.nav.dashboard": "Дашборд",
  "console.nav.products": "Товары",
  "console.nav.variants": "Варианты",
  "console.nav.brands": "Бренды",
  "console.nav.categories": "Категории",
  "console.nav.collections": "Коллекции",
  "console.nav.inventory": "Склад",
  "console.nav.orders": "Заказы",
  "console.nav.customers": "Клиенты",
  "console.nav.campaigns": "Кампании",
  "console.nav.promotions": "Акции",
  "console.nav.support": "Поддержка",
  "console.nav.blogs": "Блог",
  "console.nav.notifications": "Уведомления",
  "console.nav.team": "Команда",
  "console.nav.settings": "Настройки",
  "console.nav.licensing": "Лицензирование",
  "console.quick-actions.add-product": "Добавить товар",
  "console.quick-actions.new-promotion": "Новая акция",
  "console.quick-actions.import-inventory": "Импорт склада",
  "console.quick-actions.create-collection": "Создать коллекцию",
  "console.quick-actions.launch-campaign": "Запустить кампанию",
  "console.quick-actions.invite-teammate": "Пригласить участника",

  // Роли операторов
  "console.role.admin": "Администратор",
  "console.role.manager": "Менеджер",
  "console.role.staff": "Сотрудник",

  // Топбар и футер
  "console.topbar.expand-sidebar": "Развернуть меню",
  "console.topbar.collapse-sidebar": "Свернуть меню",
  "console.topbar.storefront-live": "Сайт онлайн",
  "console.topbar.sign-out": "Выйти",
  "console.topbar.signed-out": "Вы вышли из системы",
  "console.topbar.sign-out-failed": "Не удалось выйти. Попробуйте ещё раз.",
  "console.footer.system-healthy": "Система работает",

  // Уведомления и поддержка в топбаре
  "console.notifications.view-all": "Все уведомления",
  "console.support.tickets-title": "Обращения в поддержку",
  "console.support.empty": "Обращений нет.",
  "console.support.view-inbox": "Открыть входящие поддержки",

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
  "console.blogs.autofill-mock-only":
    "Автозаполнение доступно только в режиме демо-шаблона.",
  "console.blogs.autofill-done": "Форма заполнена примером статьи.",
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
  "console.blogs.form.block-placeholder": "Текст блока…",
  "console.blogs.form.image-upload": "Загрузите изображение",
  "console.blogs.form.image-hint": "Изображение внутри текста статьи",
  "console.blogs.form.author-title": "Автор",
  "console.blogs.form.author-name": "Имя",
  "console.blogs.form.author-role": "Роль",
  "console.blogs.form.author-avatar": "Аватар",
  "console.blogs.form.avatar-upload": "Загрузите аватар",
  "console.blogs.form.avatar-hint": "Квадратный портрет автора",
  "console.blogs.form.publish-title": "Параметры публикации",
  "console.blogs.form.reading-time": "Время чтения (мин)",
  "console.blogs.form.layout-label": "Стиль оформления",
  "console.blogs.form.layout.minimalist": "Минималистичный",
  "console.blogs.form.layout.editorial": "Редакционный",
  "console.blogs.form.layout.botanical": "Ботанический",
  "console.blogs.form.block-type.heading": "Заголовок",
  "console.blogs.form.block-type.paragraph": "Абзац",
  "console.blogs.form.block-type.quote": "Цитата",
  "console.blogs.form.block-type.image": "Изображение",
  "console.blogs.form.category.rituals": "Ритуалы",
  "console.blogs.form.category.ingredients": "Ингредиенты",
  "console.blogs.form.category.science": "Наука",
  "console.blogs.form.category.wellness": "Здоровье",
  "console.blogs.form.category.trends": "Тренды",

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
  "console.blogs.lifecycle.revision-restored": "Ревизия #{id} восстановлена.",
  "console.blogs.lifecycle.restore-failed": "Не удалось восстановить ревизию.",

  // Блог: валидация формы статьи
  "console.blogs.validation.title-min":
    "Заголовок должен быть не короче 4 символов.",
  "console.blogs.validation.subtitle-min":
    "Подзаголовок должен быть не короче 4 символов.",
  "console.blogs.validation.category-required": "Выберите рубрику.",
  "console.blogs.validation.author-name-required": "Укажите имя автора.",
  "console.blogs.validation.author-role-required": "Укажите роль автора.",
  "console.blogs.validation.reading-time-min":
    "Время чтения — не менее 1 минуты.",
  "console.blogs.validation.block-content-required":
    "Заполните содержимое блока.",
  "console.blogs.validation.blocks-min":
    "Добавьте хотя бы один блок содержимого.",

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
  "console.categories.autofill": "Автозаполнение",
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
  "console.categories.column.actions": "Действия",
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
  "console.categories.autofill-mock-only":
    "Автозаполнение доступно только в режиме демо-шаблона.",
  "console.categories.autofill-applied":
    "Форма заполнена примером категории (Night Repair Rituals).",

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
  "console.categories.validation.revenue-min":
    "Выручка должна быть положительным числом.",
  "console.categories.validation.growth-number":
    "Рост год к году должен быть числом.",

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
  "console.customers.detail.recent-orders": "Последние заказы",
  "console.customers.detail.activity": "История активности",

  // Клиенты: уведомления об операциях
  "console.customers.toast.blocked": "Клиент заблокирован.",
  "console.customers.toast.unblocked": "Клиент разблокирован.",
  "console.customers.toast.deleted": "Клиент удалён.",
  "console.customers.toast.export-loading": "Готовим выгрузку клиентов в CSV…",
  "console.customers.toast.export-success": "Список клиентов выгружен в CSV.",
  "console.customers.toast.export-failed":
    "Не удалось сформировать файл выгрузки.",

  // Вовлечение аудитории: шаги мастера
  "console.engage.title": "Вовлечение аудитории",
  "console.engage.step.audience": "Аудитория",
  "console.engage.step.intent": "Цель",
  "console.engage.step.configure": "Настройка",
  "console.engage.step.review": "Проверка",
  "console.engage.step-hint.audience":
    "Проверьте, кто получит рассылку. Уберите тех, кого включать не нужно.",
  "console.engage.step-hint.intent":
    "Выберите, что отправить: письмо кампании, акцию, промокод или приглашение в программу лояльности.",
  "console.engage.step-hint.configure":
    "Выберите материал и задайте параметры доставки для этой аудитории.",
  "console.engage.step-hint.review":
    "Проверьте аудиторию, цель и текст, затем отправьте сразу или запланируйте.",

  // Вовлечение аудитории: цели рассылки
  "console.engage.intent.campaign.title": "Отправить письмо кампании",
  "console.engage.intent.campaign.description":
    "Поставить кампанию проекта в очередь для выбранной аудитории.",
  "console.engage.intent.campaign.badge": "Рекомендуем",
  "console.engage.intent.promotion.title": "Отправить акцию",
  "console.engage.intent.promotion.description":
    "Поделиться действующей акцией с выбранными клиентами.",
  "console.engage.intent.promotion.badge": "Акция",
  "console.engage.intent.coupon.title": "Отправить промокод",
  "console.engage.intent.coupon.description":
    "Отправить промокод из каталога акций.",
  "console.engage.intent.coupon.badge": "Промокод",
  "console.engage.intent.loyalty.title": "Пригласить в программу лояльности",
  "console.engage.intent.loyalty.description":
    "Пригласить клиентов на уровень лояльности с приветственным письмом.",
  "console.engage.intent.loyalty.badge": "Лояльность",
  "console.engage.intent.fallback": "Рассылка",
  "console.engage.intent.fallback-description":
    "Проверьте состав рассылки перед отправкой.",

  // Вовлечение аудитории: каналы доставки
  "console.engage.channel.email": "Email",
  "console.engage.channel.sms": "СМС",
  "console.engage.channel.push": "Push-уведомление",
  "console.engage.channel.in-app": "Сообщение в приложении",

  // Вовлечение аудитории: шаг «Аудитория»
  "console.engage.audience.empty-title": "Клиенты не выбраны",
  "console.engage.audience.empty-hint":
    "Закройте окно и сначала выберите клиентов в списке.",
  "console.engage.audience.reach": "Ожидаемый охват",
  "console.engage.audience.reach-count": "Клиентов: {count}",
  "console.engage.audience.reach-hint":
    "Прежде чем продолжить, уберите тех, кому эта рассылка не нужна.",
  "console.engage.audience.remove": "Убрать {name}",

  // Вовлечение аудитории: шаг «Настройка»
  "console.engage.asset.campaign": "Кампания",
  "console.engage.asset.campaign-empty":
    "Кампаний пока нет. Сначала создайте кампанию в разделе «Кампании».",
  "console.engage.asset.promotion": "Акция",
  "console.engage.asset.promotion-empty": "Действующих акций нет.",
  "console.engage.asset.coupon": "Промокод",
  "console.engage.asset.coupon-empty": "Промокодов нет.",
  "console.engage.asset.loyalty": "Пригласить на уровень",
  "console.engage.asset.loyalty-subtitle": "Приглашение в программу лояльности",
  "console.engage.form.channel": "Канал",
  "console.engage.form.schedule-date": "Дата отправки (необязательно)",
  "console.engage.form.subject": "Тема письма",
  "console.engage.form.subject-placeholder":
    "Например, письмо от команды проекта…",
  "console.engage.form.message": "Сообщение (необязательно)",
  "console.engage.form.message-placeholder":
    "Добавьте короткий текст, который клиенты увидят вместе с рассылкой.",
  "console.engage.subject.campaign": "Приглашаем: {name}",
  "console.engage.subject.coupon": "Ваш промокод: {code}",
  "console.engage.subject.promotion": "Специальное предложение: {name}",
  "console.engage.subject.loyalty": "Приглашаем на уровень «{tier}»",

  // Вовлечение аудитории: шаг «Проверка»
  "console.engage.review.audience": "Аудитория",
  "console.engage.review.asset": "Материал",
  "console.engage.review.channel": "Канал",
  "console.engage.review.schedule": "Отправка",
  "console.engage.review.subject": "Тема",
  "console.engage.review.message": "Сообщение",
  "console.engage.review.recipients": "Кто получит рассылку",
  "console.engage.review.more": "ещё {count}",
  "console.engage.review.send-now": "Отправить сразу",
  "console.engage.review.tier-value": "уровень «{tier}»",
  "console.engage.review.note-before": "Проверьте сводку перед отправкой.",
  "console.engage.review.note-send": "Отправить",
  "console.engage.review.note-middle": "доставит рассылку сразу,",
  "console.engage.review.note-schedule": "Запланировать",
  "console.engage.review.note-after": "сохранит выбранную дату.",

  // Вовлечение аудитории: кнопки мастера
  "console.engage.footer.back": "Назад",
  "console.engage.footer.continue": "Далее",
  "console.engage.footer.configure": "Настроить",
  "console.engage.footer.review": "Проверить",
  "console.engage.footer.schedule": "Запланировать",
  "console.engage.footer.schedule-hint":
    "Поставить рассылку в очередь на выбранную дату, не отправляя сразу.",
  "console.engage.footer.send": "Отправить: {count}",
  "console.engage.footer.send-hint":
    "Отправить рассылку клиентам ({count}) сейчас.",
  "console.engage.footer.sending": "Отправляем…",

  // Вовлечение аудитории: валидация формы
  "console.engage.validation.channel": "Выберите канал доставки.",
  "console.engage.validation.subject": "Укажите тему письма.",
  "console.engage.validation.campaign": "Выберите кампанию для отправки.",
  "console.engage.validation.promotion": "Выберите акцию или промокод.",
  "console.engage.validation.loyalty":
    "Выберите уровень лояльности для приглашения.",

  // Вовлечение аудитории: уведомления
  "console.engage.toast.select-customer":
    "Выберите хотя бы одного клиента, чтобы продолжить.",
  "console.engage.toast.select-customer-short":
    "Выберите хотя бы одного клиента.",
  "console.engage.toast.choose-intent": "Выберите цель рассылки.",
  "console.engage.toast.complete-before-review":
    "Заполните настройки перед проверкой.",
  "console.engage.toast.complete-before-send":
    "Заполните настройки перед отправкой.",
  "console.engage.toast.pick-schedule":
    "Выберите дату отправки или отправьте сразу.",
  "console.engage.toast.queued":
    "{intent}: поставлено в очередь для клиентов ({count})",
  "console.engage.toast.scheduled": "{intent}: запланировано на {date}",
  "console.engage.toast.mock-description":
    "Подключите бэкенд, чтобы отправлять реальные рассылки.",
  "console.engage.toast.failed": "Не удалось поставить рассылку в очередь.",

  // Команда: заголовок раздела и карточка участника
  "console.team.title": "Команда",
  "console.team.subtitle":
    "Операторы контент-платформы: управляйте доступом, статусами и ролями участников проекта.",
  "console.team.invite-action": "Пригласить участника",
  "console.team.card.you": "Это вы",
  "console.team.card.actions": "Действия с участником",
  "console.team.card.deactivate": "Отключить доступ",
  "console.team.card.activate": "Включить доступ",
  "console.team.card.delete": "Удалить участника",

  // Команда: роли и статусы участников
  "console.team.role.admin": "Администратор",
  "console.team.role.manager": "Менеджер",
  "console.team.role.staff": "Оператор",
  "console.team.status.active": "Активен",
  "console.team.status.inactive": "Отключён",

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

  // Команда: отключение доступа
  "console.team.deactivate.title": "Отключить участника",
  "console.team.deactivate.question": "Отключить доступ участнику «{name}»?",
  "console.team.deactivate.consequences":
    "Участник не сможет входить в консоль и работать с проектом, пока доступ не включат снова.",
  "console.team.deactivate.confirm": "Подтвердить",

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
  "console.team.toast.status-active": "Доступ участнику {name} включён.",
  "console.team.toast.status-inactive": "Доступ участнику {name} отключён.",
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
  "console.login.account-deactivated": "Учётная запись отключена.",

  // Возможности разделов: чего нет в платформе
  "console.capabilities.campaigns-no-backend":
    "API кампаний в платформе нет. Раздел работает на демо-данных.",
  "console.capabilities.settings-partial":
    "Платформа хранит только данные проекта. Витринные разделы (уведомления, безопасность) аналога не имеют и остаются на демо-значениях.",
  "console.capabilities.homepage-mock-only":
    "Контент главной страницы — только демо. В API-режиме платформа отдаёт статические страницы без LANDING.",
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
  "console.settings.tab.shipping": "Доставка",
  "console.settings.tab.taxes": "Налоги",
  "console.settings.tab.notifications": "Уведомления",
  "console.settings.tab.security": "Безопасность",
  "console.settings.tab.languages": "Языки",
  "console.settings.saving": "Сохраняем…",
  "console.settings.save": "Сохранить изменения",
  "console.settings.save-failed": "Не удалось сохранить настройки.",

  // Настройки: профиль магазина
  "console.settings.general.title": "Профиль магазина",
  "console.settings.general.description":
    "Публичные данные, контакты и региональные значения по умолчанию для витрины.",
  "console.settings.general.store-name": "Название магазина",
  "console.settings.general.support-email": "Email поддержки",
  "console.settings.general.phone": "Телефон",
  "console.settings.general.currency": "Валюта",
  "console.settings.general.timezone": "Часовой пояс",
  "console.settings.general.weight-unit": "Единица веса",
  "console.settings.general.storefront-url": "Адрес витрины",
  "console.settings.general.store-description": "Описание магазина",
  "console.settings.general.saved": "Профиль магазина обновлён.",
  "console.settings.general.language-title": "Язык по умолчанию",
  "console.settings.general.language-description":
    "Язык интерфейса и локализаций проекта по умолчанию.",
  "console.settings.general.default-language": "Язык по умолчанию",
  "console.settings.general.language-saved": "Язык по умолчанию: {locale}.",
  "console.settings.general.validation.store-name-required":
    "Укажите название магазина.",
  "console.settings.general.validation.store-name-max":
    "Название магазина — не больше 80 символов.",
  "console.settings.general.validation.email-required":
    "Укажите email поддержки.",
  "console.settings.general.validation.email-invalid":
    "Введите корректный email.",
  "console.settings.general.validation.phone-required": "Укажите телефон.",
  "console.settings.general.validation.phone-max":
    "Телефон — не больше 40 символов.",
  "console.settings.general.validation.description-max":
    "Описание — не больше 500 символов.",
  "console.settings.general.validation.currency": "Выберите валюту.",
  "console.settings.general.validation.timezone": "Выберите часовой пояс.",
  "console.settings.general.validation.weight-unit":
    "Выберите единицу веса.",
  "console.settings.general.validation.storefront-url":
    "Введите корректный адрес витрины.",

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

  // Настройки: доставка
  "console.settings.shipping.title": "Зоны доставки",
  "console.settings.shipping.description":
    "Фиксированные тарифы и порог бесплатной доставки для каждого региона.",
  "console.settings.shipping.flat": "{rate} фикс.",
  "console.settings.shipping.free-over": "Бесплатно от {threshold}",
  "console.settings.shipping.activated": "Зона «{name}» включена.",
  "console.settings.shipping.paused": "Зона «{name}» приостановлена.",
  "console.settings.shipping.save-failed":
    "Не удалось сохранить настройки доставки.",

  // Настройки: налоги
  "console.settings.taxes.title": "Налоги",
  "console.settings.taxes.description":
    "Как налог рассчитывается, отображается и учитывается по регионам.",
  "console.settings.taxes.prices-include": "Цены с налогом",
  "console.settings.taxes.prices-include-description":
    "Показывать на витрине цены с учётом налога.",
  "console.settings.taxes.auto-calculate": "Автоматический расчёт",
  "console.settings.taxes.auto-calculate-description":
    "Применять региональные ставки автоматически при оформлении заказа.",
  "console.settings.taxes.default-rate": "Ставка по умолчанию (%)",
  "console.settings.taxes.tax-id": "Налоговый номер",
  "console.settings.taxes.regional-rates": "Региональные ставки",
  "console.settings.taxes.saved": "Настройки налогов сохранены.",
  "console.settings.taxes.validation.rate-invalid":
    "Введите корректную ставку налога.",
  "console.settings.taxes.validation.rate-min":
    "Ставка не может быть отрицательной.",
  "console.settings.taxes.validation.rate-max":
    "Ставка не может превышать 100%.",
  "console.settings.taxes.validation.tax-id-required":
    "Укажите налоговый номер.",
  "console.settings.taxes.validation.tax-id-max":
    "Налоговый номер — не больше 40 символов.",

  // Настройки: уведомления
  "console.settings.notifications.title": "Уведомления",
  "console.settings.notifications.description":
    "Какие рабочие события команда получает по email и push.",
  "console.settings.notifications.email": "Email",
  "console.settings.notifications.push": "Push",
  "console.settings.notifications.saved": "Настройка уведомлений обновлена.",
  "console.settings.notifications.save-failed":
    "Не удалось сохранить настройки уведомлений.",

  // Настройки: безопасность
  "console.settings.security.title": "Безопасность",
  "console.settings.security.description":
    "Усиленные требования ко входу и оповещения для защиты рабочего пространства.",
  "console.settings.security.two-factor": "Двухфакторная аутентификация",
  "console.settings.security.two-factor-description":
    "Требовать код подтверждения в дополнение к паролю.",
  "console.settings.security.login-alerts": "Оповещения о входе",
  "console.settings.security.login-alerts-description":
    "Присылать владельцу письмо при входе с нового устройства.",
  "console.settings.security.session-timeout": "Тайм-аут сессии",
  "console.settings.security.saved": "Настройки безопасности сохранены.",
  "console.settings.security.validation.timeout-invalid":
    "Выберите тайм-аут сессии.",
  "console.settings.security.validation.timeout-unknown":
    "Выберите допустимый тайм-аут сессии.",

  // Настройки: значения списков
  "console.settings.option.currency-usd": "USD — доллар США",
  "console.settings.option.currency-eur": "EUR — евро",
  "console.settings.option.currency-gbp": "GBP — фунт стерлингов",
  "console.settings.option.currency-vnd": "VND — вьетнамский донг",
  "console.settings.option.timezone-los-angeles":
    "Тихоокеанское время — Лос-Анджелес",
  "console.settings.option.timezone-new-york": "Восточное время — Нью-Йорк",
  "console.settings.option.timezone-london": "GMT — Лондон",
  "console.settings.option.timezone-paris": "CET — Париж",
  "console.settings.option.timezone-ho-chi-minh": "ICT — Хошимин",
  "console.settings.option.timezone-tokyo": "JST — Токио",
  "console.settings.option.weight-kg": "Килограммы (кг)",
  "console.settings.option.weight-lb": "Фунты (lb)",
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

  // Лицензирование: раздел консоли
  "console.licensing.title": "Лицензирование",
  "console.licensing.description":
    "Организации-покупатели, планы поставки и лицензионные ключи проекта.",
  "console.licensing.read-only":
    "Права ограничены просмотром: изменяющие действия недоступны.",
  "console.licensing.load-more": "Показать ещё",
  "console.licensing.tabs.organizations": "Организации",
  "console.licensing.tabs.plans": "Планы",
  "console.licensing.tabs.licenses": "Лицензии",
  "console.licensing.tabs.releases": "Релизы",

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
  "console.meta.licensing-description":
    "Лицензирование: организации, планы поставки и лицензионные ключи.",
  "console.meta.products-description":
    "Управление каталогом: цены, остатки и статусы.",
  "console.meta.brands-description":
    "Портфель брендов и ключевые метрики по маркам.",
  "console.meta.orders-description":
    "Заказы: отгрузки, возвраты и оплаты.",
  "console.meta.inventory-description":
    "Склад: остатки, пороги оповещений и пополнения.",
  "console.meta.variants-description":
    "Связи вариантов: объединение товаров в переключатели опций.",
  "console.meta.collections-description":
    "Коллекции: редакционные подборки и наборы продуктов.",
  "console.meta.collections-add-description": "Создание новой коллекции.",
  "console.meta.promotions-description":
    "Акции и скидки: правила, купоны и уровни вознаграждений.",
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
