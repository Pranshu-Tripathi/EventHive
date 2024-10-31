import express, { Request, Response } from "express";

const router = express.Router();

router.delete("/api/orders/:orderId", (req: Request, res: Response) => {
  res.send("Orders delete route");
});

export { router as deleteOrderRouter };
