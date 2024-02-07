const jsonData = require("./countries.json");
const { destinationConnection } = require("./config");
const fs = require('fs');

function transferNations() {
  const insertQuery =
    "INSERT INTO nations (Nation, NationCode, ImageUrl) VALUES ?";
  destinationConnection.query(
    insertQuery,
    [jsonData.map((nation) => [nation.name, nation.code, nation.image])],
    (error, results, fields) => {
      if (error) {
        console.error("Error inserting data into MySQL:", error);
      } else {
        console.log("Data inserted into MySQL table successfully!");
      }
    }
  );
// destinationConnection.query('Select * from nations', (error, results, fields) => {
//     if (error) {
//       console.error('Error selecting data from MySQL:', error);
//     } else {
//       const jsonData = JSON.stringify(results);
//       fs.writeFile('output.json', jsonData, (error) => {
//         if (error) {
//           console.error('Error writing JSON data to file:', error);
//         } else {
//           console.log(`JSON data written to file successfully!`);
//         }
//       });;
//     }

//   });
}

module.exports = transferNations;
