Исправление сборки GitHub Actions

Проблема:
npm install / npm ci в GitHub Actions падал с ошибкой:
Exit handler never called!
После этого npx пытался докачать vite и сборка ломалась.

Что изменено:
- workflow больше не использует npm install/npm ci для установки зависимостей;
- включён pnpm через corepack;
- зависимости ставятся командой:
  pnpm install --no-frozen-lockfile --prefer-offline
- Vite и Capacitor запускаются только локально:
  pnpm exec vite build
  pnpm exec cap sync android

Что делать:
1. Замени файлы в репозитории файлами из архива.
2. Запусти build-apk.bat для обычной проверки.
3. Для релиза используй release-mobile.bat.

Если сборка идёт через build-apk.bat, APK будет в Actions Artifacts.
Если сборка идёт через release-mobile.bat и пушится tag vX.X.X, APK будет прикреплён к GitHub Release.
