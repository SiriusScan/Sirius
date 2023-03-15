package lib

// BuildTargetMatrix builds a matrix of targets to scan
func BuildTargetMatrix(job ScanRequest) []string {

	var targetMatrix []string
	for _, target := range job.Targets {
		//Determines if target is a host or a network
		//If host, add to targetMatrix
		//If network, generate host list and add to targetMatrix
		if IsHost(target) {
			targetMatrix = append(targetMatrix, ExpandNetwork(target)...)
		} else if IsNetwork(target) {
			//Generate Host List
			//Add to targetMatrix
			targetMatrix = append(targetMatrix, ExpandNetwork(target)...)
		}
	}
	//log.Println(targetMatrix.targets[0])
	return targetMatrix
}
