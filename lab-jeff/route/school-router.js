'use strict';

const {Router} = require('express');
const jsonParser = require('body-parser').json();

const School = require('../model/school');
const logger = require('../lib/logger');
const httpErrors = require('http-errors');

const schoolRouter = module.exports = new Router();

schoolRouter.post('/api/schools', jsonParser, (request, response, next) => {
  logger.log('info', 'POST - processing a request');

  if(!request.body.name || !request.body.city) {
    return next(httpErrors(400, 'name and city are required'));
  }

  return new School(request.body).save()
    .then(school => response.json(school))
    .catch(next);
});

schoolRouter.get('/api/schools/:id', (request, response, next) => {
  logger.log('info', 'GET by id - processing a request');

  return School.findById(request.params.id)
    .then(school => {
      if(!school){
        throw httpErrors(404, 'school not found');
      }
      logger.log('info', 'GET by id - Returning a 200 status code');
      return response.json(school);
    }).catch(next);
});
schoolRouter.get('/api/schools', (request, response, next) => {
  logger.log('info', 'GET - processing a request');
  return School.find({})
    .then(schools =>{
      return response.json(schools);
    });
});
schoolRouter.delete('/api/schools/:id', (request, response, next) => {
  logger.log('info', 'DELETE - processing a request');

  return School.findByIdAndRemove(request.params.id)
    .then(school => {
      if(!school){
        throw httpErrors(404, 'school not found');
      }
      logger.log('info', 'DELETE - Returning a 204 status code');
      return response.sendStatus(204);
    }).catch(next);
});

schoolRouter.delete('/api/schools', (request, response, next) => {
  logger.log('info', 'DELETE - request without an id.  Returning 400');
  return response.sendStatus(400);
});

schoolRouter.put('/api/schools/:id', jsonParser, (request, response, next) => {
  logger.log('info', 'PUT - processing a request');
  let options = {runValidators: true, new : true};

  return School.findByIdAndUpdate(request.params.id, request.body, options)
    .then(school => {
      if(!school){
        throw httpErrors(404, 'school not found');
      }
      logger.log('info', 'GET - Returning a 200 status code');
      return response.json(school);
    }).catch(next);
});

schoolRouter.put('/api/schools', (request, response, next) => {
  logger.log('info', 'PUT - request without an id.  Returning 400');
  return response.sendStatus(400);
});
