function redirectTo(tool) {
    const card = event.currentTarget;
    
    // Animação de clique
    card.style.transform = 'scale(0.95) translateY(-20px)';
    card.style.filter = 'brightness(1.2)';
    
    setTimeout(() => {
        const urls = {
            'legendas': './CaptionGeneratorPage/CaptionGenerator.html',
            'roteiros': './ScriptGeneratorPage/ScriptGenerator.html', 
            'design': './VisualCopyGeneratorPage/VisualCopyGenerator.html',
            'materias': './ContentProPage/ContentPro.html',
            'analise': './AnalisePage/Analise.html',
            'entrevista': './EntrevistaPage/EntrevistaPage.html' // Nova URL para a página de entrevista
        };
        
        if (urls[tool]) {
            window.location.href = urls[tool];
        } else {
            alert(`🚀 ${tool.charAt(0).toUpperCase() + tool.slice(1)} - Em breve!`);
        }
    }, 200);
}

// Efeito parallax suave
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.3;
    const bgAnimation = document.querySelector('.bg-animation');
    bgAnimation.style.transform = `translateY(${rate}px)`;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Observer para animações de entrada
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

document.querySelectorAll('.tool-card').forEach(card => {
    observer.observe(card);
});

// Efeito de cursor customizado (se você tiver um elemento .cursor no seu HTML)
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});