package lib

import "time"

// CoreAPI types
type SystemStatus struct {
	Profile string       `json:"profile"`
	Status  string       `json:"status"`
	Tasks   []SystemTask `json:"tasks"`
}
type SystemTask struct {
	TaskID       string `json:"task_id"`
	TaskName     string `json:"task_name"`
	TaskStatus   string `json:"task_status"`
	TaskProgress int    `json:"task_progress"`
}

// SVDB types
type SVDBEntry struct {
	CVEDataFormat       string
	CVEDataType         string
	CVEDataVersion      string
	CVEDataNumberOfCVEs string
	CVEDataTimestamp    string
	CVEItems            []CVEItem
	CVEDataMeta         CVEDataMeta
	Description         Description
	CPE                 Node
	CVSSV3              CVSSV3
	References          []string
	Tags                []string
}

type SVDBHost struct {
	OS        string `json:"os"`
	OSVersion string `json:"osversion"`
	IP        string `json:"ip"`
	Hostname  string `json:"hostname"`
	Services  []Service
	CVE       []string
	CPE       []string `json:"cpe"`
	Agent     SiriusAgent
}
type SiriusAgent struct {
	AgentId string
	HostKey string
	IP      string
	OS      string
	Tasks   []Task
}
type TaskResponse struct {
	AgentId string
	IP      string
	Task    Task
}
type Task struct {
	ID      string
	Type    string
	Command string
	Result  string
	Status  string
	Date    time.Time
}
type Service struct {
	Port    int    `json:"port"`
	Product string `json:"product"`
	Version string `json:"version"`
	CPE     string `json:"cpe"`
}
type TerminalHistory struct {
	Id      string
	IP      string
	Command string
	Result  string
	Status  string
	Date    time.Time
}
type Finding struct {
	CVE    CVE
	SVDBID string
}
type FindingRequest struct {
	CVE    []string
	SVDBID string
}
type CVEFinding struct {
	CVEDataType         string  `json:"cvedatatype"`
	CVEDataFormat       string  `json:"cvedataformat"`
	CVEDataVersion      string  `json:"cvedataversion"`
	CVEDataNumberOfCVEs *string `json:"cvedatanumberofcves,omitempty"`
	CVEDataTimestamp    string  `json:"cvedatatimestamp"`
	CVEDataMeta         CVEDataMeta
	Description         Description `json:"description"`
}

type HostCVE struct {
	Host    string
	CVEList []string
}

type (
	CVEResponse struct {
		ResultsPerPage int       `json:"resultsPerPage"`
		StartIndex     int       `json:"startIndex"`
		TotalResults   int       `json:"totalResults"`
		Result         CVEResult `json:"result"`
	}

	CVEResult struct {
		CVEDataType         string     `json:"CVE_data_type"`
		CVEDataFormat       string     `json:"CVE_data_format"`
		CVEDataVersion      string     `json:"CVE_data_version"`
		CVEDataNumberOfCVEs *string    `json:"CVE_data_numberOfCVEs,omitempty"`
		CVEDataTimestamp    string     `json:"CVE_data_timestamp"`
		CVEItems            *[]CVEItem `json:"CVE_Items,omitempty"`
	}

	// CVEITEM defines a vulnerability in the NVD data feed as defined
	// in the NIST API schema.
	CVEItem struct {
		CVE              CVE            `json:"cve"`
		Configurations   Configurations `json:"configurations,omitempty"`
		Impact           *Impact        `json:"impact,omitempty"`
		PublishedDate    *string        `json:"publishedDate,omitempty"`
		LastModifiedDate *string        `json:"lastModifiedDate,omitempty"`
	}

	// CVE as defined in the NIST API schema.
	CVE struct {
		DataType    string      `json:"data_type"`
		DataFormat  string      `json:"data_format"`
		DataVersion string      `json:"data_version"`
		CVEDataMeta CVEDataMeta `json:"cve_data_meta"`
		Affects     *Affects    `json:"affects,omitempty"`
		ProblemType ProblemType `json:"problemtype"`
		References  References  `json:"references"`
		Description Description `json:"description"`
	}

	CVEDataMeta struct {
		ID       string  `json:"ID"`
		ASSIGNER string  `json:"ASSIGNER"`
		STATE    *string `json:"STATE,omitempty"`
	}

	Affects struct {
		Vendor Vendor `json:"vendor"`
	}

	Vendor struct {
		// VendorData has a minimum of 0 items according to the
		// NIST API schema.
		VendorData []VendorData `json:""`
	}

	VendorData struct {
		VendorName string        `json:"vendor_name"`
		Product    VendorProduct `json:"product"`
	}

	VendorProduct struct {
		// ProductData has a minimum of 1 item according to the
		// NIST API schema.
		ProductData []Product `json:"product_data"`
	}

	ProblemType struct {
		// ProblemTypeData has a minimum of 0 items according to the
		// NIST API schema.
		ProblemTypeData []ProblemTypeData `json:"problemtype_data"`
	}

	ProblemTypeData struct {
		// Description has a minimum of 0 items according to the
		// NIST API schema.
		Description []LangString `json:"description"`
	}

	References struct {
		// ReferenceData has a minimum of 0 and a maximum of 500
		// items according to the NIST API schema.
		ReferenceData []CVEReference `json:"reference_data"`
	}

	Description struct {
		// DescriptionData has a minimum of 0 items according to
		// the NIST API schema.
		DescriptionData []LangString `json:"description_data"`
	}

	Product struct {
		ProductName string  `json:"product_name"`
		Version     Version `json:"version"`
	}

	Version struct {
		// VersionData has a minimum of 1 item according to the
		// NIST API schema.
		VersionData []VersionData `json:"version_data"`
	}

	VersionData struct {
		VersionValue    string  `json:"version_value"`
		VersionAffected *string `json:"version_affected,omitempty"`
	}

	CVEReference struct {
		// URL has a maximum length of 500 characters according to the
		// NIST API schema.
		URL       string    `json:"url"`
		Name      *string   `json:"name,omitempty"`
		Refsource *string   `json:"refsource,omitempty"`
		Tags      *[]string `json:"tags,omitempty"`
	}

	LangString struct {
		Lang string `json:"lang"`
		// Value has a maximum length of 3999 characters according to the
		// NIST API schema.
		Value string `json:"value"`
	}

	// Configurations defines the set of product configurations for a
	// NVD applicability statement as defined in the NIST API schema.
	Configurations struct {
		CVEDataVersion string `json:"CVE_data_version"`
		Nodes          []Node `json:"nodes,omitempty"`
	}

	// Node is a node or sub-node in an NVD applicability statement
	// as defined in the NIST API schema.
	Node struct {
		Operator string     `json:"operator,omitempty"`
		Negate   bool       `json:"negate,omitempty"`
		Children []Node     `json:"children,omitempty"`
		CPEMatch []CPEMatch `json:"cpe_match,omitempty"`
	}

	// CPEMatch is the CPE Match string or range as defined in the
	// NIST API schema.
	CPEMatch struct {
		Vulnerable            bool         `json:"vulnerable"`
		CPE22URI              string       `json:"cpe22Uri,omitempty"`
		CPE23URI              string       `json:"cpe23Uri"`
		VersionStartExcluding string       `json:"versionStartExcluding,omitempty"`
		VersionStartIncluding string       `json:"versionStartIncluding,omitempty"`
		VersionEndExcluding   string       `json:"versionEndExcluding,omitempty"`
		VersionEndIncluding   string       `json:"versionEndIncluding,omitempty"`
		CPEName               []CVECPEName `json:"cpe_name,omitempty"`
	}

	// CPEName is the CPE name as defined in the NIST API schema.
	CVECPEName struct {
		CPE22URI         string `json:"cpe22Uri,omitempty"`
		CPE23URI         string `json:"cpe23Uri"`
		LastModifiedDate string `json:"lastModifiedDate,omitempty"`
	}

	// Impact scores for a vulnerability as found on NVD as defined
	// in the NIST API schema.
	Impact struct {
		BaseMetricV3 BaseMetricV3 `json:"baseMetricV3,omitempty"`
		BaseMetricV2 BaseMetricV2 `json:"baseMetricV2,omitempty"`
	}

	// BaseMetricV3 is the CVSS V3.x score as defined in the NIST API
	// schema.
	BaseMetricV3 struct {
		CVSSV3              CVSSV3  `json:"cvssV3,omitempty"`
		ExploitabilityScore float64 `json:"exploitabilityScore,omitempty"`
		ImpactScore         float64 `json:"impactScore,omitempty"`
	}

	CVSSV3 struct {
		// Version should be implemented using an enum
		Version                       string  `json:"version"`
		VectorString                  string  `json:"vectorString"`
		AttackVector                  string  `json:"attackVector,omitempty"`
		AttackComplexity              string  `json:"attackComplexity,omitempty"`
		PrivilegesRequired            string  `json:"privilegesRequired,omitempty"`
		UserInteraction               string  `json:"userInteraction,omitempty"`
		Scope                         string  `json:"scope,omitempty"`
		ConfidentialityImpact         string  `json:"confidentialityImpact,omitempty"`
		IntegrityImpact               string  `json:"integrityImpact,omitempty"`
		AvailabilityImpact            string  `json:"availabilityImpact,omitempty"`
		BaseScore                     float64 `json:"baseScore"`
		BaseSeverity                  string  `json:"baseSeverity"`
		ExploitCodeMaturity           string  `json:"exploitCodeMaturity,omitempty"`
		RemediationLevel              string  `json:"remediationLevel,omitempty"`
		ReportConfidence              string  `json:"reportConfidence,omitempty"`
		TemporalScore                 float64 `json:"temporalScore,omitempty"`
		TemporalSeverity              string  `json:"temporalSeverity,omitempty"`
		ConfidentialityRequirement    string  `json:"confidentialityRequirement,omitempty"`
		IntegrityRequirement          string  `json:"integrityRequirement,omitempty"`
		AvailabilityRequirement       string  `json:"availabilityRequirement,omitempty"`
		ModifiedAttackVector          string  `json:"modifiedAttackVector,omitempty"`
		ModifiedAttackComplexity      string  `json:"modifiedAttackComplexity,omitempty"`
		ModifiedPrivilegesRequired    string  `json:"modifiedPrivilegesRequired,omitempty"`
		ModifiedUserInteraction       string  `json:"modifiedUserInteraction,omitempty"`
		ModifiedScope                 string  `json:"modifiedScope,omitempty"`
		ModifiedConfidentialityImpact string  `json:"modifiedConfidentialityImpact,omitempty"`
		ModifiedIntegrityImpact       string  `json:"modifiedIntegrityImpact,omitempty"`
		ModifiedAvailabilityImpact    string  `json:"modifiedAvailabilityImpact,omitempty"`
		EnvironmentalScore            float64 `json:"environmentalScore,omitempty"`
		EnvironmentalSeverity         string  `json:"environmentalSeverity,omitempty"`
	}

	// BaseMetricV2 is the CVSS V2.0 score as defined in the NIST API
	// schema.
	BaseMetricV2 struct {
		CVSSV2                  CVSSV2  `json:"cvssV2,omitempty"`
		Severity                string  `json:"severity,omitempty"`
		ExploitabilityScore     float64 `json:"exploitabilityScore,omitempty"`
		ImpactScore             float64 `json:"impactScore,omitempty"`
		AcInsufInfo             bool    `json:"acInsufInfo,omitempty"`
		ObtainAllPrivilege      bool    `json:"obtainAllPrivilege,omitempty"`
		ObtainUserPrivilege     bool    `json:"obtainUserPrivilege,omitempty"`
		ObtainOtherPrivilege    bool    `json:"obtainOtherPrivilege,omitempty"`
		UserInteractionRequired bool    `json:"userInteractionRequired,omitempty"`
	}

	CVSSV2 struct {
		Version                    string  `json:"version"`
		VectorString               string  `json:"vectorString"`
		AccessVector               string  `json:"accessVector,omitempty"`
		AccessComplexity           string  `json:"accessComplexity,omitempty"`
		Authentication             string  `json:"authentication,omitempty"`
		ConfidentialityImpact      string  `json:"confidentialityImpact,omitempty"`
		IntegrityImpact            string  `json:"integrityImpact,omitempty"`
		AvailabilityImpact         string  `json:"availabilityImpact,omitempty"`
		BaseScore                  float64 `json:"baseScore"`
		Exploitability             string  `json:"exploitability,omitempty"`
		RemediationLevel           string  `json:"remediationLevel,omitempty"`
		ReportConfidence           string  `json:"reportConfidence,omitempty"`
		TemporalScore              float64 `json:"temporalScore,omitempty"`
		CollateralDamagePotential  string  `json:"collateralDamagePotential,omitempty"`
		TargetDistribution         string  `json:"targetDistribution,omitempty"`
		ConfidentialityRequirement string  `json:"confidentialityRequirement,omitempty"`
		IntegrityRequirement       string  `json:"integrityRequirement,omitempty"`
		AvailabilityRequirement    string  `json:"availabilityRequirement,omitempty"`
		EnvironmentalScore         float64 `json:"environmentalScore,omitempty"`
	}

	CPEResponse struct {
		ResultsPerPage int       `json:"resultsPerPage"`
		StartIndex     int       `json:"startIndex"`
		TotalResults   int       `json:"totalResults"`
		Result         CPEResult `json:"result"`
	}

	CPEResult struct {
		DataType    string `json:"dataType"`
		FeedVersion string `json:"feedVersion"`
		// Number of CPE in this feed
		CPECount int `json:"cpeCount"`
		// Timestamp indicates when feed was generated
		FeedTimestamp *string   `json:"feedTimestamp,omitempty"`
		CPEs          []CPEName `json:"cpes"`
	}

	// CPE name
	CPEName struct {
		CPE23URI         string         `json:"cpe23Uri"`
		LastModifiedDate string         `json:"lastModifiedDate"`
		Deprecated       bool           `json:"deprecated,omitempty"`
		DeprecatedBy     []string       `json:"deprecatedBy,omitempty"`
		Titles           []Title        `json:"titles,omitempty"`
		Refs             []CPEReference `json:"refs,omitempty"`
		Vulnerabilities  []string       `json:"vulnerabilities,omitempty"`
	}

	// Human readable title for CPE
	Title struct {
		Title string `json:"title"`
		Lang  string `json:"lang"`
	}

	// Internet resource for CPE
	CPEReference struct {
		Ref  string           `json:"ref"`
		Type CPEReferenceType `json:"type,omitempty"`
	}

	CPEReferenceType string
)

var (
	ADVISORY   CPEReferenceType = "Advisory"
	CHANGE_LOG CPEReferenceType = "Change Log"
	PRODUCT    CPEReferenceType = "Product"
	PROJECT    CPEReferenceType = "Project"
	VENDOR     CPEReferenceType = "Vendor"
	VERSION    CPEReferenceType = "Version"
)
