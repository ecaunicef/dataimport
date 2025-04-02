const MoodMapper = require('../model/mood_mapper');

let moodMapperController = {

    editMoodMapper: async function (req, res) {
        try {
            const {id, mood, description, assigned_modules} = req.body;

            const record = await MoodMapper.findOne({ where: { id: id } });

            if(!record){
                res.status(404).json({message: 'Mood Mapper record not found'});
            }

            const assignedModulesString = Array.isArray(assigned_modules)
            ? assigned_modules.join(',')
            : assigned_modules;

            record.mood = mood;
            record.description = description;
            record.assigned_modules = assignedModulesString;

            await record.save();

            return res.status(200).json({status: true, message: "Mood Mapper updated successfully!"})


        } catch (error) {
            console.error(error);
            return res.status(500).json({status: false, message: error.message });
        }
    },

};


module.exports = moodMapperController; 
