const { destinationConnection } = require("./config");
const JSONStream = require("JSONStream");
const fs = require("fs");
// read the JSON file
const stream = fs.createReadStream("diveroidv2020_data.json", {
  encoding: "utf8",
});

const destinationColumns = [
  "LogDepthTimeId",
  "ContentType",
  "FileName",
  "FileUrl",
  "FileSize",
  "Liked",
  "Temperature",
  "CreatedAt",
  "UpdatedAt",
];

const insertMedia = () => {
  const parser = JSONStream.parse("*");
  stream.pipe(parser);
  parser.on("data", (obj) => {
    if (obj.userData) {
      for (const [userId, userDataObj] of Object.entries(obj.userData)) {
        if (userDataObj.media) {
          for (const [mediaId, mediaObj] of Object.entries(userDataObj.media)) {
            const idQuery = `SELECT id FROM logbooks WHERE LogId='${mediaObj.logID}'`;

            destinationConnection.query(idQuery, (error, idResults, fields) => {
              if (error) {
                throw error;
              }
              console.log(idResults[0]?.id || `error in ${idQuery}`);
              if (idResults[0]?.id) {
                const diveTimeQuery = `INSERT INTO logdepthtimes (LogbookId, Depth, Time) VALUES (?)`;
                const createdAt =
                  mediaObj.createdDate?.slice(0, 19) ||
                  new Date().toISOString().slice(0, 19).replace("T", " ");
                const diveValues = [
                  idResults[0]?.id,
                  mediaObj.depth,
                  createdAt,
                ];
                destinationConnection.query(
                  diveTimeQuery,
                  [diveValues],
                  (error, diveTimeResults, fields) => {
                    if (error) {
                      throw error;
                    }
                    console.log("Divetime", diveTimeResults);
                    if (diveTimeResults) {
                      const logMediaQuery = `INSERT INTO logbookmedia (${destinationColumns.join(
                        ", "
                      )}) VALUES (?)`;
                      const mediaValues = [
                        diveTimeResults?.insertId,
                        "image",
                        mediaObj.fileName,
                        mediaObj.fileName,
                        0,
                        mediaObj.mediaLike,
                        mediaObj.temperature,
                        createdAt,
                        createdAt,
                      ];
                      destinationConnection.query(
                        logMediaQuery,
                        [mediaValues],
                        (error, logMediaResults, fields) => {
                          if (error) {
                            throw error;
                          }
                          console.log("Logbook media", logMediaResults);
                        }
                      );
                    }
                  }
                );
              }
            });
          }
        }
      }
    }
  });
};

module.exports = insertMedia;
