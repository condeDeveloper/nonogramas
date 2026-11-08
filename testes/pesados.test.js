import test from 'node:test';
import assert from 'node:assert/strict';

import { linhaCenso, linhaPropagacao, exemploSemPropagacao } from '../js/medidas.js';

// As duas varreduras grandes. Levam perto de um minuto cada e ficam num
// arquivo separado so para a suite rapida continuar rapida — mas rodam no CI
// junto com o resto, porque sao elas que seguram os numeros do titulo.

test('a caixa 6x5 inteira: um bilhao de imagens', { timeout: 600000 }, () => {
  const r = linhaCenso(6, 5);
  assert.equal(r.imagens, 1073741824);
  assert.equal(r.puzzles, 909340930);
  assert.equal(r.unicos, 794378773);
  assert.equal(r.maiorAmbiguidade, 240);
  assert.equal((r.fracaoUnicos * 100).toFixed(2), '73.98');
});

test('propagacao na caixa 5x5 inteira', { timeout: 600000 }, () => {
  const r = linhaPropagacao(5, 5);
  assert.equal(r.unicos, 25309575);
  assert.equal(r.resolvidos, 24976511);
  assert.equal(r.sobram, 333064);
  assert.equal((r.fracaoSobram * 100).toFixed(2), '1.32');
  // existe puzzle 5x5 de solucao unica em que a propagacao nao decide
  // nenhuma das 25 casas
  assert.equal(r.aberturaMaxima, 25);
});

test('o exemplo 5x5 que a propagacao nao comeca', { timeout: 600000 }, () => {
  assert.deepEqual(exemploSemPropagacao(5, 5), {
    linhas: [[1], [1], [2], [2], [2]],
    colunas: [[2], [1], [1], [1, 1], [1, 1]],
  });
});
