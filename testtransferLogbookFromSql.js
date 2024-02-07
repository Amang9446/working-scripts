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
      //   "full_location",
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
      //   "DiveSite",
      "CreatedAt",
      "UpdatedAt",
    ],
  },
];
const queryAsync = (connection, query, values = []) => {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
const createLogbooks = async () => {
  for (const {
    sourceTable,
    sourceColumns,
    destinationTable,
    destinationColumns,
  } of tableData) {
    try {
      const selectQuery = `SELECT ${sourceColumns.join(
        ", "
      )} FROM ${sourceTable} LIMIT 5`;
      const result = await queryAsync(sourceConnection, selectQuery);

      for (const row of result) {
        const idResults = await queryAsync(
          destinationConnection,
          `SELECT id FROM members WHERE MemberUniqueId='${row.user_id}'`
        );
        const nationResults = await queryAsync(
          destinationConnection,
          `SELECT id FROM nations WHERE NationCode='${row.nation_code}'`
        );

        // Check if row.full_location is defined before using replace
        const fullLocation = row.full_location
          ? row.full_location.replace(/'/g, '"')
          : "";

        const insertQuery = `INSERT INTO ${destinationTable} (${destinationColumns.join(
          ","
        )}) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const createdAtValue = row.create_date ? new Date(row.create_date).toISOString().slice(0, 19).replace("T", " ") : new Date().toISOString().slice(0, 19).replace("T", " ");
        const updateAtValue = row.create_date ? new Date(row.create_date).toISOString().slice(0, 19).replace("T", " ") : new Date().toISOString().slice(0, 19).replace("T", " ");
        const insertValues = [
            idResults[0].id,
            row.logbook_type === "SCUBA" ? 1 : 2,
            row.start_date,
            row.end_date,
            row.diving_time,
            row.latitude,
            row.longitude,
            row.bottom_temp,
            row.avg_temp,
            nationResults[0].id,
            fullLocation,
            1,  
            createdAtValue,
            row.update_date
          ];

        await queryAsync(destinationConnection, insertQuery, insertValues);
      }
    } catch (error) {
      console.error(error);
      // Handle the error according to your application's needs
    }
  }
};

module.exports = createLogbooks;
