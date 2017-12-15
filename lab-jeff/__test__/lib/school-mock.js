'use strict';

const faker = require('faker');
const School = require('../../model/school');

const schoolMock = module.exports = {};

schoolMock.create = () => {
  return new School({
    name: faker.lorem.words(1),
    city: faker.lorem.words(1),
    state: faker.lorem.words(1),
  }).save();
};

schoolMock.createMany = (howMany) => {
  return Promise.all(new Array(howMany).fill(0)
    .map(() => schoolMock.create()));
};

schoolMock.remove = () => School.remove({});
