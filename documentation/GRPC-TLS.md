# Agent gRPC TLS: deployment and upgrade

The TLS-enabled app-agent release requires authenticated TLS on port 50051.
Agents verify the server certificate chain, expiry and expected hostname/IP
before sending their token or accepting commands. There is no network plaintext
fallback. This is a coordinated server/agent upgrade, not a drop-in image update.

## Provision before starting or upgrading

1. Obtain a server certificate and matching private key from your existing PKI.
   Include the actual DNS names/IPs agents connect to in the certificate SANs.
   The certificate file must contain the leaf followed by any intermediates.
   The installer does **not** create these files or manage a certificate authority.
2. Place the files on the Docker host. By default, base Compose reads
   `./secrets/grpc/server-chain.pem` and `./secrets/grpc/server-key.pem`. The
   `secrets/` tree is gitignored. Never commit keys or put them in an image.
   Alternatively set the following **host path** variables in `.env` or export
   them in the shell that runs Compose:

   ```sh
   SIRIUS_GRPC_TLS_CERT_FILE=/absolute/path/to/server-chain.pem
   SIRIUS_GRPC_TLS_KEY_FILE=/absolute/path/to/server-key.pem
   ```

3. Ensure the files are readable by the chosen engine image runtime user (the
   production image runs as `sirius`). Use the actual UID/GID of the selected
   image and restrict private-key access to that service identity. Do not make
   the private key world-readable to work around permissions. No permission
   changes or key generation are performed automatically.
4. Distribute the public CA bundle and expected engine name to agents through a
   trusted administrative channel. Never distribute the server private key.

Base `docker-compose.yaml` fixes `GRPC_TRANSPORT=tls` and mounts the files
read-only at `/run/sirius/tls/server-chain.pem` and
`/run/sirius/tls/server-key.pem`. It supplies those paths as `GRPC_TLS_CERT_FILE`
and `GRPC_TLS_KEY_FILE` to the engine. Development, production and source-build
overlays inherit this configuration. Exporting only `GRPC_TLS_CERT_FILE` on the
host is **not** enough: use the `SIRIUS_GRPC_TLS_*` host-path variables above.

Missing host files cause container creation to fail. The bind mounts disable
host-path auto-creation, so a typo will not become an empty directory. Invalid,
unreadable or mismatched certificate/key files cause the gRPC server to refuse
startup. An expired or wrongly named server certificate is rejected by agents.

## Agent configuration

For a private CA:

```sh
SERVER_ADDRESS=engine.example.com:50051 \
GRPC_TLS_CA_FILE=/etc/sirius/tls/engine-ca.pem \
./sirius-agent
```

The agent uses system roots if `GRPC_TLS_CA_FILE` is unset. A configured CA bundle
replaces system roots. For an IP connection to a DNS certificate, set
`GRPC_TLS_SERVER_NAME` to its expected DNS name; verification remains enabled.
Containerized agents need their own read-only **public CA** mount and these agent
environment variables. The server certificate/key mounts do not configure or
provision remote agents.

## Release gate and rollout

Do not deploy a TLS-enabled engine until the files and updated agent trust
configuration are ready. Old plaintext agents cannot connect to the new server;
updated agents cannot connect to old plaintext servers. Preserve existing agent
IDs and tokens. Do not reset tokens to work around a TLS error.

1. Pin matching tested server/agent releases, provision files, and stage the
   upgrade. If building from source, confirm the engine image actually contains
   the TLS app-agent revision; the Dockerfile currently fetches app-agent from
   its upstream repository rather than this local sibling checkout.
2. Render the chosen Compose combination with `docker compose ... config --quiet`.
   Rendering validates wiring only: it does **not** prove files exist, runtime
   permissions are correct, or certificates are trusted and current.
3. In staging, verify server startup, certificate name/chain, initial enrollment,
   token-based reconnection and a harmless status command using updated agents.
   The existing TCP health check alone does not verify TLS or agent connectivity.
4. Schedule a coordinated rollout. Keep the normal Compose command for your
   chosen overlay; no extra TLS overlay is required. Apply only during planned
   maintenance after staging checks pass.
5. Confirm agents reconnect. Do not expose a second plaintext port or disable
   verification to accommodate older clients.

Certificate rotation requires replacing the source files and recreating the
engine container so file bind mounts reliably reference the new files. Restart
agents after updating CA bundles. CA rollover may temporarily trust old and new
public roots, then remove the retired root after migration.

The local-development `insecure-loopback` option in app-agent is not a Compose
network workaround. A container port published to other hosts must retain TLS.
REST API, database and message-queue connections are outside this gRPC change.

## Offline regression checks

```sh
python3 scripts/test-grpc-tls-compose.py
```

This checks base/dev/prod/build renderings, default and custom host paths,
read-only non-creating mounts, inherited source mounts, and fixed TLS settings.
It uses synthetic environment values and no real `.env`, certificate contents,
Docker daemon, containers or live services. app-agent tests separately exercise
real TLS handshakes with temporary synthetic certificates.
