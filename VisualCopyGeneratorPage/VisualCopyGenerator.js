document.addEventListener('DOMContentLoaded', function() {
            const microCopySim = document.getElementById('microCopySim');
            const microCopyNao = document.getElementById('microCopyNao');
            const contextoMicroCopyField = document.getElementById('contextoMicroCopyField');

            const storytellingSim = document.getElementById('storytellingSim');
            const storytellingNao = document.getElementById('storytellingNao');
            const storytellingFields = document.getElementById('storytellingFields');

            const adaptacaoSim = document.getElementById('adaptacaoSim');
            const adaptacaoNao = document.getElementById('adaptacaoNao');
            const formatosSecundariosField = document.getElementById('formatosSecundariosField');

            function toggleMicroCopyField() {
                contextoMicroCopyField.style.display = microCopySim.checked ? 'block' : 'none';
                if (!microCopySim.checked) {
                    contextoMicroCopyField.querySelector('textarea').value = ''; // Limpa o campo
                }
            }

            function toggleStorytellingFields() {
                storytellingFields.style.display = storytellingSim.checked ? 'block' : 'none';
                if (!storytellingSim.checked) {
                    storytellingFields.querySelectorAll('input, textarea').forEach(field => field.value = ''); // Limpa os campos
                }
            }

            function toggleAdaptacaoFields() {
                formatosSecundariosField.style.display = adaptacaoSim.checked ? 'block' : 'none';
                if (!adaptacaoSim.checked) {
                    formatosSecundariosField.querySelector('textarea').value = ''; // Limpa o campo
                }
            }

            microCopySim.addEventListener('change', toggleMicroCopyField);
            microCopyNao.addEventListener('change', toggleMicroCopyField);
            storytellingSim.addEventListener('change', toggleStorytellingFields);
            storytellingNao.addEventListener('change', toggleStorytellingFields);
            adaptacaoSim.addEventListener('change', toggleAdaptacaoFields);
            adaptacaoNao.addEventListener('change', toggleAdaptacaoFields);

            // Chamada inicial para garantir o estado correto ao carregar a página
            toggleMicroCopyField();
            toggleStorytellingFields();
            toggleAdaptacaoFields();

            // Adiciona validação para checkboxes do formato da peça
            const formatoPecaCheckboxes = document.querySelectorAll('input[name="formatoPeca"]');
            formatoPecaCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const isAnyChecked = Array.from(formatoPecaCheckboxes).some(cb => cb.checked);
                    formatoPecaCheckboxes.forEach(cb => {
                        cb.setCustomValidity(isAnyChecked ? '' : 'Selecione ao menos um formato.');
                    });
                });
            });
            // Acionar a validação inicial caso nenhum esteja marcado ao carregar
            if (formatoPecaCheckboxes.length > 0) {
                formatoPecaCheckboxes[0].dispatchEvent(new Event('change'));
            }
        });

        // Lógica de envio do formulário para a API
        document.getElementById('visualCopyForm').addEventListener('submit', async function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const form = event.target;
            const submitBtn = document.querySelector('.submit-btn');
            const loadingState = document.getElementById('loadingState');
            const resultState = document.getElementById('resultState');
            const errorState = document.getElementById('errorState');
            const copyContent = document.getElementById('copyContent');

            // Oculta estados anteriores e mostra o loading
            resultState.style.display = 'none';
            errorState.style.display = 'none';
            loadingState.style.display = 'block';
            submitBtn.disabled = true;

            // Coleta os dados do formulário
            const formData = {
                objetivoPeca: form.objetivoPeca.value,
                formatoPeca: Array.from(form.querySelectorAll('input[name="formatoPeca"]:checked')).map(cb => cb.value),
                temaCentral: form.temaCentral.value,
                mensagemPrincipal: form.mensagemPrincipal.value,
                tomComunicacao: form.tomComunicacao.value,
                headlineDesejada: form.headlineDesejada.value,
                precisaMicroCopy: form.precisaMicroCopy.value,
                contextoMicroCopy: form.precisaMicroCopy.value === 'sim' ? form.contextoMicroCopy.value : '',
                incluirStorytelling: form.incluirStorytelling.value,
                storytelling: form.incluirStorytelling.value === 'sim' ? {
                    gancho: form.ganchoStorytelling.value,
                    situacao: form.situacaoStorytelling.value,
                    solucao: form.solucaoStorytelling.value,
                    prova: form.provaStorytelling.value,
                    acao: form.acaoStorytelling.value,
                } : null,
                adaptacaoFormatos: form.adaptacaoFormatos.value,
                formatosSecundarios: form.adaptacaoFormatos.value === 'sim' ? form.formatosSecundarios.value : '',
                palavrasProibidas: form.palavrasProibidas.value,
                observacoesAdicionais: form.observacoesAdicionais.value,
            };

            // Constrói o prompt para a API
            let prompt = `Crie uma copy visual impactante para a Univértix com base nas seguintes informações:\n\n`;
            prompt += `**Objetivo da peça:** ${formData.objetivoPeca}\n`;
            prompt += `**Formato da peça:** ${formData.formatoPeca.join(', ')}\n`;
            prompt += `**Tema central/assunto:** ${formData.temaCentral}\n`;
            prompt += `**Mensagem principal:** ${formData.mensagemPrincipal}\n`;
            prompt += `**Tom da comunicação:** ${formData.tomComunicacao}\n`;
            if (formData.headlineDesejada) {
                prompt += `**Headline desejada/palavra-chave:** ${formData.headlineDesejada}\n`;
            }
            if (formData.precisaMicroCopy === 'sim') {
                prompt += `**Precisa de micro-copy:** Sim\n`;
                prompt += `**Contexto de uso do micro-copy:** ${formData.contextoMicroCopy}\n`;
            } else {
                prompt += `**Precisa de micro-copy:** Não\n`;
            }
            if (formData.incluirStorytelling === 'sim') {
                prompt += `**Deseja incluir storytelling visual:** Sim\n`;
                prompt += `  - **Gancho:** ${formData.storytelling.gancho}\n`;
                prompt += `  - **Situação:** ${formData.storytelling.situacao}\n`;
                prompt += `  - **Solução:** ${formData.storytelling.solucao}\n`;
                prompt += `  - **Prova:** ${formData.storytelling.prova}\n`;
                prompt += `  - **Ação:** ${formData.storytelling.acao}\n`;
            } else {
                prompt += `**Deseja incluir storytelling visual:** Não\n`;
            }
            if (formData.adaptacaoFormatos === 'sim') {
                prompt += `**A copy será adaptada para outros formatos:** Sim\n`;
                prompt += `**Quais formatos secundários:** ${formData.formatosSecundarios}\n`;
            } else {
                prompt += `**A copy será adaptada para outros formatos:** Não\n`;
            }
            if (formData.palavrasProibidas) {
                prompt += `**Palavras proibidas/frases a evitar:** ${formData.palavrasProibidas}\n`;
            }
            if (formData.observacoesAdicionais) {
                prompt += `**Observações adicionais:** ${formData.observacoesAdicionais}\n`;
            }

            console.log("Prompt enviado:", prompt);

            try {
                const response = await fetch('https://create-caption-app.onrender.com/gerar-copy-visual', {
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
                copyContent.textContent = data.copy;
                resultState.style.display = 'block';

            } catch (error) {
                console.error('Erro ao chamar a API:', error);
                errorState.style.display = 'block';
            } finally {
                loadingState.style.display = 'none';
                submitBtn.disabled = false;
            }
        });

        function copyResult() {
            const copyText = document.getElementById('copyContent').textContent;
            navigator.clipboard.writeText(copyText).then(() => {
                alert('Copy copiada para a área de transferência!');
            }).catch(err => {
                console.error('Erro ao copiar a copy:', err);
            });
        }