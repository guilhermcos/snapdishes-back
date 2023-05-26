import fs from "fs";
import { google } from "googleapis";

const GOOGLE_API_FOLDER_ID = "1ffRJ3F05_Hnt44cT0dPYNJxfkNHntGEh";

//https://drive.google.com/uc?id=17AITh0dFgg9oby8yiBwMi4fXtukYQybO

export async function uploadFile(fileName, fileMimeType, imageContent) {
  try {
    //config da autorização
    const auth = new google.auth.GoogleAuth({
      keyFile: "./googleDriveKey.json",
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    //
    const driveService = google.drive({
      version: "v3",
      auth,
    });

    const fileMetaData = {
      name: fileName, //nome que será salvo
      parents: [GOOGLE_API_FOLDER_ID], //id da pasta do google drive
    };

    const media = {
      mimeType: fileMimeType, // tipo de arquivo, no caso uma imagem jpg
      body: imageContent, //arquivo em buffer
    };

    const response = await driveService.files.create({
      resource: fileMetaData,
      media: media,
      fields: "id",
    });

    return response.data.id;
  } catch (err) {
    console.log(err.message);
  }
}

// export async function uploadFile() {
//   try {
//     //config da autorização
//     const auth = new google.auth.GoogleAuth({
//       keyFile: "./googleDriveKey.json",
//       scopes: ["https://www.googleapis.com/auth/drive"],
//     });

//     //
//     const driveService = google.drive({
//       version: "v3",
//       auth,
//     });

//     const fileMetaData = {
//       name: "imagemdarua.jpg", //nome que será salvo
//       parents: [GOOGLE_API_FOLDER_ID], //id da pasta do google drive
//     };

//     const media = {
//       mimeType: "image/jpg", // tipo de arquivo, no caso uma imagem jpg
//       body: fs.createReadStream("./imagemdarua.jpg"), //caminho do arquivo, utilizando o fs para indicar o caminho
//     };

//     const response = await driveService.files.create({
//       resource: fileMetaData,
//       media: media,
//       fields: "id",
//     });

//     return response.data.id;
//   } catch (err) {
//     console.log(err.message);
//   }
// }
