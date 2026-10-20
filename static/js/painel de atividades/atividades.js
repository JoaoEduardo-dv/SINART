
/* =====================================================
   SINART - PAINEL DE ATIVIDADES
   Navegação diária, semanal, mensal e semestral
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const painel = document.getElementById("painelAtividades");

  if (!painel) return;

  const calendario = document.getElementById("paCalendario");
  const seletorData = document.getElementById("paData");
  const tituloPeriodo = document.getElementById("paTituloPeriodo");
  const subtituloPeriodo = document.getElementById("paSubtituloPeriodo");
  const contador = document.getElementById("paContador");
  const anuncio = document.getElementById("paAnuncio");
  const filtroTipo = document.getElementById("paFiltroTipo");
  const botoesVisualizacao = [
    ...painel.querySelectorAll("[data-view]")
  ];

  const nomesMeses = [
    "janeiro", "fevereiro", "março", "abril",
    "maio", "junho", "julho", "agosto",
    "setembro", "outubro", "novembro", "dezembro"
  ];

  const nomesMesesAbreviados = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
  ];

  const nomesDias = [
    "domingo", "segunda-feira", "terça-feira",
    "quarta-feira", "quinta-feira", "sexta-feira",
    "sábado"
  ];

  const nomesDiasCurtos = [
    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
  ];

  const nomesTipos = {
    aula: "Aula",
    reserva: "Reserva",
    emprestimo: "Empréstimo",
    reuniao: "Reunião",
    projeto: "Projeto"
  };

  let visualizacao = "semana";
  let dataSelecionada = inicioDoDia(new Date());

  /*
   * DADOS DEMONSTRATIVOS
   *
   * Substitua esta lista pelos dados reais de atividades
   * enviados pela sua view Django.
   *
   * Campos esperados:
   * id, titulo, tipo, data, inicio, fim, local, responsavel
   *
   * data: YYYY-MM-DD
   * inicio/fim: HH:MM
   */
  const hoje = inicioDoDia(new Date());

  function deslocarData(data, quantidade) {
    const resultado = new Date(data);
    resultado.setDate(resultado.getDate() + quantidade);
    return resultado;
  }

  function dataISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  const atividades = [
    {
      id: 1,
      titulo: "Aula de Teoria Musical",
      tipo: "aula",
      data: dataISO(hoje),
      inicio: "08:00",
      fim: "09:40",
      local: "Sala de Música 1",
      responsavel: "Prof. Lucas"
    },
    {
      id: 2,
      titulo: "Reserva de sala",
      tipo: "reserva",
      data: dataISO(hoje),
      inicio: "10:00",
      fim: "11:00",
      local: "Sala de Artes",
      responsavel: "Núcleo de Arte"
    },
    {
      id: 3,
      titulo: "Ensaio Coral",
      tipo: "aula",
      data: dataISO(deslocarData(hoje, 1)),
      inicio: "14:00",
      fim: "16:00",
      local: "Sala de Música 2",
      responsavel: "Prof. Ana"
    },
    {
      id: 4,
      titulo: "Reunião do Núcleo",
      tipo: "reuniao",
      data: dataISO(deslocarData(hoje, 2)),
      inicio: "10:00",
      fim: "11:30",
      local: "Sala de Reuniões",
      responsavel: "Coordenação"
    },
    {
      id: 5,
      titulo: "Devolução de microfone",
      tipo: "emprestimo",
      data: dataISO(deslocarData(hoje, 3)),
      inicio: "",
      fim: "",
      local: "Coordenação",
      responsavel: "Responsável pelo empréstimo"
    },
    {
      id: 6,
      titulo: "Projeto Arte e Cultura",
      tipo: "projeto",
      data: dataISO(deslocarData(hoje, 5)),
      inicio: "13:00",
      fim: "16:00",
      local: "Auditório",
      responsavel: "Núcleo de Arte"
    }
  ];

  // -------------------------------------------------
  // UTILITÁRIOS DE DATA
  // -------------------------------------------------

  function inicioDoDia(data) {
    return new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate()
    );
  }

  function primeiroDiaMes(data) {
    return new Date(data.getFullYear(), data.getMonth(), 1);
  }

  function ultimoDiaMes(data) {
    return new Date(data.getFullYear(), data.getMonth() + 1, 0);
  }

  function primeiroDiaSemana(data) {
    const resultado = inicioDoDia(data);
    const diaSemana = resultado.getDay();

    // Segunda-feira = primeiro dia da semana
    const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;

    resultado.setDate(resultado.getDate() + diferenca);
    return resultado;
  }

  function inicioSemestre(data) {
    const mesInicial = data.getMonth() < 6 ? 0 : 6;

    return new Date(data.getFullYear(), mesInicial, 1);
  }

  function fimSemestre(data) {
    const inicio = inicioSemestre(data);

    return new Date(
      inicio.getFullYear(),
      inicio.getMonth() + 6,
      0
    );
  }

  function adicionarMeses(data, quantidade) {
    /*
     * Mantém o dia do mês quando possível.
     * Evita, por exemplo, que avançar de 31 de janeiro
     * resulte inesperadamente em março.
     */
    const diaOriginal = data.getDate();
    const resultado = new Date(
      data.getFullYear(),
      data.getMonth() + quantidade,
      1
    );

    const ultimoDia = new Date(
      resultado.getFullYear(),
      resultado.getMonth() + 1,
      0
    ).getDate();

    resultado.setDate(Math.min(diaOriginal, ultimoDia));

    return resultado;
  }

  function formatarData(data, opcoes = {}) {
    return data.toLocaleDateString("pt-BR", opcoes);
  }

  function mesmoDia(a, b) {
    return dataISO(a) === dataISO(b);
  }

  function estaNoIntervalo(data, inicio, fim) {
    const valor = inicioDoDia(data).getTime();

    return (
      valor >= inicioDoDia(inicio).getTime() &&
      valor <= inicioDoDia(fim).getTime()
    );
  }

  function nomeDia(data) {
    return nomesDias[data.getDay()];
  }

  // -------------------------------------------------
  // FILTROS E ATIVIDADES
  // -------------------------------------------------

  function atividadesFiltradas() {
    const tipoSelecionado = filtroTipo.value;

    return atividades
      .filter(atividade => {
        return (
          tipoSelecionado === "todos" ||
          atividade.tipo === tipoSelecionado
        );
      })
      .sort((a, b) => {
        if (a.data !== b.data) {
          return a.data.localeCompare(b.data);
        }

        return (a.inicio || "99:99")
          .localeCompare(b.inicio || "99:99");
      });
  }

  function atividadesDoDia(data) {
    const chave = dataISO(data);

    return atividadesFiltradas().filter(
      atividade => atividade.data === chave
    );
  }

  function atividadesDoPeriodo(inicio, fim) {
    return atividadesFiltradas().filter(atividade => {
      const data = new Date(`${atividade.data}T12:00:00`);

      return estaNoIntervalo(data, inicio, fim);
    });
  }

  function textoHorario(atividade) {
    if (atividade.inicio && atividade.fim) {
      return `${atividade.inicio} – ${atividade.fim}`;
    }

    if (atividade.inicio) return atividade.inicio;

    return "Sem horário definido";
  }

  function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[caractere]);
  }

  function renderizarEvento(atividade, compacto = false) {
    const titulo = escaparHTML(atividade.titulo);
    const tipo = nomesTipos[atividade.tipo]
      ? atividade.tipo
      : "aula";

    const horario = textoHorario(atividade);
    const local = escaparHTML(atividade.local || "");
    const responsavel = escaparHTML(atividade.responsavel || "");

    return `
            <button type="button"
                class="pa-evento ${tipo}"
                data-evento-id="${escaparHTML(atividade.id)}"
                aria-label="${titulo}, ${escaparHTML(horario)}">

                <strong>${titulo}</strong>

                ${compacto ? "" : `
                    <small>${escaparHTML(horario)}</small>
                    ${local ? `<small>${local}</small>` : ""}
                    ${responsavel ? `<small>${responsavel}</small>` : ""}
                `}
            </button>
        `;
  }

  // -------------------------------------------------
  // ATUALIZAÇÃO DO CABEÇALHO E CONTADOR
  // -------------------------------------------------

  function atualizarCabecalho(inicio, fim) {
    let titulo = "";
    let subtitulo = "";

    if (visualizacao === "dia") {
      titulo = formatarData(dataSelecionada, {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      subtitulo = nomeDia(dataSelecionada);
    }

    if (visualizacao === "semana") {
      titulo = `${formatarData(inicio)} – ${formatarData(fim)}`;
      subtitulo = "Visualização semanal";
    }

    if (visualizacao === "mes") {
      titulo = formatarData(dataSelecionada, {
        month: "long",
        year: "numeric"
      });

      subtitulo = "Visualização mensal";
    }

    if (visualizacao === "semestre") {
      const inicioMes = nomesMeses[inicio.getMonth()];
      const fimMes = nomesMeses[fim.getMonth()];

      titulo =
        `${inicioMes} – ${fimMes} de ${inicio.getFullYear()}`;

      subtitulo = "Visualização semestral";
    }

    tituloPeriodo.textContent =
      titulo.charAt(0).toLocaleUpperCase("pt-BR") + titulo.slice(1);

    subtituloPeriodo.textContent = subtitulo;

    const total = atividadesDoPeriodo(inicio, fim).length;

    contador.textContent =
      `${total} ${total === 1 ? "atividade" : "atividades"}`;

    seletorData.value = dataISO(dataSelecionada);

    botoesVisualizacao.forEach(botao => {
      const ativo = botao.dataset.view === visualizacao;

      botao.classList.toggle("ativo", ativo);
      botao.setAttribute("aria-pressed", String(ativo));
    });
  }

  // -------------------------------------------------
  // VISUALIZAÇÃO DIÁRIA
  // -------------------------------------------------

  function renderizarDia() {
    const dia = dataSelecionada;
    const eventos = atividadesDoDia(dia);

    calendario.innerHTML = `
            <div class="pa-dia-unico">
                <div class="pa-dia-lateral">
                    <strong>${dia.getDate()}</strong>
                    <span>${nomesMesesAbreviados[dia.getMonth()]}</span>
                </div>

                <div class="pa-agenda-dia">
                    ${eventos.length
        ? eventos.map(atividade => `
                                <div class="pa-evento-dia">
                                    <span class="pa-hora">
                                        ${escaparHTML(textoHorario(atividade))}
                                    </span>

                                    <div>
                                        ${renderizarEvento(atividade)}
                                    </div>
                                </div>
                            `).join("")
        : `<p class="pa-vazio">
                                Nenhuma atividade para este dia.
                               </p>`
      }
                </div>
            </div>
        `;
  }

  // -------------------------------------------------
  // VISUALIZAÇÃO SEMANAL
  // -------------------------------------------------

  function renderizarSemana(inicio) {
    const dias = Array.from({ length: 7 }, (_, indice) =>
      deslocarData(inicio, indice)
    );

    const cabecalho = `
            <div class="pa-grade-semana">
                ${dias.map(dia => `
                    <div class="pa-dia-cabecalho">
                        <strong>${nomesDiasCurtos[dia.getDay()]}</strong>
                        <span>${formatarData(dia, {
      day: "2-digit",
      month: "2-digit"
    })}</span>
                    </div>
                `).join("")}
            </div>
        `;

    const grade = `
            <div class="pa-grade-mes">
                ${dias.map(dia => {
      const eventos = atividadesDoDia(dia);
      const hojeAtivo = mesmoDia(dia, hoje);

      return `
                        <div class="pa-celula-mes ${hojeAtivo ? "hoje" : ""}">
                            <button type="button"
                                class="pa-numero-dia"
                                data-selecionar-dia="${dataISO(dia)}"
                                aria-label="Abrir dia ${formatarData(dia)}">
                                ${dia.getDate()}
                            </button>

                            ${eventos.length
          ? eventos.map(evento =>
            renderizarEvento(evento)
          ).join("")
          : `<span class="pa-vazio">—</span>`
        }
                        </div>
                    `;
    }).join("")}
            </div>
        `;

    calendario.innerHTML = cabecalho + grade;
  }

  // -------------------------------------------------
  // VISUALIZAÇÃO MENSAL
  // -------------------------------------------------

  function renderizarMes() {
    const primeiro = primeiroDiaMes(dataSelecionada);
    const ultimo = ultimoDiaMes(dataSelecionada);
    const inicioGrade = primeiroDiaSemana(primeiro);

    // Sempre 6 linhas para manter o calendário alinhado.
    const dias = Array.from({ length: 42 }, (_, indice) =>
      deslocarData(inicioGrade, indice)
    );

    const cabecalho = `
            <div class="pa-grade-semana">
                ${["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
        .map(dia => `
                        <div class="pa-dia-cabecalho">
                            <strong>${dia}</strong>
                        </div>
                    `).join("")}
            </div>
        `;

    const grade = `
            <div class="pa-grade-mes">
                ${dias.map(dia => {
      const eventos = atividadesDoDia(dia);
      const noMes = dia.getMonth() === dataSelecionada.getMonth();
      const hojeAtivo = mesmoDia(dia, hoje);
      const selecionado = mesmoDia(dia, dataSelecionada);

      return `
                        <div class="pa-celula-mes
                            ${noMes ? "" : "fora-mes"}
                            ${hojeAtivo ? "hoje" : ""}">

                            <button type="button"
                                class="pa-numero-dia"
                                data-selecionar-dia="${dataISO(dia)}"
                                aria-label="Selecionar ${formatarData(dia)}"
                                ${selecionado ? 'aria-current="date"' : ""}>
                                ${dia.getDate()}
                            </button>

                            ${eventos.slice(0, 2).map(evento =>
        renderizarEvento(evento, true)
      ).join("")}

                            ${eventos.length > 2 ? `
                                <button type="button"
                                    class="pa-mais-eventos"
                                    data-selecionar-dia="${dataISO(dia)}">
                                    +${eventos.length - 2} mais
                                </button>
                            ` : ""}
                        </div>
                    `;
    }).join("")}
            </div>
        `;

    calendario.innerHTML = cabecalho + grade;
  }

  // -------------------------------------------------
  // VISUALIZAÇÃO SEMESTRAL
  // -------------------------------------------------

  function renderizarSemestre(inicio) {
    const meses = Array.from({ length: 6 }, (_, indice) =>
      new Date(inicio.getFullYear(), inicio.getMonth() + indice, 1)
    );

    calendario.innerHTML = `
            <div class="pa-grade-semestre">
                ${meses.map(mes => {
      const primeiro = primeiroDiaMes(mes);
      const inicioGrade = primeiroDiaSemana(primeiro);
      const diasNoMes = ultimoDiaMes(mes).getDate();

      // Inclui as semanas necessárias para o mês.
      const quantidadeDias = Math.ceil(
        (primeiro.getDay() + diasNoMes +
          (primeiro.getDay() === 0 ? 6 : -1)) / 7
      ) * 7;

      const dias = Array.from(
        { length: quantidadeDias },
        (_, indice) => deslocarData(inicioGrade, indice)
      );

      return `
                        <section class="pa-mes-semestre">
                            <div class="pa-mes-titulo">
                                ${nomesMeses[mes.getMonth()]}
                                ${mes.getFullYear()}
                            </div>

                            <div class="pa-mini-grade">
                                ${["S", "T", "Q", "Q", "S", "S", "D"]
          .map(dia => `
                                        <span class="pa-mini-dia"
                                            aria-hidden="true">${dia}</span>
                                    `).join("")}

                                ${dias.map(dia => {
            const noMes =
              dia.getMonth() === mes.getMonth();

            if (!noMes) {
              return `<span></span>`;
            }

            const temAtividade =
              atividadesDoDia(dia).length > 0;

            const selecionado =
              mesmoDia(dia, dataSelecionada);

            return `
                                        <button type="button"
                                            class="pa-mini-dia
                                                ${temAtividade ? "tem-atividade" : ""}
                                                ${selecionado ? "selecionado" : ""}"
                                            data-selecionar-dia="${dataISO(dia)}"
                                            aria-label="${formatarData(dia)}">
                                            ${dia.getDate()}
                                        </button>
                                    `;
          }).join("")}
                            </div>
                        </section>
                    `;
    }).join("")}
            </div>
        `;
  }

  // -------------------------------------------------
  // RENDERIZAÇÃO GERAL
  // -------------------------------------------------

  function renderizarCalendario() {
    dataSelecionada = inicioDoDia(dataSelecionada);

    let inicio;
    let fim;

    if (visualizacao === "dia") {
      inicio = dataSelecionada;
      fim = dataSelecionada;
    } else if (visualizacao === "semana") {
      inicio = primeiroDiaSemana(dataSelecionada);
      fim = deslocarData(inicio, 6);
    } else if (visualizacao === "mes") {
      inicio = primeiroDiaMes(dataSelecionada);
      fim = ultimoDiaMes(dataSelecionada);
    } else {
      inicio = inicioSemestre(dataSelecionada);
      fim = fimSemestre(dataSelecionada);
    }

    atualizarCabecalho(inicio, fim);

    if (visualizacao === "dia") {
      renderizarDia();
    } else if (visualizacao === "semana") {
      renderizarSemana(inicio);
    } else if (visualizacao === "mes") {
      renderizarMes();
    } else {
      renderizarSemestre(inicio);
    }

    anuncio.textContent =
      `${subtituloPeriodo.textContent}: ${tituloPeriodo.textContent}`;
  }

  // -------------------------------------------------
  // TROCA DE VISUALIZAÇÃO
  // -------------------------------------------------

  botoesVisualizacao.forEach(botao => {
    botao.addEventListener("click", () => {
      visualizacao = botao.dataset.view;
      renderizarCalendario();
    });
  });

  // -------------------------------------------------
  // NAVEGAÇÃO ANTERIOR E PRÓXIMO
  // -------------------------------------------------

  document.getElementById("paAnterior").addEventListener("click", () => {
    if (visualizacao === "dia") {
      dataSelecionada = deslocarData(dataSelecionada, -1);
    } else if (visualizacao === "semana") {
      dataSelecionada = deslocarData(dataSelecionada, -7);
    } else if (visualizacao === "mes") {
      dataSelecionada = adicionarMeses(dataSelecionada, -1);
    } else {
      dataSelecionada = adicionarMeses(dataSelecionada, -6);
    }

    renderizarCalendario();
  });

  document.getElementById("paProximo").addEventListener("click", () => {
    if (visualizacao === "dia") {
      dataSelecionada = deslocarData(dataSelecionada, 1);
    } else if (visualizacao === "semana") {
      dataSelecionada = deslocarData(dataSelecionada, 7);
    } else if (visualizacao === "mes") {
      dataSelecionada = adicionarMeses(dataSelecionada, 1);
    } else {
      dataSelecionada = adicionarMeses(dataSelecionada, 6);
    }

    renderizarCalendario();
  });

  // -------------------------------------------------
  // BOTÃO HOJE E SELETOR DE DATA
  // -------------------------------------------------

  document.getElementById("paHoje").addEventListener("click", () => {
    dataSelecionada = inicioDoDia(new Date());
    renderizarCalendario();
  });

  seletorData.addEventListener("change", () => {
    if (!seletorData.value) return;

    const [ano, mes, dia] = seletorData.value.split("-").map(Number);

    dataSelecionada = new Date(ano, mes - 1, dia);
    renderizarCalendario();
  });

  // -------------------------------------------------
  // FILTRO DE ATIVIDADES
  // -------------------------------------------------

  filtroTipo.addEventListener("change", renderizarCalendario);

  // -------------------------------------------------
  // SELEÇÃO DE UM DIA NO CALENDÁRIO
  // -------------------------------------------------

  calendario.addEventListener("click", evento => {
    const botaoDia = evento.target.closest("[data-selecionar-dia]");

    if (botaoDia) {
      const [ano, mes, dia] =
        botaoDia.dataset.selecionarDia.split("-").map(Number);

      dataSelecionada = new Date(ano, mes - 1, dia);

      // No semestre, mantém a visualização semestral.
      // Nas demais visualizações, abre o dia selecionado.
      if (visualizacao !== "semestre") {
        visualizacao = "dia";
      }

      renderizarCalendario();
      return;
    }

    const botaoEvento = evento.target.closest("[data-evento-id]");

    if (botaoEvento) {
      const atividade = atividades.find(
        item => String(item.id) === botaoEvento.dataset.eventoId
      );

      if (atividade) {
        anuncio.textContent =
          `${atividade.titulo}. ` +
          `${textoHorario(atividade)}. ` +
          `${atividade.local || ""}. ` +
          `${atividade.responsavel || ""}`;
      }
    }
  });

  // Inicializa a página.
  renderizarCalendario();
});
