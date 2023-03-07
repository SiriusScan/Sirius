package coreAPI

type SystemStatus struct {
	Status string `json:"status"`
	Tasks []SystemTask `json:"system_task"`
}
type SystemTask struct {
	TaskID int `json:"task_id"`
	TaskName string `json:"task_name"`
	TaskStatus string `json:"task_status"`
}