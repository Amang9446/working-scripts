const { destinationConnection } = require("./config");
const fs = require("fs");

const insertUsersData = () => {
  const jsonData = JSON.parse(fs.readFileSync("users-data1.json"));
  const destinationColumns = [
    "MemberUniqueId",
    "Email",
    "Password",
    "Salt",
    "Name",
    "GoogleId",
    "FacebookId",
    "AppleId",
    "ProfilePhoto",
    "IsMailConfirm",
    "FromFirebase",
    "RegistDate",
    "LastUpdate",
  ];

  jsonData.users.forEach((row) => {
    const sql = `INSERT INTO members (${destinationColumns.join(
      ", "
    )}) VALUES (?)`;
    const createDate = new Date(Number(row.createdAt))
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const googleRow = row.providerUserInfo?.find(
      (e) => e.providerId === "google.com"
    );
    const facebookRow = row.providerUserInfo?.find(
      (e) => e.providerId === "facebook.com"
    );
    const rowValues = [
      row.localId,
      row.email || "",
      row.passwordHash || "",
      row.salt || "",
      row.displayName || "",
      googleRow?.rawId || "",
      facebookRow?.rawId || "",
      "",
      row.photoUrl || "",
      row.emailVerified || false,
      true,
      createDate,
      createDate,
    ];

    const checkDuplicateQuery = `SELECT ${destinationColumns[0]} FROM members WHERE ${destinationColumns[0]} = ?`;
    destinationConnection.query(
      checkDuplicateQuery,
      [rowValues[0]],
      (err, duplicateResult) => {
        if (err) {
          console.error(err);
        } else {
          if (duplicateResult.length === 0) {
            destinationConnection.query(
              sql,
              [rowValues],
              (error, results, fields) => {
                if (error) {
                  console.error(error);
                } else {
                  console.log(results);
                }
              }
            );
          } else {
            console.log(
              `Duplicate data found for MemberUniqueId ${rowValues[0]}. Skipping insertion.`
            );
          }
        }
      }
    );
  });
};

module.exports = insertUsersData;
