import vulners
import json

from os.path import expanduser
home = expanduser("~")

vulners_api = vulners.Vulners(api_key="IGAS7I7PPUYMMS1IXXNDPRCXE11XFQMKAL0J03LB7ELPK6P5MQKS915YJZED1WJG")

#Execute CVE searches under all service parameters
'''
CPE => cpe_results = vulners_api.cpeVulnerabilities("cpe:/a:cybozu:garoon:4.2.1")
Version String => vulners_api.softwareVulnerabilities("httpd", "1.3")
'''

#Get Services File
f = open(home + '/.sirius/scans/0001/hosts/services.json')

data = json.load(f)
f.close()
softwareList = []

# Iterating through the json
for port in data['nmap-version']['ports']:
    for item in port.items():
        nsw = {"details": [item[0], item[1]['service'], item[1]['version']]}
        softwareList.append(nsw)

CVEList = []

#CPE Searches


#Version Searches
for target in softwareList:
    sw_results = vulners_api.softwareVulnerabilities(target['details'][1], target['details'][2])
    print(sw_results)
    sw_exploit_list = sw_results.get('exploit')
    sw_vulnerabilities_list = [sw_results.get(key) for key in sw_results if key not in ['info', 'blog', 'bugbounty']]

    try:
        for i in sw_vulnerabilities_list[0]:
            CVEList.append(i['cvelist'])
    except:
        print("No known vulnerabilities for " + target['details'][1] + " " + target['details'][2])


print(CVEList)

f = open(home + "/.sirius/scans/0001/hosts/CVEs.json", "a")
f.write(str(CVEList))
f.close()

#print(CVE)
#help(vulners_api)
