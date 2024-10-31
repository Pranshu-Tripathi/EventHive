import express, { Request, Response } from "express";

const router = express.Router();

router.get("/api/orders/:orderId", (req: Request, res: Response) => {
  res.send("Order show route");
});

export { router as showOrderRouter };
