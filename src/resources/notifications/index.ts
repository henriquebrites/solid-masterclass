import { type SendNotificationStrategy } from "../../application/ports/SendNotificationStrategy.js";

export class SendWhatsAppNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve();
  }
}

export class SendEmailNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve();
  }
}

export class SendSMSNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve();
  }
}

export class SendPushNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve();
  }
}
