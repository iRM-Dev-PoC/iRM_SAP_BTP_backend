# Welcome to Our Application!

This is your **SAP Cloud Platform Cloud Foundry** application powered by the [SAP Cloud SDK for JavaScript](https://community.sap.com/topics/cloud-sdk) and [NestJS](https://nestjs.com/).

## Getting started

Everything is ready to go. 

```bash
# Run the application locally
$ npm run start:dev

# Open the application in your default browser
$ open http://localhost:8080/
```

If you have the [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) and are [logged in](https://docs.cloudfoundry.org/cf-cli/getting-started.html#login), you can deploy the application without any changes to the application.

```bash
# Deploy your application to SAP Cloud Platform Cloud Foundry
$ cf push
```

## Testing

The project comes with unit and end-to-end tests. 
Unit tests are located in the `src/` folder next to the modules and controllers, while end-to-end tests are in the `test/` folder.

```bash
# Run unit tests
$ npm run test

# Run e2e tests
$ npm run test:e2e
```

## Continuous Integration

This project is preconfigured to run with the [SAP Cloud SDK Pipeline](https://github.com/SAP/cloud-s4-sdk-pipeline).
To get the installer follow the short [guide](https://github.com/SAP/cloud-s4-sdk-pipeline#download-and-installation).

```bash
# If you have the SAP Cloud SDK CLI installed, it can download the install script for you
sap-cloud-sdk add-cx-server

# Execute the script to start the Jenkins server
$ ./cx-server start
```

Point the new Jenkins to your repository and it will automatically run the pipeline. 
If the pipeline should deploy your application as well, you need to modify the `.pipeline/config.yml`.

## NestJS

NestJS is a progressive [Node.js](http://nodejs.org) framework for building efficient and scalable server-side applications, heavily inspired by [Angular](https://angular.io). 

The [Nest CLI](https://docs.nestjs.com/cli/usages) is a powerful tool and can help you create new controllers, modules and interfaces.

## Support

If you need support with the SAP Cloud SDK, the SAP Cloud SDK CLI or this project scaffold, feel free to open an issue on [GitHub](https://github.com/SAP/cloud-sdk-cli) or ask a question on [stackoverflow with tag [sap-cloud-sdk]](https://stackoverflow.com/questions/tagged/sap-cloud-sdk).

## License and Notice

The SAP Cloud SDK CLI is licensed under the [Apache Software License, v. 2](https://github.com/SAP/cloud-sdk-cli/blob/master/LICENSE). 
Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

The SAP Cloud SDK is in no way affiliated with or endorsed by Nest and its maintainers.
While Nest is our recommendation, the SAP Cloud SDK can be used with any framework, so you are free to choose what you are comfortable with.

---
<br/>
# NestJS Application With CDS In postgreSQL

This guide will walk you through the steps to create a SAP Cloud application using Cloud Foundry and CAP IRE (Integrated Run-time Environment) and Connection of postgreSQL DB in NestJS Application. Ensure you have the necessary prerequisites installed before proceeding.

## Prerequisites

1. **Node Version Manager (NVM)** - Install NVM to manage Node.js versions.
2. **SAP Cloud SDK CLI** - Install the SAP Cloud SDK CLI globally using npm.

## Installation Steps

### 1. Install Node Version Manager (NVM)

```bash
https://github.com/coreybutler/nvm-windows/releases
```

### 2. Install Required Node.js Version

```bash
$ nvm install 18.13.0
$ nvm use 18.13.0
```

### 3. Install SAP Cloud SDK CLI

```bash
$ npm install -g @sap-cloud-sdk/cli
```

### 4. Initialize Project

```bash
$ sap-cloud-sdk init project-name
```

Replace `project-name` with your desired project name.

### 4. Establish Connection With postgreSQL Database Loccal/Dockerize

At first, need to add Three Configurations 

**step 1.**
Firstly need to add `default-env.json` file to your root folder
```JSON
{
  "VCAP_SERVICES": {
    "postgres": [
      {
        "name": "postgres",
        "label": "postgres",
        "tags": ["postgresql", "relational"],
        "credentials": {
          "host": "0.0.0.0",
          "port": "5432",
          "database": "postgres",
          "username": "postgres",
          "password": "1234",
          "uri": "postgres://postgres:1234@0.0.0.0:5432/postgres",
          "schema": "public"
        }
      }
    ]
  }
}
```

**step 2.**
Secondly need to add `.cdsrc.json` file to your root folder

```JSON
{
  "build": {
    "target": ".",
    "tasks": [
      {
        "for": "node-cf",
        "src": "srv",
        "options": {
          "model": ["srv"]
        }
      }
    ]
  },
  "odata": {
    "version": "v4"
  },
  "requires": {
    "db": {
      "kind": "postgres",
      "impl": "@cap-js/postgres",
      "model": ["srv", "./db/data-model.cds"],
      "credentials": {
        "host": "0.0.0.0",
        "port": 5432,
        "user": "postgres",
        "password": "1234",
        "database": "postgres",
        "schema": "public",
        "uri": "postgres://postgres:1234@0.0.0.0:5432/postgres"
      }
    }
  }
}
```

**step 3.**
Lastly need to add this part in `package.json` file.

```JSON
 "cds": {
    "requires": {
      "db": {
        "kind": "postgres"
      },
      "database": {
        "impl": "cds-pg",
        "dialect": "postgres",
        "model": [
          "srv"
        ],
        "credentials": {
          "host": "0.0.0.0",
          "port": 5432,
          "database": "postgres",
          "user": "postgres",
          "password": "1234"
        }
      }
    },
    "migrations": {
      "db": {
        "schema": {
          "default": "public",
          "clone": "_cdsdbm_clone",
          "reference": "_cdsdbm_ref"
        },
        "deploy": {
          "tmpFile": "tmp/_autodeploy.json",
          "undeployFile": "db/undeploy.json"
        }
      }
    }
  }
```
If you want to use Dockerized PostgreSQL DB, Then first of all you need to stop your local postgresql server and replace all this above mention files hosts to -> `0.0.0.0` and if need to connect postgreSQL admin which is running on docker also then you must follow the below steps:

**step 1.**
Docker container ls -> this will show all the containers.

**step 2.**
Docker inspect `<docker container id>`.

**step 3.**
Find the `ipv4` address and add this to dockerized pgadmin host.


NEED TO INSTALL ADDITIONALY IF YOU ARE CLONING FROM GIT.

To install `Cloud Foundry CLI`, run the following command from the command line or from PowerShell - https://github.com/cloudfoundry/cli/releases 
```bash
choco install cloudfoundry-cli
```


To install `sap/cds` , run the following command from the command line or from PowerShell:
```bash
npm add -g @sap/cds-dk
```



## How to Run this Project Using DOCKER

**Step 1 :**

Run the following command after pulling the docker image

```bash
docker run --env-file ./.env -p 8080:8080 ghcr.io/imtrpdevsuman/irm_sap_btp_backend:latest
```

you need the `.env` file to run it. Here is the `.env` format

```bash
UPLOAD_DEST='./public'
```

## How to containerize your nestjs app and pushing to github?


**Step 1 :**
You need a `Dockerfile` in your root of your project

```dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Copy built files from the previous stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Expose port (if needed)
EXPOSE 8080

# Command to run the application
CMD ["node", "./dist/apps/api_gateway/main.js"]

```

**Step 2 :**

Now you need create a docker image. The the following commands

You need to name the image like this, if you want to push it to github.

```bash
docker build . -t ghcr.io/imtrpdevsuman/irm_sap_btp_backend:latest
```

**Step 3 :**
Now you need to run the image. Use the following command to run this image.

```bash
docker run --env-file ./.env -p 8080:8080 ghcr.io/imtrpdevsuman/irm_sap_btp_backend:latest
```

We are mapping the 3000 port of the docker with the local 8080 port. and we need the `.env` file.

**Step 4 :**

Now let's push this image to github. First you need the genarate a personal access token (classic) from your github account. Follow this step to generate the token.

Goto you github account -> Sttings -> Developer Settings -> Personal Access Token (Classic).

Now generate a new token and save it somewhere securely. Make sure you have the permission for the following -

`write:packages,
delete:packages`

You will need this token for authentication.

**Step 5 :**

Now run the following command to login into github

```bash
docker login ghcr.io
```

It will ask you some questions. If it asks for the Username, just enter your github usename. Use you access token that you just generated as you password.

**Step 6 :**

Now we are ready to push it to the github. Run the following command to push the image to the github.

```bash
docker push ghcr.io/imtrpdevsuman/irm_sap_btp_backend:latest
```

It should sucessfully push the image to github.