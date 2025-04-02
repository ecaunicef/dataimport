var mongoose = require('mongoose');
// var diffHistory = require('../plugins/audit/diffHistory');

var importLogSchema = new mongoose.Schema({  
  filename: { type: String, required: true, trim: true },
  error_filename: { type: String},
  type:{ type: String},
  imported_records: Number,
  updated_records: Number,
  error:  Number,
  archive_count:Number,
  transaction_count:Number,
  total_records: Number,
  created_at:  String,
  user_id: String
});
// importLogSchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

var ImportLog = mongoose.model('ImportLog', importLogSchema,'import_log');
module.exports = ImportLog;