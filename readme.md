# Nutri+ - Rastreador de Nutrição Inteligente

## Índice de Conteúdos
- [Introdução]
- [Funcionalidades do Site]
- [Tecnologias Utilizadas]
- [Estrutura do Projeto]
- [Código HTML]
- [Código CSS]
- [Código JavaScript]
- [APIs Utilizadas]
- [Como Usar]
- [Conclusões]

---

## Introdução

O Nutri+ é uma aplicação web inteligente desenvolvida para auxiliar usuários no acompanhamento de sua nutrição diária. A plataforma oferece uma otimização na gestão de refeições, facilita o rastreamento de macronutrientes e fornece recomendações personalizadas através de inteligência artificial.

O projeto destina-se a qualquer pessoa interessada em melhorar seus hábitos alimentares e compreender melhor sua ingestão nutricional.

---

## Funcionalidades do Site

### 1. Busca de Alimentos em Português
- Campo de busca com sugestões em tempo real
- Tradução automática de termos de busca do português para inglês
- Busca rápida com botões predefinidos (maçã, banana, frango, etc.)
- Base de dados USDA com informações nutricionais completas
- Tradução bidirecional dos nomes de alimentos

### 2. Registro de Alimentos
- Interface simples para adicionar alimentos ao registro diário
- Seletor de porção em gramas (customizável de 1 a 2000g)
- Visualização automática de macronutrientes por porção
- Remoção individual de itens do registro
- Histórico de consumo com timestamps

### 3. Assistente Nutricional IA
- Chat interativo com assistente especializado em nutrição
- Análise personalizada do consumo do dia
- Sugestões de refeições balanceadas
- Dicas sobre aumento de ingestão de macronutrientes
- Perguntas rápidas predefinidas
- Contexto nutricional fornecido automaticamente

### 4. Dashboard de Análises
- Círculo de progresso de calorias consumidas vs. meta
- Distribuição visual de macronutrientes (gráfico de pizza)
- Tendência semanal de consumo calórico
- Barra de progresso individual para proteína, carboidratos e gordura
- Estatísticas de uso (dias consecutivos, total de alimentos registrados)

### 5. Configurações de Metas
- Modal para ajustar metas diárias personalizadas
- Metas pré-definidas: calorias (2000 kcal), proteína (150g), carboidratos (250g), gordura (67g)
- Validação de intervalos de valores
- Armazenamento persistente de metas

### 6. Persistência de Dados
- Armazenamento local com localStorage
- Histórico de 30 dias de dados nutricionais
- Sincronização automática de dados
- Recuperação de dados ao recarregar a página

---

## Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **APIs Externas:**
  - USDA FoodData Central API (banco de dados de alimentos)
  - Google Gemini AI API (tradução e assistente nutricional)
- **Armazenamento:** LocalStorage do navegador
- **Frameworks/Bibliotecas:** Nenhuma dependência externa (Vanilla JavaScript)
- **Fontes:** Google Fonts (Inter)

---

## Estrutura do Projeto

```
Nutri+/
├── index.html          # Estrutura HTML da aplicação
├── style.css          # Estilos e design responsivo
├── script.js          # Lógica da aplicação e integração de APIs
└── README.md          # Este arquivo
```

### Arquivos Principais

**index.html:** Contém a estrutura base com:
- Header com ícone e estatísticas
- Navegação entre abas (Alimentos, IA, Análises)
- Seções de busca, chat e analytics
- Sidebar com resumo diário
- Modals para configurações
- Notificações toast

**style.css:** Define:
- Variáveis CSS para tema consistente
- Design responsivo para mobile e desktop
- Animações e transições suaves
- Componentes reutilizáveis (botões, cards, inputs)
- Temas de cores com gradientes

**script.js:** Implementa:
- Gerenciamento de estado global da aplicação
- Integração com APIs USDA e Gemini
- Tradução de alimentos (PT-BR ↔ EN)
- Lógica de cálculos nutricionais
- Sistema de notificações
- Persistência de dados
- Renderização de gráficos

---

## Código HTML

O HTML estabelece a estrutura semântica da aplicação com seções bem definidas:

```html
<!-- Header com branding -->
<header class="app-header">
    <h1 class="app-title">🎯 Nutri+</h1>
    <!-- Estatísticas de uso -->
    <div class="header-stats">
        <div class="stat-item">
            <span id="streakDays">0</span> dias consecutivos
        </div>
    </div>
</header>

<!-- Navegação entre abas -->
<nav class="app-nav">
    <button class="nav-btn active" data-tab="food">
        🔍 Buscar Alimentos
    </button>
    <button class="nav-btn" data-tab="ai">
        🤖 Assistente IA
    </button>
    <button class="nav-btn" data-tab="analytics">
        📊 Análises
    </button>
</nav>

<!-- Conteúdo principal -->
<main class="main-section">
    <!-- Aba de busca de alimentos -->
    <section id="food-tab" class="tab-content active">
        <input type="text" id="foodSearch" placeholder="Busque por alimentos">
        <div id="searchResults" class="search-results"></div>
    </section>
    
    <!-- Aba de assistente IA -->
    <section id="ai-tab" class="tab-content">
        <div id="chatMessages" class="chat-messages"></div>
        <input type="text" id="chatInput" placeholder="Faça uma pergunta">
    </section>
    
    <!-- Aba de análises -->
    <section id="analytics-tab" class="tab-content">
        <canvas id="macroChart"></canvas>
    </section>
</main>

<!-- Sidebar com resumo diário -->
<aside class="sidebar">
    <div class="calories-circle" id="caloriesCircle">
        <div id="caloriesConsumed">0</div> kcal
    </div>
    <div id="foodLog" class="food-log"></div>
</aside>
```

---

## Código CSS

O CSS utiliza variáveis personalizadas para manutenção consistente do tema:

```css
:root {
    --primary-color: #4facfe;
    --secondary-color: #38ef7d;
    --danger-color: #ff6b6b;
    --success-color: #1dd1a1;
    --text-primary: #2c3e50;
    --bg-primary: #ffffff;
    --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.1);
    --radius-md: 12px;
}

/* Gradientes modernos */
.app-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
}

/* Responsividade mobile */
@media (max-width: 768px) {
    .app-body {
        grid-template-columns: 1fr;
    }
    .sidebar {
        order: -1;
    }
}

/* Animações */
@keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Componentes reutilizáveis */
.btn {
    padding: 16px 24px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
}
```

Principais recursos CSS:
- Design responsivo com media queries para mobile, tablet e desktop
- Animações suaves (slide, fade, bounce, spin)
- Gradientes lineares e cônicos para visual moderno
- Sistema de cores harmônicas com variáveis globais
- Componentes modulares e reutilizáveis

---

## Código JavaScript

O JavaScript implementa a lógica complexa da aplicação:

### 1. Configuração e Estado Global

```javascript
const CONFIG = {
    APIS: {
        USDA_KEY: 'sua-chave-aqui',
        USDA_BASE_URL: 'https://api.nal.usda.gov/fdc/v1',
        GEMINI_KEY: 'sua-chave-aqui',
        GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    },
    DEFAULTS: {
        CALORIE_GOAL: 2000,
        PROTEIN_GOAL: 150,
        CARBS_GOAL: 250,
        FAT_GOAL: 67
    }
};

class AppState {
    constructor() {
        this.dailyLog = [];
        this.userGoals = this.loadUserGoals();
        this.searchResults = [];
    }
    
    loadUserGoals() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_GOALS);
        return saved ? JSON.parse(saved) : CONFIG.DEFAULTS;
    }
}
```

### 2. Integração com APIs

**USDA FoodData Central:**
```javascript
async function buscarAlimentos() {
    const termoIngles = await traduzirTermoBusca(termo);
    const response = await fetch(
        `${CONFIG.APIS.USDA_BASE_URL}/foods/search?query=${encodeURIComponent(termoIngles)}&api_key=${CONFIG.APIS.USDA_KEY}`
    );
    const data = await response.json();
    return data.foods;
}
```

**Google Gemini AI:**
```javascript
async function chamarGeminiAPI(mensagem) {
    const response = await fetch(`${CONFIG.APIS.GEMINI_BASE_URL}?key=${CONFIG.APIS.GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
```

### 3. Tradução de Alimentos

```javascript
// Dicionário local para traduções rápidas
const TRADUCAO_ALIMENTOS = {
    'maçã': 'apple',
    'banana': 'banana',
    'frango': 'chicken',
    'peixe': 'fish',
    // ... mais 100+ entradas
};

async function traduzirTermoBusca(termo) {
    // Verificar dicionário local primeiro
    if (TRADUCAO_ALIMENTOS[termo.toLowerCase()]) {
        return TRADUCAO_ALIMENTOS[termo.toLowerCase()];
    }
    
    // Se não encontrado, usar IA para traduzir
    const prompt = `Traduza para inglês: ${termo}. Retorne apenas a tradução.`;
    return await chamarGeminiAPI(prompt);
}
```

### 4. Cálculos Nutricionais

```javascript
function extractNutrients(foodNutrients) {
    const nutrients = {};
    
    foodNutrients.forEach(nutrient => {
        const name = nutrient.nutrientName?.toLowerCase() || '';
        const value = nutrient.value || 0;
        
        if (name.includes('energy')) nutrients.energy = value;
        if (name.includes('protein')) nutrients.protein = value;
        if (name.includes('carbohydrate')) nutrients.carbs = value;
        if (name.includes('fat')) nutrients.fat = value;
    });
    
    return nutrients;
}

function calculateTotals() {
    return state.dailyLog.reduce((totals, item) => ({
        calories: totals.calories + (item.calories || 0),
        protein: totals.protein + (item.protein || 0),
        carbs: totals.carbs + (item.carbs || 0),
        fat: totals.fat + (item.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
```

### 5. Persistência de Dados

```javascript
function saveDailyData() {
    const dailyData = {
        date: new Date().toDateString(),
        foods: state.dailyLog,
        goals: state.userGoals,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.DAILY_DATA, JSON.stringify(dailyData));
    updateUserHistory(dailyData);
}

function loadDailyData() {
    const savedData = localStorage.getItem(CONFIG.STORAGE_KEYS.DAILY_DATA);
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.date === new Date().toDateString()) {
            state.dailyLog = data.foods || [];
        }
    }
}
```

### 6. Sistema de Notificações

```javascript
function showToast(message, type = 'info') {
    const icons = {
        success: '✅',
        error: '⚠️',
        warning: '⚡',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${icons[type]} ${type.toUpperCase()}</div>
        <div class="toast-message">${message}</div>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}
```

---

## APIs Utilizadas

### 1. USDA FoodData Central API
- **Endpoint:** `https://api.nal.usda.gov/fdc/v1/foods/search`
- **Propósito:** Buscar alimentos e suas informações nutricionais
- **Dados Fornecidos:** Calorias, proteína, carboidratos, gordura, vitaminas, minerais
- **Autenticação:** Chave API obrigatória
- **Limites:** 3600 requisições/hora

### 2. Google Gemini AI API
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Propósito:** Tradução de alimentos e assistente nutricional
- **Funcionalidades:**
  - Tradução PT-BR → EN e EN → PT-BR
  - Análise personalizada de nutrição
  - Recomendações de refeições
  - Resposta a perguntas sobre nutrição
- **Configuração:** temperature: 0.7 para respostas balanceadas

---

## Como Usar

### Instalação
1. Baixar ou clonar os arquivos do projeto
2. Abrir `index.html` em um navegador web moderno
3. Nenhuma instalação ou build adicional necessário

### Primeiro Uso
1. **Buscar Alimentos:**
   - Ir para a aba "Buscar Alimentos"
   - Digitar nome de um alimento em português (ex: "maçã", "frango")
   - Selecionar o resultado desejado
   - Ajustar a porção em gramas
   - Clicar em "Adicionar"

2. **Visualizar Resumo:**
   - No sidebar, ver consumo do dia
   - Círculo de progresso mostra percentual de calorias consumidas
   - Barras de macronutrientes mostram progressos individuais

3. **Usar Assistente IA:**
   - Ir para aba "Assistente IA"
   - Digitar uma pergunta sobre nutrição
   - Ou clicar em uma pergunta rápida predefinida
   - Receber recomendações personalizadas

4. **Análises:**
   - Ir para aba "Análises"
   - Ver gráfico de distribuição de macros
   - Ver tendência semanal de calorias

5. **Ajustar Metas:**
   - Clicar em "⚙️ Ajustar Metas" no sidebar
   - Modificar valores desejados
   - Clicar em "Salvar Metas"

### Recursos Avançados
- **Exportar Dados:** Função `exportarDados()` disponível via console
- **Histórico:** Último mês de dados mantido automaticamente
- **Sugestões:** Clique em um alimento rápido para busca automática
- **Streak:** Contador de dias consecutivos com registros

---

## Conclusões

O Nutri+ é uma solução completa e moderna para rastreamento nutricional, combinando:

- **Inteligência Artificial** para tradução e recomendações personalizadas
- **Base de dados confiável** (USDA) com informações nutricionais precisas
- **Interface amigável** com design responsivo e intuitivo
- **Persistência de dados** sem necessidade de servidor backend
- **Sem dependências externas** - apenas JavaScript vanilla

A aplicação demonstra como integrar múltiplas APIs em uma experiência fluida, oferecendo funcionalidades enterprise com desenvolvimento frontend puro. Ideal para quem deseja melhorar seus hábitos alimentares com suporte de IA especializada em nutrição.

### Possíveis Melhorias Futuras
- Autenticação de usuários e sincronização cloud
- Integração com wearables (relógios, pulseiras fitness)
- Planos de refeição personalizados
- Receitas baseadas em preferências nutricionais
- Relatórios e exportação em PDF
- App mobile (React Native ou Flutter)
- Detecção de alimentos via câmera
- Comunidade e compartilhamento de progresso

