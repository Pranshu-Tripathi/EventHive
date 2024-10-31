import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "../../models/order";

it("marks an order as cancelled", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const user = global.signup();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  const updatedOrder = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(updatedOrder.body.status).toEqual(OrderStatus.Cancelled);
});

it.todo("emits an order cancelled event");
