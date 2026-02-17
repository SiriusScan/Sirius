package main

import (
	"fmt"
	"strings"
	"time"
)

// Severity levels for findings.
type Severity int

const (
	SevInfo Severity = iota
	SevLow
	SevMedium
	SevHigh
	SevCritical
)

func (s Severity) String() string {
	switch s {
	case SevInfo:
		return "INFO"
	case SevLow:
		return "LOW"
	case SevMedium:
		return "MEDIUM"
	case SevHigh:
		return "HIGH"
	case SevCritical:
		return "CRITICAL"
	}
	return "UNKNOWN"
}

// Result represents the outcome of a single test.
type Result int

const (
	Pass Result = iota
	Fail
	Warn
	Info
	Skip
)

func (r Result) String() string {
	switch r {
	case Pass:
		return "PASS"
	case Fail:
		return "FAIL"
	case Warn:
		return "WARN"
	case Info:
		return "INFO"
	case Skip:
		return "SKIP"
	}
	return "UNKNOWN"
}

// TestResult holds the outcome of a single security test.
type TestResult struct {
	Name     string
	Result   Result
	Severity Severity
	Detail   string // e.g. "expected 401, got 200"
}

// SuiteResult groups test results under a named suite.
type SuiteResult struct {
	Name    string
	Results []TestResult
}

// Report collects all suite results and prints a formatted report.
type Report struct {
	Suites  []SuiteResult
	noColor bool
}

// NewReport creates a new report.
func NewReport(noColor bool) *Report {
	return &Report{noColor: noColor}
}

// AddSuite appends a completed suite to the report.
func (r *Report) AddSuite(s SuiteResult) {
	r.Suites = append(r.Suites, s)
}

// ────────────────── ANSI helpers ──────────────────

const (
	ansiReset  = "\033[0m"
	ansiBold   = "\033[1m"
	ansiRed    = "\033[31m"
	ansiGreen  = "\033[32m"
	ansiYellow = "\033[33m"
	ansiBlue   = "\033[34m"
	ansiCyan   = "\033[36m"
	ansiWhite  = "\033[37m"
	ansiGray   = "\033[90m"
)

func (r *Report) c(code, text string) string {
	if r.noColor {
		return text
	}
	return code + text + ansiReset
}

// ────────────────── Printing ──────────────────

// Print renders the full report to stdout.
func (r *Report) Print() {
	line := strings.Repeat("=", 79)
	thinLine := strings.Repeat("-", 79)

	fmt.Println()
	fmt.Println(r.c(ansiBold, line))
	fmt.Println(r.c(ansiBold, "  SIRIUS SECURITY TEST REPORT"))
	fmt.Printf("  Generated: %s\n", time.Now().Format("2006-01-02 15:04:05"))
	fmt.Println(r.c(ansiBold, line))

	totalPass, totalFail, totalWarn, totalInfo, totalSkip := 0, 0, 0, 0, 0
	sevCounts := map[Severity]int{}

	for _, suite := range r.Suites {
		fmt.Println()
		fmt.Printf("%s %s (%d tests)\n",
			r.c(ansiBold+ansiCyan, "[SUITE]"),
			r.c(ansiBold, suite.Name),
			len(suite.Results))
		fmt.Println(r.c(ansiGray, thinLine))

		for _, t := range suite.Results {
			tag := r.resultTag(t.Result)
			sevTag := ""
			if t.Result != Pass && t.Result != Skip {
				sevTag = "  " + r.sevTag(t.Severity)
				sevCounts[t.Severity]++
			}

			detail := ""
			if t.Detail != "" {
				detail = r.c(ansiGray, " → "+t.Detail)
			}

			fmt.Printf("  %s %s%s%s\n", tag, t.Name, detail, sevTag)

			switch t.Result {
			case Pass:
				totalPass++
			case Fail:
				totalFail++
			case Warn:
				totalWarn++
			case Info:
				totalInfo++
			case Skip:
				totalSkip++
			}
		}
	}

	total := totalPass + totalFail + totalWarn + totalInfo + totalSkip

	fmt.Println()
	fmt.Println(r.c(ansiBold, line))
	fmt.Println(r.c(ansiBold, "  SUMMARY"))
	fmt.Println(r.c(ansiGray, thinLine))
	fmt.Printf("  Total: %d | %s: %d | %s: %d | %s: %d | %s: %d | %s: %d\n",
		total,
		r.c(ansiGreen, "Passed"), totalPass,
		r.c(ansiRed, "Failed"), totalFail,
		r.c(ansiYellow, "Warnings"), totalWarn,
		r.c(ansiBlue, "Info"), totalInfo,
		r.c(ansiGray, "Skipped"), totalSkip,
	)
	fmt.Println(r.c(ansiGray, thinLine))
	fmt.Printf("  %s: %d | %s: %d | %s: %d | %s: %d | %s: %d\n",
		r.c(ansiRed+ansiBold, "Critical"), sevCounts[SevCritical],
		r.c(ansiRed, "High"), sevCounts[SevHigh],
		r.c(ansiYellow, "Medium"), sevCounts[SevMedium],
		r.c(ansiGreen, "Low"), sevCounts[SevLow],
		r.c(ansiBlue, "Info"), sevCounts[SevInfo],
	)
	fmt.Println(r.c(ansiBold, line))
	fmt.Println()
}

func (r *Report) resultTag(res Result) string {
	switch res {
	case Pass:
		return r.c(ansiGreen+ansiBold, "[PASS]")
	case Fail:
		return r.c(ansiRed+ansiBold, "[FAIL]")
	case Warn:
		return r.c(ansiYellow+ansiBold, "[WARN]")
	case Info:
		return r.c(ansiBlue+ansiBold, "[INFO]")
	case Skip:
		return r.c(ansiGray+ansiBold, "[SKIP]")
	}
	return "[????]"
}

func (r *Report) sevTag(sev Severity) string {
	switch sev {
	case SevCritical:
		return r.c(ansiRed+ansiBold, "[CRITICAL]")
	case SevHigh:
		return r.c(ansiRed, "[HIGH]")
	case SevMedium:
		return r.c(ansiYellow, "[MEDIUM]")
	case SevLow:
		return r.c(ansiGreen, "[LOW]")
	case SevInfo:
		return r.c(ansiBlue, "[INFO]")
	}
	return "[???]"
}

// HasFailures returns true if any test resulted in Fail.
func (r *Report) HasFailures() bool {
	for _, s := range r.Suites {
		for _, t := range s.Results {
			if t.Result == Fail {
				return true
			}
		}
	}
	return false
}
