// Abrir e fechar barra lateral ----------------------------------



const menu = document.querySelector(".menu");
const lateralAberta = document.querySelector(".lateralAberta");
const lateralFechada = document.querySelector(".lateralFechada");
const header = document.querySelector("header");
const iconesLaterais = document.querySelectorAll(".iconesLaterais");

menu.addEventListener("click", function () {
    lateralAberta.classList.toggle("oculta");
    lateralFechada.classList.toggle("oculta");

    if (lateralFechada.classList.contains("oculta")) {
        // Lateral aberta
        header.style.width = "270px";

        iconesLaterais.forEach(function(icone) {
            icone.style.marginLeft = "0";
        });

    } else {
        // Lateral fechada
        header.style.width = "70px";

        iconesLaterais.forEach(function(icone) {
            icone.style.marginLeft = "10px";
        });
    }
});



//Abrir e fechar o menu de informações do barra de navegação---------



const perfil = document.querySelector(".Perfil");
const letreroPerfil = document.querySelector(".letreroPerfil");
const informacoesPerfil = document.querySelector(".informacoesPerfil");

perfil.addEventListener("mouseenter", function () {
    if (informacoesPerfil.classList.contains("mostrar")) {
        return;
    }

    letreroPerfil.classList.add("mostrar");
});

perfil.addEventListener("mouseleave", function () {
    letreroPerfil.classList.remove("mostrar");
});

perfil.addEventListener("click", function () {
    letreroPerfil.classList.remove("mostrar");

    informacoesPerfil.classList.toggle("mostrar");
});



//Mostrar o letrero abaixo dos ícones da barra de navegação----------



const Menu = document.querySelector(".menu");
const letreroMenu = document.querySelector(".letreroMenu");

const sinoNotificacoes = document.querySelector(".sinoNotificacoes");
const letreroSino = document.querySelector(".letreroSino");

// Menu
Menu.addEventListener("mouseenter", function () {
    letreroMenu.classList.add("mostrar");
});

Menu.addEventListener("mouseleave", function () {
    letreroMenu.classList.remove("mostrar");
});

// Sino de notificações
sinoNotificacoes.addEventListener("mouseenter", function () {
    letreroSino.classList.add("mostrar");
});

sinoNotificacoes.addEventListener("mouseleave", function () {
    letreroSino.classList.remove("mostrar");
});



//Manter a cor da barra lateral------------------



document.addEventListener("DOMContentLoaded", function () {

    const lista1 = document.querySelectorAll(".lista1");
    const lista2 = document.querySelectorAll(".lista2");
    const lista3 = document.querySelectorAll(".lista3");

    const paginaAtual = window.location.pathname;

    function ativarBotoes(botoes) {
        botoes.forEach(function (botao) {
            botao.style.backgroundColor = "rgb(255, 0, 0)";
            botao.style.color = "rgb(255, 255, 255)";
        });
    }

    if (paginaAtual.includes("/inicio/")) {
        ativarBotoes(lista1);
    }

    if (paginaAtual.includes("/reservas/")) {
        ativarBotoes(lista2);
    }

    if (paginaAtual.includes("/emprestimos/")) {
        ativarBotoes(lista3);
    }

});