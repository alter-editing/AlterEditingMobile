# Android signing secrets для GitHub Release

Ошибка:

Missing ANDROID_KEYSTORE_BASE64. Add Android signing secrets before publishing releases.

означает, что ты запустил релиз через tag `v...`, но в GitHub репозитории ещё нет ключа подписи APK.

## Почему это обязательно

Обычный build может собрать debug APK без секретов.

Но release APK для пользователей должен быть подписан одним и тем же ключом каждый раз. Иначе Android не установит новую версию поверх старой.

Если сегодня APK подписан одним ключом, а завтра другим, пользователь увидит ошибку установки или ему придётся удалять старое приложение.

## Какие secrets нужны

В GitHub открой:

Settings → Secrets and variables → Actions → New repository secret

Добавь 4 секрета:

1. ANDROID_KEYSTORE_BASE64
2. ANDROID_KEYSTORE_PASSWORD
3. ANDROID_KEY_ALIAS
4. ANDROID_KEY_PASSWORD

## Как создать ключ на Windows

Запусти:

create-release-keystore.bat

Он создаст:

- alter-release-key.jks
- android-keystore-base64.txt

В GitHub secrets добавь:

ANDROID_KEYSTORE_BASE64 = содержимое android-keystore-base64.txt без строк BEGIN/END CERTIFICATE
ANDROID_KEYSTORE_PASSWORD = пароль keystore
ANDROID_KEY_ALIAS = alterediting
ANDROID_KEY_PASSWORD = пароль ключа

## Важно

Файл alter-release-key.jks нельзя терять. Это главный ключ обновлений.

Не загружай alter-release-key.jks в GitHub.
Не отправляй его публично.
Сохрани копию в безопасном месте.

## Что использовать

- build-apk.bat — тестовая сборка, Release не создаёт.
- release-mobile.bat — релизная сборка, требует signing secrets.

