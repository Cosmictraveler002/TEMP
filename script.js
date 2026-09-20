document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // Hero Entrance: GSAP TO animation with stagger between text and buttons
    // =========================================================================
    if (typeof gsap !== 'undefined') {
        gsap.from('.nav-logo', {
            y: -35,
            opacity: 0,
            duration: 0.85,
            delay: 0.5,
            ease: 'power3.out'
        });

        // Set initial positions for hero elements
        gsap.set('.hero-title', { y: 35, opacity: 0 });
        gsap.set('.hero-cta-group', { y: 30, opacity: 0 });
        gsap.set('.hero-scroll-indicator', { opacity: 0 });

        // Animate in using gsap.to with clear stagger between text and buttons
        gsap.to('.hero-title', {
            y: 0,
            opacity: 1,
            duration: 0.85,
            delay: 0.45,
            ease: 'power3.out'
        });

        gsap.to('.hero-cta-group', {
            y: 0,
            opacity: 1,
            duration: 0.85,
            delay: 0.65, // Stagger between text and buttons
            ease: 'power3.out'
        });

        gsap.to('.hero-scroll-indicator', {
            opacity: 0.85,
            duration: 0.7,
            delay: 0.9,
            ease: 'power3.out'
        });
    }

    // =========================================================================
    // Hero Scroll Interaction: Animation Completes BEFORE Page Scroll Activates
    // =========================================================================
    const heroVideo = document.querySelector('.hero-bg-video');

    if (heroVideo) {
        heroVideo.pause();
        heroVideo.currentTime = 0;

        let isAnimating = false;
        let hasCompleted = window.scrollY > 100;
        let menuHasAnimated = false;

        // Calibrated GSAP fromTo entrance for menu sections on Y-axis
        const triggerMenuEntranceAnimation = () => {
            if (menuHasAnimated) return;
            menuHasAnimated = true;

            if (typeof gsap !== 'undefined') {
                gsap.fromTo('.menu-categories-nav',
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', overwrite: 'auto' }
                );

                gsap.fromTo('.menu-sections-wrapper',
                    { y: 75, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.95, delay: 0.12, ease: 'power3.out', overwrite: 'auto' }
                );
            }
        };

        const startHeroSequence = () => {
            if (isAnimating || hasCompleted) return;
            isAnimating = true;

            // Lock page scroll strictly during animation
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            // 1. Fast the video (2.2x speed)
            heroVideo.playbackRate = 2.2;
            heroVideo.play().catch(() => {});

            // 2. GSAP TO animation on text and buttons with stagger
            if (typeof gsap !== 'undefined') {
                const tl = gsap.timeline({
                    onComplete: () => {
                        // =========================================================
                        // ANIMATION END: Now and ONLY now activate page scroll!
                        // =========================================================
                        document.documentElement.style.overflow = '';
                        document.body.style.overflow = '';
                        isAnimating = false;
                        hasCompleted = true;

                        // Smoothly scroll down to menu section
                        const target = document.getElementById('page3');
                        if (target) {
                            const targetY = target.getBoundingClientRect().top + window.scrollY - 70;
                            window.scrollTo({
                                top: targetY,
                                behavior: 'smooth'
                            });

                            // Calibrated menu entrance: smoothly rises on Y-axis as scroll arrives
                            setTimeout(() => {
                                triggerMenuEntranceAnimation();
                            }, 260);
                        }
                    }
                });

                // Title animates out
                tl.to('.hero-title', {
                    y: -45,
                    opacity: 0,
                    scale: 0.96,
                    duration: 0.5,
                    ease: 'power2.inOut'
                })
                // Buttons animate out with clear stagger
                .to('.hero-cta-group', {
                    y: -30,
                    opacity: 0,
                    scale: 0.96,
                    duration: 0.5,
                    ease: 'power2.inOut'
                }, '-=0.3')
                // Scroll indicator fades out
                .to('.hero-scroll-indicator', {
                    opacity: 0,
                    duration: 0.25,
                    ease: 'power2.inOut'
                }, '-=0.4')
                // Showcase fast video (0.5s faster: 0.85s hold before scroll)
                .to({}, { duration: 0.85 });
            } else {
                // Fallback without GSAP (1.4s delay)
                setTimeout(() => {
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';
                    isAnimating = false;
                    hasCompleted = true;
                    const target = document.getElementById('page3');
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        triggerMenuEntranceAnimation();
                    }
                }, 1400);
            }
        };

        const resetHeroSequence = () => {
            if (isAnimating) return;
            hasCompleted = false;
            menuHasAnimated = false;

            // Rewind and pause video
            heroVideo.pause();
            heroVideo.currentTime = 0;
            heroVideo.playbackRate = 1.0;

            // Animate text & buttons back in using gsap.to with stagger
            if (typeof gsap !== 'undefined') {
                gsap.to('.hero-title', {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out'
                });

                gsap.to('.hero-cta-group', {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    delay: 0.2, // Stagger
                    ease: 'power3.out'
                });

                gsap.to('.hero-scroll-indicator', {
                    opacity: 0.85,
                    duration: 0.6,
                    delay: 0.35,
                    ease: 'power3.out'
                });
            }
        };

        // Intercept downward scroll attempts at top of page so page DOES NOT scroll
        window.addEventListener('wheel', (e) => {
            if (window.scrollY <= 15 && !hasCompleted) {
                if (e.deltaY > 0) {
                    e.preventDefault();
                    startHeroSequence();
                }
            }
        }, { passive: false });

        // Touch event interception for mobile devices
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (window.scrollY <= 15 && !hasCompleted) {
                if (e.touches && e.touches.length > 0) {
                    const deltaY = touchStartY - e.touches[0].clientY;
                    if (deltaY > 8) { // Swiping up to scroll down
                        e.preventDefault();
                        startHeroSequence();
                    }
                }
            }
        }, { passive: false });

        // Keyboard arrow/space navigation interception at top
        window.addEventListener('keydown', (e) => {
            if (window.scrollY <= 15 && !hasCompleted) {
                if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
                    e.preventDefault();
                    startHeroSequence();
                }
            }
        }, { passive: false });

        // Reset state when scrolling back to the very top
        window.addEventListener('scroll', () => {
            if (window.scrollY <= 10 && hasCompleted && !isAnimating) {
                resetHeroSequence();
            }
        }, { passive: true });

        // Explore Menu & Scroll Indicator buttons trigger the sequence
        const exploreBtn = document.querySelector('.hero-btn-primary');
        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        [exploreBtn, scrollIndicator].forEach(el => {
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    startHeroSequence();
                });
            }
        });
    }

    // =========================================================================
    // GSAP ScrollTrigger: Menu Sections Entrance Animation on Y-Axis
    // =========================================================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
            trigger: '#page3',
            start: 'top 85%',
            onEnter: () => {
                triggerMenuEntranceAnimation();
            },
            onLeaveBack: () => {
                menuHasAnimated = false;
            }
        });
    }

    // Scroll listener backup to guarantee menu entrance fires when reaching #page3
    window.addEventListener('scroll', () => {
        const menuSection = document.getElementById('page3');
        if (menuSection && !menuHasAnimated) {
            const rect = menuSection.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.88) {
                triggerMenuEntranceAnimation();
            }
        }
    }, { passive: true });

    // Quick Add-to-Order button toast feedback
    const orderBtns = document.querySelectorAll('.item-order-btn');
    
    // Create toast notification dynamically if not already present
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #12131A;
            color: #FFFFFF;
            font-family: var(--font-primary, sans-serif);
            font-size: 0.92rem;
            font-weight: 700;
            padding: 14px 22px;
            border-radius: 9999px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 1000;
            border: 1.5px solid var(--accent-pop, #C2EB12);
        `;
        toast.innerHTML = `
            <span style="background: var(--accent-pop, #C2EB12); color: #12131A; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">ADDED</span>
            <span id="toast-message">Item added to selection!</span>
        `;
        document.body.appendChild(toast);
    }

    const toastMessage = document.getElementById('toast-message');
    let toastTimer;

    orderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.menu-item-card');
            const titleEl = card ? card.querySelector('.item-title') : null;
            const priceEl = card ? card.querySelector('.item-price') : null;
            const dishName = btn.getAttribute('data-dish') || (titleEl ? titleEl.textContent.trim() : 'Item');
            const price = btn.getAttribute('data-price') ? ` (₹${btn.getAttribute('data-price')})` : (priceEl ? ` (${priceEl.textContent.trim()})` : '');

            if (toastMessage) {
                toastMessage.textContent = `${dishName}${price} added to selection!`;
            }
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
            toast.style.pointerEvents = 'auto';

            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.style.transform = 'translateY(100px)';
                toast.style.opacity = '0';
                toast.style.pointerEvents = 'none';
            }, 2600);
        });
    });

    // Landing page In-Place Category Pill Tab Switcher
    const categoryPills = document.querySelectorAll('.menu-categories-nav .category-pill');
    const landingCategorySections = document.querySelectorAll('#page3 .menu-category-section');

    categoryPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = pill.getAttribute('data-target') || (pill.getAttribute('href') ? pill.getAttribute('href').replace('#', '') : null);
            if (!targetId) return;

            // 1. Update active tab pill state
            categoryPills.forEach(p => {
                p.classList.remove('active');
                p.setAttribute('aria-selected', 'false');
            });
            pill.classList.add('active');
            pill.setAttribute('aria-selected', 'true');

            // 2. Center active pill in mobile horizontal scrollbar
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

            // 3. Replace visible category section in menu container
            landingCategorySections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // 4. Gently ensure menu container top is in comfortable view
            const menuSection = document.getElementById('page3');
            if (menuSection) {
                const rect = menuSection.getBoundingClientRect();
                if (rect.top < -50) {
                    window.scrollTo({
                        top: window.scrollY + rect.top - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
