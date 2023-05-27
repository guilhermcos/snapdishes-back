import { Router } from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./users.routes.js";
import postsRouter from "./posts.routes.js";

const router = Router();

router.use(authRouter);
router.use(userRouter);
router.use(postsRouter);

export default router;
