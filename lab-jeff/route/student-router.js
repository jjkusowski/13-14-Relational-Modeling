'use strict';

const {Router} = require('express');
const jsonParser = require('body-parser').json();

const Student = require('../model/student');
const logger = require('../lib/logger');
const httpErrors = require('http-errors');

const studentRouter = module.exports = new Router();

studentRouter.post('/api/students',jsonParser, (request, response, next) => {
  logger.log('info', 'POST - processing a request');
  if(!request.body.firstName || !request.body.lastName) {
    return next(httpErrors(400, 'body and content are required'));
  }

  return new Student(request.body).save()
    .then(student => {
      logger.log('info', 'POST - Returning a 200 status code');
      response.json(student);
    })
    .catch(error => next(error));
});

studentRouter.get('/api/students', (request, response, next) => {
  logger.log('info', 'GET - processing a request');
  const PAGE_SIZE = 10;

  let {page = '0'} = request.query;
  page = Number(page);

  if(isNaN(page))
    page = 0;

  page = page < 0 ? 0 : page;

  let allStudents = null;

  return Student.find({})
    .skip(page * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .then(students => {
      allStudents = students;
      return Student.find({}).count();
    })
    .then(studentCount => {
      let responseData = {
        count : studentCount,
        data : allStudents,
      };
      let lastPage = Math.floor(studentCount / PAGE_SIZE);

      response.links({
        next : `http://localhost:${process.env.PORT}/api/students?page=${page === lastPage ? lastPage : page + 1}`,
        prev : `http://localhost:${process.env.PORT}/api/students?page=${page < 1 ? 0 : page - 1}`,
        last : `http://localhost:${process.env.PORT}/api/students?page=${lastPage}`,
      });
      logger.log('info', 'GET - Returning a 200 status code');
      response.json(responseData);
    });
});

studentRouter.get('/api/students/:id', (request, response, next) => {
  logger.log('info', 'GET by id - processing a request');
  return Student.findById(request.params.id)
    .populate('school')
    .then(student => {
      if(!student){
        throw httpErrors(404,'student not found');
      }
      logger.log('info', 'GET by id - Returning a 200 status code');
      return response.json(student);
    }).catch(next);
});

studentRouter.delete('/api/students/:id', (request, response, next) => {
  logger.log('info', 'DELETE - processing a request');
  return Student.findByIdAndRemove(request.params.id)
    .then(student => {
      if(!student){
        throw httpErrors(404,'student not found');
      }
      logger.log('info', 'DELETE - Returning a 204 status code');
      return response.sendStatus(204);
    }).catch(next);
});

studentRouter.put('/api/students/:id',jsonParser, (request, response, next) => {
  logger.log('info', 'PUT - processing a request');
  let options = {runValidators: true, new : true};

  return Student.findByIdAndUpdate(request.params.id, request.body, options)
    .then(student => {
      if(!student){
        throw httpErrors(404,'student not found');
      }
      logger.log('info', 'PUT - Returning a 200 status code');
      return response.json(student);
    }).catch(next);
});
