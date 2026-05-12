Жёсткое исправление Upload через Brave

Что изменено:
- Microsoft Edge полностью удалён из сценария TikTok Upload.
- Убран fallback на Edge/Chrome/Firefox/Opera/системный выбор.
- TikTok Upload должен открываться только через Brave: com.brave.browser.
- Если Brave не установлен, открывается Play Market на странице Brave:
  market://details?id=com.brave.browser
- Добавлена пост-обработка Android-кода в scripts/patch-android.js, чтобы старые native-файлы тоже очищались от Edge.
- Telegram-авторизация не изменялась.

Важно:
После распаковки архива нужно заменить файлы проекта, затем выполнить:
npm run build
npx cap sync android
node scripts/patch-android.js
и только потом собирать APK.
