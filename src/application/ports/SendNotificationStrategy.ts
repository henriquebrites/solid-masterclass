// Strategy Pattern

export interface SendNotificationStrategy {
  send(): Promise<void>;
}
