# 📸 Foto para PDF - PWA Mobile & Conversor Multipágina A4

Uma aplicação web moderna, ultra-rápida, 100% gratuita e offline (PWA) desenvolvida com **HTML5, Tailwind CSS e jsPDF**. Projetada especialmente para dispositivos móveis (foco no ecossistema **iOS/Safari** e **Android**), permitindo converter imagens em arquivos PDF formatados em A4 sem abrir novas abas e mantendo a total privacidade dos dados no próprio dispositivo.

---

## ✨ Funcionalidades Avançadas

- 📄 **Suporte a Múltiplas Páginas**: Selecione várias fotos de uma só vez ou adicione incrementalmente. Cada imagem é compilada como uma folha A4 centralizada no mesmo arquivo PDF.
- 🖼️ **Gerenciador de Páginas & Miniaturas**:
  - Pré-visualização com miniaturas (*thumbnails*).
  - 🔄 **Girar 90°**: Corrija fotos tiradas na horizontal/vertical.
  - ⬆️ ⬇️ **Reordenar Páginas**: Altere a ordem das páginas facilmente.
  - 🗑️ **Remover Fotos**: Exclua páginas indesejadas antes de compilar.
- ⚙️ **Configurações do PDF**:
  - Ajuste de margens (Padrão 10mm, Sem Margem / Full-bleed, Margem larga 20mm).
  - Orientação da folha (Automática conforme a foto, Forçar Retrato, Forçar Paisagem).
- 📲 **PWA (Progressive Web App)**:
  - Instalável na tela inicial do smartphone.
  - Funciona **100% Offline** via Service Worker (`sw.js`).
- 🌙 **Modo Escuro / Claro Automático**: Sincronização inteligente com a preferência do sistema operacional do usuário, além de controle manual.
- ⏳ **Indicador de Progresso Animado**: Feedback visual em tempo real durante o processamento da imagem e compilação do PDF.
- 📥 **Salvamento & Compartilhamento Nativo no iOS/Android**: Utilização da **Web Share API** (`navigator.share`) para abrir diretamente o menu *"Salvar em Arquivos"* ou enviar pelo WhatsApp sem bloqueio de pop-up.

---

## ⚡ Tecnologias Utilizadas

- **HTML5 & Vanilla JavaScript ES6+**: Arquitetura modular sem frameworks pesados, garantindo carregamento instantâneo.
- **Tailwind CSS**: Design responsivo com Tailwind, suporte a Dark Mode por classe e otimização para iOS Safe Area (`env(safe-area-inset)`).
- **jsPDF (v2.5.1)**: Compilação local de PDF no navegador.
- **PWA Service Worker & Manifest**: Cache inteligente e experiência nativa em tela cheia.

---

## 🚀 Como Executar ou Fazer Deploy no GitHub Pages

### 1. Executar Localmente
Como a aplicação utiliza apenas scripts client-side, basta abrir o arquivo `index.html` em qualquer navegador ou servir localmente usando uma extensão HTTP (ex: Live Server).

### 2. Deploy no GitHub Pages via Terminal (SSH)
```bash
# Adicionar alterações
git add .

# Criar commit com as novidades
git commit -m "feat: suporte multipágina, dark mode, miniaturas e otimizações PWA"

# Push para a branch main
git push origin main
```

Após o push, o GitHub Pages atualizará o site automaticamente no seu domínio (ex: `https://gabriel0138.github.io/foto-para-pdf/`).

---

## 📱 DICA: Como Adicionar na Tela de Início (iPhone / iOS)

1. Acesse o site no **Safari** do iPhone.
2. Toque no ícone de **Compartilhar** (quadrado com seta para cima 📤).
3. Selecione **"Adicionar à Tela de Início"**.
4. Abra o app pelo novo ícone **Foto PDF** para ter navegação em tela cheia (estilo nativo).

---

## 🔒 Privacidade e Segurança
Nenhuma imagem é enviada para servidores externos. Todo o processamento de imagens e renderização do PDF é feito exclusivamente na memória local do navegador do usuário.
