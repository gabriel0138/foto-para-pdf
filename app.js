/**
 * 📸 Gerador de PDF (Foto para PDF A4)
 * Aplicação 100% Client-Side focada em usabilidade e dispositivos móveis (iOS/Safari).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const imageInput = document.getElementById('imageInput');
  const previewCard = document.getElementById('previewCard');
  const imagePreview = document.getElementById('imagePreview');
  const selectBtn = document.getElementById('selectBtn');
  const rotateBtn = document.getElementById('rotateBtn');
  const generateActionArea = document.getElementById('generateActionArea');
  const generatePdfBtn = document.getElementById('generatePdfBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileDimensionsDisplay = document.getElementById('fileDimensionsDisplay');

  // Estado local da imagem
  let state = {
    dataUrl: null,
    fileName: '',
    width: 0,
    height: 0,
    rotation: 0 // Ângulo de rotação (0, 90, 180, 270)
  };

  /**
   * Registra o Service Worker para suporte PWA / Offline
   */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('Service Worker não registrado:', err);
    });
  }

  /**
   * Exibe uma mensagem de erro na interface
   */
  function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
      errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  /**
   * Esconde a mensagem de erro
   */
  function clearError() {
    errorMessage.classList.add('hidden');
    errorText.textContent = '';
  }

  /**
   * Event Listener quando o usuário seleciona ou tira uma foto
   */
  imageInput.addEventListener('change', (e) => {
    clearError();
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Validação do tipo de arquivo (deve ser imagem)
    if (!file.type.startsWith('image/')) {
      showError('O arquivo selecionado não é uma imagem válida. Por favor escolha uma foto (JPG, PNG, HEIC, etc).');
      imageInput.value = '';
      return;
    }

    // Leitura do arquivo usando FileReader
    const reader = new FileReader();

    reader.onload = function (event) {
      const dataUrl = event.target.result;
      const img = new Image();

      img.onload = function () {
        // Atualiza estado local
        state.dataUrl = dataUrl;
        state.fileName = file.name || 'foto.jpg';
        state.width = img.naturalWidth;
        state.height = img.naturalHeight;
        state.rotation = 0;

        // Atualiza elementos da interface
        imagePreview.src = dataUrl;
        imagePreview.style.transform = 'rotate(0deg)';
        fileNameDisplay.textContent = state.fileName;
        fileDimensionsDisplay.textContent = `${state.width} x ${state.height} px`;

        // Exibe o card de preview e botão de gerar PDF
        previewCard.classList.remove('hidden');
        generateActionArea.classList.remove('hidden');

        // Rola a página suavemente até o preview
        setTimeout(() => {
          previewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      };

      img.onerror = function () {
        showError('Erro ao carregar os dados da imagem. O arquivo pode estar corrompido.');
      };

      img.src = dataUrl;
    };

    reader.onerror = function () {
      showError('Ocorreu um erro ao ler o arquivo no seu dispositivo.');
    };

    reader.readAsDataURL(file);
  });

  /**
   * Girar Imagem 90 Graus no Preview
   */
  rotateBtn.addEventListener('click', () => {
    if (!state.dataUrl) return;

    state.rotation = (state.rotation + 90) % 360;
    imagePreview.style.transform = `rotate(${state.rotation}deg)`;
  });

  /**
   * Utilitário para aplicar rotação física via Canvas antes de inserir no jsPDF
   */
  function getRotatedImageCanvas(imgElement, angle) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (angle === 90 || angle === 270) {
      canvas.width = imgElement.naturalHeight;
      canvas.height = imgElement.naturalWidth;
    } else {
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(
      imgElement,
      -imgElement.naturalWidth / 2,
      -imgElement.naturalHeight / 2
    );

    return canvas;
  }

  /**
   * Gera a nomeação automática inteligente baseada em data/hora
   * Exemplo: documento-2026-07-30_1430.pdf
   */
  function generateSmartFileName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `documento-${year}-${month}-${day}_${hours}${minutes}.pdf`;
  }

  /**
   * Geração do Arquivo PDF A4 usando a biblioteca jsPDF
   */
  generatePdfBtn.addEventListener('click', async () => {
    if (!state.dataUrl) {
      showError('Nenhuma imagem foi selecionada.');
      return;
    }

    // Exibe o indicador de carregamento
    loadingOverlay.classList.remove('hidden');

    // Pequeno delay para garantir a renderização da animação do spinner
    setTimeout(() => {
      try {
        const { jsPDF } = window.jspdf;

        // Processar rotação final se o usuário tiver girado no preview
        let finalDataUrl = state.dataUrl;
        let finalWidth = state.width;
        let finalHeight = state.height;

        if (state.rotation !== 0) {
          const canvas = getRotatedImageCanvas(imagePreview, state.rotation);
          finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          finalWidth = canvas.width;
          finalHeight = canvas.height;
        }

        // Definir orientação da página A4 baseada na proporção da imagem
        // se a foto for mais larga do que alta -> Paisagem (landscape)
        // se a foto for mais alta do que larga -> Retrato (portrait)
        const isLandscape = finalWidth > finalHeight;
        const pdfOrientation = isLandscape ? 'l' : 'p';

        // Dimensões A4 em milímetros (mm)
        // Portrait: 210mm (largura) x 297mm (altura)
        // Landscape: 297mm (largura) x 210mm (altura)
        const pageW = isLandscape ? 297 : 210;
        const pageH = isLandscape ? 210 : 297;

        // Margem de respiro de 10mm ao redor do documento para acabamento limpo
        const margin = 10;
        const availW = pageW - margin * 2;
        const availH = pageH - margin * 2;

        // Cálculo da escala mantendo a proporção original (sem distorção)
        const scale = Math.min(availW / finalWidth, availH / finalHeight);
        const renderW = finalWidth * scale;
        const renderH = finalHeight * scale;

        // Centralização exata da imagem na página A4
        const posX = (pageW - renderW) / 2;
        const posY = (pageH - renderH) / 2;

        // Criar documento PDF no formato A4
        const pdf = new jsPDF({
          orientation: pdfOrientation,
          unit: 'mm',
          format: 'a4'
        });

        // Detectar o formato da imagem (JPEG ou PNG)
        let imgFormat = 'JPEG';
        if (state.fileName.toLowerCase().endsWith('.png')) {
          imgFormat = 'PNG';
        }

        // Adicionar imagem ao PDF
        pdf.addImage(finalDataUrl, imgFormat, posX, posY, renderW, renderH);

        // Nome automático inteligente
        const outputFileName = generateSmartFileName();

        // Faz o download direto do arquivo PDF no navegador
        pdf.save(outputFileName);

        // Sucesso visual
        alert('🎉 Seu PDF foi gerado e baixado com sucesso!');

      } catch (err) {
        console.error('Erro na geração do PDF:', err);
        showError('Ocorreu um erro inesperado ao gerar o PDF. Tente novamente.');
      } finally {
        // Oculta o spinner
        loadingOverlay.classList.add('hidden');
      }
    }, 200);
  });
});
