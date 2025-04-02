const UploadedFileInfo = require('../model/uploaded_file_info'); 

const uploadedFileInfoController = {
    delete: async (req, res) => {
        try {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({
                    message: "ID is required",
                    success: false,
                });
            }
    
            const record = await UploadedFileInfo.findOne({ where: { id } });
    
            if (!record) {
                return res.status(404).json({
                    message: "Record not found",
                    success: false,
                });
            }
    
            await UploadedFileInfo.destroy({ where: { id } });
    
            return res.status(200).json({
                message: "Log deleted successfully",
                success: true,
            });
        } catch (error) {
            console.error("Error deleting record: ", error);
            return res.status(500).json({
                message: "Something went wrong",
                error: error.message,
                success: false,
            });
        }
    }    
};

module.exports = uploadedFileInfoController;
