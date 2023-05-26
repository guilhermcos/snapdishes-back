import { uploadFile } from "../uploads/driver.uploads.js";
import { v4 as uuid } from "uuid";
import { db } from "../database/database.connection.js";
import fs from "fs";
import { updateAvatarImg } from "../repositories/users.repositories.js";

export default class UsersControllers {
  async setAvatarImage(req, res) {
    const file = req.file;
    const { userId } = res.locals;

    try {
      const hash = uuid();
      const fileHashedName = `${hash}_${file.originalname}`;
      const fileMimeType = file.mimetype;
      const filePath = req.file.path;
      const fileContent = fs.createReadStream(filePath);
      if (!file || !fileMimeType.startsWith("image/")) {
        return res.status(400).send("Only image files allowed!");
      }

      const fileId = await uploadFile(fileHashedName, fileMimeType, fileContent);
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Erro ao excluir o arquivo temporário:", err);
          }
        });
      }
      const url = `https://drive.google.com/uc?id=${fileId}`;

      await updateAvatarImg(url, userId);

      res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}
