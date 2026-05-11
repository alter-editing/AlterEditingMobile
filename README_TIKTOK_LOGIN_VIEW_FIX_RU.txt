Исправление TikTok WebView login/studio view

Что исправлено:
- На странице входа TikTok больше не применяется принудительный desktop viewport 1280px.
- Login-страница использует обычный mobile viewport width=device-width и тёмный фон на всю высоту экрана.
- Desktop viewport 1280px применяется только для TikTok Studio / upload страниц.
- Фикс нижних кнопок публикации применяется только на upload/studio, а не на странице входа.

Зачем:
После предыдущего фикса TikTok Studio desktop-режим начал применяться и к странице входа. Из-за этого Android WebView показывал тёмную часть сверху и большую белую область снизу.

Функционал patch/elst, авторизация, релизы, ветки main/dev и батники не менялись.
