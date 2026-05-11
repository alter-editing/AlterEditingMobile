ЧИСТАЯ СХЕМА ВЕТОК И БАТНИКОВ

В проекте теперь 2 главных батника:

1) build-dev-apk.bat
   - работает с веткой dev
   - если dev нет, создаёт её от main
   - пушит только в dev
   - запускает тестовую сборку в GitHub Actions
   - НЕ создаёт GitHub Release

2) build-main-apk.bat
   - работает с веткой main
   - пушит только в main
   - запускает обычную сборку в GitHub Actions
   - НЕ создаёт GitHub Release

Для настоящего релиза пользователям оставь release-mobile.bat.
Он создаёт tag v... и публикует APK в GitHub Releases.

ВАЖНО:
- build-dev-apk.bat — для проверки перед релизом.
- build-main-apk.bat — для обычной сборки main.
- release-mobile.bat — для официального обновления пользователей.

ПЕРВЫЙ ЗАПУСК DEV
Если у тебя удалены все ветки кроме main, просто запусти build-dev-apk.bat.
Он сам создаст dev и отправит её на GitHub.

РУЧНЫЕ КОМАНДЫ ДЛЯ СОЗДАНИЯ DEV
Если хочешь сделать вручную:

git checkout main
git pull origin main
git checkout -b dev
git push -u origin dev

ПОСЛЕ ПРОВЕРКИ DEV
Когда dev APK проверен и всё хорошо:

git checkout main
git pull origin main
git merge dev
git push origin main

После этого можно выпускать релиз через release-mobile.bat.
