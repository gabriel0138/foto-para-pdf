/**
 * 📸 Foto para PDF - App JS (PWA Mobile & iOS Safari)
 * Desenvolvido para máxima compatibilidade, suporte a múltiplas fotos e salvamento nativo.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos do DOM ---
  const imageInput = document.getElementById('imageInput');
  const dropZone = document.getElementById('dropZone');
  const galleryContainer = document.getElementById('galleryContainer');
  const photoCount = document.getElementById('photoCount');
  const thumbnailsList = document.getElementById('thumbnailsList');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const settingsCard = document.getElementById('settingsCard');
  const marginSelect = document.getElementById('marginSelect');
  const orientationSelect = document.getElementById('orientationSelect');
  const generateActionArea = document.getElementById('generateActionArea');
  const generatePdfBtn = document.getElementById('generatePdfBtn');
  const generateBtnText = document.getElementById('generateBtnText');
  const downloadResultCard = document.getElementById('downloadResultCard');
  const pdfDetailsText = document.getElementById('pdfDetailsText');
  const primarySaveBtn = document.getElementById('primarySaveBtn');
  const fallbackDownloadLink = document.getElementById('fallbackDownloadLink');
  const resetAllBtn = document.getElementById('resetAllBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const progressDetail = document.getElementById('progressDetail');
  const progressPercent = document.getElementById('progressPercent');
  const progressBarFill = document.getElementById('progressBar fill');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeColorMeta = document.getElementById('themeColorMeta');
  const pwaInstallBanner = document.getElementById('pwaInstallBanner');
  const pwaInstallBtn = document.getElementById('pwaInstallBtn');

  // --- Estado da Aplicação ---
  let state = {
    images: [], // Array: { id, name, dataUrl, width, height, rotation }
    margin: 10,
    orientationMode: 'auto',
    generatedPdfFile: null,
    generatedBlobUrl: null,
    outputFileName: ''
  };

  let deferredInstallPrompt = null;

  // --- 1. Gerenciamento de Tema (Modo Escuro / Claro) ---
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }

  function setDarkMode(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      themeIcon.textContent = '☀️';
      themeColorMeta.setAttribute('content', '#0f172a');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      themeIcon.textContent = '🌙';
      themeColorMeta.setAttribute('content', '#2563eb');
      localStorage.setItem('theme', 'light');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(!isDark);
  });

  initTheme();

  // --- 2. Registro do Service Worker PWA & Prompt de Instalação ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker PWA Registrado com sucesso:', reg.scope))
      .catch(err => console.log('Falha ao registrar Service Worker:', err));
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    pwaInstallBanner.classList.remove('hidden');
  });

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log(`Resultado da instalação PWA: ${outcome}`);
      deferredInstallPrompt = null;
      pwaInstallBanner.classList.add('hidden');
    });
  }

  // --- 3. Tratamento de Erros e Mensagens ---
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

  // --- 4. Leitura e Adição de Arquivos (Múltiplas Fotos / Drag & Drop) ---
  function processSelectedFiles(files) {
    clearError();
    downloadResultCard.classList.add('hidden');
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      return file.type.startsWith('image/') || file.name.match(/\.(heic|heif|jpg|jpeg|png|webp|gif)$/i);
    });

    if (validFiles.length === 0) {
      showError('Nenhum arquivo de imagem válido foi selecionado.');
      return;
    }

    let loadedCount = 0;

    validFiles.forEach(file => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const img = new Image();

        img.onload = () => {
          state.images.push({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: file.name || `foto_${state.images.length + 1}.jpg`,
            dataUrl: dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            rotation: 0
          });

          loadedCount++;
          if (loadedCount === validFiles.length) {
            renderGallery();
          }
        };

        img.onerror = () => {
          showError(`Erro ao carregar a imagem: ${file.name}`);
        };

        img.src = dataUrl;
      };

      reader.onerror = () => {
        showError(`Erro ao ler o arquivo: ${file.name}`);
      };

      reader.readAsDataURL(file);
    });

    // Reset no valor do input para permitir selecionar o mesmo arquivo novamente se desejar
    imageInput.value = '';
  }

  imageInput.addEventListener('change', (e) => {
    processSelectedFiles(e.target.files);
  });

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    processSelectedFiles(files);
  });

  // --- 5. Renderização da Galeria de Páginas ---
  function renderGallery() {
    thumbnailsList.innerHTML = '';
    const total = state.images.length;

    if (total === 0) {
      galleryContainer.classList.add('hidden');
      settingsCard.classList.add('hidden');
      generateActionArea.classList.add('hidden');
      return;
    }

    photoCount.textContent = total;
    generateBtnText.textContent = `Gerar PDF em A4 (${total} página${total > 1 ? 's' : ''})`;

    galleryContainer.classList.remove('hidden');
    settingsCard.classList.remove('hidden');
    generateActionArea.classList.remove('hidden');

    state.images.forEach((img, index) => {
      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition';

      const isFirst = index === 0;
      const isLast = index === total - 1;

      card.innerHTML = `
        <div class="flex items-center space-x-3 overflow-hidden flex-1">
          <!-- Número da Página -->
          <span class="w-7 h-7 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
            ${index + 1}
          </span>

          <!-- Preview da Miniatura -->
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
            <img 
              src="${img.dataUrl}" 
              alt="Página ${index + 1}"
              class="max-h-full max-w-full object-contain transition-transform duration-300"
              style="transform: rotate(${img.rotation}deg);"
            />
          </div>

          <!-- Informações do Arquivo -->
          <div class="truncate text-xs">
            <p class="font-bold text-slate-800 dark:text-slate-200 truncate" title="${img.name}">${img.name}</p>
            <p class="text-slate-400 dark:text-slate-500 font-medium text-[11px] mt-0.5">${img.width} × ${img.height} px ${img.rotation > 0 ? `(${img.rotation}°)` : ''}</p>
          </div>
        </div>

        <!-- Barra de Ações Rápidas -->
        <div class="flex items-center space-x-1 flex-shrink-0">
          <!-- Girar -->
          <button 
            type="button"
            data-action="rotate"
            data-id="${img.id}"
            class="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-xl transition"
            title="Girar 90°"
          >
            🔄
          </button>

          <!-- Mover para Cima -->
          <button 
            type="button"
            data-action="move-up"
            data-index="${index}"
            ${isFirst ? 'disabled class="p-2 opacity-30 cursor-not-allowed"' : 'class="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-xl transition"'}
            title="Mover para cima"
          >
            ⬆️
          </button>

          <!-- Mover para Baixo -->
          <button 
            type="button"
            data-action="move-down"
            data-index="${index}"
            ${isLast ? 'disabled class="p-2 opacity-30 cursor-not-allowed"' : 'class="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-xl transition"'}
            title="Mover para baixo"
          >
            ⬇️
          </button>

          <!-- Remover Foto -->
          <button 
            type="button"
            data-action="remove"
            data-id="${img.id}"
            class="p-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl transition"
            title="Remover esta foto"
          >
            🗑️
          </button>
        </div>
      `;

      thumbnailsList.appendChild(card);
    });

    // Rolagem suave até a lista se for a primeira imagem adicionada
    if (total === 1) {
      setTimeout(() => {
        galleryContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }

  // Event Delegation para Ações nas Fotos da Galeria
  thumbnailsList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === 'rotate') {
      const id = btn.dataset.id;
      const img = state.images.find(item => item.id === id);
      if (img) {
        img.rotation = (img.rotation + 90) % 360;
        renderGallery();
      }
    } else if (action === 'move-up') {
      const index = parseInt(btn.dataset.index, 10);
      if (index > 0) {
        const temp = state.images[index];
        state.images[index] = state.images[index - 1];
        state.images[index - 1] = temp;
        renderGallery();
      }
    } else if (action === 'move-down') {
      const index = parseInt(btn.dataset.index, 10);
      if (index < state.images.length - 1) {
        const temp = state.images[index];
        state.images[index] = state.images[index + 1];
        state.images[index + 1] = temp;
        renderGallery();
      }
    } else if (action === 'remove') {
      const id = btn.dataset.id;
      state.images = state.images.filter(item => item.id !== id);
      renderGallery();
    }
  });

  clearAllBtn.addEventListener('click', () => {
    state.images = [];
    renderGallery();
    downloadResultCard.classList.add('hidden');
  });

  resetAllBtn.addEventListener('click', () => {
    state.images = [];
    renderGallery();
    downloadResultCard.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- 6. Rotação via Canvas Auxiliar ---
  function getRotatedCanvas(imgDataUrl, angle) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        if (angle === 90 || angle === 270) {
          canvas.width = h;
          canvas.height = w;
        } else {
          canvas.width = w;
          canvas.height = h;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(img, -w / 2, -h / 2);

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          width: canvas.width,
          height: canvas.height
        });
      };
      img.onerror = reject;
      img.src = imgDataUrl;
    });
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

  // --- 7. Salvamento e Compartilhamento Nativo (iOS Safari / Android) ---
  async function triggerNativeSaveOrShare() {
    if (!state.generatedPdfFile) return;

    if (navigator.canShare && navigator.canShare({ files: [state.generatedPdfFile] })) {
      try {
        await navigator.share({
          files: [state.generatedPdfFile],
          title: state.outputFileName,
          text: 'PDF gerado com Foto para PDF PWA'
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Fallback para download direto:', err);
        } else {
          return; // Usuário cancelou o compartilhamento
        }
      }
    }

    // Fallback de download direto se navigator.share não estiver disponível
    if (state.generatedBlobUrl) {
      fallbackDownloadLink.href = state.generatedBlobUrl;
      fallbackDownloadLink.download = state.outputFileName;
      fallbackDownloadLink.target = '_self';
      fallbackDownloadLink.classList.remove('hidden');
      fallbackDownloadLink.click();
    }
  }

  primarySaveBtn.addEventListener('click', () => {
    triggerNativeSaveOrShare();
  });

  // --- 8. Geração do Documento PDF Multipágina ---
  generatePdfBtn.addEventListener('click', async () => {
    if (state.images.length === 0) {
      showError('Nenhuma foto selecionada.');
      return;
    }

    const marginValue = parseFloat(marginSelect.value);
    const orientationMode = orientationSelect.value;

    loadingOverlay.classList.remove('hidden');
    progressPercent.textContent = '0%';
    progressBarFill.style.width = '0%';
    progressDetail.textContent = 'Iniciando compilação do PDF...';

    setTimeout(async () => {
      try {
        const { jsPDF } = window.jspdf;
        let pdf = null;

        const totalImages = state.images.length;

        for (let i = 0; i < totalImages; i++) {
          const item = state.images[i];

          // Atualiza o progresso visual
          const percent = Math.round(((i + 1) / totalImages) * 100);
          progressPercent.textContent = `${percent}%`;
          progressBarFill.style.width = `${percent}%`;
          progressDetail.textContent = `Processando foto ${i + 1} de ${totalImages}...`;

          // Processa rotação se necessário
          let finalDataUrl = item.dataUrl;
          let finalWidth = item.width;
          let finalHeight = item.height;

          if (item.rotation !== 0) {
            const rotated = await getRotatedCanvas(item.dataUrl, item.rotation);
            finalDataUrl = rotated.dataUrl;
            finalWidth = rotated.width;
            finalHeight = rotated.height;
          }

          // Define orientação da folha A4
          let isLandscape = false;
          if (orientationMode === 'auto') {
            isLandscape = finalWidth > finalHeight;
          } else if (orientationMode === 'landscape') {
            isLandscape = true;
          } else {
            isLandscape = false;
          }

          const pageOrientation = isLandscape ? 'l' : 'p';
          const pageW = isLandscape ? 297 : 210; // A4 em mm
          const pageH = isLandscape ? 210 : 297;

          const availW = pageW - marginValue * 2;
          const availH = pageH - marginValue * 2;

          const scale = Math.min(availW / finalWidth, availH / finalHeight);
          const renderW = finalWidth * scale;
          const renderH = finalHeight * scale;
          const posX = (pageW - renderW) / 2;
          const posY = (pageH - renderH) / 2;

          if (i === 0) {
            pdf = new jsPDF({
              orientation: pageOrientation,
              unit: 'mm',
              format: 'a4'
            });
          } else {
            pdf.addPage('a4', pageOrientation);
          }

          let imgFormat = 'JPEG';
          if (item.name.toLowerCase().endsWith('.png')) {
            imgFormat = 'PNG';
          }

          pdf.addImage(finalDataUrl, imgFormat, posX, posY, renderW, renderH, undefined, 'FAST');
        }

        const outputFileName = generateSmartFileName();
        state.outputFileName = outputFileName;

        // Gerar o arquivo Blob final
        const pdfBlob = pdf.output('blob');
        if (state.generatedBlobUrl) {
          URL.revokeObjectURL(state.generatedBlobUrl);
        }
        state.generatedBlobUrl = URL.createObjectURL(pdfBlob);
        state.generatedPdfFile = new File([pdfBlob], outputFileName, { type: 'application/pdf' });

        const sizeInMb = (pdfBlob.size / (1024 * 1024)).toFixed(2);
        const sizeDisplay = sizeInMb > 0.9 ? `${sizeInMb} MB` : `${Math.round(pdfBlob.size / 1024)} KB`;

        pdfDetailsText.textContent = `${totalImages} página${totalImages > 1 ? 's' : ''} • Tamanho: ${sizeDisplay}`;

        downloadResultCard.classList.remove('hidden');

        setTimeout(() => {
          downloadResultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);

        // Dispara o menu nativo de compartilhamento/salvamento do dispositivo
        triggerNativeSaveOrShare();

      } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        showError('Ocorreu um erro ao compilar o PDF. Tente novamente.');
      } finally {
        loadingOverlay.classList.add('hidden');
      }
    }, 250);
  });
});
