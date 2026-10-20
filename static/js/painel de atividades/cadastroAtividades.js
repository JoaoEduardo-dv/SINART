
document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("caFormulario");
    const campoData = document.getElementById("caData");
    const horaInicio = document.getElementById("caHoraInicio");
    const horaFim = document.getElementById("caHoraFim");
    const publico = document.getElementById("caPublico");
    const campoPessoas = document.getElementById("caCampoPessoas");
    const pessoas = document.getElementById("caPessoas");
    const mensagem = document.getElementById("caMensagem");

    if (!formulario) return;

    // Define a data de hoje como padrão.
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    campoData.min = `${ano}-${mes}-${dia}`;

    // Exibe mensagens de validação.
    function mostrarMensagem(texto) {
        mensagem.textContent = texto;
        mensagem.hidden = false;
        mensagem.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function limparMensagem() {
        mensagem.textContent = "";
        mensagem.hidden = true;
    }

    // Mostra a seleção de pessoas conforme o público-alvo.
    function atualizarPublico() {
        const selecionarPessoas = publico.value === "especificos";

        campoPessoas.hidden = !selecionarPessoas;
        pessoas.required = selecionarPessoas;

        if (!selecionarPessoas) {
            Array.from(pessoas.options).forEach(function (opcao) {
                opcao.selected = false;
            });
        }

        limparMensagem();
    }

    publico.addEventListener("change", atualizarPublico);

    // O horário final precisa ser posterior ao inicial.
    function validarHorarios() {
        if (horaInicio.value && horaFim.value) {
            horaFim.setCustomValidity(
                horaFim.value <= horaInicio.value
                    ? "O horário final deve ser posterior ao horário inicial."
                    : ""
            );
        } else {
            horaFim.setCustomValidity("");
        }
    }

    horaInicio.addEventListener("change", validarHorarios);
    horaFim.addEventListener("change", validarHorarios);

    formulario.addEventListener("submit", function (evento) {
        limparMensagem();
        validarHorarios();

        if (!formulario.checkValidity()) {
            evento.preventDefault();

            const campoInvalido = formulario.querySelector(":invalid");

            if (campoInvalido) {
                campoInvalido.reportValidity();
                campoInvalido.focus();
            }

            return;
        }

        if (
            publico.value === "especificos" &&
            !Array.from(pessoas.selectedOptions).length
        ) {
            evento.preventDefault();
            mostrarMensagem(
                "Selecione pelo menos uma pessoa para esta atividade."
            );
            pessoas.focus();
        }
    });

    atualizarPublico();
});
