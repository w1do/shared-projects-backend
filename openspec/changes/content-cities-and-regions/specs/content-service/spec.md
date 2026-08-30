## MODIFIED Requirements

### Requirement: Полиморфное SEO

SEO-данные SHALL храниться полиморфно и привязываться к любой сущности контента (пост, страница, категория, город): title, description, keywords, canonical, robots-директивы (noindex/nofollow), Open Graph (og:title, og:description, og:image), Twitter card, произвольный JSON-LD (schema.org). Публичное API SHALL отдавать SEO-блок вместе с сущностью. Валидность JSON-LD (корректный JSON) SHALL проверяться при сохранении. Перечень типов сущностей SHALL быть закрытым: тип вне перечня MUST NOT приниматься.

#### Scenario: SEO для категории

- WHEN оператор задаёт SEO с JSON-LD для категории
- THEN публичный ответ категории содержит все SEO-поля и JSON-LD без изменений

#### Scenario: SEO для города

- WHEN оператор задаёт SEO городу, включённому в проекте
- THEN публичный ответ города содержит все SEO-поля этого проекта

#### Scenario: Невалидный JSON-LD

- WHEN оператор сохраняет синтаксически неверный JSON-LD
- THEN возвращается 422

#### Scenario: Тип вне перечня

- WHEN запрос SEO приходит с типом сущности вне перечня платформы
- THEN возвращается 404
