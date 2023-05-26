import { Router } from "express";
import AuthControllers from "../controllers/auth.controllers.js";
import AuthValidations from "../middlewares/auth.validations.js";
import authSchemas from "../schemas/auth.schemas.js";
import { validateSchemaBody } from "../middlewares/schema.validations.js";

const authControllers = new AuthControllers();
const authValidations = new AuthValidations();

const authRouter = Router();

authRouter.post(
  "/signup",
  validateSchemaBody(authSchemas.schemaSignUp),
  authValidations.validateSignUp,
  authControllers.signUp
);
authRouter.post(
  "/signin",
  validateSchemaBody(authSchemas.schemaLogin),
  authValidations.validateLogin,
  authControllers.login
);

export default authRouter;
