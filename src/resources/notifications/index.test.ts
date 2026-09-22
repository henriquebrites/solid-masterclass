import { describe, expect, it } from "vitest";

import { SendEmailNotification, SendPushNotification, SendSMSNotification, SendWhatsAppNotification } from "./index";

describe.each([
  ["email", SendEmailNotification],
  ["sms", SendSMSNotification],
  ["push", SendPushNotification],
  ["whatsapp", SendWhatsAppNotification],
] as const)("%s notification strategy", (_channel, StrategyClass) => {
  it("resolves without throwing when sending", async () => {
    const strategy = new StrategyClass();

    await expect(strategy.send()).resolves.toBeUndefined();
  });
});
