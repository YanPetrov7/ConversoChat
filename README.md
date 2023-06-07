# ConversoChat
## Introduction
ConversoChat is a chat application that allows users to chat with each other in real time. You can find the design document [here](https://docs.google.com/document/d/1zcSbLeUzZDugJ99gRmcNB-2DnucfFfdT-50AT_Y1eOc/edit?usp=sharing).
### Backend
* __Express.js__ is used to create the server and handle the routes.
* __Websocket__ is used to handle the real time communication between the server and the client.
* __MySQL__ is used to store the messages and the users.
* __ORM Sequelize__ is used to handle the database.
* __bcrypt__ is used to hash the passwords.
### Frontend
* __HTML & CSS__ is used to create the UI.
* __Javascript__ is used to handle the real time communication between the client and the server.
## Installation
* __[Install](https://docs.docker.com/get-docker/) docker and docker-compose__
* __Clone the repository__:
```bash
$ git clone https://github.com/YanPetrov7/ConversoChat.git
```
* __Go to the project directory__:
```bash
$ cd ConversoChat
```
* __Create an environmental variables__:
```bash
$ export DB_PASSWORD="your_password"
$ export TEST_DB_PASSWORD="your_password"
```
## Run the application
* __Start the containers__:
```bash
$ docker-compose up --build
```
* __Open the application in your browser__: http://localhost:3000/

## Run the tests:
* __Start the containers__:
```bash
$ docker-compose up --build
```
* __Run the tests__:
```bash
$ docker exec -it conversochat-app-1 npm test
```