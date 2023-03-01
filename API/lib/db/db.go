package siriusDB

import (
	_ "encoding/json"
	_ "errors"
	"fmt"
	"log"
	_ "os"
	_ "os/exec"
	_ "strings"

	"context"
	"reflect"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	//Internal Libraries
	//3rd Party Dependencies
)

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

func newHost(client *mongo.Client, host SVDBHost) string {
	hostCollection := client.Database("Sirius").Collection("Hosts")
	//log.Println(hostCollection)

	fmt.Println(host)

	result, err := hostCollection.InsertOne(context.TODO(), host)
	// check for errors in the insertion
	if err != nil {
		panic(err)
	}
	// display the id of the newly inserted object
	fmt.Println(result.InsertedID)
	return "result"
}
func AddVuln(vuln SVDBEntry) {
	log.Println("Updating Sirius General Purpose Vulnerability Database...")

	//DB Connection
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	//Perform DB Operations
	fmt.Println(reflect.TypeOf(client))

	newVuln(client, vuln)

	log.Println("Success: Operation completed successfully")
}
func newVuln(client *mongo.Client, vuln SVDBEntry) string {
	vulnCollection := client.Database("Sirius").Collection("Vulnerabilities")
	//log.Println(vulnCollection)

	fmt.Println(vuln)

	result, err := vulnCollection.InsertOne(context.TODO(), vuln)
	// check for errors in the insertion
	if err != nil {
		panic(err)
	}
	// display the id of the newly inserted object
	fmt.Println(result.InsertedID)

	return "result"
}

type Host struct {
	Name string
	IP   string
	OS   string
}

func DatabaseConnect() *mongo.Client {
	//DB Connection
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)
	return client
}

func GetHosts() []SVDBHost {
	//DB Connection
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	//Perform DB Operations
	results := listHosts(client)
	return results
}

func GetFinding(request FindingRequest) []SVDBEntry {
	//DB Connection
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	vulnCollection := client.Database("Sirius").Collection("Vulnerabilities")
	var findingList []SVDBEntry

	for i := 0; i < len(request.CVE); i++ {
		var finding SVDBEntry
		err = vulnCollection.FindOne(context.TODO(), bson.M{"cvedatameta.id": request.CVE[i]}).Decode(&finding)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				// This error means your query did not match any documents.
				fmt.Println("Unknown Vulnerability: " + request.CVE[i])
			}
		} else {
			findingList = append(findingList, finding)
		}
	}

	//fmt.Println(findingList)
	return findingList
}

func listHosts(client *mongo.Client) []SVDBHost {
	//client, err := mongo.Connect(context.TODO())
	hostCollection := client.Database("Sirius").Collection("Hosts")

	var host SVDBHost
	var result []SVDBHost
	filter := bson.D{}

	cursor, err := hostCollection.Find(context.TODO(), filter)
	if err == mongo.ErrNoDocuments {
		// Do something when no record was found
		fmt.Println("record does not exist")
	} else if err != nil {
		log.Fatal(err)
	}

	for cursor.Next(context.TODO()) {
		//var result bson.D
		if err := cursor.Decode(&host); err != nil {
			log.Fatal(err)
		}

		//fmt.Println(host.IP)
		result = append(result, host)
	}
	if err := cursor.Err(); err != nil {
		log.Fatal(err)
	}

	defer cursor.Close(context.TODO())

	return result
}

func AddHost(host SVDBHost) {
	log.Println(host)

	//DB Connection
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	//Perform DB Operations
	fmt.Println(reflect.TypeOf(client))
	newHost(client, host)

	log.Println("Success: Operation completed successfully")
}

func NewReport(vuln SVDBEntry) {
	log.Println("Got host update report")

	//DB Connection
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	//Perform DB Operations
	//fmt.Println(reflect.TypeOf(client))

	log.Println("Success: Operation completed successfully")
}

//Add CVE API Endpoint?
func NewCVE(host string, cve string) {
	//DB Connection
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	//Perform DB Operations
	hostCollection := client.Database("Sirius").Collection("Hosts")

	var result SVDBHost
	err = hostCollection.FindOne(context.TODO(), bson.D{{"ip", host}}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return
		}
		panic(err)
	}
	cveList := append(result.CVE, cve)

	//Update CVE Listing
	res, err := hostCollection.UpdateOne(
		ctx,
		bson.M{"ip": host},
		bson.D{
			{"$set", bson.D{{"CVE", cveList}}},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Updated %v Documents!\n", res.ModifiedCount)
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
