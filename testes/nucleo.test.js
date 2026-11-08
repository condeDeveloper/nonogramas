import test from 'node:test';
import assert from 'node:assert/strict';

import { dicasDaLinha, todasAsDicas, catalogo, dicasDaImagem } from '../js/dicas.js';
import { dicasPorTexto, solucoesPorForcaBruta, quantasDicas } from '../js/juiz.js';
import { resolverPorPropagacao, casasEmAberto } from '../js/linhas.js';

test('o bit 0 e a coluna da esquerda', () => {
  // 0b00001 e a primeira casa cheia, e a dica e [1] de qualquer jeito; o que
  // separa as duas convencoes e uma linha assimetrica.
  assert.deepEqual(dicasDaLinha(0b00011, 5), [2]);
  assert.deepEqual(dicasDaLinha(0b11000, 5), [2]);
  assert.deepEqual(dicasDaLinha(0b10011, 5), [2, 1]);
});

test('a linha vazia nao tem dica nenhuma, nao tem dica zero', () => {
  assert.deepEqual(dicasDaLinha(0, 5), []);
  assert.deepEqual(dicasDaLinha(0b11111, 5), [5]);
});

test('as duas leituras das dicas concordam em toda linha de ate 12 casas', () => {
  for (let w = 1; w <= 12; w++) {
    for (let bits = 0; bits < (1 << w); bits++) {
      assert.deepEqual(dicasDaLinha(bits, w), dicasPorTexto(bits, w), 'w=' + w + ' bits=' + bits);
    }
  }
});

test('quantas dicas cabem numa linha e Fibonacci', () => {
  // F(w+2) com F(1)=F(2)=1. A enumeracao e a forma fechada se conferem ate 14.
  for (let w = 1; w <= 14; w++) {
    assert.equal(quantasDicas(w), todasAsDicas(w).length, 'largura ' + w);
  }
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(quantasDicas), [2, 3, 5, 8, 13, 21]);
});

test('o catalogo leva todo padrao a uma dica, e so uma', () => {
  const c = catalogo(5);
  assert.equal(c.lista.length, 13);
  assert.equal(c.tabela.length, 32);
  // os padroes agrupados somam exatamente as 32 linhas
  assert.equal(c.padroes.reduce((a, p) => a + p.length, 0), 32);
  for (let bits = 0; bits < 32; bits++) {
    assert.ok(c.padroes[c.tabela[bits]].includes(bits));
  }
});

test('as dicas de coluna leem a imagem de cima para baixo', () => {
  // duas linhas: a de cima cheia so na esquerda, a de baixo so na direita
  const { porLinha, porColuna } = dicasDaImagem([0b01, 0b10], 2);
  assert.deepEqual(porLinha, [[1], [1]]);
  assert.deepEqual(porColuna, [[1], [1]]);
});

test('a propagacao resolve o que e obvio e para onde nao e', () => {
  const cat = catalogo(3);
  // linha cheia em todas as linhas e colunas: nao sobra escolha
  const dicas = [cat.porChave.get('3'), cat.porChave.get('3'), cat.porChave.get('3')];
  const saida = resolverPorPropagacao(dicas, dicas, cat, cat);
  assert.equal(saida.resolvido, true);
  assert.equal(casasEmAberto(saida, 3, 3), 0);
});

test('existe puzzle de solucao unica em que a propagacao nao decide nada', () => {
  // achado pela varredura da caixa 4x4 e conferido aqui por forca bruta
  const linhas = [[1], [1], [2], [2]];
  const colunas = [[1, 1], [1], [2], [1]];

  const solucoes = solucoesPorForcaBruta(linhas, colunas, 4, 4);
  assert.equal(solucoes.length, 1, 'o puzzle tem uma solucao so');

  const cat = catalogo(4);
  const idx = (d) => cat.porChave.get(d.join(','));
  const saida = resolverPorPropagacao(linhas.map(idx), colunas.map(idx), cat, cat);
  assert.equal(saida.resolvido, false);
  assert.equal(casasEmAberto(saida, 4, 4), 16, 'a propagacao nao decide nenhuma das 16 casas');
});

test('a forca bruta acha todas as solucoes de um puzzle ambiguo', () => {
  // o menor ambiguo classico: o xadrez 2x2 e o seu negativo tem as mesmas dicas
  const solucoes = solucoesPorForcaBruta([[1], [1]], [[1], [1]], 2, 2);
  assert.equal(solucoes.length, 2);
});

test('a propagacao nunca marca uma casa contra a solucao verdadeira', () => {
  // varre todas as imagens 4x4, resolve por propagacao e confere que tudo que
  // ela afirmou bate com a imagem de onde as dicas sairam
  const cat = catalogo(4);
  const idx = (d) => cat.porChave.get(d.join(','));
  for (let imagem = 0; imagem < (1 << 16); imagem++) {
    const linhas = [];
    for (let i = 0; i < 4; i++) linhas.push((imagem >> (i * 4)) & 0b1111);
    const { porLinha, porColuna } = dicasDaImagem(linhas, 4);
    const saida = resolverPorPropagacao(porLinha.map(idx), porColuna.map(idx), cat, cat);
    assert.equal(saida.contraditorio, false);
    for (let i = 0; i < 4; i++) {
      assert.equal(saida.cheias[i] & ~linhas[i], 0, 'marcou cheia uma casa vazia');
      assert.equal(saida.vazias[i] & linhas[i], 0, 'marcou vazia uma casa cheia');
    }
  }
});
