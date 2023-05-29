import { db } from "../database/database.connection.js";

export default class LikesControllers {
  async likePost(req, res) {
    const { userId } = res.locals;
    const { id: postId } = req.params;
    try {
      await db.query(
        `
        INSERT INTO likes ("userId", "postId") VALUES ($1, $2)
        `,
        [userId, postId]
      );
      res.sendStatus(201);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  async unlikePost(req, res) {
    const { userId } = res.locals;
    const { id: postId } = req.params;
    try {
      await db.query(
        `
        DELETE FROM likes WHERE "userId" = $1 AND "postId" = $2
        `,
        [userId, postId]
      );
      res.sendStatus(204);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}
