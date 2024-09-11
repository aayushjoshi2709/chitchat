# Chit Chat

Chit Chat is a chatting app with end to end encryption instant messaging.

## Features Included

- End to end encryption
- Instant Messaging
- Read reciepts

## Technologies Used

- Redis - For user and socket id caching
- MongoDB - To store user and message data
- Docker - For containerazation
- React - To build a single page web application
- Node - For the backend

## How to setup

There are two methords to set up chit chat locally
- Manual configuration
- Via Docker Compose

### Manual Configuration

- To run this manually you have to first install Mongodb and mysql in your local machine
- Now create a .env file inside the server folder having the environment configuration

    __server/.env__

    - Add the following variables to the envionment file

        - PORT=port in which you want the server to run

        - LOG_LEVEL=log level for the server

        - JWT_SECRET= your jwt secrete

        - REDIS_PORT= port in which redis is running

        - REDIS_HOST= redis host

        - DATABASE_URI= uri string for the database

        - CLIENT_URL= url for the client

        An example for doing the same

            PORT=5000
            LOG_LEVEL=info
            JWT_SECRET=sfsdfwer
            REDIS_PORT=6379
            REDIS_HOST=127.0.0.1
            DATABASE_URI=mongodb://127.0.0.1:27017/chit-chat
            CLIENT_URL=http://127.0.0.1:3000

- Add a .env.local file to client folder
    __client/.env.local__
    - Add the following variable to this environment file
        - SERVER_URL - URL for the server

        An example for doing the same
            
            SERVER_URL=http://127.0.0.1:3000
- Now run the following command to install dependencies and start the server

    > cd server && npm install && npm run start

- Move back to client folder and install the dependencies of the client and start the client server
    > cd .. && cd client && npm install && npm start

### Manual Configuration

- For user that just want to try this up as fast as possible. I have build a docker compose file

- Just install docker in your computer and run the following command on workspace directory

    > docker compose up -d

This will setup docker containers install all the dependencies run the required servers you have to just visited

    http://127.0.0.1:8080

in your browser.

