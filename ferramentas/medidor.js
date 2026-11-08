#!/usr/bin/env node
// O medidor: roda as tabelas e cospe os numeros que vao para o README.
//
// Nenhum numero do README e digitado a mao. Quem quiser conferir roda
// `npm run medir` e compara linha a linha.
//
//   node ferramentas/medidor.js            todas as tabelas
//   node ferramentas/medidor.js censo      so uma

import {
  CAIXAS_CENSO, CAIXAS_PROPAGACAO, CAIXAS_JUIZ,
  linhaCenso, linhaPropagacao, linhaJuiz, linhaDistribuicao, linhaCatalogo,
  exemploSemPropagacao,
} from '../js/medidas.js';

const n = (x) => x.toLocaleString('pt-BR');
const pc = (x) => (x * 100).toFixed(2).replace('.', ',') + '%';

function titulo(t) {
  console.log('');
  console.log(t);
  console.log('-'.repeat(t.length));
}

function censo() {
  titulo('Censo: todas as imagens de cada caixa, agrupadas pelas dicas');
  console.log('caixa  imagens          dicas distintas  so uma imagem    fracao   maior ambiguidade');
  for (const [w, h] of CAIXAS_CENSO) {
    const r = linhaCenso(w, h);
    console.log(
      r.caixa.padEnd(7)
      + n(r.imagens).padStart(15) + '  '
      + n(r.puzzles).padStart(15) + '  '
      + n(r.unicos).padStart(15) + '  '
      + pc(r.fracaoUnicos).padStart(7) + '  '
      + n(r.maiorAmbiguidade).padStart(17),
    );
  }
}

function propagacao() {
  titulo('Propagacao por linha: dos puzzles de solucao unica, quantos ela resolve');
  console.log('caixa  solucao unica    resolvidos       sobram         fracao   casas em aberto');
  for (const [w, h] of CAIXAS_PROPAGACAO) {
    const r = linhaPropagacao(w, h);
    console.log(
      r.caixa.padEnd(7)
      + n(r.unicos).padStart(15) + '  '
      + n(r.resolvidos).padStart(15) + '  '
      + n(r.sobram).padStart(13) + '  '
      + pc(r.fracaoSobram).padStart(7) + '  '
      + n(r.aberturaMaxima).padStart(15),
    );
  }
}

function juiz() {
  titulo('Conferencia: a varredura contra o censo por forca bruta');
  console.log('caixa  dicas distintas  so uma imagem    bate');
  for (const [w, h] of CAIXAS_JUIZ) {
    const r = linhaJuiz(w, h);
    console.log(
      r.caixa.padEnd(7)
      + n(r.puzzles).padStart(15) + '  '
      + n(r.unicos).padStart(15) + '  '
      + (r.bate ? 'sim' : 'NAO'),
    );
  }
}

function ambiguidade() {
  titulo('Ambiguidade: quantos conjuntos de dicas tem exatamente k imagens');
  console.log('caixa  k=1              k=2        k=3      k=4      k=5     k=6     k=7    k=8   k>8');
  for (const [w, h] of [[4, 4], [5, 4], [5, 5]]) {
    const r = linhaDistribuicao(w, h);
    const larg = [16, 10, 8, 8, 7, 7, 6, 5, 5];
    console.log(r.caixa.padEnd(7) + r.faixas.map((v, i) => n(v).padStart(larg[i])).join(' '));
  }
}

function dicas() {
  titulo('Quantas dicas distintas cabem numa linha');
  console.log('largura  dicas possiveis');
  for (let w = 1; w <= 10; w++) {
    const r = linhaCatalogo(w);
    console.log(String(r.largura).padEnd(9) + n(r.dicas).padStart(15));
  }
}

function exemplo() {
  titulo('O puzzle de solucao unica que a propagacao nao comeca');
  for (const [w, h] of [[4, 4], [5, 5]]) {
    const e = exemploSemPropagacao(w, h);
    if (!e) { console.log(w + 'x' + h + ': nenhum'); continue; }
    console.log(w + 'x' + h + '  linhas  ' + JSON.stringify(e.linhas));
    console.log('      colunas ' + JSON.stringify(e.colunas));
  }
}

const tabelas = { censo, propagacao, juiz, ambiguidade, dicas, exemplo };
const pedido = process.argv[2];
if (pedido) {
  if (!tabelas[pedido]) {
    console.error('tabela desconhecida: ' + pedido);
    console.error('as que existem: ' + Object.keys(tabelas).join(', '));
    process.exit(1);
  }
  tabelas[pedido]();
} else {
  for (const t of Object.values(tabelas)) t();
}
console.log('');
