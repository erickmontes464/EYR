// Music Player JavaScript
class MusicPlayer {
    constructor(containerId, audioId, playBtnId, favoriteBtnId, progressBarId, progressId,
                currentTimeId, durationId, volumeIconId, volumeSliderContainerId,
                volumeSliderFillId, volumePercentageId, albumCoverId) {
        this.isPlaying = false;
        this.isFavorite = false;
        this.volume = 0.7;
        this.showVolumeSlider = false;
        this.songInfo = {
            title: "Those Eyes",
            cover: "disco.png",
            audio: "https://dedicapag.com/es/PagNet/music/Those%20Eyes.mp3"
        };


        this.containerId = containerId;
        this.audioId = audioId;
        this.playBtnId = playBtnId;
        this.favoriteBtnId = favoriteBtnId;
        this.progressBarId = progressBarId;
        this.progressId = progressId;
        this.currentTimeId = currentTimeId;
        this.durationId = durationId;
        this.volumeIconId = volumeIconId;
        this.volumeSliderContainerId = volumeSliderContainerId;
        this.volumeSliderFillId = volumeSliderFillId;
        this.volumePercentageId = volumePercentageId;
        this.albumCoverId = albumCoverId;

        this.initializeElements();
        this.attachEventListeners();
        this.updateVolumeDisplay();
        this.checkAudioAvailability();
    }
    initializeSharedAudio() {
        // Solo actualizar las referencias de tiempo y progreso
        this.audioPlayer.addEventListener('timeupdate', () => {
            if (this.player.style.display !== 'none' && this.player.closest('#music-player-section')?.style.display === 'block') {
                this.currentTime = this.audioPlayer.currentTime;
                this.updateProgress();
            }
        });
    }

    initializeElements() {
        this.player = document.getElementById(this.containerId);
        this.audioPlayer = document.getElementById(this.audioId);
        this.playBtn = document.getElementById(this.playBtnId);
        this.favoriteBtn = document.getElementById(this.favoriteBtnId);
        this.progressBar = document.getElementById(this.progressBarId);
        this.progress = document.getElementById(this.progressId);
        this.currentTimeEl = document.getElementById(this.currentTimeId);
        this.durationEl = document.getElementById(this.durationId);
        this.albumCover = document.getElementById(this.albumCoverId);
        this.volumeIcon = document.getElementById(this.volumeIconId);
        this.volumeSliderContainer = document.getElementById(this.volumeSliderContainerId);
        this.volumeSliderFill = document.getElementById(this.volumeSliderFillId);
        this.volumePercentage = document.getElementById(this.volumePercentageId);

        // Set initial volume
        this.audioPlayer.volume = this.volume;
    }

    checkAudioAvailability() {
        // Check if audio file is accessible
        fetch(this.songInfo.audio, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    console.error(`Audio file not accessible: ${this.songInfo.audio}, Status: ${response.status}`);
                } else {
                    console.log(`Audio file found: ${this.songInfo.audio}`);
                }
            })
            .catch(error => {
                console.error(`Error checking audio file: ${this.songInfo.audio}`, error);
            });
    }

    attachEventListeners() {
        this.audioPlayer.addEventListener('loadedmetadata', () => {
            this.updateDurationDisplay();
        });

        this.audioPlayer.addEventListener('canplay', () => {
            this.updateDurationDisplay();
        });

        this.audioPlayer.addEventListener('timeupdate', () => {
            this.currentTime = this.audioPlayer.currentTime;
            this.updateProgress();
        });

        this.audioPlayer.addEventListener('ended', () => {
            this.togglePlay();
        });

        this.audioPlayer.addEventListener('error', (e) => {
            console.error('Audio playback error:', e);
            console.error('Error code:', this.audioPlayer.error.code);
            console.error('Error message:', this.audioPlayer.error.message);
        });

        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        this.albumCover.addEventListener('click', () => this.togglePlay());
        this.volumeIcon.addEventListener('click', () => this.toggleVolumeSlider());

        const volumeSliderVertical = this.volumeSliderContainer.querySelector('.volume-slider-vertical');
        if (volumeSliderVertical) {
            volumeSliderVertical.addEventListener('click', (e) => this.setVolumeFromVerticalBar(e));
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.volume-controls')) {
                this.hideVolumeSlider();
            }
        });
    }

    // Reemplazar syncWith() con esta función más simple
    linkPlayers(otherPlayer) {
        // Solo sincroniza estados visuales, no el audio
        this.isPlaying = otherPlayer.isPlaying;
        this.isFavorite = otherPlayer.isFavorite;
        this.volume = otherPlayer.volume;

        // Actualizar UI sin tocar el audio
        if (this.isPlaying) {
            this.playBtn.innerHTML = `
            <svg class="pause-icon-svg" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
        `;
            this.player.classList.add('playing');
        } else {
            this.playBtn.innerHTML = `
            <svg class="play-icon-svg" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;
            this.player.classList.remove('playing');
        }

        this.favoriteBtn.textContent = this.isFavorite ? '❤' : '♡';
        this.favoriteBtn.classList.toggle('active', this.isFavorite);
        this.updateVolumeDisplay();
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.playBtn.innerHTML = `
            <svg class="pause-icon-svg" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
        `;

            // Fix for audio quality issues after pause/resume
            const currentTime = this.audioPlayer.currentTime;
            const playPromise = this.audioPlayer.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Audio started successfully
                        this.player.classList.add('playing');
                    })
                    .catch(error => {
                        console.error('Error playing audio:', error);
                        // Try to fix audio issues by slightly adjusting currentTime
                        this.audioPlayer.currentTime = currentTime + 0.01;
                        setTimeout(() => {
                            this.audioPlayer.play()
                                .then(() => {
                                    this.player.classList.add('playing');
                                })
                                .catch(retryError => {
                                    console.error('Retry play failed:', retryError);
                                    this.isPlaying = false;
                                    this.playBtn.innerHTML = `
                                    <svg class="play-icon-svg" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                `;
                                    this.player.classList.remove('playing');
                                });
                        }, 100);
                    });
            } else {
                this.player.classList.add('playing');
            }
        } else {
            this.playBtn.innerHTML = `
            <svg class="play-icon-svg" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;
            this.audioPlayer.pause();
            this.player.classList.remove('playing');

            // Small delay to ensure proper pause state
            setTimeout(() => {
                if (!this.isPlaying) {
                    this.audioPlayer.currentTime = this.audioPlayer.currentTime;
                }
            }, 50);
        }

        // Sync with other player
        // Cambiar estas líneas al final de togglePlay():
        if (window.profilePlayer && this !== window.profilePlayer) {
            window.profilePlayer.linkPlayers(this);
        } else if (window.musicPlayer && this !== window.musicPlayer) {
            window.musicPlayer.linkPlayers(this);
        }
    }
// Agregar esta función después del constructor
    resetAudioBuffer() {
        const currentTime = this.audioPlayer.currentTime;
        const wasPlaying = !this.audioPlayer.paused;

        this.audioPlayer.load();
        this.audioPlayer.currentTime = currentTime;

        if (wasPlaying) {
            this.audioPlayer.play().catch(error => {
                console.error('Error resetting audio buffer:', error);
            });
        }
    }

    toggleFavorite() {
        this.isFavorite = !this.isFavorite;
        this.favoriteBtn.textContent = this.isFavorite ? '❤' : '♡';
        this.favoriteBtn.classList.toggle('active', this.isFavorite);

        if (window.profilePlayer && this !== window.profilePlayer) {
            window.profilePlayer.isFavorite = this.isFavorite;
            window.profilePlayer.favoriteBtn.textContent = this.isFavorite ? '❤' : '♡';
            window.profilePlayer.favoriteBtn.classList.toggle('active', this.isFavorite);
        } else if (window.musicPlayer && this !== window.musicPlayer) {
            window.musicPlayer.isFavorite = this.isFavorite;
            window.musicPlayer.favoriteBtn.textContent = this.isFavorite ? '❤' : '♡';
            window.musicPlayer.favoriteBtn.classList.toggle('active', this.isFavorite);
        }
    }

    seekTo(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * this.audioPlayer.duration;

        // Ensure clean seek
        this.audioPlayer.currentTime = newTime;
        this.currentTime = newTime;

        // Force a small buffer refresh to prevent audio quality issues
        if (this.isPlaying) {
            const playPromise = this.audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error after seek:', error);
                    setTimeout(() => {
                        this.audioPlayer.play();
                    }, 50);
                });
            }
        }

        this.updateProgress();

        // Sync with other player
        if (window.profilePlayer && this !== window.profilePlayer) {
            window.profilePlayer.audioPlayer.currentTime = newTime;
        } else if (window.musicPlayer && this !== window.musicPlayer) {
            window.musicPlayer.audioPlayer.currentTime = newTime;
        }
    }

    toggleVolumeSlider() {
        this.showVolumeSlider = !this.showVolumeSlider;
        if (this.showVolumeSlider) {
            this.volumeSliderContainer.classList.add('show');
        } else {
            this.volumeSliderContainer.classList.remove('show');
        }
    }

    hideVolumeSlider() {
        this.showVolumeSlider = false;
        this.volumeSliderContainer.classList.remove('show');
    }

    setVolumeFromVerticalBar(e) {
        const rect = e.target.getBoundingClientRect();
        const percent = (rect.bottom - e.clientY) / rect.height;
        this.setVolume(percent);
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.audioPlayer.volume = this.volume;
        this.updateVolumeDisplay();

        if (window.profilePlayer && this !== window.profilePlayer) {
            window.profilePlayer.volume = this.volume;
            window.profilePlayer.audioPlayer.volume = this.volume;
            window.profilePlayer.updateVolumeDisplay();
        } else if (window.musicPlayer && this !== window.musicPlayer) {
            window.musicPlayer.volume = this.volume;
            window.musicPlayer.audioPlayer.volume = this.volume;
            window.musicPlayer.updateVolumeDisplay();
        }
    }

    updateVolumeDisplay() {
        this.volumeSliderFill.style.height = (this.volume * 100) + '%';
        this.volumePercentage.textContent = Math.round(this.volume * 100) + '%';
    }

    updateProgress() {
        const percent = (this.currentTime / this.audioPlayer.duration) * 100;
        this.progress.style.width = percent + '%';
        this.currentTimeEl.textContent = this.formatTime(this.currentTime);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    updateDurationDisplay() {
        if (this.audioPlayer.duration && !isNaN(this.audioPlayer.duration) && this.audioPlayer.duration > 0) {
            this.duration = this.audioPlayer.duration;
            this.durationEl.textContent = this.formatTime(this.duration);
        }
    }
}

// Netflix Interface JavaScript
document.addEventListener('DOMContentLoaded', function() {
    window.profilePlayer = new MusicPlayer('player', 'audioPlayer', 'playBtn', 'favoriteBtn',
        'progressBar', 'progress', 'currentTime', 'duration', 'volumeIcon',
        'volumeSliderContainer', 'volumeSliderFill', 'volumePercentage', 'albumCover');

    window.musicPlayer = new MusicPlayer('music-section-player', 'musicAudioPlayer', 'musicPlayBtn',
        'musicFavoriteBtn', 'musicProgressBar', 'musicProgress', 'musicCurrentTime',
        'musicDuration', 'musicVolumeIcon', 'musicVolumeSliderContainer',
        'musicVolumeSliderFill', 'musicVolumePercentage', 'musicAlbumCover');
    window.musicPlayer.audioPlayer = window.profilePlayer.audioPlayer;
    window.musicPlayer.initializeSharedAudio();

    let wasMusicPlaying = false;
    const profileSelection = document.getElementById('profile-selection');
    const seriesDetail = document.getElementById('series-detail');
    const backButton = document.getElementById('back-to-profiles');
    const profileCards = document.querySelectorAll('.profile-card');
    const navItems = document.querySelectorAll('.nav-item');
    const playButton = document.getElementById('play-button');
    const infoButton = document.getElementById('info-button');
    const infoModal = document.getElementById('info-modal');
    const closeModal = document.getElementById('close-modal');
    const episodeModal = document.getElementById('episode-modal');
    const closeEpisodeModal = document.getElementById('close-episode-modal');
    const episodeModalImage = document.getElementById('episode-modal-image');
    const episodeModalTitle = document.getElementById('episode-modal-title');
    const episodeModalDescription = document.getElementById('episode-modal-description');
    const videoPlayer = document.getElementById('video-player');
    const closeVideo = document.getElementById('close-video');
    const romanticVideo = document.getElementById('romantic-video');
    const episodeThumbs = document.querySelectorAll('.episode-thumb');
    const heroSection = document.querySelector('.hero-section');
    const episodesSection = document.querySelector('.episodes-section');
    const musicPlayerSection = document.getElementById('music-player-section');
    const startDate = new Date('2024-01-01T00:00:00');
    let counterInterval;

    const episodeData = {"1":{"title":"1. Nuestro Viaje a Tarapoto","description":"El destino nos permiti\u00f3 conocer este hermoso lugar m\u00e1gico y maravilloso con Carmen. TE AMO <3"}};

    profileCards.forEach(card => {
        card.addEventListener('click', function() {
            profileSelection.style.opacity = '0';
            setTimeout(() => {
                profileSelection.style.display = 'none';
                seriesDetail.style.display = 'flex';
                setTimeout(() => {
                    seriesDetail.classList.add('fade-in');
                }, 10);
            }, 300);
        });
    });

    backButton.addEventListener('click', function() {
        seriesDetail.classList.remove('fade-in');
        seriesDetail.style.display = 'none';
        setTimeout(() => {
            profileSelection.style.display = 'flex';
            setTimeout(() => {
                profileSelection.style.opacity = '1';
            }, 10);
        }, 300);
        romanticVideo.pause();
    });

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const navType = this.getAttribute('data-nav');
            updateSection(navType);
        });
    });

    function updateSection(section) {
        heroSection.className = 'hero-section ' + section;
        const seriesLabel = document.querySelector('.series-label');
        const seriesTitle = document.querySelector('.series-title');
        const yearDuration = document.querySelector('.year-duration');
        const seriesDescription = document.querySelector('.series-description');
        const episodesTitle = document.querySelector('.episodes-title');
        const episodesRow = document.querySelector('.episodes-row');
        playButton.style.display = 'none';
        infoButton.style.display = 'none';
        episodesSection.style.display = 'none';
        musicPlayerSection.style.display = 'none';
        let listaContent = document.querySelector('.lista-content');
        if (listaContent) listaContent.remove();
        let sectionText = document.querySelector('.section-text');
        if (sectionText) sectionText.remove();

        if (section === 'inicio') {
            seriesLabel.style.display = 'flex';
            seriesLabel.innerHTML = '<span class="n-letter">N</span><span class="series-text">SERIE</span>';
            seriesTitle.textContent = 'Un poquito de nosotros';
            yearDuration.innerHTML = '13+ 2024 • 1 episodios • Romance • Drama';
            seriesDescription.innerHTML = 'Eres el tesoro más valioso que tengo, prometo cuidarte y estar contigo en las buenas y en las malas. El amor es una decisión y yo decido estar contigo el resto de mi vida. Te amo como nunca lo he hecho, mi amor ♥';
            playButton.style.display = 'flex';
            infoButton.style.display = 'flex';
            episodesSection.style.display = 'block';
            episodesTitle.textContent = 'Episodios';
            episodesRow.innerHTML = `                        <div class="episode-thumb" data-episode="1" data-image="https://f004.backblazeb2.com/file/Dedicapag-Net-2025/episodes%2F697a5aafa6929_IMG_0285.png">
                            <img src="https://f004.backblazeb2.com/file/Dedicapag-Net-2025/episodes%2F697a5aafa6929_IMG_0285.png" alt="Episodio 1">
                            <div class="episode-number">1</div>
                            <div class="episode-duration">25m</div>
                            <div class="episode-overlay">1. Nuestro Viaje a Tarapoto</div>
                        </div>
                    `;
            attachEpisodeListeners();
        } else if (section === 'series') {
            seriesLabel.style.display = 'none';
            seriesTitle.textContent = 'Series';
            yearDuration.innerHTML = '';
            seriesDescription.textContent = '';
            heroSection.querySelector('.series-content').style.display = 'block';
            let sectionText = document.createElement('p');
            sectionText.className = 'section-text';
            sectionText.textContent = 'Contigo, cada instante se siente especial, como si el mundo se detuviera solo para vernos. Tus gestos, tus silencios… todo en ti escribe una historia que no necesita guion.';
            heroSection.appendChild(sectionText);
        } else if (section === 'musica') {
            seriesLabel.style.display = 'none';
            seriesTitle.textContent = 'Música';
            yearDuration.innerHTML = '';
            seriesDescription.textContent = '';
            heroSection.querySelector('.series-content').style.display = 'block';
            //let sectionText = document.createElement('p');
            //sectionText.className = 'section-text';
            //sectionText.textContent = 'Disfruta de una selección de canciones que capturan el espíritu del amor y la emoción.';
            // heroSection.appendChild(sectionText);
            musicPlayerSection.style.display = 'block';
            // Solo sincronizar UI, no pausar/reproducir
            window.musicPlayer.linkPlayers(window.profilePlayer);
        } else if (section === 'lista') {
            heroSection.querySelector('.series-content').style.display = 'none';
            let listaContent = document.createElement('div');
            listaContent.className = 'lista-content';
            listaContent.innerHTML = `
                        <h1 class="lista-title">Razones por las que te amo</h1>
                        <p class="lista-subtitle">Cada día descubro más motivos para quererte. Aquí hay algunos que iluminan mi corazón. ♥</p>
                        <ul class="lista-reasons">
                                                        <li>Por tu sonrisa que ilumina mi día</li>
                                                    </ul>
                    `;
            heroSection.appendChild(listaContent);
            return;
        }
        if (section !== 'lista') {
            heroSection.querySelector('.series-content').style.display = 'block';
        }
        function attachEpisodeListeners() {
            const newThumbs = document.querySelectorAll('.episode-thumb');
            newThumbs.forEach(thumb => {
                thumb.addEventListener('click', function() {
                    const episode = this.getAttribute('data-episode');
                    const imageUrl = this.getAttribute('data-image');
                    const data = episodeData[episode];
                    if (data) {
                        episodeModalImage.src = imageUrl;
                        episodeModalTitle.textContent = data.title;
                        episodeModalDescription.textContent = data.description;
                        episodeModal.style.display = 'flex';
                    }
                });
            });
        }
        if (section === 'inicio') {
            attachEpisodeListeners();
        }
    }

    updateSection('inicio');

    playButton.addEventListener('click', function() {
        wasMusicPlaying = window.profilePlayer.isPlaying;
        if (wasMusicPlaying) {
            window.profilePlayer.togglePlay();
        }
        videoPlayer.style.display = 'flex';

        romanticVideo.play();
    });

    infoButton.addEventListener('click', function() {
        infoModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', function() {
        infoModal.style.display = 'none';
    });

    closeEpisodeModal.addEventListener('click', function() {
        episodeModal.style.display = 'none';
    });

    closeVideo.addEventListener('click', function() {
        videoPlayer.style.display = 'none';

        romanticVideo.pause();

        if (wasMusicPlaying) {
            window.profilePlayer.togglePlay();
        }
        wasMusicPlaying = false;
    });

    episodeThumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            const episode = this.getAttribute('data-episode');
            const imageUrl = this.getAttribute('data-image');
            const data = episodeData[episode];
            if (data) {
                episodeModalImage.src = imageUrl;
                episodeModalTitle.textContent = data.title;
                episodeModalDescription.textContent = data.description;
                episodeModal.style.display = 'flex';
            }
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === infoModal) infoModal.style.display = 'none';
        if (event.target === episodeModal) episodeModal.style.display = 'none';
        if (event.target === videoPlayer) {
            videoPlayer.style.display = 'none';
            romanticVideo.pause();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (infoModal.style.display === 'flex') infoModal.style.display = 'none';
            if (episodeModal.style.display === 'flex') episodeModal.style.display = 'none';
            if (videoPlayer.style.display === 'flex') {
                videoPlayer.style.display = 'none';
                romanticVideo.pause();
            }
        }
    });

    let touchStart = null;
    document.addEventListener('touchstart', function(e) {
        touchStart = e.touches[0].clientY;
    });

    document.addEventListener('touchend', function(e) {
        if (!touchStart) return;
        let touchEnd = e.changedTouches[0].clientY;
        let diff = touchStart - touchEnd;
        touchStart = null;
        if (Math.abs(diff) < 50) return;
    });
});