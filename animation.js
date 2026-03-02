document.addEventListener("DOMContentLoaded", () => {
    // Determine path based on script tag
    const scriptTag = document.getElementById('animation-js');
    const basePath = scriptTag ? scriptTag.getAttribute('data-basepath') : '';

    const IMAGES = [
        basePath + 'bg_scene_1.png',
        basePath + 'bg_scene_2.png',
        basePath + 'bg_scene_3.png',
        basePath + 'bg_scene_4.png',
        basePath + 'bg_scene_5.png'
    ];

    // Create container - pinned to bottom
    const bgContainer = document.createElement('div');
    bgContainer.style.position = 'fixed';
    bgContainer.style.bottom = '0';
    bgContainer.style.left = '0';
    bgContainer.style.width = '100vw';
    bgContainer.style.height = 'auto';  // Only as tall as the image
    bgContainer.style.pointerEvents = 'none';
    bgContainer.style.zIndex = '-2';
    document.body.appendChild(bgContainer);

    // Create sparkle container
    const sparkleContainer = document.createElement('div');
    sparkleContainer.style.position = 'fixed';
    sparkleContainer.style.top = '0';
    sparkleContainer.style.left = '0';
    sparkleContainer.style.width = '100vw';
    sparkleContainer.style.height = '100vh';
    sparkleContainer.style.pointerEvents = 'none';
    sparkleContainer.style.zIndex = '-1';
    sparkleContainer.style.overflow = 'hidden';
    document.body.appendChild(sparkleContainer);

    const scenes = IMAGES.map((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.style.position = 'relative'; // stack within auto-height container
        img.style.display = 'block';
        img.style.bottom = '0';
        img.style.left = '0';
        img.style.width = '100vw';
        img.style.height = 'auto'; // natural aspect ratio
        img.style.maxHeight = '60vh'; // cap so it doesn't overwhelm on tall screens
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'bottom center';
        img.style.transition = 'opacity 3s ease-in-out';
        img.style.opacity = '0';
        img.style.mixBlendMode = 'screen';
        // Absolutely layer them all on top of each other
        img.style.position = 'absolute';
        img.style.bottom = '0';
        img.style.left = '0';
        bgContainer.appendChild(img);
        return img;
    });

    // Make container itself tall enough to hold the images
    function resizeContainer() {
        const imgEl = scenes[0];
        if (imgEl && imgEl.naturalHeight) {
            const ratio = imgEl.naturalHeight / imgEl.naturalWidth;
            const height = Math.min(window.innerWidth * ratio, window.innerHeight * 0.6);
            bgContainer.style.height = height + 'px';
        } else {
            bgContainer.style.height = '40vw';
        }
    }
    scenes[0].addEventListener('load', resizeContainer);
    window.addEventListener('resize', resizeContainer);
    resizeContainer();

    const VIEWS_PER_STAGE = 100;
    const MAX_STAGES = scenes.length - 1; // 4 transitions

    function updateBackground(views) {
        let progress = views / VIEWS_PER_STAGE;
        progress = Math.max(0, Math.min(progress, MAX_STAGES));

        const index = Math.floor(progress);
        const fraction = progress % 1;

        scenes.forEach((img, i) => {
            if (i === index) {
                // If it's the last stage, force opacity 1
                img.style.opacity = (i === MAX_STAGES) ? 1 : (1 - fraction);
            } else if (i === index + 1) {
                img.style.opacity = fraction;
            } else {
                img.style.opacity = 0;
            }
        });
    }

    // Adding sparkle global CSS once
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes twinkerAnim {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.5); opacity: 1; }
        100% { transform: scale(0); opacity: 0; }
    }
    .sp-star {
        position: absolute;
        width: 8px; height: 8px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 15px 4px rgba(255,255,255,0.9);
        opacity: 0;
        animation: twinkerAnim 2s ease-in-out forwards;
    }
    `;
    document.head.appendChild(style);

    function createSparkles() {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const sp = document.createElement('div');
                sp.className = 'sp-star';
                sp.style.left = (Math.random() * 100) + 'vw';
                sp.style.top = (Math.random() * 100) + 'vh';

                // Varied animation duration
                sp.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';

                sparkleContainer.appendChild(sp);
                setTimeout(() => sp.remove(), 3000);
            }, Math.random() * 800);
        }
    }

    // 1. Initial State: Load last known views quickly
    let localViews = parseInt(localStorage.getItem('sudeniaruViews')) || 0;

    // Show old layout instantly
    updateBackground(localViews);

    // 2. Fetch new global hits
    let counterUrl = 'https://api.counterapi.dev/v1/sudeniaru/home/up';
    fetch(counterUrl)
        .then(res => res.json())
        .then(data => {
            if (data && data.count) {
                let globalViews = data.count;
                // If the global view count is higher, trigger growth effect
                if (globalViews > localViews) {
                    setTimeout(() => {
                        createSparkles();
                        setTimeout(() => updateBackground(globalViews), 500); // Wait a tiny bit after sparkle starts
                    }, 1500); // 1.5s delay to admire the initial state
                } else if (localViews === 0) {
                    // Very first time
                    setTimeout(() => updateBackground(globalViews), 1000);
                }
                localStorage.setItem('sudeniaruViews', globalViews);
            }
        })
        .catch(err => {
            // Fallback: If API fails, just increment locally
            console.warn("Could not fetch global views, incrementing locally.");
            setTimeout(() => {
                localViews++;
                createSparkles();
                setTimeout(() => updateBackground(localViews), 500);
                localStorage.setItem('sudeniaruViews', localViews);
            }, 1500);
        });
});
