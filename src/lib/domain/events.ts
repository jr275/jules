export interface DomainEvent {
  id: string;
  tenantId: string;
  eventType: string;
  resource: string;
  resourceId: string;
  actor: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

type EventListener = (event: DomainEvent) => Promise<void> | void;

export class InternalEventBus {
  private static instance: InternalEventBus;
  private listeners: Map<string, EventListener[]> = new Map();

  public static getInstance(): InternalEventBus {
    if (!InternalEventBus.instance) {
      InternalEventBus.instance = new InternalEventBus();
    }
    return InternalEventBus.instance;
  }

  public subscribe(eventType: string, listener: EventListener): () => void {
    const existing = this.listeners.get(eventType) || [];
    this.listeners.set(eventType, [...existing, listener]);

    return () => {
      const current = this.listeners.get(eventType) || [];
      this.listeners.set(
        eventType,
        current.filter((l) => l !== listener)
      );
    };
  }

  public async publish(event: DomainEvent): Promise<void> {
    const listeners = this.listeners.get(event.eventType) || [];
    const wildcardListeners = this.listeners.get('*') || [];
    const allListeners = [...listeners, ...wildcardListeners];

    for (const listener of allListeners) {
      try {
        await listener(event);
      } catch (err) {
        console.error(`Error handling event ${event.eventType}:`, err);
      }
    }
  }
}
