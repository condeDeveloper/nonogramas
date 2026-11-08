# nonogramas

**As dicas de um nonograma determinam a imagem?** Em 75,43% das vezes, na caixa 5 × 5.
E quando determinam, a lógica linha a linha ainda falha em 1,32% delas.

Não é estimativa. Cada caixa foi varrida inteira: todas as 33.554.432 imagens da 5 × 5 e
todas as 1.073.741.824 da 6 × 5, uma por uma, agrupadas pelas dicas que produzem.

**[Abrir a página](https://condedeveloper.github.io/nonogramas/)** — dá para resolver, pedir
o que a propagação sabe, e abrir o puzzle de solução única em que ela não decide nada.

JavaScript puro: sem dependência, sem build, e o mesmo núcleo roda no navegador e nos testes.

---

## O censo

Toda imagem de uma caixa produz um conjunto de dicas. Imagens diferentes podem produzir o
mesmo conjunto — e aí as dicas não bastam. A tabela conta quantos conjuntos distintos
existem, e quantos deles servem a uma única imagem.

| caixa | imagens | dicas distintas | só uma imagem | fração | maior ambiguidade |
|---|---:|---:|---:|---:|---:|
| 3 × 3 | 512 | 445 | 384 | 75,00% | 6 |
| 4 × 3 | 4.096 | 3.588 | 3.152 | 76,95% | 6 |
| 4 × 4 | 65.536 | 58.196 | 52.362 | 79,90% | 24 |
| 5 × 4 | 1.048.576 | 915.743 | 814.632 | 77,69% | 36 |
| 4 × 5 | 1.048.576 | 915.743 | 814.632 | 77,69% | 36 |
| 5 × 5 | 33.554.432 | 28.781.820 | 25.309.575 | 75,43% | 120 |
| 6 × 5 | 1.073.741.824 | 909.340.930 | 794.378.773 | 73,98% | 240 |

A linha 4 × 5 está ali de propósito: transpor uma imagem troca linhas por colunas e não pode
mudar nada. Os números batem com os da 5 × 4 em todas as colunas, e essa igualdade é uma
conferência de graça que pegaria na hora qualquer troca de índice entre largura e altura.

## A lógica linha a linha

A propagação é o jeito que uma pessoa resolve: olha uma linha, vê quais padrões ainda cabem
nela, e marca só as casas em que todos concordam. Nunca chuta. A pergunta é quantos puzzles
de solução única ela resolve sozinha.

| caixa | solução única | a propagação resolve | sobram | fração | casas em aberto no pior caso |
|---|---:|---:|---:|---:|---:|
| 3 × 3 | 384 | 384 | 0 | 0,00% | 0 |
| 4 × 3 | 3.152 | 3.116 | 36 | 1,14% | 8 |
| 4 × 4 | 52.362 | 51.234 | 1.128 | 2,15% | 16 |
| 5 × 4 | 814.632 | 801.832 | 12.800 | 1,57% | 20 |
| 5 × 5 | 25.309.575 | 24.976.511 | 333.064 | 1,32% | 25 |

A última coluna é o que mais surpreende: 16 de 16 na caixa 4 × 4, 25 de 25 na 5 × 5. Existe
puzzle com uma solução só em que a propagação não decide **nenhuma** casa. Este é o menor:

```
dicas das linhas    1 · 1 · 2 · 2
dicas das colunas   1 1 · 1 · 2 · 1

a única imagem      #...
                    ..#.
                    ..##
                    ##..
```

A força bruta sobre as 65.536 imagens 4 × 4 confirma que a solução é uma só. A propagação
olha as quatro linhas, olha as quatro colunas, não acha uma casa forçada, e para.

## A ambiguidade não é um degradê

Quantos conjuntos de dicas servem a exatamente *k* imagens:

| caixa | k=1 | k=2 | k=3 | k=4 | k=5 | k=6 | k=7 | k=8 | k>8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 4 × 4 | 52.362 | 5.050 | 422 | 209 | 20 | 112 | 0 | 4 | 17 |
| 5 × 4 | 814.632 | 84.208 | 9.610 | 4.416 | 1.038 | 982 | 252 | 228 | 377 |
| 5 × 5 | 25.309.575 | 2.803.203 | 377.096 | 171.381 | 48.434 | 31.445 | 12.418 | 10.466 | 17.802 |

Na caixa 4 × 4 a coluna não desce: k=6 tem 112 casos contra 20 de k=5, e k=7 não acontece
nenhuma vez. O buraco é da caixa, não do número: na 5 × 4 o k=7 aparece 252 vezes. Por que
ele some exatamente na 4 × 4 eu não sei — a varredura diz que some, e é só isso que está
escrito aqui.

## Quantas dicas cabem numa linha

| largura | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| dicas distintas | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55 | 89 | 144 |

É Fibonacci: F(w+2). Uma dica (a₁…a_k) cabe numa linha de w casas quando a soma dos blocos
mais os k−1 buracos obrigatórios não passa de w, e contar essas listas é contar composições.
A forma fechada e a enumeração sobre as 2^w linhas concordam até w = 14 — é o juiz mais
barato do projeto, e seria o primeiro a cair se a convenção de leitura das dicas estivesse
errada.

## Os quatro achados

1. **Das 33.554.432 imagens da caixa 5 × 5, 25.309.575 — 75,43% — têm dicas que não servem a
   mais nenhuma imagem.** As outras 8.244.857 dividem as suas dicas com pelo menos uma vizinha.
2. **333.064 puzzles 5 × 5 têm uma solução só e ainda assim não cedem à propagação por linha**
   — e no pior deles ela não decide nenhuma das 25 casas. "Nonograma é lógica, não é chute"
   é falso em 1,32% dos casos.
3. **A fração de imagens que as dicas determinam não cai com o tamanho da caixa: ela sobe até
   79,90% na 4 × 4 e só então começa a cair**, chegando a 73,98% no bilhão de imagens da 6 × 5.
   O pico não está na menor caixa.
4. **O número de dicas distintas que cabem numa linha de w casas é F(w+2)**: 2, 3, 5, 8, 13,
   21. Fibonacci aparece sem ter sido convidado, e vira a conferência mais barata do projeto.

## O que as medidas me corrigiram

**Achei que a ambiguidade fosse um degradê.** Esperava uma coluna que desce sempre: muitos
puzzles com duas soluções, menos com três, menos ainda com quatro. Na caixa 4 × 4 ela sobe de
20 (k=5) para 112 (k=6) e depois cai para zero em k=7. Os valores que aparecem não são
arbitrários, e os que faltam faltam por um motivo.

**Esperava a primeira falha da propagação na caixa 4 × 4.** Ela aparece antes, na 4 × 3, com
36 puzzles. A 3 × 3 é a última caixa em que "solução única" e "resolve sem chutar" são a mesma
coisa, e é por isso que o teste prende os dois números: `sobram === 0` na 3 × 3 e `sobram > 0`
na 4 × 3.

**Esperava que caixa maior fosse sempre mais ambígua.** A fração de imagens determinadas sobe
de 75,00% na 3 × 3 para 79,90% na 4 × 4 antes de começar a cair. Escrevi a frase "quanto maior
a caixa, menos as dicas bastam" no rascunho do README e a tabela a desmentiu na segunda linha.

**Escrevi um contador de dicas que contava dica impossível.** A primeira versão de
`todasAsDicas` gerava todas as composições com soma ≤ w e devolvia listas que nenhuma linha
produz quando os buracos obrigatórios não cabiam. O catálogo passou a sair da enumeração das
2^w linhas, e foi aí que o Fibonacci apareceu — na versão errada o número não era F(w+2).

## Como está feito

```
js/dicas.js        imagem → dicas, e o catálogo de dicas de cada largura
js/linhas.js       a propagação por linha, que nunca chuta
js/varredura.js    o censo: todas as imagens de uma caixa, agrupadas pelas dicas
js/juiz.js         a segunda implementação, que não compartilha uma linha com a primeira
js/medidas.js      as tabelas deste README, uma função por linha
js/app.js          a página
ferramentas/medidor.js
```

**O juiz.** `dicas.js` lê a linha bit a bit e conta correntes; `juiz.js` transforma a linha em
texto e tira as dicas de um `split`. As duas leituras são comparadas em **todas** as linhas de
até 12 casas. O censo rápido é comparado com um censo por força bruta que guarda as dicas num
mapa de texto, nas caixas até 4 × 4 — mesmo número, nenhuma linha de código em comum.

**Por que a varredura não guarda as dicas de cada imagem.** Em 5 × 5 são 33 milhões de imagens
e um mapa de texto não cabe. A ordem é invertida: percorrer os conjuntos de dicas **de linha**
por fora, e só dentro de cada um agrupar pelas dicas de coluna. Aí o contador vira um vetor de
2²⁰ posições que se reaproveita entre os grupos, e a memória para de crescer com a caixa. É o
que faz o bilhão de imagens da 6 × 5 caber em menos de um minuto.

## Rodar

```bash
node --test testes/*.test.js     # 23 testes
node ferramentas/medidor.js      # todas as tabelas
node ferramentas/medidor.js censo
```

A página é estática: abrir o `index.html` basta, não tem build nem servidor.

## Licença

MIT.
