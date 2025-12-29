<script lang="ts">
  import { onMount } from "svelte";
  import InfoPanel from "./lib/InfoPanel.svelte";
  import CalendarTable from "./lib/CalendarTable.svelte";
  import Toolbar from "./lib/Toolbar.svelte";
  import { getCurrentYear } from "./lib/calendar";
  import { editMode, eventsStore } from "./lib/stores";
  import type { CalendarOptions } from "./lib/calendar";

  // Lê os parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);

  // Ano
  const yearParam = 2026; //urlParams.get("year");
  let year: number = getCurrentYear();
  if (yearParam) {
    const parsed = parseInt(yearParam, 10);
    if (!isNaN(parsed) && parsed >= 1900 && parsed <= 9999) {
      year = parsed;
    }
  }

  // Layout
  let layout: CalendarOptions["layout"] = "default";
  if (urlParams.get("layout") === "aligned-weekdays") {
    layout = "aligned-weekdays";
  }

  // Sofshavua (fim de semana hebraico)
  let sofshavua = urlParams.has("sofshavua");

  // Modo de edição reativo
  let isEditMode = false;
  editMode.subscribe((value) => (isEditMode = value));

  onMount(async () => {
    // Inicializa com dados default se o store estiver vazio
    const initialEvents = $eventsStore;
    if (initialEvents.length === 0) {
      try {
        const response = await fetch("/init.json");
        if (response.ok) {
          const data = await response.json();
          const formattedEvents = data.map(
            (item: { data: string; descrição: string }) => {
              const [day, month, year] = item.data.split("/");
              return {
                id: crypto.randomUUID(),
                date: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
                text: item.descrição,
                bgColor: "#e3f2fd", // Azul claro
                textColor: "#000000", // Preto
              };
            },
          );
          eventsStore.set(formattedEvents);
        }
      } catch (error) {
        console.error("Erro ao carregar init.json:", error);
      }
    }
  });
</script>

<svelte:head>
  <title>Calendário {year}</title>
  <meta name="title" content="Calendário {year}" />
  <meta
    name="description"
    content="Um calendário imprimível simples com o ano inteiro em uma única página"
  />
  <meta name="og:title" content="Calendário {year}" />
  <meta
    name="og:description"
    content="Um calendário imprimível simples com o ano inteiro em uma única página"
  />
  <link rel="preconnect" href="https://fonts.bunny.net" />
  <link
    href="https://fonts.bunny.net/css?family=inter:300,500,600|oswald:300,400"
    rel="stylesheet"
  />
</svelte:head>

<main class:edit-mode={isEditMode}>
  {#if isEditMode}
    <Toolbar {year} />
  {:else}
    <InfoPanel />
  {/if}
  <p class="year">{year}</p>
  <CalendarTable {year} {layout} {sofshavua} />
</main>

<style>
  :global(html) {
    font-family: "Oswald", sans-serif;
  }

  :global(html),
  :global(body) {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  :global(*) {
    color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  main {
    height: 100%;
  }

  main.edit-mode {
    padding-top: 60px;
  }

  .year {
    margin: 0 0 0.5em 0;
    text-align: center;
    font-family: "Oswald", sans-serif;
  }

  @media print {
    @page {
      margin: 0;
      padding: 1em;
    }

    main.edit-mode {
      padding-top: 0;
    }
  }
</style>
