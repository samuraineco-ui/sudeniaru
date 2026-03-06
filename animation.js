document.addEventListener("DOMContentLoaded", () => {
    const scriptTag = document.getElementById('animation-js');
    const basePath = scriptTag ? scriptTag.getAttribute('data-basepath') : '';

    const IMAGES = [
        basePath + 'bg_scene_1.png',
        basePath + 'bg_scene_2.png',
        basePath + 'bg_scene_3.png',
        basePath + 'bg_scene_4.png',
        basePath + 'bg_scene_5.png'
    ];

    // --------------------------------------------------
    // Container: fixed, pinned exactly to bottom of browser
    // 100vw wide (no side gaps), 45vh tall
    // overflow: hidden ensures no bleed
    // --------------------------------------------------
    const bgContainer = document.createElement('div');
    bgContainer.style.cssText = [
        'position: fixed',
        'bottom: 0',
        'left: 0',
        'width: 100vw',
        'height: 45vh',
        'pointer-events: none',
        'z-index: 0',
        'overflow: hidden'
    ].join(';');
    document.body.appendChild(bgContainer);

    // Sparkle container (on top of illustration)
    const sparkleContainer = document.createElement('div');
    sparkleContainer.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100vw',
        'height: 100vh',
        'pointer-events: none',
        'z-index: 1',
        'overflow: hidden'
    ].join(';');
    document.body.appendChild(sparkleContainer);

    // --------------------------------------------------
    // All 5 images: 
    //   - position: absolute inside container
    //   - bottom: 0 → bottom of image = bottom of container = bottom of screen
    //   - width: 100% + height: 100% + object-fit: cover → no side gaps on any screen
    //   - filter: inverts white→dark green for light background
    //   - NO mix-blend-mode (not needed with light bg + dark filter)
    // --------------------------------------------------
    const scenes = IMAGES.map((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = [
            'position: absolute',
            'bottom: 0',
            'left: 0',
            'width: 100%',
            'height: 100%',
            'object-fit: cover',
            'object-position: bottom center',
            'transition: opacity 3s ease-in-out',
            'opacity: 0',
            // Convert white silhouettes → dark forest green on light bg
            'filter: invert(1) sepia(1) saturate(3) hue-rotate(100deg) brightness(0.45)'
        ].join(';');
        bgContainer.appendChild(img);
        return img;
    });

    const VIEWS_PER_STAGE = 100;
    const MAX_STAGES = scenes.length - 1;

    function updateBackground(views) {
        let progress = views / VIEWS_PER_STAGE;
        progress = Math.max(0, Math.min(progress, MAX_STAGES));

        const index = Math.floor(progress);
        const fraction = progress % 1;

        scenes.forEach((img, i) => {
            if (i === index) {
                img.style.opacity = (i === MAX_STAGES) ? 1 : (1 - fraction);
            } else if (i === index + 1) {
                img.style.opacity = fraction;
            } else {
                img.style.opacity = 0;
            }
        });
    }

    // Sparkle effect CSS (adjusted for light bg - use green sparkles)
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes twinkerAnim {
        0%   { transform: scale(0) rotate(0deg);   opacity: 0; }
        40%  { transform: scale(1.4) rotate(45deg); opacity: 1; }
        100% { transform: scale(0) rotate(90deg);   opacity: 0; }
    }
    .sp-star {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #2E8B57;
        border-radius: 50%;
        box-shadow: 0 0 12px 4px rgba(46, 139, 87, 0.7);
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
                sp.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
                sparkleContainer.appendChild(sp);
                setTimeout(() => sp.remove(), 3000);
            }, Math.random() * 800);
        }
    }

    // 1. Instantly show last known scene (no flicker on revisit)
    let localViews = parseInt(localStorage.getItem('sudeniaruViews')) || 0;
    updateBackground(localViews);

    // 2. Hit the global counter and trigger growth sparkle if count grew
    const counterUrl = 'https://api.counterapi.dev/v1/sudeniaru/home/up';
    fetch(counterUrl)
        .then(res => res.json())
        .then(data => {
            if (data && data.count) {
                const globalViews = data.count;
                if (globalViews > localViews) {
                    setTimeout(() => {
                        createSparkles();
                        setTimeout(() => updateBackground(globalViews), 500);
                    }, 1500);
                } else if (localViews === 0) {
                    setTimeout(() => updateBackground(globalViews), 1000);
                }
                localStorage.setItem('sudeniaruViews', globalViews);
            }
        })
        .catch(() => {
            // Fallback: increment locally when API unreachable
            setTimeout(() => {
                localViews++;
                createSparkles();
                setTimeout(() => updateBackground(localViews), 500);
                localStorage.setItem('sudeniaruViews', localViews);
            }, 1500);
        });
});
