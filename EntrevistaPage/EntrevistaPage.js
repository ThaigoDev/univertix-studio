        document.getElementById('interviewForm').addEventListener('submit', async function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const form = event.target;
            const submitBtn = form.querySelector('.submit-btn');
            const loadingMessage = document.getElementById('loadingMessage');
            const errorMessage = document.getElementById('errorMessage');
            const resultSection = document.getElementById('resultSection');
            const interviewQuestions = document.getElementById('interviewQuestions');
            const copyButton = document.getElementById('copyButton');

            // Oculta mensagens anteriores e exibe carregamento
            errorMessage.style.display = 'none';
            resultSection.style.display = 'none';
            loadingMessage.style.display = 'block';
            submitBtn.disabled = true; // Desabilita o botão enquanto carrega
            errorMessage.innerText = 'Ocorreu um erro. Por favor, tente novamente ou verifique as informações.'; // Reset da mensagem de erro

            const tema = document.getElementById('tema').value;
            const publico = document.getElementById('publico').value || 'Não especificado';
            const quantidade = document.getElementById('quantidade').value;
            const estilo = form.querySelector('input[name="estilo"]:checked')?.value || 'Não especificado';
            const contexto_adicional = document.getElementById('contexto_adicional').value || 'Nenhum contexto adicional fornecido.';

            const promptText = `
                Você é um redator especializado em entrevistas institucionais, educacionais e jornalísticas.

                Gere **${quantidade}** perguntas de entrevista para o seguinte tema: **${tema}**.

                Público-alvo: **${publico}**.
                Estilo desejado: **${estilo}**.
                Contexto adicional: **${contexto_adicional}**.

                As perguntas devem ser:

                * Claras e bem estruturadas
                * Profundas, inspiradoras ou investigativas (de acordo com o estilo escolhido)
                * Apropriadas para uma instituição de ensino superior como a Univértix
                * Formuladas com foco em extrair respostas relevantes, emocionantes e humanas

                Utilize uma linguagem respeitosa, inteligente e alinhada ao propósito acadêmico e institucional da Univértix.
            `.trim();

            try {
                const response = await fetch('https://create-caption-app.onrender.com/gerar-entrevista', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: promptText }),
                });

                if (!response.ok) {
                    const errorResponseText = await response.text();
                    console.error('Erro na API:', response.status, response.statusText, errorResponseText);
                    errorMessage.innerText = `Erro ao se comunicar com a API (${response.status}): ${errorResponseText || response.statusText}.`;
                    errorMessage.style.display = 'block';
                    return;
                }

                const data = await response.json();
                console.log('Resposta completa da API:', data); // Log para depuração

                // --- CORREÇÃO PRINCIPAL AQUI ---
                if (data && data.entrevista) { // Verifica se 'data' e 'data.entrevista' existem
                    interviewQuestions.innerText = data.entrevista; // Acessa diretamente a propriedade 'entrevista'
                    resultSection.style.display = 'block';
                    copyButton.onclick = () => {
                        navigator.clipboard.writeText(interviewQuestions.innerText).then(() => {
                            alert('Perguntas copiadas para a área de transferência!');
                        }).catch(err => {
                            console.error('Erro ao copiar: ', err);
                            alert('Erro ao copiar as perguntas.');
                        });
                    };
                } else {
                    console.error('Estrutura de resposta inesperada da API:', data);
                    errorMessage.innerText = 'A API retornou uma resposta em um formato inesperado. Por favor, tente novamente mais tarde ou contate o suporte.';
                    errorMessage.style.display = 'block';
                }

            } catch (error) {
                console.error('Erro ao gerar perguntas:', error);
                errorMessage.innerText = `Ocorreu um erro ao gerar as perguntas: ${error.message}. Por favor, tente novamente.`;
                errorMessage.style.display = 'block';
            } finally {
                loadingMessage.style.display = 'none';
                submitBtn.disabled = false; // Reabilita o botão
            }
        });