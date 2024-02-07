const { destinationConnection } = require("./config");
const JSONStream = require("JSONStream");
const fs = require("fs");
// read the JSON file
const stream = fs.createReadStream("diveroidv2020_data.json", {
  encoding: "utf8",
});

const destinationColumns = [
  "LogId",
  "UserId",
  "DiveModeId",
  "StartsAt",
  "EndsAt",
  "DiveTime",
  "StartLatitude",
  "StartLongitude",
  "BottomTemperature",
  "Temperature",
  "Nation",
  "DiveSite",
  "LogNumber",
  "CreatedAt",
  "UpdatedAt",
];

const insertLogbookData = () => {
  const parser = JSONStream.parse("*");
  stream.pipe(parser);
  parser.on("data", (obj) => {
    if (obj.userData) {
      for (const [userId, userDataObj] of Object.entries(obj.userData)) {
        if (userDataObj.log) {
          const idQuery = `SELECT id FROM members WHERE MemberUniqueId='${userId}'`;

          destinationConnection.query(idQuery, (error, idResults, fields) => {
            if (error) {
              throw error;
            }
            console.log(idResults[0]?.id || `error in ${idQuery}`);
            if (idResults[0]?.id) {
              for (const [logId, logbookData] of Object.entries(
                userDataObj.log
              )) {
                const sql = `INSERT INTO logbooks (${destinationColumns.join(
                  ", "
                )}) VALUES (?)`;
                const startDate =
                  logbookData.logStartDate?.slice(0, 19) ||
                  new Date().toISOString().slice(0, 19).replace("T", " ");
                const endDate =
                  logbookData.logEndDate?.slice(0, 19) ||
                  new Date().toISOString().slice(0, 19).replace("T", " ");
                const rowValues = [
                  logId,
                  idResults[0]?.id,
                  logbookData.logbookType ? logbookData.logbookType + 1 : 1,
                  startDate,
                  endDate,
                  logbookData.logDivingTime || 0,
                  logbookData.logLatitude || 0,
                  logbookData.logLongitude || 0,
                  logbookData.logBottomTemp || 0,
                  logbookData.logAvgTemp || 0,
                  logbookData.logNationCode || "",
                  logbookData.logMajorLocation || "",
                  logId,
                  startDate,
                  startDate,
                ];
                destinationConnection.query(
                  sql,
                  [rowValues],
                  (error, results, fields) => {
                    if (error) {
                      console.error(error);
                    } else {
                      console.log(
                        `Inserted ${results.affectedRows} row(s) into the table.`
                      );
                    }
                  }
                );
              }
            }
          });
        }
      }
    }
  });
};

module.exports = insertLogbookData;
