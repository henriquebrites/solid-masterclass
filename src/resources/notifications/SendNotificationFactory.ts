import { type NotificationFactory } from "../../application/ports/NotificationFactory.js";
import { type SendNotificationStrategy } from "../../application/ports/SendNotificationStrategy.js";
import { SendEmailNotification, SendPushNotification, SendSMSNotification, SendWhatsAppNotification } from "./index.js";

export class SendNotificationFactory implements NotificationFactory {
  create(channel: string): SendNotificationStrategy {
    switch (channel) {
      case "email":
        return new SendEmailNotification();
      case "sms":
        return new SendSMSNotification();
      case "push":
        return new SendPushNotification();
      case "whatsapp":
        return new SendWhatsAppNotification();
      default:
        throw new Error("Invalid channel");
    }
  }
}
