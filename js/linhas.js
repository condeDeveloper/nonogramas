// A propagacao por linha: o jeito que uma pessoa resolve nonograma.
//
// Olha uma linha de cada vez, pergunta quais padroes ainda cabem nela, e marca
// so as casas em que TODOS concordam. Nunca chuta. Quando nenhuma linha e
// nenhuma coluna tem mais nada a dizer, ela para — e o que sobra indeterminado
// e exatamente o que so o chute resolve.

/** Os padroes compativeis com o que ja se sabe da linha. */
function compativeis(padroes, cheias, vazias) {
  const saida = [];
  for (const p of padroes) {
    if ((p & vazias) !== 0) continue;
    if ((~p & cheias) !== 0) continue;
    saida.push(p);
  }
  return saida;
}

/**
 * Resolve so com propagacao, sem chute nenhum.
 *
 * Devolve `{ resolvido, contraditorio, cheias, vazias, rodadas }`. `resolvido`
 * e true quando toda casa ficou decidida; false nao quer dizer que o puzzle
 * tem mais de uma solucao, quer dizer que a propagacao sozinha nao chegou la.
 * A diferenca entre esses dois numeros e a medida que este projeto persegue.
 */
export function resolverPorPropagacao(dicasLinhas, dicasColunas, catLinha, catColuna) {
  const altura = dicasLinhas.length;
  const largura = dicasColunas.length;
  const mascaraL = (1 << largura) - 1;
  const mascaraC = (1 << altura) - 1;

  const cheias = new Int32Array(altura);
  const vazias = new Int32Array(altura);
  let rodadas = 0;

  for (;;) {
    rodadas++;
    let mudou = false;

    for (let i = 0; i < altura; i++) {
      const cabem = compativeis(catLinha.padroes[dicasLinhas[i]], cheias[i], vazias[i]);
      if (cabem.length === 0) return { resolvido: false, contraditorio: true, rodadas };
      let todos = mascaraL;
      let algum = 0;
      for (const p of cabem) { todos &= p; algum |= p; }
      const novasCheias = cheias[i] | todos;
      const novasVazias = vazias[i] | (~algum & mascaraL);
      if (novasCheias !== cheias[i] || novasVazias !== vazias[i]) mudou = true;
      cheias[i] = novasCheias;
      vazias[i] = novasVazias;
    }

    for (let j = 0; j < largura; j++) {
      let colCheias = 0;
      let colVazias = 0;
      for (let i = 0; i < altura; i++) {
        if ((cheias[i] >> j) & 1) colCheias |= 1 << i;
        if ((vazias[i] >> j) & 1) colVazias |= 1 << i;
      }
      const cabem = compativeis(catColuna.padroes[dicasColunas[j]], colCheias, colVazias);
      if (cabem.length === 0) return { resolvido: false, contraditorio: true, rodadas };
      let todos = mascaraC;
      let algum = 0;
      for (const p of cabem) { todos &= p; algum |= p; }
      const novasCheias = colCheias | todos;
      const novasVazias = colVazias | (~algum & mascaraC);
      for (let i = 0; i < altura; i++) {
        if ((novasCheias >> i) & 1 && !((cheias[i] >> j) & 1)) { cheias[i] |= 1 << j; mudou = true; }
        if ((novasVazias >> i) & 1 && !((vazias[i] >> j) & 1)) { vazias[i] |= 1 << j; mudou = true; }
      }
    }

    if (!mudou) break;
  }

  let resolvido = true;
  for (let i = 0; i < altura; i++) if ((cheias[i] | vazias[i]) !== mascaraL) resolvido = false;
  return { resolvido, contraditorio: false, cheias, vazias, rodadas };
}

/**
 * Quantas casas a propagacao deixou em aberto. Zero quer dizer resolvido.
 */
export function casasEmAberto(saida, largura, altura) {
  if (saida.contraditorio) return largura * altura;
  const mascara = (1 << largura) - 1;
  let n = 0;
  for (let i = 0; i < altura; i++) {
    const abertas = ~(saida.cheias[i] | saida.vazias[i]) & mascara;
    for (let j = 0; j < largura; j++) if ((abertas >> j) & 1) n++;
  }
  return n;
}
