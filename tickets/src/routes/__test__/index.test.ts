import request from "supertest";
import { app } from "../../app";

const createTicket = (title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({ title, price });
};

it("can fetch a list of tickets", async () => {
  await createTicket("ticket1", 10);
  await createTicket("ticket2", 20);
  await createTicket("ticket3", 30);

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
  expect(response.body[0].title).toEqual("ticket1");
  expect(response.body[0].price).toEqual(10);
  expect(response.body[1].title).toEqual("ticket2");
  expect(response.body[1].price).toEqual(20);
  expect(response.body[2].title).toEqual("ticket3");
  expect(response.body[2].price).toEqual(30);
});
