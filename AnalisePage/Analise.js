 const analysisForm = document.getElementById('analysisForm');
        const contentInput = document.getElementById('content');
        const loadingDiv = document.getElementById('loading');
        const resultDiv = document.getElementById('result');
        const resultContentDiv = document.getElementById('result-content');
        const errorDiv = document.getElementById('error');
        const submitBtn = document.querySelector('.submit-btn');
        const chartCanvas = document.getElementById('analysisChart');
        let analysisChart = null; // Variável para armazenar a instância do gráfico

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
            "Hashtags relevantes" // Nome simplificado para o gráfico
        ];

        analysisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const content = contentInput.value.trim();

            if (!content) {
                alert('Por favor, insira o conteúdo para análise.');
                return;
            }

            // Esconder resultados anteriores e erros, mostrar carregamento
            resultDiv.style.display = 'none';
            errorDiv.style.display = 'none';
            loadingDiv.style.display = 'block';
            submitBtn.disabled = true;

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

                📊 Pontuações dos Critérios (0-5, onde 0 = Não atende, 5 = Atende plenamente). POR FAVOR, USE O FORMATO "[NÚMERO]" PARA AS PONTUAÇÕES:
                Abertura Impactante: [PONTUACAO]
                Originalidade e Autenticidade: [PONTUACAO]
                Mensagem Central Clara: [PONTUACAO]
                Tom de Voz Coerente: [PONTUACAO]
                Conexão com o Público-Alvo: [PONTUACAO]
                Chamada para Ação (CTA): [PONTUACAO]
                Identidade Univértix: [PONTUACAO]
                Uso inteligente de Emojis e Formatação: [PONTUACAO]
                Hashtags relevantes: [PONTUACAO]

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
                console.log("Resposta completa da API:", fullAnalysis); // DEBUG: Verifique a resposta bruta

                // Tenta dividir a resposta entre texto e pontuações
                // O split usa "📊 Pontuações dos Critérios" para separar. A segunda parte [1] é a de pontuações.
                const parts = fullAnalysis.split('📊 Pontuações dos Critérios');
                const textualPart = parts[0];
                const scoresPart = parts.length > 1 ? parts[1] : ''; // Pega a segunda parte se existir, senão vazia
                
                resultContentDiv.innerText = textualPart ? textualPart.trim() : fullAnalysis.trim(); // Exibe a parte textual

                if (scoresPart) {
                    const scores = parseScores(scoresPart);
                    console.log("Pontuações extraídas:", scores); // DEBUG: Verifique as pontuações
                    renderChart(scores);
                } else {
                    console.warn("Seção de pontuações não encontrada na resposta da API ou está vazia.");
                    if (analysisChart) {
                        analysisChart.destroy(); // Destrói o gráfico anterior se não há novas pontuações
                        analysisChart = null;
                    }
                }
                
                resultDiv.style.display = 'block';

            } catch (error) {
                console.error('Erro ao realizar a análise:', error);
                errorDiv.style.display = 'block';
                if (analysisChart) { // Garante que o gráfico é destruído em caso de erro também
                    analysisChart.destroy();
                    analysisChart = null;
                }
            } finally {
                loadingDiv.style.display = 'none';
                submitBtn.disabled = false;
            }
        });

        /**
         * Tenta extrair as pontuações de um texto.
         * Suporta formatos como "Critério: [5]" ou "Critério: 4".
         */
        function parseScores(scoresText) {
            const scores = {};
            const lines = scoresText.split('\n').filter(line => line.trim() !== '');

            lines.forEach(line => {
                // Regex mais flexível: procura por "Texto: NÚMERO" com ou sem colchetes opcionais ao redor do número.
                const match = line.match(/(.+):\s*\[?(\d+)\]?/); 
                if (match) {
                    const criterionRaw = match[1].trim();
                    const score = parseInt(match[2], 10);
                    
                    // Encontra o nome do critério correspondente na lista predefinida (criteriaNames)
                    const foundCriterion = criteriaNames.find(name => criterionRaw.includes(name));
                    
                    if (foundCriterion) {
                        scores[foundCriterion] = score;
                    } else if (criterionRaw.includes('Hashtags relevantes')) {
                        // Tratamento específico para "Hashtags relevantes (se aplicável)" que pode vir simplificado
                        scores['Hashtags relevantes'] = score;
                    }
                }
            });
            return scores;
        }

        function renderChart(scores) {
            // Mapeia os critérios para seus valores, usando 0 se a pontuação não for encontrada
            const dataValues = criteriaNames.map(criterion => scores[criterion] || 0);
            console.log("Valores para o gráfico (dataValues):", dataValues); // DEBUG: Verifique se os dados estão corretos para o Chart.js

            // Se já existe um gráfico, destrua-o para evitar sobreposição
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
                            angleLines: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            pointLabels: {
                                color: '#333',
                                font: {
                                    size: 12
                                }
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
                        legend: {
                            display: false // Não exibir a legenda "Pontuação"
                        },
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