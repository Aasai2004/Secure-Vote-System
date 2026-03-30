import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import adminRouter from "./admin";
import votingRouter from "./voting";
import resultsRouter from "./results";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/voting", votingRouter);
router.use("/results", resultsRouter);

export default router;
