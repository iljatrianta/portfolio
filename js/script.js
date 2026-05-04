/**
 * Portfolio Website - Main Scripts
 * Organized by feature with clear separation of concerns
 */

/* ========================================
   CONSTANTS & CONFIGURATION
   ======================================== */

const CONFIG = {
	// Responsive zoom breakpoints
	responsiveZoom: {
		largeWidth: 1600,
		largeHeight: 950,
		smallWidth: 1350,
		smallHeight: 800
	},
	// Scroll observers
	observers: {
		h2RevealThreshold: 0.25,
		insightsThreshold: 0.35,
		navScrollThreshold: 10
	},
	// Sketch animation
	sketches: {
		imageStagger: 0.06,
		baseTranslateY: 120,
		scrollDistance: 260
	}
};

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * Clamp a value between min and max
 */
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Check if currently on the index page
 */
const isOnIndexPage = () => {
	const pathname = window.location.pathname;
	return pathname.endsWith('/index.html') || pathname === '/' || pathname === '';
};

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========================================
   LIFECYCLE EVENTS
   ======================================== */

/**
 * Wait for background images to load, then trigger page reveal and fade in background
 */
window.addEventListener('load', () => {
	// Find all images in the background container
	const backgroundImages = document.querySelectorAll('.siteBackground img');
	
	if (backgroundImages.length === 0) {
		// No images to wait for, start reveal immediately
		startPageReveal();
		return;
	}

	let loadedCount = 0;
	
	const onImageLoad = () => {
		loadedCount++;
		if (loadedCount === backgroundImages.length) {
			startPageReveal();
		}
	};

	backgroundImages.forEach((img) => {
		// If image is already cached and loaded
		if (img.complete) {
			onImageLoad();
		} else {
			// Wait for image to load
			img.addEventListener('load', onImageLoad, { once: true });
			img.addEventListener('error', onImageLoad, { once: true }); // Also trigger on error to avoid hanging
		}
	});
});

/**
 * Start the page reveal animation
 */
const startPageReveal = () => {
	document.body.classList.add('is-loaded');
	document.body.classList.add('page-ready');
};

/* ========================================
   RESPONSIVE ZOOM
   ======================================== */

/**
 * Apply responsive zoom based on viewport size
 */
const applyResponsiveZoom = () => {
	const { largeWidth, largeHeight, smallWidth, smallHeight } = CONFIG.responsiveZoom;
	const width = window.innerWidth;
	const height = window.innerHeight;
	let scale = 1;

	if (width > largeWidth && height > largeHeight) {
		scale = Math.min(width / largeWidth, height / largeHeight);
	} else if (width < smallWidth || height < smallHeight) {
		scale = Math.min(width / smallWidth, height / smallHeight);
	}

	document.documentElement.style.setProperty('--page-zoom-scale', String(scale));
	document.documentElement.style.zoom = String(scale);
};

window.addEventListener('resize', applyResponsiveZoom);
applyResponsiveZoom();

/* ========================================
   NAVIGATION BEHAVIOR
   ======================================== */

/**
 * Update navigation styling on scroll
 */
const initNavScrollBehavior = () => {
	const nav = document.querySelector('nav');
	if (!nav) return;

	window.addEventListener('scroll', () => {
		const isAtTop = window.scrollY === 0;
		const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - CONFIG.observers.navScrollThreshold;

		if (isAtTop || isAtBottom) {
			nav.classList.remove('is-scrolled');
		} else {
			nav.classList.add('is-scrolled');
		}
	}, { passive: true });
};

/**
 * Update active navigation link based on scroll position
 */
const initNavActiveState = () => {
	const navLinks = document.querySelectorAll('nav .ulWhite a');
	const sections = document.querySelectorAll('#top, #projects, #about, #archive, #contact');

	if (navLinks.length === 0 || sections.length === 0) return;

	const updateActiveNav = () => {
		if (!isOnIndexPage()) {
			navLinks.forEach(link => link.classList.remove('active'));
			return;
		}

		sections.forEach((section) => {
			const rect = section.getBoundingClientRect();
			if (rect.top <= window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
				const sectionId = section.id;
				navLinks.forEach(link => {
					if (link.getAttribute('href') === `index.html#${sectionId}`) {
						link.classList.add('active');
					} else {
						link.classList.remove('active');
					}
				});
			}
		});
	};

	window.addEventListener('scroll', updateActiveNav, { passive: true });
	updateActiveNav();
};

/**
 * Handle home link click behavior
 */
const initHomeLink = () => {
	const homeLink = document.querySelector('.homeLink');
	if (!homeLink) return;

	homeLink.addEventListener('click', (event) => {
		if (isOnIndexPage()) {
			event.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else {
			homeLink.setAttribute('href', 'index.html#top');
		}
	});
};

/**
 * Toggle jump button between final section and top of page
 */
const initJumpButtonToggle = () => {
	const jumpLink = document.querySelector('.jumpButton .jumpLink');
	const finalSection = document.getElementById('project-final');

	if (!jumpLink || !finalSection) return;

	const setToFinal = () => {
		jumpLink.textContent = 'JUMP TO FINAL ↓';
		jumpLink.setAttribute('href', '#project-final');
	};

	const setToTop = () => {
		jumpLink.textContent = 'BACK TO TOP ↑';
		jumpLink.setAttribute('href', '#');
	};

	jumpLink.addEventListener('click', (event) => {
		if (jumpLink.getAttribute('href') === '#') {
			event.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	});

	if (!('IntersectionObserver' in window)) {
		window.addEventListener('scroll', () => {
			const rect = finalSection.getBoundingClientRect();
			const hasReachedFinal = rect.top <= window.innerHeight * 0.5;
			if (hasReachedFinal) {
				setToTop();
			} else {
				setToFinal();
			}
		}, { passive: true });
		return;
	}

	const jumpObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			const hasReachedFinal = entry.boundingClientRect.top <= window.innerHeight * 0.5;
			if (hasReachedFinal) {
				setToTop();
			} else {
				setToFinal();
			}
		});
	}, {
		threshold: [0, 0.45, 1]
	});

	jumpObserver.observe(finalSection);
};

initNavScrollBehavior();
initNavActiveState();
initHomeLink();
initJumpButtonToggle();

/* ========================================
   H2 HEADING REVEAL ANIMATION
   ======================================== */

/**
 * Initialize reveal animation for offset h2 headings
 */
const initH2RevealAnimation = () => {
	const offsetH2Headings = Array.from(document.querySelectorAll('h2')).filter((heading) => {
		const computedStyle = window.getComputedStyle(heading);
		return computedStyle.left !== 'auto' && computedStyle.left !== '0px';
	});

	if (offsetH2Headings.length === 0) return;

	const doesPrefersReducedMotion = prefersReducedMotion();

	offsetH2Headings.forEach((heading) => {
		const computedStyle = window.getComputedStyle(heading);
		heading.dataset.targetLeft = computedStyle.left;
		heading.classList.add('h2-reveal');

		if (doesPrefersReducedMotion) {
			heading.style.left = computedStyle.left;
		} else {
			heading.style.left = '0px';
		}
	});

	if (doesPrefersReducedMotion || !('IntersectionObserver' in window)) return;

	const revealObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			const heading = entry.target;

			if (entry.isIntersecting) {
				heading.style.left = heading.dataset.targetLeft || '0px';
			} else {
				heading.style.left = '0px';
			}
		});
	}, { threshold: CONFIG.observers.h2RevealThreshold });

	offsetH2Headings.forEach((heading) => revealObserver.observe(heading));
};

initH2RevealAnimation();

/* ========================================
   ARCHIVE MODAL
   ======================================== */

/**
 * Initialize archive image gallery modal
 */
const initArchivePanPreview = () => {
	const archivePanCell = document.querySelector('.archivePan');
	if (!archivePanCell) return;

	const archivePanImage = archivePanCell.querySelector('.archiveImg');
	if (!archivePanImage || archivePanCell.querySelector('.archivePanViewport')) return;

	const viewport = document.createElement('div');
	viewport.className = 'archivePanViewport';

	const clip = document.createElement('div');
	clip.className = 'archivePanClip';

	const track = document.createElement('div');
	track.className = 'archivePanTrack';

	const primaryImage = archivePanImage.cloneNode(true);
	const repeatImage = archivePanImage.cloneNode(true);
	repeatImage.classList.add('archiveImgClone');
	repeatImage.alt = '';
	repeatImage.setAttribute('aria-hidden', 'true');

	track.append(primaryImage, repeatImage);
	clip.append(track);
	viewport.append(clip);
	archivePanCell.append(viewport);
	archivePanImage.remove();
};

const initArchiveModal = () => {
	const archiveMedia = document.querySelectorAll('.archiveItem img, .archiveItem video');
	const archiveModal = document.getElementById('archiveModal');
	const archiveModalViewport = document.getElementById('archiveModalViewport');
	const archiveModalImage = document.getElementById('archiveModalImage');
	const archiveModalVideo = document.getElementById('archiveModalVideo');
	const archiveModalClose = document.getElementById('archiveModalClose');

	if (archiveMedia.length === 0 || !archiveModal || !archiveModalViewport || !archiveModalImage || !archiveModalVideo || !archiveModalClose) return;

	const resetModalViewport = () => {
		archiveModalViewport.innerHTML = '';
		archiveModalViewport.append(archiveModalImage);
		archiveModalViewport.append(archiveModalVideo);
		archiveModalImage.hidden = false;
		archiveModalVideo.hidden = true;
		archiveModalVideo.pause();
		archiveModalVideo.muted = true;
		archiveModalVideo.volume = 0;
		archiveModalVideo.removeAttribute('src');
		archiveModalVideo.load();
	};

	const openStandardModal = (image) => {
		resetModalViewport();
		archiveModal.classList.remove('is-paused');
		archiveModalImage.hidden = false;
		archiveModalVideo.hidden = true;
		archiveModalImage.src = image.currentSrc || image.src;
		archiveModalImage.alt = image.alt || 'Archive image';
	};

	const openVideoModal = (video) => {
		resetModalViewport();
		archiveModal.classList.remove('is-paused');
		archiveModalImage.removeAttribute('src');
		archiveModalImage.alt = '';
		archiveModalImage.hidden = true;
		archiveModalVideo.hidden = false;
		archiveModalVideo.muted = false;
		archiveModalVideo.volume = 0.5;

		const sourceElement = video.querySelector('source');
		const source = sourceElement?.currentSrc || sourceElement?.src || video.currentSrc || video.src;

		archiveModalVideo.src = source;
		archiveModalVideo.load();
		archiveModalVideo.play().catch(() => {});
	};

	const openPanModal = (image) => {
		archiveModalViewport.innerHTML = '';
		archiveModal.classList.remove('is-paused');

		const track = document.createElement('div');
		track.className = 'archiveModalTrack';

		const firstImage = image.cloneNode(true);
		const secondImage = image.cloneNode(true);
		secondImage.classList.add('archiveImgClone');
		secondImage.alt = '';
		secondImage.setAttribute('aria-hidden', 'true');

		track.append(firstImage, secondImage);
		archiveModalViewport.append(track);
	};

	const togglePanPlayback = () => {
		if (!archiveModal.classList.contains('is-pan')) return;

		const panTrack = archiveModalViewport.querySelector('.archiveModalTrack');
		if (!panTrack) return;

		const isPaused = archiveModal.classList.toggle('is-paused');
		panTrack.style.animationPlayState = isPaused ? 'paused' : 'running';
	};

	/**
	 * Open modal with selected image
	 */
	const openModal = (image) => {
		const archiveCell = image.closest('.archiveItem');
		const shouldPan = Boolean(archiveCell && archiveCell.classList.contains('archivePan'));

		if (image.tagName === 'VIDEO') {
			openVideoModal(image);
		} else if (shouldPan) {
			openPanModal(image);
		} else {
			openStandardModal(image);
		}

		archiveModal.classList.add('is-open');
		archiveModal.classList.toggle('is-pan', shouldPan);
		archiveModal.setAttribute('aria-hidden', 'false');
		document.body.classList.add('is-modal-open');

		// If a video was opened, some browsers block play when the element isn't yet visible.
		// Retry play after making the modal visible.
		if (!archiveModalVideo.hidden && archiveModalVideo.src) {
			const tryPlay = () => archiveModalVideo.play().catch(() => {});
			tryPlay();
			setTimeout(tryPlay, 200);
		}
	};

	/**
	 * Close modal and cleanup
	 */
	const closeModal = () => {
		archiveModal.classList.remove('is-open');
		archiveModal.classList.remove('is-pan');
		archiveModal.classList.remove('is-paused');
		resetModalViewport();
		archiveModal.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('is-modal-open');
		archiveModalImage.src = '';
		archiveModalVideo.pause();
		archiveModalVideo.muted = true;
		archiveModalVideo.volume = 0;
		archiveModalImage.hidden = false;
		archiveModalVideo.hidden = true;
	};

	// Add click handlers to archive media
	archiveMedia.forEach((media) => {
		media.addEventListener('click', () => openModal(media));
	});

	// Close button
	archiveModalClose.addEventListener('click', closeModal);

	// Close when clicking outside image
	archiveModal.addEventListener('click', (event) => {
		if (event.target === archiveModal) {
			closeModal();
		}
	});

	archiveModalViewport.addEventListener('click', togglePanPlayback);

	// Close on escape key
	window.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && archiveModal.classList.contains('is-open')) {
			closeModal();
		}
	});
};

initArchivePanPreview();
initArchiveModal();

const initFinalImageModal = () => {
	const finalThumbs = Array.from(document.querySelectorAll('.projectFinalGrid .finalThumb'));
	const finalModal = document.getElementById('finalModal');
	const finalModalViewport = document.getElementById('finalModalViewport');
	const finalModalImage = document.getElementById('finalModalImage');
	const finalModalClose = document.getElementById('finalModalClose');
	const finalModalPrev = document.getElementById('finalModalPrev');
	const finalModalNext = document.getElementById('finalModalNext');
	const finalModalCounter = document.getElementById('finalModalCounter');

	if (finalThumbs.length === 0 || !finalModal || !finalModalViewport || !finalModalImage || !finalModalClose || !finalModalPrev || !finalModalNext || !finalModalCounter) return;

	const finalItems = finalThumbs.map((thumb, index) => {
		const image = thumb.querySelector('img');
		return {
			thumb,
			image,
			source: image?.currentSrc || image?.src || '',
			alt: image?.alt || `Final design image ${index + 1}`
		};
	}).filter((item) => Boolean(item.image));

	let currentIndex = 0;

	const updateCounter = () => {
		finalModalCounter.textContent = `${currentIndex + 1} / ${finalItems.length}`;
	};

	const showItem = (index) => {
		currentIndex = (index + finalItems.length) % finalItems.length;
		const item = finalItems[currentIndex];
		finalModalImage.src = item.source;
		finalModalImage.alt = item.alt;
		updateCounter();
	};

	const openModal = (index) => {
		showItem(index);
		finalModal.classList.add('is-open');
		finalModal.setAttribute('aria-hidden', 'false');
		document.body.classList.add('is-modal-open');
	};

	const closeModal = () => {
		finalModal.classList.remove('is-open');
		finalModal.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('is-modal-open');
		finalModalImage.src = '';
		finalModalImage.alt = '';
	};

	const goPrev = () => showItem(currentIndex - 1);
	const goNext = () => showItem(currentIndex + 1);

	finalThumbs.forEach((thumb) => {
		thumb.addEventListener('click', () => {
			const index = Number(thumb.dataset.finalIndex || 0);
			openModal(index);
		});
	});

	finalModalClose.addEventListener('click', closeModal);
	finalModalPrev.addEventListener('click', goPrev);
	finalModalNext.addEventListener('click', goNext);

	finalModal.addEventListener('click', (event) => {
		if (event.target === finalModal) {
			closeModal();
		}
	});

	finalModalViewport.addEventListener('click', (event) => {
		event.stopPropagation();
	});

	window.addEventListener('keydown', (event) => {
		if (!finalModal.classList.contains('is-open')) return;

		if (event.key === 'Escape') {
			closeModal();
		} else if (event.key === 'ArrowLeft') {
			goPrev();
		} else if (event.key === 'ArrowRight') {
			goNext();
		}
	});
};

initFinalImageModal();

/* ========================================
   SKETCH IMAGE SCROLL ANIMATION
   ======================================== */

/**
 * Animate sketch images based on scroll position
 */
const initSketchScrollAnimation = () => {
	const sketchesSection = document.querySelector('.projectSketches');
	const sketchImages = document.querySelectorAll('.projectSketches .sketchImage');

	if (!sketchesSection || sketchImages.length === 0) return;

	const updateSketchPositions = () => {
		const rect = sketchesSection.getBoundingClientRect();
		const scrollableDistance = Math.max(1, sketchesSection.offsetHeight - window.innerHeight);
		const rawProgress = -rect.top / scrollableDistance;
		const progress = clamp(rawProgress, 0, 1);

		sketchImages.forEach((image, index) => {
			const stagger = index * CONFIG.sketches.imageStagger;
			const localProgress = clamp((progress - stagger) / (1 - stagger), 0, 1);
			const translateY = CONFIG.sketches.baseTranslateY - localProgress * CONFIG.sketches.scrollDistance;
			image.style.transform = `translateY(${translateY}vh)`;
		});
	};

	window.addEventListener('scroll', updateSketchPositions, { passive: true });
	window.addEventListener('resize', updateSketchPositions);
	updateSketchPositions();
};

initSketchScrollAnimation();

/* ========================================
   INSIGHTS SECTION ANIMATION
   ======================================== */

/**
 * Trigger insight cards animation when section becomes visible
 */
const initInsightsAnimation = () => {
	const insightsSection = document.querySelector('.projectInsights');
	if (!insightsSection) return;

	const doesPrefersReducedMotion = prefersReducedMotion();

	if (doesPrefersReducedMotion) {
		insightsSection.classList.add('is-visible');
		return;
	}

	if (!('IntersectionObserver' in window)) {
		insightsSection.classList.add('is-visible');
		return;
	}

	const insightsObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				insightsSection.classList.add('is-visible');
			} else {
				insightsSection.classList.remove('is-visible');
			}
		});
	}, { threshold: CONFIG.observers.insightsThreshold });

	insightsObserver.observe(insightsSection);
};

initInsightsAnimation();

/* ========================================
   PROJECT FINAL VIDEO
   ======================================== */

/**
 * Control final showcase video playback based on visibility and click interaction
 */
const initProjectFinalVideo = () => {
	const finalGrid = document.querySelector('.projectFinalGrid');
	if (!finalGrid) return;

	const videos = Array.from(finalGrid.querySelectorAll('video'));
	if (videos.length === 0) return;

	const playedSet = new WeakSet();
	let currentlyPlaying = null;

	const updatePausedState = (video) => {
		const hasPlayed = playedSet.has(video);
		video.classList.toggle('is-paused', hasPlayed && video.paused);
	};

	const pauseAllExcept = (exceptVideo) => {
		videos.forEach((v) => {
			if (v !== exceptVideo) {
				if (!v.paused) v.pause();
			}
		});
	};

	videos.forEach((video) => {
		video.controls = false;
		video.loop = true;
		video.playsInline = true;
		video.setAttribute('playsinline', '');

		// Lower site-wide playback volume by 50%
		try { video.volume = 0.5; } catch (e) {}

		// Initialize paused visual state
		updatePausedState(video);

		video.addEventListener('play', () => {
			playedSet.add(video);
			currentlyPlaying = video;
			pauseAllExcept(video);
			updatePausedState(video);
		});

		video.addEventListener('pause', () => {
			if (currentlyPlaying === video) currentlyPlaying = null;
			updatePausedState(video);
		});

		video.addEventListener('click', () => {
			if (video.paused) {
				pauseAllExcept(video);
				video.play().catch(() => {});
			} else {
				video.pause();
			}
		});
	});

	if (!('IntersectionObserver' in window)) return;

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			const v = entry.target;
			if (entry.isIntersecting && entry.intersectionRatio >= 0.99) {
				// Pause others before autoplaying this one
				pauseAllExcept(v);
				v.play().catch(() => {});
			} else {
				v.pause();
			}
		});
	}, { threshold: [0, 0.99, 1] });

	videos.forEach((v) => observer.observe(v));
};

initProjectFinalVideo();
