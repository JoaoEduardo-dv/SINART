document.addEventListener("DOMContentLoaded", () => {
    const raiz = document.getElementById("documentosPage");
    if (!raiz) return;

    const $ = (seletor) =>
    raiz.querySelector(seletor) || document.querySelector(seletor);
    const $$ = (seletor) => raiz.querySelectorAll(seletor);

    // =========================================
    // DADOS DEMONSTRATIVOS
    // =========================================

    let pastas = [
        { id: 1, nome: "Atas de Reunião" },
        { id: 2, nome: "Projetos" },
        { id: 3, nome: "Relatórios" },
        { id: 4, nome: "Editais e Seleções" },
        { id: 5, nome: "Planos de Aula" },
        { id: 6, nome: "Eventos" },
        { id: 7, nome: "Documentos Gerais" },
        { id: 8, nome: "Arquivos Antigos" }
    ];

    let documentos = [
        {
            id: 1,
            nome: "Plano de Ensino - Teoria Musical I.pdf",
            pasta: "Planos de Aula",
            tipo: "PDF",
            remetente: "João da Silva",
            cargo: "Professor",
            data: "07/05/2025",
            hora: "14:32",
            tamanho: "1,2 MB",
            bytes: 1258291,
            compartilhado: true,
            url: null
        },
        {
            id: 2,
            nome: "Relatório de Atividades - Abril.docx",
            pasta: "Relatórios",
            tipo: "DOCX",
            remetente: "Ana Beatriz Rocha",
            cargo: "Bolsista",
            data: "06/05/2025",
            hora: "09:15",
            tamanho: "560 KB",
            bytes: 573440,
            compartilhado: true,
            url: null
        },
        {
            id: 3,
            nome: "Orçamento Projeto Arte na Escola.xlsx",
            pasta: "Projetos",
            tipo: "XLSX",
            remetente: "Carlos Eduardo Lima",
            cargo: "Servidor",
            data: "05/05/2025",
            hora: "16:45",
            tamanho: "245 KB",
            bytes: 250880,
            compartilhado: false,
            url: null
        },
        {
            id: 4,
            nome: "Apresentação Coral do NUARTE.pptx",
            pasta: "Eventos",
            tipo: "PPTX",
            remetente: "Maria Clara Souza",
            cargo: "Bolsista",
            data: "04/05/2025",
            hora: "11:20",
            tamanho: "3,4 MB",
            bytes: 3565158,
            compartilhado: true,
            url: null
        },
        {
            id: 5,
            nome: "Edital - Seleção de Monitores 2025.pdf",
            pasta: "Editais e Seleções",
            tipo: "PDF",
            remetente: "João da Silva",
            cargo: "Professor",
            data: "02/05/2025",
            hora: "08:30",
            tamanho: "890 KB",
            bytes: 911360,
            compartilhado: false,
            url: null
        },
        {
            id: 6,
            nome: "Ata da Reunião - 30.04.2025.docx",
            pasta: "Atas de Reunião",
            tipo: "DOCX",
            remetente: "Ana Beatriz Rocha",
            cargo: "Bolsista",
            data: "30/04/2025",
            hora: "17:10",
            tamanho: "320 KB",
            bytes: 327680,
            compartilhado: false,
            url: null
        }
    ];

    let proximoIdDocumento = 7;
    let proximoIdPasta = 9;
    let pastaSelecionada = "";
    let paginaAtual = 1;
    let menuAberto = null;
    let downloads = 124;
    let toastTimeout = null;
    let ordemDataCrescente = false;

    const armazenamentoTotal = 10 * 1024 * 1024 * 1024;
    let armazenamentoInicial = 3.2 * 1024 * 1024 * 1024;

    // =========================================
    // ELEMENTOS
    // =========================================

    const busca = $("#docBusca");
    const filtroTipo = $("#docFiltroTipo");
    const filtroPasta = $("#docFiltroPasta");
    const filtroRemetente = $("#docFiltroRemetente");
    const ordenacao = $("#docOrdenacao");
    const listaPastas = $("#docListaPastas");
    const corpoTabela = $("#docTabelaCorpo");
    const vazio = $("#docVazio");
    const contagem = $("#docContagem");
    const numerosPaginas = $("#docNumerosPaginas");
    const porPagina = $("#docPorPagina");
    const toast = $("#docToast");
    const inputArquivo = $("#docInputArquivo");
    const overlay = $("#docDropOverlay");

    const modalPasta = $("#docModalPasta");
    const modalDetalhes = $("#docModalDetalhes");

    // =========================================
    // FUNÇÕES AUXILIARES
    // =========================================

    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caractere]);
    }

    function mostrarAviso(mensagem) {
        toast.textContent = mensagem;
        toast.hidden = false;

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.hidden = true;
        }, 3500);
    }

    function abrirModal(modal) {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
    }

    function fecharModal(modal) {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
    }

    function obterExtensao(nome) {
        const partes = nome.split(".");
        return partes.length > 1
            ? partes.pop().toUpperCase()
            : "OUTRO";
    }

    function obterTipo(tipo) {
        return ["PDF", "DOCX", "XLSX", "PPTX"].includes(tipo)
            ? tipo
            : "OUTRO";
    }

    function formatarTamanho(bytes) {
        if (bytes >= 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024 * 1024)).toFixed(1).replace(".", ",")} GB`;
        }

        if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
        }

        if (bytes >= 1024) {
            return `${Math.round(bytes / 1024)} KB`;
        }

        return `${bytes} B`;
    }

    function dataParaNumero(data) {
        const [dia, mes, ano] = data.split("/");
        return new Date(Number(ano), Number(mes) - 1, Number(dia)).getTime();
    }

    function obterClasseTipo(tipo) {
        return {
            PDF: "pdf",
            DOCX: "docx",
            XLSX: "xlsx",
            PPTX: "pptx"
        }[tipo] || "outro";
    }

    function obterIconeTipo(tipo) {
        return {
            PDF: "fa-file-pdf",
            DOCX: "fa-file-word",
            XLSX: "fa-file-excel",
            PPTX: "fa-file-powerpoint"
        }[tipo] || "fa-file";
    }

    // =========================================
    // PASTAS
    // =========================================

    function atualizarPastas() {
        listaPastas.innerHTML = pastas.map(pasta => {
            const quantidade = documentos.filter(
                documento => documento.pasta === pasta.nome
            ).length;

            return `
                <button
                    type="button"
                    class="doc-folder-item ${pastaSelecionada === pasta.nome ? "active" : ""}"
                    data-folder="${escaparHTML(pasta.nome)}"
                >
                    <i class="fa-regular fa-folder"></i>
                    <span>${escaparHTML(pasta.nome)}</span>
                    <small>${quantidade}</small>
                </button>
            `;
        }).join("");

        filtroPasta.innerHTML = `
            <option value="">Todas as pastas</option>
            ${pastas.map(pasta => `
                <option value="${escaparHTML(pasta.nome)}">
                    ${escaparHTML(pasta.nome)}
                </option>
            `).join("")}
        `;

        if (pastaSelecionada && !pastas.some(p => p.nome === pastaSelecionada)) {
            pastaSelecionada = "";
        }

        filtroPasta.value = pastaSelecionada;
    }

    function atualizarRemetentes() {
        const selecionado = filtroRemetente.value;

        const remetentes = [...new Set(
            documentos.map(documento => documento.remetente)
        )].sort((a, b) => a.localeCompare(b, "pt-BR"));

        filtroRemetente.innerHTML = `
            <option value="">Todos os usuários</option>
            ${remetentes.map(nome => `
                <option value="${escaparHTML(nome)}">
                    ${escaparHTML(nome)}
                </option>
            `).join("")}
        `;

        if (remetentes.includes(selecionado)) {
            filtroRemetente.value = selecionado;
        }
    }

    function criarPasta(nome) {
        const nomeNormalizado = nome.trim();

        if (!nomeNormalizado) {
            mostrarAviso("Digite o nome da pasta.");
            return false;
        }

        const existe = pastas.some(
            pasta => pasta.nome.toLocaleLowerCase("pt-BR") ===
                nomeNormalizado.toLocaleLowerCase("pt-BR")
        );

        if (existe) {
            mostrarAviso("Já existe uma pasta com esse nome.");
            return false;
        }

        pastas.push({
            id: proximoIdPasta++,
            nome: nomeNormalizado
        });

        pastaSelecionada = nomeNormalizado;
        paginaAtual = 1;

        atualizarPastas();
        atualizarEstatisticas();
        renderizar();

        mostrarAviso("Pasta criada com sucesso.");
        return true;
    }

    // =========================================
    // FILTROS E PESQUISA
    // =========================================

    function obterDocumentosFiltrados() {
        const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
        const tipo = filtroTipo.value;
        const pasta = filtroPasta.value;
        const remetente = filtroRemetente.value;

        let resultado = documentos.filter(documento => {
            const texto = [
                documento.nome,
                documento.pasta,
                documento.tipo,
                documento.remetente,
                documento.cargo
            ].join(" ").toLocaleLowerCase("pt-BR");

            return (
                (!termo || texto.includes(termo)) &&
                (!tipo || (tipo === "OUTRO"
                    ? !["PDF", "DOCX", "XLSX", "PPTX"].includes(documento.tipo)
                    : documento.tipo === tipo)) &&
                (!pasta || documento.pasta === pasta) &&
                (!remetente || documento.remetente === remetente)
            );
        });

        switch (ordenacao.value) {
            case "antigos":
                resultado.sort((a, b) =>
                    dataParaNumero(a.data) - dataParaNumero(b.data)
                );
                break;

            case "nome":
                resultado.sort((a, b) =>
                    a.nome.localeCompare(b.nome, "pt-BR")
                );
                break;

            case "tamanho":
                resultado.sort((a, b) => b.bytes - a.bytes);
                break;

            default:
                resultado.sort((a, b) =>
                    dataParaNumero(b.data) - dataParaNumero(a.data)
                );
        }

        if (ordemDataCrescente && ordenacao.value === "recentes") {
            resultado.reverse();
        }

        return resultado;
    }

    function limparFiltros() {
        busca.value = "";
        filtroTipo.value = "";
        filtroPasta.value = "";
        filtroRemetente.value = "";
        ordenacao.value = "recentes";
        pastaSelecionada = "";
        ordemDataCrescente = false;

        paginaAtual = 1;

        atualizarPastas();
        renderizar();
    }

    // =========================================
    // TABELA
    // =========================================

    function montarLinha(documento) {
        const tipoClasse = obterClasseTipo(documento.tipo);
        const icone = obterIconeTipo(documento.tipo);

        return `
            <tr>
                <td>
                    <div class="doc-file-name">
                        <span class="doc-file-icon ${tipoClasse}">
                            <i class="fa-solid ${icone}"></i>
                        </span>

                        <span class="doc-file-info">
                            <strong title="${escaparHTML(documento.nome)}">
                                ${escaparHTML(documento.nome)}
                            </strong>
                            <small>${escaparHTML(documento.tipo)}</small>
                        </span>
                    </div>
                </td>

                <td>${escaparHTML(documento.pasta)}</td>

                <td>
                    <span class="doc-type ${tipoClasse}">
                        ${escaparHTML(documento.tipo)}
                    </span>
                </td>

                <td>
                    <span class="doc-sender">
                        <strong>${escaparHTML(documento.remetente)}</strong>
                        <small>${escaparHTML(documento.cargo)}</small>
                    </span>
                </td>

                <td>
                    ${escaparHTML(documento.data)}
                    <br>
                    <small>${escaparHTML(documento.hora)}</small>
                </td>

                <td>${escaparHTML(documento.tamanho)}</td>

                <td class="doc-row-action">
                    <button
                        type="button"
                        class="doc-menu-button"
                        data-menu="${documento.id}"
                        aria-label="Ações para ${escaparHTML(documento.nome)}"
                        aria-expanded="${menuAberto === documento.id}"
                    >
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    <div class="doc-action-menu ${menuAberto === documento.id ? "open" : ""}">
                        <button type="button" data-action="detalhes" data-id="${documento.id}">
                            <i class="fa-regular fa-eye"></i>
                            Ver detalhes
                        </button>

                        <button type="button" data-action="download" data-id="${documento.id}">
                            <i class="fa-solid fa-download"></i>
                            Baixar arquivo
                        </button>

                        <button type="button" data-action="excluir" data-id="${documento.id}" class="danger">
                            <i class="fa-regular fa-trash-can"></i>
                            Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // =========================================
    // PAGINAÇÃO
    // =========================================

    function renderizarPaginacao(total, totalPaginas) {
        const botaoAnterior = $("#docPaginacao [data-page='prev']");
        const botaoProximo = $("#docPaginacao [data-page='next']");

        botaoAnterior.disabled = paginaAtual <= 1;
        botaoProximo.disabled = paginaAtual >= totalPaginas;

        let html = "";

        for (let pagina = 1; pagina <= totalPaginas; pagina++) {
            html += `
                <button
                    type="button"
                    class="doc-page-number ${pagina === paginaAtual ? "active" : ""}"
                    data-page-number="${pagina}"
                    aria-label="Página ${pagina}"
                    ${pagina === paginaAtual ? 'aria-current="page"' : ""}
                >
                    ${pagina}
                </button>
            `;
        }

        numerosPaginas.innerHTML = html;
    }

    // =========================================
    // ESTATÍSTICAS
    // =========================================

    function atualizarEstatisticas() {
        $("#docTotalPastas").textContent = pastas.length;
        $("#docTotalDocumentos").textContent = documentos.length;
        $("#docTotalDownloads").textContent = downloads;

        $("#docTotalCompartilhados").textContent =
            documentos.filter(documento => documento.compartilhado).length;

        const bytesUsados = armazenamentoInicial +
            documentos.reduce((total, documento) => {
                return total + (documento.bytes || 0);
            }, 0);

        const percentual = Math.min(
            100,
            (bytesUsados / armazenamentoTotal) * 100
        );

        $("#docArmazenamentoTexto").textContent =
            `${formatarTamanho(bytesUsados)} / 10 GB`;

        $("#docArmazenamentoPercentual").textContent =
            `${Math.round(percentual)}%`;

        $("#docProgressBar").style.width = `${percentual}%`;
    }

    // =========================================
    // RENDERIZAÇÃO GERAL
    // =========================================

    function renderizar() {
        const filtrados = obterDocumentosFiltrados();
        const quantidade = Number(porPagina.value);
        const total = filtrados.length;
        const totalPaginas = Math.max(1, Math.ceil(total / quantidade));

        paginaAtual = Math.min(paginaAtual, totalPaginas);

        const inicio = (paginaAtual - 1) * quantidade;
        const exibidos = filtrados.slice(inicio, inicio + quantidade);

        corpoTabela.innerHTML = exibidos.map(montarLinha).join("");

        vazio.hidden = total !== 0;
        corpoTabela.closest("table").style.display =
            total === 0 ? "none" : "table";

        if (total > 0) {
            contagem.textContent =
                `Mostrando ${inicio + 1} a ${Math.min(inicio + quantidade, total)} de ${total} documentos`;
        } else {
            contagem.textContent = "Nenhum documento encontrado";
        }

        renderizarPaginacao(total, totalPaginas);
        atualizarEstatisticas();
        atualizarPastas();
        atualizarRemetentes();
    }

    // =========================================
    // ENVIO DE DOCUMENTOS
    // =========================================

    function adicionarArquivos(arquivos) {
        const lista = Array.from(arquivos || []);

        if (!lista.length) return;

        let adicionados = 0;

        lista.forEach(arquivo => {
            const tipo = obterTipo(obterExtensao(arquivo.name));

            if (armazenamentoInicial + documentos.reduce(
                (total, documento) => total + (documento.bytes || 0), 0
            ) + arquivo.size > armazenamentoTotal) {
                mostrarAviso("O limite de armazenamento seria ultrapassado.");
                return;
            }

            const agora = new Date();
            const data = [
                String(agora.getDate()).padStart(2, "0"),
                String(agora.getMonth() + 1).padStart(2, "0"),
                agora.getFullYear()
            ].join("/");

            const hora = [
                String(agora.getHours()).padStart(2, "0"),
                String(agora.getMinutes()).padStart(2, "0")
            ].join(":");

            documentos.unshift({
                id: proximoIdDocumento++,
                nome: arquivo.name,
                pasta: pastaSelecionada || "Documentos Gerais",
                tipo,
                remetente: "João da Silva",
                cargo: "Professor",
                data,
                hora,
                tamanho: formatarTamanho(arquivo.size),
                bytes: arquivo.size,
                compartilhado: false,
                url: URL.createObjectURL(arquivo)
            });

            adicionados++;
        });

        if (adicionados > 0) {
            paginaAtual = 1;
            ordenacao.value = "recentes";

            atualizarPastas();
            atualizarRemetentes();
            renderizar();

            mostrarAviso(
                adicionados === 1
                    ? "Documento adicionado à lista."
                    : `${adicionados} documentos adicionados à lista.`
            );
        }

        inputArquivo.value = "";
    }

    function baixarDocumento(documento) {
        if (!documento.url) {
            mostrarAviso("Este arquivo é apenas demonstrativo e não possui conteúdo para download.");
            return;
        }

        const link = document.createElement("a");
        link.href = documento.url;
        link.download = documento.nome;

        document.body.appendChild(link);
        link.click();
        link.remove();

        downloads++;
        atualizarEstatisticas();

        mostrarAviso("Download iniciado.");
    }

    // =========================================
    // DETALHES DO DOCUMENTO
    // =========================================

    function abrirDetalhes(documento) {
        $("#docDetalhesConteudo").innerHTML = `
            <div class="doc-detail-row">
                <span>Nome</span>
                <strong>${escaparHTML(documento.nome)}</strong>
            </div>

            <div class="doc-detail-row">
                <span>Pasta</span>
                <strong>${escaparHTML(documento.pasta)}</strong>
            </div>

            <div class="doc-detail-row">
                <span>Tipo</span>
                <strong>${escaparHTML(documento.tipo)}</strong>
            </div>

            <div class="doc-detail-row">
                <span>Enviado por</span>
                <strong>${escaparHTML(documento.remetente)}</strong>
            </div>

            <div class="doc-detail-row">
                <span>Data</span>
                <strong>${escaparHTML(documento.data)} às ${escaparHTML(documento.hora)}</strong>
            </div>

            <div class="doc-detail-row">
                <span>Tamanho</span>
                <strong>${escaparHTML(documento.tamanho)}</strong>
            </div>

            <div class="doc-detail-row">
                <span>Compartilhado</span>
                <strong>${documento.compartilhado ? "Sim" : "Não"}</strong>
            </div>
        `;

        abrirModal(modalDetalhes);
    }

    // =========================================
    // EVENTOS: CABEÇALHO E PASTAS
    // =========================================

    $("#docEnviar").addEventListener("click", () => {
        inputArquivo.click();
    });

    inputArquivo.addEventListener("change", () => {
        adicionarArquivos(inputArquivo.files);
    });

    $("#docNovaPasta").addEventListener("click", () => {
        $("#docNomePasta").value = "";
        abrirModal(modalPasta);
        $("#docNomePasta").focus();
    });

    $("#docAdicionarPasta").addEventListener("click", () => {
        $("#docNomePasta").value = "";
        abrirModal(modalPasta);
        $("#docNomePasta").focus();
    });

    $("#docFormPasta").addEventListener("submit", evento => {
        evento.preventDefault();

        const nome = $("#docNomePasta").value;

        if (criarPasta(nome)) {
            fecharModal(modalPasta);
            evento.target.reset();
        }
    });

    listaPastas.addEventListener("click", evento => {
        const botao = evento.target.closest("[data-folder]");
        if (!botao) return;

        pastaSelecionada = botao.dataset.folder;
        filtroPasta.value = pastaSelecionada;
        paginaAtual = 1;
        menuAberto = null;

        atualizarPastas();
        renderizar();
    });

    $("#docTodasPastas").addEventListener("click", () => {
        pastaSelecionada = "";
        filtroPasta.value = "";
        paginaAtual = 1;

        atualizarPastas();
        renderizar();
    });

    // =========================================
    // EVENTOS: PESQUISA E FILTROS
    // =========================================

    busca.addEventListener("input", () => {
        paginaAtual = 1;
        menuAberto = null;
        renderizar();
    });

    [filtroTipo, filtroPasta, filtroRemetente, ordenacao].forEach(campo => {
        campo.addEventListener("change", () => {
            if (campo === filtroPasta) {
                pastaSelecionada = campo.value;
            }

            paginaAtual = 1;
            menuAberto = null;

            atualizarPastas();
            renderizar();
        });
    });

    $("#docBotaoFiltros").addEventListener("click", () => {
        const filtros = $("#docFiltrosExtras");
        filtros.hidden = !filtros.hidden;
    });

    $("#docLimparFiltros").addEventListener("click", limparFiltros);

    $("#docOrdenarData").addEventListener("click", () => {
        ordemDataCrescente = !ordemDataCrescente;
        ordenacao.value = "recentes";
        paginaAtual = 1;
        renderizar();
    });

    // =========================================
    // EVENTOS: CARTÕES DE RESUMO
    // =========================================

    $$(".doc-stat").forEach(cartao => {
        cartao.addEventListener("click", () => {
            const tipo = cartao.dataset.stat;

            if (tipo === "pastas") {
                pastaSelecionada = "";
                filtroPasta.value = "";
                mostrarAviso("Visualizando todas as pastas.");
            }

            if (tipo === "documentos") {
                limparFiltros();
                mostrarAviso("Visualizando todos os documentos.");
                return;
            }

            if (tipo === "downloads") {
                mostrarAviso(`Foram registrados ${downloads} downloads.`);
                return;
            }

            if (tipo === "compartilhados") {
                limparFiltros();

                // Filtro demonstrativo dos documentos compartilhados.
                const compartilhados = documentos.filter(
                    documento => documento.compartilhado
                );

                corpoTabela.innerHTML = compartilhados
                    .slice(0, Number(porPagina.value))
                    .map(montarLinha)
                    .join("");

                contagem.textContent =
                    `Mostrando ${Math.min(compartilhados.length, Number(porPagina.value))} de ${compartilhados.length} documentos compartilhados`;

                numerosPaginas.innerHTML = "";
                $("#docPaginacao [data-page='prev']").disabled = true;
                $("#docPaginacao [data-page='next']").disabled = true;

                vazio.hidden = compartilhados.length !== 0;
                corpoTabela.closest("table").style.display =
                    compartilhados.length ? "table" : "none";

                return;
            }

            atualizarPastas();
            renderizar();
        });
    });

    // =========================================
    // EVENTOS: PAGINAÇÃO
    // =========================================

    porPagina.addEventListener("change", () => {
        paginaAtual = 1;
        renderizar();
    });

    $("#docPaginacao").addEventListener("click", evento => {
        const botao = evento.target.closest("button");
        if (!botao || botao.disabled) return;

        const totalPaginas = Math.max(
            1,
            Math.ceil(
                obterDocumentosFiltrados().length /
                Number(porPagina.value)
            )
        );

        if (botao.dataset.pageNumber) {
            paginaAtual = Number(botao.dataset.pageNumber);
        } else if (botao.dataset.page === "prev") {
            paginaAtual--;
        } else if (botao.dataset.page === "next") {
            paginaAtual++;
        }

        paginaAtual = Math.max(1, Math.min(paginaAtual, totalPaginas));
        menuAberto = null;

        renderizar();
    });

    // =========================================
    // EVENTOS: MENU DE AÇÕES
    // =========================================

    corpoTabela.addEventListener("click", evento => {
        const botaoMenu = evento.target.closest("[data-menu]");

        if (botaoMenu) {
            const id = Number(botaoMenu.dataset.menu);

            menuAberto = menuAberto === id ? null : id;
            renderizar();
            return;
        }

        const botaoAcao = evento.target.closest("[data-action]");
        if (!botaoAcao) return;

        const id = Number(botaoAcao.dataset.id);
        const acao = botaoAcao.dataset.action;

        const documento = documentos.find(item => item.id === id);
        if (!documento) return;

        menuAberto = null;

        if (acao === "detalhes") {
            abrirDetalhes(documento);
            renderizar();
            return;
        }

        if (acao === "download") {
            baixarDocumento(documento);
            renderizar();
            return;
        }

        if (acao === "excluir") {
            const confirmar = window.confirm(
                `Deseja realmente excluir "${documento.nome}"?`
            );

            if (!confirmar) return;

            if (documento.url) {
                URL.revokeObjectURL(documento.url);
            }

            documentos = documentos.filter(item => item.id !== id);

            atualizarPastas();
            atualizarRemetentes();
            renderizar();

            mostrarAviso("Documento excluído da lista.");
        }
    });

    document.addEventListener("click", evento => {
        if (!raiz.contains(evento.target) && menuAberto !== null) {
            menuAberto = null;
            renderizar();
        }
    });

    // =========================================
    // EVENTOS: MODAIS
    // =========================================

    document.querySelectorAll("[data-fechar-modal]").forEach(botao => {
        botao.addEventListener("click", () => {
            fecharModal(modalPasta);
            fecharModal(modalDetalhes);
        });
    });

    [modalPasta, modalDetalhes].forEach(modal => {
        modal.addEventListener("click", evento => {
            if (evento.target === modal) {
                fecharModal(modal);
            }
        });
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            fecharModal(modalPasta);
            fecharModal(modalDetalhes);
        }
    });

    // =========================================
    // AVISO INFERIOR
    // =========================================

    $("#docFecharAviso").addEventListener("click", () => {
        $("#docAviso").hidden = true;
    });

    // =========================================
    // ARRASTAR E SOLTAR ARQUIVOS
    // =========================================

    let contadorDrag = 0;

    document.addEventListener("dragenter", evento => {
        evento.preventDefault();
        contadorDrag++;
        overlay.classList.add("active");
    });

    document.addEventListener("dragover", evento => {
        evento.preventDefault();
    });

    document.addEventListener("dragleave", evento => {
        evento.preventDefault();
        contadorDrag--;

        if (contadorDrag <= 0) {
            contadorDrag = 0;
            overlay.classList.remove("active");
        }
    });

    document.addEventListener("drop", evento => {
        evento.preventDefault();

        contadorDrag = 0;
        overlay.classList.remove("active");

        const arquivos = evento.dataTransfer?.files;
        if (arquivos?.length) {
            adicionarArquivos(arquivos);
        }
    });

    // =========================================
    // ANIMAÇÃO DOS BOTÕES
    // =========================================

    raiz.querySelectorAll("button").forEach(botao => {
        botao.addEventListener("click", () => {
            botao.classList.remove("doc-click-animation");

            void botao.offsetWidth;

            botao.classList.add("doc-click-animation");

            setTimeout(() => {
                botao.classList.remove("doc-click-animation");
            }, 220);
        });
    });

    // =========================================
    // INICIALIZAÇÃO
    // =========================================

    atualizarPastas();
    atualizarRemetentes();
    atualizarEstatisticas();
    renderizar();
});