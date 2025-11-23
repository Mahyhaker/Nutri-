// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
    APIS: {
        USDA_KEY: '1sWezxXtNMD99zbuXc6yatSbhbce9vnpf2Ljjqjm',
        USDA_BASE_URL: 'https://api.nal.usda.gov/fdc/v1',
        GEMINI_KEY: 'AIzaSyCCquoxwHGFMnGBT8nvS0YiujZohXS3uXg',
        GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    },
    DEFAULTS: {
        CALORIE_GOAL: 2000,
        PROTEIN_GOAL: 150,
        CARBS_GOAL: 250,
        FAT_GOAL: 67,
        SEARCH_DELAY: 300,
        TOAST_DURATION: 5000
    },
    STORAGE_KEYS: {
        DAILY_DATA: 'nutriplus_daily_data',
        USER_GOALS: 'nutriplus_user_goals',
        USER_HISTORY: 'nutriplus_user_history'
    }
};

// ===== DICIONÁRIO DE TRADUÇÃO PORTUGUÊS-INGLÊS =====
const TRADUCAO_ALIMENTOS = {
    // Frutas
    'maçã': 'apple',
    'banana': 'banana',
    'laranja': 'orange',
    'uva': 'grape',
    'morango': 'strawberry',
    'abacaxi': 'pineapple',
    'manga': 'mango',
    'pêra': 'pear',
    'limão': 'lemon',
    'melancia': 'watermelon',
    'melão': 'melon',
    'kiwi': 'kiwi',
    'pêssego': 'peach',
    'ameixa': 'plum',
    'cereja': 'cherry',
    'coco': 'coconut',
    'mamão': 'papaya',
    
    // Proteínas
    'frango': 'chicken',
    'peito de frango': 'chicken breast',
    'carne': 'beef',
    'carne bovina': 'beef',
    'porco': 'pork',
    'peixe': 'fish',
    'salmão': 'salmon',
    'atum': 'tuna',
    'ovo': 'egg',
    'ovos': 'eggs',
    'queijo': 'cheese',
    'iogurte': 'yogurt',
    'leite': 'milk',
    'tofu': 'tofu',
    'feijão': 'beans',
    'lentilha': 'lentils',
    'grão de bico': 'chickpeas',
    'camarão': 'shrimp',
    'bacalhau': 'cod',
    
    // Carboidratos
    'arroz': 'rice',
    'arroz integral': 'brown rice',
    'macarrão': 'pasta',
    'massa': 'pasta',
    'pão': 'bread',
    'pão integral': 'whole wheat bread',
    'aveia': 'oats',
    'quinoa': 'quinoa',
    'batata': 'potato',
    'batata doce': 'sweet potato',
    'mandioca': 'cassava',
    'milho': 'corn',
    'trigo': 'wheat',
    'centeio': 'rye',
    'cevada': 'barley',
    
    // Vegetais
    'brócolis': 'broccoli',
    'couve-flor': 'cauliflower',
    'espinafre': 'spinach',
    'alface': 'lettuce',
    'tomate': 'tomato',
    'cenoura': 'carrot',
    'beterraba': 'beetroot',
    'abobrinha': 'zucchini',
    'berinjela': 'eggplant',
    'pimentão': 'bell pepper',
    'cebola': 'onion',
    'alho': 'garlic',
    'couve': 'kale',
    'rúcula': 'arugula',
    'pepino': 'cucumber',
    'aipo': 'celery',
    'aspargo': 'asparagus',
    
    // Nozes e sementes
    'amêndoa': 'almonds',
    'nozes': 'walnuts',
    'castanha': 'nuts',
    'amendoim': 'peanuts',
    'semente de girassol': 'sunflower seeds',
    'semente de abóbora': 'pumpkin seeds',
    'chia': 'chia seeds',
    'linhaça': 'flaxseed',
    
    // Outros
    'azeite': 'olive oil',
    'óleo': 'oil',
    'manteiga': 'butter',
    'açúcar': 'sugar',
    'mel': 'honey',
    'chocolate': 'chocolate',
    'café': 'coffee',
    'chá': 'tea',
    'água': 'water',
    'suco': 'juice',
    'refrigerante': 'soda'
};

// ===== ESTADO GLOBAL DA APLICAÇÃO =====
class AppState {
    constructor() {
        this.dailyLog = [];
        this.selectedFood = null;
        this.searchResults = [];
        this.isTyping = false;
        this.userGoals = this.loadUserGoals();
        this.searchTimeout = null;
        this.currentTab = 'food';
        this.chartInstances = {};
    }

    loadUserGoals() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_GOALS);
            return saved ? JSON.parse(saved) : {
                calories: CONFIG.DEFAULTS.CALORIE_GOAL,
                protein: CONFIG.DEFAULTS.PROTEIN_GOAL,
                carbs: CONFIG.DEFAULTS.CARBS_GOAL,
                fat: CONFIG.DEFAULTS.FAT_GOAL
            };
        } catch (error) {
            console.error('Erro ao carregar metas do usuário:', error);
            return {
                calories: CONFIG.DEFAULTS.CALORIE_GOAL,
                protein: CONFIG.DEFAULTS.PROTEIN_GOAL,
                carbs: CONFIG.DEFAULTS.CARBS_GOAL,
                fat: CONFIG.DEFAULTS.FAT_GOAL
            };
        }
    }

    saveUserGoals() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_GOALS, JSON.stringify(this.userGoals));
        } catch (error) {
            console.error('Erro ao salvar metas do usuário:', error);
        }
    }
}

// Instância global do estado
const state = new AppState();

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    try {
        setupEventListeners();
        setupTabs();
        updateCurrentDate();
        loadDailyData();
        updateInterface();
        updateHeaderStats();
        setupCharacterCounter();
        showToast('Aplicativo carregado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showToast('Erro ao carregar o aplicativo', 'error');
    }
}

function setupEventListeners() {
    // Busca de alimentos
    const foodSearch = document.getElementById('foodSearch');
    foodSearch.addEventListener('keypress', handleFoodSearchKeypress);
    foodSearch.addEventListener('input', handleFoodSearchInput);
    
    // Chat IA
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', handleChatKeypress);
    
    // Botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Fechar modals ao clicar fora
    window.addEventListener('click', handleWindowClick);
}

function setupTabs() {
    const tabs = document.querySelectorAll('.nav-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Atualizar botões
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Atualizar conteúdo
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab + '-tab') {
                    content.classList.add('active');
                }
            });
            
            // Carregar dados específicos da aba
            if (targetTab === 'analytics') {
                setTimeout(() => {
                    updateAnalytics();
                }, 100);
            }
        });
    });
}

function setupCharacterCounter() {
    const chatInput = document.getElementById('chatInput');
    const charCounter = document.getElementById('charCounter');
    
    chatInput.addEventListener('input', () => {
        const count = chatInput.value.length;
        charCounter.textContent = `${count}/500`;
        
        if (count > 450) {
            charCounter.style.color = 'var(--danger-color)';
        } else if (count > 400) {
            charCounter.style.color = 'var(--warning-color)';
        } else {
            charCounter.style.color = 'var(--text-light)';
        }
    });
}

// ===== MANIPULADORES DE EVENTOS =====
function handleFoodSearchKeypress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        buscarAlimentos();
    }
}

function handleFoodSearchInput(e) {
    clearTimeout(state.searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length >= 2) {
        state.searchTimeout = setTimeout(() => {
            showSearchSuggestions(query);
        }, CONFIG.DEFAULTS.SEARCH_DELAY);
    } else {
        hideSearchSuggestions();
    }
}

function handleChatKeypress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensagem();
    }
}

function handleWindowClick(e) {
    if (e.target.classList.contains('modal')) {
        fecharModal(e.target.id);
    }
}

// ===== FUNÇÕES DE DATA E ESTATÍSTICAS =====
function updateCurrentDate() {
    const hoje = new Date();
    const opcoes = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'America/Sao_Paulo'
    };
    document.getElementById('currentDate').textContent = 
        hoje.toLocaleDateString('pt-BR', opcoes);
}

function updateHeaderStats() {
    // Calcular streak de dias consecutivos
    const history = getUserHistory();
    const streak = calculateStreak(history);
    
    // Total de alimentos registrados
    const totalFoods = history.reduce((total, day) => total + day.foods.length, 0);
    
    document.getElementById('streakDays').textContent = streak;
    document.getElementById('totalFoods').textContent = totalFoods;
}

function calculateStreak(history) {
    if (!history.length) return 0;
    
    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
        const dateStr = currentDate.toDateString();
        const dayData = history.find(day => day.date === dateStr);
        
        if (dayData && dayData.foods.length > 0) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (dateStr !== today) {
            break;
        } else {
            currentDate.setDate(currentDate.getDate() - 1);
        }
    }
    
    return streak;
}

// ===== FUNÇÕES DE TRADUÇÃO =====
async function traduzirTermoBusca(termoPortugues) {
    try {
        // Primeiro, verificar no dicionário local
        const termoLower = termoPortugues.toLowerCase();
        
        // Busca exata no dicionário
        if (TRADUCAO_ALIMENTOS[termoLower]) {
            return TRADUCAO_ALIMENTOS[termoLower];
        }
        
        // Busca parcial no dicionário
        for (const [pt, en] of Object.entries(TRADUCAO_ALIMENTOS)) {
            if (termoLower.includes(pt) || pt.includes(termoLower)) {
                return en;
            }
        }
        
        // Se não encontrou no dicionário, usar IA para traduzir
        const prompt = `
        Traduza o seguinte termo de alimento do português para inglês. 
        Retorne APENAS a tradução em inglês, sem explicações ou texto adicional.
        Se for um alimento brasileiro específico, forneça o equivalente mais próximo em inglês.
        
        Termo: ${termoPortugues}
        `;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.1,
                topK: 10,
                topP: 0.8,
                maxOutputTokens: 50,
            }
        };

        const response = await fetch(`${CONFIG.APIS.GEMINI_BASE_URL}?key=${CONFIG.APIS.GEMINI_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Erro na tradução: ${response.status}`);
        }

        const data = await response.json();
        const traducao = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        
        if (traducao) {
            return traducao.toLowerCase();
        } else {
            throw new Error('Resposta inválida da API de tradução');
        }
        
    } catch (error) {
        console.error('Erro na tradução do termo:', error);
        // Se falhar, retornar o termo original
        return termoPortugues;
    }
}

async function traduzirAlimentos(foods) {
    try {
        const foodNames = foods.map(food => food.description);
        const prompt = `
        Traduza os seguintes nomes de alimentos do inglês para o português brasileiro.
        Mantenha as traduções simples e diretas, usando nomes comuns no Brasil.
        Retorne APENAS uma lista com as traduções separadas por quebra de linha, na mesma ordem dos alimentos fornecidos.
        Não inclua numeração, explicações ou texto adicional.
        
        Alimentos para traduzir:
        ${foodNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}
        `;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 512,
            }
        };

        const response = await fetch(`${CONFIG.APIS.GEMINI_BASE_URL}?key=${CONFIG.APIS.GEMINI_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Erro na tradução: ${response.status}`);
        }

        const data = await response.json();
        const translations = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (translations) {
            const translatedNames = translations.trim().split('\n').map(name => name.trim());
            
            return foods.map((food, index) => ({
                ...food,
                translatedName: translatedNames[index] || food.description,
                originalName: food.description
            }));
        } else {
            throw new Error('Resposta inválida da API de tradução');
        }
        
    } catch (error) {
        console.error('Erro na tradução:', error);
        showToast('Erro ao traduzir alimentos. Exibindo nomes originais.', 'warning');
        
        // Retornar com nomes originais se a tradução falhar
        return foods.map(food => ({
            ...food,
            translatedName: food.description,
            originalName: food.description
        }));
    }
}

// ===== FUNÇÕES DE ASSISTENTE IA =====
async function enviarMensagem() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const mensagem = input.value.trim();
    
    if (!mensagem) {
        showToast('Digite uma mensagem', 'warning');
        return;
    }
    
    if (mensagem.length > 500) {
        showToast('Mensagem muito longa. Máximo 500 caracteres.', 'warning');
        return;
    }
    
    // Adicionar mensagem do usuário
    adicionarMensagemUsuario(mensagem);
    input.value = '';
    updateCharacterCounter();
    
    // UI loading state
    setButtonLoading(sendBtn, true);
    mostrarIndicadorDigitacao();
    
    try {
        const resposta = await chamarGeminiAPI(mensagem);
        removerIndicadorDigitacao();
        adicionarMensagemIA(resposta);
        showToast('Resposta recebida!', 'success');
    } catch (error) {
        console.error('Erro ao chamar IA:', error);
        removerIndicadorDigitacao();
        adicionarMensagemIA('⚠ Desculpe, ocorreu um erro ao processar sua mensagem. Verifique sua conexão e tente novamente.');
        showToast('Erro ao comunicar com IA', 'error');
    } finally {
        setButtonLoading(sendBtn, false);
    }
}

async function chamarGeminiAPI(mensagem) {
    const contexto = criarContextoNutricional();
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    const prompt = `
    Você é um assistente nutricional especializado e amigável. Hoje é ${dataAtual}.
    
    ${contexto}
    
    INSTRUÇÕES IMPORTANTES:
    - Seja sempre útil, amigável, motivador e use emojis apropriadamente
    - Forneça informações precisas e baseadas em ciência nutricional
    - Se o usuário pedir análise do dia, use os dados fornecidos acima
    - Sugira melhorias específicas e práticas na alimentação
    - Mantenha respostas concisas mas informativas (máximo 200 palavras)
    - Use linguagem simples e evite jargões excessivos
    - Se não souber algo específico, seja honesto e sugira consultar um profissional
    - Para sugestões de refeições, considere alimentos comuns no Brasil
    
    Pergunta do usuário: ${mensagem}
    `;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };

    const response = await fetch(`${CONFIG.APIS.GEMINI_BASE_URL}?key=${CONFIG.APIS.GEMINI_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro na API Gemini (${response.status}): ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    } else if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        return '⚠️ Desculpe, não posso responder a essa pergunta por questões de segurança. Tente reformular sua pergunta.';
    } else {
        throw new Error('Resposta inválida da API');
    }
}

function criarContextoNutricional() {
    if (state.dailyLog.length === 0) {
        return `
        DADOS NUTRICIONAIS DO USUÁRIO (hoje):
        - O usuário ainda não consumiu nenhum alimento hoje
        - Meta de calorias: ${state.userGoals.calories} kcal
        - Meta de proteína: ${state.userGoals.protein}g
        - Meta de carboidratos: ${state.userGoals.carbs}g  
        - Meta de gordura: ${state.userGoals.fat}g
        `;
    }
    
    const totals = calculateTotals();
    const alimentos = state.dailyLog.map(item => `${item.name} (${item.weight}g)`).join(', ');
    
    const progressoCalorias = Math.round((totals.calories / state.userGoals.calories) * 100);
    const progressoProteina = Math.round((totals.protein / state.userGoals.protein) * 100);
    
    return `
    DADOS NUTRICIONAIS DO USUÁRIO (hoje):
    - Calorias: ${totals.calories}/${state.userGoals.calories} kcal (${progressoCalorias}% da meta)
    - Proteínas: ${totals.protein}/${state.userGoals.protein}g (${progressoProteina}% da meta)
    - Carboidratos: ${totals.carbs}/${state.userGoals.carbs}g
    - Gorduras: ${totals.fat}/${state.userGoals.fat}g
    - Alimentos consumidos: ${alimentos}
    - Número de refeições/lanches registrados: ${state.dailyLog.length}
    `;
}

function adicionarMensagemUsuario(mensagem) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message fade-in';
    messageDiv.innerHTML = `
        <div class="user-avatar">👤</div>
        <div class="message-content">${escapeHtml(mensagem)}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom(chatMessages);
}

function adicionarMensagemIA(mensagem) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message fade-in';
    messageDiv.innerHTML = `
        <div class="ai-avatar">🤖</div>
        <div class="message-content">${formatarMensagemIA(mensagem)}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom(chatMessages);
}

function formatarMensagemIA(mensagem) {
    // Converter markdown simples para HTML
    return mensagem
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
}

function mostrarIndicadorDigitacao() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="ai-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom(chatMessages);
}

function removerIndicadorDigitacao() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function perguntaRapida(pergunta) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = pergunta;
    chatInput.focus();
    enviarMensagem();
}

function scrollToBottom(element) {
    setTimeout(() => {
        element.scrollTop = element.scrollHeight;
    }, 100);
}

function updateCharacterCounter() {
    const chatInput = document.getElementById('chatInput');
    const charCounter = document.getElementById('charCounter');
    const count = chatInput.value.length;
    charCounter.textContent = `${count}/500`;
}

// ===== FUNÇÕES DE ANALYTICS =====
function updateAnalytics() {
    updateMacroChart();
    updateWeeklyChart();
}

function updateMacroChart() {
    const canvas = document.getElementById('macroChart');
    const ctx = canvas.getContext('2d');
    const totals = calculateTotals();
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const total = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9; // Calorias por macro
    if (total === 0) {
        drawEmptyChart(ctx, canvas);
        return;
    }
    
    const proteinCals = totals.protein * 4;
    const carbsCals = totals.carbs * 4;
    const fatCals = totals.fat * 9;
    
    const proteinPercent = (proteinCals / total) * 100;
    const carbsPercent = (carbsCals / total) * 100;
    const fatPercent = (fatCals / total) * 100;
    
    // Atualizar legendas
    document.getElementById('proteinPercent').textContent = `${proteinPercent.toFixed(1)}%`;
    document.getElementById('carbsPercent').textContent = `${carbsPercent.toFixed(1)}%`;
    document.getElementById('fatPercent').textContent = `${fatPercent.toFixed(1)}%`;
    
    // Desenhar gráfico de pizza
    drawPieChart(ctx, canvas, [
        { value: proteinPercent, color: '#ff6b6b', label: 'Proteínas' },
        { value: carbsPercent, color: '#feca57', label: 'Carboidratos' },
        { value: fatPercent, color: '#1dd1a1', label: 'Gorduras' }
    ]);
}

function drawPieChart(ctx, canvas, data) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach(slice => {
        if (slice.value > 0) {
            const sliceAngle = (slice.value / 100) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = slice.color;
            ctx.fill();
            
            currentAngle += sliceAngle;
        }
    });
    
    // Desenhar círculo branco no centro para efeito donut
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

function drawEmptyChart(ctx, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#e1e8ed';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Sem dados', centerX, centerY);
}

function updateWeeklyChart() {
    const chartDiv = document.getElementById('weeklyChart');
    const history = getUserHistory();
    
    if (history.length === 0) {
        chartDiv.innerHTML = '<div class="chart-placeholder">📈 Adicione alimentos para ver suas tendências semanais</div>';
        return;
    }
    
    // Pegar últimos 7 dias
    const last7Days = getLast7Days();
    const chartData = last7Days.map(date => {
        const dayData = history.find(h => h.date === date.toDateString());
        const dayTotals = dayData ? calculateDayTotals(dayData.foods) : { calories: 0 };
        return {
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            calories: dayTotals.calories
        };
    });
    
    renderWeeklyChart(chartDiv, chartData);
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date);
    }
    return days;
}

function calculateDayTotals(foods) {
    return foods.reduce((totals, item) => ({
        calories: totals.calories + (item.calories || 0),
        protein: totals.protein + (item.protein || 0),
        carbs: totals.carbs + (item.carbs || 0),
        fat: totals.fat + (item.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function renderWeeklyChart(container, data) {
    const maxCalories = Math.max(...data.map(d => d.calories), state.userGoals.calories);
    const chartHeight = 200;
    
    const chartHTML = `
        <div class="weekly-chart-container" style="height: ${chartHeight}px; position: relative;">
            <div class="chart-goal-line" style="position: absolute; top: ${chartHeight - (state.userGoals.calories / maxCalories) * chartHeight}px; width: 100%; height: 2px; background: var(--primary-color); opacity: 0.5;"></div>
            <div class="chart-bars" style="display: flex; align-items: end; height: 100%; gap: 8px; padding: 10px;">
                ${data.map(day => `
                    <div class="chart-bar" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                        <div class="bar" style="
                            width: 100%; 
                            height: ${(day.calories / maxCalories) * (chartHeight - 40)}px; 
                            background: linear-gradient(to top, var(--primary-color), var(--secondary-color));
                            border-radius: 4px 4px 0 0;
                            min-height: ${day.calories > 0 ? '4px' : '0'};
                            margin-bottom: 8px;
                        "></div>
                        <div class="bar-label" style="font-size: 0.8rem; color: var(--text-secondary);">${day.date}</div>
                        <div class="bar-value" style="font-size: 0.7rem; color: var(--text-primary); font-weight: 600;">${day.calories}</div>
                    </div>
                `).join('')}
            </div>
            <div class="chart-goal-label" style="position: absolute; right: 10px; top: ${chartHeight - (state.userGoals.calories / maxCalories) * chartHeight - 15}px; font-size: 0.7rem; color: var(--primary-color); font-weight: 600;">Meta: ${state.userGoals.calories} kcal</div>
        </div>
    `;
    
    container.innerHTML = chartHTML;
}

// ===== FUNÇÕES DE MODALS E CONFIGURAÇÕES =====
function abrirConfiguracoesMetas() {
    const modal = document.getElementById('goalSettingsModal');
    
    // Preencher valores atuais
    document.getElementById('calorieGoalInput').value = state.userGoals.calories;
    document.getElementById('proteinGoalInput').value = state.userGoals.protein;
    document.getElementById('carbsGoalInput').value = state.userGoals.carbs;
    document.getElementById('fatGoalInput').value = state.userGoals.fat;
    
    modal.classList.add('show');
    modal.style.display = 'flex';
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function salvarMetas() {
    const calories = parseInt(document.getElementById('calorieGoalInput').value);
    const protein = parseInt(document.getElementById('proteinGoalInput').value);
    const carbs = parseInt(document.getElementById('carbsGoalInput').value);
    const fat = parseInt(document.getElementById('fatGoalInput').value);
    
    // Validação
    if (calories < 1000 || calories > 5000) {
        showToast('Meta de calorias deve estar entre 1000 e 5000 kcal', 'warning');
        return;
    }
    
    if (protein < 50 || protein > 300) {
        showToast('Meta de proteína deve estar entre 50 e 300g', 'warning');
        return;
    }
    
    // Salvar novas metas
    state.userGoals = { calories, protein, carbs, fat };
    state.saveUserGoals();
    
    // Atualizar interface
    updateInterface();
    fecharModal('goalSettingsModal');
    showToast('Metas atualizadas com sucesso!', 'success');
}

// ===== FUNÇÕES DE ARMAZENAMENTO =====
function saveDailyData() {
    try {
        const today = new Date().toDateString();
        const dailyData = {
            date: today,
            foods: state.dailyLog,
            goals: state.userGoals,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.DAILY_DATA, JSON.stringify(dailyData));
        
        // Atualizar histórico
        updateUserHistory(dailyData);
        
    } catch (error) {
        console.error('Erro ao salvar dados diários:', error);
        showToast('Erro ao salvar dados', 'error');
    }
}

function loadDailyData() {
    try {
        const savedData = localStorage.getItem(CONFIG.STORAGE_KEYS.DAILY_DATA);
        if (!savedData) {
            state.dailyLog = [];
            return;
        }
        
        const data = JSON.parse(savedData);
        const today = new Date().toDateString();
        
        if (data.date === today) {
            state.dailyLog = data.foods || [];
        } else {
            state.dailyLog = [];
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados diários:', error);
        state.dailyLog = [];
    }
}

function getUserHistory() {
    try {
        const history = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_HISTORY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        return [];
    }
}

function updateUserHistory(dailyData) {
    try {
        let history = getUserHistory();
        
        // Remover entrada existente do mesmo dia
        history = history.filter(entry => entry.date !== dailyData.date);
        
        // Adicionar nova entrada
        if (dailyData.foods.length > 0) {
            history.push(dailyData);
        }
        
        // Manter apenas últimos 30 dias
        history = history.slice(-30);
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_HISTORY, JSON.stringify(history));
    } catch (error) {
        console.error('Erro ao atualizar histórico:', error);
    }
}

// ===== FUNÇÕES UTILITÁRIAS =====
function setButtonLoading(button, isLoading) {
    const textSpan = button.querySelector('.btn-text');
    const loaderSpan = button.querySelector('.btn-loader');
    
    if (isLoading) {
        button.disabled = true;
        if (textSpan) textSpan.style.display = 'none';
        if (loaderSpan) loaderSpan.style.display = 'inline';
    } else {
        button.disabled = false;
        if (textSpan) textSpan.style.display = 'inline';
        if (loaderSpan) loaderSpan.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '⚠ ', 
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-title">${icons[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
    `;
    
    container.appendChild(toast);
    
    // Auto remove toast
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.5s ease-in forwards';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 500);
    }, CONFIG.DEFAULTS.TOAST_DURATION);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ===== FUNÇÕES DE BUSCA DE ALIMENTOS =====
async function buscarAlimentos() {
    const input = document.getElementById('foodSearch');
    const resultsDiv = document.getElementById('searchResults');
    const searchBtn = document.getElementById('searchBtn');
    
    const termoOriginal = input.value.trim();
    if (!termoOriginal) {
        showToast('Digite o nome de um alimento', 'warning');
        return;
    }

    // UI Loading state
    setButtonLoading(searchBtn, true);
    resultsDiv.innerHTML = '<div class="loading">🔍 Traduzindo termo de busca...</div>';
    resultsDiv.style.display = 'block';
    hideSearchSuggestions();

    try {
        // Primeiro, traduzir o termo para inglês
        const termoIngles = await traduzirTermoBusca(termoOriginal);
        
        resultsDiv.innerHTML = `<div class="loading">🔍 Buscando "${termoOriginal}" (${termoIngles}) na base de dados...</div>`;
        
        const response = await fetch(
            `${CONFIG.APIS.USDA_BASE_URL}/foods/search?query=${encodeURIComponent(termoIngles)}&api_key=${CONFIG.APIS.USDA_KEY}&pageSize=12&dataType=Foundation,SR%20Legacy`
        );
        
        if (!response.ok) {
            throw new Error(`Erro na API USDA: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.foods && data.foods.length > 0) {
            state.searchResults = data.foods;
            await mostrarResultados(data.foods);
            showToast(`${data.foods.length} alimentos encontrados para "${termoOriginal}"`, 'success');
        } else {
            resultsDiv.innerHTML = `<div class="error">⚠ Nenhum alimento encontrado para "${termoOriginal}". Tente termos diferentes como "frango", "arroz", "maçã".</div>`;
        }

    } catch (error) {
        console.error('Erro na busca:', error);
        resultsDiv.innerHTML = `<div class="error">⚠ Erro ao buscar alimentos: ${error.message}</div>`;
        showToast('Erro ao buscar alimentos', 'error');
    } finally {
        setButtonLoading(searchBtn, false);
    }
}

async function mostrarResultados(foods) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<div class="loading">🔄 Traduzindo nomes dos alimentos...</div>';

    // Traduzir os nomes dos alimentos
    const translatedFoods = await traduzirAlimentos(foods);
    
    resultsDiv.innerHTML = '';

    translatedFoods.forEach((food, index) => {
        const nutrients = extractNutrients(food.foodNutrients);
        const calories = nutrients.energy || 0;

        const foodDiv = document.createElement('div');
        foodDiv.className = 'food-result fade-in';
        foodDiv.style.animationDelay = `${index * 0.1}s`;
        foodDiv.onclick = () => selecionarAlimento(index);

        foodDiv.innerHTML = `
            <div class="food-name">${food.translatedName}</div>
            <div class="food-original-name">${food.description}</div>
            <div class="food-calories">🔥 ${Math.round(calories)} kcal / 100g</div>
            <div class="food-nutrients">
                <span>💪 Proteína: ${nutrients.protein?.toFixed(1) || 'N/A'}g</span>
                <span>🌾 Carbs: ${nutrients.carbs?.toFixed(1) || 'N/A'}g</span>
                <span>🥑 Gordura: ${nutrients.fat?.toFixed(1) || 'N/A'}g</span>
            </div>
            <div class="portion-input" id="portion-${index}">
                <span>📏 Porção (g):</span>
                <input type="number" value="100" min="1" max="2000" step="1" id="weight-${index}" 
                       onchange="validatePortion(this)" autocomplete="off">
                <button class="btn btn-success" onclick="adicionarAlimento(${index}, event)">
                    ➕ Adicionar
                </button>
            </div>
        `;

        resultsDiv.appendChild(foodDiv);
    });

    // Atualizar os resultados de busca com as traduções
    state.searchResults = translatedFoods;
}

function extractNutrients(foodNutrients) {
    const nutrients = {};
    
    foodNutrients.forEach(nutrient => {
        const name = nutrient.nutrientName?.toLowerCase() || '';
        const value = nutrient.value || 0;
        
        if (name.includes('energy')) {
            nutrients.energy = value;
        } else if (name.includes('protein')) {
            nutrients.protein = value;
        } else if (name.includes('carbohydrate')) {
            nutrients.carbs = value;
        } else if (name.includes('total lipid') || name.includes('fat')) {
            nutrients.fat = value;
        }
    });
    
    return nutrients;
}

function validatePortion(input) {
    const value = parseInt(input.value);
    if (value < 1) input.value = 1;
    if (value > 2000) input.value = 2000;
}

function selecionarAlimento(index) {
    // Remover seleção anterior
    document.querySelectorAll('.food-result').forEach(el => {
        el.classList.remove('selected');
        const portionInput = el.querySelector('.portion-input');
        if (portionInput) portionInput.classList.remove('show');
    });

    // Selecionar novo
    const foodElement = document.querySelectorAll('.food-result')[index];
    foodElement.classList.add('selected');
    
    const portionInput = foodElement.querySelector('.portion-input');
    if (portionInput) {
        portionInput.classList.add('show');
        // Focar no input de peso
        setTimeout(() => {
            const weightInput = portionInput.querySelector('input');
            if (weightInput) {
                weightInput.focus();
                weightInput.select();
            }
        }, 100);
    }
    
    state.selectedFood = state.searchResults[index];
}

async function adicionarAlimento(index, event) {
    const weightInput = document.getElementById(`weight-${index}`);
    const weight = parseInt(weightInput.value);
    
    if (!weight || weight <= 0) {
        showToast('Digite uma porção válida (maior que 0g)', 'warning');
        weightInput.focus();
        return;
    }

    const food = state.searchResults[index];
    const multiplier = weight / 100;
    const nutrients = extractNutrients(food.foodNutrients);

    const logItem = {
        id: Date.now() + Math.random(),
        name: food.translatedName || food.description,
        originalName: food.originalName || food.description,
        weight: weight,
        calories: Math.round((nutrients.energy || 0) * multiplier),
        protein: Math.round((nutrients.protein || 0) * multiplier * 10) / 10,
        carbs: Math.round((nutrients.carbs || 0) * multiplier * 10) / 10,
        fat: Math.round((nutrients.fat || 0) * multiplier * 10) / 10,
        timestamp: new Date().toISOString()
    };

    state.dailyLog.push(logItem);
    saveDailyData();
    updateInterface();
    updateHeaderStats();
    
    // Feedback visual
    const btn = event.target;
    setButtonLoading(btn, true);
    btn.textContent = '✅ Adicionado!';
    btn.style.background = 'var(--success-color)';
    
    setTimeout(() => {
        setButtonLoading(btn, false);
        btn.innerHTML = '➕ Adicionar';
        btn.style.background = '';
    }, 2000);
    
    showToast(`${food.translatedName || food.description} (${weight}g) adicionado com sucesso!`, 'success');
    
    // Limpar seleção após 3 segundos
    setTimeout(() => {
        limparBusca();
    }, 3000);
}

function removerAlimento(id) {
    const foodItem = state.dailyLog.find(item => item.id === id);
    if (!foodItem) return;
    
    if (confirm(`Remover ${foodItem.name} do registro?`)) {
        state.dailyLog = state.dailyLog.filter(item => item.id !== id);
        saveDailyData();
        updateInterface();
        updateHeaderStats();
        showToast(`${foodItem.name} removido`, 'success');
    }
}

function limparLog() {
    if (state.dailyLog.length === 0) return;
    
    if (confirm('Tem certeza que deseja limpar todo o registro do dia?')) {
        state.dailyLog = [];
        saveDailyData();
        updateInterface();
        updateHeaderStats();
        showToast('Registro do dia limpo', 'success');
    }
}

function buscarRapido(termo) {
    const input = document.getElementById('foodSearch');
    input.value = termo;
    input.focus();
    buscarAlimentos();
}

function limparBusca() {
    document.getElementById('foodSearch').value = '';
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.style.display = 'none';
    resultsDiv.innerHTML = '';
    state.selectedFood = null;
    state.searchResults = [];
    hideSearchSuggestions();
}

// ===== FUNÇÕES DE SUGESTÕES DE BUSCA =====
function showSearchSuggestions(query) {
    // Sugestões em português baseadas no dicionário
    const suggestions = Object.keys(TRADUCAO_ALIMENTOS);
    
    const filtered = suggestions.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    if (filtered.length === 0) return;
    
    const suggestionsDiv = document.getElementById('searchSuggestions');
    suggestionsDiv.innerHTML = filtered.map(item => 
        `<div class="suggestion-item" onclick="selectSuggestion('${item}')">${item}</div>`
    ).join('');
    suggestionsDiv.style.display = 'block';
}

function hideSearchSuggestions() {
    const suggestionsDiv = document.getElementById('searchSuggestions');
    suggestionsDiv.style.display = 'none';
}

function selectSuggestion(suggestion) {
    document.getElementById('foodSearch').value = suggestion;
    hideSearchSuggestions();
    buscarAlimentos();
}

// ===== FUNÇÕES DE INTERFACE =====
function updateInterface() {
    updateSummary();
    updateFoodLog();
    updateGoalProgress();
}

function updateSummary() {
    const totals = calculateTotals();
    
    // Atualizar valores exibidos
    document.getElementById('caloriesConsumed').textContent = totals.calories;
    document.getElementById('calorieGoal').textContent = state.userGoals.calories;
    document.getElementById('proteinValue').textContent = `${totals.protein}g`;
    document.getElementById('carbsValue').textContent = `${totals.carbs}g`;
    document.getElementById('fatValue').textContent = `${totals.fat}g`;
    
    // Atualizar percentual de calorias
    const caloriesPercent = Math.round((totals.calories / state.userGoals.calories) * 100);
    document.getElementById('caloriesPercentage').textContent = `${caloriesPercent}%`;
    
    // Atualizar círculo de progresso das calorias
    const progressPercent = Math.min((totals.calories / state.userGoals.calories) * 100, 100);
    const circle = document.getElementById('caloriesCircle');
    circle.style.setProperty('--progress', progressPercent + '%');
    
    // Mudar cor baseada no progresso
    if (progressPercent >= 90) {
        circle.style.background = `conic-gradient(from 0deg, var(--success-color) ${progressPercent}%, var(--bg-tertiary) ${progressPercent}%)`;
    } else if (progressPercent >= 70) {
        circle.style.background = `conic-gradient(from 0deg, var(--warning-color) ${progressPercent}%, var(--bg-tertiary) ${progressPercent}%)`;
    } else {
        circle.style.background = `conic-gradient(from 0deg, var(--primary-color) ${progressPercent}%, var(--bg-tertiary) ${progressPercent}%)`;
    }
}

function updateGoalProgress() {
    const totals = calculateTotals();
    
    // Atualizar barras de progresso dos macros
    updateMacroProgress('protein', totals.protein, state.userGoals.protein);
    updateMacroProgress('carbs', totals.carbs, state.userGoals.carbs);
    updateMacroProgress('fat', totals.fat, state.userGoals.fat);
}

function updateMacroProgress(macro, current, goal) {
    const progressBar = document.getElementById(`${macro}Progress`);
    if (!progressBar) return;
    
    const percent = Math.min((current / goal) * 100, 100);
    progressBar.style.width = `${percent}%`;
    
    // Adicionar classe de estado baseada no progresso
    const macroItem = progressBar.closest('.macro-item');
    macroItem.classList.remove('low', 'good', 'high');
    
    if (percent < 50) {
        macroItem.classList.add('low');
    } else if (percent <= 100) {
        macroItem.classList.add('good');
    } else {
        macroItem.classList.add('high');
    }
}

function updateFoodLog() {
    const logDiv = document.getElementById('foodLog');
    const clearBtn = document.getElementById('clearLogBtn');
    
    if (state.dailyLog.length === 0) {
        logDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🍽️</div>
                <p>Nenhum alimento adicionado ainda.<br>Comece buscando um alimento!</p>
            </div>
        `;
        clearBtn.style.display = 'none';
        return;
    }

    clearBtn.style.display = 'block';
    
    // Ordenar por timestamp (mais recente primeiro)
    const sortedLog = [...state.dailyLog].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    logDiv.innerHTML = sortedLog.map((item, index) => `
        <div class="log-item fade-in" style="animation-delay: ${index * 0.1}s">
            <div class="log-food">
                <div class="log-food-name">${item.name}</div>
                <div class="log-food-portion">${item.weight}g • ${new Date(item.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</div>
            </div>
            <div class="log-calories">${item.calories} kcal</div>
            <button class="btn btn-danger" onclick="removerAlimento('${item.id}')" title="Remover alimento">
                🗑️
            </button>
        </div>
    `).join('');
}

function calculateTotals() {
    return state.dailyLog.reduce((totals, item) => ({
        calories: totals.calories + (item.calories || 0),
        protein: Math.round((totals.protein + (item.protein || 0)) * 10) / 10,
        carbs: Math.round((totals.carbs + (item.carbs || 0)) * 10) / 10,
        fat: Math.round((totals.fat + (item.fat || 0)) * 10) / 10
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

// ===== CSS ADICIONAL PARA ANIMAÇÕES =====
const additionalCSS = `
    @keyframes toastSlideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .suggestion-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        border-bottom: 1px solid var(--bg-tertiary);
    }
    
    .suggestion-item:hover {
        background: var(--bg-secondary);
    }
    
    .suggestion-item:last-child {
        border-bottom: none;
    }
    
    .macro-item.low {
        border-left: 4px solid var(--warning-color);
    }
    
    .macro-item.good {
        border-left: 4px solid var(--success-color);
    }
    
    .macro-item.high {
        border-left: 4px solid var(--danger-color);
    }
    
    .weekly-chart-container {
        border: 1px solid var(--bg-tertiary);
        border-radius: var(--radius-md);
        background: var(--bg-secondary);
    }
    
    .chart-bars .chart-bar:hover .bar {
        opacity: 0.8;
        transform: scaleY(1.05);
        transition: all 0.2s ease;
    }
`;

// Adicionar CSS adicional ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// ===== FUNCIONALIDADES EXTRAS =====
function switchTab(tabName) {
    state.currentTab = tabName;
    
    // Salvar preferência de aba
    try {
        localStorage.setItem('nutriplus_current_tab', tabName);
    } catch (error) {
        console.error('Erro ao salvar preferência de aba:', error);
    }
}

function loadTabPreference() {
    try {
        const savedTab = localStorage.getItem('nutriplus_current_tab');
        if (savedTab) {
            const tabButton = document.querySelector(`[data-tab="${savedTab}"]`);
            if (tabButton) {
                tabButton.click();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar preferência de aba:', error);
    }
}

// Carregar preferência de aba após inicialização
setTimeout(() => {
    loadTabPreference();
}, 500);

// ===== EVENT LISTENERS GLOBAIS =====
window.addEventListener('beforeunload', () => {
    saveDailyData();
});

window.addEventListener('online', () => {
    showToast('Conexão reestabelecida', 'success');
});

window.addEventListener('offline', () => {
    showToast('Sem conexão com a internet', 'warning');
});

// ===== PERFORMANCE E OTIMIZAÇÕES =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce para funções de busca
const debouncedSearch = debounce(buscarAlimentos, 500);

// ===== FUNCIONALIDADES EXPERIMENTAIS =====
function exportarDados() {
    try {
        const data = {
            dailyLog: state.dailyLog,
            userGoals: state.userGoals,
            history: getUserHistory(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutri-plus-dados-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        showToast('Erro ao exportar dados', 'error');
    }
}

// Expor funções globalmente para uso nos botões HTML
window.buscarAlimentos = buscarAlimentos;
window.buscarRapido = buscarRapido;
window.adicionarAlimento = adicionarAlimento;
window.removerAlimento = removerAlimento;
window.limparLog = limparLog;
window.enviarMensagem = enviarMensagem;
window.perguntaRapida = perguntaRapida;
window.abrirConfiguracoesMetas = abrirConfiguracoesMetas;
window.fecharModal = fecharModal;
window.salvarMetas = salvarMetas;
window.selectSuggestion = selectSuggestion;
window.validatePortion = validatePortion;
window.exportarDados = exportarDados;

console.log('🍎 Nutri+ carregado com sucesso!');
console.log('Versão: 2.1.0 - COM BUSCA EM PORTUGUÊS');
console.log('Funcionalidades ativas: Busca em PT-BR, Tradução bidirecional, IA, Analytics, Configurações');

// ===== TRATAMENTO DE ERROS GLOBAL =====
window.addEventListener('error', (event) => {
    console.error('Erro global capturado:', event.error);
    showToast('Ocorreu um erro inesperado', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada não tratada:', event.reason);
    showToast('Erro de conectividade', 'error');
    event.preventDefault();
});