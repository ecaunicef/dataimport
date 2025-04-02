const db = require('../model/db.js');
const redis = require('redis');
const fetch = require("node-fetch");
const env = require('../config/env.js')
const redisClient = require('../model/redis.js');
var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST



const Blog = require('../model/blog.js');
const { Op, Sequelize } = require('sequelize');
const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const schedule = require('node-schedule');


router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
    }
}))
var parse = require("csv-parse"),
    Area = require('../model/area.js');
const UploadedFileInfoSchema = require('../model/uploaded_file_info.js');
var fs = require('fs')
    , es = require('event-stream');







const broadcastService ={
    startBroadcast: async function (row,user_id, sent_date) {
        try {
            console.log("SENT DATE--", sent_date)
            let blog_id = row.id;
            // console.log(blog_id)
            // let data = await Blog.update({
            //     sending_status: "In-Progress",
            // }, {
            //     where: {
            //         id: blog_id
            //     }
            // });
        const accessToken = await getAccessToken();

            let query = `SELECT 
                    b.id AS blog_id,
                    b.title AS blog_title,
                    b.subtitle AS blog_subtitle,
                    b.message AS blog_message,
                    b.area_level1 AS blog_area_level1,
                    b.scheduled AS blog_scheduled,
                
                    a.area_code AS area_code,
                    a.level AS area_level,
                    a.parent_area_code AS area_parent_code,
                    u.deviceToken as deviceToken,
                    u.area_level as area_level
                FROM 
                    blog b
                JOIN 
                    area a
                ON 
                    FIND_IN_SET(a.parent_area_code, b.area_level1)
                JOIN 
                    user u ON u.area_level = a.area_code and u.deviceToken is not null and u.flag != 1
                WHERE 
                    b.id = `+ blog_id;

            let count = parseInt(row.viewblogcount);
            let blogData = await Blog.sequelize.query(query, {
                type: Blog.sequelize.QueryTypes.SELECT
            });

            let isCount=false;
            const fcmUrl = 'https://fcm.googleapis.com/v1/projects/xxxxx/messages:send';
            for (let index = 0; index < blogData.length; index++) {
             try{
                 const device = blogData[index]['deviceToken'];
                 const title = blogData[index]['blog_title'];
                 const body = blogData[index]['blog_message'];
 
                //  const deviceTokens = device;
                 const deviceTokens = device
 
                 const requestBody = {
                     "message": {
                         notification: {
                             title: title,
                             body: body,
                         },
                         token: deviceTokens,
                         data: {
                             "screenName": "notification"
                         } 
                     },
                 };
 
                 const response = await axios.post(fcmUrl, requestBody, {
                     headers: {
                         'Authorization': `Bearer ${accessToken}`,
                         'Content-Type': 'application/json',
                        },
                    });
                 isCount=true;
             }catch(e){
                 console.log('Error',e.message);
             }
            }




            if (isCount) {
                count += 1;

            }
            
            const currentDate = new Date(); // Get current date
            const formattedDate = currentDate.toISOString();
            let updatedRecord = await Blog.update({
                viewblogcount: count,
                sent: formattedDate,
                sending_status: "Completed",
            },
                {
                    where: {
                        id: row.id,

                    }
                }
            );
        
            return;
        } catch (error) {
            let updatedRecord = await Blog.update({
                sending_status: "Failed",
            },
                {
                    where: {
                        id: row.id,
                    }
                }
            );
            
            console.log(error.message);
            return;
        }
    }



    

};


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



















process.on('message', async (message) => {

    // console.log(message);
    let res = await broadcastService.startBroadcast(message.row,message.user_id, message.sent_date);
    process.send({ status: true });

});