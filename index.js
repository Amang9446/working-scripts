const createLogbook = require("./transferLogbookFromSql");
const createMembers = require("./transferMembersFromSql");
const insertUsersData = require("./transferMembersFromFirebase");
const insertLogbookData = require("./transferLogbookFromFirebase1");
const insertDiveData = require("./transferDiveDataFromFirebase");
const insertMedia = require("./transferMediaFromFirebase1");
const transferNations = require("./transferNationJsontoSql");
const createLogbooks = require("./testtransferLogbookFromSql"); //testing

createMembers(); // working properly
// createLogbook();
// insertUsersData(); // working properly
// insertLogbookData();
// insertDiveData();
// insertMedia();
// transferNations(); // working properly
// createLogbooks();

