//@author Kiran Gaitonde

// libraries
var DB = require('./db').DB;
var prop = require('./properties');


// db models

var User = DB.Model.extend({
   tableName: prop.dbUserTable,
    idAttribute: prop.dbUserTableId
});

var Project = DB.Model.extend({
    tableName: prop.dbProjectTable,
    idAttribute: prop.dbProjectTableId
});

var UserProject = DB.Model.extend({
    tableName: prop.dbUserProjTable,
    idAttribute: prop.dbUserProjTableId
});


// db collection
var UserProjects = DB.Collection.extend({
    model: UserProject
});


// export models

module.exports = {
    User: User,
    Project: Project,
    UserProject: UserProject,
    UserProjects: UserProjects
};