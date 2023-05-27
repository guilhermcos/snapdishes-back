import { Router } from "express";
import PostsControllers from "../controllers/posts.controllers.js";
import multer from "multer";
import tokenValidation from "../middlewares/token.validation.js";

const postControllers = new PostsControllers();
const upload = multer({ dest: "uploads/" });

const postsRouter = Router();

postsRouter.post(
  "/posts/create",
  tokenValidation,
  upload.single("image"),
  postControllers.createPost
);

export default postsRouter;
