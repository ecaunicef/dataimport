const Chatline = require('../model/mental_health_chatline');
const Area = require('../model/area');

const { Sequelize } = require('sequelize');

let mentalHealthController = {
    createChatline: async (req, res) => {
        try {
            const { area_level1, w_link } = req.body;

            let areacode = await Chatline.findOne({
                where: {
                    area_level1: area_level1,
                }
            })

            if (areacode) {
                res.status(409).json({
                    status: false,
                    message: "Area code already exists"
                })
                return;
            }

            let create = await Chatline.create({
                area_level1: area_level1,
                w_link: w_link
            });
            await create.save();
            return res.status(200).json({ status: true, message: "Mental Health Chatline created successfully!" })


        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: error.message });
        }


    },

    updateChatline: async (req, res) => {
        try {
            const { id, area_level1, w_link } = req.body;

            if (!id) {
                return res.send({ status: false, message: "ID is required for updating the chatline." })
            }

            const chatline = await Chatline.findOne({ where: { id } });
            await chatline.update({
                w_link,
                area_level1
            });

            res.status(200).json({ status: true, message: 'Mental Health Chatline updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: false, error: err.message });
        }


    },

    deleteChatline: async (req, res) => {
        try {
            const { id } = req.body;

            const chatline = await Chatline.findOne({ where: { id } });
            await chatline.destroy()

            res.status(200).json({status: true, message: "Mental Health Chatline deleted successfully"});

        } catch (err) {
            console.error(err);
            res.status(500).json({ status: false, message: err.message });
        }

    },

    changeStatusChatline: async (req, res) => {
        try {
            const { id, status } = req.body;

            if (!id) {
                return res.send({ status: false, message: "ID is required for updating the chatline." })
            }

            const chatline = await Chatline.findOne({ where: { id } });
            await chatline.update({
                status
            });

            res.status(200).json({ status: true, message: "Status updated successfully" })
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: false, message: err.message });
        }

    }

}


module.exports = mentalHealthController