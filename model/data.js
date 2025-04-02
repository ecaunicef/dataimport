var mongoose = require('mongoose'),
      mongooseIntl = require('mongoose-intl');  
	//   var diffHistory = require('../plugins/audit/diffHistory');


var dataSchema = new mongoose.Schema({
	area_code: { type: String, required: true, trim: true, index: true },
	iu_id: { type: String, required: true, trim: true, index: true },
	ius_id: { type: String, required: true, trim: true, index: true },

	survey_id: { type: mongoose.Schema.ObjectId, ref: 'survey', default: null },
	plan_id: { type: mongoose.Schema.ObjectId, ref: 'plan', default: null},

	time_period: { start_time_period: { type: String, required: true, trim: true, index: { collation: { locale: 'en', strength: 2 } } }, end_time_period: String, sdmx_start_time_period_gid: String, uuid: String },
	source: {
		publisher: { type: String, required: true, trim: true, index: { collation: { locale: 'en', strength: 2 } } , intl: true},
		// publisher_mm: { type: String, trim: true, index: { collation: { locale: 'en', strength: 2 } } }, title: String, year_of_publication: String, sdmx_source_gid: String, uuid: String
	},
	value: { type: String },
	//numerator: Number,
	//denomenator: Number,
	footnote: { type: String, trim: true, intl: true },
	//indicator: { type: String, trim: true, index: { collation: { locale: 'en', strength: 2 } } , intl: true},
	// indicator_mm: { type: String, trim: true, index: { collation: { locale: 'en', strength: 2 } } },
	//unit: { type: String, trim: true, index: { collation: { locale: 'en', strength: 2 } } , intl: true},
	// unit_mm: { type: String, trim: true, index: { collation: { locale: 'en', strength: 2 } } },
	status: Number,
	//expenditure: { type: Number, default: null },
	new_value: { type: String, default: null }, // old code new_value type is number
	remark: { type: String, trim: true },
	nStatus: Number,
	userId: String,
	newUserId: String,
	data_set_id:{ type: String, required: true, trim: true, index: true },
	//framework_code: Number
	created_user: String
}, { timestamps: true });

// dataSchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

var Data = mongoose.model('Data', dataSchema, 'data');
module.exports = Data;