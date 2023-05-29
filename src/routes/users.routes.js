import { Router } from "express";
import UsersControllers from "../controllers/users.controllers.js";
import tokenValidation from "../middlewares/token.validation.js";
import multer from "multer";

const usersControllers = new UsersControllers();
const usersRouter = Router();
const upload = multer({ dest: "uploads/" });

usersRouter.post(
  "/upload/avatarimage",
  tokenValidation,
  upload.single("image"),
  usersControllers.setAvatarImage
);
usersRouter.get("/users/me", tokenValidation, usersControllers.getSelfProfile);
usersRouter.get("/users/search/:searchString", tokenValidation, usersControllers.searchUsers);
usersRouter.get("/users/profile/:id", tokenValidation, usersControllers.getProfileInfo);
usersRouter.get("/users/followers", tokenValidation, usersControllers.getSelfFollowers);
usersRouter.get("/users/followings", tokenValidation, usersControllers.getSelfFollowings);
usersRouter.post("/users/follow/:id", tokenValidation, usersControllers.followUser);
usersRouter.post("/users/unfollow/:id", tokenValidation, usersControllers.unfollowUser);
usersRouter.post("/users/upload/biography", tokenValidation, usersControllers.uploadBiography);

export default usersRouter;
