document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // Hero Entrance: Synchronized GSAP Master Timeline (Apple-style power4.out)
    // =========================================================================
    const hasHero = !!document.querySelector('.hero-title');
    let heroEntranceTL = null;
    if (typeof gsap !== 'undefined') {
        if (hasHero) {
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
        } else {
            // Smoothly display navbar on other pages (checkout, menu)
            if (document.querySelector('.nav-logo')) {
                gsap.fromTo('.nav-logo', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
            }
        }
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

            // 1. Lock page scroll strictly on the hero section for 1.5 seconds
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            // 2. Play the video at 4.8x speed to complete the 5s clip in 1s
            heroVideo.currentTime = 0;
            heroVideo.playbackRate = 3.8;
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

            // 4. Hold on hero for 1.5 seconds, then unlock and smoothly transition to menu
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
            }, 1200);
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

    // =========================================================================
    // Meet Me Client-Side Database & Persistence Layer (meetMeDB)
    // =========================================================================
    const meetMeDB = {
        KEYS: {
            CART: 'meetme_cart',
            ORDERS: 'meetme_orders',
            RESERVATIONS: 'meetme_reservations',
            USER: 'meetme_user',
            COUPON: 'meetme_coupon'
        },

        getCart() {
            try {
                let data = localStorage.getItem(this.KEYS.CART);
                if (!data) {
                    data = localStorage.getItem('cart') || localStorage.getItem('mm_cart') || localStorage.getItem('meet_me_cart');
                }
                if (!data) return [];
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('meetMeDB: Error reading cart', e);
                return [];
            }
        },

        saveCart(cart) {
            try {
                localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
                window.dispatchEvent(new CustomEvent('meetme:cart-updated', { detail: { cart } }));
            } catch (e) {
                console.error('meetMeDB: Error saving cart', e);
            }
        },

        addToCart(item) {
            const cart = this.getCart();
            const cleanName = (item.name || 'Delicious Dish').trim();
            // Generate clean slug prefixed with mm-
            const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 46);
            const cleanId = (item.id && String(item.id).startsWith('mm-')) ? String(item.id) : `mm-${slug}`;
            const cleanPrice = parseFloat(item.price) || 0;
            const cleanImage = item.image || item.img || 'meet me .png';
            const cleanQty = parseInt(item.quantity || item.qty || 1, 10) || 1;

            const existingIndex = cart.findIndex(i => 
                (i.id && i.id.toLowerCase() === cleanId.toLowerCase()) || 
                (i.name && i.name.toLowerCase() === cleanName.toLowerCase())
            );

            if (existingIndex > -1) {
                cart[existingIndex].qty = (parseInt(cart[existingIndex].qty, 10) || 1) + cleanQty;
                if (cleanPrice > 0) cart[existingIndex].price = cleanPrice;
                if (!cart[existingIndex].id) cart[existingIndex].id = cleanId;
            } else {
                cart.push({
                    id: cleanId,
                    name: cleanName,
                    price: cleanPrice,
                    qty: cleanQty,
                    image: cleanImage
                });
            }
            this.saveCart(cart);
        },

        updateQty(idOrName, delta) {
            let cart = this.getCart();
            const target = String(idOrName || '').toLowerCase().trim();
            const idx = cart.findIndex(i => 
                (i.id && i.id.toLowerCase() === target) || 
                (i.name && i.name.toLowerCase() === target)
            );
            if (idx > -1) {
                cart[idx].qty = (parseInt(cart[idx].qty, 10) || 1) + delta;
                if (cart[idx].qty <= 0) {
                    cart.splice(idx, 1);
                }
                this.saveCart(cart);
            }
        },

        removeItem(idOrName) {
            let cart = this.getCart();
            const target = String(idOrName || '').toLowerCase().trim();
            cart = cart.filter(i => 
                (!i.id || i.id.toLowerCase() !== target) && 
                (!i.name || i.name.toLowerCase() !== target)
            );
            this.saveCart(cart);
        },

        clearCart() {
            this.saveCart([]);
        },


        getCartTotals() {
            const cart = this.getCart();
            const count = cart.reduce((sum, item) => sum + (parseInt(item.qty || item.quantity || 1, 10) || 1), 0);
            const subtotal = cart.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.qty || item.quantity || 1, 10) || 1)), 0);
            const tax = Math.round(subtotal * 0.05); // 5% GST
            const total = subtotal + tax;
            return { count, subtotal, tax, total };
        },

        getOrders() {
            try {
                const data = localStorage.getItem(this.KEYS.ORDERS);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                return [];
            }
        },

        saveOrder(order) {
            try {
                const orders = this.getOrders();
                orders.unshift(order);
                localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
                window.dispatchEvent(new CustomEvent('meetme:orders-updated', { detail: { orders } }));
            } catch (e) {
                console.error('meetMeDB: Error saving order', e);
            }
        },

        getReservations() {
            try {
                const data = localStorage.getItem(this.KEYS.RESERVATIONS);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                return [];
            }
        },

        saveReservation(res) {
            try {
                const list = this.getReservations();
                list.unshift(res);
                localStorage.setItem(this.KEYS.RESERVATIONS, JSON.stringify(list));
            } catch (e) {
                console.error('meetMeDB: Error saving reservation', e);
            }
        },

        getCustomerInfo() {
            try {
                const data = localStorage.getItem(this.KEYS.USER);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                return null;
            }
        },

        saveCustomerInfo(info) {
            try {
                const current = this.getCustomerInfo() || {};
                localStorage.setItem(this.KEYS.USER, JSON.stringify({ ...current, ...info }));
            } catch (e) {}
        }
    };

    window.meetMeDB = meetMeDB; // Expose globally

    // Helper: Escapes text for safe DOM rendering
    function escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // =========================================================================
    // Enhanced Toast Notification
    // =========================================================================
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
            padding: 12px 20px;
            border-radius: 9999px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            pointer-events: none;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 100002;
            border: 1.5px solid var(--accent-pop, #C2EB12);
        `;
        toast.innerHTML = `
            <span style="background: var(--accent-pop, #C2EB12); color: #12131A; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">ADDED</span>
            <span id="toast-message">Item added to selection!</span>
            <button id="toast-view-cart-btn" style="background: rgba(255,255,255,0.15); color: #FFFFFF; border: none; padding: 4px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 800; cursor: pointer; margin-left: 4px;">View Cart</button>
        `;
        document.body.appendChild(toast);
    }

    const toastMessage = document.getElementById('toast-message');
    const toastViewCartBtn = document.getElementById('toast-view-cart-btn');
    let toastTimer;

    function showToast(msg, tag = 'ADDED', showViewBtn = true) {
        if (toastMessage) {
            toastMessage.textContent = msg;
        }
        const tagEl = toast.querySelector('span:first-child');
        if (tagEl) tagEl.textContent = tag;
        if (toastViewCartBtn) {
            toastViewCartBtn.style.display = showViewBtn ? 'inline-block' : 'none';
        }

        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        toast.style.pointerEvents = 'auto';

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
            toast.style.pointerEvents = 'none';
        }, 3200);
    }

    if (toastViewCartBtn) {
        toastViewCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openCartDrawer();
        });
    }

    // =========================================================================
    // Cart Drawer & Floating Launcher UI Controller
    // =========================================================================
    const cartDrawer = document.getElementById('cart-drawer');
    const cartDrawerPanel = cartDrawer ? cartDrawer.querySelector('.cart-drawer-panel') : null;
    const cartDrawerItemsContainer = document.getElementById('cart-drawer-items');
    const cartDrawerEmpty = document.getElementById('cart-drawer-empty');
    const closeCartDrawerBtn = document.getElementById('close-cart-drawer-btn');
    const drawerClearBtn = document.getElementById('drawer-clear-btn');
    const drawerCheckoutBtn = document.getElementById('drawer-checkout-btn');

    const navCartBtn = document.getElementById('nav-cart-btn');
    const navCartBadge = document.getElementById('nav-cart-badge');
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const floatingCartBadge = document.getElementById('floating-cart-badge');
    const floatingCartTotal = document.getElementById('floating-cart-total');

    const drawerCountPill = document.getElementById('drawer-item-count-pill');
    const drawerSubtotal = document.getElementById('drawer-subtotal');
    const drawerTax = document.getElementById('drawer-tax');
    const drawerTotal = document.getElementById('drawer-total');

    function openCartDrawer() {
        if (!cartDrawer) return;
        renderCartDrawer();
        cartDrawer.classList.add('active');
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeCartDrawer() {
        if (!cartDrawer) return;
        cartDrawer.classList.remove('active');
        cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function triggerBadgeBounce() {
        [navCartBadge, floatingCartBadge].forEach(badge => {
            if (badge) {
                badge.classList.remove('badge-bounce');
                void badge.offsetWidth; // Trigger reflow
                badge.classList.add('badge-bounce');
            }
        });
    }

    function renderCartDrawer() {
        const cart = meetMeDB.getCart();
        const totals = meetMeDB.getCartTotals();

        // Update nav badges
        [navCartBadge, floatingCartBadge].forEach(badge => {
            if (badge) {
                badge.textContent = totals.count;
                if (totals.count > 0) {
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        });

        // Update floating cart label
        if (floatingCartTotal) {
            floatingCartTotal.textContent = `₹${totals.subtotal}`;
        }

        // Update summary numbers in drawer
        if (drawerCountPill) drawerCountPill.textContent = `${totals.count} item${totals.count === 1 ? '' : 's'}`;
        if (drawerSubtotal) drawerSubtotal.textContent = `₹${totals.subtotal}`;
        if (drawerTax) drawerTax.textContent = `₹${totals.tax}`;
        if (drawerTotal) drawerTotal.textContent = `₹${totals.total}`;

        if (!cartDrawerItemsContainer) return;

        if (cart.length === 0) {
            cartDrawerItemsContainer.innerHTML = `
                <div id="cart-drawer-empty" class="cart-drawer-empty">
                    <div class="empty-cart-illustration">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </div>
                    <h4>Your cart is empty</h4>
                    <p>Browse our 100+ fresh recipes and add your favorites!</p>
                    <a href="menu.html" class="drawer-browse-menu-btn" style="margin-top: 10px;">Explore Full Menu</a>
                </div>
            `;
            if (drawerCheckoutBtn) {
                drawerCheckoutBtn.style.opacity = '0.5';
                drawerCheckoutBtn.style.pointerEvents = 'none';
            }
        } else {
            if (drawerCheckoutBtn) {
                drawerCheckoutBtn.style.opacity = '1';
                drawerCheckoutBtn.style.pointerEvents = 'auto';
            }

            let itemsHtml = '';
            cart.forEach(item => {
                const itemTotal = (item.price || 0) * (item.qty || 1);
                const safeImg = escapeHtml(item.image || 'meet me .png');
                const safeName = escapeHtml(item.name || 'Dish');
                const safeId = escapeHtml(item.id || '');

                itemsHtml += `
                    <div class="cart-item-row" data-id="${safeId}">
                        <div class="cart-item-details">
                            <img src="${safeImg}" alt="${safeName}" class="cart-item-thumb" onerror="this.src='meet me .png'">
                            <div class="cart-item-info-text">
                                <h4>${safeName}</h4>
                                <span>₹${item.price} each</span>
                            </div>
                        </div>
                        <div class="qty-stepper">
                            <button type="button" class="qty-btn drawer-qty-dec" data-id="${safeId}" aria-label="Decrease quantity">−</button>
                            <span class="qty-val">${item.qty}</span>
                            <button type="button" class="qty-btn drawer-qty-inc" data-id="${safeId}" aria-label="Increase quantity">+</button>
                        </div>
                        <span class="cart-item-total-price">₹${itemTotal}</span>
                        <button type="button" class="cart-item-remove-btn drawer-item-del" data-id="${safeId}" aria-label="Remove item" title="Remove item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
            });
            cartDrawerItemsContainer.innerHTML = itemsHtml;
        }
    }

    // Attach drawer open/close triggers
    if (navCartBtn) {
        navCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCartDrawer();
        });
    }

    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCartDrawer();
        });
    }

    if (closeCartDrawerBtn) {
        closeCartDrawerBtn.addEventListener('click', closeCartDrawer);
    }

    if (cartDrawer) {
        cartDrawer.addEventListener('click', (e) => {
            if (e.target === cartDrawer) {
                closeCartDrawer();
            }
        });
    }

    if (drawerClearBtn) {
        drawerClearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                meetMeDB.clearCart();
                showToast('Cart cleared', 'INFO', false);
            }
        });
    }

    // Delegated events for drawer quantity steppers & deletion
    if (cartDrawerItemsContainer) {
        cartDrawerItemsContainer.addEventListener('click', (e) => {
            const decBtn = e.target.closest('.drawer-qty-dec');
            const incBtn = e.target.closest('.drawer-qty-inc');
            const delBtn = e.target.closest('.drawer-item-del');

            if (decBtn) {
                const id = decBtn.getAttribute('data-id');
                meetMeDB.updateQty(id, -1);
            } else if (incBtn) {
                const id = incBtn.getAttribute('data-id');
                meetMeDB.updateQty(id, 1);
            } else if (delBtn) {
                const id = delBtn.getAttribute('data-id');
                meetMeDB.removeItem(id);
            }
        });
    }

    // Global click listener for all menu order buttons
    document.addEventListener('click', (e) => {
        const orderBtn = e.target.closest('.item-order-btn');
        if (!orderBtn) return;

        e.preventDefault();
        const card = orderBtn.closest('.menu-item-card') || orderBtn.closest('.dish-item-card') || orderBtn.closest('article');
        const titleEl = card ? (card.querySelector('.item-title') || card.querySelector('h4') || card.querySelector('h3')) : null;
        const priceEl = card ? card.querySelector('.item-price') : null;
        const imgEl = card ? card.querySelector('.item-food-img') || card.querySelector('img') : null;

        const dishName = orderBtn.getAttribute('data-dish') || (titleEl ? titleEl.textContent.trim() : 'Delicious Dish');
        let rawPrice = orderBtn.getAttribute('data-price') || (priceEl ? priceEl.textContent.replace(/[^0-9]/g, '') : '0');
        const price = parseInt(rawPrice, 10) || 0;
        const imgSrc = imgEl ? (imgEl.getAttribute('src') || 'meet me .png') : 'meet me .png';

        meetMeDB.addToCart({
            id: dishName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: dishName,
            price: price,
            image: imgSrc,
            qty: 1
        });

        triggerBadgeBounce();
        showToast(`${dishName} (₹${price}) added to cart!`, 'ADDED', true);
    });

    // Listen to reactive cart updates
    window.addEventListener('meetme:cart-updated', () => {
        renderCartDrawer();
        if (typeof renderCheckoutPage === 'function') {
            renderCheckoutPage();
        }
    });

    // Initial drawer render
    renderCartDrawer();

    // =========================================================================
    // Table & Event Reservation Modal Controller
    // =========================================================================
    const reservationModal = document.getElementById('reservation-modal');
    const closeReservationModalBtn = document.getElementById('close-reservation-modal-btn');
    const tableReservationForm = document.getElementById('table-reservation-form') || document.getElementById('reservation-form');
    const resDateInput = document.getElementById('res-date');

    function openReservationModal() {
        if (!reservationModal) return;
        // Pre-fill date with today's date if empty
        if (resDateInput && !resDateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            resDateInput.value = today;
            resDateInput.min = today;
        }
        // Pre-fill user data if saved
        const savedUser = meetMeDB.getCustomerInfo();
        if (savedUser) {
            const resName = document.getElementById('res-name');
            const resPhone = document.getElementById('res-phone');
            if (resName && !resName.value && savedUser.name) resName.value = savedUser.name;
            if (resPhone && !resPhone.value && savedUser.phone) resPhone.value = savedUser.phone;
        }

        reservationModal.classList.add('active');
        reservationModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeReservationModal() {
        if (!reservationModal) return;
        reservationModal.classList.remove('active');
        reservationModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Attach triggers for reservation modal
    const bookingTriggers = document.querySelectorAll('#nav-bookings-link, a[href="#bookings"], #find-us-booking-trigger, .booking-modal-trigger');
    bookingTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openReservationModal();
        });
    });

    if (closeReservationModalBtn) {
        closeReservationModalBtn.addEventListener('click', closeReservationModal);
    }

    if (reservationModal) {
        reservationModal.addEventListener('click', (e) => {
            if (e.target === reservationModal) {
                closeReservationModal();
            }
        });
    }

    // Reservation Category radio visual toggle
    const resCategoryCards = document.querySelectorAll('.category-radio-card');
    resCategoryCards.forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', () => {
                resCategoryCards.forEach(c => c.classList.remove('active'));
                if (radio.checked) card.classList.add('active');
            });
        }
    });

    if (tableReservationForm) {
        tableReservationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const category = tableReservationForm.querySelector('input[name="res_category"]:checked')?.value || 'Table Dining';
            const name = document.getElementById('res-name')?.value.trim();
            const phone = document.getElementById('res-phone')?.value.trim();
            const date = document.getElementById('res-date')?.value;
            const time = document.getElementById('res-time')?.value;
            const guests = document.getElementById('res-guests')?.value;
            const area = document.getElementById('res-area')?.value;
            const notes = document.getElementById('res-notes')?.value.trim() || 'None';

            if (!name || !phone || !date || !time) {
                alert('Please fill in all required fields.');
                return;
            }

            if (!/^[0-9]{10}$/.test(phone)) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            const refId = `MM-RES-${Math.floor(1000 + Math.random() * 9000)}`;

            const reservation = {
                id: refId,
                category,
                name,
                phone,
                date,
                time,
                guests,
                area,
                notes,
                created: new Date().toISOString()
            };

            // Dispatch reservation to backend API
            const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
            const resEndpoint = isLocal 
                ? 'http://127.0.0.1:8000/api/reservations' 
                : 'https://www.bangalirsokherrannaghor.in/api/reservations';

            fetch(resEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Brand-Key': 'mm_live_cafe_2026'
                },
                body: JSON.stringify({
                    guest_name: name,
                    phone: phone,
                    email: null,
                    guests_count: parseInt(guests, 10) || 2,
                    reservation_date: date,
                    reservation_time: time,
                    special_request: notes !== 'None' ? notes : null,
                    event_type: category,
                    outlet_id: 'MM01',
                    brand: 'cafe'
                })
            }).catch(e => console.warn('Backend reservation dispatch note:', e));

            meetMeDB.saveReservation(reservation);
            meetMeDB.saveCustomerInfo({ name, phone });

            tableReservationForm.reset();
            closeReservationModal();

            showToast(`Table Reserved! Booking Ref: ${refId}`, 'BOOKED', false);

            // Construct WhatsApp Reservation dispatch message
            const waText = `*MEET ME CAFE & RESTAURANT - RESERVATION REQUEST*\n` +
                `------------------------------------\n` +
                `🔖 *Booking Ref:* ${refId}\n` +
                `👤 *Name:* ${name}\n` +
                `📞 *Phone:* ${phone}\n` +
                `🍱 *Category:* ${category}\n` +
                `📅 *Date:* ${date}\n` +
                `⏰ *Time Slot:* ${time}\n` +
                `👥 *Guests:* ${guests} Guests\n` +
                `🪑 *Preferred Seating:* ${area}\n` +
                `📝 *Notes:* ${notes}\n` +
                `------------------------------------\n` +
                `Kindly confirm my booking at Meet Me Cafe Kalyani. Thank you!`;

            const waUrl = `https://wa.me/918350002031?text=${encodeURIComponent(waText)}`;
            setTimeout(() => {
                if (confirm(`Your table reservation (${refId}) has been registered!\n\nWould you like to send this confirmation directly to our manager on WhatsApp?`)) {
                    window.open(waUrl, '_blank', 'noopener,noreferrer');
                }
            }, 400);
        });
    }

    // =========================================================================
    // Centralized Multi-Brand API Endpoints & Configuration (prompt.md)
    // =========================================================================
    const MEET_ME_CONFIG = {
        PROD_API_BASE: 'https://www.bangalirsokherrannaghor.in',
        LOCAL_API_BASE: 'http://127.0.0.1:8000',
        BRAND_KEY: 'mm_live_cafe_2026',
        OUTLET_ID: 'MM01',
        BRAND: 'cafe'
    };

    function getMeetMeApiBase() {
        const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        return isLocal ? MEET_ME_CONFIG.LOCAL_API_BASE : MEET_ME_CONFIG.PROD_API_BASE;
    }

    /**
     * Constructs and submits the Meet Me Cafe order payload to the backend API.
     * Conforms to the unified multi-brand specification on www.bangalirsokherrannaghor.in.
     * @param {Object} cartState - Cart state object containing customer inputs and items array.
     * @returns {Promise<Object>} Created order confirmation response from server.
     */
    async function submitMeetMeCafeOrder({
        customerName,
        customerPhone,
        orderType, // 'Dine-In' | 'Takeaway' | 'Delivery'
        tableNumber = null,
        deliveryAddress = null,
        couponCode = null,
        cartItems = [] // Array of { id, name, price, quantity/qty }
    }) {
        // 1. Client-Side Defensive Validations
        if (!customerName || customerName.trim().length < 2) {
            throw new Error('Please enter a valid customer name.');
        }
        if (!customerPhone || !/^\+?[0-9\s\-]{5,20}$/.test(customerPhone.trim())) {
            throw new Error('Please enter a valid contact phone number.');
        }
        if (!cartItems || cartItems.length === 0) {
            throw new Error('Your cafe order cart is empty.');
        }
        if (orderType === 'Dine-In' && (!tableNumber || !tableNumber.trim())) {
            throw new Error('Please enter your table number for Dine-In service.');
        }
        if (orderType === 'Delivery' && (!deliveryAddress || !deliveryAddress.trim())) {
            throw new Error('Please enter a complete delivery address.');
        }

        // 2. Construct Standardized Meet Me Cafe Payload
        const payload = {
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim(),
            order_type: orderType,
            table_number: orderType === 'Dine-In' ? tableNumber.trim() : null,
            delivery_address: orderType === 'Delivery' ? deliveryAddress.trim() : null,
            outlet_id: MEET_ME_CONFIG.OUTLET_ID,
            brand: MEET_ME_CONFIG.BRAND,
            coupon_code: couponCode ? couponCode.trim() : null,
            items: cartItems.map((item, idx) => ({
                id: item.id || `mm-item-${idx + 1}`,
                name: (item.name || 'Dish').trim(),
                price: parseFloat(item.price) || 0,
                qty: parseInt(item.quantity || item.qty || 1, 10)
            }))
        };

        // 3. Resolve API Endpoint & Headers per multi-brand specification
        const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        const primaryEndpoint = isLocal 
            ? `${MEET_ME_CONFIG.LOCAL_API_BASE}/api/orders`
            : `${MEET_ME_CONFIG.PROD_API_BASE}/api/orders`;
        const fallbackEndpoint = isLocal 
            ? `${MEET_ME_CONFIG.PROD_API_BASE}/api/orders` 
            : null;

        const requestHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Brand-Key': MEET_ME_CONFIG.BRAND_KEY
        };

        // 4. Dispatch HTTP POST Request with Automatic Fallback for local testing
        let response;
        try {
            response = await fetch(primaryEndpoint, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(payload)
            });
        } catch (fetchErr) {
            if (fallbackEndpoint) {
                console.warn(`Primary endpoint (${primaryEndpoint}) failed, trying fallback:`, fetchErr);
                try {
                    response = await fetch(fallbackEndpoint, {
                        method: 'POST',
                        headers: requestHeaders,
                        body: JSON.stringify(payload)
                    });
                } catch (fallbackErr) {
                    throw new Error('Unable to connect to order server. Please check your network connection.');
                }
            } else {
                throw new Error('Unable to connect to order server. Please check your network connection.');
            }
        }

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            let message = errorBody.detail || `Server returned HTTP ${response.status}`;
            if (Array.isArray(message)) {
                message = message.map(m => m.msg || m.detail || JSON.stringify(m)).join(', ');
            }
            throw new Error(`Order placement failed: ${message}`);
        }

        const orderResult = await response.json();

        // 5. Persist to Local Customer History (optional)
        try {
            const history = JSON.parse(localStorage.getItem('mm_cafe_order_history') || '[]');
            history.unshift(orderResult);
            localStorage.setItem('mm_cafe_order_history', JSON.stringify(history.slice(0, 20)));
        } catch (e) {
            console.warn('Could not persist order to localStorage', e);
        }

        return orderResult;
    }

    /**
     * Query order tracking information by Order ID.
     */
    async function fetchMeetMeCafeOrder(orderId) {
        const base = getMeetMeApiBase();
        const res = await fetch(`${base}/api/orders/${encodeURIComponent(orderId)}`, {
            headers: {
                'Accept': 'application/json',
                'X-Brand-Key': MEET_ME_CONFIG.BRAND_KEY
            }
        });
        if (!res.ok) throw new Error(`Could not fetch order: HTTP ${res.status}`);
        return await res.json();
    }

    /**
     * Track orders by customer phone number.
     */
    async function trackMeetMeCafeOrdersByPhone(phone) {
        const base = getMeetMeApiBase();
        const res = await fetch(`${base}/api/orders/track/${encodeURIComponent(phone)}`, {
            headers: {
                'Accept': 'application/json',
                'X-Brand-Key': MEET_ME_CONFIG.BRAND_KEY
            }
        });
        if (!res.ok) throw new Error(`Could not track orders: HTTP ${res.status}`);
        return await res.json();
    }

    window.MEET_ME_CONFIG = MEET_ME_CONFIG;
    window.submitMeetMeCafeOrder = submitMeetMeCafeOrder;
    window.fetchMeetMeCafeOrder = fetchMeetMeCafeOrder;
    window.trackMeetMeCafeOrdersByPhone = trackMeetMeCafeOrdersByPhone;


    function initCheckoutPage() {
        const checkoutForm = document.getElementById('page-checkout-form');
        if (!checkoutForm) return; // Not on checkout.html

        const pageCartItems = document.getElementById('page-cart-items');
        const pageClearCartBtn = document.getElementById('page-clear-cart-btn');
        const placeOrderBtn = document.getElementById('page-place-order-btn');
        const placeOrderIcon = document.getElementById('place-order-icon');
        const placeOrderText = document.getElementById('place-order-text');
        const checkoutErrorAlert = document.getElementById('checkout-error-alert');
        const checkoutErrorText = document.getElementById('checkout-error-text');

        const couponInput = document.getElementById('coupon-code-input');
        const applyCouponBtn = document.getElementById('apply-coupon-btn');
        const couponFeedback = document.getElementById('coupon-feedback');
        let activeCoupon = null;

        const pSubtotal = document.getElementById('p-subtotal');
        const pTax = document.getElementById('p-tax');
        const pDelivery = document.getElementById('p-delivery');
        const pDiscount = document.getElementById('p-discount');
        const pDiscountContainer = document.getElementById('p-discount-container');
        const pFinalTotal = document.getElementById('p-final-total');
        const cartItemCount = document.getElementById('cart-item-count');

        const deliveryAddressGroup = document.getElementById('delivery-address-group');
        const tableNumberGroup = document.getElementById('table-number-group');
        const takeawayInfoGroup = document.getElementById('takeaway-info-group');
        const pDeliveryAddress = document.getElementById('p-delivery-address');
        const pTableNumber = document.getElementById('p-table-number');

        const pName = document.getElementById('p-name');
        const pPhone = document.getElementById('p-phone');
        const pEmail = document.getElementById('p-email');
        const pNotes = document.getElementById('p-notes');

        // Pre-fill user details if known
        const savedUser = meetMeDB.getCustomerInfo();
        if (savedUser) {
            if (savedUser.name && pName && !pName.value) pName.value = savedUser.name;
            if (savedUser.phone && pPhone && !pPhone.value) pPhone.value = savedUser.phone;
            if (savedUser.email && pEmail && !pEmail.value) pEmail.value = savedUser.email;
            if (savedUser.address && pDeliveryAddress && !pDeliveryAddress.value) pDeliveryAddress.value = savedUser.address;
        }

        function showCheckoutError(msg) {
            if (checkoutErrorAlert && checkoutErrorText) {
                checkoutErrorText.textContent = msg;
                checkoutErrorAlert.classList.remove('hidden');
                checkoutErrorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                alert(msg);
            }
        }

        function hideCheckoutError() {
            if (checkoutErrorAlert) {
                checkoutErrorAlert.classList.add('hidden');
            }
        }

        // Order Type selector
        const orderTypeCards = document.querySelectorAll('.order-type-card');
        orderTypeCards.forEach(card => {
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.addEventListener('change', () => {
                    orderTypeCards.forEach(c => c.classList.remove('active'));
                    if (radio.checked) card.classList.add('active');
                    updateOrderTypeFields();
                    calculateCheckoutBill();
                    hideCheckoutError();
                });
            }
        });

        function getSelectedOrderType() {
            return document.querySelector('input[name="p-order-type"]:checked')?.value || 'Delivery';
        }

        function updateOrderTypeFields() {
            const type = getSelectedOrderType();
            if (type === 'Delivery') {
                if (deliveryAddressGroup) deliveryAddressGroup.classList.remove('hidden');
                if (tableNumberGroup) tableNumberGroup.classList.add('hidden');
                if (takeawayInfoGroup) takeawayInfoGroup.classList.add('hidden');
                if (pDeliveryAddress) pDeliveryAddress.required = true;
                if (pTableNumber) pTableNumber.required = false;
            } else if (type === 'Dine-In') {
                if (deliveryAddressGroup) deliveryAddressGroup.classList.add('hidden');
                if (tableNumberGroup) tableNumberGroup.classList.remove('hidden');
                if (takeawayInfoGroup) takeawayInfoGroup.classList.add('hidden');
                if (pDeliveryAddress) pDeliveryAddress.required = false;
                if (pTableNumber) pTableNumber.required = true;
            } else if (type === 'Takeaway') {
                if (deliveryAddressGroup) deliveryAddressGroup.classList.add('hidden');
                if (tableNumberGroup) tableNumberGroup.classList.add('hidden');
                if (takeawayInfoGroup) takeawayInfoGroup.classList.remove('hidden');
                if (pDeliveryAddress) pDeliveryAddress.required = false;
                if (pTableNumber) pTableNumber.required = false;
            }
        }

        // Coupon code handler
        if (applyCouponBtn && couponInput) {
            applyCouponBtn.addEventListener('click', () => {
                const code = couponInput.value.trim().toUpperCase();
                if (!code) {
                    showCouponFeedback('Please enter a coupon code.', false);
                    return;
                }

                const totals = meetMeDB.getCartTotals();
                if (totals.subtotal <= 0) {
                    showCouponFeedback('Please add items to your cart first.', false);
                    return;
                }

                if (code === 'MEETME10') {
                    activeCoupon = { code: 'MEETME10', discountType: 'percent', value: 10, label: '10% Off' };
                    showCouponFeedback('Coupon MEETME10 applied! 10% discount added.', true);
                } else if (code === 'CAFEWELCOME' || code === 'FIRSTBITE' || code === 'BSR50') {
                    if (totals.subtotal < 150) {
                        showCouponFeedback('Minimum order ₹150 required for this coupon.', false);
                        return;
                    }
                    activeCoupon = { code, discountType: 'flat', value: 50, label: '₹50 Off' };
                    showCouponFeedback(`Coupon ${code} applied! Flat ₹50 discount added.`, true);
                } else {
                    activeCoupon = null;
                    showCouponFeedback('Invalid promo code. Try MEETME10 or CAFEWELCOME.', false);
                }
                calculateCheckoutBill();
            });
        }

        function showCouponFeedback(msg, isSuccess) {
            if (!couponFeedback) return;
            couponFeedback.textContent = msg;
            couponFeedback.className = `coupon-feedback ${isSuccess ? 'success' : 'error'}`;
            couponFeedback.classList.remove('hidden');
        }

        function calculateCheckoutBill() {
            const totals = meetMeDB.getCartTotals();
            const orderType = getSelectedOrderType();
            const deliveryFee = (orderType === 'Delivery' && totals.count > 0) ? 40 : 0;

            let discountAmount = 0;
            if (activeCoupon && totals.subtotal > 0) {
                if (activeCoupon.discountType === 'percent') {
                    discountAmount = Math.round((totals.subtotal * activeCoupon.value) / 100);
                } else if (activeCoupon.discountType === 'flat') {
                    discountAmount = Math.min(activeCoupon.value, totals.subtotal);
                }
            }

            const grandTotal = totals.count > 0 
                ? Math.max(0, totals.subtotal + totals.tax + deliveryFee - discountAmount)
                : 0;

            if (pSubtotal) pSubtotal.textContent = `₹${totals.subtotal}`;
            if (pTax) pTax.textContent = `₹${totals.tax}`;
            if (pDelivery) {
                if (totals.count === 0) {
                    pDelivery.textContent = '₹0';
                } else {
                    pDelivery.textContent = deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE';
                }
            }
            if (cartItemCount) cartItemCount.textContent = totals.count;

            if (discountAmount > 0) {
                if (pDiscountContainer) pDiscountContainer.classList.remove('hidden');
                if (pDiscount) pDiscount.textContent = `-₹${discountAmount}`;
            } else {
                if (pDiscountContainer) pDiscountContainer.classList.add('hidden');
            }

            if (pFinalTotal) pFinalTotal.textContent = `₹${grandTotal}`;

            return {
                subtotal: totals.subtotal,
                tax: totals.tax,
                deliveryFee,
                discount: discountAmount,
                grandTotal,
                count: totals.count
            };
        }

        function renderCheckoutPage() {
            const cart = meetMeDB.getCart();
            const bill = calculateCheckoutBill();

            if (!pageCartItems) return;

            if (cart.length === 0) {
                if (cartItemCount) cartItemCount.textContent = '0';
                pageCartItems.innerHTML = `
                    <div style="text-align: center; padding: 48px 20px;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(18,19,26,0.3)" stroke-width="1.8" style="margin-bottom: 12px;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        <h4 style="font-family: var(--font-primary); font-size: 1.1rem; font-weight: 800; color: var(--color-text-midnight-black, #12131A); margin: 0 0 8px;">Your Cart is Empty</h4>
                        <p style="font-size: 0.9rem; color: rgba(18, 19, 26, 0.6); margin: 0 0 20px;">Select from over 100+ fresh delicacies on our menu.</p>
                        <a href="menu.html" class="drawer-btn-primary" style="display: inline-flex; width: auto; text-decoration: none; padding: 12px 24px;">Browse Full Menu</a>
                    </div>
                `;
                if (placeOrderBtn) {
                    placeOrderBtn.style.opacity = '0.5';
                    placeOrderBtn.style.pointerEvents = 'none';
                }
            } else {
                if (placeOrderBtn) {
                    placeOrderBtn.style.opacity = '1';
                    placeOrderBtn.style.pointerEvents = 'auto';
                }

                let itemsHtml = '';
                cart.forEach(item => {
                    const itemQty = parseInt(item.qty || item.quantity || 1, 10) || 1;
                    const itemPrice = parseFloat(item.price) || 0;
                    const itemTotal = itemPrice * itemQty;
                    const safeImg = escapeHtml(item.image || item.img || 'meet me .png');
                    const safeName = escapeHtml(item.name || 'Dish');
                    const safeId = escapeHtml(item.id || '');

                    itemsHtml += `
                        <div class="page-cart-item" data-id="${safeId}">
                            <div class="page-cart-item-info">
                                <img src="${safeImg}" alt="${safeName}" class="page-cart-item-img" onerror="this.src='meet me .png'">
                                <div>
                                    <h4 class="page-cart-item-title">${safeName}</h4>
                                    <span class="page-cart-item-price">₹${itemPrice} each</span>
                                </div>
                            </div>
                            <div class="page-cart-item-actions">
                                <div class="qty-stepper">
                                    <button type="button" class="qty-btn page-qty-dec" data-id="${safeId}" aria-label="Decrease quantity">−</button>
                                    <span class="qty-val">${itemQty}</span>
                                    <button type="button" class="qty-btn page-qty-inc" data-id="${safeId}" aria-label="Increase quantity">+</button>
                                </div>
                                <span class="cart-item-total-price">₹${itemTotal}</span>
                                <button type="button" class="cart-item-remove-btn page-item-del" data-id="${safeId}" aria-label="Remove item" title="Remove item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                    `;
                });
                pageCartItems.innerHTML = itemsHtml;
            }
        }
        window.renderCheckoutPage = renderCheckoutPage;

        // Steppers on checkout page
        if (pageCartItems) {
            pageCartItems.addEventListener('click', (e) => {
                const decBtn = e.target.closest('.page-qty-dec');
                const incBtn = e.target.closest('.page-qty-inc');
                const delBtn = e.target.closest('.page-item-del');

                if (decBtn) {
                    meetMeDB.updateQty(decBtn.getAttribute('data-id'), -1);
                } else if (incBtn) {
                    meetMeDB.updateQty(incBtn.getAttribute('data-id'), 1);
                } else if (delBtn) {
                    meetMeDB.removeItem(delBtn.getAttribute('data-id'));
                }
            });
        }

        if (pageClearCartBtn) {
            pageClearCartBtn.addEventListener('click', () => {
                if (confirm('Clear all items from your checkout cart?')) {
                    meetMeDB.clearCart();
                }
            });
        }

        // Multi-tab and back-forward navigation storage sync
        window.addEventListener('storage', (e) => {
            if (e.key === meetMeDB.KEYS.CART || e.key === 'cart') {
                renderCheckoutPage();
            }
        });
        window.addEventListener('pageshow', () => {
            renderCheckoutPage();
        });

        // Checkout form submission
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideCheckoutError();

            const cart = meetMeDB.getCart();
            if (cart.length === 0) {
                showCheckoutError('Your cart is empty. Please add delicious items from the menu before checking out.');
                return;
            }

            const name = pName ? pName.value.trim() : '';
            const phone = pPhone ? pPhone.value.trim() : '';
            const email = pEmail ? pEmail.value.trim() : '';
            const notes = pNotes ? pNotes.value.trim() : '';
            const orderType = getSelectedOrderType();
            const tableNumber = orderType === 'Dine-In' ? (pTableNumber ? pTableNumber.value.trim() : '') : null;
            const deliveryAddress = orderType === 'Delivery' ? (pDeliveryAddress ? pDeliveryAddress.value.trim() : '') : null;
            const paymentMethod = document.querySelector('input[name="p-payment-method"]:checked')?.value || 'UPI / QR Code';

            if (!name || name.length < 2) {
                showCheckoutError('Please enter a valid customer name (at least 2 characters).');
                pName?.focus();
                return;
            }

            if (!phone || !/^\+?[0-9\s\-]{5,20}$/.test(phone)) {
                showCheckoutError('Please provide a valid contact phone number.');
                pPhone?.focus();
                return;
            }

            if (orderType === 'Dine-In' && (!tableNumber || !tableNumber.trim())) {
                showCheckoutError('Please enter your table number for Dine-In table service.');
                pTableNumber?.focus();
                return;
            }

            if (orderType === 'Delivery' && (!deliveryAddress || !deliveryAddress.trim())) {
                showCheckoutError('Please enter your full delivery address in Kalyani.');
                pDeliveryAddress?.focus();
                return;
            }

            const bill = calculateCheckoutBill();

            // Set loading state on submit button
            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.style.opacity = '0.75';
                placeOrderBtn.style.pointerEvents = 'none';
            }
            if (placeOrderIcon) placeOrderIcon.style.display = 'none';
            if (placeOrderText) placeOrderText.innerHTML = '<span class="submit-spinner"></span> Placing Order...';

            let orderResult;
            try {
                // Dispatch to POST /api/orders using standardized multi-brand cafe contract
                orderResult = await submitMeetMeCafeOrder({
                    customerName: name,
                    customerPhone: phone,
                    orderType,
                    tableNumber,
                    deliveryAddress,
                    couponCode: activeCoupon ? activeCoupon.code : null,
                    cartItems: cart
                });
            } catch (err) {
                console.warn('Backend API request error, checking fallback', err);
                showCheckoutError(err.message || 'Order placement failed. Please verify your details or connection.');
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.style.opacity = '1';
                    placeOrderBtn.style.pointerEvents = 'auto';
                }
                if (placeOrderIcon) placeOrderIcon.style.display = 'inline-block';
                if (placeOrderText) placeOrderText.textContent = 'Place Order & Confirm';
                return;
            }

            // Restore submit button
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.style.opacity = '1';
                placeOrderBtn.style.pointerEvents = 'auto';
            }
            if (placeOrderIcon) placeOrderIcon.style.display = 'inline-block';
            if (placeOrderText) placeOrderText.textContent = 'Place Order & Confirm';

            // Construct unified order record
            const confirmedId = orderResult.id || `MM-MM01-2026-${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
            const confirmedDate = orderResult.created_at || new Date().toISOString();
            const now = new Date(confirmedDate);
            const formattedDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
                ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

            const order = {
                id: confirmedId,
                date: confirmedDate,
                formattedDate,
                items: orderResult.items && orderResult.items.length > 0 ? orderResult.items : [...cart],
                orderType: orderResult.order_type || orderType,
                tableNumber: orderResult.table_number || tableNumber,
                deliveryAddress: orderResult.delivery_address || deliveryAddress,
                customer: {
                    name: orderResult.customer_name || name,
                    phone: orderResult.customer_phone || phone,
                    email,
                    address: orderResult.delivery_address || orderResult.table_number || (orderType === 'Takeaway' ? 'Takeaway Counter' : ''),
                    notes,
                    outlet: 'Meet Me Cafe - Kalyani Branch (MM01)'
                },
                paymentMethod,
                subtotal: orderResult.subtotal !== undefined ? orderResult.subtotal : bill.subtotal,
                tax: bill.tax,
                delivery: bill.deliveryFee,
                discount: orderResult.discount !== undefined ? orderResult.discount : bill.discount,
                coupon: orderResult.coupon_code || (activeCoupon ? activeCoupon.code : null),
                total: orderResult.total !== undefined ? orderResult.total : bill.grandTotal,
                status: orderResult.status || 'Confirmed'
            };

            // Save order & customer details to localStorage
            meetMeDB.saveOrder(order);
            meetMeDB.saveCustomerInfo({ name, phone, email, address: deliveryAddress || '' });

            // Clear active cart
            meetMeDB.clearCart();

            // Reveal digital receipt & hide main view
            const checkoutMainView = document.getElementById('checkout-main-view');
            const checkoutReceiptView = document.getElementById('checkout-receipt-view');
            const receiptContent = document.getElementById('p-receipt-content');
            const whatsappBtn = document.getElementById('p-whatsapp-order-btn');
            const printReceiptBtn = document.getElementById('p-print-receipt-btn');

            if (checkoutMainView) checkoutMainView.classList.add('hidden');
            if (checkoutReceiptView) checkoutReceiptView.classList.remove('hidden');

            // Render Digital Receipt HTML
            if (receiptContent) {
                let itemsListHtml = '';
                order.items.forEach(it => {
                    const itemQty = it.qty || it.quantity || 1;
                    const itemPrice = parseFloat(it.price) || 0;
                    itemsListHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed rgba(18,19,26,0.08); font-size: 0.92rem;">
                            <div>
                                <strong style="color: var(--color-text-midnight-black, #12131A);">${escapeHtml(it.name)}</strong>
                                <span style="color: rgba(18,19,26,0.6); font-size: 0.8rem; margin-left: 6px;">× ${itemQty}</span>
                            </div>
                            <strong style="color: var(--color-text-midnight-black, #12131A);">₹${itemPrice * itemQty}</strong>
                        </div>
                    `;
                });

                const destinationInfo = order.orderType === 'Delivery'
                    ? `<div><strong>Delivery Address:</strong> ${escapeHtml(order.deliveryAddress || 'Doorstep Kalyani')}</div>`
                    : (order.orderType === 'Dine-In'
                        ? `<div><strong>Dine-In Table:</strong> ${escapeHtml(order.tableNumber || 'Table Dining')}</div>`
                        : `<div><strong>Pickup Service:</strong> Express Counter Pickup (MM01)</div>`);

                receiptContent.innerHTML = `
                    <div style="background: #FAFAFB; border-radius: 18px; border: 1.5px solid rgba(18,19,26,0.08); padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px dashed rgba(18,19,26,0.12); padding-bottom: 16px; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                            <div>
                                <span style="font-size: 0.78rem; font-weight: 700; color: rgba(18,19,26,0.5); text-transform: uppercase;">Official Order ID</span>
                                <h3 style="font-family: var(--font-primary); font-size: 1.35rem; font-weight: 900; color: var(--color-accent-electric-lavender, #A259FF); margin: 2px 0 0;">#${order.id}</h3>
                                <span style="font-size: 0.82rem; color: rgba(18,19,26,0.6);">${order.formattedDate}</span>
                            </div>
                            <div style="text-align: right;">
                                <span class="history-order-badge" style="font-size: 0.82rem; padding: 4px 10px;">${order.orderType}</span>
                                <div style="font-size: 0.8rem; color: rgba(18,19,26,0.6); margin-top: 4px;">Meet Me Cafe • Kalyani (MM01)</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 18px; font-size: 0.88rem; color: rgba(18,19,26,0.75); line-height: 1.5;">
                            <div><strong>Customer:</strong> ${escapeHtml(order.customer.name)} (${escapeHtml(order.customer.phone)})</div>
                            ${destinationInfo}
                            ${order.customer.notes ? `<div><strong>Kitchen Notes:</strong> ${escapeHtml(order.customer.notes)}</div>` : ''}
                            <div><strong>Payment Option:</strong> ${escapeHtml(order.paymentMethod)}</div>
                        </div>

                        <div style="border-top: 1.5px solid rgba(18,19,26,0.08); padding-top: 12px; margin-bottom: 14px;">
                            ${itemsListHtml}
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem; color: rgba(18,19,26,0.7);">
                            <div style="display: flex; justify-content: space-between;"><span>Items Subtotal:</span><span>₹${order.subtotal}</span></div>
                            <div style="display: flex; justify-content: space-between;"><span>GST (5%):</span><span>₹${order.tax}</span></div>
                            <div style="display: flex; justify-content: space-between;"><span>${order.orderType === 'Delivery' ? 'Delivery Fee' : 'Packaging'}:</span><span>${order.delivery > 0 ? `₹${order.delivery}` : 'FREE'}</span></div>
                            ${order.discount > 0 ? `<div style="display: flex; justify-content: space-between; color: #16a34a; font-weight: 700;"><span>Promo Discount (${escapeHtml(order.coupon)}):</span><span>-₹${order.discount}</span></div>` : ''}
                            <hr style="border: none; border-top: 1.5px solid rgba(18,19,26,0.1); margin: 8px 0;">
                            <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 900; color: var(--color-text-midnight-black, #12131A);">
                                <span>Grand Total:</span>
                                <span style="color: var(--color-accent-electric-lavender, #A259FF);">₹${order.total}</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Construct WhatsApp Order Dispatch Link
            let waItemsText = '';
            order.items.forEach(it => {
                const qty = it.qty || it.quantity || 1;
                waItemsText += `• ${qty}x ${it.name} (₹${(parseFloat(it.price) || 0) * qty})\n`;
            });

            const destinationLine = order.orderType === 'Delivery'
                ? `📍 *Address:* ${order.deliveryAddress || 'Doorstep Delivery'}\n`
                : (order.orderType === 'Dine-In'
                    ? `🍽️ *Table:* ${order.tableNumber || 'Table Service'}\n`
                    : `🛍️ *Service:* Express Counter Pickup\n`);

            const waOrderMsg = `*OFFICIAL ORDER - MEET ME CAFE & RESTAURANT*\n` +
                `------------------------------------\n` +
                `🧾 *Order ID:* #${order.id}\n` +
                `📅 *Date:* ${order.formattedDate}\n` +
                `🛵 *Type:* ${order.orderType}\n` +
                `🏢 *Outlet:* Meet Me Kalyani (MM01)\n` +
                `👤 *Customer:* ${order.customer.name}\n` +
                `📞 *Phone:* ${order.customer.phone}\n` +
                destinationLine +
                `${order.customer.notes ? `📝 *Notes:* ${order.customer.notes}\n` : ''}` +
                `💳 *Payment:* ${order.paymentMethod}\n` +
                `------------------------------------\n` +
                `*ITEMS ORDERED:*\n` +
                waItemsText +
                `------------------------------------\n` +
                `Subtotal: ₹${order.subtotal}\n` +
                `GST (5%): ₹${order.tax}\n` +
                `Delivery: ${order.delivery > 0 ? `₹${order.delivery}` : 'FREE'}\n` +
                (order.discount > 0 ? `Discount: -₹${order.discount} (${order.coupon})\n` : '') +
                `*TOTAL BILL: ₹${order.total}*\n` +
                `------------------------------------\n` +
                `Please confirm this order. Thank you!`;

            if (whatsappBtn) {
                whatsappBtn.href = `https://wa.me/918350002031?text=${encodeURIComponent(waOrderMsg)}`;
            }

            if (printReceiptBtn) {
                printReceiptBtn.onclick = () => window.print();
            }

            // Refresh history section
            renderHistoryOrders();

            // Scroll to receipt top smoothly
            checkoutReceiptView?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });


        // Initialize view
        updateOrderTypeFields();
        renderCheckoutPage();
        renderHistoryOrders();
    }

    function renderHistoryOrders() {
        const historyContainer = document.getElementById('page-history-list');
        if (!historyContainer) return;

        const orders = meetMeDB.getOrders();
        if (orders.length === 0) {
            historyContainer.innerHTML = `
                <div style="background: #FFFFFF; border-radius: 16px; border: 1.5px solid rgba(18,19,26,0.06); padding: 32px; text-align: center; color: rgba(18,19,26,0.5);">
                    <p style="margin: 0; font-size: 0.95rem;">No past orders found on this device yet. Start your first order above!</p>
                </div>
            `;
            return;
        }

        let html = '';
        orders.forEach(ord => {
            const itemsCount = ord.items.reduce((s, it) => s + (it.qty || 1), 0);
            const itemsNames = ord.items.map(it => `${it.qty}x ${escapeHtml(it.name)}`).join(', ');

            html += `
                <div class="history-order-card">
                    <div class="history-order-meta">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                            <h4>#${escapeHtml(ord.id)}</h4>
                            <span class="history-order-badge">${escapeHtml(ord.orderType || 'Order')}</span>
                        </div>
                        <p>${escapeHtml(ord.formattedDate || '')} • ${itemsCount} items (${itemsNames.length > 50 ? itemsNames.slice(0, 48) + '...' : itemsNames})</p>
                        <span style="font-size: 0.78rem; color: #16a34a; font-weight: 700;">● ${escapeHtml(ord.status || 'Confirmed')}</span>
                    </div>
                    <div class="history-order-actions">
                        <span class="history-order-total">₹${ord.total}</span>
                        <button type="button" class="history-reorder-btn" data-order-id="${escapeHtml(ord.id)}">Reorder Items</button>
                    </div>
                </div>
            `;
        });
        historyContainer.innerHTML = html;

        // Attach Reorder buttons
        historyContainer.querySelectorAll('.history-reorder-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-order-id');
                const targetOrder = orders.find(o => o.id === orderId);
                if (targetOrder && targetOrder.items) {
                    targetOrder.items.forEach(it => {
                        meetMeDB.addToCart(it);
                    });
                    showToast(`Items from order #${orderId} added to cart!`, 'REORDERED', true);
                    openCartDrawer();
                }
            });
        });
    }

    // Initialize checkout page controller if present
    initCheckoutPage();

    // Global keydown handler: close modals on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartDrawer();
            closeReservationModal();
        }
    });


    // Landing page Category Activation for #page3 Desktop Nav Pills
    const categoryPills = document.querySelectorAll('#page3 .menu-categories-nav .category-pill');
    const landingCategorySections = document.querySelectorAll('#page3 .menu-category-section');

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

        // 3. Scroll position adjustment for desktop tab tap
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

        // 4. Recalibrate ScrollTrigger positions for newly active category
        if (typeof ScrollTrigger !== 'undefined') {
            setTimeout(() => ScrollTrigger.refresh(), 300);
        }
    }

    // Attach click events for Landing Page Category Nav Pills
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

    // =========================================================================
    // Diagonal Marquee Text Page Transition to Menu
    // =========================================================================
    const transitionOverlay = document.getElementById('page-transition-overlay');

    if (transitionOverlay) {
        let isTransitioning = false;

        const categoryTransitionMap = {
            'cat-all': {
                primary: 'ALL SPECIALS',
                subs: ['CHEF PICKS', 'SIGNATURE FLAVORS', 'CRAFTED FRESH', 'MEET ME SPECIALS']
            },
            'cat-appetizers': {
                primary: 'APPETIZERS',
                subs: ['CRISPY MOMOS', 'INDO CHINESE', 'DRY CHILI CHICKEN', 'HOT STARTERS']
            },
            'cat-continental': {
                primary: 'CONTINENTAL',
                subs: ['GOURMET BURGERS', 'LOADED WRAPS', 'CRISPY FRIES', 'CHEF CREATIONS']
            },
            'cat-beverages': {
                primary: 'BEVERAGES',
                subs: ['MATCHA LATTE', 'ARTISANAL BREWS', 'CHILLED MOJITOS', 'REFRESHERS']
            },
            'cat-shakes': {
                primary: 'SHAKES',
                subs: ['OREO THICK SHAKE', 'RICH CHOCOLATE', 'CREAMY BLENDS', 'ICE COLD']
            },
            'cat-desserts': {
                primary: 'DESSERTS',
                subs: ['BELGIAN WAFFLES', 'SWEET INDULGENCE', 'WARM BROWNIES', 'FRESH TOPPINGS']
            },
            'cat-combos': {
                primary: 'COMBOS',
                subs: ['GRAND FEASTS', 'COMBO MEALS', 'VALUE PLATTERS', 'FEAST TOGETHER']
            }
        };

        const defaultTaglineRows = [
            'WHERE FLAVORS MEET GOOD TIMES',
            'EXPLORE THE FULL MENU',
            'MEET ME CAFE AND RESTAURANT',
            '100+ DISHES CRAFTED FRESH',
            'WHERE FLAVORS MEET GOOD TIMES',
            'INDO CHINESE CONTINENTAL SHAKES',
            'EXPLORE THE FULL MENU',
            'GOOD FOOD GOOD MOOD',
            'MEET ME CAFE AND RESTAURANT'
        ];

        function buildCategoryRows(primary, subs) {
            return [
                primary,
                subs[0],
                primary,
                subs[1],
                primary,
                subs[2],
                primary,
                subs[3],
                primary
            ];
        }

        function getPhrasesForLink(anchor) {
            const href = anchor.getAttribute('href') || '';
            let catKey = null;

            if (href.includes('#')) {
                catKey = href.split('#')[1];
            } else if (anchor.dataset.category) {
                catKey = anchor.dataset.category;
            }

            if (catKey && categoryTransitionMap[catKey]) {
                const info = categoryTransitionMap[catKey];
                return buildCategoryRows(info.primary, info.subs);
            }

            const titleEl = anchor.querySelector('.section-0-card-title');
            if (titleEl) {
                const txt = titleEl.textContent.trim().toUpperCase();
                if (txt.includes('APPETIZERS')) return buildCategoryRows('APPETIZERS', ['CRISPY MOMOS', 'INDO CHINESE', 'DRY CHILI CHICKEN', 'HOT STARTERS']);
                if (txt.includes('CONTINENTAL')) return buildCategoryRows('CONTINENTAL', ['GOURMET BURGERS', 'LOADED WRAPS', 'CRISPY FRIES', 'CHEF CREATIONS']);
                if (txt.includes('BEVERAGES')) return buildCategoryRows('BEVERAGES', ['MATCHA LATTE', 'ARTISANAL BREWS', 'CHILLED MOJITOS', 'REFRESHERS']);
                if (txt.includes('SHAKES')) return buildCategoryRows('SHAKES', ['OREO THICK SHAKE', 'RICH CHOCOLATE', 'CREAMY BLENDS', 'ICE COLD']);
                if (txt.includes('DESSERTS')) return buildCategoryRows('DESSERTS', ['BELGIAN WAFFLES', 'SWEET INDULGENCE', 'WARM BROWNIES', 'FRESH TOPPINGS']);
                if (txt.includes('COMBOS')) return buildCategoryRows('COMBOS', ['GRAND FEASTS', 'COMBO MEALS', 'VALUE PLATTERS', 'FEAST TOGETHER']);
                if (txt.includes('SPECIALS')) return buildCategoryRows('ALL SPECIALS', ['CHEF PICKS', 'SIGNATURE FLAVORS', 'CRAFTED FRESH', 'MEET ME SPECIALS']);
            }

            return defaultTaglineRows;
        }

        function populateTracks(phrases) {
            const tracks = transitionOverlay.querySelectorAll('.transition-stream-track');
            tracks.forEach((track, index) => {
                const phrase = phrases[index % phrases.length];
                // Continuous text with spaces only - NO separators
                const singleChunk = phrase + ' \u00A0 \u00A0 \u00A0 ';
                const repeatedText = singleChunk.repeat(20);
                track.innerHTML = `
                    <div class="stream-inner">
                        <span>${repeatedText}</span>
                        <span>${repeatedText}</span>
                    </div>
                `;
            });
        }

        function resetTransitionOverlay() {
            isTransitioning = false;
            transitionOverlay.setAttribute('aria-hidden', 'true');
            transitionOverlay.style.pointerEvents = 'none';
            transitionOverlay.style.visibility = 'hidden';
            transitionOverlay.style.opacity = '0';
            transitionOverlay.style.clipPath = 'circle(0% at 50% 50%)';
            transitionOverlay.style.webkitClipPath = 'circle(0% at 50% 50%)';
        }

        // Initialize default tagline text so DOM is primed
        populateTracks(defaultTaglineRows);

        // =====================================================================
        // Image Preloader for menu.html during transition period
        // =====================================================================
        const preloadedImageUrls = new Set();
        let isDocPrefetched = false;

        const categoryImageMap = {
            'cat-all': [
                'images/chicken_strips.jpg',
                'images/dish_fried_wings.jpg',
                'images/dish_chicken_fried_leg.jpg',
                'images/chicken_kurkure_momo.jpg',
                'images/dry_chili_chicken.jpg',
                'images/chicken_burger.jpg',
                'images/fish_and_chips.jpg',
                'images/kolkata_fish_fry.jpg',
                'images/matcha_latte.jpg',
                'images/oreo_shake.jpg',
                'images/belgian_waffle.jpg',
                'images/combo_feast.jpg'
            ],
            'cat-appetizers': [
                'images/chicken_strips.jpg',
                'images/dish_fried_wings.jpg',
                'images/dish_chicken_fried_leg.jpg',
                'images/dish_chicken_chatpata.jpg',
                'images/dish_dry_chili_fish.jpg',
                'images/fish_and_chips.jpg',
                'images/kolkata_fish_fry.jpg',
                'images/dish_chicken_cutlet.jpg',
                'images/dish_nuggets.jpg',
                'images/chicken_kurkure_momo.jpg',
                'images/dry_chili_chicken.jpg'
            ],
            'cat-continental': [
                'images/chicken_burger.jpg',
                'images/dish_cheese_chicken_burger.jpg',
                'images/dish_jumbo_chicken_burger.jpg',
                'images/club_sandwich.jpg',
                'images/creamy_pasta.jpg',
                'images/dish_classic_french_fry.jpg',
                'images/peri_peri_fries.jpg',
                'images/dish_chicken_wrap.jpg'
            ],
            'cat-beverages': [
                'images/hot_coffee.jpg',
                'images/matcha_latte.jpg',
                'images/cold_coffee.jpg',
                'images/bubble_tea.jpg',
                'images/blue_mocktail.jpg',
                'images/virgin_mojito.jpg',
                'images/masala_chai.jpg',
                'images/fresh_juice.jpg'
            ],
            'cat-shakes': [
                'images/oreo_shake.jpg',
                'images/belgian_chocolate_shake.jpg',
                'images/kitkat_shake.jpg',
                'images/fruit_smoothie.jpg',
                'images/mango_lassi.jpg'
            ],
            'cat-desserts': [
                'images/belgian_waffle.jpg',
                'images/choco_lava.jpg',
                'images/belgian_chocolate_shake.jpg'
            ],
            'cat-combos': [
                'images/combo_feast.jpg',
                'images/chicken_steam_momo.jpg',
                'images/chicken_burger.jpg',
                'images/soft_drink.jpg'
            ]
        };

        const globalMenuAssets = [
            'meet me .png',
            'images/chicken_strips.jpg',
            'images/dry_chili_chicken.jpg',
            'images/chicken_burger.jpg',
            'images/matcha_latte.jpg'
        ];

        function preloadTargetImages(targetUrl) {
            if (!targetUrl) return;

            // 1. Prefetch menu.html document
            if (!isDocPrefetched) {
                isDocPrefetched = true;
                try {
                    const prefetch = document.createElement('link');
                    prefetch.rel = 'prefetch';
                    prefetch.href = 'menu.html';
                    document.head.appendChild(prefetch);
                } catch (_) {}
            }

            // 2. Identify category from url hash
            let catKey = null;
            if (targetUrl.includes('#')) {
                catKey = targetUrl.split('#')[1];
            }

            const imagesToLoad = [];
            if (catKey && categoryImageMap[catKey]) {
                imagesToLoad.push(...categoryImageMap[catKey]);
            } else {
                imagesToLoad.push(...categoryImageMap['cat-all']);
            }
            imagesToLoad.push(...globalMenuAssets);

            // 3. Preload all selected images into browser cache
            imagesToLoad.forEach(src => {
                if (!src || preloadedImageUrls.has(src)) return;
                preloadedImageUrls.add(src);

                const img = new Image();
                img.decoding = 'async';
                img.src = src;

                try {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.as = 'image';
                    link.href = src;
                    document.head.appendChild(link);
                } catch (_) {}
            });
        }

        function triggerTransition(targetUrl, phrases, clickX, clickY) {
            if (isTransitioning) return;
            isTransitioning = true;

            // Immediately start preloading menu.html images during the transition window
            preloadTargetImages(targetUrl);

            populateTracks(phrases);

            const originX = typeof clickX === 'number' ? clickX : (window.innerWidth / 2);
            const originY = typeof clickY === 'number' ? clickY : (window.innerHeight / 2);

            transitionOverlay.setAttribute('aria-hidden', 'false');
            transitionOverlay.style.pointerEvents = 'all';

            const startClip = `circle(0% at ${originX}px ${originY}px)`;
            const endClip = `circle(160% at ${originX}px ${originY}px)`;

            if (typeof gsap !== 'undefined') {
                gsap.set(transitionOverlay, {
                    visibility: 'visible',
                    opacity: 1,
                    clipPath: startClip,
                    webkitClipPath: startClip
                });

                const tl = gsap.timeline({
                    onComplete: () => {
                        window.location.href = targetUrl;
                    }
                });

                tl.to(transitionOverlay, {
                    clipPath: endClip,
                    webkitClipPath: endClip,
                    duration: 0.65,
                    ease: 'power3.inOut'
                }, 0);

                tl.fromTo('.transition-rotator', 
                    { scale: 1.08 },
                    { scale: 1, duration: 1.2, ease: 'power2.out' },
                    0
                );

                const tracks = transitionOverlay.querySelectorAll('.transition-stream-track');
                tl.fromTo(tracks,
                    { x: (i) => (i % 2 === 0 ? 120 : -120) },
                    { x: (i) => (i % 2 === 0 ? -260 : 260), duration: 1.2, ease: 'power2.out' },
                    0
                );

                // Fallback timeout to guarantee navigation
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 1200);
            } else {
                transitionOverlay.style.visibility = 'visible';
                transitionOverlay.style.opacity = '1';
                transitionOverlay.style.clipPath = endClip;
                transitionOverlay.style.webkitClipPath = endClip;
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 600);
            }
        }

        // Intercept all links targeting menu.html and attach hover/touch preload
        const menuLinks = document.querySelectorAll('a[href*="menu.html"]');
        menuLinks.forEach(link => {
            const targetUrl = link.getAttribute('href');

            // Preload early on hover or touchstart before user clicks
            link.addEventListener('mouseenter', () => preloadTargetImages(targetUrl), { passive: true });
            link.addEventListener('touchstart', () => preloadTargetImages(targetUrl), { passive: true });

            link.addEventListener('click', (e) => {
                // Respect open in new tab / modifier keys
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

                if (!targetUrl) return;

                e.preventDefault();
                const phrases = getPhrasesForLink(link);
                triggerTransition(targetUrl, phrases, e.clientX, e.clientY);
            });
        });

        // Reset if restored from bfcache
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                resetTransitionOverlay();
            }
        });
    }
});

