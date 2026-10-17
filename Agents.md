# Project Agent Guidelines (`Agents.md`)

This document defines the architectural conventions and workspace rules for AI agents working in this repository.

---

## Architecture & Repository Structure

### 1. Monorepo Component Isolation
- When working in a monorepo (for example, a repository containing both `frontend` and `backend` components together), **strict component isolation** is the preferred setup.
- Each component inside the repository must maintain its own independent setup, dependencies, and configuration rather than coupling or sharing setup across components—unless the shared logic is explicitly extracted into a dedicated shared module/package.
- Avoid cross-boundary imports or shared ad-hoc configuration files between distinct service components.

### 2. Containerization & Docker Setup
- Following the component isolation principle, container definitions must be scoped to each individual component rather than using a single monolithic root `Dockerfile`:
  - **Backend**: Maintain a dedicated `Dockerfile` inside the backend directory (e.g., `backend/Dockerfile`).
  - **Frontend**: Maintain a dedicated `Dockerfile` inside the frontend directory (e.g., `frontend/Dockerfile`).
- **Default Container Entrypoint (`CMD`)**: Each `Dockerfile`'s `CMD` must point to `scripts/start.sh` with `--prod` by default (e.g., `CMD ["./scripts/start.sh", "--prod"]`) so containers run in production mode out of the box rather than falling back to the script's local `--dev` default.
- **Root Orchestration**: Use a `docker-compose.yml` file at the repository root to orchestrate, build, and run all component containers together.

### 3. Task & Lifecycle Management (`scripts/` Folder)
- Prefer managing operational tasks—such as `start`, `stop`, `test`, `build`, and deployment workflows—through standalone scripts inside a dedicated `scripts/` folder rather than relying on language-specific task runners or package managers (e.g., `npm scripts`, `poetry`, `pipenv`, `cargo`, `gradle`).
- Use language-specific task management only when strictly necessary (for example, when required internally by a framework/toolchain or called under the hood by a script in `scripts/`).
- **Environment Mode Handling (`--dev` vs. Production)**: Execution scripts (such as `scripts/start.sh`) must include built-in logic to determine whether they are running in development or production mode:
  - `--dev` (the default when no argument is provided: `MODE=${1:---dev}`) indicates **development mode** (enabling dev-specific flags such as file watching / HMR).
  - Passing `--prod` (or any non-`--dev` mode, as used by `Dockerfile` `CMD ["./scripts/start.sh", "--prod"]`) runs in **production mode**.
  - Example (`scripts/start.sh`):
    ```bash
    #!/usr/bin/env bash
    set -ex

    MODE=${1:---dev}

    if [ "$MODE" == "--dev" ]; then
        # Run in development mode (e.g., with watch / HMR enabled)
        deno serve -P --port 8084 --watch-hmr ./main.ts
    else
        # Run in production mode (e.g., when invoked with --prod from Dockerfile CMD)
        deno serve -P --port 8084 ./main.ts
    fi
    ```
