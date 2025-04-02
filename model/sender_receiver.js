var mongoose = require('mongoose'); 
var diffHistory = require('../plugins/audit/diffHistory');

var Sender = new mongoose.Schema({
	sender_name:String,
	sender_id: { type: String, trim: true },
	name: {type: String,trim: true},
	contact_name: String,
	department:{ type: String,trim: true },
	role: { type: String,trim: true },
	email: String,
	telephone: String,
	fax:String,

});
var Receiver = new mongoose.Schema({
	receiver_name:String,
	receiver_id: { type: String, trim: true },
	name: {type: String,trim: true},
	contact_name: String,
	department:{ type: String,trim: true },
	role: { type: String,trim: true },
	email: String,
	telephone: String,
	fax:String,

});

var senderReceiverSchema = new mongoose.Schema({
	sender: { type: [Sender] },
	receiver: { type: [Receiver] }
},{ timestamps: true });
senderReceiverSchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

var SenderReceiver = mongoose.model('SenderReceiver', senderReceiverSchema,'sender_receiver');
module.exports = SenderReceiver;
