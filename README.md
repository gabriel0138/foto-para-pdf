# 📸 Foto para PDF - PWA Mobile & Conversor Multipágina A4 (Privacy by Design)

Uma aplicação web moderna, ultra-rápida, 100% gratuita, offline (PWA) e **100% privativa (Privacy by Design & Zero-Persistence)** desenvolvida com **HTML5, Tailwind CSS e jsPDF**. Projetada especialmente para dispositivos móveis (ecossistemas **iOS/Safari** e **Android**), permitindo converter imagens em arquivos PDF formatados em A4 de alta qualidade e tamanho ultra-otimizado.

---

## ✨ Funcionalidades Principais & Blindagem de Privacidade

### 1. ⚡ Compressor Automático de Imagem (Performance Web)
- Redimensionamento inteligente no Canvas com limite máximo de resolução de **~1200px** por borda e compressão **JPEG a 0.82**.
- Evita a geração de PDFs gigantescos (>10MB) ao tirar fotos com telefones modernos (48MP+), garantindo arquivos ultra-leves (<1MB) mantendo nitidez cirúrgica para impressão e leitura de documentos.

### 2. 📝 Renomeação Personalizada de Arquivo
- Campo visível na interface para digitar o nome desejado do PDF (ex: `exame-medico-pai`).
- Adiciona automaticamente a extensão `.pdf` com sanitização de caracteres especiais.
- Padrão automático com data/hora caso o campo permança em branco (`documento-YYYY-MM-DD_HHMM.pdf`).

### 3. 🛡️ Auditoria Zero-Persistence (Privacidade Absoluta)
- **100% Efêmero**: Nenhuma foto, imagem processada, base64 ou arquivo PDF é salvo em `localStorage`, `sessionStorage`, `cookies` ou `IndexedDB`.
- **Limpeza de Memória RAM**: Invocação sistemática de `URL.revokeObjectURL` e zera-dimensionamento de Canvas imediatamente após o uso ou reset da aplicação, eliminando qualquer risco de vazamento de cache sensível no navegador.

### 4. 📄 Suporte a Múltiplas Páginas & Miniaturas
- Seleção múltipla simultânea ou inclusão incremental.
- Miniaturas (*thumbnails*) interativas com **Girar 90°**, **Mover para Cima/Baixo** e **Remover**.
- Opções de margem (Padrão 10mm, Sem Margem / Full-bleed, Margem Larga 20mm) e orientação da folha (Auto, Retrato, Paisagem).

### 5. 📲 PWA & Design Nativo iOS/Android
- Instalável na tela inicial via `manifest.json` com ícone personalizado.
- Funcionamento **100% Offline** gerenciado pelo Service Worker (`sw.js`).
- Suporte a **Modo Escuro / Claro** sincronizado com o sistema operacional.
- Salvamento e compartilhamento nativo via **Web Share API** (`navigator.share`).

---

## ⚡ Tecnologias Utilizadas

- **HTML5 & Vanilla JavaScript ES6+**: Arquitetura livre de dependências pesadas.
- **Tailwind CSS**: Estilização responsiva com Dark Mode nativo e suporte a iOS Safe Area (`env(safe-area-inset)`).
- **jsPDF (v2.5.1)**: Compilação de PDF local direto no dispositivo do usuário.
- **Service Worker & Web App Manifest**: PWA nativo offline.

---

## 🚀 Versionamento e Deploy no GitHub Pages

### Deploy Automático via SSH
```bash
git add .
git commit -m "feat: compressor de imagem 1200px, renomeação de PDF e auditoria zero-persistence"
git push origin main
```

O site estará imediatamente disponível em `https://gabriel0138.github.io/foto-para-pdf/`.
