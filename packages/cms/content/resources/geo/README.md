# Справочник городов России

`russia-cities.json` — копия открытого набора [arbaev/russia-cities](https://github.com/arbaev/russia-cities)
(файл `russia-cities.json` ветки `master`), взятая без изменений.

Команда `city:sync` читает этот файл по умолчанию: бутстрап стека не зависит от
доступности GitHub, а результат прогона воспроизводим. Обновление справочника из
источника — тот же прогон с аргументом:

```
php artisan city:sync https://raw.githubusercontent.com/arbaev/russia-cities/master/russia-cities.json
```

Из набора используются: `name`, `label` (слаг), `population`, `coords.lat`,
`coords.lon`, `region.fullname` (иначе `region.name`) и `region.district`.
