/**
 * 📸 Gerador de PDF (Foto para PDF A4) - Otimizado para iOS / Safari
 * Arquitetura de Download Robusta & Seletor de Arquivos Inteligente
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
  const downloadPdfLink = document.getElementById('downloadPdfLink');
  const sharePdfBtn = document.getElementById('sharePdfBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileDimensionsDisplay = document.getElementById('fileDimensionsDisplay');

  // Estado local
  let state = {
    dataUrl: null,
    fileName: '',
    width: 0,
    height: 0,
    rotation: 0,
    generatedBlob: null,
    generatedFileName: ''
  };

  // Registra Service Worker PWA
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
   * Seletor Inteligente: Lê o arquivo escolhido da Galeria, Câmera ou app Arquivos
   */
  imageInput.addEventListener('change', (e) => {
    clearError();
    downloadResultCard.classList.add('hidden');
    const file = e.target.files[0];

    if (!file) return;

    // Se for arquivo de imagem
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
      showError('Por favor selecione um arquivo de imagem (JPG, PNG, HEIC).');
      imageInput.value = '';
    }
  });

  /**
   * Girar imagem 90°
   */
  rotateBtn.addEventListener('click', () => {
    if (!state.dataUrl) return;
    state.rotation = (state.rotation + 90) % 360;
    imagePreview.style.transform = `rotate(${state.rotation}deg)`;
  });

  /**
   * Transforma a rotação visual em um Canvas físico
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
   * Nomeação automática inteligente
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
   * Geração e Download Robusto para iOS Safari
   */
  generatePdfBtn.addEventListener('click', async () => {
    if (!state.dataUrl) {
      showError('Nenhuma imagem foi selecionada.');
      return;
    }

    loadingOverlay.classList.remove('hidden');

    setTimeout(() => {
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

        // Orientação proporcional A4
        const isLandscape = finalWidth > finalHeight;
        const pdfOrientation = isLandscape ? 'l' : 'p';
        const pageW = isLandscape ? 297 : 210;
        const pageH = isLandscape ? 210 : 297;

        // Margem de 10mm
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
        state.generatedFileName = outputFileName;

        // 🟢 MECANISMO ROBUSTO iOS: Gerar Blob em vez de disparar doc.save() direto
        const pdfBlob = pdf.output('blob');
        state.generatedBlob = pdfBlob;

        const blobUrl = URL.createObjectURL(pdfBlob);

        // Configurar o botão explícito de download
        downloadPdfLink.href = blobUrl;
        downloadPdfLink.download = outputFileName;

        // Configurar Web Share API para salvar no app "Arquivos" do iOS se disponível
        const pdfFile = new File([pdfBlob], outputFileName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          sharePdfBtn.classList.remove('hidden');
          sharePdfBtn.onclick = async () => {
            try {
              await navigator.share({
                files: [pdfFile],
                title: 'Salvar PDF',
                text: 'Seu documento em formato PDF'
              });
            } catch (shareErr) {
              console.log('Compartilhamento cancelado ou não suportado:', shareErr);
            }
          };
        } else {
          sharePdfBtn.classList.add('hidden');
        }

        // Tentar disparo automático suave de download
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = outputFileName;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        // Exibir o card permanente com os botões de ação
        downloadResultCard.classList.remove('hidden');

        setTimeout(() => {
          downloadResultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);

      } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        showError('Ocorreu um erro ao gerar o PDF. Tente novamente.');
      } finally {
        loadingOverlay.classList.add('hidden');
      }
    }, 200);
  });
});
