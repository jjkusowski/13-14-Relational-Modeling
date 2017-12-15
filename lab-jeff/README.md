# Code Fellows 401 Lab 14
The purpose of this lab is to build a basic HTTP server using the Express library that takes GET, POST, and DELETE requests that read, add, and delete an object from an array.  Two objects are available for these requests: schools and students.  They are related to each other with a one(schools) to many(students) relationship.

Schools have 6 properties: name, city, state, the date entered, an id (which is assigned by the API), and an array of all the students associated with the school.  Name is unique and cannot match another entry.  Name and city are required.  

Students have 5 properties: firstName, lastName, currentStudent(true/false), and the id of the school they are associated with.  Only school is required.

The data is stored on a MongoDB database.  Mongoose is used to interface between the server and Mongo.

## Code Style
Standard Javascript with ES6.

## Features
Users can get a list of all schools/students by sending a GET request with no body.  To get a particular school/student, send a GET request with a body of ```{id: '<id of school/student you want>'}```
To put a new school/student in the array, send a POST request with the body ```{key: '<value>', key: '<value>', key: '<value>'}``` where the keys are the necessary keys associated with the school or student.
To delete a school from the array, send a DELETE request with the body ```{id: '<id of school/student to delete>'}```.

## Running the Server
To run the server, download the repo.  Install dependencies via ```npm install```.  Create a folder called '.env' in the root directory of this project and enter ```PORT=<yourport>``` on the first line.  3000 is a typical choice.  Also in the .env, set MONGODB_URI=mongodb:<database location>.  '://localhost/testing' is typical.  
.env example:

    PORT=3000
    MONGODB_URI=mongodb://localhost/testing


Then, in a terminal window at the location of this project, ```npm run dbon```.
Then, in a second terminal window at the location of this project ```npm run start```.

## Endpoints

### GET ('/api/schools') ('/api/students')
Sent without a query.  
* Returns status 200 and an array of all the objects on the schools or students collection.

### GET ('api/schools:id') ('/api/students:id')
Sent with the query of an object with the key "id".  
* If the id is found on the database, returns status 200 and the object that matches that id.  
* If the id is not found on the database, returns status 404 and an error message.

### POST ('api/schools') ('api/students:id')
Sent with the query of an object with the required keys for that endpoint.
* schools
- name and city are required.  State is optional.  name must be unique.
* students
- firstName, lastName and school are required.  currentStudent is optional.

* If all keys are there, returns status 200 and the body of the object it just created with your data.  Will also include a unique id created by uuid.
* If any key is missing or misspelled or no body is sent, returns status 400 and an error message.
* If an object is sent that contains a name that matches an existing name, returns status 404 and an error message.

### DELETE ('api/schools/:id') ('api/students/:id')
Sent with the query of an object with the key "id".
* If sent correctly, returns with status 204.
* If id is not found, returns 404 and an error message.
* If no body is sent, returns with status 400 and an error message.

### PUT ('api/schools/:id') ('api/students/:id')
Sent with the query of an object with the key "id" and a body with an object of the keys and values you want to update.
* If id is found, returns status 200.
* If id is not found, returns 404 and an error message.
* If no body is sent, returns with status 400 and an error message.
* For schools, if a name is attempted to be updated to match an existing entry, returns status 409 and an error message.

## Libraries
body-parser, dotenv, express, http-errors, mongoose, winston, uuid

## Development Libraries
eslint, faker, jest, superagent
