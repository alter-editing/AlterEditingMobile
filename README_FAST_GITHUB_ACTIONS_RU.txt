Ускоренная сборка GitHub Actions

Что изменено:
- Убрана команда npm cache clean --force. Она каждый раз удаляла кэш и заставляла GitHub заново скачивать зависимости.
- Убрана отдельная повторная установка vite и @capacitor/cli. Они уже закреплены в devDependencies package.json.
- Install deps теперь использует:
  npm install --include=dev --no-audit --no-fund --legacy-peer-deps --prefer-offline
- Проверка vite/cap сохранена через npx vite --version и npx cap --version.

Ожидаемый результат:
- Шаг Install deps должен проходить быстрее.
- Если запуск обычный push в main, APK появится в Actions > Artifacts.
- Если запуск через tag vX.X.X, APK после успешной сборки прикрепится к GitHub Release.
