import {
  Subjects,
  ExpirationCompleteEvent,
  Publisher,
} from "@eventhive/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
