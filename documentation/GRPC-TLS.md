# Agent gRPC TLS configuration

The engine's agent listener requires an operator-provided TLS certificate chain
and matching private key. Place them outside version control and set
`GRPC_TLS_CERT_HOST_PATH` and `GRPC_TLS_KEY_HOST_PATH` to their host paths before
starting Compose. The defaults are `$HOME/.local/state/sirius/grpc-server.crt` and
`$HOME/.local/state/sirius/grpc-server.key`. These are host paths, not container paths. Compose mounts them read-only as
`/run/secrets/grpc_server_cert` and `/run/secrets/grpc_server_key` and sets
`GRPC_TLS_CERT_FILE` and `GRPC_TLS_KEY_FILE` accordingly.

The engine runs as a non-root user. Docker Compose file-backed secrets retain
host file ownership and permissions, so arrange access for the engine's UID
using your host's secret provisioning or ACLs. Do not make a production key
world-readable. Provision a certificate whose subject alternative names match
the names or IP addresses agents use. Configure each agent to trust the issuing
CA with `GRPC_TLS_CA_FILE` and, if necessary, set `GRPC_TLS_SERVER_NAME` to the
certificate's expected DNS name. Distribute the public CA certificate, never
the server private key, to agents. Rotate certificates through your normal
secret management process and restart the engine to load the new files.

Release and integration smoke tests generate short-lived test certificates in
private temporary directories and remove them during cleanup; those are not
production credentials. See the public app-agent gRPC TLS documentation for
agent configuration and transport behavior.
