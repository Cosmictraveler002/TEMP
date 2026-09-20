document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // Hero Entrance: Synchronized GSAP Master Timeline (Apple-style power4.out)
    // =========================================================================
    let heroEntranceTL = null;
    if (typeof gsap !== 'undefined') {
        heroEntranceTL = gsap.timeline({
            defaults: {
                ease: 'power4.out'
            }
        });

        // Set initial positions cleanly
        gsap.set('.nav-logo', { y: -28, opacity: 0 });
        gsap.set('.nav-link', { y: -20, opacity: 0 });
        gsap.set('.hero-title', { y: 45, opacity: 0 });
        gsap.set('.hero-cta-group', { y: 35, opacity: 0 });
        gsap.set('.hero-scroll-indicator', { opacity: 0, y: 15 });

        heroEntranceTL
            .to('.nav-logo', {
                y: 0,
                opacity: 1,
                duration: 0.95,
                delay: 0.2
            })
            .to('.nav-link', {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.08
            }, '-=0.65')
            .to('.hero-title', {
                y: 0,
                opacity: 1,
                duration: 1.15
            }, '-=0.55')
            .to('.hero-cta-group', {
                y: 0,
                opacity: 1,
                duration: 1.05
            }, '-=0.75')
            .to('.hero-scroll-indicator', {
                y: 0,
                opacity: 0.85,
                duration: 0.85
            }, '-=0.6');
    }

    // =========================================================================
    // Scroll-Triggered Hero Video Sequence with 5-Second Hero Lock
    // =========================================================================
    const heroVideo = document.querySelector('.hero-bg-video');
    let triggerHeroSequence = () => {};
    let hasSequenceCompleted = window.scrollY > 100;

    if (heroVideo) {
        heroVideo.pause();
        heroVideo.currentTime = 0;

        let isSequenceActive = false;
        let touchStartY = 0;

        triggerHeroSequence = () => {
            if (isSequenceActive || hasSequenceCompleted) return;
            isSequenceActive = true;

            // 1. Lock page scroll strictly on the hero section for 3 seconds
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            // 2. Play the video at 1.6x speed to complete the 5s clip in 3s
            heroVideo.currentTime = 0;
            heroVideo.playbackRate = 1.6;
            heroVideo.play().catch(() => {});

            // 3. Float headline and CTA buttons upward gracefully
            if (typeof gsap !== 'undefined') {
                gsap.to('.hero-title, .hero-cta-group', {
                    y: -60,
                    opacity: 0,
                    duration: 0.75,
                    ease: 'power2.out',
                    delay: 0.15
                });

                gsap.to('.hero-scroll-indicator', {
                    opacity: 0,
                    y: -20,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            }

            // 4. Hold on hero for 3 seconds, then unlock and smoothly transition to menu
            setTimeout(() => {
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                isSequenceActive = false;
                hasSequenceCompleted = true;

                // Smoothly scroll down to menu section (#page3)
                const menuSection = document.getElementById('page3');
                if (menuSection) {
                    const targetY = menuSection.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({
                        top: targetY,
                        behavior: 'smooth'
                    });
                }
            }, 3000);
        };

        // Trigger on mouse wheel scroll downward when at hero
        window.addEventListener('wheel', (e) => {
            if (window.scrollY <= 15 && !hasSequenceCompleted && !isSequenceActive) {
                if (e.deltaY > 0) {
                    e.preventDefault();
                    triggerHeroSequence();
                }
            }
        }, { passive: false });

        // Trigger on mobile touch drag upward (scrolling down)
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (window.scrollY <= 15 && !hasSequenceCompleted && !isSequenceActive) {
                if (e.touches.length > 0) {
                    const diffY = touchStartY - e.touches[0].clientY;
                    if (diffY > 10) {
                        e.preventDefault();
                        triggerHeroSequence();
                    }
                }
            }
        }, { passive: false });

        // Trigger on keyboard scroll keys (ArrowDown, PageDown, Space)
        window.addEventListener('keydown', (e) => {
            if (window.scrollY <= 15 && !hasSequenceCompleted && !isSequenceActive) {
                if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
                    e.preventDefault();
                    triggerHeroSequence();
                }
            }
        });

        // Reset sequence state if user scrolls back all the way to top
        window.addEventListener('scroll', () => {
            if (window.scrollY <= 10 && hasSequenceCompleted && !isSequenceActive) {
                hasSequenceCompleted = false;
                heroVideo.pause();
                heroVideo.currentTime = 0;

                if (typeof gsap !== 'undefined') {
                    gsap.to('.hero-title, .hero-cta-group', {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });

                    gsap.to('.hero-scroll-indicator', {
                        y: 0,
                        opacity: 0.85,
                        duration: 0.6,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            }
        }, { passive: true });
    }

    // =========================================================================
    // Independent Viewport Parallax: Menu Nav, Section 1 & Section 2 Blocks
    // =========================================================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // 1. Menu Categories Bar & Category Header on Menu Top Arrival
        gsap.fromTo('.menu-categories-nav',
            { y: 65 },
            {
                y: 0,
                duration: 0.95,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: '#page3',
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );

        gsap.fromTo('.category-header',
            { y: 60 },
            {
                y: 0,
                duration: 0.95,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: '#page3',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );

        // 2. Separate Viewport Triggers for EACH Diet Section (Section 1 Non-Veg, Section 2 Veg, etc.)
        const dietBlocks = document.querySelectorAll('.category-diet-block');
        dietBlocks.forEach((block) => {
            const header = block.querySelector('.diet-header');
            const cards = block.querySelectorAll('.menu-item-card');

            const tl = gsap.timeline({
                defaults: {
                    ease: 'power4.out'
                },
                scrollTrigger: {
                    trigger: block,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });

            if (header) {
                tl.fromTo(header, { y: 50 }, { y: 0, duration: 0.85 }, 0);
            }
            if (cards && cards.length > 0) {
                tl.fromTo(cards, { y: 95 }, { y: 0, duration: 0.95, stagger: 0.08 }, '-=0.65');
            }
        });

        // 3. View All Banner at bottom of menu
        const banner = document.querySelector('.menu-view-all-banner');
        if (banner) {
            gsap.fromTo(banner,
                { y: 75 },
                {
                    y: 0,
                    duration: 0.95,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: banner,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // Recalibrate trigger dimensions after pin spacer is injected
        ScrollTrigger.refresh();
    }

    // Smooth Navigation to Menu from Buttons (Fast-scrub glide past pinned track)
    const exploreBtn = document.querySelector('.hero-btn-primary');
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    const menuNavLinks = document.querySelectorAll('a[href="#page3"]');

    const handleExploreClick = (e) => {
        e.preventDefault();
        if (window.scrollY <= 15 && !hasSequenceCompleted) {
            triggerHeroSequence();
        } else {
            const menuSection = document.getElementById('page3');
            if (menuSection) {
                const targetY = menuSection.getBoundingClientRect().top + window.scrollY - 70;
                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });
            }
        }
    };

    [exploreBtn, scrollIndicator, ...menuNavLinks].forEach(el => {
        if (el) {
            el.addEventListener('click', handleExploreClick);
        }
    });

    // =========================================================================
    // Dynamic Navbar: Frosted Glass in Hero, Adapts on Scroll to Menu
    // =========================================================================
    const navEl = document.getElementById('nav');
    const updateNavScrollState = () => {
        if (!navEl) return;
        if (window.scrollY > 80) {
            navEl.classList.add('scrolled');
        } else {
            navEl.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', updateNavScrollState, { passive: true });
    updateNavScrollState();

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

            // 3. Replace visible category section in menu container with smooth cross-fade
            landingCategorySections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(section,
                            { opacity: 0, y: 14 },
                            { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', overwrite: 'auto' }
                        );
                    }
                } else {
                    section.classList.remove('active');
                    if (typeof gsap !== 'undefined') {
                        gsap.set(section, { opacity: 0, y: 0 });
                    }
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
