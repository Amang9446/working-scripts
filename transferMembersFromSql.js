const { sourceConnection, destinationConnection } = require("./config");

const tableData = [
  {
    sourceTable: "user",
    sourceColumns: [
      "user_id",
      "email",
      "name",
      "email_verified",
      "create_date",
      "update_date",
    ],
    destinationTable: "members",
    destinationColumns: [
      "MemberUniqueId",
      "Email",
      "Name",
      "IsMailConfirm",
      "RegistDate",
      "LastUpdate",
    ],
  },
];

const createMembers = () => {
  for (const {
    sourceTable,
    sourceColumns,
    destinationTable,
    destinationColumns,
  } of tableData) {
    const selectQuery = `SELECT ${sourceColumns.join(
      ", "
    )} FROM ${sourceTable}`;
    sourceConnection.query(selectQuery, (err, result) => {
      if (err) throw err;

      const uniqueIds = result.map((row) => row.user_id);

      const checkDuplicateQuery = `SELECT ${destinationColumns[0]} FROM ${destinationTable} WHERE ${destinationColumns[0]} IN (?)`;
      destinationConnection.query(
        checkDuplicateQuery,
        [uniqueIds],
        (err, duplicateResult) => {
          if (err) throw err;

          const existingUniqueIds = duplicateResult.map(
            (row) => row.MemberUniqueId
          );

          const uniqueRows = result.filter(
            (row) => !existingUniqueIds.includes(row.user_id)
          );

          if (uniqueRows.length === 0) {
            console.log(
              `All data from ${sourceTable} is already present in ${destinationTable}. No new data to insert.`
            );
            sourceConnection.end();
            destinationConnection.end();
            return;
          }

          if (existingUniqueIds.length === 0) {
            console.log(
              `All data from ${sourceTable} is new. Inserting all rows into ${destinationTable}.`
            );
          } else {
            console.log(
              `Some data from ${sourceTable} is duplicate, and some is new. Inserting unique rows into ${destinationTable}.`
            );
          }

          const insertQuery = `INSERT INTO ${destinationTable} (${destinationColumns.join(
            ", "
          )}) VALUES ?`;
          const values = uniqueRows.map((row) =>
            sourceColumns.map((column) => row[column])
          );
          destinationConnection.query(
            insertQuery,
            [values],
            (err, insertResult) => {
              if (err) throw err;
              console.log(
                `Data transferred from ${sourceTable} to ${destinationTable}`
              );
              sourceConnection.end();
              destinationConnection.end();
            }
          );
        }
      );
    });
  }
};

module.exports = createMembers;
