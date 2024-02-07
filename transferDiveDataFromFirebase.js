const { destinationConnection } = require("./config");
const JSONStream = require("JSONStream");
const fs = require("fs");
// read the JSON file
const stream = fs.createReadStream("diveroidv2020_data.json", {
  encoding: "utf8",
});

const destinationColumns = [];

const insertDiveData = () => {
  const parser = JSONStream.parse("*");
  stream.pipe(parser);
  parser.on("data", (obj) => {
    console.log(obj.userData);
    if (obj.userData) {
      for (const [userId, userDataObj] of Object.entries(obj.userData)) {
        if (userDataObj.log) {
          for (const [logId, diveData] of Object.entries(
          )) {
            const idQuery = `SELECT id FROM logbooks WHERE LogId='${logId}'`;

            destinationConnection.query(idQuery, (error, idResults, fields) => {
              if (error) {
                throw error;
              }
              for (const [ind, diveValues] of Object.entries(diveData)) {
                console.log(diveValues);
              }
            });
          }
        }
      }
    }
  });
};

module.exports = insertDiveData;
