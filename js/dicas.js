// As dicas de uma linha: os tamanhos dos blocos cheios, na ordem.
//
// Uma linha de largura w e um numero de w bits. O bit j e a coluna j, contada
// da esquerda. Esta e a unica convencao do projeto inteiro, e toda a conversao
// entre imagem e dica passa por aqui.

/** As dicas da linha `bits`, lidas bit a bit. */
export function dicasDaLinha(bits, largura) {
  const saida = [];
  let corrente = 0;
  for (let j = 0; j < largura; j++) {
    if ((bits >> j) & 1) {
      corrente++;
    } else if (corrente > 0) {
      saida.push(corrente);
      corrente = 0;
    }
  }
  if (corrente > 0) saida.push(corrente);
  return saida;
}

/** A chave de texto de uma lista de dicas, para usar em mapa. */
export function chave(dicas) {
  return dicas.join(',');
}

/**
 * Todas as dicas possiveis numa linha de largura `largura`, em ordem
 * crescente de soma e depois lexicografica. Uma dica so entra na lista se
 * alguma linha a produz, entao o catalogo nunca tem dica impossivel.
 */
export function todasAsDicas(largura) {
  const vistas = new Map();
  for (let bits = 0; bits < (1 << largura); bits++) {
    const d = dicasDaLinha(bits, largura);
    const k = chave(d);
    if (!vistas.has(k)) vistas.set(k, d);
  }
  const lista = [...vistas.values()];
  lista.sort((a, b) => {
    const sa = a.reduce((x, y) => x + y, 0);
    const sb = b.reduce((x, y) => x + y, 0);
    if (sa !== sb) return sa - sb;
    if (a.length !== b.length) return a.length - b.length;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  });
  return lista;
}

/**
 * O catalogo de dicas de uma largura: a lista, o mapa de chave para indice, e
 * a tabela que leva cada padrao de bits ao indice da sua dica.
 *
 * E a tabela que faz a varredura caber no tempo: no laco de dentro, descobrir
 * a dica de uma linha vira uma leitura de vetor.
 */
export function catalogo(largura) {
  const lista = todasAsDicas(largura);
  const porChave = new Map(lista.map((d, i) => [chave(d), i]));
  const tabela = new Uint8Array(1 << largura);
  for (let bits = 0; bits < (1 << largura); bits++) {
    tabela[bits] = porChave.get(chave(dicasDaLinha(bits, largura)));
  }
  // Os padroes que produzem cada dica, agrupados. A varredura percorre as
  // dicas por fora e os padroes por dentro.
  const padroes = lista.map(() => []);
  for (let bits = 0; bits < (1 << largura); bits++) padroes[tabela[bits]].push(bits);
  return { lista, porChave, tabela, padroes };
}

/** As dicas de uma imagem inteira: por linha e por coluna. */
export function dicasDaImagem(linhas, largura) {
  const altura = linhas.length;
  const porLinha = linhas.map((bits) => dicasDaLinha(bits, largura));
  const porColuna = [];
  for (let j = 0; j < largura; j++) {
    let coluna = 0;
    for (let i = 0; i < altura; i++) if ((linhas[i] >> j) & 1) coluna |= 1 << i;
    porColuna.push(dicasDaLinha(coluna, altura));
  }
  return { porLinha, porColuna };
}
