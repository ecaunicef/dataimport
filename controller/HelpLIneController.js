const Helpline = require('../model/helpline.js');

let helplineController = {

    // Method to create a new helpline
    createHelpline: async (req, res) => {
        try {
            const {
                helplinenumber,
                classification_id,
                emergency_service,
                hotline,
                organization,
                website,
                add1,
                add2,
                tel1,
                tel2,
                email,
                geolocation,
                flag,
                subcategory,
                area_level1,

            } = req.body;


            // Validate the incoming payload
            // if (!helplinenumber || !classification_id || !organization || !website || !add1 || !tel1 ||  !email) {
            //     return res.status(400).json({ status:false, message: 'All fields are required' });
            // }

            if (!helplinenumber || !classification_id || !organization) {
                return res.send({ status:false, message: 'All fields are required' });
            }

            const newHelpline = await Helpline.create({
                helplinenumber,
                classification_id,
                emergency_service,
                hotline,
                organization,
                website,
                add1,
                add2,
                tel1,
                tel2,
                email,
                geolocation,                
                flag,
                subcategory: subcategory ? subcategory :'',
                area_level1: area_level1
            });

            res.send({status:true, message:"Record added successfully"}); // Respond with the created user
        } catch (err) {
            console.error(err);
            res.send({ status:false, message: 'Internal Server Error' });
        }
    },

    

    updateHelpline: async (req, res) => {
        try {
            const {
                id,
                helplinenumber,
                classification_id,
                emergency_service,
                hotline,
                organization,
                website,
                add1,
                add2,
                tel1,
                tel2,
                email,
                geolocation,
                flag,
                subcategory,
                area_level1,
            } = req.body;

            if (!id) {
                return res.send({ status:true, message: 'ID is required for updating the helpline record' });
            }

            const helpline = await Helpline.findOne({ where: { id } });
            await helpline.update({
                id,
                helplinenumber,
                classification_id,
                emergency_service,
                hotline,
                organization,
                website,
                add1,
                add2,
                tel1,
                tel2,
                email,
                geolocation,
                flag,
                subcategory: subcategory ? subcategory : '',
                area_level1: area_level1
            });

            res.send({status:true, message:'Helpline updated successfully'}); 
        } catch (err) {
            res.send({ status:false, message: 'Internal Server Error' });
        }
    },


    deleteHelpline: async (req, res) => {
        try {
            const { id } = req.body;

            if (!id) {
                return res.send({ message: 'ID is required for deleting the helpline record' });
            }

            const deletedHelpline = await Helpline.destroy({ where: { id } });

            if (!deletedHelpline) {
                return res.send({ status:false, message: 'Helpline record not found' });
            }

            res.send({ status:true,message: 'Helpline record deleted successfully' });
        } catch (err) {
            console.error(err);
            res.send({ status:false, message: 'Internal Server Error' });
        }
    },


};

module.exports = helplineController; 
