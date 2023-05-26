import { db } from "../database/database.connection.js";
import { v4 as uuid } from "uuid";
import { createNewUser, createSession } from "../repositories/users.repositories.js";

export default class AuthControllers {
  async signUp(req, res) {
    try {
      await createNewUser(req.body);
      return res.sendStatus(201);
    } catch (err) {
      if (err.code === "23505") {
        res.status(409).send("email already registered");
      } else {
        res.status(500).send(err.message);
      }
    }
  }

  async login(req, res) {
    const userId = res.locals.userId;
    try {
      const token = uuid();
      await createSession(userId, token);
      return res.status(200).send({ token });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}
