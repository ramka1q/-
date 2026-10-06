# My Mod (Fabric, Minecraft 1.21.1)

Шаблон мода для Minecraft на **Fabric**, зроблений з офіційного `fabric-example-mod`.

## Що треба на комп'ютері

1. **IntelliJ IDEA** (Community безкоштовна): https://www.jetbrains.com/idea/download/
2. **Java 21** (JDK). Можна поставити прямо з IntelliJ: *File → Project Structure → SDK → Download JDK → версія 21*.
3. Бажано плагін **Minecraft Development** в IntelliJ (*Settings → Plugins → Marketplace*).

## Як відкрити

1. В IntelliJ: *File → New → Project from Version Control* і встав посилання
   `https://github.com/ramka1q/-` (гілка `claude/upbeat-lovelace-f9ptv4`, поки її не злили в main).
   Або скачай ZIP з GitHub, розпакуй і *File → Open* цю папку.
2. Чекай, поки Gradle все скачає (перший раз 5–15 хвилин — він качає Minecraft).
3. Тепер у проєкті тільки твій мод.

## Як запустити Minecraft з модом

- Зверху справа вибери **runClient** і натисни зелену ▶.
- Або справа відкрий вкладку **Gradle → Tasks → fabric → runClient**.
- Або в терміналі: `./gradlew runClient` (Windows: `gradlew runClient`).

У консолі має з'явитись: `Мій мод завантажився!`

## Де що лежить

| Файл | Що це |
|---|---|
| `src/main/java/com/mymod/MyMod.java` | головний код мода (предмети, блоки, події) |
| `src/client/java/com/mymod/client/MyModClient.java` | код тільки для клієнта (рендер, клавіші) |
| `src/main/resources/fabric.mod.json` | назва, опис, автор мода |
| `src/main/resources/assets/mymod/` | текстури, моделі, переклади |
| `gradle.properties` | версії Minecraft / Fabric |

## Зібрати готовий .jar

`./gradlew build` → файл буде в `build/libs/`. Кидаєш його в папку `mods` разом з Fabric API.
