# Changelog

All notable changes to this repository are recorded in this file.

## 2026-05-19 — Repository layout

- **Folders:** `backend/` (`pdf_parser.py`, `point_calculator.py`), `data/` (`meets.json`, `scoring_settings.json` at runtime), `scripts/` (Node utilities including `scan_deps.mjs`, asset helpers, `applet/`), `tests/` (former `test_suite/`), `docs/` (changelog + consolidated docs; former `documentation/`), `tools/python/` (dev/compare/debug scripts from repo root), `archive/checkpoints/` (former `checkpoints/`).
- **Server:** `server.ts` resolves `PROJECT_ROOT` via `import.meta.url`; spawns Python with absolute paths; sets `OMNI_PROJECT_ROOT` and `OMNI_DATA_DIR`; migrates legacy root `meets.json` / `scoring_settings.json` into `data/` when present; Vite `root` and production `dist` use `PROJECT_ROOT`.
- **Python:** `backend/point_calculator.py` resolves scoring settings via `OMNI_DATA_DIR`, then `data/`, then legacy locations; utilities updated to call `backend/` scripts and repo-relative paths (no machine-specific roots).
- **Tooling:** `predev` / `start.bat` / `start.sh` call `node scripts/scan_deps.mjs`; `run_all_tests.bat` uses `%~dp0`, `backend\pdf_parser.py`, and `tests\` outputs; `public/OMNISWIMLOGO.png` moved from repo root.
- **Frontend config:** `vite.config.ts` and `tsconfig.json` map `@/*` to `src/`; Vite watch ignores include `data/*.json`.
- **QA:** Added `scripts/smoke_parse_pdf.mjs` and `npm run smoke:parse` for a quick `/api/parse-pdf` check against a sample PDF.
- **Docs:** Root `README.md` links to `docs/CHANGELOG.md` and `docs/CODEBASE_DOCS.md`; project structure section updated for the new layout.

## 2026-05-13 — Scoring & Parsing Refactor

- Improved team-name recognition and canonicalization in `backend/pdf_parser.py` (formerly root `pdf_parser.py`) to reduce duplicate/garbled team entries.
- Made scoring engine configurable in `backend/point_calculator.py`. Introduced NCAA D2 default scoring (Top-16) and settings keys: `scoringPoints`, `relayMultiplier`, `halfRateRelaySwimmer`, `maxIndividualScorersPerTeam`, `maxRelaysScoringPerTeam`, `maxRosterSize`.
- `point_calculator.py` reads `data/scoring_settings.json` (or legacy paths). `server.ts` writes current workspace scoring settings before invoking the Python calculator.
- Fixed multiple parsing and scoring bugs (duplicate else block, relay tie handling, team aggregation).
- Added `utils/compare_all_teams.py` helper and improved it to fuzzy-align official PDF names to parsed keys for better comparisons.
- Created checkpoint snapshots in `archive/checkpoints/checkpoint_2026-05-13/`.

## Notes
- These changes make scoring behavior configurable from the frontend. The default is NCAA D2 Top-16 scoring semantics.
- Future steps: add unit tests and per-event delta reports; implement Hy-Tek place-compression exact semantics if needed.
