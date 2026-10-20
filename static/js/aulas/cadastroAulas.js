
/* ==========================================
   SINART | Cadastro de Aula
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formCadastroAula");

    if (!form) return;

    const $ = (id) => document.getElementById(id);

    const tabela = $("listaHorarios");
    const mensagem = $("mensagemCadastro");

    const nome = $("nomeAula");
    const professor = $("professorAula");
    const turma = $("turmaAula");
    const area = $("categoriaAula");
    const semestre = $("semestreAula");
    const inicio = $("dataInicioAula");
    const fim = $("dataFimAula");
    const descricao = $("descricaoAula");
    const observacoes = $("observacoesAula");

    const areas = {
        musica: "Música",
        artes: "Artes",
        fotografia: "Fotografia",
        pintura: "Pintura",
        outra: "Outra"
    };

    const dias = [
        ["segunda", "Segunda-feira"],
        ["terca", "Terça-feira"],
        ["quarta", "Quarta-feira"],
        ["quinta", "Quinta-feira"],
        ["sexta", "Sexta-feira"],
        ["sabado", "Sábado"]
    ];

    const salas = [
        "Sala de Música 1",
        "Sala de Música 2",
        "Sala de Música 3",
        "Sala de Artes",
        "Sala de Fotografia",
        "Auditório",
        "Sala de Reuniões",
        "Sala de Informática"
    ];

    function dataHoje() {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    function adicionarOpcao(select, valor, texto) {
        const opcao = document.createElement("option");
        opcao.value = valor;
        opcao.textContent = texto;
        select.appendChild(opcao);
    }

    function criarCampo(rotulo, tipo, nomeCampo, opcoes = []) {
        const celula = document.createElement("td");
        celula.dataset.label = rotulo;

        const controle = document.createElement(
            tipo === "select" ? "select" : "input"
        );

        controle.name = nomeCampo;
        controle.required = true;

        if (tipo === "select") {
            adicionarOpcao(controle, "", "Selecione");

            opcoes.forEach(([valor, texto]) => {
                adicionarOpcao(controle, valor, texto);
            });
        } else {
            controle.type = tipo;
        }

        celula.appendChild(controle);

        return { celula, controle };
    }

    function atualizarEstadoVazio() {
        const linhas = tabela.querySelectorAll(
            "tr[data-horario]"
        );

        const vazio = tabela.querySelector(".cad-aula__table-empty");

        if (linhas.length === 0 && !vazio) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");

            celula.colSpan = 5;
            celula.className = "cad-aula__table-empty";
            celula.textContent = "Nenhum horário cadastrado";

            linha.appendChild(celula);
            tabela.appendChild(linha);
        }

        if (linhas.length > 0 && vazio) {
            vazio.parentElement.remove();
        }
    }

    function criarHorario() {
        const linha = document.createElement("tr");
        linha.dataset.horario = "true";

        const dia = criarCampo(
            "Dia da semana",
            "select",
            "dia_semana",
            dias
        );

        const horaInicio = criarCampo(
            "Horário inicial",
            "time",
            "horario_inicio"
        );

        const horaFim = criarCampo(
            "Horário final",
            "time",
            "horario_fim"
        );

        const sala = criarCampo(
            "Sala",
            "select",
            "sala_horario",
            salas.map((nomeSala) => [nomeSala, nomeSala])
        );

        const acoes = document.createElement("td");
        acoes.dataset.label = "Ações";

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "cad-aula__remove-row";
        remover.setAttribute("aria-label", "Remover horário");
        remover.title = "Remover horário";

        const icone = document.createElement("i");
        icone.className = "fa-solid fa-trash-can";
        icone.setAttribute("aria-hidden", "true");

        remover.appendChild(icone);

        remover.addEventListener("click", () => {
            linha.remove();
            atualizarEstadoVazio();
            atualizarResumo();
            limparMensagem();
        });

        acoes.appendChild(remover);

        linha.append(
            dia.celula,
            horaInicio.celula,
            horaFim.celula,
            sala.celula,
            acoes
        );

        [dia, horaInicio, horaFim, sala].forEach((campo) => {
            campo.controle.addEventListener("change", () => {
                atualizarResumo();
                limparMensagem();
            });
        });

        tabela.appendChild(linha);

        atualizarEstadoVazio();
        atualizarResumo();

        dia.controle.focus();
    }

    function obterHorarios() {
        return Array.from(
            tabela.querySelectorAll("tr[data-horario]")
        ).map((linha) => ({
            dia: linha.querySelector('[name="dia_semana"]').value,
            inicio: linha.querySelector('[name="horario_inicio"]').value,
            fim: linha.querySelector('[name="horario_fim"]').value,
            sala: linha.querySelector('[name="sala_horario"]').value
        }));
    }

    function textoSelecionado(campo, padrao) {
        if (!campo.value) return padrao;

        return campo.selectedOptions[0]?.textContent || padrao;
    }

    function atualizarResumo() {
        $("resumoNome").textContent =
            nome.value.trim() || "Nova aula";

        $("resumoProfessor").textContent =
            professor.value
                ? textoSelecionado(professor, "Não selecionado")
                : "Não selecionado";

        $("resumoTurma").textContent =
            turma.value.trim() || "Não informada";

        $("resumoCategoria").textContent =
            areas[area.value] || "Área não selecionada";

        $("resumoSemestre").textContent =
            semestre.value || "Não selecionado";

        const horarios = obterHorarios();

        $("resumoQuantidade").textContent =
            `${horarios.length} ${horarios.length === 1 ? "horário" : "horários"
            }`;

        const salasSelecionadas = [
            ...new Set(horarios.map((h) => h.sala).filter(Boolean))
        ];

        $("resumoLocal").textContent =
            salasSelecionadas.length === 0
                ? "Definido nos horários"
                : salasSelecionadas.length === 1
                    ? salasSelecionadas[0]
                    : `${salasSelecionadas.length} salas`;
    }

    function configurarContador(campo, contadorId) {
        const contador = $(contadorId);

        const atualizar = () => {
            contador.textContent = campo.value.length;
        };

        campo.addEventListener("input", atualizar);
        atualizar();
    }

    function mostrarMensagem(texto) {
        mensagem.textContent = texto;
        mensagem.hidden = false;

        mensagem.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    function limparMensagem() {
        mensagem.textContent = "";
        mensagem.hidden = true;
    }

    function validar() {
        limparMensagem();

        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        if (inicio.value < dataHoje()) {
            mostrarMensagem(
                "A data inicial não pode estar no passado."
            );
            inicio.focus();
            return false;
        }

        if (fim.value < inicio.value) {
            mostrarMensagem(
                "A data final deve ser igual ou posterior à data inicial."
            );
            fim.focus();
            return false;
        }

        const horarios = obterHorarios();

        if (horarios.length === 0) {
            mostrarMensagem(
                "Adicione pelo menos um horário para a aula."
            );
            $("adicionarHorario").focus();
            return false;
        }

        for (let i = 0; i < horarios.length; i++) {
            const h = horarios[i];

            if (!h.dia || !h.inicio || !h.fim || !h.sala) {
                mostrarMensagem(
                    `Preencha todos os campos do horário ${i + 1}.`
                );
                return false;
            }

            if (h.fim <= h.inicio) {
                mostrarMensagem(
                    `No horário ${i + 1}, o término deve ser posterior ao início.`
                );
                return false;
            }
        }

        // Evita sobreposição entre horários desta própria aula.
        for (let i = 0; i < horarios.length; i++) {
            for (let j = i + 1; j < horarios.length; j++) {
                const a = horarios[i];
                const b = horarios[j];

                if (a.dia !== b.dia) continue;

                const sobreposicao =
                    a.inicio < b.fim &&
                    b.inicio < a.fim;

                if (sobreposicao) {
                    mostrarMensagem(
                        `Os horários ${i + 1} e ${j + 1} se sobrepõem no mesmo dia.`
                    );
                    return false;
                }
            }
        }

        return true;
    }

    // Eventos dos campos principais.
    [
        nome,
        professor,
        turma,
        area,
        semestre
    ].forEach((campo) => {
        campo.addEventListener("input", atualizarResumo);
        campo.addEventListener("change", atualizarResumo);
    });

    [descricao, observacoes].forEach((campo) => {
        campo.addEventListener("input", limparMensagem);
    });

    configurarContador(descricao, "contadorDescricao");
    configurarContador(observacoes, "contadorObservacoes");

    // Período da aula.
    inicio.min = dataHoje();
    fim.min = dataHoje();

    inicio.addEventListener("change", () => {
        fim.min = inicio.value || dataHoje();

        if (fim.value && fim.value < inicio.value) {
            fim.value = "";
        }

        limparMensagem();
    });

    fim.addEventListener("change", limparMensagem);

    // Adicionar horários.
    $("adicionarHorario").addEventListener("click", () => {
        criarHorario();
        limparMensagem();
    });

    // Envio para o Django.
    form.addEventListener("submit", (event) => {
        if (!validar()) {
            event.preventDefault();
        }

        /*
         * Se os dados forem válidos, o formulário será enviado
         * por POST à view Django definida em action="".
         *
         * A view deverá salvar a aula e os horários no banco,
         * validar conflitos com outras aulas e reservas e
         * tratar eventuais erros de persistência.
         */
    });

    // Inicialização.
    atualizarEstadoVazio();
    criarHorario();
    atualizarResumo();
});
