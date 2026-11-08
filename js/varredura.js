// A varredura: todas as imagens de uma caixa, agrupadas pelas dicas que elas
// produzem.
//
// A conta ingenua guarda as dicas de cada imagem num mapa de texto. Em 5x5 sao
// 33.554.432 imagens, e o mapa nao cabe. O jeito que cabe e inverter a ordem:
// percorrer os conjuntos de dicas DE LINHA por fora, e so dentro de cada um
// agrupar pelas dicas de coluna. Ai o contador e um vetor de 2^20 posicoes que
// se reaproveita, e a memoria para de crescer com o tamanho da caixa.

import { catalogo } from './dicas.js';
import { resolverPorPropagacao } from './linhas.js';

function bitsPara(n) {
  let b = 0;
  while ((1 << b) < n) b++;
  return b;
}

/**
 * Prepara as tabelas da varredura de uma caixa `largura` x `altura`:
 * os dois catalogos, quantos bits cada dica de coluna ocupa, e a tabela que
 * espalha um padrao de linha pelos bits de coluna.
 */
export function preparar(largura, altura) {
  const catLinha = catalogo(largura);
  const catColuna = catalogo(altura);
  const bitsColuna = bitsPara(catColuna.lista.length);
  const bitsChave = largura * bitsColuna;
  if (bitsChave > 24) {
    throw new Error('chave de ' + bitsChave + ' bits nao cabe: caixa grande demais para a varredura');
  }
  // espalha[i][p]: o padrao p na linha i, ja arrumado em grupos de `altura`
  // bits, um grupo por coluna. O OR dos espalhados das linhas da as colunas.
  const espalha = [];
  for (let i = 0; i < altura; i++) {
    const t = new Int32Array(1 << largura);
    for (let p = 0; p < (1 << largura); p++) {
      let v = 0;
      for (let j = 0; j < largura; j++) if ((p >> j) & 1) v |= 1 << (j * altura + i);
      t[p] = v;
    }
    espalha.push(t);
  }
  return { catLinha, catColuna, bitsColuna, bitsChave, espalha, largura, altura };
}

/**
 * O censo da caixa: quantas imagens, quantos conjuntos de dicas distintos,
 * quantos desses determinam a imagem sozinhos, e qual a maior ambiguidade.
 *
 * `aoPuzzle(quantas, dicasLinhas, dicasColunas, prep)` e chamado uma vez por
 * conjunto de dicas distinto, se for passado.
 */
export function censo(largura, altura, aoPuzzle = null) {
  const prep = preparar(largura, altura);
  const { catLinha, catColuna, bitsColuna, bitsChave, espalha } = prep;
  const mascaraColuna = (1 << altura) - 1;

  const contagem = new Int32Array(1 << bitsChave);
  const marca = new Int32Array(1 << bitsChave);
  const tocadas = new Int32Array(1 << bitsChave);
  let geracao = 0;

  let imagens = 0;
  let puzzles = 0;
  let unicos = 0;
  let maiorAmbiguidade = 0;

  const dicasLinhas = new Int32Array(altura);
  const padroes = new Int32Array(altura);

  // Para cada conjunto de dicas de linha, varre o produto dos padroes que as
  // produzem e agrupa pelas dicas de coluna.
  const porDicas = (nivel, pacote) => {
    if (nivel === altura) {
      let k = 0;
      for (let j = 0; j < largura; j++) {
        const coluna = (pacote >> (j * altura)) & mascaraColuna;
        k |= catColuna.tabela[coluna] << (j * bitsColuna);
      }
      imagens++;
      if (marca[k] !== geracao) {
        marca[k] = geracao;
        contagem[k] = 0;
        tocadas[puzzlesNestaGeracao++] = k;
      }
      contagem[k]++;
      return;
    }
    for (const p of catLinha.padroes[dicasLinhas[nivel]]) {
      padroes[nivel] = p;
      porDicas(nivel + 1, pacote | espalha[nivel][p]);
    }
  };

  let puzzlesNestaGeracao = 0;

  const porClasses = (nivel) => {
    if (nivel === altura) {
      geracao++;
      puzzlesNestaGeracao = 0;
      porDicas(0, 0);
      puzzles += puzzlesNestaGeracao;
      for (let t = 0; t < puzzlesNestaGeracao; t++) {
        const k = tocadas[t];
        if (contagem[k] === 1) unicos++;
        if (contagem[k] > maiorAmbiguidade) maiorAmbiguidade = contagem[k];
        if (aoPuzzle) {
          const colunas = [];
          for (let j = 0; j < largura; j++) {
            colunas.push((k >> (j * bitsColuna)) & ((1 << bitsColuna) - 1));
          }
          aoPuzzle(contagem[k], Array.from(dicasLinhas), colunas, prep);
        }
      }
      return;
    }
    for (let d = 0; d < catLinha.lista.length; d++) {
      dicasLinhas[nivel] = d;
      porClasses(nivel + 1);
    }
  };

  porClasses(0);
  return { largura, altura, imagens, puzzles, unicos, maiorAmbiguidade };
}

/**
 * O mesmo censo, mais a pergunta que interessa: dos puzzles de solucao unica,
 * em quantos a propagacao por linha chega sozinha ao fim?
 *
 * Um puzzle pode ter solucao unica e ainda assim exigir chute. E exatamente a
 * distancia entre esses dois numeros que diz se "nonograma e logica" e verdade.
 */
export function censoComPropagacao(largura, altura) {
  let resolvidos = 0;
  let aberturaMaxima = 0;
  const base = censo(largura, altura, (quantas, linhas, colunas, prep) => {
    if (quantas !== 1) return;
    const saida = resolverPorPropagacao(linhas, colunas, prep.catLinha, prep.catColuna);
    if (saida.resolvido) {
      resolvidos++;
    } else {
      const mascara = (1 << largura) - 1;
      let abertas = 0;
      for (let i = 0; i < altura; i++) {
        const livres = ~(saida.cheias[i] | saida.vazias[i]) & mascara;
        for (let j = 0; j < largura; j++) if ((livres >> j) & 1) abertas++;
      }
      if (abertas > aberturaMaxima) aberturaMaxima = abertas;
    }
  });
  return { ...base, resolvidosPorPropagacao: resolvidos, aberturaMaxima };
}

/**
 * Quantos conjuntos de dicas tem exatamente k imagens, para k ate `limite`.
 * A ultima posicao junta todos os que passam do limite.
 *
 * E a tabela que mostra que a ambiguidade nao e um degrade: ela despenca.
 */
export function distribuicao(largura, altura, limite = 8) {
  const faixas = new Array(limite + 1).fill(0);
  censo(largura, altura, (quantas) => {
    faixas[Math.min(quantas, limite + 1) - 1 >= limite ? limite : quantas - 1]++;
  });
  return faixas;
}

/**
 * O primeiro puzzle de solucao unica em que a propagacao nao decide NENHUMA
 * casa. Existe: a logica linha a linha para antes de comecar, e so o chute (ou
 * a varredura) acha a imagem.
 */
export function primeiroSemPropagacao(largura, altura) {
  let achado = null;
  censo(largura, altura, (quantas, linhas, colunas, prep) => {
    if (achado || quantas !== 1) return;
    const saida = resolverPorPropagacao(linhas, colunas, prep.catLinha, prep.catColuna);
    if (saida.resolvido) return;
    const mascara = (1 << largura) - 1;
    let abertas = 0;
    for (let i = 0; i < altura; i++) {
      const livres = ~(saida.cheias[i] | saida.vazias[i]) & mascara;
      for (let j = 0; j < largura; j++) if ((livres >> j) & 1) abertas++;
    }
    if (abertas !== largura * altura) return;
    achado = {
      linhas: linhas.map((i) => prep.catLinha.lista[i]),
      colunas: colunas.map((i) => prep.catColuna.lista[i]),
    };
  });
  return achado;
}
