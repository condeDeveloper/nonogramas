// A pagina. Toda a conta vem do nucleo; aqui so tem desenho e clique.
//
// O nucleo (dicas.js, linhas.js, juiz.js) e o mesmo arquivo que o node roda nos
// testes. Nao existe uma versao para o navegador e outra para a medicao: se a
// pagina mostra um numero, e o numero medido.

import { catalogo, dicasDaImagem } from './dicas.js';
import { resolverPorPropagacao } from './linhas.js';
import { solucoesPorForcaBruta } from './juiz.js';

const tela = document.getElementById('tela');
const ctx = tela.getContext('2d');
const estado = document.getElementById('estado');

const VAZIO = 0;
const CHEIO = 1;
const MARCADO = 2;

let lado = 5;
let solucao = [];
let dicasL = [];
let dicasC = [];
let grade = [];
let revelado = false;

function imagemAleatoria(n) {
  // uma imagem com densidade perto da metade da uma figura legivel; densidade
  // muito baixa deixa quase tudo vazio e o puzzle fica sem graca.
  const linhas = [];
  for (let i = 0; i < n; i++) {
    let bits = 0;
    for (let j = 0; j < n; j++) if (Math.random() < 0.52) bits |= 1 << j;
    linhas.push(bits);
  }
  return linhas;
}

function novo(n, imagem = null) {
  lado = n;
  solucao = imagem || imagemAleatoria(n);
  const d = dicasDaImagem(solucao, lado);
  dicasL = d.porLinha;
  dicasC = d.porColuna;
  grade = Array.from({ length: lado }, () => new Array(lado).fill(VAZIO));
  revelado = false;
  estado.textContent = '';
  desenhar();
}

function porDicas(linhas, colunas) {
  // monta o tabuleiro a partir das dicas, sem conhecer a imagem: e assim que o
  // exemplo patologico entra, porque ele nasceu da varredura, nao de um desenho.
  const n = linhas.length;
  const solucoes = solucoesPorForcaBruta(linhas, colunas, n, n);
  lado = n;
  solucao = solucoes[0];
  dicasL = linhas;
  dicasC = colunas;
  grade = Array.from({ length: n }, () => new Array(n).fill(VAZIO));
  revelado = false;
  estado.innerHTML = 'Este tem <span class="forte">uma solução só</span> — e a propagação por linha '
    + 'não decide nenhuma das ' + (n * n) + ' casas. Só o chute (ou a varredura) acha a imagem.';
  desenhar();
}

function medidasDaTela() {
  const margemL = Math.max(...dicasL.map((d) => d.length), 1) * 26 + 14;
  const margemT = Math.max(...dicasC.map((d) => d.length), 1) * 24 + 14;
  const casa = Math.min(
    Math.floor((tela.width - margemL - 10) / lado),
    Math.floor((tela.height - margemT - 10) / lado),
  );
  return { margemL, margemT, casa };
}

function desenhar() {
  const { margemL, margemT, casa } = medidasDaTela();
  ctx.clearRect(0, 0, tela.width, tela.height);
  ctx.fillStyle = '#0f0b17';
  ctx.fillRect(0, 0, tela.width, tela.height);

  ctx.font = '600 15px system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  // dicas de linha, encostadas na grade
  ctx.textAlign = 'right';
  for (let i = 0; i < lado; i++) {
    const texto = dicasL[i].length ? dicasL[i] : [0];
    for (let k = 0; k < texto.length; k++) {
      ctx.fillStyle = dicasL[i].length ? '#ece7f5' : '#5b5270';
      ctx.fillText(String(texto[texto.length - 1 - k]),
        margemL - 8 - k * 24, margemT + i * casa + casa / 2);
    }
  }

  // dicas de coluna
  ctx.textAlign = 'center';
  for (let j = 0; j < lado; j++) {
    const texto = dicasC[j].length ? dicasC[j] : [0];
    for (let k = 0; k < texto.length; k++) {
      ctx.fillStyle = dicasC[j].length ? '#ece7f5' : '#5b5270';
      ctx.fillText(String(texto[texto.length - 1 - k]),
        margemL + j * casa + casa / 2, margemT - 14 - k * 22);
    }
  }

  // casas
  for (let i = 0; i < lado; i++) {
    for (let j = 0; j < lado; j++) {
      const x = margemL + j * casa;
      const y = margemT + i * casa;
      const v = grade[i][j];
      ctx.fillStyle = v === CHEIO ? '#d4536f' : '#1d1729';
      ctx.fillRect(x + 1, y + 1, casa - 2, casa - 2);
      if (v === MARCADO) {
        ctx.strokeStyle = '#5b5270';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + casa * 0.32, y + casa * 0.32);
        ctx.lineTo(x + casa * 0.68, y + casa * 0.68);
        ctx.moveTo(x + casa * 0.68, y + casa * 0.32);
        ctx.lineTo(x + casa * 0.32, y + casa * 0.68);
        ctx.stroke();
      }
    }
  }

  // linhas da grade, mais grossas de cinco em cinco
  for (let k = 0; k <= lado; k++) {
    const forte = k % 5 === 0 || k === lado;
    ctx.strokeStyle = forte ? '#6b5f86' : '#332a47';
    ctx.lineWidth = forte ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(margemL + k * casa, margemT);
    ctx.lineTo(margemL + k * casa, margemT + lado * casa);
    ctx.moveTo(margemL, margemT + k * casa);
    ctx.lineTo(margemL + lado * casa, margemT + k * casa);
    ctx.stroke();
  }
}

function casaNoPonto(ev) {
  const r = tela.getBoundingClientRect();
  const escala = tela.width / r.width;
  const { margemL, margemT, casa } = medidasDaTela();
  const x = (ev.clientX - r.left) * escala - margemL;
  const y = (ev.clientY - r.top) * escala - margemT;
  const j = Math.floor(x / casa);
  const i = Math.floor(y / casa);
  if (i < 0 || j < 0 || i >= lado || j >= lado) return null;
  return [i, j];
}

function conferir() {
  for (let i = 0; i < lado; i++) {
    for (let j = 0; j < lado; j++) {
      const deveria = (solucao[i] >> j) & 1;
      if ((grade[i][j] === CHEIO ? 1 : 0) !== deveria) return false;
    }
  }
  return true;
}

tela.addEventListener('contextmenu', (ev) => ev.preventDefault());

tela.addEventListener('mousedown', (ev) => {
  const p = casaNoPonto(ev);
  if (!p) return;
  const [i, j] = p;
  const marcar = ev.button === 2 || ev.shiftKey;
  if (marcar) {
    grade[i][j] = grade[i][j] === MARCADO ? VAZIO : MARCADO;
  } else {
    grade[i][j] = grade[i][j] === CHEIO ? VAZIO : CHEIO;
  }
  desenhar();
  if (!revelado && conferir()) {
    estado.innerHTML = '<span class="ok">Pronto.</span> A imagem bate com as dicas.';
  }
});

document.getElementById('nova').addEventListener('click', () => {
  novo(Number(document.getElementById('tamanho').value));
});

document.getElementById('tamanho').addEventListener('change', () => {
  novo(Number(document.getElementById('tamanho').value));
});

document.getElementById('dica').addEventListener('click', () => {
  const cat = catalogo(lado);
  const idx = (d) => cat.porChave.get(d.join(','));
  const saida = resolverPorPropagacao(dicasL.map(idx), dicasC.map(idx), cat, cat);
  if (saida.contraditorio) { estado.textContent = 'Dicas contraditórias.'; return; }
  let decididas = 0;
  for (let i = 0; i < lado; i++) {
    for (let j = 0; j < lado; j++) {
      if ((saida.cheias[i] >> j) & 1) { grade[i][j] = CHEIO; decididas++; }
      else if ((saida.vazias[i] >> j) & 1) { grade[i][j] = MARCADO; decididas++; }
    }
  }
  desenhar();
  const total = lado * lado;
  estado.innerHTML = saida.resolvido
    ? 'A propagação por linha decidiu as <span class="forte">' + total + '</span> casas sozinha, sem chute.'
    : 'A propagação parou com <span class="aviso">' + (total - decididas) + '</span> de '
      + total + ' casas em aberto. Daqui para a frente só no chute.';
});

document.getElementById('revelar').addEventListener('click', () => {
  for (let i = 0; i < lado; i++) {
    for (let j = 0; j < lado; j++) grade[i][j] = ((solucao[i] >> j) & 1) ? CHEIO : MARCADO;
  }
  revelado = true;
  desenhar();
  estado.textContent = 'Esta é a imagem de onde as dicas saíram — pode não ser a única que as satisfaz.';
});

document.getElementById('patologico').addEventListener('click', () => {
  document.getElementById('tamanho').value = '4';
  porDicas([[1], [1], [2], [2]], [[1, 1], [1], [2], [1]]);
});

novo(5);
