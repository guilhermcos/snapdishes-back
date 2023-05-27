import { uploadFile } from "../uploads/driver.uploads.js";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { db } from "../database/database.connection.js";

export default class PostsControllers {
  async createPost(req, res) {
    const file = req.file;
    const { userId } = res.locals;
    const caption = req.body?.caption || null;

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

      await db.query(
        `
            INSERT INTO posts ("userId", "imageUrl", "caption") VALUES ($1, $2, $3)
        `,
        [userId, url, caption || null]
      );

      return res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}
