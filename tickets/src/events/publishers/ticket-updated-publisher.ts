import { Publisher, Subjects, TicketUpdatedEvent } from "@eventhive/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
