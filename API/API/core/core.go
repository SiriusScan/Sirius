package coreAPI

type SystemStatus struct {
	Profile string       `json:"profile"`
	Status  string       `json:"status"`
	Tasks   []SystemTask   `json:"tasks"`
}
type SystemTask struct {
	TaskID       string `json:"task_id"`
	TaskName     string `json:"task_name"`
	TaskStatus   string `json:"task_status"`
	TaskProgress int    `json:"task_progress"`
}
