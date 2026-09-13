//Mudar a cor do tipo de atividade do "Próximas atividades"


const tiposAtividade = document.querySelectorAll(".tipoAtividadeInicio > p");

tiposAtividade.forEach(function(tipo) {

    const texto = tipo.textContent.trim();

    if (texto === "Reserva") {
        tipo.style.backgroundColor = "rgba(255, 0, 0, 0.15)";
        tipo.style.color = "red";

    } else if (texto === "Aula") {
        tipo.style.backgroundColor = "rgba(0, 128, 0, 0.15)";
        tipo.style.color = "green";

    } else if (texto === "Empréstimo") {
        tipo.style.backgroundColor = "rgba(0, 0, 255, 0.15)";
        tipo.style.color = "blue";

    } else if (texto === "Reunião") {
        tipo.style.backgroundColor = "rgba(128, 0, 128, 0.15)";
        tipo.style.color = "purple";
    }

});


//Mudar a cor do dia da semana e a data do "Painel Semanal"


const diasPainel = document.querySelectorAll(".dataPainelInicio");

diasPainel.forEach(function(dia) {

    const h4 = dia.querySelector("h4");
    const p = dia.querySelector("p");

    const texto = h4.textContent.trim();

    if (texto === "SEG" || texto === "SEX") {
        h4.style.color = "red";
        p.style.color = "red";

    } else if (texto === "TER") {
        h4.style.color = "blue";
        p.style.color = "blue";

    } else if (texto === "QUA") {
        h4.style.color = "green";
        p.style.color = "green";

    } else if (texto === "QUI") {
        h4.style.color = "purple";
        p.style.color = "purple";
    }

});