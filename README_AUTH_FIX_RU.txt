Исправление ошибки Failed to fetch.

Причина:
Android WebView делает запросы как браузер, а сервер авторизации может не отдавать CORS-заголовки.
Поэтому fetch() падает с Failed to fetch.

Что изменено:
1. В src/mobile-bridge.js добавлен CapacitorHttp из @capacitor/core.
2. Все запросы авторизации идут через native HTTP, а не через браузерный fetch.
3. Старый fetch оставлен как fallback.
4. HTTP cleartext для IP уже включается через scripts/patch-android.js.

Что сделать:
1. Залить файлы из архива поверх проекта.
2. Commit changes.
3. Actions → Build Android APK → Run workflow.
4. Удалить старое приложение с телефона.
5. Установить новый APK.
