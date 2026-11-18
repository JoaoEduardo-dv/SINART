
document.addEventListener("DOMContentLoaded", () => {
    const LINKS = {
        usuarios: "",       // Ex.: "/usuarios/"
        voltar: "",         // Ex.: "/usuarios/"
        cancelar: "",       // Ex.: "/usuarios/"
        salvarUsuario: ""   // URL de cadastro do Django, quando estiver pronta
    };

    const page = document.getElementById("cadastroUsuarioPage");
    if (!page) return;

    const form = document.getElementById("cuForm");
    const inputFoto = document.getElementById("cuFoto");
    const upload = document.getElementById("cuUpload");
    const avatar = document.getElementById("cuAvatarPreview");
    const fotoErro = document.getElementById("cuFotoErro");
    const permissaoToggle = document.getElementById("cuPermissoes");
    const opcoesPermissao = document.getElementById("cuPermissoesOpcoes");
    const mensagem = document.getElementById("cuMensagem");

    let fotoTemporaria = null;

    // Links: preencha LINKS no início deste arquivo.
    page.querySelectorAll("[data-link]").forEach(link => {
        const chave = link.dataset.link;

        if (LINKS[chave]) {
            link.href = LINKS[chave];
        } else {
            link.href = "#";
        }

        link.addEventListener("click", event => {
            if (!LINKS[chave]) {
                event.preventDefault();
                mostrarMensagem("Configure o link de destino no objeto LINKS do JavaScript.");
            }
        });
    });

    function mostrarMensagem(texto, erro = false) {
        mensagem.textContent = texto;
        mensagem.style.color = erro ? "#dc3545" : "";
    }

    function definirErro(campo, texto) {
        const elementoErro = document.getElementById(campo.id + "Erro");

        campo.classList.toggle("is-invalid", Boolean(texto));
        campo.setAttribute("aria-invalid", texto ? "true" : "false");

        if (elementoErro) {
            elementoErro.textContent = texto;
        }
    }

    function limparErros() {
        form.querySelectorAll(".is-invalid").forEach(campo => {
            campo.classList.remove("is-invalid");
            campo.removeAttribute("aria-invalid");
        });

        form.querySelectorAll(".cu-error").forEach(elemento => {
            elemento.textContent = "";
        });
    }

    // Máscara de telefone brasileiro.
    const telefone = document.getElementById("cuTelefone");

    telefone.addEventListener("input", () => {
        let numeros = telefone.value.replace(/\D/g, "").slice(0, 11);

        if (numeros.length > 10) {
            numeros = numeros.replace(
                /^(\d{2})(\d{5})(\d{0,4})$/,
                (_, ddd, parte1, parte2) =>
                    `(${ddd}) ${parte1}${parte2 ? "-" + parte2 : ""}`
            );
        } else if (numeros.length > 6) {
            numeros = numeros.replace(
                /^(\d{2})(\d{4})(\d{0,4})$/,
                (_, ddd, parte1, parte2) =>
                    `(${ddd}) ${parte1}${parte2 ? "-" + parte2 : ""}`
            );
        } else if (numeros.length > 2) {
            numeros = numeros.replace(
                /^(\d{2})(\d+)$/,
                "($1) $2"
            );
        }

        telefone.value = numeros;
    });

    // Máscara de CPF.
    const cpf = document.getElementById("cuCpf");

    cpf.addEventListener("input", () => {
        let numeros = cpf.value.replace(/\D/g, "").slice(0, 11);

        numeros = numeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1-$2");

        cpf.value = numeros;
        definirErro(cpf, "");
    });

    // Verificação matemática de CPF.
    function cpfValido(valor) {
        const numeros = valor.replace(/\D/g, "");

        if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
            return false;
        }

        for (let tamanho = 9; tamanho <= 10; tamanho++) {
            let soma = 0;

            for (let i = 0; i < tamanho; i++) {
                soma += Number(numeros[i]) * (tamanho + 1 - i);
            }

            let digito = (soma * 10) % 11;
            if (digito === 10) digito = 0;

            if (digito !== Number(numeros[tamanho])) {
                return false;
            }
        }

        return true;
    }

    // Data de nascimento não pode ser futura.
    const nascimento = document.getElementById("cuNascimento");
    const hoje = new Date();
    const dataHoje = [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0")
    ].join("-");

    nascimento.max = dataHoje;

    // Foto: validação, visualização e arrastar/soltar.
    function mostrarFoto(arquivo) {
        fotoErro.textContent = "";

        if (!arquivo) return;

        if (!["image/jpeg", "image/png"].includes(arquivo.type)) {
            fotoErro.textContent = "Selecione uma imagem JPG ou PNG.";
            inputFoto.value = "";
            return;
        }

        if (arquivo.size > 2 * 1024 * 1024) {
            fotoErro.textContent = "A imagem deve ter no máximo 2 MB.";
            inputFoto.value = "";
            return;
        }

        if (fotoTemporaria) {
            URL.revokeObjectURL(fotoTemporaria);
        }

        fotoTemporaria = URL.createObjectURL(arquivo);

        avatar.innerHTML = "";

        const img = document.createElement("img");
        img.src = fotoTemporaria;
        img.alt = "Pré-visualização da foto do usuário";

        avatar.appendChild(img);
    }

    inputFoto.addEventListener("change", () => {
        mostrarFoto(inputFoto.files[0]);
    });

    ["dragenter", "dragover"].forEach(tipo => {
        upload.addEventListener(tipo, evento => {
            evento.preventDefault();
            upload.classList.add("is-dragging");
        });
    });

    ["dragleave", "drop"].forEach(tipo => {
        upload.addEventListener(tipo, evento => {
            evento.preventDefault();
            upload.classList.remove("is-dragging");
        });
    });

    upload.addEventListener("drop", evento => {
        const arquivo = evento.dataTransfer.files[0];
        if (!arquivo) return;

        try {
            const transferencia = new DataTransfer();
            transferencia.items.add(arquivo);
            inputFoto.files = transferencia.files;
            mostrarFoto(arquivo);
        } catch {
            mostrarMensagem(
                "Não foi possível anexar o arquivo. Use o seletor de imagem.",
                true
            );
        }
    });

    // Exibir ou ocultar as permissões personalizadas.
    permissaoToggle.addEventListener("change", () => {
        opcoesPermissao.hidden = !permissaoToggle.checked;

        if (!permissaoToggle.checked) {
            opcoesPermissao
                .querySelectorAll('input[type="checkbox"]')
                .forEach(campo => {
                    campo.checked = false;
                });
        }
    });

    // Limpar o erro assim que o usuário corrigir o campo.
    ["cuNome", "cuMatricula", "cuEmail", "cuPerfil"].forEach(id => {
        const campo = document.getElementById(id);

        campo.addEventListener("input", () => definirErro(campo, ""));
        campo.addEventListener("change", () => definirErro(campo, ""));
    });

    // Validação do formulário.
    form.addEventListener("submit", evento => {
        evento.preventDefault();
        limparErros();
        mostrarMensagem("");

        const nome = document.getElementById("cuNome");
        const matricula = document.getElementById("cuMatricula");
        const email = document.getElementById("cuEmail");
        const perfil = document.getElementById("cuPerfil");

        let valido = true;

        if (nome.value.trim().length < 3) {
            definirErro(nome, "Informe o nome completo do usuário.");
            valido = false;
        }

        if (!matricula.value.trim()) {
            definirErro(matricula, "Informe a matrícula.");
            valido = false;
        }

        if (!email.validity.valid || !email.value.trim()) {
            definirErro(email, "Informe um e-mail válido.");
            valido = false;
        }

        if (!perfil.value) {
            definirErro(perfil, "Selecione o perfil de acesso.");
            valido = false;
        }

        if (nascimento.value && nascimento.value > dataHoje) {
            mostrarMensagem(
                "A data de nascimento não pode ser futura.",
                true
            );
            nascimento.focus();
            valido = false;
        }

        if (cpf.value.trim() && !cpfValido(cpf.value)) {
            definirErro(cpf, "Confira o CPF informado.");
            valido = false;
        }

        if (!valido) {
            const primeiroErro = form.querySelector(".is-invalid");

            if (primeiroErro) {
                primeiroErro.focus();
            }

            mostrarMensagem(
                "Confira os campos destacados antes de continuar.",
                true
            );

            return;
        }

        /*
         * Quando a view Django estiver pronta, configure LINKS.salvarUsuario
         * e implemente o envio dos dados com CSRF e FormData no back-end.
         * Até lá, esta tela funciona como protótipo validado.
         */
        if (LINKS.salvarUsuario) {
            mostrarMensagem(
                "A URL está configurada, mas o envio precisa ser conectado à view Django.",
                true
            );
            return;
        }

        mostrarMensagem(
            "Validação concluída! Para salvar o usuário permanentemente, conecte o formulário à view Django."
        );
    });
});
