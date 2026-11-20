# Контракт данных APOD (schemaVersion 1)

`website/public/data/manifest.json` — точка входа статического сайта. Он содержит версию схемы, время успешной генерации в ISO 8601 UTC (или `null` для пустого архива) и описание источников с количеством записей и относительным путём к индексу.

Каждый индекс — JSON-объект с полями `schemaVersion`, `source`, `generatedAt` и массивом `items`. APOD-индекс содержит реальные нормализованные публикации; остальные источники остаются пустыми до следующих спринтов.

Нормализованная запись APOD:

| Поле | Назначение |
|---|---|
| `id` | стабильный идентификатор записи |
| `source` | `apod`, `epic` или `library` |
| `date` | дата публикации источника |
| `title` | заголовок |
| `description` | описание |
| `mediaType` | тип медиа |
| `mediaUrl` | URL основного ресурса |
| `thumbnailUrl` | URL миниатюры или `null` |
| `sourceUrl` | каноническая страница NASA |
| `credits` | авторство/кредиты или `null` |
| `copyright` | сведения об авторских правах или `null`; отсутствие обычно означает материал NASA/public domain, но сайт не должен делать автоматический юридический вывод |
| `retrievedAt` | время получения в ISO 8601 UTC |

TypeScript-представление для будущего сайта:

```typescript
type ApodMediaType = "image" | "video" | "iframe" | "other";

interface ApodRecord {
  id: string;
  source: "apod";
  date: string;
  title: string;
  description: string;
  mediaType: ApodMediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  sourceUrl: string;
  credits: string | null;
  copyright: string | null;
  retrievedAt: string;
  localMediaUrl?: string | null;
  mediaStorageStatus?: "private_archive" | "local_public" | "external_only";
  rightsStatus?: "nasa_public_domain" | "review_required";
}
```

Все обязательные строки непустые. `date` использует `YYYY-MM-DD`, `retrievedAt` — ISO 8601 UTC, URL допускают только `http`/`https`. HTML NASA преобразуется в обычный текст. Пути индексов обязаны быть относительными, не содержать `..` и оставаться внутри папки данных.

Поля Sprint 002.1 необязательны и обратно совместимы. `localMediaUrl` — относительный POSIX-путь от `website/public`, никогда не абсолютный Windows-путь. Если он равен `null` или отсутствует, сайт использует внешний `mediaUrl`. `private_archive` означает, что оригинал есть локально, но не опубликован; `local_public` означает наличие проверенного web-файла. `review_required` запрещает автоматическое копирование в публичную папку до ручной проверки прав.

Запись JSON выполняется через временный файл в целевой директории с последующей атомарной заменой. Сначала полностью проверяется и публикуется индекс, и только после этого обновляется `manifest.json`. Записи дедуплицируются по стабильному `id` вида `apod:YYYY-MM-DD` и сортируются от новых к старым.

Источник APOD: [официальный APOD Feed and API User Guide](https://api.nasa.gov/assets/files/apod/APOD-APIs-and-RSS-info.pdf). Используется новый endpoint `https://science.nasa.gov/wp-json/wp/v2/apod-basic`; legacy endpoint намеренно не используется.

Правовая политика основана на [APOD image permissions](https://science.nasa.gov/apod/apod-about/) и [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). Автоматическая публикация намеренно консервативна: только точная кредитная строка `NASA`; смешанные и сторонние кредиты получают `review_required`.

