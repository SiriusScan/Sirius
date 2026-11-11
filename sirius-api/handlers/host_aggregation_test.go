package handlers

import (
	"os"
	"strings"
	"testing"

	"github.com/SiriusScan/go-api/sirius/host"
	pgdriver "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func TestAllHostVulnerabilitiesQueryFiltersCurrentFindings(t *testing.T) {
	db, err := gorm.Open(pgdriver.Open("host=127.0.0.1 port=1 dbname=unused sslmode=disable"), &gorm.Config{
		DryRun: true, DisableAutomaticPing: true, Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatal(err)
	}
	stmt := allHostVulnerabilitiesQuery(db).Find(&[]host.VulnerabilitySummary{}).Statement
	for _, required := range []string{"COUNT(DISTINCT hosts.id)", "host_vulnerabilities.status = $1", "hosts.deleted_at IS NULL", "vulnerabilities.deleted_at IS NULL"} {
		if !strings.Contains(stmt.SQL.String(), required) {
			t.Errorf("query missing %q: %s", required, stmt.SQL.String())
		}
	}
	if len(stmt.Vars) != 1 || stmt.Vars[0] != "active" {
		t.Fatalf("expected active status binding, got %v", stmt.Vars)
	}
}

func TestAllHostVulnerabilitiesCurrentFindingCounts(t *testing.T) {
	dsn := os.Getenv("SIRIUS_AGGREGATION_TEST_DSN")
	if dsn == "" {
		t.Skip("set SIRIUS_AGGREGATION_TEST_DSN to a disposable Postgres instance")
	}
	db, err := gorm.Open(pgdriver.Open(dsn), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal(err)
	}
	pool, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = pool.Close() })
	tx := db.Begin()
	if tx.Error != nil {
		t.Fatal(tx.Error)
	}
	t.Cleanup(func() { _ = tx.Rollback().Error })
	// Restrict name resolution to temporary tables, never the live schema.
	for _, sql := range []string{
		`SET LOCAL search_path TO pg_temp`,
		`CREATE TEMP TABLE hosts (id bigint PRIMARY KEY, deleted_at timestamp) ON COMMIT DROP`,
		`CREATE TEMP TABLE vulnerabilities (id bigint PRIMARY KEY, v_id text, title text, description text, risk_score double precision, deleted_at timestamp) ON COMMIT DROP`,
		`CREATE TEMP TABLE host_vulnerabilities (host_id bigint, vulnerability_id bigint, source text, status text) ON COMMIT DROP`,
		`INSERT INTO hosts VALUES (1,NULL), (2,NULL), (3,now()), (4,NULL)`,
		`INSERT INTO vulnerabilities VALUES
		 (1,'CVE-SHARED','shared','two hosts',9.8,NULL),
		 (2,'CVE-INACTIVE','inactive','',9.8,NULL),
		 (3,'CVE-DELETED','deleted','',10,now()),
		 (4,'CVE-UNOBSERVED','unobserved','',10,NULL),
		 (5,'CVE-DELETED-HOST','deleted host','',10,NULL),
		 (6,'CVE-SINGLE','single','one host',9.8,NULL)`,
		`INSERT INTO host_vulnerabilities VALUES
		 (1,1,'nmap','active'), (1,1,'agent','active'), (1,1,'manual','resolved'),
		 (2,1,'nmap','active'), (2,1,'agent','active'), (3,1,'nmap','active'),
		 (4,1,'nmap','resolved'), (4,1,'agent','false_positive'), (999,1,'nmap','active'),
		 (1,2,'nmap','resolved'), (2,2,'agent','false_positive'), (4,2,'nmap','inactive'),
		 (1,3,'nmap','active'), (3,5,'nmap','active'), (1,6,'nmap','active')`,
	} {
		if err := tx.Exec(sql).Error; err != nil {
			t.Fatal(err)
		}
	}
	var rows []host.VulnerabilitySummary
	if err := allHostVulnerabilitiesQuery(tx).Order("vulnerabilities.id").Scan(&rows).Error; err != nil {
		t.Fatal(err)
	}
	if len(rows) != 2 || rows[0].VID != "CVE-SHARED" || rows[0].HostCount != 2 || rows[1].VID != "CVE-SINGLE" || rows[1].HostCount != 1 {
		t.Fatalf("unexpected active host counts: %+v", rows)
	}
	if err := tx.Exec("UPDATE host_vulnerabilities SET status = 'resolved'").Error; err != nil {
		t.Fatal(err)
	}
	rows = nil
	if err := allHostVulnerabilitiesQuery(tx).Scan(&rows).Error; err != nil {
		t.Fatal(err)
	}
	if len(rows) != 0 {
		t.Fatalf("inactive-only inventory should be empty: %+v", rows)
	}
}
