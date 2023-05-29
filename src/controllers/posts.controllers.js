import { uploadFile } from "../uploads/driver.uploads.js";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { db } from "../database/database.connection.js";
import { createNewPost } from "../repositories/posts.repositories.js";

export default class PostsControllers {
  async getPostsForFeed(req, res) {
    const { userId } = res.locals;
    try {
      const result =
        (
          await db.query(
            `
        SELECT "users"."id" AS "userId",
        "users"."userName" AS "userName",
        "users"."avatarImg" AS "avatarImg",
        "posts"."id" AS "postId",
        "posts"."imageUrl" AS "postImgUrl",
        "posts"."caption" AS "postCaption",
        "likes"."userId" AS "likerId",
        (SELECT CAST(COUNT("likes"."id") AS INTEGER) FROM likes WHERE "posts"."id" = "likes"."postId") AS "likesCount"
        FROM users
        JOIN follows ON "follows"."userId" = users.id
        JOIN posts ON "posts"."userId" = "users"."id"
        LEFT JOIN likes ON "likes"."userId" = "follows"."followerUserId" AND "likes"."postId" = "posts"."id"
        WHERE "follows"."followerUserId" = $1
        ORDER BY "posts"."id" DESC
      `,
            [userId]
          )
        ).rows ?? [];
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

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

      await createNewPost(userId, url, caption);

      return res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}
