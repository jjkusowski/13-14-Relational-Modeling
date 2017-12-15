'use strict';

const faker = require('faker');
const schoolMock = require('./school-mock');
const Student = require('../../model/student');

const studentMock = module.exports = {};

studentMock.create = () => {
  let mock = {};

  return schoolMock.create()
    .then(school => {
      mock.school = school;

      return new Student({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        currentStudent: faker.random.boolean(),
        school: school._id,
      }).save();
    })
    .then(student => {
      mock.student = student;
      return mock;
    });
};

studentMock.createMany = (howMany) => {
  let mock = {};

  return schoolMock.create()
    .then(school => {
      mock.school = school;
      return Promise.all(new Array(howMany)
        .fill(0)
        .map(() => {
          return new Student({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            currentStudent: faker.random.boolean(),
            school: school._id,
          }).save();
        }));
    })
    .then(students => {
      mock.students = students;
      return mock;
    });
};

studentMock.remove = () => Promise.all([
  Student.remove({}),
  schoolMock.remove(),
]);
