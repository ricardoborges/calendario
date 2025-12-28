import { writable } from 'svelte/store';

export interface CalendarEvent {
    id: string;
    date: string; // formato: YYYY-MM-DD
    text: string;
    bgColor?: string; // cor de fundo
    textColor?: string; // cor do texto
}

function createEventsStore() {
    const { subscribe, set, update } = writable<CalendarEvent[]>([]);

    return {
        subscribe,
        add: (event: Omit<CalendarEvent, 'id'>) => {
            update(events => [
                ...events,
                { ...event, id: crypto.randomUUID() }
            ]);
        },
        update: (id: string, data: Partial<Omit<CalendarEvent, 'id'>>) => {
            update(events =>
                events.map(e => (e.id === id ? { ...e, ...data } : e))
            );
        },
        remove: (id: string) => {
            update(events => events.filter(e => e.id !== id));
        },
        getByDate: (events: CalendarEvent[], year: number, month: number, day: number): CalendarEvent[] => {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return events.filter(e => e.date === dateStr);
        },
        clear: () => set([])
    };
}

export const eventsStore = createEventsStore();

// Store para controlar o modo de edição
export const editMode = writable(false);

// Store para a data selecionada (para edição via clique no calendário)
export const selectedDate = writable<{ year: number; month: number; day: number } | null>(null);
