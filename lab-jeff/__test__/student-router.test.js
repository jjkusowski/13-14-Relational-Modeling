'use strict';

require('./lib/setup');

const faker = require('faker');
const superagent = require('superagent');
const server = require('../lib/server');

const studentMock = require('./lib/student-mock');
const schoolMock = require('./lib/school-mock');

const apiURL = `http://localhost:${process.env.PORT}/api/students`;

describe('/api/students', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(studentMock.remove);

  describe('POST /api/students', () => {
    test('should respond with a student and 200 status code if there is no error', () => {
      let tempSchoolMock = null;
      return schoolMock.create()
        .then(mock => {
          tempSchoolMock = mock;

          let studentToPost = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            currentStudent: faker.random.boolean(),
            school: mock._id,
          };
          return superagent.post(`${apiURL}`)
            .send(studentToPost)
            .then(response => {
              expect(response.status).toEqual(200);
              expect(response.body._id).toBeTruthy();
              expect(response.body.firstName).toEqual(studentToPost.firstName);
              expect(response.body.lastName).toEqual(studentToPost.lastName);
              expect(response.body.currentStudent).toBeDefined();
              expect(response.body.school).toEqual(tempSchoolMock._id.toString());
            });
        });
    });

    test('should respond with a 404 if the school id is not present', () => {
      return superagent.post(apiURL)
        .send({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          school : 'not an id',
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });

    test('should respond with a 400 code if we send an incomplete student', () => {
      let studentToPost = {
        lastName: faker.name.lastName(),
      };
      return superagent.post(`${apiURL}`)
        .send(studentToPost)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });
  });

  describe('DELETE /api/students/:id', () => {
    test('should respond with a 204 if there are no errors', ()=>{
      return studentMock.create()
        .then(mock => {
          return superagent.delete(`${apiURL}/${mock.student._id}`);
        })
        .then(response => {
          expect(response.status).toEqual(204);
        });
    });

    test('should respond with a 404 if the id is invalid', ()=>{
      return superagent.delete(`${apiURL}/Dewey`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });
  });

  describe('PUT /api/students/:id', () => {
    test('should update student and respond with 200 if there are no errors', () => {
      let studentToUpdate = null;

      return studentMock.create()
        .then(mock => {
          studentToUpdate = mock.student;
          return superagent.put(`${apiURL}/${mock.student._id}`)
            .send({firstName: 'Sarah'});
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.firstName).toEqual('Sarah');
          expect(response.body.lastName).toEqual(studentToUpdate.lastName);
          expect(response.body._id).toEqual(studentToUpdate._id.toString());
        });
    });
  });

  describe('GET /api/students', () => {
    test('should return 10 students (where 10 is the size of the page by default)', () => {
      return studentMock.createMany(100)
        .then( () => {
          return superagent.get(`${apiURL}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.count).toEqual(100);
          expect(response.body.data.length).toEqual(10);
        });
    });
  });

  describe('GET /api/students/:id', () => {
    test('should respond with 200 status code if there is no error', () => {
      let tempMock = null;

      return studentMock.create()
        .then(mock => {
          tempMock = mock;
          return superagent.get(`${apiURL}/${mock.student._id}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);

          expect(response.body._id).toEqual(tempMock.student._id.toString());

          expect(response.body.firstName).toEqual(tempMock.student.firstName);
          expect(response.body.lastName).toEqual(tempMock.student.lastName);
          //-------------------------------------------------------------
          expect(response.body.school._id).toEqual(tempMock.school._id.toString());
          expect(response.body.school.title).toEqual(tempMock.school.title);
          expect(response.body.school.timestamp).toBeTruthy();
        });
    });

    test('should respond with 404 status code if there id is incorrect', () => {
      return superagent.get(`${apiURL}/Dewey`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });
  });
});
