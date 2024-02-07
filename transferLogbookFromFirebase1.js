const { destinationConnection } = require("./config");
const JSONStream = require("JSONStream");
const fs = require("fs");
function isValidDateTime(dateTimeString) {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  return dateTimeRegex.test(dateTimeString);
}
const destinationColumnsLogbooks = [
  "FireBaseId",
  "LogbookEntryId",
  "StartsAt",
  "EndsAt",
  "DiveTime",
  "StartLatitude",
  "StartLongitude",
  "BottomTemperature",
  "Temperature",
  "NationId",
  "CreatedAt",
  "UpdatedAt",
  "DiveSiteId",
];

const destinationColumnsLogbookEntries = ["UserId", "DiveModeId", "LogNumber"];
const destinationColumnsDivsite = [
  "UserId",
  "DivingMode",
  "SiteLocation",
  "SiteLongitude",
  "SiteLatitude",
  "NationId",
  "Nation",
  "SiteAddedDate",
  "SiteName",
];

const insertLogbookData = async () => {
  const stream = fs.createReadStream("diveroidv2020_data.json", {
    encoding: "utf8",
  });

  const parser = JSONStream.parse("*");

  let totalRows = 0;
  parser.on("data", async (obj) => {
    console.log("parsing started");
    if (obj.userData) {
      for (const [userId, userDataObj] of Object.entries(obj.userData)) {
        let logNumber1 = 0;
        let logNumber2 = 0;

        if (userDataObj.log) {
          const idQuery = `SELECT id FROM members WHERE MemberUniqueId='${userId}'`;
          totalRows = totalRows + Object.keys(userDataObj.log).length;

          try {
            const idResults = await new Promise((resolve, reject) => {
              destinationConnection.query(
                idQuery,
                (error, idResults, fields) => {
                  if (error) {
                    calculatemember++;
                    throw error;
                    reject(error);
                  } else {
                    console.log(`${idQuery}`);
                    resolve(idResults);
                  }
                }
              );
            });

            if (idResults[0]?.id) {
              for (const [logId, logbookData] of Object.entries(
                userDataObj.log
              )) {
                const logbookEntriesSql = `INSERT INTO logbookentries (${destinationColumnsLogbookEntries.join(
                  ", "
                )}) VALUES (?)`;
                const logbookSql = `INSERT INTO logbooks (${destinationColumnsLogbooks.join(
                  ", "
                )}) VALUES (?)`;
                const startDate =
                  logbookData.logStartDate?.slice(0, 19) ||
                  new Date().toISOString().slice(0, 19).replace("T", " ");
                let startDateFormatted = startDate;
                if (!isValidDateTime(startDate)) {
                  startDateFormatted = new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ");
                }
                const endDate =
                  logbookData.logEndDate?.slice(0, 19) ||
                  new Date().toISOString().slice(0, 19).replace("T", " ");
                let endDateFormatted = endDate;
                if (!isValidDateTime(endDate)) {
                  endDateFormatted = new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ");
                }

                const DiveModeId = logbookData.logbookType
                  ? logbookData.logbookType + 1
                  : 1;

                if (DiveModeId === 1) {
                  logNumber1++;
                } else {
                  logNumber2++;
                }
                let id = 10;

                const rowValuesLogbookEntries = [
                  idResults[0]?.id,
                  DiveModeId,
                  DiveModeId === 1 ? logNumber1 : logNumber2,
                ];

                try {
                  const logbookentry = await new Promise((resolve, reject) => {
                    destinationConnection.query(
                      logbookEntriesSql,
                      [rowValuesLogbookEntries],
                      (error, results, fields) => {
                        if (error) {
                          console.log(
                            "\x1b[31m%s\x1b[0m",
                            "error in logbookEntry"
                          );
                          throw error;
                          reject(error);
                        } else {
                          console.log(
                            `INSERT INTO logbookentries (${destinationColumnsLogbookEntries.join(
                              ", "
                            )}) VALUES (${rowValuesLogbookEntries.join(",")})`
                          );
                          resolve(results);
                        }
                      }
                    );
                  });
                  const nationQuery = `SELECT id FROM nations WHERE NationCode ='${logbookData.logNationCode}'`;

                  try {
                    const nationResults = await new Promise(
                      (resolve, reject) => {
                        destinationConnection.query(
                          nationQuery,
                          (error, nationResults, fields) => {
                            if (error) {
                              console.log(
                                "\x1b[31m%s\x1b[0m",
                                "error in nations query"
                              );
                              reject(error);
                            } else {
                              console.log(`${nationQuery}`);
                              resolve(nationResults);
                            }
                          }
                        );
                      }
                    );

                    const nationId = nationResults[0]?.id || null;

                    const divesiteQuery = `INSERT INTO divesites (${destinationColumnsDivsite.join(
                      ", "
                    )}) VALUES (?)`;

                    const rowValueDivesite = [
                      idResults[0]?.id,
                      logbookData.logbookType ? logbookData.logbookType + 1 : 1,
                      logbookData.logMajorLocation || "",
                      logbookData.logLongitude || 0,
                      logbookData.logLatitude || 0,
                      nationId || 0,
                      logbookData.logNationCode || "",
                      new Date(),
                      logbookData.logMajorLocation || "",
                    ];

                    try {
                      const divesiteResults = await new Promise(
                        (resolve, reject) => {
                          destinationConnection.query(
                            divesiteQuery,
                            [rowValueDivesite],
                            (error, divesiteResults, fields) => {
                              if (error) {
                                console.log(
                                  "\x1b[31m%s\x1b[0m",
                                  "error in divesite"
                                );
                                throw error;
                                reject(error);
                              } else {
                                console.log(
                                  `INSERT INTO divesites (${destinationColumnsDivsite.join(
                                    ", "
                                  )}) VALUES (${rowValueDivesite.join(",")})`
                                );

                                resolve(divesiteResults);
                              }
                            }
                          );
                        }
                      );

                      const logbookEntryId = logbookentry.insertId;

                      if (logbookEntryId) {
                        const rowValuesLogbooks = [
                          logId,
                          logbookEntryId,
                          startDateFormatted,
                          endDateFormatted,
                          logbookData.logDivingTime || 0,
                          logbookData.logLatitude || 0,
                          logbookData.logLongitude || 0,
                          logbookData.logBottomTemp || 0,
                          logbookData.logAvgTemp || 0,
                          nationId,
                          startDateFormatted,
                          startDateFormatted,
                          divesiteResults.insertId,
                        ];

                        try {
                          await new Promise((resolve, reject) => {
                            destinationConnection.query(
                              logbookSql,
                              [rowValuesLogbooks],
                              (error, results, fields) => {
                                if (error) {
                                  console.log(
                                    "\x1b[31m%s\x1b[0m",
                                    "error in logbook"
                                  );
                                  throw error;
                                  reject(error);
                                } else {
                                  console.log(
                                    `INSERT INTO logbooks (${destinationColumnsLogbooks.join(
                                      ", "
                                    )}) VALUES (${rowValuesLogbooks.join(",")})`
                                  );

                                  resolve(results);
                                }
                              }
                            );
                          });
                        } catch (error) {
                          throw error;
                        }
                      }
                    } catch (error) {
                      throw error;
                    }
                  } catch (error) {
                    throw error;
                  }
                } catch (error) {
                  throw error;
                }
              }
            } else {
            }
          } catch (error) {
            throw error;
          }
        } else {
        }
      }
      console.log("loop completed");
      console.log(`totalRows: ${totalRows}`);
    }
  });

  parser.on("end", () => {
    console.log("Parsing JSON completed.");
  });

  parser.on("error", (error) => {
    console.error("Error parsing JSON:", error);
  });

  stream.pipe(parser);
};

module.exports = insertLogbookData;
