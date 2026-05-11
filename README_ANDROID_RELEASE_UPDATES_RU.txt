Android auto-update through GitHub Releases

Что добавлено:
1. GitHub Actions теперь может не только собирать APK, но и публиковать GitHub Release.
2. Приложение проверяет последний GitHub Release через GitHub API.
3. Если версия в Release выше установленной версии, приложение показывает окно:
   "Вышла новая версия" -> "Установить".
4. Кнопка "Установить" открывает APK из GitHub Release. Android дальше показывает стандартную установку APK.

Важно:
Android не разрешает приложению тихо обновлять само себя без участия пользователя.
Пользователь всё равно должен подтвердить установку APK в системном установщике.

Самое важное для обновлений:
Каждая новая версия APK должна быть подписана тем же ключом, что и предыдущая.
Если подпись будет другой, Android не установит обновление поверх старой версии.

Нужно один раз создать keystore и добавить секреты в GitHub:
Repository -> Settings -> Secrets and variables -> Actions -> New repository secret

Нужные секреты:
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD

Пример создания keystore локально:
keytool -genkeypair -v -keystore alter-release.keystore -alias alterediting -keyalg RSA -keysize 2048 -validity 10000

Пример получения Base64 для GitHub Secret:
Windows PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("alter-release.keystore")) | Set-Clipboard

После этого:
1. Обнови version в package.json, например 1.0.1.
2. Сделай commit и push.
3. Создай тег:
   git tag v1.0.1
   git push origin v1.0.1

GitHub Actions соберёт release APK и прикрепит его к GitHub Releases.
Приложение увидит новую версию и покажет кнопку установки.

Можно также запустить workflow вручную:
Actions -> Build Android APK -> Run workflow -> publish_release = true -> version = 1.0.1

