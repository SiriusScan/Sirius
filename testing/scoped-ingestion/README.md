# Scoped ingestion integration test

Run `./testing/scoped-ingestion/run` from any working directory. The test clones
immutable public scanner and pingpp commits into a temporary directory and uses
the Community API source from this checkout in a temporary Go workspace. It
starts and removes a disposable Postgres 16 container on a loopback-only random
port. It does not use existing local databases or change the source checkout.

Requirements: Git, Go 1.24, CGO with a C compiler and libpcap development
headers, Docker with permission to start containers, a local or pullable
`postgres:16` image, and network access for the public repositories and Go
modules. The Docker daemon may download the Postgres image on first use.

The test uses a test-only resolver to authenticate a fixture service key and
bind the scope header. It runs the actual scanner's versioned envelope decoding,
keyed scan setup and scoped HTTP submission through the real Community handler
and Core migrations. Alice and Bob submit the same IP with different ports and
retrieve only their own observations; global and third-subject lookups find no
record. A rejected service credential must not persist a scoped host or fall
back to global ingestion. It does not test a production resolver, queue delivery,
real scan execution, or private product authorization.
