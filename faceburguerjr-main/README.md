# Face Burguer JR — Cardápio Online + Painel do Administrador

Site da **Face Burguer JR** (Rio Branco – AC): o cliente monta o pedido pelo cardápio online e o pedido chega em tempo real no painel do balcão, que imprime automaticamente na impressora térmica.

| Página | Para quem | O que faz |
|---|---|---|
| `index.html` | Clientes | Cardápio, montagem de açaí/batata, carrinho, checkout (entrega/retirada, bairro e taxa), conta opcional, histórico e acompanhamento do pedido |
| `painel.html` | Somente o dono | Login, pedidos em tempo real, status, campainha de pedido novo, impressão na impressora padrão (58/80mm), produtos, categorias, **adicionais (preços)**, bairros/taxas |

---

## Arquitetura

- **Site 100% estático**: HTML + CSS + JavaScript puro, **sem build, sem Node, sem servidor**. Qualquer hospedagem estática serve (Hostinger, Vercel, Netlify…).
- **Firebase (SDK Web *compat* 10.13, via CDN gstatic)**:
  - **Authentication**: login anônimo automático do cliente, e-mail/senha opcional pro cliente e o login do dono no painel.
  - **Cloud Firestore** (coleções `pedidos`, `clientes/{uid}` + `enderecos`, `categorias`, `produtos`, `adicionais`, `delivery_neighborhoods`).
  - Fotos de produtos cadastrados pelo painel ficam comprimidas (até ~250 KB) dentro do próprio documento do produto no Firestore — o projeto não usa Firebase Storage (que exige o plano Blaze).
- **Impressão**: pelo próprio navegador, na impressora térmica **padrão** do computador (bobina 58mm ou 80mm, escolhida no topo do painel). O cupom sai ao clicar em **Aceitar pedido**. Para sair sem a janela de impressão, abra o Chrome por um atalho com `--kiosk-printing`. Não usa QZ Tray.
- **Som**: campainha gerada no painel, repete até o pedido ser aceito.
- **Google Fonts**: Poppins no cardápio, Inter no painel.
- O cardápio fixo (`MENU`, `ACAI_SIZES`, `BATATA_TIPOS`…) fica dentro do `index.html`. Produtos e categorias cadastrados no painel são somados a ele em tempo real, via Firestore.

## Adicionais (aba "➕ Adicionais" do painel)

- Os valores padrão dos adicionais ficam em `GRUPOS_ADICIONAIS` no `index.html` (e uma cópia em `ADICIONAIS_PADRAO` no `painel.html`).
- Pelo painel, o dono muda **preço, nome, máximo, disponível/esgotado**, adiciona ou remove opções e clica em **Salvar**. Isso grava um documento na coleção `adicionais` do Firestore, com o id do grupo (`lanche_extras`, `burger_ponto`, `burger_extras`, `acai_acompanhamentos`, `acai_adicionais`, `batata_adicionais`).
- O cardápio escuta essa coleção em tempo real: o preço novo aparece na hora pros clientes, inclusive no carrinho de quem já está montando o pedido.
- **Restaurar padrão** apaga o documento do grupo e o cardápio volta aos valores do `index.html`.

## Estrutura de pastas

```
faceburguer-jr/
├── index.html              ← cardápio (cliente)
├── painel.html             ← painel do administrador
├── .htaccess               ← HTTPS, cache, compressão (Apache/LiteSpeed – Hostinger)
├── .gitignore
├── .gitattributes
├── README.md
├── docs/
│   └── imagens.json        ← mapa de cada imagem → produto que a usa (documentação)
└── assets/
    └── images/
        ├── logo/                  logo, favicon, ícone do iPhone
        ├── combos/                fotos dos Combos 1 a 5
        ├── sanduiches/            X-Burguer, X-Tudo…
        ├── hamburguer-artesanal/
        ├── bebidas/
        ├── batatas/
        ├── acai/
```

Todas as referências são **relativas** (`assets/images/...`). O site funciona no domínio principal, em subpasta (`seusite.com/cardapio/`) e aberto localmente.

## Executar localmente

Não abra o arquivo com duplo clique (`file://`): o Firebase Auth e o IndexedDB não funcionam direito assim, principalmente no celular. Suba um servidor estático simples na pasta do projeto:

```bash
# Python (já vem no macOS/Linux; no Windows: python -m http.server)
python3 -m http.server 8080
# ou Node
npx serve .
```

Depois abra `http://localhost:8080/` (cardápio) e `http://localhost:8080/painel.html` (painel).

> O domínio `localhost` já vem autorizado por padrão no Firebase Authentication.

## Configuração do Firebase

A configuração do app Web (`FIREBASE_CONFIG`) está no `index.html` e no `painel.html`. Ela é **pública por natureza**: identifica o projeto, não dá acesso a nada sozinha. A segurança real fica nas **Regras do Firestore** e nas configurações do **Console**.

Pra usar este código em outro projeto Firebase, troque o objeto `FIREBASE_CONFIG` nos dois arquivos, que precisam ser iguais.

### Checklist no Firebase Console (fazer ao trocar de domínio)
1. **Authentication → Configurações → Domínios autorizados**: adicione o domínio final (ex.: `seudominio.com.br` e `www.seudominio.com.br`).
2. **Authentication → Método de login**: manter **Anônimo** e **E-mail/senha** ativados.
3. **Google Cloud Console → APIs e serviços → Credenciais → chave de API do navegador**: se ela tiver restrição por *HTTP referrer*, inclua `https://SEU-DOMINIO/*`.
4. **Firestore → Regras**: cole o conteúdo de `firestore.rules` (veja *Segurança*).

## Publicar na Hostinger

**O que vai pro servidor (conteúdo de `public_html/`):**
```
index.html
painel.html
.htaccess
assets/          (pasta inteira)
```
**O que NÃO precisa ir:** `README.md`, `docs/`, `.gitignore`, `.gitattributes`, `.git/`. Se forem junto (por exemplo, via deploy Git), o `.htaccess` bloqueia o acesso a eles.

### Opção A — Gerenciador de Arquivos (mais simples)
1. hPanel → **Sites → Gerenciar → Gerenciador de Arquivos** → abra `public_html/`.
2. Apague o `index.php`/`default.php` de exemplo, se existir.
3. Envie um `.zip` com `index.html`, `painel.html`, `.htaccess` e `assets/` → clique com o botão direito → **Extrair**. Confira que `index.html` ficou **direto** em `public_html/`, e não dentro de uma subpasta.
4. hPanel → **Segurança → SSL**: ative o certificado gratuito. O `.htaccess` já redireciona tudo pra HTTPS.
5. Faça o checklist do Firebase acima com o domínio novo.

### Opção B — Deploy automático pelo GitHub
1. hPanel → **Avançado → Git**. A Hostinger exige que `public_html/` esteja **vazia** no primeiro deploy (faça backup e esvazie antes).
2. Repositório: `git@github.com:SEU-USUARIO/SEU-REPOSITORIO.git`, branch `main`, diretório: deixe vazio (vai pra `public_html`).
3. Como o repositório é **privado**, copie a *chave SSH* que o hPanel mostra e adicione no GitHub em **Repositório → Settings → Deploy keys** (somente leitura).
4. Clique em **Deploy**. Pra atualizar depois: `git push` e **Deploy** de novo, ou ative o *Auto Deployment* com o webhook que a Hostinger fornece.

## Atualizar o site

1. Edite `index.html` / `painel.html` (preços, horários e textos ficam nos blocos `CONFIG`, `MENU`, `HORARIO_SEMANA`… no início do script).
2. **Foto nova**: salve em `assets/images/<categoria>/nome-do-produto.webp`, com uns 220×220 px e qualidade ~85. O [Squoosh](https://squoosh.app) converte pra WebP. Depois aponte o campo `foto:` do produto pra esse caminho.
3. **Trocar uma foto existente**: use um **nome novo** (ex.: `x-tudo-v2.webp`). As imagens ficam 7 dias em cache no navegador do cliente; o HTML não fica em cache.
4. Teste localmente, faça commit/push e publique (Opção A ou B).

> Produtos cadastrados pelo painel não precisam de nada disso: a foto é comprimida e salva junto com o produto no Firestore automaticamente.

## GitHub

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO
# ... alterações ...
git add -A
git status          # confira que nenhum arquivo sensível aparece
git commit -m "Descrição da mudança"
git push origin main
```

O `.gitignore` já bloqueia `.env`, chaves (`*.pem`, `*.key`), *service accounts* do Firebase (`*-firebase-adminsdk-*.json`), logs, caches, `node_modules/` e arquivos de sistema.

## Segurança — observações importantes

- **Nunca** coloque no repositório: service account / chave privada do Firebase Admin, senhas, tokens, `client_secret`. O site não precisa de nenhum deles.
- A trava do painel (`UID_DONO`) e o limite "cada cliente só vê os próprios pedidos" são **interface**. Quem realmente protege os dados são as **Regras do Firestore**. Elas devem, no mínimo:
  - `categorias`, `produtos`, `adicionais`, `delivery_neighborhoods`: leitura pública; escrita **só** do UID do dono;
  - `pedidos`: criação por usuário autenticado (inclusive anônimo); leitura/alteração só do dono ou do próprio `clienteUid`;
  - `clientes/{uid}` e `clientes/{uid}/enderecos`: só o próprio `uid`;
- Regra da coleção `adicionais` (cole dentro de `match /databases/{database}/documents { ... }` nas Regras do Firestore):
  ```
  match /adicionais/{grupo} {
    allow read: if true;
    allow write: if request.auth != null && request.auth.uid == "JnZbWc4Z8AbYWgQ655IvtvRxfjG2";
  }
  ```
- As regras do Firestore estão em `firestore.rules` neste repositório.
- A chave Pix exibida no checkout é intencionalmente pública.
