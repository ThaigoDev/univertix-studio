const analysisForm = document.getElementById('analysisForm');
const contentInput = document.getElementById('content');
const loadingDiv = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const resultContentDiv = document.getElementById('result-content'); // Este div mostrará o texto completo da análise
const errorDiv = document.getElementById('error');
const submitBtn = document.querySelector('.submit-btn');
const chartCanvas = document.getElementById('analysisChart');
const progressionChartCanvas = document.getElementById('progressionChart');

// Elementos para as novas seções
const keywordsList = document.getElementById('keywordsList');
const sentimentText = document.getElementById('sentimentText');
const readabilityText = document.getElementById('readabilityText');
const titlesList = document.getElementById('titlesList');
const toneText = document.getElementById('toneText');

// Seções pai para controle de exibição
const keywordsSection = document.getElementById('keywordsSection');
const sentimentSection = document.getElementById('sentimentSection');
const readabilitySection = document.getElementById('readabilitySection');
const titlesSection = document.getElementById('titlesSection');
const toneSection = document.getElementById('toneSection');


let analysisChart = null;
let progressionChart = null;

// Confirme que esta URL é o endpoint correto da sua API no Render.com
const API_ENDPOINT = 'https://create-caption-app.onrender.com/analise-content';

const criteriaNames = [
    "Abertura Impactante",
    "Originalidade e Autenticidade",
    "Mensagem Central Clara",
    "Tom de Voz Coerente",
    "Conexão com o Público-Alvo",
    "Chamada para Ação (CTA)",
    "Identidade Univértix",
    "Uso inteligente de Emojis e Formatação",
    "Hashtags relevantes"
];

analysisForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const content = contentInput.value.trim();

    if (!content) {
        alert('Por favor, insira o conteúdo para análise.');
        return;
    }

    // Esconde resultados/erros anteriores e mostra o carregamento
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    loadingDiv.style.display = 'block';
    submitBtn.disabled = true; // Desabilita o botão para evitar múltiplos envios

    // O prompt foi desenhado para sua API retornar o texto e as pontuações no formato esperado
    // Adicionamos instruções para as novas análises.
    const analysisPrompt = `
        ✅ 🎯 Prompt para análise de conteúdo (baseado em critérios)
        Analise o conteúdo abaixo com base nos critérios estabelecidos para legendas/roteiros da Univértix. Forneça uma avaliação crítica, pontuando os pontos fortes, os pontos de melhoria e sugestões práticas.

        Conteúdo a ser analisado:
        "${content}"

        🧩 Critérios de análise:
        Abertura Impactante:
        A primeira frase prende a atenção? Causa surpresa, curiosidade ou emoção?

        Originalidade e Autenticidade:
        O texto evita frases clichês e previsíveis? Ele soa verdadeiro e alinhado ao estilo único da Univértix?

        Mensagem Central Clara:
        A ideia principal do conteúdo está clara e bem desenvolvida?

        Tom de Voz Coerente:
        O tom é leve, ousado, institucional ou emocional, conforme necessário?

        Conexão com o Público-Alvo:
        O conteúdo conversa com o público específico de forma assertiva e empática?

        Chamada para Ação (CTA):
        O CTA está presente, claro e coerente com o conteúdo?

        Identidade Univértix:
        O texto expressa valores como ousadia, protagonismo e o lema "feito por você"?

        Uso inteligente de Emojis e Formatação:
        Emojis foram usados com propósito? O uso de caixa alta, quebras e pontuações está bem estruturado?

        Hashtags relevantes (se aplicável):
        As hashtags são coerentes, estratégicas e agregam valor ao conteúdo?

        📝 Estrutura da resposta esperada:
        ✅ Resumo geral da análise
        ✅ Pontos fortes destacados
        ⚠️ Oportunidades de melhoria
        ✍️ Sugestões práticas de reescrita (se necessário)

        📊 Pontuações dos Critérios (0-5, onde 0 = Não atende, 5 = Atende plenamente). PARA CADA CRITÉRIO, RETORNE APENAS O NÚMERO ENTRE COLCHETES. Exemplo: Abertura Impactante: [4]
        Abertura Impactante: [PONTUACAO]
        Originalidade e Autenticidade: [PONTUACAO]
        Mensagem Central Clara: [PONTUACAO]
        Tom de Voz Coerente: [PONTUACAO]
        Conexão com o Público-Alvo: [PONTUACAO]
        Chamada para Ação (CTA): [PONTUACAO]
        Identidade Univértix: [PONTUACAO]
        Uso inteligente de Emojis e Formatação: [PONTUACAO]
        Hashtags relevantes: [PONTUACAO]

        📈 Potencial de Alcance Estimado:
        Qual a probabilidade percentual (0-100%) deste conteúdo atingir seu público-alvo e gerar engajamento significativo? RETORNE APENAS O NÚMERO ENTRE COLCHETES SEGUIDO DO SINAL DE PORCENTAGEM. Exemplo: [65]%
        [PERCENTUAL]%

        --- NOVAS ANÁLISES ---

        🔑 Palavras-chave e Relevância:
        Por favor, liste 3-5 palavras-chave principais do conteúdo e sua relevância percebida para o tema e público-alvo (Baixa, Média, Alta).
        Exemplo:
        - PALAVRA1: Relevância
        - PALAVRA2: Relevância

        😊 Sentimento do Conteúdo:
        Classifique o sentimento geral predominante no texto (Positivo, Neutro, Negativo) e estime sua intensidade em porcentagem (0-100%).
        Exemplo: SENTIMENTO (PORCENTAGEM%)

        📚 Nível de Leitura:
        Estime a facilidade de leitura do conteúdo (Fácil, Médio, Complexo) e forneça um índice numérico de legibilidade (escala de 0-100, onde maior é mais fácil de ler, ou equivalente ao Flesch-Kincaid Grade Level).
        Exemplo: NÍVEL (Pontuação: NUMERO)

        ✨ Títulos Sugeridos:
        Gere 3 sugestões de títulos alternativos e otimizados para este conteúdo, pensando em engajamento.
        Exemplo:
        1. SUGESTÃO 1
        2. SUGESTÃO 2
        3. SUGESTÃO 3

        🎭 Variação de Tom:
        Descreva brevemente a variação de tom presente no conteúdo, se houver, ou se o tom é consistente. Identifique se há momentos de tom mais formal, informal, inspirador, informativo, etc.
        Exemplo: O tom é predominantemente informativo, mas transita para um tom inspirador no final para o CTA.

        Responda de forma clara, objetiva e com foco em evolução criativa.
    `;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: analysisPrompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const fullAnalysis = data.analise;
        console.log("Resposta completa da API:", fullAnalysis); // Ótimo para depuração!

        // Extrai todas as informações da string completa
        const results = parseAnalysisResults(fullAnalysis);

        // Exibe o texto completo da análise (incluindo as partes de pontuação)
        resultContentDiv.innerText = fullAnalysis.trim();

        // Renderiza o gráfico de radar se houver pontuações válidas
        if (Object.keys(results.scores).length > 0) {
            console.log("Pontuações extraídas para o gráfico de Radar:", results.scores);
            renderChart(results.scores);
        } else {
            console.warn("Nenhuma pontuação de critério encontrada. O gráfico de radar não será renderizado.");
            if (analysisChart) { analysisChart.destroy(); analysisChart = null; }
        }

        // Renderiza o gráfico de progressão se o potencial de alcance for válido
        if (results.progression !== null) {
            console.log("Potencial de Alcance extraído para o gráfico de Progressão:", results.progression);
            renderProgressionChart(results.progression);
        } else {
            console.warn("Não foi possível extrair o Potencial de Alcance. O gráfico de progressão não será renderizado.");
            if (progressionChart) { progressionChart.destroy(); progressionChart = null; }
        }

        // Renderiza as novas seções
        renderNewSections(results);

        resultDiv.style.display = 'block'; // Mostra a seção de resultados

    } catch (error) {
        console.error('Erro ao realizar a análise:', error);
        errorDiv.style.display = 'block'; // Mostra a mensagem de erro
        // Garante que os gráficos anteriores sejam destruídos em caso de erro
        if (analysisChart) { analysisChart.destroy(); analysisChart = null; }
        if (progressionChart) { progressionChart.destroy(); progressionChart = null; }
        hideNewSections(); // Esconde as novas seções em caso de erro
    } finally {
        loadingDiv.style.display = 'none'; // Esconde o spinner de carregamento
        submitBtn.disabled = false; // Reabilita o botão
    }
});

/**
 * Função para extrair todas as informações relevantes do texto completo da análise.
 */
function parseAnalysisResults(text) {
    const results = {
        scores: {},
        progression: null,
        keywords: [],
        sentiment: { text: null, percentage: null },
        readability: { level: null, score: null },
        suggestedTitles: [],
        toneVariation: null
    };

    // 1. Pontuações dos Critérios
    // Esta regex foi ajustada para ser mais robusta, capturando qualquer texto até o ':'
    // e depois o número entre colchetes (opcionalmente) ou o número direto.
    const scoreMatches = text.matchAll(/(.*?):\s*\[?(\d+)\]?/g);
    for (const match of scoreMatches) {
        const criterionRaw = match[1]?.trim();
        const score = parseInt(match[2], 10);
        const foundCriterion = criteriaNames.find(name => criterionRaw.includes(name));
        if (foundCriterion) {
            results.scores[foundCriterion] = score;
        }
    }

    // 2. Potencial de Alcance Estimado (regex anterior, que já lida com aspas e texto intermediário)
    // A regex foi ligeiramente ajustada para capturar o grupo principal de maneira mais direta se aspas não forem mais problema.
    // Se o problema das aspas voltar, use: `.*?("?\[?(\d+)%\]?"?)/s` e `progressionMatch[2]`
    const progressionMatch = text.match(/Potencial de Alcance Estimado:.*?\[?(\d+)%\]?/s);
    if (progressionMatch && progressionMatch[1]) {
        results.progression = parseInt(progressionMatch[1], 10);
    }


    // 3. Palavras-chave e Relevância
    const keywordsSectionMatch = text.match(/🔑 Palavras-chave e Relevância:\s*([\s\S]*?)(?=\n\n😊 Sentimento do Conteúdo:|\n\n📚 Nível de Leitura:|\n\n✨ Títulos Sugeridos:|\n\n🎭 Variação de Tom:|\n---|$)/);
    if (keywordsSectionMatch && keywordsSectionMatch[1]) {
        const keywordLines = keywordsSectionMatch[1].trim().split('\n');
        results.keywords = keywordLines.map(line => {
            const parts = line.match(/-\s*(.*?):\s*(.*)/); // Ex: - PALAVRA1: Relevância
            if (parts && parts[1] && parts[2]) {
                return { keyword: parts[1].trim(), relevance: parts[2].trim() };
            }
            return null;
        }).filter(Boolean); // Remove null entries
    }

    // 4. Sentimento do Conteúdo
    const sentimentMatch = text.match(/😊 Sentimento do Conteúdo:\s*(.+?)\s*\((\d+)%\)/); // Ex: SENTIMENTO (PORCENTAGEM%)
    if (sentimentMatch && sentimentMatch[1] && sentimentMatch[2]) {
        results.sentiment.text = sentimentMatch[1].trim();
        results.sentiment.percentage = parseInt(sentimentMatch[2], 10);
    }

    // 5. Nível de Leitura (Legibilidade)
    const readabilityMatch = text.match(/📚 Nível de Leitura:\s*(.+?)\s*\(Pontuação:\s*(\d+)\)/); // Ex: NÍVEL (Pontuação: NUMERO)
    if (readabilityMatch && readabilityMatch[1] && readabilityMatch[2]) {
        results.readability.level = readabilityMatch[1].trim();
        results.readability.score = parseInt(readabilityMatch[2], 10);
    }

    // 6. Títulos Sugeridos
    const titlesSectionMatch = text.match(/✨ Títulos Sugeridos:\s*([\s\S]*?)(?=\n\n🎭 Variação de Tom:|\n---|$)/);
    if (titlesSectionMatch && titlesSectionMatch[1]) {
        const titleLines = titlesSectionMatch[1].trim().split('\n');
        results.suggestedTitles = titleLines.map(line => {
            const parts = line.match(/\d+\.\s*(.*)/); // Ex: 1. SUGESTÃO 1
            return parts && parts[1] ? parts[1].trim() : null;
        }).filter(Boolean);
    }

    // 7. Variação de Tom
    // Captura o texto após "🎭 Variação de Tom:" até o final da string ou a próxima seção "---"
    const toneVariationMatch = text.match(/🎭 Variação de Tom:\s*([\s\S]*?)(?=\n---|$)/);
    if (toneVariationMatch && toneVariationMatch[1]) {
        results.toneVariation = toneVariationMatch[1].trim();
    }


    return results;
}

/**
 * Renderiza o gráfico de radar com as pontuações dos critérios.
 */
function renderChart(scores) {
    const dataValues = criteriaNames.map(criterion => scores[criterion] || 0);

    if (analysisChart) {
        analysisChart.destroy();
    }

    analysisChart = new Chart(chartCanvas, {
        type: 'radar',
        data: {
            labels: criteriaNames,
            datasets: [{
                label: 'Pontuação',
                data: dataValues,
                backgroundColor: 'rgba(102, 126, 234, 0.4)',
                borderColor: '#667eea',
                borderWidth: 2,
                pointBackgroundColor: '#764ba2',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#764ba2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    pointLabels: {
                        color: '#333',
                        font: { size: 12 }
                    },
                    suggestedMin: 0,
                    suggestedMax: 5,
                    ticks: {
                        stepSize: 1,
                        color: '#555',
                        backdropColor: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza o gráfico de barra para o potencial de alcance.
 */
function renderProgressionChart(progression) {
    if (progressionChart) {
        progressionChart.destroy();
    }

    progressionChart = new Chart(progressionChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Potencial de Alcance'],
            datasets: [{
                label: 'Porcentagem',
                data: [progression],
                backgroundColor: ['rgba(40, 167, 69, 0.7)'],
                borderColor: ['rgba(40, 167, 69, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Gráfico de barras horizontal
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100, // Limite máximo 100%
                    ticks: {
                        callback: function(value) {
                            return value + '%'; // Adiciona '%' nos rótulos do eixo X
                        }
                    }
                },
                y: {
                    grid: {
                        display: false // Oculta as linhas da grade do eixo Y
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza as novas seções de análise no HTML.
 */
function renderNewSections(results) {
    // Palavras-chave
    if (results.keywords && results.keywords.length > 0) {
        keywordsList.innerHTML = ''; // Limpa a lista anterior
        results.keywords.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.keyword}: ${item.relevance}`;
            keywordsList.appendChild(li);
        });
        keywordsSection.style.display = 'block';
    } else {
        keywordsSection.style.display = 'none';
    }

    // Sentimento
    if (results.sentiment.text) {
        sentimentText.textContent = `${results.sentiment.text} (${results.sentiment.percentage || 'N/A'}%)`;
        sentimentSection.style.display = 'block';
    } else {
        sentimentSection.style.display = 'none';
    }

    // Nível de Leitura
    if (results.readability.level) {
        readabilityText.textContent = `${results.readability.level} (Pontuação: ${results.readability.score || 'N/A'})`;
        readabilitySection.style.display = 'block';
    } else {
        readabilitySection.style.display = 'none';
    }

    // Títulos Sugeridos
    if (results.suggestedTitles && results.suggestedTitles.length > 0) {
        titlesList.innerHTML = ''; // Limpa a lista anterior
        results.suggestedTitles.forEach(title => {
            const li = document.createElement('li');
            li.textContent = title;
            titlesList.appendChild(li);
        });
        titlesSection.style.display = 'block';
    } else {
        titlesSection.style.display = 'none';
    }

    // Variação de Tom
    if (results.toneVariation) {
        toneText.textContent = results.toneVariation;
        toneSection.style.display = 'block';
    } else {
        toneSection.style.display = 'none';
    }
}

/**
 * Esconde todas as novas seções de análise.
 */
function hideNewSections() {
    keywordsSection.style.display = 'none';
    sentimentSection.style.display = 'none';
    readabilitySection.style.display = 'none';
    titlesSection.style.display = 'none';
    toneSection.style.display = 'none';
}


/**
 * Copia o texto da análise para a área de transferência.
 */
function copyResult() {
    const textToCopy = resultContentDiv.innerText;
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('Análise copiada para a área de transferência!');
        })
        .catch(err => {
            console.error('Erro ao copiar: ', err);
            alert('Erro ao copiar a análise.');
        });
}