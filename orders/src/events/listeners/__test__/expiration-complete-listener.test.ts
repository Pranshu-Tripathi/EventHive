import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteEvent } from "@eventhive/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";

const setup = async () => {
  const listner = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: "asdasd",
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listner, order, ticket, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { listner, order, data, msg } = await setup();

  await listner.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an OrderCancelled event", async () => {
  const { listner, order, data, msg } = await setup();
  jest.clearAllMocks();

  await listner.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it("acks the message", async () => {
  const { listner, data, msg } = await setup();

  await listner.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
