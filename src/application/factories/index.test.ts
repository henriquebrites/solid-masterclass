import { describe, expect, it } from "vitest";

import {
  SendEmailNotification,
  SendPushNotification,
  SendSMSNotification,
  SendWhatsAppNotification,
} from "../../resources/notifications";
import { SendNotificationFactory } from "./index";

describe("SendNotificationFactory", () => {
  it.each([
    ["email", SendEmailNotification],
    ["sms", SendSMSNotification],
    ["push", SendPushNotification],
    ["whatsapp", SendWhatsAppNotification],
  ] as const)("creates a %s strategy instance", (channel, strategyClass) => {
    const strategy = SendNotificationFactory.create(channel);

    expect(strategy).toBeInstanceOf(strategyClass);
  });

  it("throws an error for an unsupported channel", () => {
    expect(() => SendNotificationFactory.create("carrier-pigeon")).toThrow(
      "Invalid channel",
    );
  });
});
