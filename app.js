/**
 * 📸 Gerador de PDF (Foto para PDF A4) - Otimizado para iOS / Safari
 * Solução Definitiva para Download/Salvamento Direto sem abrir novas abas.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const imageInput = document.getElementById('imageInput');
  const previewCard = document.getElementById('previewCard');
  const imagePreview = document.getElementById('imagePreview');
  const rotateBtn = document.getElementById('rotateBtn');
  const generateActionArea = document.getElementById('generateActionArea');
  const generatePdfBtn = document.getElementById('generatePdfBtn');
  const downloadResultCard = document.getElementById('downloadResultCard');
  const primarySaveBtn = document.getElementById('primarySaveBtn');
  const fallbackDownloadLink = document.getElementById('fallbackDownloadLink');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileDimensionsDisplay = document.getElementById('fileDimensionsDisplay');

  // Estado local da imagem e do PDF gerado
  let state = {
    dataUrl: null,
    fileName: '',
    width: 0,
    height: 0,
    rotation: 0,
    generatedPdfFile: null,
    generatedBlobUrl: null,
    outputFileName: ''
  };

  // Registra o Service Worker PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('Service Worker PWA:', err);
    });
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
      errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  function clearError() {
    errorMessage.classList.add('hidden');
    errorText.textContent = '';
  }

  /**
   * Seletor de Arquivos Inteligente iOS
   */
  imageInput.addEventListener('change', (e) => {
    clearError();
    downloadResultCard.classList.add('hidden');
    const file = e.target.files[0];

    if (!file) return;

    if (file.type.startsWith('image/') || file.name.match(/\.(heic|heif|jpg|jpeg|png|webp|gif)$/i)) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const dataUrl = event.target.result;
        const img = new Image();

        img.onload = function () {
          state.dataUrl = dataUrl;
          state.fileName = file.name || 'foto.jpg';
          state.width = img.naturalWidth;
          state.height = img.naturalHeight;
          state.rotation = 0;

          imagePreview.src = dataUrl;
          imagePreview.style.transform = 'rotate(0deg)';
          fileNameDisplay.textContent = state.fileName;
          fileDimensionsDisplay.textContent = `${state.width} x ${state.height} px`;

          previewCard.classList.remove('hidden');
          generateActionArea.classList.remove('hidden');

          setTimeout(() => {
            previewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        };

        img.onerror = function () {
          showError('Erro ao carregar a imagem. Formato não suportado.');
        };

        img.src = dataUrl;
      };

      reader.onerror = function () {
        showError('Erro ao ler o arquivo no dispositivo.');
      };

      reader.readAsDataURL(file);
    } else {
      showError('Por favor selecione um arquivo de imagem válido (JPG, PNG, HEIC).');
      imageInput.value = '';
    }
  });

  /**
   * Rotação de Imagem
   */
  rotateBtn.addEventListener('click', () => {
    if (!state.dataUrl) return;
    state.rotation = (state.rotation + 90) % 360;
    imagePreview.style.transform = `rotate(${state.rotation}deg)`;
  });

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
   * Função para Executar o Salvamento/Compartilhamento Nativo no iOS
   */
  async function triggerNativeSaveOrShare() {
    if (!state.generatedPdfFile) return;

    // 1. Tentar Web Share API NATIVA do iOS Safari (Menu "Salvar em Arquivos", "WhatsApp", etc)
    if (navigator.canShare && navigator.canShare({ files: [state.generatedPdfFile] })) {
      try {
        await navigator.share({
          files: [state.generatedPdfFile],
          title: state.outputFileName,
          text: 'PDF gerado via Foto para PDF'
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Tentando fallback de download direto:', err);
        } else {
          // Usuário apenas fechou a janela de compartilhamento
          return;
        }
      }
    }

    // 2. Fallback sem abrir nova aba (usa target="_self")
    if (state.generatedBlobUrl) {
      fallbackDownloadLink.href = state.generatedBlobUrl;
      fallbackDownloadLink.download = state.outputFileName;
      fallbackDownloadLink.target = '_self';
      fallbackDownloadLink.classList.remove('hidden');
      fallbackDownloadLink.click();
    }
  }

  // Listener para o botão principal "📥 Salvar / Compartilhar PDF no iPhone"
  primarySaveBtn.addEventListener('click', () => {
    triggerNativeSaveOrShare();
  });

  /**
   * Processamento e Criação do Documento PDF A4
   */
  generatePdfBtn.addEventListener('click', async () => {
    if (!state.dataUrl) {
      showError('Nenhuma imagem foi selecionada.');
      return;
    }

    loadingOverlay.classList.remove('hidden');

    setTimeout(async () => {
      try {
        const { jsPDF } = window.jspdf;

        let finalDataUrl = state.dataUrl;
        let finalWidth = state.width;
        let finalHeight = state.height;

        if (state.rotation !== 0) {
          const canvas = getRotatedImageCanvas(imagePreview, state.rotation);
          finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          finalWidth = canvas.width;
          finalHeight = canvas.height;
        }

        const isLandscape = finalWidth > finalHeight;
        const pdfOrientation = isLandscape ? 'l' : 'p';
        const pageW = isLandscape ? 297 : 210;
        const pageH = isLandscape ? 210 : 297;

        const margin = 10;
        const availW = pageW - margin * 2;
        const availH = pageH - margin * 2;

        const scale = Math.min(availW / finalWidth, availH / finalHeight);
        const renderW = finalWidth * scale;
        const renderH = finalHeight * scale;
        const posX = (pageW - renderW) / 2;
        const posY = (pageH - renderH) / 2;

        const pdf = new jsPDF({
          orientation: pdfOrientation,
          unit: 'mm',
          format: 'a4'
        });

        let imgFormat = 'JPEG';
        if (state.fileName.toLowerCase().endsWith('.png')) {
          imgFormat = 'PNG';
        }

        pdf.addImage(finalDataUrl, imgFormat, posX, posY, renderW, renderH);

        const outputFileName = generateSmartFileName();
        state.outputFileName = outputFileName;

        // Gerar Blob e criar File Object para Web Share API
        const pdfBlob = pdf.output('blob');
        state.generatedBlobUrl = URL.createObjectURL(pdfBlob);
        state.generatedPdfFile = new File([pdfBlob], outputFileName, { type: 'application/pdf' });

        // Esconder area de geracao e exibir o card de acao do iOS
        downloadResultCard.classList.remove('hidden');

        setTimeout(() => {
          downloadResultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);

        // Disparar o menu de compartilhamento do iOS instantaneamente
        triggerNativeSaveOrShare();

      } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        showError('Ocorreu um erro ao gerar o PDF. Tente novamente.');
      } finally {
        loadingOverlay.classList.add('hidden');
      }
    }, 200);
  });
});
