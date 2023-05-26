import { compareSync } from "bcrypt";
import { findUserForLogin } from "../repositories/users.repositories.js";

export default class AuthValidations {
  async validateSignUp(req, res, next) {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(422).send("password and confirmPassword must be the same");
    }
    next();
  }

  async validateLogin(req, res, next) {
    const { email, password } = req.body;
    try {
      const user = await findUserForLogin(email);
      if (!user.rows.length) {
        return res.sendStatus(401);
      }
      const { userId, hashedPassword } = user.rows[0];

      const passwordValidate = compareSync(password, hashedPassword);
      if (!passwordValidate) return res.sendStatus(401);

      res.locals.userId = userId;
      next();
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}
