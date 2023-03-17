package main

/*
This program to parses the CPE List from NVD to build a list of vendors and products.
*/

import (
	"encoding/json"
	_ "errors"
	"io/ioutil"
	"log"
	_ "os/exec"
	"strings"

	_ "github.com/gin-gonic/gin"
	//Internal Libraries
	//3rd Party Dependencies
)

type CPEMatches struct {
	Matches []CPEMatch `json:"matches"`
}
type CPEMatch struct {
	CPE23URI            string `json:"cpe23Uri"`
	VersionEndExcluding string `json:"versionEndExcluding"`
}
type CPEVendor struct {
	VendorName string       `json:"vendor_name"`
	Product    []CPEProduct `json:"product"`
}
type CPEProduct struct {
	ProductName string `json:"product_name"`
}

func main() {
	//Open CPE List json file
	//dat, err := ioutil.ReadFile("./data/test.json")
	dat, err := ioutil.ReadFile("./data/nvdcpematch-1.0.json")
	if err != nil {
		log.Println("Error reading CPE List")
	}

	//Parse JSON
	var cpeData CPEMatches
	err = json.Unmarshal(dat, &cpeData)
	if err != nil {
		log.Println("Error parsing CPE List")
		log.Println(err)
	}

	//Build Vendor List
	var vendorList []CPEVendor
	for _, match := range cpeData.Matches {
		//for i, match := range cpeData.Matches {
		var curProduct CPEProduct
		var curVendor CPEVendor
		j := 0

		//Parse CPE23URI
		//cpe:2.3:a:vendor:product:version:update:edition:language
		split := strings.Split(match.CPE23URI, ":")
		vendorName := split[3]
		productName := split[4]

		//Check if Vendor exists
		vendorExists := false
		productExists := false

		for _, vendor := range vendorList {
			if vendor.VendorName == vendorName {
				vendorExists = true
				curVendor = vendor
				j++

				//Check if product exists for vendor
				for _, product := range vendor.Product {
					if product.ProductName == productName {
						productExists = true
						log.Println("Product Exists: " + productName)
						break
					}
				}
				break
			}
		}

		//Add Vendor if it doesn't exist
		if !vendorExists {
			log.Println("New Vendor: " + vendorName)

			//Add new vendor and current product
			curVendor.VendorName = vendorName
			curProduct.ProductName = productName
			curVendor.Product = append(curVendor.Product, curProduct)

			//Append to vendor list
			vendorList = append(vendorList, curVendor)
			productExists = false
		}

		//If vendor does exist and product doesn't for current vendor, add product
		if !productExists && vendorExists {
			log.Println("New Product: " + curVendor.VendorName + " " + productName)

			//Add new product
			var product CPEProduct
			product.ProductName = productName
			curVendor.Product = append(curVendor.Product, product)

			//Append to vendor list
			vendorList[j] = curVendor
		}

		/*
			//Print Progress
			if i%10 == 0 {
				log.Println(i)
			}
			if i > 10 {
				break
			}*/
	}

	//Write Vendor List to JSON file
	vendorListJSON, err := json.Marshal(vendorList)
	if err != nil {
		log.Println("Error writing Vendor List")
	}
	err = ioutil.WriteFile("./data/vendorlist.json", vendorListJSON, 0644)
	if err != nil {
		log.Println("Error writing Vendor List")
	}

	log.Println("Done")
}
