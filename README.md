# O Vazio: Convergência — Site Integrado

Este é o site de testes HTML5 do jogo de cartas **O Vazio: Convergência**.

## Páginas

- `index.html` — navegação de Jogar / Editor / Coleção / Montar Deck / Regras.
- `editor.html` — **Editor v5 original integrado** (13 MB, artes e molduras incorporadas), sem reformulação do desenho de cartas.
- `duelo.html` — arena de testes funcional em HTML/CSS/JS, com CPU, escolha de Campo e regras experimentais.
- `site.js` — comunicação entre editor/duelo e armazenamento local IndexedDB.
- `assets/` — imagens do tabuleiro, verso, cartas demonstrativas e ilustrações.

## Como usar

1. Publique o conteúdo desta pasta como a raiz de um site HTTPS, ou execute um servidor web local.
2. Abra `index.html` no site. Clique em **Editor de Cartas** e crie uma carta como antes.
3. Clique em **Salvar na Coleção do site** no topo do editor. A carta será renderizada pelo próprio editor e guardada no navegador.
4. Na aba **Coleção**, clique em **Efeito no duelo** para mapear uma habilidade textual para um comportamento implementado (opcional, apenas para testes).
5. Clique em **Montar Deck** para escolher 30 cartas, e **Jogar** para começar uma partida contra a CPU.
6. Selecione uma das 5 Magias de Campo sorteadas antes da partida; Campos ficam fora do baralho.
7. Use **Backup da coleção** para exportar suas cartas em JSON; use **Restaurar backup** para recuperá-las.

## Regras no protótipo

20.000 PV por jogador, 30 cartas de deck, 2 Vanguarda, 3 Retaguarda, 4 Magias/Armadilhas, limite de 12 estrelas no campo, crescimento de cristal de 1 a 8, combate com dano simultâneo. Outras mecânicas são experimentais: sem garantia de balanceamento. O editor permite Magia Comum, Rápida, Permanente e Armadilha; Magia de Campo não consome cristais nem faz parte das 30 cartas.

## Importante — armazenamento e privacidade

- As cartas da coleção ficam **no IndexedDB do navegador/dispositivo**, não no GitHub nem automaticamente na nuvem; abrir o site em outro computador não mostra a mesma coleção.
- As cartas de teste da pasta `assets/cards` são exemplos e não pertencem necessariamente ao cânone da história.
- O site **ainda não possui contas/login**. Não afirme que o endereço é privado enquanto não configurar uma camada real de autenticação.
- O GitHub Pages normalmente publica o site na internet, mesmo que a origem seja um repositório privado. Para restringir a dois usuários, use hospedagem com controle de acesso, por exemplo **Cloudflare Pages + Cloudflare Access**, ou providencie backend com login. Nunca use só uma senha em JavaScript, pois não protege os arquivos.
- Este pacote é uma fase jogável de testes, **não é uma aplicação multiplayer online**. A CPU roda inteiramente no navegador.

## Teste local

No Windows, com Python instalado, dentro desta pasta execute `python -m http.server 8000` e visite `http://localhost:8000`. Abrir `index.html` por `file://` pode bloquear fetch e armazenamento por questões de origem de segurança.

## Publicação e atualizações sem download

Repositório GitHub privado com esta estrutura -> serviço de hospedagem conectado ao repositório -> atualizações da branch principal publicadas automaticamente no mesmo URL. Veja `PUBLICAR.md` antes de configurar a visibilidade.
