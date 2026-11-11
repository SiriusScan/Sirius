# Scoped host ingestion extension

`handlers.ScopedHostIngest` constructs a host-observation ingestion handler. It
is not registered in the Community application by default. An extension may
mount it behind its own authenticated service boundary and supply a
`ScopeResolver` that returns a scope authorized for the request. A nil or
failing resolver denies the request. Do not trust a subject header, body field,
or query parameter by itself as authorization.

The body has `host`, `source`, and optional `software_inventory`,
`system_fingerprint`, and `agent_metadata` fields. Scope comes only from the
resolver. The handler validates the host address and uses the SDK scoped report
transaction; invalid reports return 400, resolver failures return 403, and a
successful write returns 204. Unexpected persistence failures return 500.

A deployment that accepts `X-Sirius-Resource-Subject` from an internal scanner
must authenticate and authorize that scanner as a trusted scope-asserting
service in its resolver. Ordinary clients must not be able to invoke this
boundary with arbitrary subjects. Scoped callers must not be granted access to
legacy global inventory routes. No scope is inferred from request JSON.
