let areaJson = {  
    name: { type: String, required: true, trim: true , intl: true },
    level: Number,
    area_code:{ type: String, required: true, trim: true, index: true },
    parent_id: { type: String, trim: true },
    area_group: {type:String,default:""},
    sdmx_area_gid:String,
    status: Number,
    created_user: String
  }

module.exports = areaJson