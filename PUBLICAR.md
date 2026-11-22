# Publicar com GitHub — escolha a privacidade antes

## Recomendado para acesso restrito

1. Crie um **repositório PRIVADO** no GitHub chamado, por exemplo, `o-vazio-convergencia`.
2. Envie **os arquivos dentro desta pasta**, com `index.html` na raiz (não uma pasta extra contendo tudo).
3. No Cloudflare, em **Workers & Pages**, crie um projeto Pages conectado ao repositório GitHub, com branch `main`. Como o projeto é HTML puro, não há etapa de build; diretório de saída é a raiz do repositório.
4. Configure uma política **Cloudflare Access** para o endereço do site, permitindo **apenas os endereços/identidades autorizados** antes de compartilhar o link. Consulte a documentação atual de Cloudflare Access e teste em janela anônima.
5. Quando enviar atualizações ao mesmo repositório/branch, o Cloudflare Pages publicará automaticamente uma nova versão no **mesmo endereço**.
6. A coleção de cartas continuará local ao navegador enquanto não adicionarmos um banco de dados autenticado. Para ter a mesma coleção no PC e no celular ou compartilhada entre contas, ainda será necessário integrar persistência remota protegida.

### Alternativa: GitHub Pages

É simples para um **protótipo público**: Settings -> Pages -> Build and deployment -> Deploy from a branch -> `main` -> `/ (root)` -> Save. GitHub Pages é publicado na internet por padrão, ainda que o repositório seja privado. **Não é adequado para o pedido de acesso privado no GitHub comum**; o recurso de Pages privado exige GitHub Enterprise Cloud organizacional.

### Links da documentação oficial

- Cloudflare Pages GitHub: https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
- Cloudflare Access: https://developers.cloudflare.com/cloudflare-one/
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Por que não há endereço publicado no pacote?

Preparar o HTML/ZIP não publica um site. É preciso conectar o repositório ao serviço e confirmar uma implantação. Sem isso, não existe URL legítima para fornecer.
