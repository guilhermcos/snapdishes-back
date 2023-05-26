import { hashSync } from "bcrypt";
import { db } from "../database/database.connection.js";

export async function createNewUser(body) {
  const { name, userName, email, password } = body;
  const hashedPassword = hashSync(password, 10);

  return await db.query(
    `
      INSERT INTO users (name, "userName", email, password) VALUES ($1, $2, $3, $4);
    `,
    [name, userName, email, hashedPassword]
  );
}

export async function createSession(userId, token) {
  return await db.query(
    `
      INSERT INTO sessions ("userId", token) VALUES ($1, $2)
    `,
    [userId, token]
  );
}

export async function findUserForLogin(email) {
  return await db.query(
    `
      SELECT id AS "userId", password AS "hashedPassword" FROM users WHERE $1 = users.email
    `,
    [email]
  );
}

export async function updateAvatarImg(url, userId) {
  return await db.query(
    `
      UPDATE users SET "avatarImg" = $1 WHERE "id" = $2
    `,
    [url, userId]
  );
}
