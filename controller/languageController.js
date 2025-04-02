const Area = require('../model/area');
const Classification = require('../model/classification');
const sequelize = require('../model/db');

let languageController = {

    updateLanguage: async (req, res) => {
        try {
            const { id, name, table, languageFields } = req.body;
    
            if (!id || !table || !languageFields) {
                return res.status(400).send({status: false, message: 'ID, table, and language fields are required.' });
            }
    
            const allowedTables = ['area', 'classification'];
            if (!allowedTables.includes(table)) {
                return res.status(400).send({ message: 'Invalid table name.' });
            }
    
            const columnName = table === 'classification' ? "classification_name" : "name";

            // const checkQuery = `SELECT * FROM ${table} WHERE id = :id`;
            const checkQuery = `SELECT * FROM ${table} WHERE ${columnName} = :name`;

            const [existingData] = await sequelize.query(checkQuery, {
                replacements: { name },
                type: sequelize.QueryTypes.SELECT,
            });
    
            if (!existingData) {
                return res.status(404).send({ message: 'Record not found.' });
            }
    
            const fields = Object.keys(languageFields)
                .map((field) => `${field} = :${field}`)
                .join(', ');
    
            const updateQuery = `UPDATE ${table} SET ${fields} WHERE ${columnName} = :name`;
    
            const replacements = { ...languageFields, name };
    
            const [result] = await sequelize.query(updateQuery, {
                replacements,
                type: sequelize.QueryTypes.UPDATE,
            });
    
            if (result === 0) {
                return res.status(404).send({status: false, message: 'No changes made to the record.' });
            }
    
            res.send({status: true, message: 'Record updated successfully.' });
        } catch (error) {
            console.error(error);
            res.status(500).send({status: false, message: 'An unexpected error occurred.', error: error.message });
        }
    }    
};

module.exports = languageController; 
