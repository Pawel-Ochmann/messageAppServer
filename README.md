## Messaging App Project

This is the backend repository for the Full Stack Messaging App Project built for the [Odin Project Curriculum](https://www.theodinproject.com/lessons/nodejs-messaging-app).

The goal of the project was to build a messaging web app that allows users to send and receive real-time messages.

Frontend part is using react/typescript, backend - Express.js/MongoDB. Both are written in typescript.

The Socket.IO library was used for the real-time communication functionality between the project's client and server.

- Project's Live Preview url - https://message-app-client.netlify.app
- Project's Frontend Repository - https://github.com/Pawel-Ochmann/messageAppClient.git
- Project's Backend Server Address - https://message-application.fly.dev

If you have any questions, or spot a bug, contact me via linked in - https://www.linkedin.com/in/paweł-ochmann-86418a2b5/ or email - pav.ochmann@gmail.com

## Technologies Used

- NodeJS
- ExpressJS
- MongoDB
- ReactJS
- CSS Modules
- Socket.IO

## Key features

- Real-time transmission of messages between users using WebSockets
- Allows sending messages, emotes, images
- Sending Giphs - dynamic search, using Giphy.com api
- Allows recording and sending audio messages
- Integration with RESTful backend API
- Persistent Authentication using JWTs
- Creating new accounts and customizing users profiles
- Setting light/dark mode and store settings between sessions
- Audio effects and setting volume level in settings
- Creating groups, setting group image, adding users, sending group messages (images, audio etc.)
- Displaying info about users activity - last time seen (or is active), if user is typing.

## Installation

To run the project locally :

- Clone the repository and run the following command to install the project's dependencies

```
npm install
```

- Run the following command to spin up a local development server

```
npm run dev
```

- Open http://localhost:5173 with your browser to access a local version of the project's client