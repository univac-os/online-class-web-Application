var bodyparser = require('body-parser');
var multer = require('multer');
// var email = require('./email');
var Cookie = require('cookie-parser');
// var logout = require('express-passport-logout');
var path = require('path');
var fs = require('fs');
var upload_module = require('./upload');
var parseString = require('xml2js').parseString;

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';


exports.addNewCourse = function (req, res) {
	var user = req.cookies['activeInstructor'];
    var course_name = req.body.myCourseName;
    var instructor = req.body.myInstructor;
    var subject = req.body.myCourseSubject;
    var tags = req.body.myCourseTags;

    var error_exists = 0;

    if(user != "none" && user != undefined)
    {
    	MongoClient.connect(url, function(err, db) 
    	{
            if (err) {
            	error_exists =1;
            } else {
        		var dbs = db.db('nptelv1');
                var cursor = dbs.collection('courses').insert({course_name: course_name, subject: subject, instructor: user, ins_name: instructor, tags: tags, articles: 0,assignments:0, status: 'private', rating: 0.0, enroll_count: 0,}, function (err) {
	                    if (err) {
	                        error_exists = 1;
	                    }
	                    else{
							if (!fs.existsSync('materials/' + user))
							{
                            	fs.mkdirSync('materials/' + user);
                            	fs.mkdirSync('materials/'+user+'/'+course_name);
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'Assignments');
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'uploads');
                            	
                            	
                            	
                        	}else if(!fs.existsSync('materials/'+user+'/'+course_name)){
                        		fs.mkdirSync('materials/'+user+'/'+course_name);
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'Assignments');
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'uploads');
                            	
                        	}
	                        res.cookie('course_name', course_name);
	                        res.cookie('ins_name',instructor);
	                        res.cookie('subject', subject);
	                        res.cookie('tags', tags);
	                        res.cookie('status', 'private');
	                        res.cookie('articles',0);
	                        res.cookie('assignments',0);
	                        res.cookie('enroll_count',0);
	                        res.redirect('/courseDetails'); 
	                     }                   	
	                    
	                });

             }

        	
    	});

    	console.log(user +" " + tags + " " + subject);

	}
	else{
		res.redirect('/overview');
	}
};
exports.courseDetails = function (req,res) {
	var user = req.cookies['activeInstructor'];
	var ins_name = req.cookies['ins_name'];
	var course_name = req.cookies['course_name'];
	var msg = req.cookies['message'];
	res.cookie('message','none');
	if(user != "none" && course_name != "none" && user != undefined && course_name != undefined){

		MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
            } else {
                var dbs = db.db('nptelv1');
                var cursor = dbs.collection('courses').find({'course_name': course_name, 'instructor': user}).toArray(function (err, result) {
                    if (err) {

						res.redirect('/overview');
                    } 
                    else 
                    {
                        if (result.length == 1) {
                        	console.log('REDIRECTING to contribute');
				            	res.cookie('subject', result[0].subject);
		                        res.cookie('status', result[0].status);
	                            res.cookie('tags',result[0].tags);
	                            res.cookie('enroll_count',result[0].enroll_count);
	                            
                        		var temp = [];
		                        temp.push('./materials/' + user + '/' + result[0].course_name+'/uploads');

                        		upload_module.empty();
                        		temp.forEach(upload_module.getAllFiles);
		                        temp = [];
	                             var files = upload_module.returnFiles();
	                            temp.push(files[0]);
	                            
	                            console.log(temp[0]);   
		                        articles_num = temp[0].length;
                        		var temp_assignments = [];
								if(!fs.existsSync('materials/'+user)){
                        		fs.mkdirSync('materials/' + user);
                            	fs.mkdirSync('materials/'+user+'/'+course_name);
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'Assignments');
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'uploads');
                            	
	                        	}else if(!fs.existsSync('materials/'+user+'/'+course_name)){
	                        		fs.mkdirSync('materials/'+user+'/'+course_name);
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'Assignments');
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'uploads');
                            	
	                        	}

		                        temp_assignments.push('./materials/' + user + '/' + result[0].course_name+'/Assignments');

	                    		upload_module.empty();
	                    		temp_assignments.forEach(upload_module.getAllFiles);
		                        temp_assignments = [];
	                             var files_assignments = upload_module.returnFiles();
	                            temp_assignments.push(files_assignments[0]);
	                            console.log(temp_assignments);
		                        
		                     MongoClient.connect(url,function(err,db){
		                     		if(err){
		                     			res.redirect('/overview');

		                     		}else{
		                     			var dbs = db.db('nptelv1');
		                     			var myquery = {'instructor':user,'course_name':course_name};
		                     			var len11 = 0;

		                     			if(temp[0] == 'none'){
		                     				len11 = 0;
		                     			}else{
		                     				len11 = temp[0].length;
		                     			}
		                     			var newquery = {$set:{articles:len11}};
		                     			dbs.collection('courses').updateOne(myquery,newquery,function(err,result1){
		                     				var len1 = 0;
		                     				if(err){res.redirect('/overview');}
		                     				else{
		                     					res.cookie('articles',len11);
					                         
					                         console.log('len ' + len11);
					                         console.log('cookie ' + req.cookies['articles']);
								             if(temp[0].length == 0){
					                        	temp[0] = ["none"];
					                        }
							                 res.render("contribute", {
													  whoami: user,
													  message: msg,
													  ins_name: result[0].ins_name,
													  course_name: course_name,
													  subject: result[0].subject,
													  articles: len11	,
													  tags:result[0].tags,
													  status: result[0].status,
													  enroll_count: result[0].enroll_count,
													  files: temp[0],
													  assignments: temp_assignments[0]
											  });
		                     				}
		                     			});
		                     		}
		                     });
		                        
                            
								
	
                        }
                    }

                });
            }
            
        });	


	}else{
		res.redirect('/overview');
	}
}
exports.modifyCourse = function (req,res) {
	var user = req.cookies['activeInstructor'];
	var ins_name = req.body.myInstructor;
    var course_name = req.body.myCourseName;
    var subject = req.body.myCourseSubject;
    var articles = req.body.myArticles;
    var status = req.body.myStatus;
	if (user != "none" && user != undefined) {
        
        MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
            } else {
                var dbs = db.db('nptelv1');
                var cursor = dbs.collection('courses').find({'course_name': course_name, 'subject': subject, 'instructor': user}).toArray(function (err, result) {
                    if (err) {

						res.redirect('/overview');
                    } 
                    else 
                    {
                        if (result.length == 1) {
                        	console.log('REDIRECTING...');
                        	res.cookie('course_name', course_name);
	                        res.cookie('ins_name',ins_name);
	                        res.cookie('subject', subject);
	                        res.cookie('status', result[0].status);
                            res.cookie('articles',result[0].articles);
                            res.cookie('tags',result[0].tags);
                            res.cookie('enroll_count',result[0].enroll_count);
                            res.cookie('message','none');
                            res.redirect('/courseDetails');
                        }
                    }

                });
            }
            
        }); 

    } else {

		res.redirect('/overview');
    }	
};

exports.editCourse = function editCourse(req,res) {
	var user = req.cookies['activeInstructor'];
	var course_name = req.cookies['course_name'];
    var subject = req.body.myCourseSubject;
    var tags = req.body.myTags;
    console.log('DURING UPDATE ' + tags);
	if(user != "none" && course_name != "none" && user != undefined && course_name != undefined){
		MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
            } else {
                var dbs = db.db('nptelv1');
                var myquery = { course_name:course_name,subject:req.cookies['subject'],instructor:user };
  				var newvalues = { $set: {subject:subject,tags:tags}};
           		var cursor3 = dbs.collection('courses').updateOne(myquery,newvalues,function(err,result){
           			if(err){
           				res.redirect('/overview');
           			}else{
           				MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
            } else {
                var dbs = db.db('nptelv1');
                var cursor = dbs.collection('courses').find({'course_name': course_name, 'subject': subject, 'instructor': user}).toArray(function (err, result) {
                    if (err) {

						res.redirect('/overview');
                    } 
                    else 
                    {
                        if (result.length == 1) {
                        	console.log('REDIRECTING after UPDATE');
                        	res.cookie('message','The course is updated');
                        	res.redirect('/courseDetails');
                        }
                    }

                });
            }
            
        });	
           			}
           		});     
         	}
         });

     

	}else{
		res.redirect('/overview');
	}
}
exports.publishCourse = function publishCourse(req,res) {
	var user = req.cookies['activeInstructor'];
	var course_name = req.cookies['course_name'];
    if(user != "none" && course_name != "none" && user != undefined && course_name != undefined){
    	console.log("publishing " + course_name);
		var myquery = { course_name:course_name,subject:req.cookies['subject'],instructor:user,status:"private" };
  		var newvalues = { $set: {status:"public"}};
           		
  		MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
            } else {
                var dbs = db.db('nptelv1');
                var cursor3 = dbs.collection('courses').updateOne(myquery,newvalues,function(err,result){
    			
           			if(err){
           				res.redirect('/overview');
           			}else{
           				res.cookie('message',"The course has been published");
           				res.redirect('/courseDetails');
           			}
           	});

        	}
        });

    	
    }else{
    	res.redirect("/courseDetails");
    }
}

exports.uploadArticle = function (req,res) {

	var user = req.cookies['activeInstructor'];
	var course_name = req.cookies['course_name'];

    
    if(user != "none" && course_name != "none" && user != undefined && course_name != undefined){
    	console.log('articles[]');
		var upload = upload_module.uploadFile('articles[]', 'materials/' + user + '/' + course_name + '/uploads/');
		upload(req, res, function (err) {
	            if (err) {
	            	console.log('error ' + err);
	            	res.redirect('/overview');
	            }else{
	            	var myquery = { course_name:course_name,subject:req.cookies['subject'],instructor:user };
	            	var articles_num=0;
			           MongoClient.connect(url, function(err, db) {
		            if (err) {
						res.redirect('/overview');
		            }else{
		            	var dbs = db.db('nptelv1');
		            	var cursor = dbs.collection('courses').find({'course_name': course_name, 'instructor': user}).toArray(function (err, result) {
		                    if (err) {
		                    	res.redirect('/overview');
							}else{
		                        var temp = [];
		                        temp.push('./materials/' + user + '/' + result[0].course_name+'/uploads');

                        		upload_module.empty();
                        		temp.forEach(upload_module.getAllFiles);
		                        temp = [];
	                             var files = upload_module.returnFiles();
	                            temp.push(files[0]);
	                            
	                            console.log(temp[0]);   
		                        articles_num = temp[0].length;
                        
								
								var newvalues = { $set: { 'articles': articles_num}};
								var cursor3 = dbs.collection('courses').updateOne(myquery,newvalues,function(err,result){
		    			
		           			if(err){
		           				console.log(err + ' HERE UPDATE ERROR');
		           				res.redirect('/overview');
		           			}else{
		           				//var cursor4 = dbs.collection('courseUploads').insert({'course':course_name,'instructor':user,'uploadName':})
		           				res.cookie('articles',articles_num);
		           				res.cookie('message',"The file has been uploaded.");
		           				res.redirect('/courseDetails');
		           			}
		           	});
        
							}
						});
					}
				});



  					
	      

	            }
	    });
	    
    }else{
    	res.redirect('/overview');
    }
}
exports.viewFile = function (req,res) {
	var user = req.query.user;
    var filename = req.query.filename;
    var course_name = req.query.course_name;
    console.log(filename + ' sent to instructor');

    if (user!=undefined && course_name!=undefined && req.cookies['activeInstructor'] == user && req.cookies['course_name'] == course_name) {
        res.sendFile('/home/abdulsmapara/paramv2/server/materials/' + user + '/' + course_name + '/uploads/' + filename);
    }else{
    	res.redirect('/overview');
    }
}
exports.removeFile = function(req,res){
    var user = req.query.user;
    var course_name = req.query.course_name;
    var filename = req.query.filename;

    if (user!=undefined && course_name!=undefined && user == req.cookies['activeInstructor'] && course_name == req.cookies['course_name']) {
        fs.unlink('materials/' + user + '/' + course_name + '/uploads/' + filename, function (err) {
            if (err) {console.log(err);res.redirect('/overview');}
            else{
            	res.cookie('message','File deleted successfully !');
            	res.redirect('/courseDetails');
            }
        });
    }else{
    	res.redirect('/overview');
    }
}


exports.allCourses = function (req,res) {
	var user = req.cookies['activeStudent'];
	var msg = req.cookies['message'];
	if(msg=='none'){
		msg="none";
	}
	console.log('HERE---------------'+msg);
	res.cookie("message","none");
	if(user != "none" && user != undefined){

		MongoClient.connect(url, function(err, db) {
		            if (err) {
		            	console.log('error');
						res.redirect('/overview');
		            }else{
		            	var dbs = db.db('nptelv1');
		            	var cursor11 = dbs.collection('courses').find({"status":"public"}).toArray(function (err,result){
		            		var all_courses = result;
		            		if(result.length==0 || result == 'none' || result[0]=='none'){
		            			all_courses = ["none"];
		            		}

		            		console.log(all_courses);
		            		
		            		console.log(all_courses.length);
		            		MongoClient.connect(url, function(err, db) {
							            if (err) {
											res.redirect('/overview');
										}else{

											var dbs = db.db('nptelv1');
		            						var c11 = dbs.collection('student_courses').find({'student': user}).toArray(function(err,res1){
		            								var my_courses = res1;
		            								if(res1.length == 0 || res1=='none'||res1[0]=='none'){
		            									my_courses = ["none"];
		            								}
		            								console.log(msg);
		            								res.render('all_courses',{
									            			whoami : user,
									            			message: msg,
									            			my_courses: my_courses,
									            			all_courses: all_courses
									            		});
		            						});
										}
								});
		            		

		            	});
		            }
		   });


	}else{
		res.redirect('/overview');
	}

}
exports.enrollCourse = function(req,res){
	var user = req.cookies['activeStudent'];
	var stud = req.query.user;
	var course_name = req.query.course_name;
	var instructor = req.query.instructor;
	var ins_name = req.query.ins_name;

	if(user != "none" && user == stud && user != undefined && stud !=undefined){
		MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
            }else{
            	var dbs=db.db('nptelv1');
            	MongoClient.connect(url, function(err, db) {
		            if (err) {
						res.redirect('/overview');
		        	}else{
		        		var dbs = db.db('nptelv1');
				            	dbs.collection('student_courses').find({'student':user,'course_name':course_name,'instructor':instructor}).toArray(function(err,res11){
				            		if(err){res11.redirect('/overview');}
				            		else{
				            			console.log('already '+res11);
				            			if(res11.length==0||res11[0] == 'none'||res11=='none'){
				            				dbs.collection('student_courses').insert({'student':user,'course_name':course_name,'instructor':instructor,'ins_name':ins_name},function(err){
            		if(err){
            			res.redirect('/overview');
            		}else{
            			MongoClient.connect(url, function(err, db) {
				            if (err) {
								res.redirect('/overview');
				            }
				            else{
				            	var dbs = db.db('nptelv1');
				            	dbs.collection('courses').find({'course_name':course_name,'instructor':instructor}).toArray(function(err,res1){
				            		if(err){res.redirect('/overview');}
				            		else
				            		{
				            			var num_enroll = res1[0].enroll_count + 1;
				            			dbs.collection('courses').updateOne({'course_name':course_name,'instructor':instructor},{$set:{'enroll_count':num_enroll}},function(err,res13){
				            					if(err){res.redirect('/overview');}else{
						            			
						            			res.cookie('message','Dear '+user+', '+'You have enrolled for '+course_name+' successfully !');
						            			res.redirect('/allCourses');
						            		}
				            			});
				            		}
				            	});
				            }
				        });
            		}
            	});
				            			}else{
				            				res.cookie('message','You are already registered for this course !');
				            				res.redirect('/allCourses');
				            			}
				            		}
				            	});
		        	}
		        });
            	

            }
		});
	}else{
		res.redirect('/overview');
	}
}
exports.studentViewCourse = function (req,res) {
	var user = req.cookies['activeStudent'];

	var stud = req.query.user;

	var course_name = req.query.course_name;
	var ins = req.query.instructor;


	if(user != undefined && stud != undefined && user == stud){
		MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
            }else{
            	var dbs = db.db('nptelv1');
            	dbs.collection('student_courses').find({'student':user,'course_name':course_name,'instructor':ins}).toArray(function(err,result){
            		if(err){res.redirect('/overview');}
            		else{
	            		if(result.length==1){
	            			dbs.collection('courses').find({'course_name':course_name,'instructor':ins}).toArray(function(err,result11){
	            				
	            				var temp = [];
		                        temp.push('./materials/' + ins + '/' + result11[0].course_name+'/uploads');

                        		upload_module.empty();
                        		temp.forEach(upload_module.getAllFiles);
		                        temp = [];
	                             var files = upload_module.returnFiles();
	                            temp.push(files[0]);
	                            console.log(temp);
	                            var temp_assignments = [];
								if(!fs.existsSync('materials/'+ins)){
                        		fs.mkdirSync('materials/' + ins);
                            	fs.mkdirSync('materials/'+user+'/'+course_name);
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'Assignments');
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'uploads');
                            	
	                        	}else if(!fs.existsSync('materials/'+ins+'/'+course_name)){
	                        		fs.mkdirSync('materials/'+user+'/'+course_name);
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'Assignments');
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'uploads');
                            	
	                        	}

		                        temp_assignments.push('./materials/' + ins + '/' + result[0].course_name+'/Assignments');

	                    		upload_module.empty();
	                    		temp_assignments.forEach(upload_module.getAllFiles);
		                        temp_assignments = [];
	                             var files_assignments = upload_module.returnFiles();
	                            temp_assignments.push(files_assignments[0]);
	                            console.log(temp_assignments);
		                        
	                            res.render('student_view',{
	            					whoami: user,
	            					course_name: course_name,
	            					subject: result11[0].subject,
	            					instructor: result11[0].instructor,
	            					ins_name : result11[0].ins_name,
	            					files: temp[0],
	            					rating: result11[0].rating,
	            					tags: result11[0].tags,
	            					enroll_count: result11[0].enroll_count,
	            					message: "none",
	            					assignments: temp_assignments[0]

	            				});	
	            			});
	            			
	            		}else{
	            			res.redirect('/allCourses');
	            		}
	            	}
            	});
            }
	});



	}else{
		res.redirect('/overview');
	}
}
exports.viewFileStudent = function (req,res){
	var user = req.cookies['activeStudent'];

	var stud = req.query.user;
	var filename = req.query.filename;

	var course_name = req.query.course_name;
	var ins = req.query.instructor;


	if(user != undefined && stud != undefined && user != "none" && user == stud){
		MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
        	}else{
        		var dbs = db.db('nptelv1');
        		dbs.collection('student_courses').find({'student':user,'course_name':course_name,'instructor':ins}).toArray(function(err,result1){
        			if(err){res.redirect('/overview');}
        			else
        			{
        				if(result1.length==1){
        					res.sendFile('/home/abdulsmapara/paramv2/server/materials/'+ins+'/'+course_name+'/uploads/'+filename);

						}else{
							res.redirect('/allCourses');
						}
					}
        		});
        	}
        });
	}else{
		res.redirect('/overview');
	}
}
exports.myCoursesStudent = function(req,res){
	var user = req.cookies['activeStudent'];
	var stud = req.query.user;
	if(user != "none" && user != undefined && user == stud && stud != undefined){
		MongoClient.connect(url, function(err, db) {
            if (err) {
				res.redirect('/overview');
        	}else{
        		var dbs = db.db('nptelv1');
        		dbs.collection('student_courses').find({'student':user}).toArray(function (err,result) {
        			if(err){
        				res.redirect('/overview');
        			}else{

        				console.log("my courses " + result);
        				if(result=='none'||result=="none"||result==undefined||result==""){
        					result=["none"];
        				}
        				res.render('my_courses',{
        					whoami:user,
        					message:"none",
        					myCourses: result
        				});
        			}
        		});
        	}
        });


	}else{
		res.redirect('/overview');
	}
}

exports.uploadAssignment = function (req,res) {
	MongoClient.connect(url, function(err, db) {
	});
	var question = req.body.question;
	var option1 = req.body.option1;
	var option2 = req.body.option2;
	var option3 = req.body.option3;
	var option4 = req.body.option4;
	var correct = req.body.correct;
	
	console.log(question.length+'\n');

	for(var i=0;i<question.length;i++){
		console.log(question[i]+' '+option1[i]+' '+option2[i]+' '+option3[i]+' '+option4[i]+' CORRECT: '+correct[i]+'\n');
	}


	var user = req.cookies['activeInstructor'];
	var course_name = req.cookies['course_name'];

    
    if(user != "none" && course_name != "none" && user != undefined && course_name != undefined)
    {
    	MongoClient.connect(url,function (errdb,db) {
    		if(errdb){ res.redirect('/overview'); }
    		else{
    			var dbs = db.db('nptelv1');
				var cursor = dbs.collection('courses').find({'course_name': course_name, 'instructor': user}).toArray(function (err, result) {
					if(err){res.redirect('/overview');}
					else{
						if(result.length == 1){
							console.log('ADDING ASSIGNMENT');
							var temp_assignments = [];
							if(!fs.existsSync('materials/'+user)){
                        		fs.mkdirSync('materials/' + user);
                            	fs.mkdirSync('materials/'+user+'/'+course_name);
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'Assignments');
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'uploads');
                            	
                        	}else if(!fs.existsSync('materials/'+user+'/'+course_name)){
                        		fs.mkdirSync('materials/'+user+'/'+course_name);
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'Assignments');
                            	fs.mkdirSync('materials/'+user+'/'+course_name+'/'+'uploads');
                            	
                        	}


	                        temp_assignments.push('./materials/' + user + '/' + result[0].course_name+'/Assignments');

                    		upload_module.empty();
                    		temp_assignments.forEach(upload_module.getAllFiles);
	                        temp_assignments = [];
                             var files_assignments = upload_module.returnFiles();
                            temp_assignments.push(files_assignments[0]);
                            console.log('temp assignments[0] ' + temp_assignments[0]);

                            var num_assignments = 0;
                            if(temp_assignments != undefined && temp_assignments != "none" && temp_assignments[0] != 'none'){
                            	num_assignments = temp_assignments.length;
                            }
                            var fnamesuffix = num_assignments + 1;
                            var fname = 'Assignment' + fnamesuffix+'.xml';
                            var data = '<?xml version="1.0" encoding="ISO-8859-1" ?>\n';
                            data = data + '<ASSIGNMENT>';
                            data = data + '<TOTAL>' + question.length + '</TOTAL>\n';


                            for(var i = 0;i < question.length;i++){
                            	data = data + '<QUESTION>\n<STATEMENT>' + question[i] + '</STATEMENT>\n';
                            	data = data + '<OPTION>' + option1[i] +'</OPTION>\n';
                            	data = data + '<OPTION>' + option2[i] +'</OPTION>\n';
                            	data = data + '<OPTION>' + option3[i] +'</OPTION>\n';
                            	data = data + '<OPTION>' + option4[i] +'</OPTION>\n';
                            	data = data + '<CORRECT>' + correct[i] +'</CORRECT>\n';
                            	data = data + '</QUESTION>\n';
                            }
                            data = data + '</ASSIGNMENT>';

                            fs.writeFile('./materials/'+user+'/'+course_name+'/Assignments/'+fname,data,function(err) {
                            	if(err){
                            		console.log(err);
                            		res.redirect('/overview');
                            	}else{
                            		console.log('XML FILE CREATED');
                            		res.cookie('message','The assignment has been uploaded');
                            		res.redirect('/courseDetails');
                            	}

                            });
						}else{
							res.redirect('/overview');
						}
					}
				});
    		}
    	});
    	
		                
    }
}
exports.sendEmail = function (req,res) {
	//check if student is logged in
var user = req.cookies['activeStudent'];
var course_name = req.body.myCourseName;
var feedback = req.body.myFeedback;
var instructor = req.body.myInstructor;
console.log("here i am " + instructor);

	if(user != "none" && user != undefined){
		MongoClient.connect(url, function(err, db) {
        	if(err){ res.redirect('/overview');}
        	else{
        		db.db('nptelv1').collection('Instructor_login').find({'username':instructor}).toArray(function(err,result9){
        			if(err){res.redirect('/overview');}
        			else{
        				if(result9.length != 1){
        					res.redirect('/overview');
        				}else{
        					var to = result9[0].email;
        					let transporter = nodemailer.createTransport({
		    host: 'smtp.gmail.com',
		    port: 465,
		    secure: true,
		    auth: {
		        user: 'codeingzone@gmail.com',
		        pass: 'mycodeingzone'
		    }
		});

		let mailOptions = {
		    from: '"Abdul Sattar Mapara" <codeingzone@gmail.com>',
		    to: to,
		    subject: 'Feedback of ' + course_name,
		    html: ''+feedback+'<br /> From - ' + user
		};

		transporter.sendMail(mailOptions, (error, info) => {
		    if (error) {
		    	res.cookie('message','Could not submit your feedback');
		    	res.redirect('/studentViewCourse?user='+user+"&course_name="+course_name+"&instructor="+instructor);
		    }else{
		    	res.cookie('message','Feedback sent successfully !');
		    	res.redirect('/studentViewCourse?user='+user+"&course_name="+course_name+"&instructor="+instructor);
		    }
		   
		});
        				}
        			}
        		});
        	}
        });

		
	}else{
		res.redirect('/overview');
	}
}
exports.viewAssignment = function (req,res) {
	var user = req.query.user;
	var Assignment = req.query.Assignment;
	var course_name = req.query.course_name;
	var instructor = req.query.instructor;

	var activeInstructor = req.cookies['activeInstructor'];
	var activeStudent = req.cookies['activeStudent'];

	if((activeStudent != undefined && activeStudent != "none" && activeStudent == user) || (activeInstructor != undefined && activeInstructor != "none" && activeInstructor == user && instructor == user) && course_name != undefined && course_name != "none" && Assignment != undefined){
		MongoClient.connect(url, function(err, db) {
        	if(err){ res.redirect('/overview');}
        	else{
        		db.db('nptelv1').collection('courses').find({'course_name':course_name,'instructor':instructor}).toArray(function(err,result){
					if(err){
						console.log('ERROR');
						console.log(err);
						res.redirect('/overview');
					}else{
						if(result.length == 1){
							fs.readFile('materials/'+instructor+'/'+course_name+'/Assignments/Assignment'+Assignment+'.xml',function(errormsg,data){
								if(errormsg) {
									console.log(errormsg);
									res.redirect('/overview');
								}else{
								parseString(data,function(err,finaldata){
									
									console.log(JSON.stringify(finaldata));
									question = [];
									question = finaldata.ASSIGNMENT.QUESTION;
									console.log('QUESTION ARRAY IS \n');
									console.log(question);

									
									if(user == instructor){
									
									//instructor wants to view the assignment
									res.render('assignment',{
										message:"none",
										whoami: user,
										course_name: course_name,
										instructor: instructor,
										assignment: "Assignment"+Assignment,
										data : JSON.parse(JSON.stringify(finaldata)),
										total_questions: finaldata.ASSIGNMENT.TOTAL,
										display_answers: "yes",
										finaldata: question
													
									});
								}else{
								//student is attempting the assignment
									db.db('nptelv1').collection('student_courses').find({'student':user,'course_name':course_name,'instructor':instructor}).toArray(function(err,result9){
										if(err){res.redirect('/overview');}
										else{
											if(result9.length==1){
												res.render('assignment',{
													message: "none",
													whoami: user,
													course_name: course_name,
													instructor: instructor,
													assignment: "Assignment"+Assignment,
													data : JSON.parse(JSON.stringify(finaldata)),
													total_questions: finaldata.ASSIGNMENT.TOTAL,
													display_answers: "no",
													finaldata: question

												});
											}else{

												console.log('error2');
												res.redirect('/overview');
											}
										}
									});
								}
								});
								
							}
							});
							

						}else{
							res.redirect('/overview');
						}
					}
				});
				
				
			}
		});

	}else{

		console.log('error3');
		res.redirect('/overview');
	}
}
exports.checkAssignment = function(req,res){
	var user = req.body.user;
	var Assignment = req.body.Assignment;
	var course_name = req.body.course_name;
	var instructor = req.body.instructor;
	var activeStudent = req.cookies['activeStudent'];
	var total_questions = req.body.total_questions;
	
	responses = [];
	for(var x = 0;x < total_questions;x++){
		var p =x+1;
		var bd = JSON.parse(JSON.stringify(req.body));
		console.log(bd);
		console.log('HERE ' + bd["answer"+p.toString()]);
		if(bd["answer"+p.toString()] == undefined || bd["answer"+p.toString()] == ""){
			responses.push('0');
		}else{
			responses.push(bd["answer"+p.toString()]);
		}
		console.log(responses);
		console.log('changed');
	}

	if((activeStudent != undefined && activeStudent != "none" && activeStudent == user) && course_name != undefined && course_name != "none" && Assignment != undefined){

		fs.readFile('materials/'+instructor+'/'+course_name+'/Assignments/'+Assignment+'.xml',function(errormsg,data){
			if(errormsg) {
					console.log(errormsg);
					res.redirect('/overview');
				}else{
				parseString(data,function(err,finaldata){
					
					console.log(JSON.stringify(finaldata));
					question = [];
					question = finaldata.ASSIGNMENT.QUESTION;
					console.log('QUESTION ARRAY IS \n');
					var num_correct = 0;
					for(var x =0;x<finaldata.ASSIGNMENT.TOTAL;x++){
						if(finaldata.ASSIGNMENT.QUESTION[x].CORRECT[0] == responses[x]){
							num_correct ++;
						}
					}
					console.log('YOU HAVE GOT '+num_correct);
					question = [];
					question = finaldata.ASSIGNMENT.QUESTION;
									
					res.render('assignment',{
						message: "You have got "+num_correct +" answer(s) correct out of " + total_questions +" !",
						whoami: user,
						course_name: course_name,
						instructor: instructor,
						assignment: Assignment,
						data : JSON.parse(JSON.stringify(finaldata)),
						total_questions: finaldata.ASSIGNMENT.TOTAL,
						display_answers: "yes",
						finaldata: question
					});

				});
			}	
		});

	}else{
		res.redirect('/overview');
	}

}