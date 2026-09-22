import { type SendNotificationStrategy } from "./SendNotificationStrategy.js";

export interface NotificationFactory {
  create(channel: string): SendNotificationStrategy;
}
