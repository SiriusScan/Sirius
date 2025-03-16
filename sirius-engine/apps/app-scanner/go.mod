module github.com/SiriusScan/app-scanner

go 1.22.0

toolchain go1.24.1

require github.com/SiriusScan/go-api v0.0.0

require (
	github.com/valkey-io/valkey-go v1.0.54 // indirect
	golang.org/x/sys v0.29.0 // indirect
)

replace github.com/SiriusScan/go-api => ../../../go-api
