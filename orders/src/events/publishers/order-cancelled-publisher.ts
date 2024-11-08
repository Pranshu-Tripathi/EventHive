import { OrderCancelledEvent, Publisher, Subjects } from "@eventhive/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
