<?php

declare(strict_types=1);

namespace Cms\Contracts\Localization;

/**
 * Ключи локализации сервиса pay: навигация манифеста, карточка сервиса и
 * тексты консоли модального окна настроек платёжного провайдера — зеркало
 * реестра `console-texts.ts` (значения `console.*` словаря проекта
 * переопределяют дефолты консоли).
 */
enum PayLocalizationKeys: string implements LocalizationKeys
{
    use EnumeratesKeys;

    case NavPlans = 'nav.pay.plans';
    case NavPayments = 'nav.pay.payments';
    case NavSubscriptions = 'nav.pay.subscriptions';
    case ServiceTitle = 'service.pay.title';
    case ServiceDescription = 'service.pay.description';

    case ProviderConfigure = 'console.settings.payments.provider.configure';
    case ProviderTitle = 'console.settings.payments.provider.title';
    case ProviderDescription = 'console.settings.payments.provider.description';
    case ProviderCredentials = 'console.settings.payments.provider.credentials';
    case ProviderProperties = 'console.settings.payments.provider.properties';
    case ProviderReturnUrl = 'console.settings.payments.provider.return-url';
    case ProviderFailUrl = 'console.settings.payments.provider.fail-url';
    case ProviderStatus = 'console.settings.payments.provider.status';
    case ProviderStatusHint = 'console.settings.payments.provider.status-hint';
    case ProviderModePairs = 'console.settings.payments.provider.mode-pairs';
    case ProviderModeJson = 'console.settings.payments.provider.mode-json';
    case ProviderAddPair = 'console.settings.payments.provider.add-pair';
    case ProviderKeyPlaceholder = 'console.settings.payments.provider.key-placeholder';
    case ProviderValuePlaceholder = 'console.settings.payments.provider.value-placeholder';
    case ProviderInvalidJson = 'console.settings.payments.provider.invalid-json';
    case ProviderJsonNotObject = 'console.settings.payments.provider.json-not-object';
    case ProviderCopyFrom = 'console.settings.payments.provider.copy-from';
    case ProviderCopySourcePlaceholder = 'console.settings.payments.provider.copy-source-placeholder';
    case ProviderCopyLoaded = 'console.settings.payments.provider.copy-loaded';
    case ProviderCopyFailed = 'console.settings.payments.provider.copy-failed';
    case ProviderSave = 'console.settings.payments.provider.save';
    case ProviderCancel = 'console.settings.payments.provider.cancel';
    case ProviderSaved = 'console.settings.payments.provider.saved';
    case ProviderSaveFailed = 'console.settings.payments.provider.save-failed';
    case ProviderLoadFailed = 'console.settings.payments.provider.load-failed';

    public static function service(): string
    {
        return 'pay';
    }

    public static function locale(): string
    {
        return 'ru';
    }

    public function defaultValue(): string
    {
        return match ($this) {
            self::NavPlans => 'Планы',
            self::NavPayments => 'Платежи',
            self::NavSubscriptions => 'Подписки',
            self::ServiceTitle => 'Платежи',
            self::ServiceDescription => 'Тарифы, платежи и подписки',
            self::ProviderConfigure => 'Настройки провайдера',
            self::ProviderTitle => 'Настройки {name}',
            self::ProviderDescription => 'Ключи доступа, URL-ы возврата и статус платёжного шлюза этого проекта.',
            self::ProviderCredentials => 'Ключи доступа (credentials)',
            self::ProviderProperties => 'Дополнительные параметры (properties)',
            self::ProviderReturnUrl => 'URL успешной оплаты',
            self::ProviderFailUrl => 'URL неуспешной оплаты',
            self::ProviderStatus => 'Провайдер активен',
            self::ProviderStatusHint => 'В архиве данные сохраняются, но платежи через провайдера не принимаются.',
            self::ProviderModePairs => 'Ключ → значение',
            self::ProviderModeJson => 'JSON',
            self::ProviderAddPair => 'Добавить пару',
            self::ProviderKeyPlaceholder => 'ключ',
            self::ProviderValuePlaceholder => 'значение',
            self::ProviderInvalidJson => 'Невалидный JSON — исправьте, чтобы сохранить.',
            self::ProviderJsonNotObject => 'JSON должен быть объектом «ключ → значение».',
            self::ProviderCopyFrom => 'Скопировать с проекта',
            self::ProviderCopySourcePlaceholder => 'Проект-источник',
            self::ProviderCopyLoaded => 'Настройки подставлены в форму — проверьте и сохраните.',
            self::ProviderCopyFailed => 'Не удалось получить настройки проекта-источника.',
            self::ProviderSave => 'Сохранить',
            self::ProviderCancel => 'Отмена',
            self::ProviderSaved => 'Настройки провайдера сохранены.',
            self::ProviderSaveFailed => 'Не удалось сохранить настройки провайдера.',
            self::ProviderLoadFailed => 'Не удалось загрузить настройки провайдера.',
        };
    }
}
