// O juiz: segunda implementacao, sem uma linha em comum com a primeira.
//
// `dicas.js` le a linha bit a bit e conta correntes. Aqui a linha vira texto e
// as dicas saem de um `split`. Se as duas concordam em toda linha possivel, a
// convencao esta certa; se discordam, uma das duas esta errada, e e ai que mora
// o achado.

/** As dicas de uma linha, pelo texto. */
export function dicasPorTexto(bits, largura) {
  let texto = '';
  for (let j = 0; j < largura; j++) texto += ((bits >> j) & 1) ? '#' : '.';
  return texto.split('.').filter((p) => p.length > 0).map((p) => p.length);
}

/**
 * Todas as imagens que satisfazem um par de dicas, por forca bruta sobre as
 * 2^(largura*altura) imagens. Nao serve para varredura: serve para dizer a
 * verdade sobre um caso, e e contra ele que o resto e conferido.
 */
export function solucoesPorForcaBruta(dicasLinhas, dicasColunas, largura, altura) {
  const alvoL = dicasLinhas.map((d) => d.join(','));
  const alvoC = dicasColunas.map((d) => d.join(','));
  const total = 1 << (largura * altura);
  const achadas = [];
  for (let imagem = 0; imagem < total; imagem++) {
    const linhas = [];
    for (let i = 0; i < altura; i++) linhas.push((imagem >> (i * largura)) & ((1 << largura) - 1));
    let bate = true;
    for (let i = 0; i < altura && bate; i++) {
      if (dicasPorTexto(linhas[i], largura).join(',') !== alvoL[i]) bate = false;
    }
    for (let j = 0; j < largura && bate; j++) {
      let coluna = 0;
      for (let i = 0; i < altura; i++) if ((linhas[i] >> j) & 1) coluna |= 1 << i;
      if (dicasPorTexto(coluna, altura).join(',') !== alvoC[j]) bate = false;
    }
    if (bate) achadas.push(linhas);
  }
  return achadas;
}

/**
 * O censo por forca bruta: percorre TODAS as imagens, agrupa por dica num mapa
 * de texto, e conta. E o mesmo numero que a varredura rapida produz, por um
 * caminho que nao compartilha nem a tabela de dicas nem a chave empacotada.
 *
 * Cabe ate 4x5. Acima disso o mapa de texto nao cabe na memoria, e e por isso
 * que a varredura existe.
 */
export function censoPorForcaBruta(largura, altura) {
  const total = 1 << (largura * altura);
  const contagem = new Map();
  for (let imagem = 0; imagem < total; imagem++) {
    const linhas = [];
    for (let i = 0; i < altura; i++) linhas.push((imagem >> (i * largura)) & ((1 << largura) - 1));
    const partes = linhas.map((bits) => dicasPorTexto(bits, largura).join(','));
    for (let j = 0; j < largura; j++) {
      let coluna = 0;
      for (let i = 0; i < altura; i++) if ((linhas[i] >> j) & 1) coluna |= 1 << i;
      partes.push(dicasPorTexto(coluna, altura).join(','));
    }
    const k = partes.join('/');
    contagem.set(k, (contagem.get(k) || 0) + 1);
  }
  let unicos = 0;
  let maior = 0;
  for (const n of contagem.values()) {
    if (n === 1) unicos++;
    if (n > maior) maior = n;
  }
  return { imagens: total, puzzles: contagem.size, unicos, maiorAmbiguidade: maior };
}

/**
 * Quantas dicas distintas cabem numa linha de largura w, pela forma fechada.
 *
 * Uma dica (a1..ak) cabe quando a soma dos blocos mais os k-1 buracos
 * obrigatorios nao passa de w. Contar essas listas e contar composicoes, e o
 * total e F(w+2) na contagem de Fibonacci que comeca em F(1)=F(2)=1.
 *
 * Este e o juiz mais barato do projeto: uma soma de dois numeros contra uma
 * enumeracao de 2^w linhas. Se os dois discordam, a convencao de leitura das
 * dicas esta errada, e todo o resto cai junto.
 */
export function quantasDicas(largura) {
  let a = 1;
  let b = 1;
  for (let i = 0; i < largura; i++) { const c = a + b; a = b; b = c; }
  return b;
}
