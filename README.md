# Calendário

Um calendário imprimível simples com o ano inteiro em uma única página.

**Versão Svelte/TypeScript** do projeto original em PHP por [Neatnik](https://neatnik.net/).

## Funcionalidades

- 📅 Exibe o ano inteiro em uma única página
- 🖨️ Otimizado para impressão (orientação paisagem recomendada)
- 📱 Design responsivo
- ⚙️ Múltiplas opções de layout:
  - Padrão: Mostra número do dia e letra do dia da semana
  - Dias Alinhados: Alinha os dias da semana entre os meses
- 🌍 Suporte a fim de semana hebraico (sexta-sábado)
- ⚡ Renderização client-side com Svelte 5

## Stack Tecnológica

- **Svelte 5** - Framework reativo
- **TypeScript** - Tipagem estática
- **Vite** - Build tool ultrarrápida

## Começando

### Pré-requisitos

- Node.js 18+ 
- npm

### Instalação

```bash
npm install
```

### Desenvolvimento

Execute o servidor de desenvolvimento com hot-reload:

```bash
npm run dev
```

O servidor iniciará em `http://localhost:5173`

### Build de Produção

Compile o projeto para produção:

```bash
npm run build
```

Preview da build de produção:

```bash
npm run preview
```

## Uso

### Parâmetros de Query

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `year` | `AAAA` | Exibe calendário de um ano específico (ex: `?year=2026`) |
| `layout` | `aligned-weekdays` | Alinha os dias da semana entre os meses |
| `sofshavua` | (qualquer) | Usa fim de semana hebraico (sexta-sábado ao invés de sábado-domingo) |

### Exemplos

- `http://localhost:5173` - Calendário do ano atual
- `http://localhost:5173?year=2026` - Calendário de 2026
- `http://localhost:5173?layout=aligned-weekdays` - Layout com dias alinhados
- `http://localhost:5173?sofshavua` - Destaque de fim de semana hebraico
- `http://localhost:5173?year=2025&layout=aligned-weekdays&sofshavua` - Opções combinadas

## Estrutura do Projeto

```
calendar/
├── src/
│   ├── App.svelte           # Componente principal
│   ├── main.ts              # Ponto de entrada
│   ├── app.css              # Estilos globais
│   └── lib/
│       ├── calendar.ts      # Utilitários do calendário
│       ├── InfoPanel.svelte # Painel de informações
│       └── CalendarTable.svelte # Tabela do calendário
├── index.html               # HTML principal
├── package.json
├── vite.config.ts
├── svelte.config.js
└── tsconfig.json
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run preview` | Preview da build de produção |
| `npm run check` | Verifica tipos TypeScript e Svelte |

## Licença

Licença MIT - Copyright (c) 2025 Neatnik LLC

Veja [LICENSE](LICENSE) para detalhes.

## Projeto Original

Esta é uma versão Svelte/TypeScript do projeto original em PHP. 
Visite [neatnik.net/calendar](https://neatnik.net/calendar) para a versão original.
