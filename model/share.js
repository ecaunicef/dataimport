var mongoose = require('mongoose');  
var diffHistory = require('../plugins/audit/diffHistory');

var shareSchema = new mongoose.Schema({  
  image: { type: String, required: true, trim: true },
  status: Number
},{ timestamps: true });
shareSchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

var Share = mongoose.model('Share', shareSchema,'share');
module.exports = Share;
