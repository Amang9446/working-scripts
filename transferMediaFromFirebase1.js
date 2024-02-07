
const { destinationConnection } = require("./config");
const JSONStream = require("JSONStream");
const fs = require("fs");
function isValidDateTime(dateTimeString) {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  return dateTimeRegex.test(dateTimeString);
}

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
let totalRows=0

const insertMedia = async () => {
  const stream = fs.createReadStream("diveroidv2020_data.json", {
    encoding: "utf8",
  });

  const parser = JSONStream.parse("*");
  stream.pipe(parser);

  parser.on("data", async (obj) => {
    if (obj.userData) {
      for (const [userId, userDataObj] of Object.entries(obj.userData)) {
        if (userDataObj.media) {
            totalRows = totalRows + Object.keys(userDataObj.media).length;
          for (const [mediaId, mediaObj] of Object.entries(userDataObj.media)) {

            try {
              const idQuery = `SELECT id FROM logbooks WHERE FireBaseId='${mediaObj.logID}'`;
              const idResults = await new Promise((resolve, reject) => {
                destinationConnection.query(
                  idQuery,
                  (error, idResults, fields) => {
                    if (error) {
                        throw(error)
                      reject(error);
                    } else {
                      resolve(idResults);
                    }
                  }
                );
              });

              console.log(idResults[0]?.id || `error in ${idQuery}`);

              if (idResults[0]?.id) {
                
                const createdAt =
                  mediaObj.createdDate?.slice(0, 19) ||
                  new Date().toISOString().slice(0, 19).replace("T", " ");
                  let formattedDate = createdAt;
                  if(!isValidDateTime(createdAt)){
                    formattedDate = new Date().toISOString().slice(0, 19).replace("T", " ");
                  }
                const diveValues = [
                  idResults[0]?.id,
                  mediaObj.depth,
                  formattedDate,
                ];
                try{


                const diveTimeQuery = `INSERT INTO logdepthtimes (LogbookId, Depth, Time) VALUES (?)`;
                const diveTimeResults = await new Promise((resolve, reject) => {
                  destinationConnection.query(
                    diveTimeQuery,
                    [diveValues],
                    (error, diveTimeResults, fields) => {
                      if (error) {
                        throw(error)
                        reject(error);
                      } else {
                        console.log("Logdepthtime", diveTimeResults);
                        resolve(diveTimeResults);
                      }
                    }
                  );
                });

                if (diveTimeResults) {
                  const mediaValues = [
                    diveTimeResults?.insertId,
                    "image",
                    mediaObj.fileName,
                    mediaObj.fileName,
                    0,
                    mediaObj.mediaLike,
                    mediaObj.temperature,
                    formattedDate,
                    formattedDate,
                  ];
                
                  const logMediaQuery = `INSERT INTO logbookmedia (${destinationColumns.join(
                    ", "
                  )}) VALUES (?)`;
                  const logMediaResults = await new Promise(
                    (resolve, reject) => {
                      destinationConnection.query(
                        logMediaQuery,
                        [mediaValues],
                        (error, logMediaResults, fields) => {
                          if (error) {
                            throw(error)
                            reject(error);
                          } else {
                            console.log("Logbook media", logMediaResults);
                            resolve(logMediaResults);
                          }
                        }
                      );
                    }
                  );

                }
                else{
                }
            }catch(error){
                throw(error)
            }
              } else {
                
              }
            
            } catch (error) {
                throw(error)
              console.error(error);
            }
          }
          
        }

        else{

        }
        
      }
      console.log('loop completed')
     
      console.log(totalRows)
      
    }
    else{
    }
  });

  parser.on("end", () => {
    console.log("Parsing JSON completed.");
  });

  parser.on("error", (error) => {
    console.error("Error parsing JSON:", error);
  });
};

module.exports = insertMedia;
