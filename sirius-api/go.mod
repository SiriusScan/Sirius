module github.com/SiriusScan/sirius-api

go 1.22.0

toolchain go1.23.5

//replace github.com/SiriusScan/go-api => ../../minor-project/go-api
replace github.com/SiriusScan/go-api => /go-api

require (
	github.com/SiriusScan/go-api v0.0.2
	github.com/fatih/color v1.18.0
	github.com/gofiber/fiber/v2 v2.49.2
)

require (
	github.com/andybalholm/brotli v1.0.5 // indirect
	github.com/antlr4-go/antlr/v4 v4.13.0 // indirect
	github.com/coder/websocket v1.8.12 // indirect
	github.com/google/uuid v1.3.1 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20221227161230-091c0ba34f0a // indirect
	github.com/jackc/pgx/v5 v5.3.1 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/klauspost/compress v1.17.0 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.15 // indirect
	github.com/mattn/go-sqlite3 v1.14.22 // indirect
	github.com/rivo/uniseg v0.4.4 // indirect
	github.com/streadway/amqp v1.1.0 // indirect
	github.com/tursodatabase/libsql-client-go v0.0.0-20240902231107-85af5b9d094d // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.50.0 // indirect
	github.com/valyala/tcplisten v1.0.0 // indirect
	golang.org/x/crypto v0.8.0 // indirect
	golang.org/x/exp v0.0.0-20240325151524-a685a6edb6d8 // indirect
	golang.org/x/sys v0.29.0 // indirect
	golang.org/x/text v0.21.0 // indirect
	gorm.io/driver/postgres v1.5.2 // indirect
	gorm.io/driver/sqlite v1.5.7 // indirect
	gorm.io/gorm v1.25.12 // indirect
)
