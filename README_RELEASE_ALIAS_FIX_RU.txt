# Исправление alias для Android release key

Проблема из лога:

```
No key with alias **** found in keystore
```

Означает, что `ANDROID_KEY_ALIAS` в GitHub Secrets не совпал с реальным alias внутри `alter-release-key.jks`.

В этом архиве workflow исправлен:

- перед сборкой он выводит alias из keystore в логах;
- если secret `ANDROID_KEY_ALIAS` указан неправильно, workflow автоматически берёт первый найденный alias из keystore;
- правильный alias передаётся дальше в Gradle через `ANDROID_KEY_ALIAS`.

Для твоего текущего helper-скрипта alias обычно такой:

```
alterediting
```

Лучше также вручную обновить GitHub Secret:

```bat
gh secret set ANDROID_KEY_ALIAS -b "alterediting"
```

После этого запускай `release-mobile.bat` с новой версией, например `1.0.4`.
