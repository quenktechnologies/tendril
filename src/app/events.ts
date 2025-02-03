export type EventType = string;

export type EventListener = (event: Event) => Promise<void>;

/**
 * Event is a generic event originating from a tendril app (not the PVM).
 */
export interface Event {
    /**
     * type distinguishes the event.
     */
    type: EventType;
}

export class InitEvent {
    type = 'init';
}
export class ConnectedEvent {
    type = 'connected';
}
export class StartedEvent {
    type = 'started';
}

/**
 * EventDispatcher is a simple event dispatcher for tendril applications.
 */
export class EventDispatcher {
    constructor(
        public listeners: Map<EventType, Set<EventListener>> = new Map()
    ) {}

    /**
     * addListener adds a listener for a specific event type.
     *
     * A listener can only be added once for a specific event type.
     */
    addListener(type: EventType, listener: EventListener) {
        let target = this.listeners.get(type) ?? new Set();
        target.add(listener);
        this.listeners.set(type, target);
    }

    /**
     * removeListener removes a single listener for a specific event type.
     */
    removeListener(type: EventType, listener: EventListener) {
        let target = this.listeners.get(type);
        if (target) {
            target.delete(listener);
        }
    }

    /**
     * removeListeners removes all listeners for a specific event type.
     */
    removeListeners(type: EventType) {
        this.listeners.delete(type);
    }

    /**
     * dispatch an event to all listeners.
     */
    async dispatch(event: Event) {
        let target = this.listeners.get(event.type);
        if (target) {
            for (let listener of target) {
                await listener(event);
            }
        }
    }
}
