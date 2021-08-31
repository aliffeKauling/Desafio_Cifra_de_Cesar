const axios = require("axios");
const sha1 = require("js-sha1");
const fs = require("fs");
const FormData = require("form-data");

const caesarShift = require("./caesar");
const token = "9af332240cdc1e3a4777a9cf7c72b6f85a80ace6";
const urlObter = "https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=";

axios.get(urlObter + token).then(response => handleData(response));

function handleData(response) {
    criarArquivo(response.data);
    const textoParaDecifrar = response.data.cifrado;
    const numeroDeCasas = response.data.numero_casas;

    const textoDecifrado = decifrar(textoParaDecifrar, numeroDeCasas);
    const resumo = gerarSha1(textoDecifrado);

    atualizarArquivo(resumo, textoDecifrado);
    enviarArquivo();
}

function decifrar(texto, numeroDeCasas) {
    return caesarShift(texto, numeroDeCasas);
}

function criarArquivo(data) {
    fs.appendFileSync("answer.json", JSON.stringify(data), () => { });
}

function gerarSha1(texto) {
    return sha1(texto);
}

function atualizarArquivo(resumo, textoDecifrado) {
    let conteudoDoArquivo = JSON.parse(fs.readFileSync('answer.json', 'utf8'));

    conteudoDoArquivo.resumo_criptografico = resumo;
    conteudoDoArquivo.decifrado = textoDecifrado;

    fs.writeFileSync('answer.json', JSON.stringify(conteudoDoArquivo));

};

function enviarArquivo() {
    const formulario = new FormData();
    const arquivo = fs.createReadStream("answer.json");

    formulario.append("answer", arquivo, {contentType: "multipart/form-data", filename: "answer", filepath: "answer.json"});

    console.log(formulario);
    const requestConfig = {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formulario
    }

    axios.post("https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=" + token, formulario, requestConfig).then(res => console.log(res)).catch(err => console.log(err));
}