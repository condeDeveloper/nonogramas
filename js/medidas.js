// As tabelas do README, uma funcao por linha.
//
// Uma funcao que monta a tabela inteira antes de devolver nao imprime nada
// enquanto roda, e uma varredura de um bilhao de imagens parece travada. Por
// isso cada linha sai sozinha, e o medidor imprime conforme chegam.

import { censo, censoComPropagacao, distribuicao, primeiroSemPropagacao } from './varredura.js';
import { censoPorForcaBruta } from './juiz.js';
import { catalogo } from './dicas.js';

export const CAIXAS_CENSO = [[3, 3], [4, 3], [4, 4], [5, 4], [4, 5], [5, 5], [6, 5]];
export const CAIXAS_PROPAGACAO = [[3, 3], [4, 3], [4, 4], [5, 4], [5, 5]];
export const CAIXAS_JUIZ = [[2, 2], [3, 2], [3, 3], [4, 3], [4, 4]];

/** Uma linha do censo: quantas imagens, quantos puzzles, quantos unicos. */
export function linhaCenso(largura, altura) {
  const r = censo(largura, altura);
  return {
    caixa: largura + 'x' + altura,
    imagens: r.imagens,
    puzzles: r.puzzles,
    unicos: r.unicos,
    fracaoUnicos: r.unicos / r.imagens,
    maiorAmbiguidade: r.maiorAmbiguidade,
  };
}

/** Uma linha da propagacao: dos puzzles de solucao unica, quantos ela resolve. */
export function linhaPropagacao(largura, altura) {
  const r = censoComPropagacao(largura, altura);
  return {
    caixa: largura + 'x' + altura,
    unicos: r.unicos,
    resolvidos: r.resolvidosPorPropagacao,
    sobram: r.unicos - r.resolvidosPorPropagacao,
    fracaoSobram: (r.unicos - r.resolvidosPorPropagacao) / r.unicos,
    aberturaMaxima: r.aberturaMaxima,
  };
}

/** Uma linha da conferencia: a varredura contra o censo por forca bruta. */
export function linhaJuiz(largura, altura) {
  const rapido = censo(largura, altura);
  const bruto = censoPorForcaBruta(largura, altura);
  const bate = rapido.imagens === bruto.imagens
    && rapido.puzzles === bruto.puzzles
    && rapido.unicos === bruto.unicos
    && rapido.maiorAmbiguidade === bruto.maiorAmbiguidade;
  return { caixa: largura + 'x' + altura, puzzles: rapido.puzzles, unicos: rapido.unicos, bate };
}

/** A distribuicao de ambiguidade de uma caixa, ate `limite` e o resto. */
export function linhaDistribuicao(largura, altura, limite = 8) {
  const faixas = distribuicao(largura, altura, limite);
  return { caixa: largura + 'x' + altura, faixas, soma: faixas.reduce((a, b) => a + b, 0) };
}

/** Quantas dicas distintas cabem numa linha de cada largura. */
export function linhaCatalogo(largura) {
  return { largura, dicas: catalogo(largura).lista.length };
}

/** O puzzle de solucao unica em que a propagacao nao decide nenhuma casa. */
export function exemploSemPropagacao(largura, altura) {
  return primeiroSemPropagacao(largura, altura);
}
