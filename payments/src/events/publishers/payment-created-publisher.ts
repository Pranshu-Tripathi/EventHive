import { Subjects, PaymentCreatedEvent, Publisher } from "@eventhive/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
