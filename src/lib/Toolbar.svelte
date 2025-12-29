<script lang="ts">
    import { eventsStore, selectedDate, type CalendarEvent } from "./stores";
    import { onDestroy } from "svelte";
    import { get } from "svelte/store";

    export let year: number;

    let showModal = false;
    let modalMode: "add" | "edit" | "manage" = "add";
    let editingEvent: CalendarEvent | null = null;
    let eventsOnSelectedDate: CalendarEvent[] = [];

    let eventDay = 1;
    let eventMonth = 1;
    let eventEndDay = 1;
    let eventEndMonth = 1;
    let occurrenceMode: "single" | "multiple" = "single";
    let eventText = "";
    let eventBgColor = "#FFF3CD"; // amarelo pastel padrão
    let eventTextColor = "#333333"; // cinza escuro padrão

    // Gera a string de data no formato YYYY-MM-DD
    function getDateString(m = eventMonth, d = eventDay): string {
        return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }

    // Número de dias em cada mês
    function getDaysInMonth(month: number): number {
        return new Date(year, month, 0).getDate();
    }

    // Meses do ano
    const months = [
        { value: 1, name: "Janeiro" },
        { value: 2, name: "Fevereiro" },
        { value: 3, name: "Março" },
        { value: 4, name: "Abril" },
        { value: 5, name: "Maio" },
        { value: 6, name: "Junho" },
        { value: 7, name: "Julho" },
        { value: 8, name: "Agosto" },
        { value: 9, name: "Setembro" },
        { value: 10, name: "Outubro" },
        { value: 11, name: "Novembro" },
        { value: 12, name: "Dezembro" },
    ];

    // Atualiza o dia máximo quando o mês muda
    $: maxDays = getDaysInMonth(eventMonth);
    $: if (eventDay > maxDays) eventDay = maxDays;

    $: maxDaysEnd = getDaysInMonth(eventEndMonth);
    $: if (eventEndDay > maxDaysEnd) eventEndDay = maxDaysEnd;

    // Cores predefinidas em tons pastel
    const bgColors = [
        { color: "#FFF3CD", name: "Amarelo" },
        { color: "#FFE4E1", name: "Rosa" },
        { color: "#E8F5E9", name: "Verde" },
        { color: "#E3F2FD", name: "Azul" },
        { color: "#F3E5F5", name: "Lilás" },
        { color: "#FFF8E1", name: "Creme" },
        { color: "#E0F7FA", name: "Ciano" },
        { color: "#FCE4EC", name: "Coral" },
        { color: "#F1F8E9", name: "Lima" },
        { color: "#EDE7F6", name: "Lavanda" },
    ];

    const textColors = [
        { color: "#333333", name: "Cinza Escuro" },
        { color: "#D32F2F", name: "Vermelho" },
        { color: "#1976D2", name: "Azul" },
        { color: "#388E3C", name: "Verde" },
        { color: "#7B1FA2", name: "Roxo" },
        { color: "#F57C00", name: "Laranja" },
        { color: "#0097A7", name: "Teal" },
        { color: "#C2185B", name: "Magenta" },
        { color: "#5D4037", name: "Marrom" },
        { color: "#455A64", name: "Azul Cinza" },
    ];

    // Usar a sintaxe reativa do Svelte para eventos
    $: events = $eventsStore;

    // Reagir a cliques em datas no calendário
    const unsubscribe = selectedDate.subscribe((value) => {
        if (value) {
            const dateStr = `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
            // Buscar eventos diretamente da store usando get()
            const currentEvents = get(eventsStore);
            eventsOnSelectedDate = currentEvents.filter(
                (e) => e.date === dateStr,
            );

            if (eventsOnSelectedDate.length > 0) {
                // Se há eventos nesta data, mostra modal de gerenciamento
                modalMode = "manage";
                // Extrair dia e mês da string de data
                const [, m, d] = dateStr.split("-").map(Number);
                eventMonth = m;
                eventDay = d;
                showModal = true;
            } else {
                // Se não há eventos, abre modal para adicionar novo
                openAddModalWithDate(dateStr);
            }
            selectedDate.set(null);
        }
    });

    onDestroy(() => {
        unsubscribe();
    });

    function openAddModal() {
        modalMode = "add";
        editingEvent = null;
        eventDay = 1;
        eventMonth = 1;
        eventEndDay = 1;
        eventEndMonth = 1;
        occurrenceMode = "single";
        eventText = "";
        eventBgColor = "#FFF3CD";
        eventTextColor = "#333333";
        showModal = true;
    }

    function openAddModalWithDate(date: string) {
        modalMode = "add";
        editingEvent = null;
        // Extrair dia e mês da string de data
        const [, m, d] = date.split("-").map(Number);
        eventMonth = m;
        eventDay = d;
        eventEndMonth = m;
        eventEndDay = d;
        occurrenceMode = "single";
        eventText = "";
        eventBgColor = "#FFF3CD";
        eventTextColor = "#333333";
        showModal = true;
    }

    function openEditModal(event: CalendarEvent) {
        modalMode = "edit";
        editingEvent = event;
        // Extrair dia e mês da string de data
        const [, m, d] = event.date.split("-").map(Number);
        eventMonth = m;
        eventDay = d;
        eventEndMonth = m;
        eventEndDay = d;
        occurrenceMode = "single";
        eventText = event.text;
        eventBgColor = event.bgColor || "#FFF3CD";
        eventTextColor = event.textColor || "#333333";
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        editingEvent = null;
        eventsOnSelectedDate = [];
        eventDay = 1;
        eventMonth = 1;
        eventEndDay = 1;
        eventEndMonth = 1;
        occurrenceMode = "single";
        eventText = "";
        eventBgColor = "#FFF3CD";
        eventTextColor = "#333333";
    }

    function saveEvent() {
        if (!eventText.trim()) return;

        if (modalMode === "add" && occurrenceMode === "multiple") {
            const startDate = new Date(year, eventMonth - 1, eventDay);
            const endDate = new Date(year, eventEndMonth - 1, eventEndDay);

            if (endDate < startDate) {
                alert("A data final deve ser posterior à data inicial.");
                return;
            }

            // Iterar por todos os dias do período
            let current = new Date(startDate);
            while (current <= endDate) {
                const d = current.getDate();
                const m = current.getMonth() + 1;
                const dateStr = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

                eventsStore.add({
                    date: dateStr,
                    text: eventText.trim(),
                    bgColor: eventBgColor,
                    textColor: eventTextColor,
                });

                current.setDate(current.getDate() + 1);
            }
        } else {
            const dateStr = getDateString();

            if (modalMode === "add") {
                eventsStore.add({
                    date: dateStr,
                    text: eventText.trim(),
                    bgColor: eventBgColor,
                    textColor: eventTextColor,
                });
            } else if (editingEvent) {
                eventsStore.update(editingEvent.id, {
                    date: dateStr,
                    text: eventText.trim(),
                    bgColor: eventBgColor,
                    textColor: eventTextColor,
                });
            }
        }

        closeModal();
    }

    function deleteEvent(id: string) {
        if (confirm("Tem certeza que deseja remover este evento?")) {
            eventsStore.remove(id);
            // Atualiza a lista local após remoção
            eventsOnSelectedDate = eventsOnSelectedDate.filter(
                (e) => e.id !== id,
            );
            if (eventsOnSelectedDate.length === 0) {
                closeModal();
            }
        }
    }

    function formatDate(dateStr: string): string {
        const [, month, day] = dateStr.split("-");
        return `${day}/${month}`;
    }

    function formatCurrentDate(): string {
        return `${String(eventDay).padStart(2, "0")}/${String(eventMonth).padStart(2, "0")}`;
    }

    // --- Lógica de Feriadão ---
    let showFeriadaoModal = false;
    let feriadaoSortOrder: "date" | "days" = "date";

    interface Feriadao {
        description: string;
        month: string;
        totalDays: number;
        startDate: Date;
    }

    function getFeriadaos(): Feriadao[] {
        const yearEvents = $eventsStore.filter((e) =>
            e.date.startsWith(year.toString()),
        );
        if (yearEvents.length === 0) return [];

        const feriadaos: Feriadao[] = [];
        const processedDates = new Set<string>();

        // Agrupar eventos por data (pode haver mais de um no mesmo dia)
        const eventsByDate: Record<string, string[]> = {};
        yearEvents.forEach((e) => {
            if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
            eventsByDate[e.date].push(e.text);
        });

        // Loop por todos os dias do ano para encontrar blocos de folga
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        let current = new Date(start);

        while (current <= end) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, "0");
            const d = String(current.getDate()).padStart(2, "0");
            const dateStr = `${y}-${m}-${d}`;

            const isWeekend = current.getDay() === 0 || current.getDay() === 6;
            const hasHoliday = !!eventsByDate[dateStr];

            if ((isWeekend || hasHoliday) && !processedDates.has(dateStr)) {
                // Encontramos o início de um possível bloco de folga
                let blockDates: Date[] = [];
                let blockHasHoliday = false;
                let blockHasWeekend = false;
                let temp = new Date(current);

                // Expandir o bloco para frente
                while (temp <= end) {
                    const ty = temp.getFullYear();
                    const tm = String(temp.getMonth() + 1).padStart(2, "0");
                    const td = String(temp.getDate()).padStart(2, "0");
                    const tStr = `${ty}-${tm}-${td}`;

                    const tIsWeekend =
                        temp.getDay() === 0 || temp.getDay() === 6;
                    const tHasHoliday = !!eventsByDate[tStr];

                    if (tIsWeekend || tHasHoliday) {
                        blockDates.push(new Date(temp));
                        processedDates.add(tStr);
                        if (tHasHoliday) blockHasHoliday = true;
                        if (tIsWeekend) blockHasWeekend = true;
                        temp.setDate(temp.getDate() + 1);
                    } else {
                        break;
                    }
                }

                // Expandir o bloco para trás (caso tenhamos começado no meio)
                // Na verdade, como estamos percorrendo o ano em ordem, não precisa expandir para trás
                // se mantivermos o controle de processedDates.

                // Um feriadão deve ter feriado E estar conectado a um fim de semana
                if (blockHasHoliday && blockHasWeekend) {
                    // Descrições únicas dos feriados no bloco
                    const descriptions = Array.from(
                        new Set(
                            blockDates.flatMap((d) => {
                                const dy = d.getFullYear();
                                const dm = String(d.getMonth() + 1).padStart(
                                    2,
                                    "0",
                                );
                                const dd = String(d.getDate()).padStart(2, "0");
                                const dStr = `${dy}-${dm}-${dd}`;
                                return eventsByDate[dStr] || [];
                            }),
                        ),
                    ).join(" + ");

                    const firstHolidayDate = blockDates.find((d) => {
                        const dy = d.getFullYear();
                        const dm = String(d.getMonth() + 1).padStart(2, "0");
                        const dd = String(d.getDate()).padStart(2, "0");
                        const dStr = `${dy}-${dm}-${dd}`;
                        return !!eventsByDate[dStr];
                    });

                    const monthName = firstHolidayDate
                        ? months[firstHolidayDate.getMonth()].name
                        : months[blockDates[0].getMonth()].name;

                    feriadaos.push({
                        description: descriptions || "Feriado",
                        month: monthName,
                        totalDays: blockDates.length,
                        startDate: blockDates[0],
                    });
                }
            }
            current.setDate(current.getDate() + 1);
        }

        return feriadaos;
    }

    $: feriadaosList = getFeriadaos().sort((a, b) => {
        if (feriadaoSortOrder === "days") return b.totalDays - a.totalDays;
        return a.startDate.getTime() - b.startDate.getTime();
    });
</script>

<div class="toolbar">
    <div class="toolbar-title">✏️ Modo Edição</div>
    <div class="toolbar-hint">
        Clique em uma data para adicionar/editar eventos
    </div>
    <div class="toolbar-actions">
        <button
            class="btn btn-feriadao"
            on:click={() => (showFeriadaoModal = true)}
        >
            🏖️ Feriadão
        </button>
        <button class="btn btn-add" on:click={openAddModal}>
            ➕ Incluir
        </button>
        <button class="btn btn-print" on:click={() => window.print()}>
            🖨️ Imprimir
        </button>
    </div>
</div>

{#if showModal}
    <div
        class="modal-overlay"
        on:click={closeModal}
        on:keydown={(e) => e.key === "Escape" && closeModal()}
        role="button"
        tabindex="0"
    >
        <div
            class="modal"
            on:click|stopPropagation
            on:keydown|stopPropagation
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            {#if modalMode === "manage"}
                <h2>📅 Eventos em {formatCurrentDate()}</h2>

                <div class="manage-events-list">
                    {#each eventsOnSelectedDate as event (event.id)}
                        <div class="manage-event-item">
                            <span class="manage-event-text">{event.text}</span>
                            <div class="manage-event-actions">
                                <button
                                    class="btn-icon"
                                    title="Editar"
                                    on:click={() => openEditModal(event)}
                                    >✏️</button
                                >
                                <button
                                    class="btn-icon"
                                    title="Remover"
                                    on:click={() => deleteEvent(event.id)}
                                    >🗑️</button
                                >
                            </div>
                        </div>
                    {/each}
                </div>

                <div class="modal-actions">
                    <button class="btn btn-cancel" on:click={closeModal}
                        >Fechar</button
                    >
                    <button
                        class="btn btn-save"
                        on:click={() => openAddModalWithDate(getDateString())}
                    >
                        ➕ Adicionar mais
                    </button>
                </div>
            {:else}
                <h2>
                    {modalMode === "add" ? "Incluir Evento" : "Editar Evento"}
                </h2>

                <div class="form-group occurrence-group">
                    <label>Tipo:</label>
                    <div class="occurrence-toggle">
                        <button
                            type="button"
                            class:active={occurrenceMode === "single"}
                            on:click={() => (occurrenceMode = "single")}
                        >
                            Único
                        </button>
                        {#if modalMode === "add"}
                            <button
                                type="button"
                                class:active={occurrenceMode === "multiple"}
                                on:click={() => (occurrenceMode = "multiple")}
                            >
                                Múltiplo
                            </button>
                        {/if}
                    </div>
                </div>

                <div class="form-group">
                    <label for="event-day"
                        >{occurrenceMode === "multiple"
                            ? "Início:"
                            : "Data:"}</label
                    >
                    <div class="date-selectors">
                        <select id="event-day" bind:value={eventDay}>
                            {#each Array.from({ length: maxDays }, (_, i) => i + 1) as d}
                                <option value={d}
                                    >{String(d).padStart(2, "0")}</option
                                >
                            {/each}
                        </select>
                        <span class="date-separator">/</span>
                        <select id="event-month" bind:value={eventMonth}>
                            {#each months as m}
                                <option value={m.value}>{m.name}</option>
                            {/each}
                        </select>
                        <span class="date-year">/ {year}</span>
                    </div>
                </div>

                {#if occurrenceMode === "multiple"}
                    <div class="form-group">
                        <label for="event-end-day">Fim:</label>
                        <div class="date-selectors">
                            <select id="event-end-day" bind:value={eventEndDay}>
                                {#each Array.from({ length: maxDaysEnd }, (_, i) => i + 1) as d}
                                    <option value={d}
                                        >{String(d).padStart(2, "0")}</option
                                    >
                                {/each}
                            </select>
                            <span class="date-separator">/</span>
                            <select
                                id="event-end-month"
                                bind:value={eventEndMonth}
                            >
                                {#each months as m}
                                    <option value={m.value}>{m.name}</option>
                                {/each}
                            </select>
                            <span class="date-year">/ {year}</span>
                        </div>
                    </div>
                {/if}

                <div class="form-group">
                    <label for="event-text">Texto:</label>
                    <input
                        type="text"
                        id="event-text"
                        bind:value={eventText}
                        placeholder="Digite o texto do evento"
                        maxlength="15"
                    />
                </div>

                <div class="form-group">
                    <label>Cor de Fundo:</label>
                    <div class="color-picker">
                        {#each bgColors as bg}
                            <button
                                type="button"
                                class="color-swatch"
                                class:selected={eventBgColor === bg.color}
                                style="background-color: {bg.color}"
                                title={bg.name}
                                on:click={() => (eventBgColor = bg.color)}
                            ></button>
                        {/each}
                    </div>
                </div>

                <div class="form-group">
                    <label>Cor do Texto:</label>
                    <div class="color-picker">
                        {#each textColors as tc}
                            <button
                                type="button"
                                class="color-swatch text-color"
                                class:selected={eventTextColor === tc.color}
                                style="background-color: {tc.color}"
                                title={tc.name}
                                on:click={() => (eventTextColor = tc.color)}
                            ></button>
                        {/each}
                    </div>
                </div>

                <div class="form-group">
                    <label>Prévia:</label>
                    <div
                        class="event-preview"
                        style="background-color: {eventBgColor}; color: {eventTextColor}"
                    >
                        {eventText || "Texto do evento"}
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-cancel" on:click={closeModal}
                        >Cancelar</button
                    >
                    <button
                        class="btn btn-save"
                        on:click={saveEvent}
                        disabled={!eventText.trim()}
                    >
                        {modalMode === "add" ? "Incluir" : "Salvar"}
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

{#if showFeriadaoModal}
    <div
        class="modal-overlay"
        on:click={() => (showFeriadaoModal = false)}
        on:keydown={(e) => e.key === "Escape" && (showFeriadaoModal = false)}
        role="button"
        tabindex="0"
    >
        <div
            class="modal modal-wide"
            on:click|stopPropagation
            on:keydown|stopPropagation
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <h2>🏖️ Feriadões de {year}</h2>
            <div class="feriadao-sort">
                <span>Ordenar por:</span>
                <div class="toggle-group">
                    <button
                        class:active={feriadaoSortOrder === "date"}
                        on:click={() => (feriadaoSortOrder = "date")}
                    >
                        Data
                    </button>
                    <button
                        class:active={feriadaoSortOrder === "days"}
                        on:click={() => (feriadaoSortOrder = "days")}
                    >
                        Total de Dias
                    </button>
                </div>
            </div>

            <div class="feriadao-container">
                <div class="feriadao-header">
                    <div class="col-desc">Descrição do Feriado</div>
                    <div class="col-month">Mês</div>
                    <div class="col-days">Total de Dias</div>
                </div>
                <div class="feriadao-list">
                    {#each feriadaosList as f}
                        <div class="feriadao-item">
                            <div class="col-desc">{f.description}</div>
                            <div class="col-month">{f.month}</div>
                            <div class="col-days">
                                <span class="badge">{f.totalDays} dias</span>
                            </div>
                        </div>
                    {/each}
                    {#if feriadaosList.length === 0}
                        <div class="no-data">
                            Nenhum feriadão encontrado para este ano.
                        </div>
                    {/if}
                </div>
            </div>

            <div class="modal-actions">
                <button
                    class="btn btn-cancel"
                    on:click={() => (showFeriadaoModal = false)}>Fechar</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .toolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.5em;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 200;
        font-family: "Inter", sans-serif;
    }

    .toolbar-title {
        font-weight: 600;
        font-size: 1.1em;
    }

    .toolbar-hint {
        font-size: 0.85em;
        opacity: 0.85;
    }

    .toolbar-actions {
        display: flex;
        gap: 0.5em;
    }

    .btn {
        padding: 0.5em 1em;
        border: none;
        border-radius: 0.3em;
        cursor: pointer;
        font-family: "Inter", sans-serif;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .btn-feriadao {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        margin-right: 0.5em;
    }

    .btn-feriadao:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .btn-add {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }

    .btn-add:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .btn-print {
        background: rgba(255, 255, 255, 0.9);
        color: #333;
    }

    .btn-print:hover {
        background: rgba(255, 255, 255, 1);
    }

    .manage-events-list {
        margin: 1em 0;
    }

    .manage-event-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5em;
        padding: 0.7em;
        background: #f8f9fa;
        border-radius: 0.3em;
        margin-bottom: 0.5em;
    }

    .manage-event-item:last-child {
        margin-bottom: 0;
    }

    .manage-event-text {
        flex: 1;
        font-size: 0.95em;
        color: #333;
    }

    .manage-event-actions {
        display: flex;
        gap: 0.3em;
    }

    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.2em;
        font-size: 1em;
        opacity: 0.6;
        transition: opacity 0.2s;
    }

    .btn-icon:hover {
        opacity: 1;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 300;
    }

    .modal {
        background: white;
        padding: 2em;
        border-radius: 0.5em;
        width: 90%;
        max-width: 400px;
        font-family: "Inter", sans-serif;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .modal h2 {
        margin: 0 0 1em 0;
        font-size: 1.3em;
        color: #333;
    }

    .form-group {
        margin-bottom: 1em;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.3em;
        font-weight: 500;
        color: #555;
    }

    .occurrence-toggle {
        display: flex;
        background: #f1f3f5;
        padding: 4px;
        border-radius: 6px;
        gap: 4px;
    }

    .occurrence-toggle button {
        flex: 1;
        padding: 6px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.9em;
        font-weight: 500;
        color: #495057;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .occurrence-toggle button.active {
        background: white;
        color: #667eea;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .form-group input,
    .form-group select {
        width: 100%;
        padding: 0.7em;
        border: 1px solid #ddd;
        border-radius: 0.3em;
        font-size: 1em;
        box-sizing: border-box;
        background: white;
    }

    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    .date-selectors {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    .date-selectors select {
        width: auto;
        min-width: 60px;
    }

    #event-month {
        flex: 1;
    }

    .date-separator,
    .date-year {
        color: #777;
        font-weight: 500;
    }

    .modal-actions {
        display: flex;
        gap: 0.5em;
        justify-content: flex-end;
        margin-top: 1.5em;
    }

    .btn-cancel {
        background: #e0e0e0;
        color: #333;
    }

    .btn-cancel:hover {
        background: #d0d0d0;
    }

    .btn-save {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .btn-save:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-save:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .color-picker {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4em;
        margin-top: 0.3em;
    }

    .color-swatch {
        width: 28px;
        height: 28px;
        border: 2px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }

    .color-swatch:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }

    .color-swatch.selected {
        border-color: #333;
        box-shadow:
            0 0 0 2px white,
            0 0 0 4px #667eea;
    }

    .color-swatch.text-color {
        border-radius: 50%;
    }

    .event-preview {
        padding: 0.5em 0.8em;
        border-radius: 0.3em;
        font-size: 0.9em;
        font-weight: 500;
        text-align: center;
        border: 1px solid #ddd;
    }

    .modal.modal-wide {
        max-width: 700px;
    }

    .feriadao-sort {
        display: flex;
        align-items: center;
        gap: 1em;
        margin-bottom: 1.5em;
        font-size: 0.9em;
        color: #666;
    }

    .toggle-group {
        display: flex;
        background: #f1f3f5;
        padding: 3px;
        border-radius: 6px;
    }

    .toggle-group button {
        padding: 5px 12px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 600;
        color: #777;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .toggle-group button.active {
        background: white;
        color: #667eea;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .feriadao-container {
        border: 1px solid #eee;
        border-radius: 0.5em;
        overflow: hidden;
    }

    .feriadao-header {
        display: flex;
        background: #f8f9fa;
        padding: 0.8em 1em;
        font-weight: 600;
        font-size: 0.85em;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #eee;
    }

    .feriadao-list {
        max-height: 400px;
        overflow-y: auto;
    }

    .feriadao-item {
        display: flex;
        align-items: center;
        padding: 0.8em 1em;
        border-bottom: 1px solid #f1f1f1;
        transition: background 0.2s;
    }

    .feriadao-item:last-child {
        border-bottom: none;
    }

    .feriadao-item:hover {
        background: #fcfcfc;
    }

    .col-desc {
        flex: 2;
        font-weight: 500;
        color: #333;
    }

    .col-month {
        flex: 1;
        color: #666;
    }

    .col-days {
        flex: 1;
        text-align: right;
    }

    .badge {
        background: #e3f2fd;
        color: #1976d2;
        padding: 0.3em 0.8em;
        border-radius: 2em;
        font-size: 0.85em;
        font-weight: 600;
    }

    .no-data {
        padding: 2em;
        text-align: center;
        color: #999;
        font-style: italic;
    }

    @media print {
        .toolbar,
        .modal-overlay {
            display: none;
        }
    }
</style>
