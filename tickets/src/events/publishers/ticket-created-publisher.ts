import { Publisher, Subjects, TicketCreatedEvent } from "@eventhive/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
