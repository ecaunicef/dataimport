
const MoodTracker = require('../model/mood_tracker.js');

let MoodTrackerController = {

    createMoodTracker: async function (req, res) {
        try {
            const { description, name, uid } = req.body;

            const tracker = await MoodTracker.create({
                description: description,
                name: name,
                id_mobileappuser: uid
            });

            res.send({ status: true, message:"MoodTracker created successfully"});
            
        } catch (error) {
            console.log(error, "error")
            res.send({status: false, message: error.message})
        }

    },

    deleteMoodTracker: async (req, res) => {
        try {
            const { id } = req.body;

            if (!id) {
                return res.send({ status: false, message: 'ID is required for deleting the record' });
                
            }
            if (!id) {
                return res.send({ status: false, message: 'ID is required for deleting the record' });
            }


            const deletedMoodTracker = await MoodTracker.destroy({ where: { id } });

            if (!deletedMoodTracker) {
                return res.send({ status:false, message: 'MoodTracker record not found' });
            }

            res.send({ status: true, message: 'MoodTracker record deleted successfully' });
        } catch (err) {
            console.log(err, "err");
            res.send({ status: false, message: 'Internal Server Error' });
        }
    },


};

module.exports = MoodTrackerController; 
