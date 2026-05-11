Исправление сборки GitHub Actions

Проблема:
На шаге Install deps команда npm ci могла зависать и падать с ошибкой:
  npm error Exit handler never called!

Что изменено:
- npm ci заменён на более устойчивый npm install.
- Перед установкой очищается npm cache.
- Добавлен --legacy-peer-deps, чтобы снизить риск конфликтов зависимостей на runner.
- Vite и Capacitor CLI дополнительно гарантированно устанавливаются как dev-зависимости перед сборкой.

Это не меняет функционал приложения. Изменён только GitHub Actions workflow для более стабильной сборки APK и Release.
