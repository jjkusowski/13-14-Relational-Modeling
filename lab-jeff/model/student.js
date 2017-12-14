'use strict';

const mongoose = require('mongoose');
const School = require('./school');
const httpErrors = require('http-errors');


const studentSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  currentStudent: {
    type: Boolean,
  },
  school: {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : 'school',
  },
});
//-----------------------------------------------------
// SETTING UP RELATIONSHIP MANAGEMENT
//-----------------------------------------------------
studentSchema.pre('save', function(done){
  // I want to make sure that the school exists before saving a student
  return School.findById(this.school)
    .then(schoolFound => {
      if(!schoolFound)
        throw httpErrors(404,'school not found');

      schoolFound.students.push(this._id);
      return schoolFound.save();
    })
    .then(() => done())
    .catch(done);// vinicio - this will trigger an error
});

// vinicio - document is the student I JUST removed
studentSchema.post('remove', (document, done) => {
  return School.findById(document.school)
    .then(schoolFound => {
      if(!schoolFound)
        throw httpErrors(404, 'school not found');

      schoolFound.students = schoolFound.students.filter(student => {
        return student._id.toString() !== document._id.toString();
      });
      return schoolFound.save();
    })
    .then(() => done())
    .catch(done);
});
//-----------------------------------------------------

// vinicio - internally, this becomes 'students'
module.exports = mongoose.model('student', studentSchema);
