# Financial Coach Plugin, Subagents & Scheduled Automations Installation Guide

This directory contains the `financial-coach` Antigravity plugin, its custom
subagents, and its scheduled sidecar automations:

- **`financial-coach/plugin.json`**: Plugin manifest.
- **`financial-coach/agents/statement-extractor.md`**: Custom subagent 1 —
  inspects multi-bank PDF statements (`AMEX`, `Barclays`, `Chase`, `HSBC`)
  across cut-off dates, extracts factual transactions for `YYYY-MM` with
  `source` and `institution.bankName`, and writes
  `.cache/statements/Consolidated/YYYY-MM_[turn].json`.
- **`financial-coach/agents/statement-classifier.md`**: Custom subagent 2 —
  classifies transaction spending categories via `merchantCategoryCode`
  (`bank-statement/mcc.ts`) and generates structured `aiReview` financial
  coaching commentary in
  `.cache/statements/Consolidated/YYYY-MM_classify_[turn].json`.
- **`financial-coach/sidecars/financial-coach-daily-sync/sidecar.json`**: Daily
  statement sync & deduplication automation (`CRON_TZ=Europe/London 0 9 * * *`).
- **`financial-coach/sidecars/financial-coach-monthly-consolidate/sidecar.json`**:
  Monthly post-payday statement consolidation automation
  (`CRON_TZ=Europe/London 0 10 15 * *`).
- **`../../../scripts/rclone.sh`**: Containerized `rclone` wrapper (stores
  config at `server/config/rclone.conf` and mounts `.cache/statements` as
  `/data/statements`).
- **`../../../scripts/print-statement.sh`**: Containerized headless Chromium
  wrapper that prints `https://finance.home.handy-david.dev/statements/YYYY-MM`
  to `.cache/statements/Consolidated/YYYY-MM.pdf`.

> [!IMPORTANT]
> The repository's `sidecar.json` templates do **not** hardcode `workspace_uris`
> in `agent_permissions`. Instead, `workspace_uris` is injected dynamically
> using the current `financial-coach` project root (`file://$(pwd)`) when
> installing or updating the plugin and its sidecars.

---

## Step 1: Configure `server/config/rclone.conf`

From the **`financial-coach` project root** (`cd /path/to/financial-coach`),
run:

```bash
./scripts/rclone.sh config
```

1. Create a new remote named `gdrive` (type `drive` / Google Drive) and complete
   OAuth authentication. This writes `server/config/rclone.conf` (ignored by Git
   and Docker).
2. Verify deduplication and sync against Google Drive
   (`gdrive:expense/Statements`):
   ```bash
   ./scripts/rclone.sh dedupe --dedupe-mode newest gdrive:expense/Statements
   ./scripts/rclone.sh sync gdrive:expense/Statements /data/statements --exclude Consolidated/**
   ```

---

## Step 2: Install or Update the Plugin, Subagents & Sidecars

Run the following commands from the **`financial-coach` project root**
(`cd /path/to/financial-coach`):

```bash
PROJECT_ROOT="$(pwd)"
PROJECT_URI="file://${PROJECT_ROOT}"

mkdir -p ~/.gemini/config/plugins ~/.gemini/config/sidecars ~/.gemini/config/agents

# 1. Symlink the plugin into ~/.gemini/config/plugins/
ln -sfn "${PROJECT_ROOT}/.gemini/config/plugins/financial-coach" ~/.gemini/config/plugins/financial-coach

# 2. Symlink custom subagents into project (.agents/agents/<name>/agent.md) and global (~/.gemini/config/agents/<name>/agent.md)
for a in "${PROJECT_ROOT}"/.gemini/config/plugins/financial-coach/agents/*.md; do
  [ -f "$a" ] || continue
  AGENT_NAME="$(basename "$a" .md)"
  mkdir -p "${PROJECT_ROOT}/.agents/agents/${AGENT_NAME}" ~/.gemini/config/agents/"${AGENT_NAME}"
  ln -sfn "$a" "${PROJECT_ROOT}/.agents/agents/${AGENT_NAME}/agent.md"
  ln -sfn "$a" ~/.gemini/config/agents/"${AGENT_NAME}/agent.md"
done

# 3. Install/update each sidecar into ~/.gemini/config/sidecars/<sidecar-id>/sidecar.json
#    and dynamically inject workspace_uris with the current project root URI
for s in "${PROJECT_ROOT}"/.gemini/config/plugins/financial-coach/sidecars/*; do
  [ -d "$s" ] || continue
  SIDECAR_ID="$(basename "$s")"
  rm -rf ~/.gemini/config/sidecars/"${SIDECAR_ID}"
  mkdir -p ~/.gemini/config/sidecars/"${SIDECAR_ID}"
  deno eval --no-config "
    const src = '${s}/sidecar.json';
    const dst = Deno.env.get('HOME') + '/.gemini/config/sidecars/${SIDECAR_ID}/sidecar.json';
    const c = JSON.parse(Deno.readTextFileSync(src));
    c.agent_permissions = { workspace_uris: ['${PROJECT_URI}'], ...c.agent_permissions };
    Deno.writeTextFileSync(dst, JSON.stringify(c, null, 2) + '\n');
  "
done
```

---

## Step 3: Verify & Enable in Antigravity Automations Dashboard

1. Check the installed sidecar configs in `~/.gemini/config/sidecars/`:
   ```bash
   cat ~/.gemini/config/sidecars/financial-coach-daily-sync/sidecar.json
   cat ~/.gemini/config/sidecars/financial-coach-monthly-consolidate/sidecar.json
   ```
   Confirm `agent_permissions.workspace_uris` contains
   `["file://<your-financial-coach-path>"]` while `git status` inside
   `financial-coach` remains clean.
2. Open the Antigravity **Automations** dashboard (`sidecar://dashboard`) and
   enable:
   - **"Financial Coach Daily Statement Sync"** (`financial-coach-daily-sync`)
   - **"Financial Coach Monthly Statement Consolidation"**
     (`financial-coach-monthly-consolidate`)
