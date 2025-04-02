const Blog = require('../model/blog');
const Classification = require('../model/classification');
const Helpline = require('../model/helpline');

const createClassification = async (req, res) => {
    try {

        const { classificationName, classificationType } = req.body;
        let data = await Classification.findOne({
            where:{
                classification_name: classificationName,
                classification_type: classificationType
            }
        })
        if (data){
            res.json({
                success:false,
                message: "Classification already exists"
            })
        }else{
            const payload = {
                classification_name: classificationName,
                classification_name_nl: "#" + classificationName,
                classification_name_fr: "#" + classificationName,
                classification_name_es: "#" + classificationName,
                classification_type: classificationType,
                flag: 0,
            }

            const classification = await Classification.create(payload);
            res.status(201).json({ data: classification, message: 'Created successfully', success: true });
        }

     
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, success: false });
    }
};

const updateClassification = async (req, res) => {
    try {
        const { classificationName, classificationType, id } = req.body;
        console.log(req.body)
        const classification = await Classification.update(
            {
                classification_name: decodeURIComponent(classificationName),
                classification_name_nl: "#" + decodeURIComponent(classificationName),
                classification_name_fr: "#" + decodeURIComponent(classificationName),
                classification_name_es: "#" + decodeURIComponent(classificationName),
                classification_type:classificationType
            },
            {
                where: { id: id }
            }
        );

        if (classification) {
            const updatedClassification = await Classification.findByPk(id);
            return res.send({
                success: true,
                message: "Classification updated successfully",
            });
        }
        return res.send({
            success: false,
            data: classification,
            message: "Classification not found",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message, success: false });
    }
};


const getAssociatedCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const isCategoryAssociatedWithHelpline = await Helpline.findOne({ where: { classification_id: id } });
        const isCategoryAssociatedWithBlog = await Blog.findOne({ where: { message_category :id}});

        if (isCategoryAssociatedWithHelpline || isCategoryAssociatedWithBlog) {
            return res.send({ status: false, message: "Classification cannot be deleted as it is associated" });
        }
        else{
            return res.send({ status: true, message: "Not Associated" });

        }

    } catch (error) {
        return res.status(500).json({ status: false, message: "An error occurred while fetching associated category." })

    }

}

const deleteClassification= async (req, res) =>{
    try {
        const id = req.body.id;

        const record = await Classification.findOne({ where: { id: id } });

        if (!record) {
            return res.status(400).json({ status: false, message: "Record not found" })
        };

        await record.destroy();

        return res.status(200).json({ status: true, message: "Classification deleted successfully!" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "An error occurred while deleting a category." })

    }
}



module.exports = {
    createClassification,
    updateClassification,
    deleteClassification,
    getAssociatedCategory
};