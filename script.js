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
    // Scroll-Triggered Hero Video Sequence with 1-Second Hero Lock
    // =========================================================================
    const heroVideo = document.querySelector('.hero-bg-video');
    let triggerHeroSequence = () => {};
    let hasSequenceCompleted = window.scrollY > 100;

    if (heroVideo) {
        heroVideo.pause();
        heroVideo.currentTime = 0;

        let isSequenceActive = false;
        let touchStartY = 0;
        let hasScrolledPastHero = window.scrollY > 150;

        triggerHeroSequence = () => {
            if (isSequenceActive || hasSequenceCompleted) return;
            isSequenceActive = true;
            hasScrolledPastHero = false;

            // 1. Lock page scroll strictly on the hero section for 1 second
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            // 2. Play the video at 4.8x speed to complete the 5s clip in 1s
            heroVideo.currentTime = 0;
            heroVideo.playbackRate = 4.8;
            heroVideo.play().catch(() => {});

            // 3. Float headline and CTA buttons upward gracefully
            if (typeof gsap !== 'undefined') {
                gsap.to('.hero-title, .hero-cta-group', {
                    y: -60,
                    opacity: 0,
                    duration: 0.80,
                    ease: 'power2.out',
                    delay: 0.09
                });

                gsap.to('.hero-scroll-indicator', {
                    opacity: 0,
                    y: -20,
                    duration: 0.25,
                    ease: 'power2.out'
                });
            }

            // 4. Hold on hero for 1 second, then unlock and smoothly transition to menu
            setTimeout(() => {
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                hasSequenceCompleted = true;

                // Smoothly scroll down to reviews section (#page2)
                const nextSection = document.getElementById('page2') || document.getElementById('page3');
                if (nextSection) {
                    const targetY = nextSection.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({
                        top: targetY,
                        behavior: 'smooth'
                    });
                }

                // Buffer transition period to prevent premature interaction or reset while scroll starts
                setTimeout(() => {
                    isSequenceActive = false;
                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                    }
                }, 500);
            }, 1000);
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

        // Reset sequence state ONLY if user has actually scrolled down past hero and returns to top
        window.addEventListener('scroll', () => {
            if (window.scrollY > 150) {
                hasScrolledPastHero = true;
            }

            if (window.scrollY <= 10 && hasSequenceCompleted && hasScrolledPastHero && !isSequenceActive) {
                hasSequenceCompleted = false;
                hasScrolledPastHero = false;
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
    // Page 2: Google Reviews Continuous Infinite Marquee with GSAP
    // =========================================================================
    const marqueeTrack = document.querySelector('.reviews-marquee-track');
    if (marqueeTrack && typeof gsap !== 'undefined') {
        // Continuous horizontal scroll from 0 to -50% (half track containing 1 complete set)
        const marqueeTween = gsap.to(marqueeTrack, {
            xPercent: -50,
            ease: 'none',
            duration: 28,
            repeat: -1
        });

        // Pause on hover so guests can read reviews easily
        marqueeTrack.addEventListener('mouseenter', () => marqueeTween.pause());
        marqueeTrack.addEventListener('mouseleave', () => marqueeTween.play());

        // Mobile touch support to pause while touching
        marqueeTrack.addEventListener('touchstart', () => marqueeTween.pause(), { passive: true });
        marqueeTrack.addEventListener('touchend', () => marqueeTween.play(), { passive: true });
    }

    // =========================================================================
    // Page 3: Section 0 Desktop Category Continuous Infinite Marquee with GSAP
    // =========================================================================
    const section0MarqueeTrack = document.querySelector('.section-0-marquee-track');
    if (section0MarqueeTrack && typeof gsap !== 'undefined') {
        // Continuous rightward infinite scroll from -50% to 0% (opposite direction, 33% faster: 20s)
        gsap.fromTo(section0MarqueeTrack,
            { xPercent: -50 },
            {
                xPercent: 0,
                ease: 'none',
                duration: 20,
                repeat: -1
            }
        );
    }

    // =========================================================================
    // Independent Viewport Parallax & Direction-Reactive Scroll Retreat
    // =========================================================================
    let setupDietSectionTriggers = null;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // 0. Section 0: Responsive Animations (Mobile Screen-View Zigzag vs Desktop Marquee Glide)
        const section0Grid = document.querySelector('#section-0 .section-0-grid');
        const section0Mm = gsap.matchMedia();

        // Mobile Viewport (<= 768px): Card rows individually triggered by screen view
        section0Mm.add('(max-width: 768px)', () => {
            if (!section0Grid) return;
            const allCards = Array.from(section0Grid.querySelectorAll('.section-0-card'));
            if (allCards.length === 0) return;

            // Pair cards into alternating 2-column rows: [Left 1, Right 1], [Left 2, Right 2], etc.
            const rows = [];
            for (let i = 0; i < allCards.length; i += 2) {
                rows.push({
                    left: allCards[i],
                    right: allCards[i + 1]
                });
            }

            rows.forEach((row) => {
                const leftCard = row.left;
                const rightCard = row.right;

                // Hardware-accelerated off-axis offsets (-75px left, +75px right) and 0 opacity
                if (leftCard) gsap.set(leftCard, { x: -75, opacity: 0, force3D: true });
                if (rightCard) gsap.set(rightCard, { x: 75, opacity: 0, force3D: true });

                // Individual row trigger: each row animates crisply when entering the screen view (18% above bottom)
                const rowTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: leftCard || rightCard,
                        start: 'top 82%',
                        toggleActions: 'play none none reverse'
                    },
                    defaults: {
                        duration: 0.85,
                        ease: 'power4.out',
                        force3D: true
                    }
                });

                if (leftCard) {
                    rowTl.to(leftCard, { x: 0, opacity: 1 }, 0);
                }
                if (rightCard) {
                    rowTl.to(rightCard, { x: 0, opacity: 1 }, 0.08); // Signature 0.08s zig-zag cadence
                }
            });
        });

        // Desktop Viewport (> 768px): Category Continuous Marquee entrance glide
        section0Mm.add('(min-width: 769px)', () => {
            gsap.fromTo('.section-0-marquee-container',
                { y: 35, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.85,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '#page3',
                        start: 'top 88%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // 1. Menu Categories Bar (Stable entrance on arrival, reverses when returning to Hero)
        gsap.fromTo('.menu-categories-nav',
            { y: 65 },
            {
                y: 0,
                duration: 0.95,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: '#page3',
                    start: 'top 88%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Category Header: Stable entrance animation on reaching menu (never retreats downwards into diet headers)
        gsap.fromTo('.category-header',
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.75,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#page3',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );

        // 2. Separate Viewport Triggers for EACH Diet Section (Scoped to Active Category Section)
        let activeDietTriggers = [];

        setupDietSectionTriggers = function(sectionElement, isTabSwitch = false) {
            // Clean up any previous diet ScrollTriggers to eliminate duplicate/ghost triggers
            activeDietTriggers.forEach(st => {
                if (st && st.kill) st.kill();
            });
            activeDietTriggers = [];

            if (!sectionElement) return;

            // Ensure all cards have pointer-events restored
            const allCards = sectionElement.querySelectorAll('.menu-item-card');
            allCards.forEach(c => c.style.pointerEvents = '');

            // Ensure ScrollTrigger measures offsets accurately for the active section
            ScrollTrigger.refresh();

            const dietBlocks = sectionElement.querySelectorAll('.category-diet-block');

            dietBlocks.forEach((block, blockIndex) => {
                const header = block.querySelector('.diet-header');
                const cards = Array.from(block.querySelectorAll('.menu-item-card'));

                const isMobile = window.innerWidth <= 768;
                const headerEntranceY = isMobile ? 28 : 45;
                const cardEntranceY = isMobile ? 60 : 90;
                const entranceDuration = isMobile ? 0.8 : 0.95;
                const staggerDuration = isMobile ? 0.05 : 0.08;

                // Calibrated trigger positions:
                // Block 1 (Section 1): triggers at 78% viewport (mobile: 75%)
                // Block 2 (Section 2): triggers at 60% viewport on desktop (mobile: 75%)
                // This guarantees Block 2 does NOT fire prematurely while the user is still looking at Block 1 on desktop & large screens
                const triggerStart = isMobile ? 'top 75%' : (blockIndex === 0 ? 'top 78%' : 'top 60%');

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: block,
                        start: triggerStart,
                        toggleActions: 'play none none reverse'
                    },
                    defaults: {
                        ease: 'power3.out',
                        force3D: true
                    },
                    onStart: () => {
                        cards.forEach(c => c.style.pointerEvents = 'none');
                    },
                    onComplete: () => {
                        cards.forEach(c => c.style.pointerEvents = '');
                    },
                    onReverseComplete: () => {
                        cards.forEach(c => c.style.pointerEvents = '');
                    }
                });

                if (header) {
                    tl.fromTo(header,
                        { y: headerEntranceY, opacity: 0 },
                        { y: 0, opacity: 1, duration: isMobile ? 0.6 : 0.75, ease: 'power3.out', force3D: true },
                        0
                    );
                }
                if (cards.length > 0) {
                    // Pure GPU Y-axis uprise transform with force3D: true (strictly preserving 100% opacity at all times per user requirement)
                    tl.fromTo(cards,
                        { y: cardEntranceY },
                        { y: 0, duration: entranceDuration, stagger: staggerDuration, ease: 'power4.out', force3D: true },
                        header ? 0.08 : 0
                    );
                }

                if (tl.scrollTrigger) {
                    activeDietTriggers.push(tl.scrollTrigger);
                }

                // If tab switch occurred, immediately trigger the entrance animation on blocks that are already in view
                if (isTabSwitch) {
                    const rect = block.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
                        tl.restart();
                    }
                }
            });
        };

        // Initialize diet section triggers ONLY for the initially active section (default: All Specials)
        const initialActiveSection = document.querySelector('#page3 .menu-category-section.active') || document.getElementById('section-all-specials');
        setupDietSectionTriggers(initialActiveSection, false);

        // 3. View All Banner at bottom of menu: Direction-reactive entrance and reverse
        const banner = document.querySelector('.menu-view-all-banner');
        if (banner) {
            gsap.fromTo(banner,
                { y: 75 },
                {
                    y: 0,
                    duration: 0.95,
                    ease: 'power3.out',
                    force3D: true,
                    scrollTrigger: {
                        trigger: banner,
                        start: 'top 88%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        }

        // 4. Page 4: Find Us & Map Showcase Entrance
        const findUsSection = document.querySelector('#page4');
        if (findUsSection) {
            const findUsHeader = findUsSection.querySelector('.find-us-header');
            const findUsMap = findUsSection.querySelector('.find-us-map-card');
            const findUsCards = findUsSection.querySelectorAll('.find-us-info-card');

            if (findUsHeader) {
                gsap.fromTo(findUsHeader,
                    { y: 45, force3D: true },
                    {
                        y: 0,
                        duration: 0.85,
                        ease: 'power3.out',
                        force3D: true,
                        scrollTrigger: {
                            trigger: findUsHeader,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            }

            if (findUsMap) {
                gsap.fromTo(findUsMap,
                    { y: 55, force3D: true },
                    {
                        y: 0,
                        duration: 0.9,
                        ease: 'power3.out',
                        force3D: true,
                        scrollTrigger: {
                            trigger: findUsMap,
                            start: 'top 82%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            }

            if (findUsCards.length > 0) {
                gsap.fromTo(findUsCards,
                    { y: 55, force3D: true },
                    {
                        y: 0,
                        duration: 0.85,
                        stagger: 0.1,
                        ease: 'power3.out',
                        force3D: true,
                        scrollTrigger: {
                            trigger: findUsCards[0],
                            start: 'top 82%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            }
        }

        // Recalibrate trigger dimensions immediately and when all assets settle
        ScrollTrigger.refresh();
        window.addEventListener('load', () => {
            ScrollTrigger.refresh();
        });
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

    // Smooth scroll for other in-page nav links (#page1, #page2, #page4, #page5)
    const otherNavLinks = document.querySelectorAll('a[href^="#"]:not([href="#page3"]):not([href="#"])');
    otherNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                const targetY = targetEl.getBoundingClientRect().top + window.scrollY - 70;
                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });
            }
        });
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

    // Landing page Category Activation (Handles both Mobile Section 0 Cards and Desktop Nav Pills)
    const categoryPills = document.querySelectorAll('.menu-categories-nav .category-pill');
    const landingCategorySections = document.querySelectorAll('#page3 .menu-category-section');
    const section0CategoryCards = document.querySelectorAll('#section-0 .section-0-card[data-target]');

    function activateMenuCategory(targetId, shouldScrollToDishes = false) {
        if (!targetId) return;

        // 1. Update active tab pill state for desktop nav
        categoryPills.forEach(p => {
            const pTarget = p.getAttribute('data-target') || (p.getAttribute('href') ? p.getAttribute('href').replace('#', '') : null);
            if (pTarget === targetId) {
                p.classList.add('active');
                p.setAttribute('aria-selected', 'true');
                p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                p.classList.remove('active');
                p.setAttribute('aria-selected', 'false');
            }
        });

        // 1b. Synchronize active state on Section 0 mobile category cards
        const mobileCategoryCards = document.querySelectorAll('#section-0 .section-0-grid .section-0-card[data-target]');
        mobileCategoryCards.forEach(c => {
            if (c.getAttribute('data-target') === targetId) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });

        // 2. Replace visible category section in menu container with smooth cross-fade
        let targetSection = null;
        landingCategorySections.forEach(section => {
            if (section.id === targetId) {
                targetSection = section;
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

        if (targetSection && typeof setupDietSectionTriggers === 'function') {
            setupDietSectionTriggers(targetSection, true);
        }

        // 3. Scroll position adjustment
        if (shouldScrollToDishes && targetSection) {
            // On mobile Section 0 card tap: smoothly auto-scroll down to the top of the category dishes
            const yOffset = -24;
            const targetPos = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({
                top: targetPos,
                behavior: 'smooth'
            });
        } else {
            // On desktop tab tap: gently ensure menu container top is in comfortable view if scrolled far
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
        }

        // 4. Recalibrate ScrollTrigger positions for newly active category
        if (typeof ScrollTrigger !== 'undefined') {
            setTimeout(() => ScrollTrigger.refresh(), 300);
        }
    }

    // Attach click events for Section 0 Mobile Category Cards (with scroll to dishes)
    const mobileSection0Cards = document.querySelectorAll('#section-0 .section-0-grid .section-0-card[data-target]');
    mobileSection0Cards.forEach(card => {
        const handleCardSelect = (e) => {
            e.preventDefault();
            const targetId = card.getAttribute('data-target');
            if (targetId) {
                activateMenuCategory(targetId, true);
            }
        };

        card.addEventListener('click', handleCardSelect);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleCardSelect(e);
            }
        });
    });

    // Attach click events for Desktop Category Nav Pills
    categoryPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = pill.getAttribute('data-target') || (pill.getAttribute('href') ? pill.getAttribute('href').replace('#', '') : null);
            if (targetId) {
                activateMenuCategory(targetId, false);
            }
        });
    });

    // Policy Modal Dialog Handlers
    const policyBtn = document.getElementById('footer-policy-trigger');
    const policyModal = document.getElementById('policy-modal');
    const policyClose = document.querySelector('.policy-modal-close');
    const policyBackdrop = document.querySelector('.policy-modal-backdrop');

    const openPolicy = (e) => {
        if (e) e.preventDefault();
        if (policyModal) {
            policyModal.classList.add('active');
            policyModal.setAttribute('aria-hidden', 'false');
        }
    };

    const closePolicy = () => {
        if (policyModal) {
            policyModal.classList.remove('active');
            policyModal.setAttribute('aria-hidden', 'true');
        }
    };

    if (policyBtn) policyBtn.addEventListener('click', openPolicy);
    if (policyClose) policyClose.addEventListener('click', closePolicy);
    if (policyBackdrop) policyBackdrop.addEventListener('click', closePolicy);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && policyModal && policyModal.classList.contains('active')) {
            closePolicy();
        }
    });
});

