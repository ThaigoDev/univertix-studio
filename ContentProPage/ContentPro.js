document.addEventListener('DOMContentLoaded', function() {
            // Lógica para campos condicionais
            const assinaturaAutor = document.getElementById('assinaturaAutor');
            const nomeAutorField = document.getElementById('nomeAutorField');
            const variacaoSim = document.getElementById('variacaoSim');
            const variacaoNao = document.getElementById('variacaoNao');
            const variacaoRedesSociaisFields = document.getElementById('variacaoRedesSociaisFields');

            function toggleNomeAutorField() {
                nomeAutorField.style.display = assinaturaAutor.checked ? 'block' : 'none';
                if (!assinaturaAutor.checked) {
                    nomeAutorField.querySelector('input').value = ''; // Limpa o campo
                }
            }

            function toggleVariacaoRedesSociaisFields() {
                variacaoRedesSociaisFields.style.display = variacaoSim.checked ? 'block' : 'none';
                if (!variacaoSim.checked) {
                    variacaoRedesSociaisFields.querySelectorAll('input, textarea').forEach(field => {
                        if (field.type === 'number' || field.type === 'text') {
                            field.value = '';
                        } else if (field.type === 'radio') {
                            field.checked = false; // Desseleciona os radios
                        }
                    });
                }
            }

            // Event Listeners para os campos condicionais
            document.querySelectorAll('input[name="assinatura"]').forEach(radio => {
                radio.addEventListener('change', toggleNomeAutorField);
            });
            variacaoSim.addEventListener('change', toggleVariacaoRedesSociaisFields);
            variacaoNao.addEventListener('change', toggleVariacaoRedesSociaisFields);

            // Chamada inicial para garantir o estado correto ao carregar a página
            toggleNomeAutorField();
            toggleVariacaoRedesSociaisFields();

            // Adiciona validação para checkboxes dos canais de distribuição
            const canaisDistribuicaoCheckboxes = document.querySelectorAll('input[name="canaisDistribuicao"]');
            canaisDistribuicaoCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const isAnyChecked = Array.from(canaisDistribuicaoCheckboxes).some(cb => cb.checked);
                    canaisDistribuicaoCheckboxes.forEach(cb => {
                        cb.setCustomValidity(isAnyChecked ? '' : 'Selecione ao menos um canal de distribuição.');
                    });
                });
            });
            // Acionar a validação inicial caso nenhum esteja marcado ao carregar
            if (canaisDistribuicaoCheckboxes.length > 0) {
                canaisDistribuicaoCheckboxes[0].dispatchEvent(new Event('change'));
            }
        });

        // Lógica de envio do formulário para a API
        document.getElementById('contentProForm').addEventListener('submit', async function(event) {
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
                temaCentral: form.temaCentral.value,
                objetivoConteudo: form.objetivoConteudo.value,
                palavrasChave: form.palavrasChave.value,
                estruturaDesejada: form.estruturaDesejada.value,
                publicoAlvo: form.publicoAlvo.value,
                tomComunicacao: form.tomComunicacao.value,
                infoObrigatorias: form.infoObrigatorias.value,
                mensagemPrincipal: form.mensagemPrincipal.value,
                fonteReferencia: form.fonteReferencia.value,
                assinatura: form.assinatura.value,
                nomeAutor: form.assinatura.value === 'Nome de autor específico' ? form.nomeAutor.value : '',
                canaisDistribuicao: Array.from(form.querySelectorAll('input[name="canaisDistribuicao"]:checked')).map(cb => cb.value),
                variacaoRedesSociais: form.variacaoRedesSociais.value,
                maxCaracteres: form.variacaoRedesSociais.value === 'sim' ? form.maxCaracteres.value : '',
                adaptarTitulo: form.variacaoRedesSociais.value === 'sim' ? (form.adaptarTitulo ? form.adaptarTitulo.value : '') : '',
                incluirHashtags: form.variacaoRedesSociais.value === 'sim' ? (form.incluirHashtags ? form.incluirHashtags.value : '') : '',
                frasesEvitar: form.frasesEvitar.value,
                observacoesAdicionais: form.observacoesAdicionais.value,
            };

            // Constrói o prompt para a API
            let prompt = `Crie uma copy jornalística premium (Content Pro) com foco informativo, otimizada para SEO e com autoridade, para a Univértix, com base nas seguintes informações:\n\n`;
            prompt += `**Tema central da matéria/conteúdo:** ${formData.temaCentral}\n`;
            prompt += `**Objetivo do conteúdo:** ${formData.objetivoConteudo}\n`;
            if (formData.palavrasChave) {
                prompt += `**Palavras-chave para SEO:** ${formData.palavrasChave}\n`;
            }
            prompt += `**Estrutura desejada:** ${formData.estruturaDesejada}\n`;
            prompt += `**Público-alvo:** ${formData.publicoAlvo}\n`;
            prompt += `**Tom da comunicação:** ${formData.tomComunicacao}\n`;
            prompt += `**Informações obrigatórias no conteúdo:** ${formData.infoObrigatorias}\n`;
            prompt += `**Mensagem principal:** ${formData.mensagemPrincipal}\n`;
            if (formData.fonteReferencia) {
                prompt += `**Fonte/referência/base do conteúdo:** ${formData.fonteReferencia}\n`;
            }
            prompt += `**Assinatura desejada:** ${formData.assinatura}\n`;
            if (formData.assinatura === 'Nome de autor específico' && formData.nomeAutor) {
                prompt += `**Nome do autor:** ${formData.nomeAutor}\n`;
            }
            prompt += `**Canais de distribuição:** ${formData.canaisDistribuicao.join(', ')}\n`;
            if (formData.variacaoRedesSociais === 'sim') {
                prompt += `**Precisa de variação/resumo para redes sociais:** Sim\n`;
                if (formData.maxCaracteres) {
                    prompt += `  - **Máximo de caracteres:** ${formData.maxCaracteres}\n`;
                }
                if (formData.adaptarTitulo) {
                    prompt += `  - **Adaptar título para post:** ${formData.adaptarTitulo}\n`;
                }
                if (formData.incluirHashtags) {
                    prompt += `  - **Incluir hashtags:** ${formData.incluirHashtags}\n`;
                }
            } else {
                prompt += `**Precisa de variação/resumo para redes sociais:** Não\n`;
            }
            if (formData.frasesEvitar) {
                prompt += `**Conteúdos/frases a evitar:** ${formData.frasesEvitar}\n`;
            }
            if (formData.observacoesAdicionais) {
                prompt += `**Observações adicionais:** ${formData.observacoesAdicionais}\n`;
            }

            console.log("Prompt enviado:", prompt);

            try {
                const response = await fetch('https://create-caption-app.onrender.com/gerar-copy-content', {
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