const { sourceConnection, destinationConnection } = require("./config");
const tableData = [
  {
    sourceTable: "log",
    sourceColumns: [
      "user_id",
      "logbook_type",
      "start_date",
      "end_date",
      "diving_time",
      "latitude",
      "longitude",
      "bottom_temp",
      "avg_temp",
      "nation_code",
      "full_location",
      "create_date",
      "update_date",
    ],
    destinationTable: "logbooks",
    destinationColumns: [
      "Id",
      "DiveModeId",
      "StartsAt",
      "EndsAt",
      "DiveTime",
      "StartLatitude",
      "StartLongitude",
      "BottomTemperature",
      "Temperature",
      "NationId",
      "DiveSite",
      "LogNumber",
      "CreatedAt",
      "UpdatedAt",
    ],
  },
];

const createLogbook = () => {
  for (const {
    sourceTable,
    sourceColumns,
    destinationTable,
    destinationColumns,
  } of tableData) {
    const selectQuery = `SELECT ${sourceColumns.join(
      ", "
    )} FROM ${sourceTable} LIMIT 5`;
    sourceConnection.query(selectQuery, (err, result) => {
      // console.log(result);
      if (err) throw err;
      // iterate through each row in results and insert into target table one by one
      result.forEach((row) => {
        // get target ID by querying against another table
        console.log(row.user_id);
        const idQuery = `SELECT id FROM members WHERE MemberUniqueId='${row.user_id}'`;

        destinationConnection.query(idQuery, (error, idResults, fields) => {
          if (error) {
            throw error;
          }
          console.log(
            `SELECT id FROM members WHERE MemberUniqueId='${row.user_id}'`,
            idResults
          );
          const nationQuery = `SELECT id FROM nations WHERE NationCode='${row.nation_code}'`;
          destinationConnection.query(nationQuery, (error, nationResult) => {
            if (error) {
              throw error;
            }
            console.log(
              `SELECT id FROM nations WHERE NationCode='${row.nation_code}'`,
              nationResult
            );
          });
          // insert row into target table with target ID
          const insertQuery = `INSERT INTO ${destinationTable} (${destinationColumns.join(
            ","
          )}) VALUES (${idResults[0].id}, ${
            row.logbook_type === "SCUBA" ? 1 : 2
          },'${row.start_date}', '${row.end_date}', '${row.diving_time}', '${
            row.latitude
          }', '${row.longitude}', '${row.bottom_temp}', '${row.avg_temp}', '${
            row.nation_code
          }', '${row.full_location.replace(/'/g, '"')}', 1, '${new Date(
            row.create_date
          )
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")}', '${new Date(row.update_date)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")}')`;

          destinationConnection.query(insertQuery, (error, results, fields) => {
            if (error) {
              throw error;
            }

            console.log(
              `INSERT INTO ${destinationTable} (${destinationColumns.join(
                ","
              )}) VALUES (${idResults[0].id}, '${
                row.logbook_type === "SCUBA" ? 1 : 2
              }','${row.start_date}', '${row.end_date}', '${
                row.diving_time
              }', '${row.latitude}', '${row.longitude}', '${
                row.bottom_temp
              }', '${row.avg_temp}', '${
                row.nation_code
              }', '${row.full_location.replace(/'/g, '"')}', 1, '${new Date(
                row.create_date
              )
                .toISOString()
                .slice(0, 19)
                .replace("T", " ")}', '${new Date(row.update_date)
                .toISOString()
                .slice(0, 19)
                .replace("T", " ")}')`
            );
          });
        });
      });
    });
  }
};

module.exports = createLogbook;
