# DATAIMPORT

## Prerequisites
Ensure you have **Node.js v18.20.8** installed.

## Clone the Repository
```sh
git clone <repository-url>
cd dataimport
```

## Install Dependencies
```sh
npm install
```


## Project Structure
```
/dataimport
│---- controllers/
│---- models/
|---- routes/
│---- services/
│-- .env
|--- app.js
│-- package.json
│-- README.md
```

## Environment Variables
Create a `.env` file in the root directory and configure necessary environment variables:
```
PORT=9091 
DATABASE_URL=<your-database-url>
```

## Setup Firebase
There is a repository name ConstantFile, where key json file is kept, which is used to send notification to mobile app.
File name: serviceAccountKey.json
In this file, one can set their credential

Update .env file with below varible to fetch credential
```sh
CONSTANT_FILE_PATH=/var/www/html/project/constantfile/
```

Go to broadcastService.js, where notification code is written, one can edit this code according to their notification service app.
```sh
Location: /services/broadcastService.js
```

This code is to generate access token
```sh
async function getAccessToken() {

    const keyPath = env.constantFilePath +"serviceAccountKey.json";
    const credentials = JSON.parse(fs.readFileSync(keyPath));
    const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

    const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: SCOPES,
    });

    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    return accessTokenResponse.token;
}
```
To start sending notification below function is called, and you can set their project-id in the url
```sh
startBroadcast
const fcmUrl = 'https://fcm.googleapis.com/v1/projects/project-id/messages:send';
```

## Start the Development Server
Run the following command to start the server in development mode:
```sh
nodemon
```
The Express server runs on **port 9091**.

