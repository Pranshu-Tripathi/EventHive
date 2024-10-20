import express, { Request, Response } from "express";
import { currentuser } from "../middlewares/currentuser";

const router = express.Router();

router.get(
  "/api/users/currentuser",
  currentuser,
  (req: Request, res: Response) => {
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
