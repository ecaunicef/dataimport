const mongoose = require('mongoose');  
const Schema = mongoose.Schema;
// var diffHistory = require('../plugins/audit/diffHistory');

const userTokenSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'users'
    },
    token: {
        type: String,
        required: true,
    },
    status: {type: Number, default:1}
},{ timestamps: true });
// userTokenSchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

module.exports = mongoose.model("UserToken", userTokenSchema,'user_token');