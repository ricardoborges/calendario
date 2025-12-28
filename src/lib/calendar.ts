/**
 * Utilitários do calendário
 */

export interface CalendarOptions {
    year: number;
    layout: 'default' | 'aligned-weekdays';
    sofshavua: boolean; // Fim de semana hebraico (sexta-sábado)
}

export interface DayInfo {
    day: number;
    dayOfWeek: number; // 1-7 (Segunda-Domingo)
    isWeekend: boolean;
    dayName: string;
}

const MONTH_NAMES = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const DAY_NAMES = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

/**
 * Obtém o número de dias em um mês
 */
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

/**
 * Obtém o dia da semana (1-7, Segunda-Domingo) para uma data
 */
export function getDayOfWeek(year: number, month: number, day: number): number {
    const date = new Date(year, month - 1, day);
    const dow = date.getDay();
    // Converte de 0-6 (Domingo-Sábado) para 1-7 (Segunda-Domingo)
    return dow === 0 ? 7 : dow;
}

/**
 * Obtém o primeiro dia da semana de cada mês (1-7, Segunda-Domingo)
 */
export function getFirstWeekdays(year: number): number[] {
    const firstWeekdays: number[] = [];
    for (let month = 1; month <= 12; month++) {
        firstWeekdays.push(getDayOfWeek(year, month, 1));
    }
    return firstWeekdays;
}

/**
 * Obtém a abreviação do dia da semana (1-7)
 */
export function getShortDayName(dayOfWeek: number): string {
    return DAY_NAMES[dayOfWeek - 1];
}

/**
 * Obtém a abreviação do nome do mês
 */
export function getMonthName(month: number): string {
    return MONTH_NAMES[month - 1];
}

/**
 * Verifica se o dia é fim de semana
 */
export function isWeekend(dayOfWeek: number, sofshavua: boolean = false): boolean {
    if (sofshavua) {
        // Fim de semana hebraico: Sexta (5) e Sábado (6)
        return dayOfWeek === 5 || dayOfWeek === 6;
    }
    // Fim de semana padrão: Sábado (6) e Domingo (7)
    return dayOfWeek === 6 || dayOfWeek === 7;
}

/**
 * Gera informações do dia para uma data específica
 */
export function getDayInfo(year: number, month: number, day: number, sofshavua: boolean = false): DayInfo | null {
    const daysInMonth = getDaysInMonth(year, month);
    if (day > daysInMonth) {
        return null;
    }

    const dayOfWeek = getDayOfWeek(year, month, day);
    return {
        day,
        dayOfWeek,
        isWeekend: isWeekend(dayOfWeek, sofshavua),
        dayName: getShortDayName(dayOfWeek)
    };
}

/**
 * Gera a matriz de datas para o layout aligned-weekdays
 * Retorna um array de 12 meses onde cada mês tem 42 slots (6 semanas x 7 dias)
 */
export function generateAlignedDatesMatrix(year: number): number[][] {
    const matrix: number[][] = [];
    const firstWeekdays = getFirstWeekdays(year);

    for (let month = 1; month <= 12; month++) {
        const monthDates: number[] = [];
        const firstDay = firstWeekdays[month - 1];
        const daysInMonth = getDaysInMonth(year, month);
        let day = 1;
        let started = false;

        for (let slot = 1; slot <= 42; slot++) {
            if (!started) {
                if (slot === firstDay) {
                    monthDates.push(day);
                    day++;
                    started = true;
                } else {
                    monthDates.push(0);
                }
            } else {
                if (day <= daysInMonth) {
                    monthDates.push(day);
                    day++;
                } else {
                    monthDates.push(0);
                }
            }
        }

        matrix.push(monthDates);
    }

    return matrix;
}

/**
 * Obtém o próximo ano
 */
export function getNextYear(): number {
    return new Date().getFullYear() + 1;
}

/**
 * Obtém o ano atual
 */
export function getCurrentYear(): number {
    return new Date().getFullYear();
}

/**
 * Gera array de 1 a 31
 */
export function getDaysArray(): number[] {
    return Array.from({ length: 31 }, (_, i) => i + 1);
}

/**
 * Gera array de 1 a 12
 */
export function getMonthsArray(): number[] {
    return Array.from({ length: 12 }, (_, i) => i + 1);
}

/**
 * Gera array de 0 a 41 (42 slots para layout alinhado)
 */
export function getSlotsArray(): number[] {
    return Array.from({ length: 42 }, (_, i) => i);
}
