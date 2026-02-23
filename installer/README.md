# Sirius Installer

`sirius-installer` is the first-run setup utility for Sirius startup and secrets configuration.

## What it does

- Reads template values from `.env.production.example`
- Merges with existing `.env` values (idempotent by default)
- Generates missing required secrets:
  - `SIRIUS_API_KEY`
  - `POSTGRES_PASSWORD`
  - `NEXTAUTH_SECRET`
  - `INITIAL_ADMIN_PASSWORD`
- Supports interactive and non-interactive modes
- Supports `--force` regeneration and secret-safe output flags

## Recommended usage from repository root

Use the installer Compose entrypoint (preferred):

```bash
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
```

## Local usage

```bash
cd installer
go run ./cmd/sirius-installer --template ../.env.production.example --output ../.env
```

## Docker usage

```bash
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
```

## Non-interactive usage

```bash
docker compose -f docker-compose.installer.yaml run --rm sirius-installer \
  --non-interactive \
  --no-print-secrets
```

## Useful flags

- `--force`: regenerate required secrets even if they already exist
- `--non-interactive`: never prompt; suitable for CI/user-data
- `--no-print-secrets`: suppress secret values in installer output
