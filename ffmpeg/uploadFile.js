                   // before we trimmed the video we need to upload the file on node server 
                  // here we upload the input video file in tmp directory of server

                  const  uplodFile=(file)=>{
                                return new Promise((resolve,reject)=>{
                                 // console.log("uploade",file)
                                  // here we move the file in tmp directory
                                  file.mv("tmp/" + file.name,  (err)=> {
                                  if (err) {
                                    reject(err)
                                    return  // reject if there is eror occur
                                  } else{
                                  console.log("File Uploaded successfully");
                                  resolve(true)  // reolve if file uploaded 
                                  }
                                  });
                                 })
                      }
            module.exports = uplodFile