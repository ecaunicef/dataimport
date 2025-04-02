const User = require('../model/user.js');
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require("uuid");
const env = require('../config/env.js');
const jwt = require("jsonwebtoken");
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");
const { base64encode, base64decode } = require("nodejs-base64");
const CredentialModel = require('../model/credential.js');
const AdminUser = require('../model/admin_user.js');
const fs = require('fs');


let userController = {

  // Method to create a new user
  createUser: async (req, res) => {
    try {
      console.log("aa", req.body)

      const {
        name,
        gender,
        age,        // Required field
        area_level,
        language,
        flag,
        latlongt,
        deviceToken,
        password,
      } = req.body;

      const newUser = await User.create({
        name,
        gender,
        age,
        area_level,
        language,
        flag,
        latlongt,
        deviceToken,
        password,
      });

      res.status(200).json(newUser);
    } catch (err) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  },


  deleteUser: async (req, res) => {
    try {
      let id = Number(req.body.id);
      // const result = await User.destroy({
      //   where: { id: id }
      // });

      // Get the current date and time
      const now = new Date();

      // Format the date and time in the 'YYYY-MM-DD HH:MM:SS' format
      const formattedDate = now.getFullYear() + '-' 
                          + String(now.getMonth() + 1).padStart(2, '0') + '-'
                          + String(now.getDate()).padStart(2, '0') + ' '
                          + String(now.getHours()).padStart(2, '0') + ':'
                          + String(now.getMinutes()).padStart(2, '0') + ':'
                          + String(now.getSeconds()).padStart(2, '0');

      const payload = {
        deleted: formattedDate,
        flag: 1
      }

      let result = await User.update(payload, { where: { id: id } });

      if (result) {
        return res.send({ status: true, message: "User deleted successfully" });
      } else {
        return res.send({ status: false, message: "User not found" });
      }

    } catch (error) {
      res.send({ status: false, message: "Error deleting user" });
    }
  },
  updateUser: async (req, res) => {
    try {
      console.log(req.body)
      let { payload, id } = req.body;

      let data = await User.update(payload, { where: { id: id } });

      return res.send({
        status: true,
        data
      })
    } catch (error) {
      return res.send({ status: false, message: "Something went wrong" });
    }

  },

  refreshDeviceToken: async function (req, res) {

    try {
      const { user_id, deviceToken } = req.body;

      const user = await User.findOne({ where: { id: user_id } });

      if (!user) {
        return res.status(404).json({ status: false, message: "User not found!" });
      }

      if (!deviceToken) {
        return res.status(404).json({ status: false, message: "Device Token is required." })
      }

      user.deviceToken = deviceToken;

      await user.save();

      res.status(200).json({ status: true, message: "Device token updated successfully!" });



    } catch (error) {
      console.error(error.message);
      res.status(500).json({ status: false, message: error.message });
    }

  },

  updateProfile: async (req, res) => {
    try {
      const { id, name, phone, img } = req.body;
      // console.log(id,name,img,phone,"999")
      if (!id) {
        return res.status(400).send({
          success: false,
          message: 'Please Provide Id',
        });
      }

      if (!name && !img) {
        return res.status(400).send({
          success: false,
          message: 'Please Provide Data To Update',
        });
      }

      let updateObj = {};

      if (name) updateObj['name'] = name;
      // if (phone) updateObj['phone'] = phone;

      if (img) {
        const time_stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${time_stamp}_userimg.png`;

        const [meta, imageData] = img.split(';');
        if (meta && imageData) {
          const imageBufferData = Buffer.from(imageData.split(',')[1], 'base64');
          fs.writeFileSync(`${env.resourcePath}/${fileName}`, imageBufferData);
          updateObj['profile_image'] = fileName;
        } else {
          updateObj['profile_image'] = img;
        }
      }

      const [updated] = await AdminUser.update(updateObj, {
        where: { id: id },
      });

      // console.log(updated, "99999", updateObj)

      if (updated) {
        return res.status(200).send({
          success: true,
          message: 'Profile Updated Successfully',
        });
      } else {

        return res.status(400).send({
          success: false,
          message: 'Not Updated',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).send({
        success: false,
        message: 'An error occurred while updating the profile.',
      });
    }
  } 




};

module.exports = userController; 
