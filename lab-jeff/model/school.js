'use strict';

const mongoose = require('mongoose');

const schoolSchema = mongoose.Schema({
  name : {
    type : String,
    required : true,
    unique: true,
  },
  city : {
    type : String,
    required : true,
  },
  timestamp : {
    type : Date,
    default : () => new Date(),
  },
  state : {
    type: String,
  },
});

module.exports = mongoose.model('school', schoolSchema);
