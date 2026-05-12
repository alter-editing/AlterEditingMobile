TikTok Edge Studio fix

Изменения:
- Upload теперь открывает Microsoft Edge сразу на прямой странице TikTok Studio Upload:
  https://www.tiktok.com/tiktokstudio/upload?from=creator_center
- Старый адрес https://www.tiktok.com/upload больше не используется, потому что на мобильных устройствах он может редиректить на tiktokstudio.onelink.me и пытаться открыть TikTok Studio app.
- Telegram-авторизация не изменялась. Проверка авторизации осталась как была.
- Защита от быстрых повторных нажатий Upload оставлена.

Если Edge всё равно покажет окно открытия приложения, пользователю нужно нажать «Отмена». Это уже поведение самой страницы/браузера после редиректа TikTok, но прямой TikTok Studio URL должен уменьшить вероятность такого сценария.
