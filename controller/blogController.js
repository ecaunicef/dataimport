const Blog = require('../model/blog');

const envirements = require('../config/env');
const path = require('path');
const schedule = require('node-schedule');
const admin = require('firebase-admin');

const { google } = require('googleapis');
const axios = require('axios');
const env = require('../config/env');
var fs = require('fs'),
  es = require('event-stream');
const { fork } = require('child_process');
const moment = require('moment')

const { Op, Sequelize } = require('sequelize');

// Load the service account credentials



// Authenticate with the service account
async function getAccessToken() {

  const keyPath = path.join(__dirname, '../../constantfile/serviceAccountKey.json');
  // console.log("aaa", keyPath)

  const credentials = JSON.parse(fs.readFileSync(keyPath));

  console.log(credentials)

  // Scopes required for Firebase Cloud Messaging
  const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: SCOPES,
  });
  // console.log(1)

  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  return accessTokenResponse.token;
}



// Create a new blog
const sendNotification = async (req, res) => {
  console.log("8763478438473g4")
  const accessToken = await getAccessToken();
  
  const fcmUrl = 'https://fcm.googleapis.com/v1/projects/unicef-11947/messages:send';

  const deviceTokens = 'e8U5VTSLS0ahJi1HlytnT6:APA91bFk1GNqSbl1eTTa8fIWgJN4nA3Q_H6UuCw8CwSIfqJ-Y2zBgPrcXF6ETcwLyT_9Krdg7a7MfdjZPx_A_WvSOftFc2D5ViIWx5bXDrfI6afFfGo8OHE';
  
  const requestBody = {
    "message": {
      notification: {
        title: 'Test Notification',
        body: 'This is a test message sent to multiple devices using FCM V1 API',
      },
      token: deviceTokens, // Array of device tokens,
      data: {
        "screenName": "notification" 
      }
    },
  };

  try {

    const response = await axios.post(fcmUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Notification sent successfully:', response);
    res.send(response.data, response.successCount, response.failureCount)

  } catch (error) {
    console.error('Error sending notification:', error.response ? error.response.data : error.message);
    res.send(error.response ? error.response.data : error.message)
  }
}


const createBlog = async (req, res) => {
  try {

    const { title, subtitle, message, message_category, broadcastDate, area, createdBy, is_scheduled, sent_date } = req.body;

    let scheduledDate = null;
    if (broadcastDate) {
      const parsedDate = moment(broadcastDate, moment.ISO_8601, true); // Parse ISO format strictly
      if (parsedDate.isValid()) {
        scheduledDate = parsedDate.toDate(); // Convert to a Date object
      } else {
        console.error('Invalid broadcastDate format:', broadcastDate);
      }
    }
    let sentDate = null;
    if (sent_date) {
      const parsedDate = moment(sent_date, moment.ISO_8601, true); // Parse ISO format strictly
      if (parsedDate.isValid()) {
        sentDate = parsedDate.toDate(); // Convert to a Date object
      } else {
        console.error('Invalid sent_date format:', sent_date);
      }
    }


    const payload = {
      title: title,
      subtitle: subtitle,
      message: message,
      message_category: message_category,
      // image: imageUrl || (req.body.image == null ? "" : req.body.image),
      // heading:"",
      area_level1: area?.join(','),
      // flag:0,
      createdby: createdBy,
      viewblogcount: 0,
      scheduled: scheduledDate,
      is_scheduled: Number(is_scheduled)
    }

    const blog = await Blog.create(payload);
    let date='';
    if ( is_scheduled && is_scheduled!=0){
      date = scheduledDate;
      const job = schedule.scheduleJob(date, function () {
        const process = fork('./services/broadcastService.js');
        process.send({ 'row': blog, 'user_id': '', "sent_date":sentDate  });
        process.on('message', () => {
          console.log('completed');
        });
      });
    }else{
      const process = fork('./services/broadcastService.js');
      process.send({ 'row': blog, 'user_id': '',"sent_date":sentDate });
      process.on('message', () => {
        console.log('completed');
      });
    }

   

    // Send the created blog as a response
    res.status(201).json({ data: blog, message: 'Created successfully', success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message, success: false });
  }
};



// Get all blogs

// const getAllBlogs = async (req, res) => {
//   try {
//     const { country } = req.query;
//     const condition = country && country !== 'all' ? 
//       { createdby: country } : {};
//     const blogs = await Blog.findAll({ where: condition });
//     res.json(blogs);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Update a blog by ID
// const updateBlog = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const [updated] = await Blog.update(req.body, {
//       where: { id }
//     });
//     if (!updated) {
//       return res.status(404).json({ message: 'Blog not found' });
//     }
//     const updatedBlog = await Blog.findByPk(id);
//     return res.status(200).json(updatedBlog);
//   } catch (error) {
//     return res.status(500).json({ message: 'Error updating blog', error: error.message });
//   }
// };


// Update a blog by ID
const updateBlog = async (req, res) => {
  const { id } = req.body;

  try {
    const { title, subtitle, message, message_category, area, broadcastDate, createdBy, is_scheduled, sent_date } = req.body;

    let imageUrl = '';
    let previousImage = '';

    const existingBlog = await Blog.findByPk(id);
    if (!existingBlog) {
      return res.send({ message: 'Blog not found', success: false });
    }

    // previousImage = existingBlog.image;

    // Handle file upload
    // if (req.files && req.files.image) {
    //   const imageFile = req.files.image;
    //   const newFileName = `${Date.now()}_${imageFile.name}`;
    //   const uploadPath = `${envirements.resourcePath}/${newFileName}`;

    //   await imageFile.mv(uploadPath);
    //   imageUrl = newFileName;
    // }

    let scheduledDate = null;
    if (broadcastDate) {
      // const parsedDate = new Date(broadcastDate);
      const parsedDate = moment(broadcastDate).format('dddd, DD-MM-YYYY HH:mm:ss');
      if (!isNaN(parsedDate)) {
        scheduledDate = parsedDate;
      }
    }

    let sentDate = null;
    if (sent_date) {
      const parsedDate = moment(sent_date, moment.ISO_8601, true); // Parse ISO format strictly
      if (parsedDate.isValid()) {
        sentDate = parsedDate.toDate(); // Convert to a Date object
      } else {
        console.error('Invalid sent_date format:', sent_date);
      }
    }


    const payload = {
      title: title,
      subtitle: subtitle,
      message: message,
      message_category: message_category,
      area_level1: area?.join(','),
      createdBy: createdBy,
      is_scheduled: is_scheduled,
      scheduled: scheduledDate
    };

    const [updated] = await Blog.update(payload, { where: { id }, });

    if (!updated) {
      return res.send({ message: 'Blog not found', success: false });
    }

    let date = '';
    if (is_scheduled && is_scheduled != 0) {
      date = scheduledDate;
      console.log(is_scheduled, date)
      const job = schedule.scheduleJob(date, function () {
        console.log("is_scheduled")
        const process = fork('./services/broadcastService.js');
        process.send({ 'row': existingBlog, 'user_id': '', 'sent_date': sentDate });
        process.on('message', () => {
          console.log('completed');
        });
      });
    } else {
      const process = fork('./services/broadcastService.js');
      process.send({ 'row': existingBlog, 'user_id': '', 'sent_date': sentDate });
      process.on('message', () => {
        console.log('completed');
      });
    }

    if (imageUrl) {
      const previousImagePath = `${envirements.resourcePath}/${previousImage}`;
      fs.unlink(previousImagePath, (err) => {
        if (err) {
          console.error(`Error deleting previous image: ${err.message}`);
        }
      });
    }

    const updatedBlog = await Blog.findByPk(id);

    return res.status(200).json({
      data: updatedBlog,
      message: 'Updated Successfully',
      success: true,
    });

  } catch (error) {
    return res.send({ message: error.message , error: error.message });
  }
};


const deleteBlog = async (req, res) => {
  const { id } = req.body;

  try {
    const existingBlog = await Blog.findByPk(id);
    if (!existingBlog) {
      return res.send({ message: 'Blog not found' });
    }

    // const imagePath = path.join(envirements.resourcePath, existingBlog.image);

    // if (fs.existsSync(imagePath) && fs.lstatSync(imagePath).isFile()) {
    //   fs.unlink(imagePath, (err) => {
    //     if (err) {
    //       console.error(`Error deleting image: ${err.message}`);
    //     }
    //   });
    // } else {
    //   console.warn('Image not found or not a file:', imagePath);
    // }

    const deleted = await Blog.destroy({ where: { id } });
    if (!deleted) {
      return res.send({ message: 'Blog not found' });
    }

    return res.send({ message: 'Blog deleted successfully', success: true });

  } catch (error) {
    return res.send({ message: 'Error deleting blog', error: error.message, success: false });
  }
};



const sendManually = async (req, res) => {
  try {

    const process = fork('./services/broadcastService.js');
    process.send({ 'row': req.body, 'user_id': '' });
    process.on('message', () => {
      console.log('completed');
    });
    // let data = await Blog.update({
    //   sending_status: "In-Progress",
    // }, {
    //   where: {
    //     id: req.body.id
    //   }
    // })
    return res.send({ success: true, sent: true, message: "Notification is In-progress" });

  } catch (error) {
    return res.send({ success: false, message: "Something went wrong" });
  }
}

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  sendNotification,
  sendManually
};
