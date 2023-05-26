import { db } from "../database/database.connection.js";

export default async function tokenValidation(req, res, next) {
  const reqToken = req.headers.authorization?.replace("Bearer ", "");
  if (!reqToken) return res.sendStatus(401);
  try {
    const { userId } =
      (
        await db.query(
          `
        SELECT "userId" FROM sessions WHERE token = $1
        `,
          [reqToken]
        )
      )?.rows[0] ?? {};
    if (!userId) return res.sendStatus(401);

    res.locals.userId = userId;

    next();
  } catch (err) {
    res.status(500).send(err.message);
  }
}