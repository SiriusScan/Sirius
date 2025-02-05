# Sirius Scan
Sirius is the first truly open-source general purpose vulnerability scanner. Today, the information security community remains the best and most expedient source for cybersecurity intelligence. The community itself regularly outperforms commercial vendors. This is the primary advantage Sirius Scan intends to leverage.

The framework is built around four general vulnerability identification concepts: The vulnerability database, network vulnerability scanning, agent-based discovery, and custom assessor analysis. With these powers combined around an easy to use interface Sirius hopes to enable industry evolution.

## Getting Started
To run Sirius clone this repository and invoke the containers with `docker-compose`. Note that both `docker` and `docker-compose` must be installed to do this.

```
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius
docker-compose up
```

### Logging in
The default username and password for Sirius is: `admin/sirius`

## Services 
The system is composed of the following services: 
- Mongo: a NoSQL database used to store data. 
- RabbitMQ: a message broker used to manage communication between services. 
- Sirius API: the API service which provides access to the data stored in Mongo. 
- Sirius Web: the web UI which allows users to view and manage their data pipelines. 
- Sirius Engine: the engine service which manages the execution of data pipelines. 

## Usage 
To use Sirius, first start all of the services by running `docker-compose up`. Then, access the web UI at `localhost:5173`.

### Remote Scanner
If you would like to setup Sirius Scan on a remote machine and access it you must modify the `./UI/config.json` file to include your server details.

**Good Luck! Have Fun! Happy Hacking!**


# UI Notes

Environment variables are passed into the container via the .env file