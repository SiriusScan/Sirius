package coreAPI

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"

	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
)

//BuildDetails
type BuildDetails struct {
	NVDLink string `json:"nvd_link"`
	Status  string `json:"status"`
}

//BuildDatabase builds the vulnerability database from the NVD
//This function is called from SetStatus if the current status is unset (first run)
//This function downloads the NVD data, parses it, and inserts it into the database by calling AddVuln
func BuildDatabase() {
	log.Println("Building the vulnerability database")

	//NVD Download URLS
	nvdDetails := []BuildDetails{
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2023.json.gz", Status: "Downloading NVD data: 2023"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2022.json.gz", Status: "Downloading NVD data: 2022"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2021.json.gz", Status: "Downloading NVD data: 2021"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2020.json.gz", Status: "Downloading NVD data: 2020"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2019.json.gz", Status: "Downloading NVD data: 2019"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2018.json.gz", Status: "Downloading NVD data: 2018"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2017.json.gz", Status: "Downloading NVD data: 2017"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2016.json.gz", Status: "Downloading NVD data: 2016"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2015.json.gz", Status: "Downloading NVD data: 2015"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2014.json.gz", Status: "Downloading NVD data: 2014"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2013.json.gz", Status: "Downloading NVD data: 2013"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2012.json.gz", Status: "Downloading NVD data: 2012"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2011.json.gz", Status: "Downloading NVD data: 2011"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2010.json.gz", Status: "Downloading NVD data: 2010"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2009.json.gz", Status: "Downloading NVD data: 2009"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2008.json.gz", Status: "Downloading NVD data: 2008"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2007.json.gz", Status: "Downloading NVD data: 2007"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2006.json.gz", Status: "Downloading NVD data: 2006"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2005.json.gz", Status: "Downloading NVD data: 2005"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2004.json.gz", Status: "Downloading NVD data: 2004"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2003.json.gz", Status: "Downloading NVD data: 2003"},
		{NVDLink: "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-2002.json.gz", Status: "Downloading NVD data: 2002"},
	}

	//For each NVD URL download the data
	for i := 0; i <= 21; i++ {
		//Download the NVD data
		filename := strings.Split(nvdDetails[i].NVDLink, "/")[len(strings.Split(nvdDetails[i].NVDLink, "/"))-1]
		log.Println("Downloading NVD: " + filename)
		out, err := os.Create("tmp/" + filename)
		if err != nil {
			log.Println(err)
		}
		defer out.Close()

		resp, err := http.Get(nvdDetails[i].NVDLink)
		if err != nil {
			log.Println(err)
		}
		defer resp.Body.Close()

		_, err = io.Copy(out, resp.Body)
		if err != nil {
			log.Println(err)
		}

		//Extract the NVD data
		cmd := exec.Command("/bin/gunzip", "tmp/"+filename)
		stdout, err := cmd.Output()
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		fmt.Println(string(stdout))

		newStatus := SystemStatus{
			Profile: "root",
			Status:  "Initializing",
			Tasks: []SystemTask{
				{
					TaskID:       "1",
					TaskName:     nvdDetails[i].Status,
					TaskStatus:   "10",
					TaskProgress: i * 1,
				},
			},
		}
		SetStatus(newStatus)
	}

	progress := 58
	//For each NVD file extract the data and insert into the database
	for _, nvdDetail := range nvdDetails {
		filename := strings.Split(nvdDetail.NVDLink, "/")[len(strings.Split(nvdDetail.NVDLink, "/"))-1]
		filename = strings.Replace(filename, ".gz", "", -1)

		//Extract the NVD data
		dat, err := os.ReadFile("tmp/" + filename)
		if err != nil {
			log.Println(err)
		}

		//Parse the NVD data
		var responseObject NVDVulnerablityList
		json.Unmarshal(dat, &responseObject)
		var vuln siriusDB.SVDBEntry

		for i := 0; i < len(responseObject.CVEItems); i++ {
			fmt.Println("================")

			vuln.CVEDataType = responseObject.CVEItems[i].CVE.DataType
			vuln.CVEDataFormat = responseObject.CVEItems[i].CVE.DataFormat

			vuln.CVEDataMeta.ID = responseObject.CVEItems[i].CVE.CVEDataMeta.ID
			vuln.CVEDataMeta.ASSIGNER = responseObject.CVEItems[i].CVE.CVEDataMeta.ASSIGNER
			vuln.Description = responseObject.CVEItems[i].CVE.Description
			vuln.CVSSV3 = responseObject.CVEItems[i].Impact.BaseMetricV3.CVSSV3

			for j := 0; j < len(responseObject.CVEItems[i].Configurations.Nodes); j++ {
				vuln.CPE = responseObject.CVEItems[i].Configurations.Nodes[j]
			}

			for j := 0; j < len(responseObject.CVEItems[i].CVE.References.ReferenceData); j++ {
				vuln.References = append(vuln.References, responseObject.CVEItems[i].CVE.References.ReferenceData[j].URL)
			}

			b, err := json.Marshal(vuln)
			if err != nil {
				fmt.Println(err)
				return
			}
			fmt.Println(string(b))

			//Add Vulnerability Definition to SVDB
			resp, err := http.Post("http://localhost:8080/api/svdb/new/vuln", "application/json", bytes.NewBuffer(b))

			if err != nil {
				log.Fatal(err)
			}

			var res map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&res)
			fmt.Println(res["json"])

			//Clear Vuln Entry
			vuln = siriusDB.SVDBEntry{}

		}
		//Get year from filename
		year := strings.Split(filename, "-")[len(strings.Split(filename, "-"))-1]
		year = strings.Replace(year, ".json", "", -1)

		progress = progress + 3

		//Update the status
		newStatus := SystemStatus{
			Profile: "root",
			Status:  "Initializing",
			Tasks: []SystemTask{
				{
					TaskID:       "1",
					TaskName:     "Building Vulnerability Database: " + year,
					TaskStatus:   "10",
					TaskProgress: progress,
				},
			},
		}
		SetStatus(newStatus)
	}

	//Clean up the NVD data
	exec.Command("/bin/rm", "tmp/*.json")

	//Update the status
	newStatus := SystemStatus{
		Profile: "root",
		Status:  "OK",
		Tasks: []SystemTask{
			{
				TaskID:   "1",
				TaskName: "Welcome to Sirius",
			},
		},
	}
	SetStatus(newStatus)

	//Parse the NVD data
	//Insert the NVD data into the database

}

type NVDVulnerablityList struct {
	CVEDataType         string             `json:"CVE_data_type"`
	CVEDataFormat       string             `json:"CVE_data_format"`
	CVEDataVersion      string             `json:"CVE_data_version"`
	CVEDataNumberOfCVEs string             `json:"CVE_data_numberOfCVEs,omitempty"`
	CVEDataTimestamp    string             `json:"CVE_data_timestamp"`
	CVEItems            []siriusDB.CVEItem `json:"CVE_Items,omitempty"`
}
