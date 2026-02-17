module github.com/SiriusScan/sirius-security-tests

go 1.24.0

toolchain go1.24.1

require (
	github.com/SiriusScan/app-agent v0.0.0
	google.golang.org/grpc v1.71.1
)

require (
	golang.org/x/net v0.39.0 // indirect
	golang.org/x/sys v0.38.0 // indirect
	golang.org/x/text v0.24.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250414145226-207652e42e2e // indirect
	google.golang.org/protobuf v1.36.6 // indirect
)

replace github.com/SiriusScan/app-agent => ../../../minor-projects/app-agent
