import mongoose from "mongoose";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@eventhive/common";
import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  // [
  //   body("orderId")
  //     .not()
  //     .isEmpty()
  //     .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
  //     .withMessage("Valid orderId must be provided"),
  // ],
  // validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.status(200).send(order);
  }
);

export { router as showOrderRouter };
