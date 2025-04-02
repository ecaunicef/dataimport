var mongoose = require('mongoose');
// var diffHistory = require('../plugins/audit/diffHistory');


var olduserpass = new mongoose.Schema({
  user_id: { type:  mongoose.Schema.ObjectId, trim: true },
  old_password: { type: String, required: true },

}, { timestamps: true });
// olduserpass.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

Oldpassword = mongoose.model('Oldpassword', olduserpass, 'old_password');

module.exports = Oldpassword;
