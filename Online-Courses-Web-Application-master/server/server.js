//abdulsmapara
var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var multer = require('multer');
var login_module = require('./login');
var course_module = require('./course');
var upload_module = require('./upload');
var fs = require('fs');
var Cookie = require('cookie-parser');

//var filename = "";
var validator = require('express-validator');

app.use(validator());

app.use(bodyparser.urlencoded({
    extended: true
}));
//console.log(__dirname);
app.use('/',express.static('/home/abdulsmapara/paramv1/public'));

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    res.setHeader('Access-Control-Allow-Methods', 'POST', 'GET');

    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    
    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});


//app.use(bodyparser); 
//var jsonParser = bodyparser.json();
//
//var urlParser = bodyparser.urlencoded({
//    extended: true
//});

app.use(bodyparser.json());

app.use(Cookie());

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.redirect('/overview');
});


app.get('/index', function (req, res) {
    res.redirect('/overview');
});
app.get('/contact', function (req, res) {
    res.sendFile("/home/abdulsmapara/paramv1/public/contact.html");
});

app.post('/checkValidUsername',function(req,res){
// ??????????????????????????????????????????

});


app.post('/loginDB', login_module.login);
app.post('/registerDB', login_module.register);
app.get('/overview', login_module.overview);
app.get('/logoutStudent',login_module.logoutStudent);
app.get('/inst_overview', login_module.inst_overview);
app.get('/logoutInstructor',login_module.logoutInstructor);
app.post('/createNewCourse',course_module.addNewCourse);
app.post('/modifyCourse',course_module.modifyCourse);
app.get('/courseDetails',course_module.courseDetails);
app.post('/editCourse',course_module.editCourse);
app.get('/publishCourse',course_module.publishCourse);
app.post('/uploadFile',course_module.uploadArticle);
app.get('/viewFile', course_module.viewFile);
app.get('/deleteUploadedFile',course_module.removeFile);
app.get('/allCourses', course_module.allCourses);
app.get('/enrollCourse',course_module.enrollCourse);
app.get('/studentViewCourse',course_module.studentViewCourse);
app.get('/viewFileStudent',course_module.viewFileStudent);
app.get('/myCourses',course_module.myCoursesStudent);
app.post('/sendEmail',course_module.sendEmail);
app.post('/uploadAssignment',course_module.uploadAssignment);
app.get('/viewAssignment',course_module.viewAssignment);
app.post('/checkAssignment',course_module.checkAssignment);
/*
app.post('/LogIntoInstructorAccount', login_module.instructor_login);


app.get('/register', function (req, res) {
    res.sendFile("/home/amrik/Desktop/nptel/templates/register.html");
});

// app.post('/checkValidUsername', login_module.check_validity);

app.post('/fetchFiles', course_module.fetchFiles);

app.post('/removeArticle', course_module.removeArticle);

// app.post('/logintoAccount', login_module.verify_login);

app.post('/registerStudentAccount', login_module.register_student_account);

// app.post('/editInfo', login_module.editInfo);

app.get('/overview', login_module.overview);

app.get('/i_overview', login_module.i_overview);

app.post('/addnewcourse', course_module.addNewCourse);

app.post('/publish', course_module.publish);

app.post('/finalTouchToCourse', course_module.decision);

app.get('/modifyCourse', course_module.modifyCourse);

app.get('/viewFile', course_module.viewFile);

app.post('/updateCourse', course_module.updateCourse);

app.post('/editCourse', course_module.editCourse);

app.get('/viewInsCourses', course_module.viewInsCourses);

// app.get('/logout', login_module.logOut);
*/

app.listen(3000);