Исправление release-сборки Android

Что исправлено:
1. signingConfig теперь добавляется только внутрь buildTypes.release, а не внутрь signingConfigs.release.
2. Если generated android/app/build.gradle не содержит compileSdk/compileSdkVersion, скрипт добавляет:
   compileSdkVersion rootProject.ext.compileSdkVersion
3. Release-сборка по тегу v* должна проходить после добавления Android signing secrets.

Что делать:
1. Замени файлы проекта файлами из архива.
2. Запусти release-mobile.bat с новой версией, например 1.0.3.
3. Старые теги v1.0.0/v1.0.1/v1.0.2 лучше не использовать повторно.
