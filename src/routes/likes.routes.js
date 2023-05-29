import { Router } from "express";
import LikesControllers from "../controllers/likes.controllers.js";
import tokenValidation from "../middlewares/token.validation.js";

const likesControllers = new LikesControllers();

const likesRouter = Router();

likesRouter.post("/likes/like/:id", tokenValidation, likesControllers.likePost);
likesRouter.post("/likes/unlike/:id", tokenValidation, likesControllers.unlikePost);

export default likesRouter;
