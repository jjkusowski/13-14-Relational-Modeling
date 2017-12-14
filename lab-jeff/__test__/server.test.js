'use strict';

const faker = require('faker');
const superagent = require('superagent');
const School = require('../model/school');
const server = require('../lib/server');

const apiURL = `http://localhost:${process.env.PORT}/api/schools`;

const schoolMockCreate = () => {
  return new School({
    name: faker.lorem.words(1),
    city: faker.lorem.words(1),
    state: faker.lorem.words(1),
  }).save();
};


describe('/api/schools', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  beforeEach(() => School.remove({}));


  describe('POST /api/schools', () => {
    test('should respond with a school and 200 status code if there is no error', () => {
      let schoolToPost = {
        name: faker.lorem.words(1),
        city: faker.lorem.words(1),
        state: faker.lorem.words(1),
      };
      return superagent.post(`${apiURL}`)
        .send(schoolToPost)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body._id).toBeTruthy();
          expect(response.body.timestamp).toBeTruthy();

          expect(response.body.name).toEqual(schoolToPost.name);
          expect(response.body.city).toEqual(schoolToPost.city);
          expect(response.body.state).toEqual(schoolToPost.state);
        });
    });
    test('should respond with a 400 code if we send an incomplete school', () => {
      let schoolToPost = {
        name: faker.lorem.words(1),
      };
      return superagent.post(`${apiURL}`)
        .send(schoolToPost)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });

    test('should respond with 409 status code if name is a duplicate', () => {
      let schoolToPost = {
        name: faker.lorem.words(1),
        city: faker.lorem.words(1),
        state: faker.lorem.words(1),
      };
      return superagent.post(`${apiURL}`)
        .send(schoolToPost)
        .then( () => {
          return superagent.post(`${apiURL}`)
            .send(schoolToPost);
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(409);
        });
    });

  });

  describe('GET /api/schools/:id', () => {
    test('should respond with 200 status code if there is no error', () => {
      let schoolToTest = null;

      return schoolMockCreate()
        .then(school => {
          schoolToTest = school;
          return superagent.get(`${apiURL}/${school._id}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);

          expect(response.body._id).toEqual(schoolToTest._id.toString());
          expect(response.body.timestamp).toBeTruthy();

          expect(response.body.name).toEqual(schoolToTest.name);
          expect(response.body.city).toEqual(schoolToTest.city);
          expect(response.body.state).toEqual(schoolToTest.state);
        });
    });
    test('should respond with 404 status code if the id is incorrect', () => {
      return superagent.get(`${apiURL}/Dewey`)
        // .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });

  });
  describe('GET /api/schools', () => {
    test('Should return array of objects of all schools and status 200', () => {

      return schoolMockCreate()
        .then( () => {
          return superagent.get(`${apiURL}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.length).toEqual(1);
        });
    });
  });
  describe('DELETE /api/schools/:id', () => {
    test('should respond with 204 status code if there is no error', () => {

      return schoolMockCreate()
        .then(school => {
          return superagent.delete(`${apiURL}/${school._id}`);
        })
        .then(response => {
          expect(response.status).toEqual(204);
        });
    });
    test('should respond with 400 if no id is sent', () => {
      return superagent.delete(`${apiURL}`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });
    test('should respond with 404 if invalid id is sent', () => {
      return superagent.delete(`${apiURL}/dewey`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });

  });

  describe('PUT /api/schools', () => {
    test('should update school and respond with 200 if there are no errors', () => {
      let schoolToUpdate = null;

      return schoolMockCreate()
        .then(school => {
          schoolToUpdate = school;
          return superagent.put(`${apiURL}/${school._id}`)
            .send({name: 'Michigan Tech University'});
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.name).toEqual('Michigan Tech University');
          expect(response.body.city).toEqual(schoolToUpdate.city);
          expect(response.body._id).toEqual(schoolToUpdate._id.toString());
        });
    });

    test('should respond with 404 if invalid id is sent', () => {
      return superagent.put(`${apiURL}/dewey`)
        .send({name: 'Michigan Tech University'})
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });

    test('should respond with 400 if no id is sent', () => {
      return superagent.put(`${apiURL}`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });


  });


});
