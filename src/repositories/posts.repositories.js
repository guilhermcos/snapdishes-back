import { db } from "../database/database.connection.js";

export async function createNewPost(userId, url, caption) {
  return await db.query(
    `
            INSERT INTO posts ("userId", "imageUrl", "caption") VALUES ($1, $2, $3)
        `,
    [userId, url, caption || null]
  );
}
