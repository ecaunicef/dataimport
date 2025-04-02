var mongoose = require('mongoose');
// var diffHistory = require('../plugins/audit/diffHistory');

const RoleSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        trim:true,
        index: { collation: { locale: 'en', strength: 2 } },
        intl: true 
      },
      created_user: String,
      // description: {
      //   type: String,
      //   trim:true,
      //   intl: true 
      // },
      permissions: [
      {
        module:{type:String},
        subModule:{type:String},
        actions:{type:Array},
      },
      ],
      // primary_data_folder_name:Array,
      status:{type:Number, default:1}
    }, { timestamps: true });

RoleSchema.pre('deleteOne', function() {
  // console.log('Before deleteOne');
  });
// RoleSchema.plugin(diffHistory.plugin, { omit: ['updatedAt'] });

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;
