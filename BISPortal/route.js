// npm libraries
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');


// custom libraries
// model
var Model = require('./model');
var prop = require('./properties');
var util = require('./utility');



// ********* Routes***********//


// index page
var index = function (req, res, next) {   
    res.render('index', { title: prop.indexTitle });   
};

// home page
var home = function(req, res, next) {
    if (!req.isAuthenticated()) {               
       res.redirect('/login');
   } else {
      var user = req.user;
      if(user !== undefined) {
         user = user.toJSON();
        }
        
        var projListPromise = null;
        projListPromise = new Model.UserProjects().query({ where: { username: user.username } }).fetch();
        
        return projListPromise.then(function (collection) {
            if (collection) {                
                var userProjectList = collection.toJSON();     // projects assigned to the user          
                var adminLink = '';
                var adminLinkText = '';
                if (user.role == 'admin') {
                    adminLink = prop.adminLink;
                    adminLinkText = prop.adminLinkText;
                }
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.header("Expires", 0);
                res.render('home', { title: user.firstname + '\'' + 's' + ' ' + prop.homeTitle, user: user, adminLink: adminLink, adminLinkText: adminLinkText, userProjectList: userProjectList });
                
            
            } else { // no projects assigned to the user
                
                // check if user has admin rights and redirect
                var adminLink = '';
                var adminLinkText = '';
                if (user.role == 'admin') {
                    adminLink = prop.adminLink;
                    adminLinkText = prop.adminLinkText;
                }
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.header("Expires", 0);
                res.render('home', { title: user.firstname + '\'' + 's' + ' ' + prop.homeTitle, user: user, adminLink: adminLink, adminLinkText: adminLinkText });
            }

        });    
   }
};


// login
// GET
var login = function(req, res, next) {
    if (req.isAuthenticated()) res.redirect('/home');
   res.render('login', {title: prop.loginTitle});
};


// login
// POST
var loginPost = function (req, res, next) {
   var loginErrorMessage = '';    
   passport.authenticate('local', { successRedirect: '/home',
                          failureRedirect: 'login?errorMessage'}, function(err, user, info) {        
                                       
      if (err) {           		  
         return res.render('login', {title: prop.loginTitle, loginErrorMessage: err.message});
      } 

      if(!user) {		 
         return res.render('login', {title: prop.loginTitle, loginErrorMessage: info.message});
      }
      return req.logIn(user, function(err) {
         if(err) {			
            return res.render('login', {title: prop.loginTitle, loginErrorMessage: err.message});
            } else {
                if (req.body.rememberme) {
                    req.session.cookie.maxAge = prop.remembermeSessionTime;
                }
            return res.redirect('/home');
         }
      });
   })(req, res, next);
};




// sign out
var signOut = function(req, res, next) {
   if(!req.isAuthenticated()) {
        res.redirect('/');
   } else {
      req.logout();
      res.redirect('/');
   }
};

// project redirect to skyspark
var project = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {                           // skyspark project redirect
        var user = req.user;
        if (user !== undefined) {
            user = user.toJSON();
        }
        
        var projurl = req.params.id;   
        var skySparkServer = prop.skySparkServer;
        var saltURI = "/auth/" + projurl + "/salt";
        var loginURI = "/auth/" + projurl + "/login";
        
        var uname = user.username;
        var pwd = user.skypd;       
        
        var saltPath = skySparkServer + saltURI + "?" + uname;
        
        // with http module
        /*var http = require('http');    
        var req = http.get(saltPath, function (res) {
        res.setEncoding();
        res.on('data', function (chunk) {
            //console.log(chunk.length);
            //console.log(chunk);
            var str = chunk.toString();
            var result = str.split(/\r?\n/);
            var salt = result[0];
            var nonceStr = result[1];
            //res.destroy();
            
            var bytes = toBytes(username + ":" + salt);
            var passBytes = toBytes(password);
            var hmac = sha1(bytes, passBytes);
            var hmacStr = toBase64(hmac);
            
            var digestBytes = toBytes(hmacStr + ":" + nonceStr);
            var digestHash = sha1(digestBytes);
            var digestStr = toBase64(digestHash);

            setCookie(digestStr);
        });
    });*/

    // with request module
    var request = require('request');
        request(saltPath, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                
                // get salt and nonce
                var str = body.toString();
                var result = str.split(/\r?\n/);
                var salt = result[0];
                var nonce = result[1];

                // Encrypt
                var bytes = util.toBytes(uname + ":" + salt);
                var passBytes = util.toBytes(pwd);
                var hmac = util.sha1(bytes, passBytes);
                var hmacStr = util.toBase64(hmac);
                var digestBytes = util.toBytes(hmacStr + ":" + nonce);
                var digestHash = util.sha1(digestBytes);
                var digestStr = util.toBase64(digestHash);
                
                // create key value pair
                var userData = {
                    username: uname,
                    nonce: nonce,
                    digest: digestStr,
                    mobile: false,
                    password: pwd
                };
                
                // get the login cookie and redirect
                var http = require('http');
                http.post = require('http-post');
                http.post(skySparkServer + loginURI, userData, function (resp) {    
                    var x = resp.headers["set-cookie"].toString();                                        
                    var separators = ['=', ';', '\"', ' '];                    
                    var tokens = x.split(new RegExp(separators.join('|'), 'g'));
                    res.cookie('fanws', tokens[2]);      
                    res.redirect(skySparkServer + '/proj/' + projurl);
                });
            }
        });
    }
};


// email password
// GET
var email = function (req, res, next) {
    if (req.isAuthenticated()) res.redirect('/home');    
    res.render('email-pwd', { title: prop.forgotPwdTitle });
};

// email password
// POST
var emailPost = function (req, res, next) {
    
    var reqBody = req.body;
    var email = reqBody.email;
    var forgotPwdMessage = '';

    // generate password and hash it
    var randomPwd = util.randomString(10);
    var hash = bcrypt.hashSync(randomPwd);


    // update password in DB 
    new Model.User({ emailId: email })
        .fetch({ require: true })
        .then(function (model) {                    
             model.save({ password: hash }, { patch: true })
                .then(function () {
                var name = model.get('firstname');                  
                var msg = util.emailText(randomPwd, name);
                util.sendEmail(email, msg);
                   res.render('login', { title: prop.loginTitle });
                 //res.redirect('/login');
                })
                .otherwise(function (err) {
                 console.log('Save error');
            console.log(err.message);
            res.render('login', { title: prop.loginTitle });
               // res.redirect('/login');
            });       
    })
    .otherwise(function (err) {
        console.log('Fetch error');
        console.log(err.message);
        res.render('email-pwd', { title: prop.forgotPwdTitle, forgotPwdMessage :prop.invalidEmailMsg });
        //res.redirect('/login');
    });
 
};


// admin page
//GET

var admin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {        
        var user = req.user;        
        if (user !== undefined) {
            user = user.toJSON();
        }
                
        if (user.role == 'admin') {
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);      
            res.render('admin', { title: prop.adminTitle, user: user });            
        } else {
            req.logout();
            res.render('login', { title: prop.loginTitle, loginErrorMessage: prop.adminErrMsg });
        }
    }
};

// for adding user first time use this and comment above route
/*
var admin = function (req, res, next) {  
        
            res.render('admin', { title: 'Admin Console'});        
};
*/

// admin add user
//POST
var addUser = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.body;
        var usernamePromise = null;
        usernamePromise = new Model.User({ emailId: user.emailId }).fetch();
        
        return usernamePromise.then(function (model) {
            if (model) {
                addUserMessage = prop.addUserEmailErrMsg;
                res.redirect('admin?addUserMessage#user');
            
            } else {
                var usernamePromise1 = null;
                usernamePromise1 = new Model.User({ username: user.username }).fetch();
                
                usernamePromise1.then(function (model) {
                    if (model) {
                        addUserMessage = prop.addUserUnameErrMsg;
                        res.redirect('admin?addUserMessage#user');
                  
                    } else {
                        //MORE VALIDATION for adding user if needed
                        var password = user.password;
                        var hash = bcrypt.hashSync(password);
                        
                        var signUpUser = new Model.User({ username: user.username, password: hash, firstname: user.firstname, lastname: user.lastname, emailId: user.emailId, address1: user.address1, address2: user.address2, skypd: user.skypd, role: user.role });
                        signUpUser.save().then(function (model) {
                            addUserMessage = prop.addUserScccessMsg;
                            res.redirect('admin?addUserMessage#user');
                        });
                    }
                });

            }
        });        
    }    
};

// admin remove user
//POST
var removeUser = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.body;
        var userPromise = null;
        userPromise = new Model.User({ username: user.username }).fetch();
        
        return userPromise.then(function (model) {
            if (model) {
                var userRemove = model;
                userRemove.destroy().then(function () {
                    removeUserMessage = prop.removeUserSuccessMsg;
                    res.redirect('admin?removeUserMessage#user');
                });
            } else {
                removeUserMessage = prop.removeUserErrMsg;
                res.redirect('admin?removeUserMessage#user');
            }
        });        
    }    
};

// admin add project
//POST

var addProject = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var proj = req.body;
        var projPromise = null;
        projPromise = new Model.Project({ projectname: proj.projectname }).fetch();
        
        return projPromise.then(function (model) {
            
            if (model) {
                addProjMessage = prop.addProjNameErrMsg;
                res.redirect('admin?addProjMessage#project');
            } else {
                var projPromise1 = null;
                projPromise1 = new Model.Project({ projecturl: proj.projecturl }).fetch();
                
                projPromise1.then(function (model) {
                    if (model) {
                        addProjMessage = prop.addProjURLErrMsg;
                        res.redirect('admin?addProjMessage#project');
                    } else {
                        //MORE VALIDATION for adding project if needed
                        
                        var projAdd = new Model.Project({ projectname: proj.projectname, projecturl: proj.projecturl, projectdesc: proj.projectdesc });
                        projAdd.save().then(function (model) {
                            addProjMessage = prop.addProjSuccessMsg;
                            res.redirect('admin?addProjMessage#project');
                        });
                    }
                });

            }
        });
        
    }
    
};

// admin remove project
//POST

var removeProject = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var proj = req.body;
        var projPromise = null;
        projPromise = new Model.Project({ projectname: proj.projectname }).fetch();
        
        return projPromise.then(function (model) {
            if (model) {
                var projRemove = model;
                projRemove.destroy().then(function () {
                    removeProjMessage = prop.removeProjSuccessMsg;
                    res.redirect('admin?removeProjMessage#project');
                });
            } else {
                removeProjMessage = prop.removeProjErrMsg;
                res.redirect('admin?removeProjMessage#project');
            }
        });
        
    }
    
};


// admin assign user project
//POST

var assignUserProject = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var bod = req.body;
        var upPromise = null;
        upPromise = new Model.User({ username: bod.username }).fetch();
        
        return upPromise.then(function (modelU) {
            if (modelU) {
                var upPromise1 = null;
                upPromise1 = new Model.Project({ projectname: bod.projectname }).fetch();
                
                upPromise1.then(function (modelP) {
                    if (modelP) {
                        var upPromise2 = null;
                        upPromise2 = new Model.UserProject({ username : bod.username, projectname: bod.projectname }).fetch();
                        upPromise2.then(function (modelUP) {
                            if (modelUP) {
                                assignUserProjMessage = prop.upAssignDuplicateErrMsg;
                                res.redirect('admin?assignUserProjMessage#user-project');
                   
                            } else {
                                var assignUP = new Model.UserProject({ username: bod.username, projectname: bod.projectname, projecturl: modelP.get('projecturl') });
                                assignUP.save().then(function (model) {
                                    assignUserProjMessage = prop.upAssignSuccessMsg;
                                    res.redirect('admin?assignUserProjMessage#user-project');
                                });
                            }
                        });
                   
                    } else {
                        assignUserProjMessage = prop.upAssignProjErrMsg;
                        res.redirect('admin?assignUserProjMessage#user-project');
                    }
                });
            
            } else {
                assignUserProjMessage = prop.upAssignUserErrMsg;
                res.redirect('admin?assignUserProjMessage#user-project');

            }
        });
        
    }
    
};


// admin unassign user project
//POST

var unassignUserProject = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var up = req.body;
        var upPromise = null;
        upPromise = new Model.UserProject({username:up.username, projectname: up.projectname }).fetch();
        
        return upPromise.then(function (model) {
            if (model) {
                var upRemove = model;
                upRemove.destroy().then(function () {
                    unassignUserProjMessage = prop.upUnAssignSuccessMsg;
                    res.redirect('admin?unassignUserProjMessage#user-project');
                });
            } else {
                unassignUserProjMessage = prop.upUnAssignErrMsg;
                res.redirect('admin?unassignUserProjMessage#user-project');
            }
        });
        
    }
    
};


// Change Password
// GET


var changePwd = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.user;
        if (user !== undefined) {
            user = user.toJSON();
        }        
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        res.render('change-pwd', { title: prop.changePwdTitle, user: user });
    }
};


// login
// POST

var changePwdPost = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.user;
        var pwds = req.body;
        var changePwdMessage = '';
        if (user !== undefined) {
            user = user.toJSON();
        }
        var pwdPromise = null;
        pwdPromise = new Model.User({ emailId: user.emailId }).fetch();
        
        return pwdPromise.then(function (model) {
            if (model) {
                //var hashold = bcrypt.hashSync(pwds.oldpassword);
                if (!bcrypt.compareSync(pwds.oldpassword, model.get('password'))) {
                    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                    res.header("Pragma", "no-cache");
                    res.header("Expires", 0);
                    return res.render('change-pwd', { title: prop.changePwdTitle, changePwdMessage: prop.changePwdWrongPwdMsg });
                } else if (pwds.newpassword != pwds.newpasswordre) {
                    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                    res.header("Pragma", "no-cache");
                    res.header("Expires", 0);
                    return res.render('change-pwd', { title: prop.changePwdTitle, changePwdMessage: prop.changePwdMismatchMsg });
                } else {
                    var hashnew = bcrypt.hashSync(pwds.newpassword);
                    model.save({ password: hashnew }, { patch: true })
                .then(function () {
                        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                        res.header("Pragma", "no-cache");
                        res.header("Expires", 0);
                        return res.render('change-pwd', { title: prop.changePwdTitle, changePwdMessage: prop.changePwdSuccessMsg });
                 //res.redirect('/login');
                    })
                .otherwise(function (err) {
                        console.log('Save error');
                        console.log(err.message);
                        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                        res.header("Pragma", "no-cache");
                        res.header("Expires", 0);
                        return res.render('change-pwd', { title: prop.changePwdTitle, changePwdMessage: prop.unexpectedError });
                    });
                }
            }
        });        
    }
    
};




// 404 not found
var notFound404 = function(req, res, next) {
   res.status(404);
   res.render('404', {title: prop.pnfTitle});
};




// export functions
/**************************************/

// index
module.exports.index = index;

// home
module.exports.home = home;

// login
// GET
module.exports.login = login;
// POST
module.exports.loginPost = loginPost;

// sign out
module.exports.signOut = signOut;

// skyspark project
module.exports.project = project;

// email password
// GET
module.exports.email = email;
// POST
module.exports.emailPost = emailPost;

// admin page
// GET
module.exports.admin = admin;

// add user
// POST
module.exports.addUser = addUser;
// add user
// POST
module.exports.removeUser = removeUser;

// add project
// POST
module.exports.addProject = addProject;
// add project
// POST
module.exports.removeProject = removeProject;

// assign user project
// POST
module.exports.assignUserProject = assignUserProject;
// assign user project
// POST
module.exports.unassignUserProject = unassignUserProject;

// change password
// GET
module.exports.changePwd = changePwd;
// POST
module.exports.changePwdPost = changePwdPost;



// 404 not found
module.exports.notFound404 = notFound404;





