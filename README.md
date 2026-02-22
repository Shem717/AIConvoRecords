# AIConvoRecords

HTML-based record for hosting past AI conversations.

## Content Pipeline (Source of Truth)

- `pending/` = intake only (not deployed directly)
- `public/` + `public/conversations.json` = deployed source of truth

Use:

```bash
npm run import-convos
npm run validate-convos
```

`import-convos` now de-duplicates by content hash against `public/` and records metadata (`contentHash`, `lastImportedAt`) in `conversations.json`.

## Safety Gates

CI runs `validate-convos` to fail on:
- duplicate conversation IDs
- missing indexed files
- duplicate HTML content inside `public/`

It also warns on pending/public hash collisions and orphan public HTML files.
