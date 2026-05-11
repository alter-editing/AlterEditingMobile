Оптимизация Android версии без изменения функционала

Что изменено:
1. Patch MP4/MOV теперь выполняется потоково чанками по 1 MB, если APK собран с Android GalleryBridge.
   Раньше видео полностью читалось в память, затем создавался Blob и полный Base64. На слабых телефонах это могло давать лаги и вылеты.
   Логика elst осталась прежней: поиск сигнатуры elst и запись тех же байтов PATCH_BYTES.

2. Добавлены настройки Android WebView/MainActivity для стабильности на разных версиях Android:
   - hardware acceleration;
   - DOM storage / database / file/content access;
   - fixed text zoom 100%;
   - mixed content compatibility;
   - safe browsing для Android 8+;
   - корректная очистка TikTok WebView при закрытии.

3. AndroidManifest через scripts/patch-android.js теперь дополнительно включает:
   - hardwareAccelerated=true;
   - resizeableActivity=true;
   - requestLegacyExternalStorage=true;
   - supportsRtl=true;
   - supports-screens для small/normal/large/xlarge экранов.

4. Частицы и фон оптимизированы под слабые устройства:
   - меньше нагрузка на low-RAM/low-core телефонах;
   - canvas не перерисовывается слишком часто;
   - при скрытом приложении анимация не нагружает устройство.
   Внешне анимация сохранена.

5. CSS адаптирован под разные Android-экраны:
   - safe-area;
   - 100svh/100dvh fallback;
   - сверхмаленькие экраны 320px;
   - планшеты/крупные телефоны.

6. Исправлена загрузка подключённого шрифта:
   файл называется "TT Bluescreens Regular.ttf", поэтому путь в @font-face приведён к правильному URL с пробелами.

Не изменено:
- авторизация;
- вход в TikTok аккаунт;
- desktop TikTok WebView;
- запрет открытия мобильного TikTok через tiktok://, snssdk://, intent://;
- UI-поведение и тексты;
- сама elst patch-логика и байты патча.

Важно:
После `npx cap add android` и `npx cap sync android` обязательно запускать:
node scripts/patch-android.js

Затем собирать APK через Gradle/GitHub Actions.
