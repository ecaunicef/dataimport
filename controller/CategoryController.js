const Category = require('../model/category');

let categoryController = {
    addCategory: async (req, res) => {

        try {
            const { name, type } = req.body;
            
            if (!name && !type) {
                return res.send(400).json({ status: false, message: "Name/Type is required field" });
            }

            let create = await Category.create({
                name: name,
                type: type,
                flag: 0
            });

            await create.save();

            return res.status(200).json({ status: true, message: "Category created successfully!" })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: "An error occurred while creating a category.", error: error })
        }

    },

    updateCategory: async function (req, res) {
        try {
            const { id, name,type } = req.body;

            const record = await Category.findOne({ where: { id: id } });

            if (!record) {
                return res.status(400).json({ status: false, message: "Record not found" })
            };

            record.name = name;
            record.type = type;
            record.save();

            return res.status(200).json({ status: true, message: "Category updated successfully!" })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: "An error occurred while updating a category." })
        }

    },

    deleteCategory: async function (req, res) {
        try {
            const id = req.body.id;

            const record = await Category.findOne({ where: { id: id } });

            if (!record) {
                return res.status(400).json({ status: false, message: "Record not found" })
            };

            await record.destroy();

            return res.status(200).json({ status: true, message: "Category deleted successfully!" })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: "An error occurred while deleting a category." })

        }
    }

};

module.exports = categoryController; 
