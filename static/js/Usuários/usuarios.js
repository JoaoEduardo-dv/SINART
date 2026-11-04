document.addEventListener("DOMContentLoaded", () => {
    /*
     * LINKS DE DIRECIONAMENTO
     * Configure aqui apenas os links das ações que ainda dependem do JavaScript.
     * O botão Novo usuário é direcionado diretamente pelo HTML.
     */
    const LINKS = {
        editarUsuario: "", // Ex.: "/usuarios/editar/ID/"
        perfilUsuario: "", // Ex.: "/usuarios/detalhes/ID/"
        permissoes: "" // Ex.: "/usuarios/perfis-permissoes/"
    };

    const raiz = document.getElementById("usuariosPage");
    if (!raiz) return;

    const $ = (seletor) => raiz.querySelector(seletor);

    /*
     * DADOS DEMONSTRATIVOS
     * Substitua posteriormente por dados fornecidos pelo Django.
     */
    const usuarios = [
        {
            id: 1, nome: "João da Silva", matricula: "2021001",
            perfil: "Professor", departamento: "Música",
            email: "joao.silva@ifrn.edu.br", status: "Ativo",
            acesso: "07/05/2025 14:32", iniciais: "JS"
        },
        {
            id: 2, nome: "Ana Beatriz Rocha", matricula: "2022003",
            perfil: "Bolsista", departamento: "Artes Visuais",
            email: "ana.rocha@ifrn.edu.br", status: "Ativo",
            acesso: "06/05/2025 09:15", iniciais: "AB"
        },
        {
            id: 3, nome: "Carlos Eduardo Lima", matricula: "2021007",
            perfil: "Servidor", departamento: "Administração",
            email: "carlos.lima@ifrn.edu.br", status: "Ativo",
            acesso: "05/05/2025 16:45", iniciais: "CL"
        },
        {
            id: 4, nome: "Maria Clara Souza", matricula: "2023002",
            perfil: "Bolsista", departamento: "Música",
            email: "maria.souza@ifrn.edu.br", status: "Ativo",
            acesso: "04/05/2025 11:20", iniciais: "MC"
        },
        {
            id: 5, nome: "Pedro Henrique Alves", matricula: "2023009",
            perfil: "Aluno", departamento: "Música",
            email: "pedro.alves@ifrn.edu.br", status: "Ativo",
            acesso: "03/05/2025 18:10", iniciais: "PH"
        },
        {
            id: 6, nome: "Fernanda Santos", matricula: "2022008",
            perfil: "Professor", departamento: "Artes Visuais",
            email: "fernanda.santos@ifrn.edu.br", status: "Ativo",
            acesso: "03/05/2025 10:05", iniciais: "FS"
        },
        {
            id: 7, nome: "Rafael Lima", matricula: "2023011",
            perfil: "Aluno", departamento: "Teatro",
            email: "rafael.lima@ifrn.edu.br", status: "Inativo",
            acesso: "20/04/2025 13:50", iniciais: "RL"
        },
        {
            id: 8, nome: "Juliana Andrade", matricula: "2021005",
            perfil: "Administrador", departamento: "Núcleo de Arte",
            email: "juliana.andrade@ifrn.edu.br", status: "Ativo",
            acesso: "07/05/2025 10:30", iniciais: "JA"
        },
        {
            id: 9, nome: "Vitor Gabriel", matricula: "2022015",
            perfil: "Servidor", departamento: "Tecnologia",
            email: "vitor.gabriel@ifrn.edu.br", status: "Ativo",
            acesso: "02/05/2025 08:40", iniciais: "VG"
        },
        {
            id: 10, nome: "Letícia Pereira", matricula: "2023016",
            perfil: "Aluno", departamento: "Danças",
            email: "leticia.pereira@ifrn.edu.br", status: "Ativo",
            acesso: "01/05/2025 19:25", iniciais: "LP"
        }
    ];

    const busca = $("#usuBusca");
    const filtroPerfil = $("#usuFiltroPerfil");
    const filtroStatus = $("#usuFiltroStatus");
    const filtroDepartamento = $("#usuFiltroDepartamento");
    const filtrosExtra = $("#usuFiltrosExtra");
    const corpoTabela = $("#usuTabelaCorpo");
    const vazio = $("#usuVazio");
    const contagem = $("#usuContagem");
    const numerosPaginas = $("#usuNumerosPaginas");
    const porPagina = $("#usuPorPagina");
    const toast = $("#usuToast");

    let paginaAtual = 1;
    let usuarioMenuAberto = null;
    let toastTimeout = null;

    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caractere]);
    }

    function mostrarAviso(texto) {
        toast.textContent = texto;
        toast.hidden = false;

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.hidden = true;
        }, 3500);
    }

    function perfilClasse(perfil) {
        const classes = {
            Professor: "usu-perfil-professor",
            Aluno: "usu-perfil-aluno",
            Bolsista: "usu-perfil-bolsista",
            Servidor: "usu-perfil-servidor",
            Administrador: "usu-perfil-administrador"
        };

        return classes[perfil] || "usu-perfil-servidor";
    }

    function statusClasse(status) {
        return status === "Ativo"
            ? "usu-status-ativo"
            : "usu-status-inativo";
    }

    function obterUsuariosFiltrados() {
        const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
        const perfil = filtroPerfil.value;
        const status = filtroStatus.value;
        const departamento = filtroDepartamento.value;

        return usuarios.filter(usuario => {
            const textoBusca = [
                usuario.nome,
                usuario.email,
                usuario.matricula,
                usuario.perfil,
                usuario.departamento
            ].join(" ").toLocaleLowerCase("pt-BR");

            return (
                (!termo || textoBusca.includes(termo)) &&
                (!perfil || usuario.perfil === perfil) &&
                (!status || usuario.status === status) &&
                (!departamento || usuario.departamento === departamento)
            );
        });
    }

    function montarLinha(usuario, indice) {
        const avatarClasse = `usu-avatar-${indice % 10}`;
        const eUsuarioAtual = usuario.id === 1;

        return `
            <tr>
                <td>
                    <div class="usu-user">
                        <span class="usu-avatar ${avatarClasse}">
                            ${escaparHTML(usuario.iniciais)}
                        </span>
                        <span>
                            ${escaparHTML(usuario.nome)}
                            ${eUsuarioAtual
                                ? '<span class="usu-voce">Você</span>'
                                : ""}
                        </span>
                    </div>
                </td>
                <td>${escaparHTML(usuario.matricula)}</td>
                <td>
                    <span class="usu-badge ${perfilClasse(usuario.perfil)}">
                        ${escaparHTML(usuario.perfil)}
                    </span>
                </td>
                <td>${escaparHTML(usuario.departamento)}</td>
                <td>${escaparHTML(usuario.email)}</td>
                <td>
                    <span class="usu-badge ${statusClasse(usuario.status)}">
                        ${escaparHTML(usuario.status)}
                    </span>
                </td>
                <td>${escaparHTML(usuario.acesso)}</td>
                <td class="usu-acao">
                    <div class="usu-menu-wrap">
                        <button
                            type="button"
                            class="usu-menu-btn"
                            data-menu="${usuario.id}"
                            aria-label="Ações para ${escaparHTML(usuario.nome)}"
                            aria-expanded="${usuarioMenuAberto === usuario.id}"
                        >
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <div class="usu-menu ${usuarioMenuAberto === usuario.id
                            ? "is-open" : ""}">
                            <button type="button" data-action="ver"
                                data-id="${usuario.id}">Ver detalhes</button>
                            <button type="button" data-action="editar"
                                data-id="${usuario.id}">Editar usuário</button>
                            <button type="button" data-action="permissoes"
                                data-id="${usuario.id}">Permissões</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderizarPaginacao(total, totalPaginas) {
        const botoes = $("#usuPaginacao");

        botoes.querySelector('[data-page="first"]').disabled =
            paginaAtual <= 1;
        botoes.querySelector('[data-page="prev"]').disabled =
            paginaAtual <= 1;
        botoes.querySelector('[data-page="next"]').disabled =
            paginaAtual >= totalPaginas;
        botoes.querySelector('[data-page="last"]').disabled =
            paginaAtual >= totalPaginas;

        let html = "";

        for (let pagina = 1; pagina <= totalPaginas; pagina++) {
            html += `
                <button
                    type="button"
                    class="usu-page-number ${pagina === paginaAtual
                        ? "is-current" : ""}"
                    data-page-number="${pagina}"
                    aria-label="Página ${pagina}"
                    ${pagina === paginaAtual ? 'aria-current="page"' : ""}
                >${pagina}</button>
            `;
        }

        numerosPaginas.innerHTML = html;
    }

    function renderizar() {
        const filtrados = obterUsuariosFiltrados();
        const quantidade = Number(porPagina.value);
        const total = filtrados.length;
        const totalPaginas = Math.max(1, Math.ceil(total / quantidade));

        paginaAtual = Math.min(paginaAtual, totalPaginas);

        const inicio = (paginaAtual - 1) * quantidade;
        const exibidos = filtrados.slice(inicio, inicio + quantidade);

        corpoTabela.innerHTML = exibidos.map((usuario, indice) =>
            montarLinha(usuario, inicio + indice)
        ).join("");

        vazio.hidden = total !== 0;
        $("#usuTabelaCorpo").closest("table").style.display =
            total === 0 ? "none" : "table";

        contagem.textContent = total
            ? `Mostrando ${inicio + 1} a ${Math.min(inicio + quantidade, total)} de ${total} usuários`
            : "Nenhum usuário encontrado";

        renderizarPaginacao(total, totalPaginas);
        atualizarCartoes();
    }

    function atualizarCartoes() {
        $("#usuTotal").textContent = usuarios.length;
        $("#usuAlunos").textContent =
            usuarios.filter(u => u.perfil === "Aluno").length;
        $("#usuProfessores").textContent =
            usuarios.filter(u => u.perfil === "Professor").length;
        $("#usuAdministradores").textContent =
            usuarios.filter(u => u.perfil === "Administrador").length;
    }

    function limparFiltros() {
        busca.value = "";
        filtroPerfil.value = "";
        filtroStatus.value = "";
        filtroDepartamento.value = "";
        paginaAtual = 1;
        renderizar();
    }

    function abrirLink(chave, id = null) {
        const base = LINKS[chave];

        if (!base) {
            mostrarAviso("Configure o link de destino no início do arquivo usuarios.js.");
            return;
        }

        const destino = id !== null
            ? base.replace("ID", encodeURIComponent(id))
            : base;

        window.location.href = destino;
    }

    // Pesquisa e filtros combinados.
    [busca, filtroPerfil, filtroStatus, filtroDepartamento].forEach(campo => {
        campo.addEventListener(
            campo === busca ? "input" : "change",
            () => {
                paginaAtual = 1;
                usuarioMenuAberto = null;
                renderizar();
            }
        );
    });

    porPagina.addEventListener("change", () => {
        paginaAtual = 1;
        renderizar();
    });

    // Cartões: aplicam filtro de perfil.
    raiz.querySelectorAll("[data-stat-filter]").forEach(cartao => {
        cartao.addEventListener("click", () => {
            const perfil = cartao.dataset.statFilter;

            limparFiltros();

            if (perfil !== "todos") {
                filtroPerfil.value = perfil;
            }

            paginaAtual = 1;
            renderizar();
        });
    });

    // Mostrar ou ocultar filtros adicionais.
    $("#usuBotaoFiltros").addEventListener("click", () => {
        filtrosExtra.hidden = !filtrosExtra.hidden;
    });

    $("#usuLimparFiltros").addEventListener("click", limparFiltros);

    // Paginação.
    $("#usuPaginacao").addEventListener("click", evento => {
        const botao = evento.target.closest("button");
        if (!botao || botao.disabled) return;

        const totalPaginas = Math.max(
            1,
            Math.ceil(obterUsuariosFiltrados().length / Number(porPagina.value))
        );

        if (botao.dataset.pageNumber) {
            paginaAtual = Number(botao.dataset.pageNumber);
        } else {
            switch (botao.dataset.page) {
                case "first": paginaAtual = 1; break;
                case "prev": paginaAtual--; break;
                case "next": paginaAtual++; break;
                case "last": paginaAtual = totalPaginas; break;
            }
        }

        usuarioMenuAberto = null;
        renderizar();
    });

    // Menu de ações de cada usuário.
    corpoTabela.addEventListener("click", evento => {
        const botaoMenu = evento.target.closest("[data-menu]");

        if (botaoMenu) {
            const id = Number(botaoMenu.dataset.menu);

            usuarioMenuAberto = usuarioMenuAberto === id ? null : id;
            renderizar();
            return;
        }

        const acao = evento.target.closest("[data-action]");
        if (!acao) return;

        const id = acao.dataset.id;
        const tipo = acao.dataset.action;

        usuarioMenuAberto = null;

        if (tipo === "ver") abrirLink("perfilUsuario", id);
        if (tipo === "editar") abrirLink("editarUsuario", id);
        if (tipo === "permissoes") abrirLink("permissoes");

        renderizar();
    });

    // Fechar menus ao clicar fora deles.
    document.addEventListener("click", evento => {
        if (!raiz.contains(evento.target) && usuarioMenuAberto !== null) {
            usuarioMenuAberto = null;
            renderizar();
        }
    });

    /*
     * O botão Novo usuário não precisa de JavaScript.
     * O direcionamento está diretamente no HTML:
     * <a href=" url 'cadastroUsuario' " ...>
     */

    // Exportar os usuários filtrados para CSV.
    $("#usuExportar").addEventListener("click", () => {
        const filtrados = obterUsuariosFiltrados();

        if (!filtrados.length) {
            mostrarAviso("Não há usuários para exportar.");
            return;
        }

        const colunas = [
            ["Nome", "nome"],
            ["Matrícula", "matricula"],
            ["Perfil", "perfil"],
            ["Departamento/Área", "departamento"],
            ["E-mail", "email"],
            ["Status", "status"],
            ["Último acesso", "acesso"]
        ];

        const escaparCSV = valor =>
            `"${String(valor ?? "").replace(/"/g, '""')}"`;

        const linhas = [
            colunas.map(([titulo]) => escaparCSV(titulo)).join(";"),
            ...filtrados.map(usuario =>
                colunas.map(([, chave]) =>
                    escaparCSV(usuario[chave])
                ).join(";")
            )
        ];

        const arquivo = new Blob(
            ["\uFEFF" + linhas.join("\r\n")],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = url;
        link.download = "usuarios-sinart.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
        mostrarAviso("Arquivo CSV exportado com sucesso.");
    });

    renderizar();
});