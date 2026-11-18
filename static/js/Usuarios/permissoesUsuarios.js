document.addEventListener("DOMContentLoaded", () => {
    const raiz = document.getElementById("permissoesPage");
    if (!raiz) return;

    const $ = (seletor) => raiz.querySelector(seletor);

    const modulos = [
        { nome: "Usuários", icone: "fa-users" },
        { nome: "Reservas de Salas", icone: "fa-calendar-days" },
        { nome: "Empréstimos", icone: "fa-book-open" },
        { nome: "Aulas e Horários", icone: "fa-graduation-cap" },
        { nome: "Calendário Acadêmico", icone: "fa-calendar" },
        { nome: "Painel Semanal", icone: "fa-table-cells-large" },
        { nome: "Documentos", icone: "fa-folder" },
        { nome: "Configurações do Sistema", icone: "fa-gear" }
    ];

    const acoes = ["visualizar", "cadastrar", "editar", "excluir", "exportar"];

    const perfis = [
        {
            nome: "Administrador",
            tipo: "Sistema",
            descricao: "Acesso total a todas as funcionalidades do sistema.",
            usuarios: 8,
            id: "PER-001",
            permissoes: criarPermissoes(true)
        },
        {
            nome: "Professor",
            tipo: "Padrão",
            descricao: "Acesso às funcionalidades acadêmicas e de gestão de atividades.",
            usuarios: 12,
            id: "PER-002",
            permissoes: criarPermissoes(true)
        },
        {
            nome: "Servidor",
            tipo: "Padrão",
            descricao: "Acesso às funcionalidades administrativas e operacionais.",
            usuarios: 10,
            id: "PER-003",
            permissoes: criarPermissoes(true)
        },
        {
            nome: "Aluno",
            tipo: "Padrão",
            descricao: "Acesso às informações acadêmicas e participação.",
            usuarios: 15,
            id: "PER-004",
            permissoes: criarPermissoes(false)
        },
        {
            nome: "Visitante",
            tipo: "Personalizado",
            descricao: "Acesso limitado a informações públicas.",
            usuarios: 3,
            id: "PER-005",
            permissoes: criarPermissoes(false)
        }
    ];

    const usuariosExemplo = {
        Administrador: [
            ["João da Silva", "joao.silva@ifrn.edu.br", "JS"],
            ["Juliana Andrade", "juliana.andrade@ifrn.edu.br", "JA"],
            ["Carlos Eduardo Lima", "carlos.lima@ifrn.edu.br", "CL"]
        ],
        Professor: [
            ["Maria Clara Souza", "maria.souza@ifrn.edu.br", "MC"],
            ["Fernanda Santos", "fernanda.santos@ifrn.edu.br", "FS"],
            ["Pedro Henrique Alves", "pedro.alves@ifrn.edu.br", "PH"]
        ],
        Servidor: [
            ["Vitor Gabriel", "vitor.gabriel@ifrn.edu.br", "VG"],
            ["Ana Beatriz Rocha", "ana.rocha@ifrn.edu.br", "AB"]
        ],
        Aluno: [
            ["Rafael Lima", "rafael.lima@ifrn.edu.br", "RL"],
            ["Letícia Pereira", "leticia.pereira@ifrn.edu.br", "LP"]
        ],
        Visitante: [
            ["Visitante de exemplo", "visitante@ifrn.edu.br", "VE"]
        ]
    };

    let perfilSelecionado = perfis[0];
    let toastTimeout;

    function criarPermissoes(valor) {
        return modulos.map((modulo, indice) => ({
            modulo: modulo.nome,
            visualizar: valor,
            cadastrar: valor,
            editar: valor,
            excluir: valor,
            exportar: valor && indice !== 7
        }));
    }

    function mostrarAviso(mensagem) {
        const toast = $("#perToast");

        toast.textContent = mensagem;
        toast.hidden = false;

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.hidden = true;
        }, 3000);
    }

    function atualizarIndicadores() {
        $("#perTotalPerfis").textContent = perfis.length;

        const totalPermissoes = perfis.reduce((total, perfil) => {
            return total + perfil.permissoes.reduce((soma, modulo) => {
                return soma + acoes.filter(acao => modulo[acao]).length;
            }, 0);
        }, 0);

        $("#perTotalPermissoes").textContent = totalPermissoes;
        $("#perTotalUsuarios").textContent =
            perfis.reduce((total, perfil) => total + perfil.usuarios, 0);
    }

    function renderizarTabelaPermissoes() {
        const tabela = $("#perTabelaPermissoes");

        tabela.innerHTML = perfilSelecionado.permissoes.map((permissao, indice) => {
            const modulo = modulos[indice];

            return `
                <tr>
                    <td>
                        <div class="per-module">
                            <i class="fa-solid ${modulo.icone}"></i>
                            <span>${modulo.nome}</span>
                        </div>
                    </td>

                    ${acoes.map(acao => `
                        <td>
                            <button
                                type="button"
                                class="per-check ${permissao[acao] ? "" : "off"}"
                                data-module="${indice}"
                                data-action="${acao}"
                                aria-label="${permissao[acao] ? "Desativar" : "Ativar"} ${acao} em ${modulo.nome}"
                                aria-pressed="${permissao[acao]}"
                            >
                                <i class="fa-solid ${permissao[acao] ? "fa-check" : "fa-minus"}"></i>
                            </button>
                        </td>
                    `).join("")}
                </tr>
            `;
        }).join("");
    }

    function renderizarListaUsuarios() {
        const lista = usuariosExemplo[perfilSelecionado.nome] || [];

        $("#perQuantidadeVinculados").textContent = perfilSelecionado.usuarios;
        $("#perTextoVinculados").textContent =
            `${perfilSelecionado.usuarios} usuários vinculados`;

        $("#perListaVinculados").innerHTML = lista.map(usuario => `
            <div class="per-linked-user">
                <span class="per-linked-avatar">${usuario[2]}</span>
                <div>
                    <strong>${usuario[0]}</strong>
                    <small>${usuario[1]}</small>
                </div>
            </div>
        `).join("");

        if (!lista.length) {
            $("#perListaVinculados").innerHTML =
                "<p>Nenhum usuário demonstrativo vinculado a este perfil.</p>";
        }
    }

    function atualizarInformacoes() {
        $("#perNomePerfil").textContent = perfilSelecionado.nome;
        $("#perTipoPerfil").textContent = perfilSelecionado.tipo;
        $("#perDescricaoPerfil").textContent = perfilSelecionado.descricao;

        $("#perInfoNome").textContent = perfilSelecionado.nome;
        $("#perInfoTipo").textContent = perfilSelecionado.tipo;
        $("#perInfoUsuarios").textContent = perfilSelecionado.usuarios;
        $("#perInfoId").textContent = perfilSelecionado.id;

        const quantidade = perfilSelecionado.permissoes.reduce((total, modulo) => {
            return total + acoes.filter(acao => modulo[acao]).length;
        }, 0);

        $("#perInfoPermissoes").textContent = quantidade;
    }

    function selecionarPerfil(nome) {
        const perfil = perfis.find(item => item.nome === nome);
        if (!perfil) return;

        perfilSelecionado = perfil;

        raiz.querySelectorAll(".per-profile").forEach(botao => {
            botao.classList.toggle(
                "active",
                botao.dataset.profile === nome
            );
        });

        atualizarInformacoes();
        renderizarTabelaPermissoes();
        renderizarListaUsuarios();
    }

    // Pesquisa de perfis.
    $("#perBusca").addEventListener("input", evento => {
        const termo = evento.target.value.toLocaleLowerCase("pt-BR");

        raiz.querySelectorAll(".per-profile").forEach(botao => {
            const nome = botao.dataset.profile.toLocaleLowerCase("pt-BR");
            botao.hidden = !nome.includes(termo);
        });
    });

    // Seleção de perfil.
    $("#perListaPerfis").addEventListener("click", evento => {
        const botao = evento.target.closest("[data-profile]");
        if (!botao) return;

        selecionarPerfil(botao.dataset.profile);

        // Ao selecionar outro perfil, volta à aba de permissões.
        selecionarAbaDetalhe("modulos");
    });

    // Abas principais.
    raiz.querySelectorAll("[data-main-tab]").forEach(botao => {
        botao.addEventListener("click", () => {
            const aba = botao.dataset.mainTab;

            raiz.querySelectorAll("[data-main-tab]").forEach(item => {
                item.classList.toggle("active", item === botao);
            });

            raiz.querySelectorAll("[data-main-content]").forEach(conteudo => {
                conteudo.hidden = conteudo.dataset.mainContent !== aba;
            });
        });
    });

    // Abas internas.
    function selecionarAbaDetalhe(aba) {
        raiz.querySelectorAll("[data-detail-tab]").forEach(botao => {
            botao.classList.toggle(
                "active",
                botao.dataset.detailTab === aba
            );
        });

        raiz.querySelectorAll("[data-detail-content]").forEach(conteudo => {
            conteudo.hidden = conteudo.dataset.detailContent !== aba;
        });
    }

    raiz.querySelectorAll("[data-detail-tab]").forEach(botao => {
        botao.addEventListener("click", () => {
            selecionarAbaDetalhe(botao.dataset.detailTab);
        });
    });

    // Alternar permissões individuais.
    $("#perTabelaPermissoes").addEventListener("click", evento => {
        const botao = evento.target.closest("[data-module][data-action]");
        if (!botao) return;

        const indice = Number(botao.dataset.module);
        const acao = botao.dataset.action;

        perfilSelecionado.permissoes[indice][acao] =
            !perfilSelecionado.permissoes[indice][acao];

        renderizarTabelaPermissoes();
        atualizarInformacoes();
    });

    // Marcar todas as permissões.
    $("#perMarcarTodas").addEventListener("click", () => {
        perfilSelecionado.permissoes.forEach(modulo => {
            acoes.forEach(acao => {
                modulo[acao] = true;
            });
        });

        renderizarTabelaPermissoes();
        atualizarInformacoes();

        mostrarAviso("Todas as permissões foram marcadas.");
    });

    // Desmarcar todas as permissões.
    $("#perDesmarcarTodas").addEventListener("click", () => {
        perfilSelecionado.permissoes.forEach(modulo => {
            acoes.forEach(acao => {
                modulo[acao] = false;
            });
        });

        renderizarTabelaPermissoes();
        atualizarInformacoes();

        mostrarAviso("Todas as permissões foram desmarcadas.");
    });

    // Salvar permissões (protótipo).
    $("#perSalvar").addEventListener("click", () => {
        mostrarAviso(
            "Permissões atualizadas no protótipo. A gravação no banco ainda precisa ser implementada."
        );

        atualizarIndicadores();
    });

    // Botão editar perfil.
    $("#perEditar").addEventListener("click", () => {
        mostrarAviso(
            "A edição do perfil será conectada à página de cadastro/edição posteriormente."
        );
    });

    // Botão excluir perfil.
    $("#perExcluir").addEventListener("click", () => {
        if (perfilSelecionado.tipo === "Sistema") {
            mostrarAviso("Este perfil do sistema não pode ser excluído.");
            return;
        }

        const confirmar = window.confirm(
            `Deseja realmente excluir o perfil ${perfilSelecionado.nome}?`
        );

        if (!confirmar) return;

        mostrarAviso(
            "A exclusão real do perfil precisa ser conectada ao banco de dados."
        );
    });

    // Indicadores superiores.
    raiz.querySelectorAll("[data-stat-action]").forEach(botao => {
        botao.addEventListener("click", () => {
            const acao = botao.dataset.statAction;

            if (acao === "perfis") {
                selecionarAbaPrincipal("perfis");
            }

            if (acao === "permissoes") {
                selecionarAbaPrincipal("permissoes");
            }

            if (acao === "seguranca") {
                mostrarAviso(
                    "As permissões controlam o acesso de cada perfil aos módulos do SINART."
                );
            }
        });
    });

    function selecionarAbaPrincipal(aba) {
        const botao = raiz.querySelector(`[data-main-tab="${aba}"]`);
        if (botao) botao.click();
    }

    // Tabela da aba geral.
    function renderizarTabelaGeral() {
        $("#perTabelaGeral").innerHTML = perfis.map(perfil => {
            const quantidade = perfil.permissoes.reduce((total, modulo) => {
                return total + acoes.filter(acao => modulo[acao]).length;
            }, 0);

            return `
                <tr>
                    <td>${perfil.nome}</td>
                    <td>${perfil.usuarios}</td>
                    <td>${quantidade}</td>
                    <td><span class="per-info-active">Ativo</span></td>
                    <td>
                        <button
                            type="button"
                            class="per-btn per-btn-outline"
                            data-ver-perfil="${perfil.nome}"
                        >
                            Ver perfil
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    $("#perTabelaGeral").addEventListener("click", evento => {
        const botao = evento.target.closest("[data-ver-perfil]");
        if (!botao) return;

        selecionarPerfil(botao.dataset.verPerfil);
        selecionarAbaPrincipal("perfis");
    });

    // Renderização inicial.
    atualizarIndicadores();
    selecionarPerfil("Administrador");
    renderizarTabelaGeral();
});