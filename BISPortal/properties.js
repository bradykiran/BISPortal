
// app port

var appPort = 3000;

// Sky Spark Server
var skySparkServer = 'http://localhost';

// DB details
var dbClient = 'mysql';
var dbHost = 'localhost';
var dbUser = 'root';
var dbPassword = '';
var dbName = 'portalDB';
var dbCharset = 'utf8';

var dbUserTable = 'users';
var dbUserTableId= 'userId';
var dbProjectTable = 'projects';
var dbProjectTableId = 'projectId';
var dbUserProjTable = 'userproject';
var dbUserProjTableId = 'upId';


//email forgot password details
var host = '52.2.247.109';
var emailAddress = 'rikkitikkitavi@bis.bradyservices.com';        
var emailPassword = 'brady1915';
var emailSubject = 'BradyIntelligent Services : New password';
var port = 25;
var ssl = false;
var randomPwdChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Admin link details

var adminLink = 'admin';
var adminLinkText = 'Admin Console';


// session time details
var normalSessionTime = 30000; // 30 secs
var remembermeSessionTime = 60000; // 60 secs



// page titles
var indexTitle = 'Brady Intelligent Services';
var homeTitle = 'Home';
var loginTitle = 'Login';
var forgotPwdTitle = 'Forgot Password';
var adminTitle = 'Admin Console';
var pnfTitle = 'Page not Found';
var changePwdTitle = 'Change Password';


//Success messages
var addUserScccessMsg = 'User added successfully';
var removeUserSuccessMsg = 'User removed successfully';
var addProjSuccessMsg = 'Project added successfully';
var removeProjSuccessMsg = 'Project removed successfully';
var upAssignSuccessMsg = 'Project assigned to user successfully';
var upUnAssignSuccessMsg = 'Project un assigned successfully';
var changePwdSuccessMsg = 'Password changed sucessfully';


//error messages
var unexpectedError = 'Unexpected Error';
var invalidUserMsg = 'Invalid Username or Password';
var invalidEmailMsg = 'Email ID not registerd';
var adminErrMsg = 'You do not have admin rights!';
var addUserEmailErrMsg = 'Email Id already exists';
var addUserUnameErrMsg = 'Username already exists';
var removeUserErrMsg = 'Username does not exists';
var addProjNameErrMsg = 'Project name already exists'; 
var addProjURLErrMsg = 'Project URL already exists';
var removeProjErrMsg = 'Project name does not exists';
var changePwdWrongPwdMsg = 'Old password entered incorrectly';
var changePwdMismatchMsg = 'New passwords entered did not match';
var upAssignUserErrMsg = 'Username not found';
var upAssignProjErrMsg = 'Project name not found';
var upUnAssignErrMsg = 'Project not assigned to the user';
var upAssignDuplicateErrMsg = 'Project already assigned to the user';

//**********export properties*************

module.exports = {
    
    //app port
    appPort : appPort,
    
    // skysparkserver
    skySparkServer : skySparkServer,
    
    // DB details
    dbClient: dbClient,
    dbHost: dbHost,
    dbUser: dbUser,
    dbPassword: dbPassword,
    dbName: dbName,
    dbCharset: dbCharset,
    //
    dbUserTable: dbUserTable,
    dbUserTableId: dbUserTableId,
    dbProjectTable: dbProjectTable,
    dbProjectTableId: dbProjectTableId,
    dbUserProjTable: dbUserProjTable,
    dbUserProjTableId: dbUserProjTableId,
    
    // email server details
    host : host,
    emailAddress : emailAddress,
    emailPassword : emailPassword,
    emailSubject : emailSubject,
    port : port,
    ssl : ssl,
    randomPwdChars : randomPwdChars,

    // admin link details
    adminLink : adminLink,
    adminLinkText : adminLinkText,   

    // session time details
    normalSessionTime : normalSessionTime,
    remembermeSessionTime : remembermeSessionTime,

    //page titles
    indexTitle :indexTitle,
    homeTitle : homeTitle,
    loginTitle :loginTitle,
    forgotPwdTitle :forgotPwdTitle,
    adminTitle : adminTitle, 
    pnfTitle: pnfTitle,
    changePwdTitle: changePwdTitle,
    
    //success messages
    addUserScccessMsg : addUserScccessMsg,
    removeUserSuccessMsg: removeUserSuccessMsg,
    addProjSuccessMsg : addProjSuccessMsg,
    removeProjSuccessMsg: removeProjSuccessMsg,
    upAssignSuccessMsg: upAssignSuccessMsg,
    upUnAssignSuccessMsg: upUnAssignSuccessMsg,
    changePwdSuccessMsg : changePwdSuccessMsg,
    


    //error messages
    unexpectedError: unexpectedError,
    invalidUserMsg: invalidUserMsg,
    invalidEmailMsg: invalidEmailMsg,
    adminErrMsg: adminErrMsg,    
    addUserEmailErrMsg : addUserEmailErrMsg,
    addUserUnameErrMsg : addUserUnameErrMsg,  
    removeUserErrMsg  : removeUserErrMsg,
    addProjNameErrMsg : addProjNameErrMsg,
    addProjURLErrMsg : addProjURLErrMsg,
    removeProjErrMsg : removeProjErrMsg,
    changePwdWrongPwdMsg: changePwdWrongPwdMsg,
    changePwdMismatchMsg : changePwdMismatchMsg,
    upAssignUserErrMsg: upAssignUserErrMsg,
    upAssignProjErrMsg: upAssignProjErrMsg,
    upUnAssignErrMsg : upUnAssignErrMsg,
    upAssignDuplicateErrMsg: upAssignDuplicateErrMsg


};