import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CAIXAS_JUIZ, linhaCenso, linhaPropagacao, linhaJuiz, linhaDistribuicao, linhaCatalogo,
  exemploSemPropagacao,
} from '../js/medidas.js';

// Os numeros do README, presos. Se o codigo mudar e um numero mudar, isto
// quebra antes de a tabela mentir.

test('censo das caixas ate 5x5', () => {
  const esperado = {
    '3x3': { imagens: 512, puzzles: 445, unicos: 384, maiorAmbiguidade: 6 },
    '4x3': { imagens: 4096, puzzles: 3588, unicos: 3152, maiorAmbiguidade: 6 },
    '4x4': { imagens: 65536, puzzles: 58196, unicos: 52362, maiorAmbiguidade: 24 },
    '5x4': { imagens: 1048576, puzzles: 915743, unicos: 814632, maiorAmbiguidade: 36 },
    '5x5': { imagens: 33554432, puzzles: 28781820, unicos: 25309575, maiorAmbiguidade: 120 },
  };
  for (const [caixa, alvo] of Object.entries(esperado)) {
    const [w, h] = caixa.split('x').map(Number);
    const r = linhaCenso(w, h);
    assert.equal(r.imagens, alvo.imagens, caixa + ' imagens');
    assert.equal(r.puzzles, alvo.puzzles, caixa + ' puzzles');
    assert.equal(r.unicos, alvo.unicos, caixa + ' unicos');
    assert.equal(r.maiorAmbiguidade, alvo.maiorAmbiguidade, caixa + ' ambiguidade');
  }
});

test('a caixa deitada da os mesmos numeros que a caixa em pe', () => {
  // transpor uma imagem troca linhas por colunas e nao muda nada do censo.
  // e a conferencia mais barata que existe aqui, e ela pegaria na hora um erro
  // de indice entre largura e altura.
  const a = linhaCenso(5, 4);
  const b = linhaCenso(4, 5);
  assert.equal(a.puzzles, b.puzzles);
  assert.equal(a.unicos, b.unicos);
  assert.equal(a.maiorAmbiguidade, b.maiorAmbiguidade);
  assert.equal(a.puzzles, 915743);
});

test('a fracao de imagens que as dicas determinam sozinhas', () => {
  // 25.309.575 / 33.554.432 = 75,43%. A conta esta aqui, nao no README.
  const r = linhaCenso(5, 5);
  assert.equal((r.fracaoUnicos * 100).toFixed(2), '75.43');
  assert.equal((linhaCenso(4, 4).fracaoUnicos * 100).toFixed(2), '79.90');
  assert.equal((linhaCenso(3, 3).fracaoUnicos * 100).toFixed(2), '75.00');
});

test('propagacao por linha nas caixas ate 5x4', () => {
  const esperado = {
    '3x3': { unicos: 384, resolvidos: 384, sobram: 0, aberturaMaxima: 0 },
    '4x3': { unicos: 3152, resolvidos: 3116, sobram: 36, aberturaMaxima: 8 },
    '4x4': { unicos: 52362, resolvidos: 51234, sobram: 1128, aberturaMaxima: 16 },
    '5x4': { unicos: 814632, resolvidos: 801832, sobram: 12800, aberturaMaxima: 20 },
  };
  for (const [caixa, alvo] of Object.entries(esperado)) {
    const [w, h] = caixa.split('x').map(Number);
    const r = linhaPropagacao(w, h);
    assert.equal(r.unicos, alvo.unicos, caixa + ' unicos');
    assert.equal(r.resolvidos, alvo.resolvidos, caixa + ' resolvidos');
    assert.equal(r.sobram, alvo.sobram, caixa + ' sobram');
    assert.equal(r.aberturaMaxima, alvo.aberturaMaxima, caixa + ' abertura');
  }
});

test('na caixa 3x3 a propagacao resolve todo puzzle de solucao unica', () => {
  // o primeiro contraexemplo so aparece na 4x3: e ali que "nonograma e logica"
  // deixa de ser verdade.
  assert.equal(linhaPropagacao(3, 3).sobram, 0);
  assert.ok(linhaPropagacao(4, 3).sobram > 0);
});

test('a varredura bate com o censo por forca bruta', () => {
  for (const [w, h] of CAIXAS_JUIZ) {
    assert.equal(linhaJuiz(w, h).bate, true, w + 'x' + h);
  }
});

test('distribuicao de ambiguidade da 4x4, com o buraco no sete', () => {
  const r = linhaDistribuicao(4, 4);
  assert.deepEqual(r.faixas, [52362, 5050, 422, 209, 20, 112, 0, 4, 17]);
  // a soma fecha com o total de conjuntos de dicas distintos
  assert.equal(r.soma, 58196);
  // nao e degrade: k=6 tem mais que k=5, e k=7 nao acontece nenhuma vez
  assert.ok(r.faixas[5] > r.faixas[4]);
  assert.equal(r.faixas[6], 0);
});

test('distribuicao de ambiguidade da 5x4 e da 5x5', () => {
  const a = linhaDistribuicao(5, 4);
  assert.deepEqual(a.faixas, [814632, 84208, 9610, 4416, 1038, 982, 252, 228, 377]);
  assert.equal(a.soma, 915743);

  const b = linhaDistribuicao(5, 5);
  assert.deepEqual(b.faixas, [25309575, 2803203, 377096, 171381, 48434, 31445, 12418, 10466, 17802]);
  assert.equal(b.soma, 28781820);
});

test('quantas dicas cabem em cada largura', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => linhaCatalogo(w).dicas),
    [2, 3, 5, 8, 13, 21, 34, 55, 89, 144]);
});

test('o exemplo que a propagacao nao comeca', () => {
  assert.deepEqual(exemploSemPropagacao(4, 4), {
    linhas: [[1], [1], [2], [2]],
    colunas: [[1, 1], [1], [2], [1]],
  });
});
