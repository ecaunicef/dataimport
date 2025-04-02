const { response } = require('../app.js');
const CredentialModel=require('../model/credential.js');
const { base64encode, base64decode } = require("nodejs-base64");
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");
const Role = require('../model/role.js');
const AdminUser=require('../model/admin_user.js');
const { updateStatus } = require('./areaController.js');
const env = require("../config/env");
// const Mailer = require('../middleware/mail');
const nodemailer = require("nodemailer");
const { Op } = require('sequelize');
const crypto = require("crypto");



let credentialController={
    createCredentials:async (req, res) => {
        try {
            const {user} = req.body;
            const isUserExist = await AdminUser.findAll({
                where: { email: user.email }
            });

            const isUserNameExist= await AdminUser.findAll({
                where: { username: user.username }
            });
            if (isUserExist?.length > 0 || isUserNameExist?.length>0){
                return res.send({
                    status: true,
                    message: "User already  exist",
                });
            }else{
                const saltRounds = 10;
                let password = await bcrypt.hash(user.password, saltRounds)
                let countryList = user?.cid?.filter((country) =>country!='all selected')?.join(',');
                const userInfo = await AdminUser.create({
                    username: user?.username,
                    email: user?.email,
                    cid:countryList,
                    password: password,
                    user_role:user?.role
                }); 
                return res.send({
                    status: true,
                    message: "User credentials created successfully",
                    // data: userInfo,
                });
            }
        } catch (err) {
            console.error(err);
            return res.send({           
                status: false,
                message: "Something went wrong",
                error: err.message,
            });
        }
    },
    updateCredentials: async (req, res) => {
        try {
            const { payload,id} = req.body; 
            payload.cid = payload?.cid?.filter((item) => item != "all selected");
            // console.log(bcrypt.)
            const isUserExist = await AdminUser.findOne({
                where: {
                     email: payload?.email
                }

            });
            let password;
            if (!isUserExist && isUserExist?.email !=payload.email){
                const saltRounds = 10;
                password = await bcrypt.hash(payload.password, saltRounds)
            }
            let Obj ={}
            if (payload?.password){
                const saltRounds = 10;
                password = await bcrypt.hash(payload.password, saltRounds)
                Obj = {
                    username: payload.username,
                    email: payload.email,
                    area_level1: JSON.stringify(payload.cid),
                    password: password,
                }
            }else{
                Obj = {
                    username: payload.username,
                    email: payload.email,
                    area_level1: JSON.stringify(payload.cid),
                }
            }
          
            const updated= await AdminUser.update(
                Obj
               ,
                {
                    where: { id:id }    
                }
            );

            if (updated) {
                const updatedUser = await AdminUser.findByPk(id); // Fetch the updated user
                return res.send({
                    status: true,
                    message: "User credentials updated successfully",
                });
            }
            return res.send({
                status: false,
                message: "User not found",
            });
        } catch (err) {
            console.error(err);
            return res.send({
                status: false,
                message: "Something went wrong",
                error: err.message,
            });
        }
    },
    deleteCredentials:async (req, res) => {
        try {
            const { id } = req.body; 
            const deleted = await AdminUser.update(
                {flag:1},
                {

                    where: {id:id },
                }
            );

            if (deleted) {
                return res.send({
                    status: true,
                    message: "User credentials deleted successfully",
                });
            }
            return res.send({
                status: false,
                message: "User not found",
            });
        } catch (err) {
            console.error(err);
            return res.send({
                status: false,
                message: "Something went wrong",
                error: err.message,
            });
        }
    },
    approveCredentials:async (req,res)=>{
        try{

            const { status, id } = req.body;
            const updated = await AdminUser.update(
                {
                    status: status
                },
                {
                    where: { id: id }
                }
            );
            if (updated){

                res.send({
                    status:true,
                    message:"Status updated successfully"
                })
            }else{
                res.send({
                    status: false,
                    message: "Error updating status"
                })
            }
        }catch(err){
            res.send({
                status: false,
                message: "Error updating status"
            })

        }
    },
    addAdminUser:async (req,res)=>{
        try {
            let {user} = req.body;
            user.cid = user.cid?.filter((item) => item !="all selected");
            const isUserExist = await AdminUser.findOne({
                where: { email:user.email}
            }); 

            const isUserNameExist = await AdminUser.findOne({
                where: { username:user.username}
            });

            if (isUserExist || isUserNameExist) {
                return res.send({
                    status: true,
                    message: "User already  exist",
                });
            } else {
                const saltRounds = 10;
                let password1 = await bcrypt.hash(user.password, saltRounds);
                const userInfo = await AdminUser.create({
                    username:user.username,
                    email:user.email,
                    area_level1: JSON.stringify(user.cid),
                    password:password1,
                    // user_role:role,
                    // profile_image: profile_img
                });
                return res.send({
                    status: true,
                    message: "User credentials created successfully",
                });
            }

            
        } catch (error) {
            console.log(error);
            return res.send({
                status:false,
                message:"Something went wrong"
            })
        }
    },

    updateStatus:async (req,res)=>{
        try{
            let { status, id }=req.body;
            let payload = { status };
            let updateStatus = await AdminUser.update(
                payload,
                { where: { id: id } }
            );

            if (updateStatus && updateStatus[0] >= 1) {
                return res.send({
                    status: true,
                    message: "Status updated successfully",
                });
            } else {
                return res.send({
                    status: false,
                    message: "Error updating status or no rows matched the condition",
                });
            }

        }catch(error){
            console.log(error);
            return res.send({
                status:false,
                message:"Something went wrong"
            });
        }
    },
    forgetPassword: async (req, res) => {
        try {
            const userEmail = req.body.email;

            // Check if the user exists with the given email, active status, and valid flag
            const userInfo = await AdminUser.findOne({
                where: { email: userEmail, flag: 0, status: 1 },
            });

            if (!userInfo) {
                return res.send({ status: 0, message: "Invalid email id " });
            }

            // Check if a valid token already exists
            let tokenRecord = await AdminUser.findOne({
                where: { id: userInfo.id, token: { [Op.ne]: "" } },
            });

            let token = tokenRecord?.token;
            if (!token) {
                token = crypto.randomBytes(32).toString("hex");
                await AdminUser.update(
                    { token },
                    { where: { id: userInfo.id } }
                );
            }

            // Set up the email transporter
            const mailTransporter = nodemailer.createTransport({
                host: env.mailhost,
                port: env.mailport,
                auth: {
                    user: env.mailusername,
                    pass: env.mailpass,
                },
            });

            // Email details
            const resetLink = `${env.DATAMANAGER_URL}/password-reset/${userInfo.id}/${token}`;
            const mailDetails = {
                from: env.mainformAddress,
                to: userEmail,
                subject: "Reset Password",
                html: `<h2 style="color:#ff6600;">Forget Password Email</h2>
                   <p>You can reset your password using the link below:</p>
                   <a href="${resetLink}">Reset Password</a>`,
            };

            // Send email
            await mailTransporter.sendMail(mailDetails);

            return res.status(200).send({
                status: 1,
                message: "Password reset link sent successfully. Please check your email.",
            });

        } catch (error) {
            console.error(error);
            return res.status(500).send({ status: 0, message: "An error occurred. Please try again later." });
        }
    },

    resetPassword:async (req, res) => {
        try {
            let pass = req.body.password;
            let decodedPass = base64decode(pass);
            let newPass = decodedPass.substring(10);
            var BCRYPT_SALT_ROUNDS = 12;
            const tokendata = await AdminUser.findOne({ where:{token: req.body.token, status: 1 }});
            const findedUser = await AdminUser.findOne({ where:{id:tokendata?.id} });
            let originalDate = new Date(tokendata?.created);
            originalDate.setUTCHours(originalDate.getUTCHours() + 24);
            const formattedNewDate = originalDate.toISOString();

            if (formattedNewDate < new Date().toISOString()) {
                res.send({ status: 0, message: 'This token expired' });
                return
            }

            if (findedUser?.email != req.body.email || findedUser == null) {
                res.send({ status: 0, message: 'Invalid Email ID' });
                return
            }
            bcrypt.hash(newPass, BCRYPT_SALT_ROUNDS).then(async (b_password) => {
                let npass = b_password;
                let currentDate = new Date().toISOString();
                await AdminUser.update({
                    password:npass,
                },
                {
                    where:{
                        id: findedUser.id
                    }
                }
            )
            });
            res.send({
                success: true,
                message: "Your password has been changed successfully.",
            });
        } catch (error) {
            console.log(error)

        }

    }
   
}

module.exports = credentialController; 