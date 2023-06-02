import { google } from "googleapis";

const GOOGLE_API_FOLDER_ID = process.env.GOOGLE_API_FOLDER_ID;

export async function uploadFile(fileName, fileMimeType, imageContent) {
  try {
    //config da autorização
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.PRIVATE_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    //
    const driveService = google.drive({
      version: "v3",
      auth,
    });

    const fileMetaData = {
      name: fileName,
      parents: [GOOGLE_API_FOLDER_ID],
    };

    const media = {
      mimeType: fileMimeType,
      body: imageContent,
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
