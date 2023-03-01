package agentsAPI

/*
Sirius Agents API:
This file contains functions and objects to support interaction with agents. It can be imported as follows: github.com/0sm0s1z/Sirius-Scan/API/agents
The following functions are exported:
-
*/

import (
	"context"
	_ "encoding/json"
	_ "errors"
	"fmt"
	"log"
	_ "os"
	_ "os/exec"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	//Internal Libraries
	siriusDB "github.com/0sm0s1z/Sirius-Scan/lib/db"
	//3rd Party Dependencies
)

/*
[SIRIUS AGENTS API STRUCTs]
*/

type Report struct {
	AgentId int
	IP      string
	Status  string
	Updates []Update
}

type Update struct {
	ID             string
	BulletinID     string
	KBID           string
	IsInstalled    string
	Severity       string
	SeverityText   string
	Title          string
	InformationURL string
	CVEIDs         string
	Categories     string
}
type Agent struct {
	AgentId int `json:"AgentId"`
}

/*
[SIRIUS AGENTS DATABASE OPERATIONS]
*/

func AgentResponse(c *gin.Context) {
	var taskResponse siriusDB.TaskResponse

	if c.ShouldBind(&taskResponse) == nil {
		log.Println("Task Response Recieved")
	}
	log.Println(taskResponse)

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
	//Get base SiriusAgent from DB and append new task
	hostCollection := client.Database("Sirius").Collection("Hosts")
	log.Println(taskResponse.IP)

	var result siriusDB.SVDBHost
	err = hostCollection.FindOne(context.TODO(), bson.D{{"ip", taskResponse.IP}}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return
		}
		panic(err)
	}

	updatedTask := taskResponse.Task
	updatedTask.Date = time.Now()
	for i := 0; i < len(result.Agent.Tasks); i++ {
		if result.Agent.Tasks[i].ID == updatedTask.ID {
			result.Agent.Tasks[i] = updatedTask
		}
	}
	log.Println("updatedTask")

	//Update Agent Details
	res, err := hostCollection.UpdateOne(
		ctx,
		bson.M{"ip": taskResponse.IP},
		bson.D{
			{"$set", bson.D{{"Agent", result.Agent}}},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(res)
	fmt.Println("Task Updated for Agent: ", taskResponse.AgentId)

}

func RegisterAgent(agent siriusDB.SiriusAgent) {
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
	hostCollection := client.Database("Sirius").Collection("Hosts")

	//Update Agent Details
	res, err := hostCollection.UpdateOne(
		ctx,
		bson.M{"ip": agent.IP},
		bson.D{
			{"$set", bson.D{{"Agent", agent}}},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(res)
	fmt.Println("New Agent Registration Successful!")
}

func TaskAgent(agent siriusDB.SiriusAgent) {
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
	//Get base SiriusAgent from DB and append new task
	hostCollection := client.Database("Sirius").Collection("Hosts")

	var result siriusDB.SVDBHost
	err = hostCollection.FindOne(context.TODO(), bson.D{{"ip", agent.IP}}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return
		}
		panic(err)
	}
	newTask := agent.Tasks[0]
	newTask.Date = time.Now()
	result.Agent.Tasks = append(result.Agent.Tasks, newTask)

	fmt.Println(agent)
	//Update Agent Details
	res, err := hostCollection.UpdateOne(
		ctx,
		bson.M{"ip": agent.IP},
		bson.D{
			{"$set", bson.D{{"Agent", result.Agent}}},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(res)
	fmt.Println("Task Assigned to Agent: ", agent.AgentId)
}

func GetTasks(agent siriusDB.SiriusAgent) []siriusDB.Task {
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
	hostCollection := client.Database("Sirius").Collection("Hosts")

	//Update Agent Details
	var result siriusDB.SVDBHost
	var taskList []siriusDB.Task
	err = hostCollection.FindOne(context.TODO(), bson.D{{"ip", agent.IP}}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return taskList
		}
		panic(err)
	}
	taskList = result.Agent.Tasks

	return taskList
}

/*
[SIRIUS AGENTS API HELPER FUNCTIONS]
*/

func processReport() {
	fmt.Println("test")
}
