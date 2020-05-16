            const express = require("express");  // require for server set-up

            const ffmpeg = require("fluent-ffmpeg");  // require for ffmpeg libray's command

            const bodyParser = require("body-parser"); // parse the request url encoded
 
            const fs = require("fs");                  // use for file handling

            var cors = require('cors');                // use to handle cors original problem 

            var path = require('path');                // handle the path configuration on node server

            const fileUpload = require("express-fileupload");   //When you upload a file, the file will be accessible from req.files
           
            const app = express();

            app.use(cors())    // here we apply the cors policy

            const validator = require("./validator")  // function use for validated the inputs

            // parse application/x-www-form-urlencoded
            app.use(bodyParser.urlencoded({ extended: false }));

            // parse application/json
            app.use(bodyParser.json());

            app.use(
                    fileUpload({
                      useTempFiles: true,
                      tempFileDir: "/tmp/",
                    })
                  );

          // ffmpeg.setFfmpegPath("./ffmpeg-path/bin/ffmpeg.exe");
          // ffmpeg.setFfprobePath("./ffmpeg-path/bin/ffprobe.exe");


          app.get("/", async (req, res) => {

            // here we rendering the html page  
            res.sendFile(__dirname + "/index.html");
            
          });

          //  here we process the request for trim the video
          // 1. we store the input file in temporary directory i.e tmp/ 
          // 2. the input file successfully uploaded in our tmp directory then we go for video triming
          // 3. in this step we trimmed the video by providing the required inputs
          // 4. after trimmed process we store the trimmed file in tmp directory 
          // 5. when video trimmed succesfully then we send the trim file for download on user system
          // 6. after download complete then we remove the video file from tmp directory

          app.post("/convert",async (req, res) => {
             
              //console.log(req)
              // validate the video inputs,size,type
              validator(req).then(validation=>{

               let file = req.files.file
               let startTime = req.body.startTime;
               let endTime   = req.body.endTime;
              // start the process for trim video
               trimVideo(file,startTime,endTime).then(fileName=>{

              // after succesfully trim the video we send it for downlod on system 
                res.download(path.join(__dirname, fileName), function (err) {
                                    if (err) {
                                        console.log('err 3',err)
                                            res.json({
                                            status:0,
                                            statusCode:400,
                                            message:err
                                          })
                                        return;
                                    }
                                    else{

                                          // please comment this code if you do not want to delete the file from server
                                          //[ start of code
                                          fs.unlink("tmp/" + file.name, function (err) {

                                          // delete the uploaded orginal file

                                          if (err) {
                                              console.log('err 4',err)
                          
                                              return;
                                              }
                                          console.log("File deleted");
                                        });

                                          fs.unlink(path.join(__dirname, fileName), function (err) {
                                           
                                           // delete the trimmed video file
                                          if (err) {
                                              console.log('err 4',err)
                                              return;
                                              }
                                          console.log("File deleted");
                                        });

                                       // end of code ]
                                        
                                     } 

                                  })
                                  
              }).catch(err=>{
                console.log('err 1',err)
                        res.json({
                        status:0,
                        statusCode:400,
                        message:err
                      })
              })
            }).catch(err=>{

                  res.json({
                    status:0,
                    statusCode:400,
                    message:err
                  })

            })
             

          });


// here we trim or slice the video by providing the inputs 
         const trimVideo=(file,startTime,endTime) => {
                                  return new Promise((resolve,reject)=>{
                                  
                                  let difference = timeConversion(endTime)-timeConversion(startTime)
                                         endTime =   toHHMMSS(difference) // here the ffmpeg libray take second argumnet as duration so we manage the endtime accordingly
                                  var pathFolder = 'tmp';  // where we store the trimmed video 
                                  let fileName = `trim${Date.now()+file.name}`; // trimmed file name 

                                  console.log(file);

                                  var command = new ffmpeg({         // we create ffmpeg command by providing uploaded original file
                                    source: "tmp/" + file.name
                                  });

                                  command.setFfmpegPath("./ffmpeg-path/bin/ffmpeg.exe");  // here we set the ffmpeg environment variable path
                                  
                                  command.setStartTime(startTime).setDuration(endTime).on('end', function(data) {
                                   console.log(data)
                                      resolve(pathFolder + '/'+fileName)  // promise reolved with trimmed video file's path
                                  }).on('error', function(err, stdout, stderr) {
                                    console.log(err, stderr);   // if there is error occur during  trim process
                                    reject(err)                 // reject error
                                  }).save(pathFolder + '/'+fileName);  // here we save the trimmed video file 
                                     
                                })
                                          
         }

         const timeConversion = (timestamp)=>{
          var hms = timestamp;   // your input string
          var a = hms.split(':'); // split it at the colons
          var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
          console.log(seconds);
          return seconds
      }

      var toHHMMSS = (secs) => {
        var sec_num = parseInt(secs, 10)
        var hours   = Math.floor(sec_num / 3600)
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
      }

        app.listen(3000,()=>{
          console.log('server is listen at 3000')
        });