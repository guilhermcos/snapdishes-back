import { uploadFile } from "../uploads/driver.uploads.js";
import { v4 as uuid } from "uuid";
import { db } from "../database/database.connection.js";
import fs from "fs";
import { updateAvatarImg } from "../repositories/users.repositories.js";

export default class UsersControllers {
  async uploadBiography(req, res) {
    const { userId } = res.locals;
    const { biography } = req.body;
    try {
      await db.query(
        `
      UPDATE users SET "biography" = $1 WHERE "users"."id" = $2
      `,
        [biography, userId]
      );
      res.sendStatus(201);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async followUser(req, res) {
    const { userId } = res.locals;
    const { id: profileId } = req.params;
    try {
      await db.query(
        `
      INSERT INTO "follows" ("userId", "followerUserId") VALUES ($1, $2)
      `,
        [profileId, userId]
      );
      res.sendStatus(201);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async unfollowUser(req, res) {
    const { userId } = res.locals;
    const { id: profileId } = req.params;
    try {
      await db.query(
        `
      DELETE FROM follows WHERE "follows"."userId" = $1 AND "follows"."followerUserId" = $2
      `,
        [profileId, userId]
      );
      res.sendStatus(201);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async getProfileInfo(req, res) {
    const { userId } = res?.locals ?? {};
    const { id: profileId } = req.params;

    try {
      const response = await db.query(
        `
      SELECT "users"."id", "users"."userName", "avatarImg", "users"."biography",
          (SELECT CAST(COUNT("followerUserId") AS INTEGER) FROM follows WHERE "follows"."userId" = $1) AS "followersCount",
          (SELECT CAST(COUNT("follows") AS INTEGER) FROM follows WHERE "follows"."followerUserId" = $1) AS "followingCount",
          (SELECT ARRAY_AGG(
                      JSON_BUILD_OBJECT(
                        'id', "posts"."id",
                        'imageUrl', "posts"."imageUrl",
                        'caption', "posts"."caption",
                        'likesCount', (SELECT COUNT("likes"."id") FROM likes WHERE "posts"."id" = "likes"."postId")
                      ) ORDER BY "posts"."id" DESC
                  ) FROM posts WHERE "posts"."userId" = $1) AS posts,

          (SELECT ARRAY_AGG(
                      "likes"."postId"
                  ) FROM likes WHERE "likes"."userId" = $2) AS "likedPosts",
          (SELECT CAST(COUNT("follows"."id") AS INTEGER) FROM follows WHERE "follows"."userId" = $1 AND "follows"."followerUserId" = $2) AS "isFollowed"
          FROM users 
          LEFT JOIN follows ON "follows"."userId" = "users"."id" OR "follows"."followerUserId" = "users"."id"
          WHERE "users"."id" = $1
          GROUP BY "users"."id", "userName", "avatarImg"
      `,
        [profileId, userId]
      );
      res.status(200).send(response);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async getSelfProfile(req, res) {
    const { userId } = res?.locals ?? {};
    try {
      const response = await db.query(
        `
          SELECT "users"."id", "userName", "avatarImg","biography",
          (SELECT CAST(COUNT("followerUserId") AS INTEGER) FROM follows WHERE "follows"."userId" = $1) AS "followersCount",
          (SELECT CAST(COUNT("follows") AS INTEGER) FROM follows WHERE "follows"."followerUserId" = $1) AS "followingCount",
          (SELECT ARRAY_AGG(
                      JSON_BUILD_OBJECT(
                        'id', "posts"."id",
                        'imageUrl', "posts"."imageUrl",
                        'caption', "posts"."caption",
                        'likesCount', (SELECT COUNT("likes"."id") FROM likes WHERE "posts"."id" = "likes"."postId")
                      ) ORDER BY "posts"."id" DESC
                  ) FROM posts WHERE "posts"."userId" = $1) AS posts,

          (SELECT ARRAY_AGG(
                      "likes"."postId"
                  ) FROM likes WHERE "likes"."userId" = $1) AS "likedPosts"

          FROM users 
          LEFT JOIN follows ON "follows"."userId" = "users"."id" OR "follows"."followerUserId" = "users"."id"
          WHERE "users"."id" = $1
          GROUP BY "users"."id", "userName", "avatarImg"
        `,
        [userId]
      );
      res.status(200).send(response);
    } catch (err) {
      console.log(err.message);
    }
  }

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

  async searchUsers(req, res) {
    const { searchString } = req.params;
    try {
      const result =
        (
          await db.query(
            `
              SELECT "id","userName", "avatarImg", "name",
                CASE
                    WHEN "users"."email" = $1 THEN 100
                    WHEN "users"."userName" = $1 THEN 90
                    ELSE (SIMILARITY("email", $1) * 100) + (SIMILARITY("userName", $1) * 90)
                END AS score
              FROM users
              WHERE "email" ILIKE '%' || $1 || '%'
                OR "userName" ILIKE '%' || $1 || '%'
              ORDER BY score DESC;
            `,
            [searchString]
          )
        )?.rows ?? [];
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}
