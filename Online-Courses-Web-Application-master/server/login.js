//abdulsmapara
// var conn = require('./connection');
// var upload_module = require('./upload');
var bodyparser = require('body-parser');
var multer = require('multer');
// var email = require('./email');
var Cookie = require('cookie-parser');
var logout = require('express-passport-logout');
var http=require('http');
var path = require('path');
var fs = require('fs');


var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';

exports.login = function (req,res) {
	var user = req.body.myUsername;
    var pass = req.body.myPassword;
    var type = req.body.myType;

  req.checkBody('myUsername', 'Username is required').notEmpty();
  req.checkBody('myPassword', 'Password is required').notEmpty();
  
  var errors = req.validationErrors();
  var error_exists = 0;
  console.log("ERRORS !!! " + errors);  
  if(errors){
  	error_exists = 1;
  }
    MongoClient.connect(url, function(err, db) {
        if (err || errors) {
        	console.log("ERRORS --------------------------------------------" + err);
        	error_exists = 1;
        	if(!errors){
        		errors = err;
        	}
        } else {
            var dbs = db.db('nptelv1');
            if(type == "Student")
            {
	            var cursor = dbs.collection('Student_login').find({'username': user, 'password': pass}).toArray(function (err, result) {
	                if (err) {
	                	error_exists=1;
	                } 
	                else 
	                {
	                    console.log(result);
	                    if (result.length == 1) {
	                        res.cookie('activeStudent', user);
                          res.cookie('message', 'none');
                          
                          res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
         res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	                        res.redirect("http://localhost:3000/overview");
	                        // Student profile
	                    } else {
	                        res.render("index", {
	                        	whoami:"none",
	                            message: "Invalid Username/Password !"
	                        });
	                    }
	                }

	            });
		    } 
		    else
		    {
		    	var cursor = dbs.collection('Instructor_login').find({'username': user, 'password': pass}).toArray(function (err, result) {
	                if (err) {
	                	error_exists=1;
	                } 
	                else 
	                {
	                    console.log(result);
	                    
	                    if (result.length == 1) {
	                        res.cookie('activeInstructor', user);
	                        var cursor3v=dbs.collection('Instructor_login').find({'username':user,'password':pass}).toArray(function(err,result_1){
	                        	if(err){
	                        		error_exists=1;
	                        	}else{
                              res.cookie('ins_name', result_1[0].name);
                              res.cookie('course_name',"none");
	                        		res.cookie('activeInstructorName',result_1[0].name);
	                        		res.cookie('activeInstructorEmail',result_1[0].email);
	                        		res.cookie('activeInstructorPassword',result_1[0].password);
	                        		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
         res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	                        		res.redirect("http://localhost:3000/inst_overview");		
	                        	}
	                        });
	                        // Student profile
	                    } else {
	                        res.render("index", {
	                        	whoami:"none",
	                            message: "Invalid Username/Password !"
	                        });
	                    }
	                }

	            });
		    }   
        }
        
    });
    if(error_exists == 1){
    	console.log("ERROR HERE ! " + errors);
   		res.render("index", {
             message: "Please login again !"
         });
    }

}

exports.register = function (req, res) {
    var user = req.body.myUsername;
    var pass = req.body.myPassword;
    var email = req.body.myEmail;
    var uname = req.body.myName;
    var type = req.body.myType;

    //validate input
    req.checkBody('myUsername', 'Username is required').notEmpty();
  req.checkBody('myPassword', 'Password is required').notEmpty();
  req.checkBody('myName', 'Name is required').notEmpty();
  req.checkBody('myEmail', 'Email is required').notEmpty();
  req.checkBody('myEmail', 'Email does not appear to be valid').isEmail();
  var error_exists = 0;
  // check the validation object for errors
  var errors = req.validationErrors();

  console.log(errors);  
  if(errors){
  	error_exists = 1;
  }


    // console.log(req.body);
    MongoClient.connect(url, function(err, db) {
        if (err) {
        	error_exists = 1;
        } else {
            var dbs = db.db('nptelv1');
            if (type == "Student"){
            	var cursor2 = dbs.collection('Student_login').find({'username': user}).toArray(function (err, result) {
            		if(err){
            			error_exists = 1;
            		}else{
            			if(result.length == 1){
            				error_exists=1;
            				res.render("index",{
            					whoami:"none",
            					message:"Username already exists. Please change your username."
            				});
            			}

                  if(user == "none"){
                error_exists = 1;
                res.render("index",{
                      whoami:"none",
                      message:"Please specify a different username."
                    });
              }
              if(error_exists==0){
                      var cursor = dbs.collection('Student_login').insert({username: user, password: pass, email: email, name : uname}, function (err) {
                          if (err) {
                            error_exists = 1;
                          } 
                          else 
                          {
                            res.render("index", {
                            whoami: "none",
                            message: "Registration Successful"
                        });
                          }

                      });
                    }

            		}
            	});
            	
	        }
          else{
	        	var cursor2 = dbs.collection('Instructor_login').find({'username': user}).toArray(function (err, result) {
            		if(err){
            			error_exists = 1;
            		}else{
            			if(result.length == 1){
            				error_exists=1;
            				res.render("index",{
            					whoami:"none",
            					message:"Username already exists. Please change your username."
            				});
            			 
                  }else{
                    if(user == "none"){
                error_exists = 1;
                res.render("index",{
                      whoami:"none",
                      message:"Please specify a different username."
                    });
              }
            if(error_exists == 0){
            var cursor = dbs.collection('Instructor_login').insert({username: user, password: pass, email: email, name : uname}, function (err) {
                  if (err) {
                    error_exists = 1;
                  } 
                  else 
                  {
                    res.render("index", {
                    whoami: "none",
                    message: "Registration Successful!"
                });
                  }

              });
            }
                  }
            		}
            	});
            	
	        }
        }
        
    }); 
};
exports.overview = function (req, res) {
    var user = req.cookies['activeStudent'];
    var ins = req.cookies['activeInstructor'];
    if (user != "none" && user != undefined) {
        res.render("index", {
            whoami: user,
            message: "none"
        });
        console.log(user);
    }else if(ins != "none" && ins != undefined){
      console.log("here 1");
    	res.redirect("/inst_overview");
    } 
    else {
      console.log("here 2");
         res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
         res.render("index",{
         	whoami:"none",
         	message:"none"
         });
    }
};
exports.inst_overview = function (req, res) {
    var user = req.cookies['activeInstructor'];
    var name = req.cookies['activeInstructorName'];
    var email= req.cookies['activeInstructorEmail'];
    var stud = req.cookies['activeStudent'];
    if (user != "none" && user != undefined) {

      console.log("here 3");
      var result1;
        console.log(user);

        MongoClient.connect(url, function(err, db) {
          if(!err){
              var cursor2 = db.db('nptelv1').collection('courses').find({'instructor': user}).toArray(function (err, result) {
                
                result1 = result;
                if(result1.length == 0)
                {
                  result1 = ["none"];
                }
              res.render("inst_index", {
                  whoami: user,
                  ins_name: name,
                  ins_email:email,
                  message: "none",
                  all_courses_info: result1
              });
            });
          }else{
            console.log("ERROR " + err);
            res.redirect('/overview');
          }
        });

        


    }else if(stud != "none" && stud != undefined){

      console.log("here 4");
    	res.redirect("/overview");
    }
    else {

      console.log("here 5");
         res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
         res.render("index",{
         	whoami:"none",
         	message:"none"
         });
         	
    }
};
exports.logoutStudent = function(req,res) {
	var user = req.cookies['activeStudent'];
	if(user != "none" && user != undefined){

	     res.cookie('activeStudent', 'none');
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
         res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

	     logout();

	     res.render("index", {
	     	 whoami:"none",
	         message: "You have been logged out !"
	     });
	 }else{
	 	res.redirect('/overview');
	 }
};
exports.logoutInstructor = function(req,res) {
	var user = req.cookies['activeInstructor'];
	if(user != "none" && user != undefined){

	     res.cookie('activeInstructor', 'none');
       res.cookie('ins_name', 'none');
       res.cookie('course_name', 'none');
	     res.cookie('activeInstructorName', 'none');
	     res.cookie('activeInstructorEmail', 'none');
	     res.cookie('activeInstructorPassword', 'none');
	     
	     logout();
	     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	       res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

	     res.render("index", {
	     	 whoami:"none",
	         message: "You have been logged out !"
	     });
	 }else{
	 	res.redirect('/overview');
	 }
};