Исправление сборки GitHub Actions

Ошибка:
  sh: 1: vite: not found

Причина:
  В runner GitHub Actions команда npm run build не нашла бинарник vite в node_modules/.bin.

Что изменено:
  1. На шаге Install deps зависимости ставятся с --include=dev.
  2. Vite дополнительно гарантированно устанавливается перед сборкой.
  3. Перед build выводится npx vite --version для диагностики.
  4. Build web теперь запускает:
       node scripts/write-version.js
       npx vite build

Обычный push собирает APK в Artifacts.
Push тега vX.X.X собирает APK и публикует GitHub Release.
