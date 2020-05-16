			var ffmpeg = require('fluent-ffmpeg');
			var uploadFile = require('./uploadFile')
			ffmpeg.setFfprobePath("./ffmpeg-path/bin/ffprobe.exe")


			const validator = (req) => {
			 
			  return new Promise((resolve,reject)=>{
			  	if( !req.files || !req.body.startTime || !req.body.endTime){
			  		reject('insufficient inputs')
			  		return
			  	} else {
					  		let file      = req.files.file;
					        let startTime = req.body.startTime;
					        let endTime   = req.body.endTime

					        console.log(file)
			             // check valid video file type or not
			              let err = validateVideoType(file.mimetype)
			                if(err!==true){
			                	reject (err);
			                	return;
			                }

			             // upload the file on server's tmp directory
			             uploadFile(file).then(data=>{

			             	// here we get the video information about duration and size to validate startTime and endTime
			             	ffmpeg.ffprobe("tmp/" + file.name, function(err, metadata) {

			             	if(err){
			             		console.log('err 2',err)
			                    reject(err)
			                    return;
			             	}

			                console.log(metadata);
			                
			               // pass data for validation video
			                let data={
			                	startTime:startTime,
			                	endTime:endTime,
			                	size:metadata.format.size,
			                	duration:metadata.format.duration
			                }

			                // check video input validation
			                let errors = videoValidation(data);
			                if(errors!==true){
			                	reject (errors);
			                	return;
			                }
                            resolve(true)
			                });
			                
			             	}).catch(err=>{
			                console.log('err 2',err)
			                reject(err)
			                return;
			              })
			             }
			  })

			}

			const validateVideoType=(mimetype)=>{
			var array=[
			'video/x-flv',
			'video/mp4',
			'application/x-mpegURL',
			'video/MP2T',
			'video/3gpp',
			'video/quicktime',
			'video/x-msvideo',
			'video/x-ms-wmv',
			'video/ogg',
			'video/mpeg',
			'video/mp2t',
			'video/3gpp2',
			'application/x-mpegurl',
			'video/webm',
			'video/x-m4v',
			'video/ms-asf',
			'video/x-ms-wmv',
			'video/x-msvideo']
			if(mimetype.includes('video') || array.indexOf(mimetype)!=-1){

				return true;

			} else{
                console.log('please enter valid video')
				return 'please enter valid video';
			}
		}

			const videoValidation=(data)=>{
				let { size,startTime,endTime,duration} = data;
				startTime = timeConversion(startTime);
				endTime   = timeConversion(endTime);

				// here check for size not more than 20 mb 
				if(size >=0 || size/(1024*1024) <= 20){
			      if(startTime >= duration || startTime==endTime || startTime <0){
			      	console.log('valid startTime')
			      	return 'valid startTime'
			      }    
			      
			      if( !startTime || !endTime){
			      	console.log('enter time in HH:MM:SS')
			      	return 'enter time in HH:MM:SS';
			      }

			      if(endTime < startTime || endTime==startTime || endTime > duration || endTime<0){
			      	console.log('enter valid endTime')
			      	return 'enter valid endTime'
			      }
			      
			      return true

				} else{
					console.log('size should be less than 20 mb')
					return 'size should be less than 20 mb'
				}
				
			}


			const timeConversion = (timestamp)=>{
				var hms = timestamp;   // your input string
			    var a = hms.split(':'); // split it at the colons
			    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			    console.log(seconds);
			    return seconds
			}

			module.exports = validator
