Alter Editing Method Mobile

Основные файлы:
- build-dev-apk.bat — тестовая сборка в ветку dev, APK в GitHub Actions / Artifacts.
- build-main-apk.bat — сборка main, APK в GitHub Actions / Artifacts.
- release-mobile.bat — официальный релиз через GitHub Releases.
- create-release-keystore.bat — создание ключа подписи APK.

Текущий фикс:
- убран мусор от старых правок/README-файлов;
- Google external-login отключён, чтобы не было белого зависшего экрана;
- TikTok login работает в mobile viewport и светлой схеме;
- кнопка "Открыть приложение TikTok" скрывается;
- переходы в App Store / Google Play / download-страницы блокируются внутри WebView;
- TikTok Studio upload остаётся в desktop viewport;
- кнопки публикации и модальные окна TikTok Studio не переносятся скриптом;
- сохранён только безопасный фикс цвета внутренней карточки выбора видео.

Patch/elst-логика не менялась.
