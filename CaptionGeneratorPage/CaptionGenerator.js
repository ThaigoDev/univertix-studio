   document.getElementById('captionForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');
            const error = document.getElementById('error');
            
            // Reset UI
            loading.style.display = 'none';
            result.style.display = 'none';
            error.style.display = 'none';
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Create prompt
            const prompt = createPrompt(data);
            
            // Show loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Gerando...';
            loading.style.display = 'block';
            
            try {
                const response = await fetch('https://create-caption-app.onrender.com/gerar-legenda/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt })
                });
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                const responseData = await response.json();
                
                // Show result
                document.getElementById('resultContent').textContent = responseData.legenda;
                result.style.display = 'block';
                
            } catch (err) {
                console.error('Erro:', err);
                const errorDiv = document.getElementById('error');
                errorDiv.textContent = `Erro ao gerar legenda: ${err.message}. Verifique sua conexão e tente novamente.`;
                errorDiv.style.display = 'block';
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = '🚀 Gerar Legenda Criativa';
                loading.style.display = 'none';
            }
        });

        function createPrompt(data) {
            const tonDescriptions = {
                'inspirador': 'inspirador e ousado',
                'ironico': 'irônico e criativo',
                'reflexivo': 'reflexivo e direto',
                'divertido': 'divertido e provocador',
                'serio': 'sério e institucional'
            };

            const publicoDescriptions = {
                'ensino-medio': 'alunos do ensino médio',
                'universitarios': 'universitários',
                'pais': 'pais de estudantes',
                'ex-alunos': 'ex-alunos',
                'professores': 'professores e educadores',
                'profissionais': 'profissionais da área'
            };

            let prompt = `Crie uma legenda criativa e autêntica para a Univértix sobre o tema: "${data.tema}".

Objetivo: ${data.objetivo}
Tom desejado: ${tonDescriptions[data.tom]}
Público-alvo: ${publicoDescriptions[data.publico]}`;

            if (data.palavrasChave) {
                prompt += `\nPalavras-chave para incluir: ${data.palavrasChave}`;
            }

            if (data.evitar) {
                prompt += `\nEvitar estas palavras/expressões: ${data.evitar}`;
            }

            if (data.observacoes) {
                prompt += `\nObservações adicionais: ${data.observacoes}`;
            }

            prompt += `\n\nEstrutura desejada:
- TÍTULO EM CAIXA ALTA seguido de "•" em casos onde o  tema contém somente abreviação (Ex: OBAdm,CREDIVÉRTIX)
- Corpo direto e criativo sem frases clichês
- Emojis usados com propósito
- Deve conter algo sempre como :  "Acesse agora: univertix.edu.br (link na bio)"  antes da CTA
- CTA com slogan institucional (escolha entre: "Venha ser Univértix.", "Escolha Univértix.", "Seja Univértix.") + 💙🤍❤️
- Hashtags relevantes ao final

Seja criativo, autêntico e evite clichês. A legenda deve ter personalidade e se conectar genuinamente com o público.`;

            return prompt;
        }

        function copyToClipboard() {
            const content = document.getElementById('resultContent').textContent;
            navigator.clipboard.writeText(content).then(() => {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = '✅ Copiado!';
                btn.style.background = '#28a745';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '#28a745';
                }, 2000);
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                alert('Erro ao copiar. Tente selecionar o texto manualmente.');
            });
        }