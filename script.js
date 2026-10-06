```javascript
// ==========================================
// CONTROLE DE RUAS - ATALAIA FIBRA
// ==========================================


// ------------------------------------------
// VARIÁVEIS
// ------------------------------------------

let marcando = false;
let marcadores = [];


// ------------------------------------------
// CARREGAR DADOS SALVOS
// ------------------------------------------

let registros = JSON.parse(
    localStorage.getItem("atalaiaRegistros")
) || [];


// ------------------------------------------
// CRIAR MAPA
// ------------------------------------------

// Salinópolis - Pará
let mapa = L.map("map").setView(
    [-0.613, -47.356],
    14
);


// Mapa OpenStreetMap
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: '&copy; OpenStreetMap'
    }
).addTo(mapa);


// ------------------------------------------
// MARCAR RUA
// ------------------------------------------

function ativarMarcacao() {

    marcando = true;

    alert(
        "Modo de marcação ativado!\n\n" +
        "Clique no ponto da rua onde você passou."
    );
}


// ------------------------------------------
// CLIQUE NO MAPA
// ------------------------------------------

mapa.on("click", function(evento) {

    if (!marcando) {
        return;
    }

    marcando = false;

    let latitude = evento.latlng.lat;
    let longitude = evento.latlng.lng;

    mostrarFormulario(
        latitude,
        longitude
    );
});


// ------------------------------------------
// FORMULÁRIO
// ------------------------------------------

function mostrarFormulario(latitude, longitude) {

    let popup = L.popup()
        .setLatLng([
            latitude,
            longitude
        ])
        .setContent(`

            <div class="popup-form">

                <h3>📍 Registrar local</h3>

                <input
                    id="nomeRua"
                    type="text"
                    placeholder="Nome da rua"
                >

                <select id="tipoRegistro">

                    <option value="panfletagem">
                        📰 Panfletagem
                    </option>

                    <option value="venda">
                        💰 Venda
                    </option>

                    <option value="ambos">
                        📰💰 Panfletagem + Venda
                    </option>

                </select>

                <input
                    id="quantidade"
                    type="number"
                    min="0"
                    placeholder="Quantidade"
                >

                <textarea
                    id="observacao"
                    placeholder="Observação"
                ></textarea>

                <button
                    onclick="salvarRegistro(
                        ${latitude},
                        ${longitude}
                    )"
                >
                    💾 Salvar registro
                </button>

            </div>
        `)
        .openOn(mapa);
}


// ------------------------------------------
// SALVAR REGISTRO
// ------------------------------------------

function salvarRegistro(latitude, longitude) {

    let rua = document.getElementById(
        "nomeRua"
    ).value;

    let tipo = document.getElementById(
        "tipoRegistro"
    ).value;

    let quantidade = document.getElementById(
        "quantidade"
    ).value;

    let observacao = document.getElementById(
        "observacao"
    ).value;


    if (!rua.trim()) {

        alert(
            "Digite o nome da rua."
        );

        return;
    }


    let novoRegistro = {

        id: Date.now(),

        rua: rua,

        tipo: tipo,

        quantidade: Number(
            quantidade
        ) || 0,

        observacao: observacao,

        latitude: latitude,

        longitude: longitude,

        data: new Date().toLocaleString(
            "pt-BR"
        )

    };


    registros.push(
        novoRegistro
    );


    salvarDados();

    adicionarMarcador(
        novoRegistro
    );

    atualizarTela();

    mapa.closePopup();
}


// ------------------------------------------
// ADICIONAR MARCADOR
// ------------------------------------------

function adicionarMarcador(registro) {

    let icone = "📍";

    if (registro.tipo === "panfletagem") {
        icone = "📰";
    }

    if (registro.tipo === "venda") {
        icone = "💰";
    }

    if (registro.tipo === "ambos") {
        icone = "⭐";
    }


    let marcador = L.marker([
        registro.latitude,
        registro.longitude
    ]).addTo(mapa);


    marcador.bindPopup(`

        <strong>
            ${icone} ${registro.rua}
        </strong>

        <br><br>

        Tipo:
        ${formatarTipo(registro.tipo)}

        <br>

        Quantidade:
        ${registro.quantidade}

        <br>

        ${registro.observacao
            ? "Obs: " + registro.observacao
            : ""
        }

        <br><br>

        ${registro.data}

    `);


    marcadores.push(
        marcador
    );
}


// ------------------------------------------
// FORMATAR TIPO
// ------------------------------------------

function formatarTipo(tipo) {

    if (tipo === "panfletagem") {
        return "Panfletagem";
    }

    if (tipo === "venda") {
        return "Venda";
    }

    return "Panfletagem + Venda";
}


// ------------------------------------------
// ATUALIZAR TELA
// ------------------------------------------

function atualizarTela() {

    let lista =
        document.getElementById(
            "listaRegistros"
        );


    document.getElementById(
        "totalRuas"
    ).innerText = registros.length;


    let panfletagens =
        registros.filter(
            r =>
                r.tipo === "panfletagem" ||
                r.tipo === "ambos"
        ).length;


    let vendas =
        registros.filter(
            r =>
                r.tipo === "venda" ||
                r.tipo === "ambos"
        ).length;


    document.getElementById(
        "totalPanfletagens"
    ).innerText = panfletagens;


    document.getElementById(
        "totalVendas"
    ).innerText = vendas;


    if (registros.length === 0) {

        lista.innerHTML = `
            <p class="vazio">
                Nenhuma rua marcada ainda.
            </p>
        `;

        return;
    }


    lista.innerHTML = "";


    registros
        .slice()
        .reverse()
        .forEach(function(registro) {

            let div =
                document.createElement(
                    "div"
                );

            div.className = "registro";


            div.innerHTML = `

                <h3>
                    📍 ${registro.rua}
                </h3>

                <p>
                    <strong>Tipo:</strong>
                    ${formatarTipo(
                        registro.tipo
                    )}
                </p>

                <p>
                    <strong>Quantidade:</strong>
                    ${registro.quantidade}
                </p>

                <p>
                    <strong>Data:</strong>
                    ${registro.data}
                </p>

                ${
                    registro.observacao
                    ?
                    `<p>
                        <strong>Observação:</strong>
                        ${registro.observacao}
                    </p>`
                    :
                    ""
                }

                <div class="acoes">

                    <button
                        class="btn-pequeno btn-pan"
                        onclick="verNoMapa(
                            ${registro.latitude},
                            ${registro.longitude}
                        )"
                    >
                        🗺️ Ver mapa
                    </button>

                    <button
                        class="btn-pequeno btn-excluir"
                        onclick="excluirRegistro(
                            ${registro.id}
                        )"
                    >
                        🗑️ Excluir
                    </button>

                </div>
            `;


            lista.appendChild(div);

        });
}


// ------------------------------------------
// VER NO MAPA
// ------------------------------------------

function verNoMapa(
    latitude,
    longitude
) {

    mapa.setView(
        [
            latitude,
            longitude
        ],
        17
    );
}


// ------------------------------------------
// EXCLUIR
// ------------------------------------------

function excluirRegistro(id) {

    let confirmar =
        confirm(
            "Deseja realmente excluir este registro?"
        );


    if (!confirmar) {
        return;
    }


    registros =
        registros.filter(
            registro =>
                registro.id !== id
        );


    salvarDados();

    recarregarMarcadores();

    atualizarTela();
}


// ------------------------------------------
// RECARREGAR MARCADORES
// ------------------------------------------

function recarregarMarcadores() {

    marcadores.forEach(
        marcador => mapa.removeLayer(
            marcador
        )
    );


    marcadores = [];


    registros.forEach(
        registro =>
            adicionarMarcador(
                registro
            )
    );
}


// ------------------------------------------
// SALVAR NO NAVEGADOR
// ------------------------------------------

function salvarDados() {

    localStorage.setItem(
        "atalaiaRegistros",
        JSON.stringify(
            registros
        )
    );
}


// ------------------------------------------
// MINHA LOCALIZAÇÃO
// ------------------------------------------

function minhaLocalizacao() {

    if (!navigator.geolocation) {

        alert(
            "Seu navegador não suporta localização."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function(posicao) {

            let latitude =
                posicao.coords.latitude;

            let longitude =
                posicao.coords.longitude;


            mapa.setView(
                [
                    latitude,
                    longitude
                ],
                18
            );


            L.marker([
                latitude,
                longitude
            ])
            .addTo(mapa)
            .bindPopup(
                "📍 Você está aqui!"
            )
            .openPopup();

        },

        function() {

            alert(
                "Não foi possível obter sua localização."
            );

        }

    );
}


// ------------------------------------------
// LIMPAR TUDO
// ------------------------------------------

function limparTudo() {

    if (registros.length === 0) {

        alert(
            "Não existem registros."
        );

        return;
    }


    let confirmar =
        confirm(
            "ATENÇÃO!\n\n" +
            "Isso apagará todas as ruas marcadas.\n\n" +
            "Deseja continuar?"
        );


    if (!confirmar) {
        return;
    }


    registros = [];


    salvarDados();

    recarregarMarcadores();

    atualizarTela();
}


// ------------------------------------------
// EXPORTAR DADOS
// ------------------------------------------

function exportarDados() {

    if (registros.length === 0) {

        alert(
            "Não existem dados para exportar."
        );

        return;
    }


    let texto =
        "ATALAIA FIBRA - CONTROLE DE RUAS\n\n";


    registros.forEach(
        function(registro, index) {

            texto +=
                `${index + 1}. ${registro.rua}\n`;

            texto +=
                `Tipo: ${formatarTipo(
                    registro.tipo
                )}\n`;

            texto +=
                `Quantidade: ${
                    registro.quantidade
                }\n`;

            texto +=
                `Data: ${
                    registro.data
                }\n`;

            texto +=
                `Observação: ${
                    registro.observacao || "-"
                }\n`;

            texto +=
                `Localização: ${
                    registro.latitude
                }, ${
                    registro.longitude
                }\n\n`;

        }
    );


    let arquivo =
        new Blob(
            [texto],
            {
                type: "text/plain"
            }
        );


    let url =
        URL.createObjectURL(
            arquivo
        );


    let link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "atalaia-fibra-registros.txt";


    link.click();


    URL.revokeObjectURL(url);
}


// ------------------------------------------
// INICIAR APLICATIVO
// ------------------------------------------

registros.forEach(
    registro =>
        adicionarMarcador(
            registro
        )
);


atualizarTela();
```
