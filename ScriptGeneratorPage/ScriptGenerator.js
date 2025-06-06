 document.getElementById('roteiroForm').addEventListener('submit', async function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const form = event.target;
            const submitBtn = document.querySelector('.submit-btn');
            const loadingState = document.getElementById('loadingState');
            const resultState = document.getElementById('resultState');
            const errorState = document.getElementById('errorState');
            const roteiroContent = document.getElementById('roteiroContent');

            // Oculta estados anteriores e mostra o loading
            resultState.style.display = 'none';
            errorState.style.display = 'none';
            loadingState.style.display = 'block';
            submitBtn.disabled = true;

            // Coleta os dados do formulário
            const formData = {
                temaVideo: form.temaVideo.value,
                objetivoVideo: form.objetivoVideo.value,
                publicoAlvo: form.publicoAlvo.value,
                duracaoEstimada: form.duracaoEstimada.value,
                mensagemPrincipal: form.mensagemPrincipal.value,
                tomDeVoz: form.tomDeVoz.value,
                sugestoesCenas: form.sugestoesCenas.value,
                diferencialUnivertix: form.diferencialUnivertix.value,
                estruturaPadrao: form.estruturaPadrao.value,
                observacoesAdicionais: form.observacoesAdicionais.value,
            };

            // Campos ocultos/fixos
            const slogans = ["Escolha Univértix.", "Vem ser Univértix.", "Venha ser Univértix."];
            const finalCom = "💙🤍❤️";

            // Constrói o prompt para a API
            let prompt = `Crie um roteiro de vídeo (Reels) para a Univértix com base nas seguintes informações:\n\n`;
            prompt += `**Tema do vídeo:** ${formData.temaVideo}\n`;
            prompt += `**Objetivo:** ${formData.objetivoVideo}\n`;
            prompt += `**Público-alvo:** ${formData.publicoAlvo}\n`;
            prompt += `**Duração estimada:** ${formData.duracaoEstimada}\n`;
            prompt += `**Mensagem principal:** ${formData.mensagemPrincipal}\n`;
            prompt += `**Tom de voz:** ${formData.tomDeVoz}\n`;
            if (formData.sugestoesCenas) {
                prompt += `**Sugestões de cenas/imagens:** ${formData.sugestoesCenas}\n`;
            }
            prompt += `**Diferencial da Univértix a evidenciar:** ${formData.diferencialUnivertix}\n`;
            prompt += `**Estrutura desejada:** ${formData.estruturaPadrao === 'sim' ? 'Padrão (Abertura → Situação → Transformação → Emoção → CTA)' : 'Livre'}\n`;
            if (formData.observacoesAdicionais) {
                prompt += `**Observações adicionais:** ${formData.observacoesAdicionais}\n`;
            }
            prompt += `\n**Finalização:** Use um dos slogans da Univértix (${slogans.join(', ')}). Inclua "${finalCom}" no final.\n`;
            prompt += `\nCertifique-se de que o roteiro seja criativo, envolvente e adequado para um Reels. Utilize o formato de checklist visual e estrutura clara para a entrega do roteiro.`;

            console.log("Prompt enviado:", prompt);

            try {
                const response = await fetch('https://create-caption-app.onrender.com/gerar-roteiro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt: prompt })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                roteiroContent.textContent = data.roteiro;
                resultState.style.display = 'block';

            } catch (error) {
                console.error('Erro ao chamar a API:', error);
                errorState.style.display = 'block';
            } finally {
                loadingState.style.display = 'none';
                submitBtn.disabled = false;
            }
        });

        function copyRoteiro() {
            const roteiroText = document.getElementById('roteiroContent').textContent;
            navigator.clipboard.writeText(roteiroText).then(() => {
                alert('Roteiro copiado para a área de transferência!');
            }).catch(err => {
                console.error('Erro ao copiar o roteiro:', err);
            });
        }