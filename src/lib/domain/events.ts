export interface DomainEvent {
  id: string;
  tenantId: string;
  name: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

type EventListener = (event: DomainEvent) => void;

export class InternalEventBus {
  private static instance: InternalEventBus;
  private listeners: Map<string, EventListener[]> = new Map();

  public static getInstance(): InternalEventBus {
    if (!InternalEventBus.instance) {
      InternalEventBus.instance = new InternalEventBus();
    }
    return InternalEventBus.instance;
  }

  public subscribe(eventName: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(listener);

    return () => {
      const current = this.listeners.get(eventName) || [];
      this.listeners.set(
        eventName,
        current.filter((l) => l !== listener)
      );
    };
  }

  public publish(event: DomainEvent): void {
    const handlers = this.listeners.get(event.name) || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (err) {
        console.error(`Error handling event ${event.name}:`, err);
      }
    }
  }
}
