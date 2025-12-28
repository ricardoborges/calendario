<script lang="ts">
  import {
    getDayInfo,
    getMonthName,
    getDaysArray,
    getMonthsArray,
    getSlotsArray,
    generateAlignedDatesMatrix,
    getDayOfWeek,
    isWeekend as checkWeekend,
    type CalendarOptions,
  } from "./calendar";
  import {
    eventsStore,
    editMode,
    selectedDate,
    type CalendarEvent,
  } from "./stores";

  export let year: number;
  export let layout: CalendarOptions["layout"] = "default";
  export let sofshavua: boolean = false;

  $: days = getDaysArray();
  $: months = getMonthsArray();
  $: slots = getSlotsArray();
  $: alignedMatrix =
    layout === "aligned-weekdays" ? generateAlignedDatesMatrix(year) : [];

  // Usar sintaxe reativa do Svelte para eventos e modo de edição
  $: events = $eventsStore;
  $: isEditMode = $editMode;

  // Função que recebe events como parâmetro para manter reatividade
  function getEventsForDay(
    allEvents: CalendarEvent[],
    month: number,
    day: number,
  ): CalendarEvent[] {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.filter((e) => e.date === dateStr);
  }

  function handleCellClick(month: number, day: number) {
    if (isEditMode) {
      selectedDate.set({ year, month, day });
    }
  }
</script>

<table>
  <thead>
    <tr>
      {#each months as month}
        <th>{getMonthName(month)}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if layout === "aligned-weekdays"}
      {#each slots as slot}
        <tr>
          {#each months as month, monthIndex}
            {@const day = alignedMatrix[monthIndex][slot]}
            {#if day === 0}
              <td></td>
            {:else}
              {@const dayOfWeek = getDayOfWeek(year, month, day)}
              {@const isWeekendDay = checkWeekend(dayOfWeek, sofshavua)}
              {@const dayEvents = getEventsForDay(events, month, day)}
              <td
                class:weekend={isWeekendDay}
                class:has-event={dayEvents.length > 0}
                class:clickable={isEditMode}
                style={dayEvents.length > 0
                  ? `background-color: ${dayEvents[0].bgColor || "#FFF3CD"}`
                  : ""}
                on:click={() => handleCellClick(month, day)}
                role={isEditMode ? "button" : undefined}
                tabindex={isEditMode ? 0 : undefined}
              >
                <span class="day-number">{day}</span>
                {#if dayEvents.length > 0}
                  <span
                    class="event-marker"
                    style="color: {dayEvents[0].textColor || '#d63384'}"
                    title={dayEvents[0].text}
                  >
                    {dayEvents[0].text}
                  </span>
                {/if}
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    {:else}
      {#each days as day}
        <tr>
          {#each months as month}
            {@const dayInfo = getDayInfo(year, month, day, sofshavua)}
            {#if dayInfo}
              {@const dayEvents = getEventsForDay(events, month, day)}
              <td
                class:weekend={dayInfo.isWeekend}
                class:has-event={dayEvents.length > 0}
                class:clickable={isEditMode}
                style={dayEvents.length > 0
                  ? `background-color: ${dayEvents[0].bgColor || "#FFF3CD"}`
                  : ""}
                on:click={() => handleCellClick(month, day)}
                role={isEditMode ? "button" : undefined}
                tabindex={isEditMode ? 0 : undefined}
              >
                <span class="date">{dayInfo.day}</span>
                <span class="day">{dayInfo.dayName}</span>
                {#if dayEvents.length > 0}
                  <span
                    class="event-text"
                    style="color: {dayEvents[0].textColor || '#d63384'}"
                    title={dayEvents[0].text}
                  >
                    {dayEvents[0].text}
                  </span>
                {/if}
              </td>
            {:else}
              <td></td>
            {/if}
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<style>
  table {
    width: 100%;
    height: calc(100% - 2.5em);
    border-collapse: separate;
    border-spacing: 0.5em 0;
    table-layout: fixed;
  }

  td,
  th {
    font-weight: normal;
    text-transform: uppercase;
    border-bottom: 1px solid #888;
    padding: 0.3vmin 0.3vmin;
    font-size: 0.9vmin;
    font-weight: 300;
    color: #000;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }

  th {
    font-size: 1.1vmin;
    padding: 0;
  }

  td:empty {
    border: 0;
  }

  .date {
    display: inline-block;
    width: 1.1em;
  }

  .day {
    display: inline-block;
    text-align: center;
    width: 1em;
    color: #888;
  }

  .day-number {
    display: inline-block;
    width: 1.1em;
  }

  .weekend {
    background: #eee;
    font-weight: 400;
  }

  .event-text,
  .event-marker {
    display: inline-block;
    font-size: 0.7vmin;
    font-weight: 500;
    margin-left: 0.2em;
    flex: 1;
    max-width: calc(100% - 2.5em);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }

  .clickable {
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .clickable:hover {
    background-color: #e0e7ff !important;
  }

  @media print {
    td {
      font-size: 8px !important;
    }

    .weekend:not(.has-event) {
      background: #d8d8d8 !important;
    }

    /* Forçar a impressão da cor de fundo dos eventos */
    td.has-event {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .event-text,
    .event-marker {
      font-size: 6px !important;
    }
  }
</style>
