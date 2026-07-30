# 📸 Gerador de PDF - Foto para PDF A4 (PWA Mobile)

Aplicação web minimalista, moderna e 100% focada em dispositivos móveis (especialmente iOS/Safari), projetada para permitir que qualquer pessoa (mesmo sem afinidade tecnológica) tire uma foto da câmera ou escolha uma imagem da galeria e a converta instantaneamente em um arquivo PDF formatado em A4.

---

## ⚡ Tecnologias Utilizadas

- **HTML5 & Vanilla JavaScript (Client-Side)**: Não necessita de servidor backend ou banco de dados. Roda 100% direto no navegador do celular preservando a privacidade das fotos.
- **Tailwind CSS (CDN)**: Interface moderna, botões gigantes de alta acessibilidade e contraste visual otimizado.
- **jsPDF (v2.5.1 via CDN)**: Biblioteca leve e estável para geração e formatação proporcional do PDF em A4.
- **PWA (Progressive Web App)**: Manifest e Service Worker inclusos para navegação em tela cheia e suporte offline.

---

## 🚀 Como subir este projeto no GitHub Pages (Passo a Passo)

Subir este site no **GitHub Pages** é totalmente gratuito e leva menos de 2 minutos:

### 1. Criar o repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Nomeie o repositório como `foto-para-pdf` (ou o nome de sua preferência).
3. Deixe o repositório como **Público** e clique em **Create repository**.

### 2. Enviar o código local usando SSH
No seu terminal local, execute:

```bash
# Inicializar repositório local
git init
git add .
git commit -m "feat: versão inicial do Gerador de PDF PWA"
git branch -M main

# Vincular ao repositório remoto (substitua pelo seu usuário do GitHub)
git remote add origin git@github.com:gabriel0138/foto-para-pdf.git

# Enviar o código
git push -u origin main
```

### 3. Ativar o GitHub Pages
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Build and deployment** -> **Branch**, selecione a branch `main` e a pasta `/ (root)`.
4. Clique em **Save**.
5. Em cerca de 1 minuto, o GitHub fornecerá o link público do seu aplicativo (exemplo: `https://gabriel0138.github.io/foto-para-pdf/`).

---

## 🌟 DICA DE OURO: Como adicionar na Tela de Início do iPhone (Estilo App Nativo)

Para que seu pai (ou qualquer familiar) use este site como se fosse um aplicativo instalado da App Store, sem barra de navegação do Safari atrapalhando, siga os passos abaixo:

1. **Abra o Safari no iPhone** e acesse o link do seu site no GitHub Pages (ex: `https://gabriel0138.github.io/foto-para-pdf/`).
2. Na parte inferior da tela do Safari, toque no botão **Compartilhar** (o ícone de um quadrado com uma seta apontando para cima 📤).
3. Role o menu para baixo e toque em **"Adicionar à Tela de Início"** (Add to Home Screen).
4. No canto superior direito, toque em **"Adicionar"**.

Pronto! Um ícone **"Foto PDF"** será criado na tela principal do iPhone. Ao tocar nele, a aplicação abrirá em **tela cheia (Full Screen)**, sem barra de endereços, funcionando exatamente como um app nativo, rápido e direto ao ponto! 📱✨
