import { Router } from "express";
import UsersControllers from "../controllers/users.controllers.js";
import tokenValidation from "../middlewares/token.validation.js";
import multer from "multer";

const usersControllers = new UsersControllers();
const userRouter = Router();
const upload = multer({ dest: "uploads/" });

userRouter.post(
  "/upload/avatarimage",
  tokenValidation,
  upload.single("image"),
  usersControllers.setAvatarImage
);

export default userRouter;
