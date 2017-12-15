'use strict';

const {Router} = require('express');
const jsonParser = require('body-parser').json();

const Student = require('../model/student');
const logger = require('../lib/logger');
const httpErrors = require('http-errors');

const studentRouter = module.exports = new Router();

studentRouter.post('/api/students',jsonParser, (request,response,next) => {
  if(!request.body.firstName || !request.body.lastName) {
    return next(httpErrors(400,'body and content are required'));
  }

  return new Student(request.body).save()
    .then(student => response.json(student))//vinicio-this sends a 200
    .catch(error => next(error));
});

studentRouter.get('/api/students', (request,response,next) => {
  const PAGE_SIZE = 10;

  let {page = '0'} = request.query;
  page = Number(page);

  if(isNaN(page))
    page = 0;

  page = page < 0 ? 0 : page;
  // TODO : more validation

  let allStudents = null;

  return Student.find({})
    .skip(page * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .then(students => {
      allStudents = students;
      return Student.find({}).count();
    })
    .then(studentCount => {
      // Vinicio - inside this then I have no access to 'students'
      let responseData = {
        count : studentCount,
        data : allStudents,
      };
      // Next Page / Previous Page / Last Page
      let lastPage = Math.floor(studentCount / PAGE_SIZE);

      response.links({
        next : `http://localhost:${process.env.PORT}/api/students?page=${page === lastPage ? lastPage : page + 1}`,
        prev : `http://localhost:${process.env.PORT}/api/students?page=${page < 1 ? 0 : page - 1}`,
        last : `http://localhost:${process.env.PORT}/api/students?page=${lastPage}`,
      });
      response.json(responseData);
    });
});

studentRouter.get('/api/students/:id', (request, response, next) => {
  return Student.findById(request.params.id)
    .populate('school')// vinicio - use this with care
    .then(student => {      // wit great power comes great responsibility
      if(!student){
        throw httpErrors(404,'student not found');
      }
      logger.log('info', 'GET - Returning a 200 status code');
      return response.json(student);
    }).catch(next);
});

studentRouter.delete('/api/students/:id',(request,response,next) => {
  return Student.findByIdAndRemove(request.params.id)
    .then(student => {
      if(!student){
        throw httpErrors(404,'student not found');
      }
      logger.log('info', 'GET - Returning a 204 status code');
      return response.sendStatus(204);
    }).catch(next);
});

studentRouter.put('/api/students/:id',jsonParser,(request,response,next) => {
  // vinicio - this configures mongo update behavior
  let options = {runValidators: true, new : true};

  // vinicio -  additional validation before updating ?
  return Student.findByIdAndUpdate(request.params.id,request.body,options)
    .then(student => {
      if(!student){
        throw httpErrors(404,'student not found');
      }
      logger.log('info', 'GET - Returning a 200 status code');
      return response.json(student);
    }).catch(next);
});
