<script lang="ts">
  import { editMode } from "./stores";

  function enterEditMode() {
    editMode.set(true);
  }
</script>

<div class="info">
  <p>
    <strong>Olá!</strong> Se você imprimir esta página, terá um calendário prático
    que exibe todas as datas do ano em uma única página. Ele se ajustará automaticamente
    a uma folha de papel de qualquer tamanho. Para melhores resultados, ajuste as
    configurações de impressão para orientação paisagem, desative o cabeçalho e rodapé.
  </p>
  <p>
    Se você quiser editar o calendário antes de imprimir, clique no botão
    "Editar Calendário".
  </p>
  <p>
    Visualize o ano inteiro de uma só vez. Dobre-o e leve consigo. Faça suas
    anotações nele. Planeje as coisas e observe a passagem do tempo.
  </p>
  <div class="button-group">
    <button class="btn edit-btn" on:click={enterEditMode}>
      ✏️ Editar Calendário
    </button>
    <button class="btn print-btn" on:click={() => window.print()}>
      🖨️ Imprimir
    </button>
  </div>
</div>

<style>
  .info {
    font-family: "Inter", sans-serif;
    position: absolute;
    top: 0;
    left: 0;
    margin: 5em 2em;
    width: calc(100% - 6em);
    background: #333;
    color: #eee;
    padding: 1em 1em 0.5em 1em;
    font-size: 2vmax;
    border-radius: 0.2em;
    z-index: 100;
  }

  .info p {
    text-align: left;
    margin: 0 0 1em 0;
    line-height: 135%;
  }

  .button-group {
    display: flex;
    gap: 0.5em;
    margin-top: 0.5em;
  }

  .btn {
    flex: 1;
    padding: 0.8em 1.5em;
    font-size: 1em;
    font-family: "Inter", sans-serif;
    font-weight: 600;
    border: none;
    border-radius: 0.3em;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .edit-btn {
    color: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .edit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .print-btn {
    color: #333;
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  }

  .print-btn:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  @media print {
    .info {
      display: none;
    }
  }
</style>
