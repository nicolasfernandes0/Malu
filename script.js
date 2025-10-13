// ** IMPORTANTE: Substitua com seu Token de Acesso Público do Mapbox **
// Obtenha um em https://account.mapbox.com/access-tokens/
mapboxgl.accessToken = 'pk.eyJ1Ijoibmljb2xhc2Zlcm5hbmRlczEyIiwiYSI6ImNtY3dsZGNrNzAyMGkybHB1OWN0ODkwMTQifQ.-K168UuY3iggPhhV_Xsu9Q'; 

// Sistema de Música Melhorado
class MusicPlayer {
  constructor() {
    this.audio = document.getElementById('musicaFesta');
    this.isPlaying = false;
    this.currentTrack = 0;
    this.isShuffled = false;
    this.repeatMode = 0; // 0: não repetir, 1: repetir lista, 2: repetir música
    this.volume = 0.5;
    
    this.initializeElements();
    this.setupEventListeners();
    this.setupPlaylist();
    this.updateVisualizer();
  }

  initializeElements() {
    // Elementos do player
    this.musicPlayer = document.getElementById('musicPlayer');
    this.musicToggle = document.getElementById('musicToggle');
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.playPauseIcon = document.getElementById('playPauseIcon');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.shuffleBtn = document.getElementById('shuffleBtn');
    this.repeatBtn = document.getElementById('repeatBtn');
    this.progressContainer = document.getElementById('progressContainer');
    this.progressBar = document.getElementById('progressBar');
    this.currentTimeEl = document.getElementById('currentTime');
    this.durationEl = document.getElementById('duration');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.visualizer = document.getElementById('visualizer');
    this.bars = this.visualizer.querySelectorAll('.bar');
    this.playlistItems = document.querySelectorAll('.playlist-item');
    this.currentSongTitle = document.getElementById('currentSongTitle');
    this.currentSongArtist = document.getElementById('currentSongArtist');
    
    // Configuração inicial
    this.audio.volume = this.volume;
    this.volumeSlider.value = this.volume * 100;
  }

  setupEventListeners() {
    // Toggle do player
    this.musicToggle.addEventListener('click', () => {
      this.musicPlayer.classList.toggle('expanded');
    });

    // Controles principais
    this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.previousTrack());
    this.nextBtn.addEventListener('click', () => this.nextTrack());
    this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
    this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

    // Barra de progresso
    this.progressContainer.addEventListener('click', (e) => this.setProgress(e));

    // Controle de volume
    this.volumeSlider.addEventListener('input', (e) => {
      this.volume = e.target.value / 100;
      this.audio.volume = this.volume;
    });

    // Eventos do áudio
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.handleTrackEnd());
    this.audio.addEventListener('play', () => this.updatePlayState(true));
    this.audio.addEventListener('pause', () => this.updatePlayState(false));

    // Clique fora para fechar
    document.addEventListener('click', (e) => {
      if (!this.musicPlayer.contains(e.target)) {
        this.musicPlayer.classList.remove('expanded');
      }
    });
  }

  setupPlaylist() {
    this.playlistItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.playTrack(index);
      });
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(e => {
        console.error("Erro ao reproduzir música:", e);
        this.showMusicError();
      });
    }
  }

  playTrack(index) {
    this.currentTrack = index;
    const trackSrc = this.playlistItems[index].getAttribute('data-src');
    const trackName = this.playlistItems[index].querySelector('span').textContent;
    
    // Atualiza a fonte do áudio se necessário
    if (this.audio.src !== trackSrc) {
      this.audio.src = trackSrc;
    }

    // Atualiza a UI da playlist
    this.playlistItems.forEach(item => item.classList.remove('active'));
    this.playlistItems[index].classList.add('active');

    // Atualiza informações da música
    this.currentSongTitle.textContent = trackName;

    // Toca a música
    this.audio.play().catch(e => {
      console.error("Erro ao reproduzir música:", e);
      this.showMusicError();
    });
  }

  nextTrack() {
    let nextIndex;
    if (this.isShuffled) {
      nextIndex = Math.floor(Math.random() * this.playlistItems.length);
    } else {
      nextIndex = (this.currentTrack + 1) % this.playlistItems.length;
    }
    this.playTrack(nextIndex);
  }

  previousTrack() {
    let prevIndex = this.currentTrack - 1;
    if (prevIndex < 0) prevIndex = this.playlistItems.length - 1;
    this.playTrack(prevIndex);
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    this.shuffleBtn.classList.toggle('active', this.isShuffled);
  }

  toggleRepeat() {
    this.repeatMode = (this.repeatMode + 1) % 3;
    const icons = ['fa-redo', 'fa-sync', 'fa-redo-alt'];
    const titles = ['Não repetir', 'Repetir lista', 'Repetir música'];
    
    this.repeatBtn.innerHTML = `<i class="fas ${icons[this.repeatMode]}"></i>`;
    this.repeatBtn.title = titles[this.repeatMode];
    this.repeatBtn.classList.toggle('active', this.repeatMode > 0);
  }

  setProgress(e) {
    const rect = this.progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.audio.currentTime = percent * this.audio.duration;
  }

  updateProgress() {
    const progress = (this.audio.currentTime / this.audio.duration) * 100;
    this.progressBar.style.width = `${progress}%`;
    
    this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
  }

  updateDuration() {
    this.durationEl.textContent = this.formatTime(this.audio.duration);
  }

  updatePlayState(playing) {
    this.isPlaying = playing;
    this.musicToggle.classList.toggle('playing', playing);
    this.playPauseIcon.className = playing ? 'fas fa-pause' : 'fas fa-play';
  }

  handleTrackEnd() {
    if (this.repeatMode === 2) {
      // Repetir música atual
      this.audio.currentTime = 0;
      this.audio.play();
    } else if (this.repeatMode === 1 || this.currentTrack < this.playlistItems.length - 1) {
      // Próxima música ou voltar ao início
      this.nextTrack();
    } else {
      // Parar no final
      this.updatePlayState(false);
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  updateVisualizer() {
    // Simulação de visualizador de áudio
    const updateBars = () => {
      this.bars.forEach((bar, index) => {
        if (this.isPlaying) {
          const height = 5 + Math.random() * 25;
          bar.style.height = `${height}px`;
        } else {
          bar.style.height = '5px';
        }
      });
    };

    setInterval(updateBars, 100);
  }

  showMusicError() {
    // Mostra mensagem de erro temporária
    const originalTitle = this.currentSongTitle.textContent;
    this.currentSongTitle.textContent = 'Erro ao carregar música';
    this.currentSongTitle.style.color = 'var(--oscar-red)';
    
    setTimeout(() => {
      this.currentSongTitle.textContent = originalTitle;
      this.currentSongTitle.style.color = '';
    }, 3000);
  }
}

// Lightbox functionality para a galeria grid
function setupGalleryLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  // Seleciona todas as imagens da galeria grid
  const galleryImages = document.querySelectorAll('.gallery-item img');
  let currentImageIndex = 0;
  
  // Abrir lightbox quando uma imagem é clicada
  galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => {
      if (img.complete && img.naturalHeight !== 0 && img.style.display !== 'none') {
        openLightbox(index);
      }
    });
  });
  
  // Fechar lightbox
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Navegação entre imagens
  prevBtn.addEventListener('click', showPrevImage);
  nextBtn.addEventListener('click', showNextImage);
  
  // Navegação com teclado
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      }
    }
  });
  
  function openLightbox(index) {
    currentImageIndex = index;
    const img = galleryImages[index];
    const imgSrc = img.getAttribute('src');
    const imgAlt = img.getAttribute('alt');
    
    // Obtém a legenda do elemento .gallery-caption
    const captionElement = img.closest('.gallery-item').querySelector('.gallery-caption');
    const imgCaption = captionElement ? captionElement.textContent : imgAlt;
    
    lightboxImage.setAttribute('src', imgSrc);
    lightboxImage.setAttribute('alt', imgAlt);
    lightboxCaption.textContent = imgCaption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  
  function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    const img = galleryImages[currentImageIndex];
    const imgSrc = img.getAttribute('src');
    const imgAlt = img.getAttribute('alt');
    
    const captionElement = img.closest('.gallery-item').querySelector('.gallery-caption');
    const imgCaption = captionElement ? captionElement.textContent : imgAlt;
    
    lightboxImage.setAttribute('src', imgSrc);
    lightboxImage.setAttribute('alt', imgAlt);
    lightboxCaption.textContent = imgCaption;
  }
  
  function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    const img = galleryImages[currentImageIndex];
    const imgSrc = img.getAttribute('src');
    const imgAlt = img.getAttribute('alt');
    
    const captionElement = img.closest('.gallery-item').querySelector('.gallery-caption');
    const imgCaption = captionElement ? captionElement.textContent : imgAlt;
    
    lightboxImage.setAttribute('src', imgSrc);
    lightboxImage.setAttribute('alt', imgAlt);
    lightboxCaption.textContent = imgCaption;
  }
}

// Inicialização principal
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar AOS (Animate On Scroll)
  AOS.init({
    duration: 1000,
    once: true,
    offset: 100
  });
  
  // Inicializar Particles.js
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#D4AF37" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#D4AF37",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true
        }
      }
    });
  }
  
  
  // Esconder loading screen após carregamento
  window.addEventListener('load', function() {
    setTimeout(function() {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 1000);
  });
  
  // Inicializar lightbox para a galeria
  setupGalleryLightbox();
  
  // Sistema de confirmação de presença
  const rsvpForm = document.getElementById('rsvp-form');
  const msgConfirmacao = document.getElementById('msg-confirmacao');
  const fallbackForm = document.getElementById('fallback-form');
  const getDirectionsBtn = document.getElementById('get-directions-btn');

  // Coordenadas do local para o Mapbox
  const venueCoords = [-46.58672328878314, -23.582845019784283];

  if(localStorage.getItem('formFailed')) {
    showFallback();
  }
  
  async function submitRSVP(e) {
    e.preventDefault();
    
    // Validação do formulário
    if (!rsvpForm.checkValidity()) {
      e.stopPropagation();
      rsvpForm.classList.add('was-validated');
      return;
    }
    
    const nome = document.getElementById('nome').value.trim();
    const acompanhantes = document.getElementById('acompanhantes').value;
    const nomesAcompanhantes = document.getElementById('nomesAcompanhantes').value.trim();
    const recado = document.getElementById('recado').value.trim();
    
    if (!nome || isNaN(acompanhantes) || acompanhantes < 0) {
      showMessage('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
      return;
    }
    
    showMessage('Enviando sua confirmação...', 'loading');
    
    try {
      const response = await fetch('https://api.sheetmonkey.io/form/pzJG2fUpSjbVf4FzQzxVB5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Nome: nome,
          Acompanhantes: acompanhantes,
          "Nomes dos Acompanhantes": nomesAcompanhantes,
          Recado: recado,
          Data: new Date().toLocaleString('pt-BR'),
          Origem: 'Site Aniversário'
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      localStorage.removeItem('formFailed');
      
      let successMessage = `Obrigada, ${nome}! Sua presença foi confirmada com ${acompanhantes} acompanhante(s).`;
      if (recado) {
        successMessage += ' Seu recado foi enviado com sucesso!';
      }
      showMessage(successMessage, 'success');
      rsvpForm.reset();
      rsvpForm.classList.remove('was-validated');
      
    } catch (error) {
      console.error('Erro ao enviar:', error);
      localStorage.setItem('formFailed', 'true');
      
      showMessage('Ocorreu um erro ao enviar sua confirmação.', 'error');
      showFallback();
    }
  }
  
  function showMessage(message, type) {
    if (msgConfirmacao) {
      msgConfirmacao.textContent = message;
      msgConfirmacao.style.color = type === 'error' ? '#e74c3c' : 
                                    type === 'success' ? '#27ae60' : '#2c3e50';
      
      msgConfirmacao.style.opacity = '0';
      setTimeout(() => {
        msgConfirmacao.style.transition = 'opacity 0.5s ease';
        msgConfirmacao.style.opacity = '1';
      }, 10);
    }
  }
  
  function showFallback() {
    if (fallbackForm) {
      fallbackForm.style.display = 'block';
    }
  }
  
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', submitRSVP);
  }

  // Inicializar o mapa do Mapbox
  if (typeof mapboxgl !== 'undefined') {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: venueCoords,
      zoom: 15
    });

    // Adicionar um marcador ao mapa
    new mapboxgl.Marker()
      .setLngLat(venueCoords)
      .setPopup(new mapboxgl.Popup().setHTML("<h3>Casa Helenya</h3><p>Av. Paes de Barros, 3670</p>"))
      .addTo(map);
  }

  // Definir o link de direções do Google Maps
  if (getDirectionsBtn) {
    getDirectionsBtn.href = `http://maps.google.com/maps?q=${venueCoords[1]},${venueCoords[0]}&travelmode=driving`;
  }
  
  // Inicializar o player de música
  window.musicPlayer = new MusicPlayer();
  
  // Manter a função global para compatibilidade
  window.toggleMusic = () => {
    window.musicPlayer.togglePlay();
  };
});

// Contador regressivo
function atualizarContagem() {
  const evento = new Date("July 12, 2026 10:30:00 GMT-0300").getTime(); 
  const agora = new Date().getTime();
  const distancia = evento - agora;

  const countdownElement = document.getElementById("countdown");
  if (!countdownElement) return;

  if (distancia <= 0) {
    countdownElement.innerHTML = "<div>É HOJE! 🎉</div>";
    return;
  }

  const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

  countdownElement.innerHTML =
    `<div>${dias}<br><small>dias</small></div>` +
    `<div>${horas}<br><small>horas</small></div>` +
    `<div>${minutos}<br><small>min</small></div>` +
    `<div>${segundos}<br><small>seg</small></div>`;
}

setInterval(atualizarContagem, 1000);
atualizarContagem();