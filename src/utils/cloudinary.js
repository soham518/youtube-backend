import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


// Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:  process.env.CLOUDINARY_API_SECRET
    });

const uploadOnCloudinary = async (localFilePath) => {
    try{
      if(!localFilePath) return null
      //upload the file on cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
      });
      //file has been uploaded successfully.
      // console.log("file is uploaded on cloudinary ",response.url);
      //as file is uploaded we can delete from the local storage.
      fs.unlinkSync(localFilePath);
      // console.log(response); // check if cloudinary is giving response.
      return response;

    } catch(error) {
        //this will remove the locally saved temporary file as the upload operation got failed
     fs.unlinkSync(localFilePath)
     return null
    }
}


export {uploadOnCloudinary};