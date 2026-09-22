import { describe, expect, it } from "vitest";

import { SendEmailNotification, SendPushNotification, SendSMSNotification, SendWhatsAppNotification } from "./index";
import { SendNotificationFactory } from "./SendNotificationFactory";

describe("SendNotificationFactory", () => {
  it.each([
    ["email", SendEmailNotification],
    ["sms", SendSMSNotification],
    ["push", SendPushNotification],
    ["whatsapp", SendWhatsAppNotification],
  ] as const)("creates a %s strategy instance", (channel, strategyClass) => {
    const factory = new SendNotificationFactory();

    const strategy = factory.create(channel);

    expect(strategy).toBeInstanceOf(strategyClass);
  });

  it("throws an error for an unsupported channel", () => {
    const factory = new SendNotificationFactory();

    expect(() => factory.create("carrier-pigeon")).toThrow("Invalid channel");
  });
});
