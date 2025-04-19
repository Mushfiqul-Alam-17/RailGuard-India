/**
 * RailGuard India - Train Animation
 * This script creates a futuristic train animation that morphs from text to a high-speed train
 */

// Initialize animation when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTrainAnimation();
    
    // Add replay button click event
    const replayBtn = document.getElementById('replayAnimationBtn');
    if (replayBtn) {
        replayBtn.addEventListener('click', function() {
            resetAnimation();
            setTimeout(initTrainAnimation, 100);
        });
    }
    
    // Add click events for feature cards
    setupFeatureCardInteractions();
});

/**
 * Initialize the train animation sequence
 */
function initTrainAnimation() {
    // Create stars in the background
    createStarryBackground();
    
    // Create circuit lines and nodes
    createCircuitElements();
    
    // Start the title animation sequence
    setTimeout(animateTitle, 500);
    
    // Start the title shatter animation
    setTimeout(animateTitleShatter, 2000);
    
    // Start the train appearance animation
    setTimeout(animateTrain, 2500);
    
    // Show feature cards after train animation
    setTimeout(showFeatureCards, 5000);
    
    // Show replay button after full animation
    setTimeout(function() {
        const replayBtn = document.getElementById('replayAnimationBtn');
        if (replayBtn) {
            replayBtn.style.opacity = 1;
        }
    }, 6000);
}

/**
 * Create the starry background with random stars
 */
function createStarryBackground() {
    const starsBg = document.querySelector('.stars-bg');
    if (!starsBg) return;
    
    // Clear existing stars
    const existingStars = document.querySelectorAll('.star');
    existingStars.forEach(star => star.remove());
    
    // Add new stars
    const numStars = Math.min(window.innerWidth * 0.2, 200); // Responsive star count
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsBg.appendChild(star);
    }
}

/**
 * Create circuit lines and nodes for futuristic background
 */
function createCircuitElements() {
    const container = document.querySelector('.animation-container');
    if (!container) return;
    
    // Clear existing circuit elements
    const existingCircuits = document.querySelectorAll('.circuit-line, .circuit-node');
    existingCircuits.forEach(element => element.remove());
    
    // Create circuit lines
    const numLines = Math.min(window.innerWidth * 0.015, 20); // Responsive line count
    
    for (let i = 0; i < numLines; i++) {
        // Create horizontal lines
        const hLine = document.createElement('div');
        hLine.className = 'circuit-line horizontal-line';
        hLine.style.left = `${Math.random() * 70}%`;
        hLine.style.top = `${Math.random() * 100}%`;
        hLine.style.width = `${Math.random() * 30 + 10}%`;
        container.appendChild(hLine);
        
        // Create vertical lines
        const vLine = document.createElement('div');
        vLine.className = 'circuit-line vertical-line';
        vLine.style.left = `${Math.random() * 100}%`;
        vLine.style.top = `${Math.random() * 70}%`;
        vLine.style.height = `${Math.random() * 30 + 10}%`;
        container.appendChild(vLine);
        
        // Create circuit nodes
        const node = document.createElement('div');
        node.className = 'circuit-node';
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        node.style.animationDelay = `${Math.random() * 3}s`;
        container.appendChild(node);
    }
}

/**
 * Animate the title appearance
 */
function animateTitle() {
    const title = document.querySelector('.animated-title');
    if (title) {
        title.style.opacity = 0;
        title.style.animation = 'none';
        setTimeout(() => {
            title.style.animation = 'titleAppear 0.5s forwards';
        }, 100);
    }
}

/**
 * Animate the title shattering into pieces
 */
function animateTitleShatter() {
    const titleContainer = document.querySelector('.title-container');
    const title = document.querySelector('.animated-title');
    
    if (!titleContainer || !title) return;
    
    // Get title dimensions for shattering effect
    const titleRect = title.getBoundingClientRect();
    const containerRect = titleContainer.getBoundingClientRect();
    
    // Create shattered pieces
    const numPieces = 30;
    const pieceWidth = titleRect.width / 5;
    const pieceHeight = titleRect.height / 5;
    
    // Hide the original title
    title.style.opacity = 0;
    
    // Create and animate the pieces
    for (let i = 0; i < numPieces; i++) {
        const piece = document.createElement('div');
        piece.className = 'title-shatter';
        
        // Random position within the title bounds
        const left = Math.random() * (titleRect.width - pieceWidth);
        const top = Math.random() * (titleRect.height - pieceHeight);
        
        // Set the piece style
        piece.style.width = `${pieceWidth * (Math.random() * 0.5 + 0.5)}px`;
        piece.style.height = `${pieceHeight * (Math.random() * 0.5 + 0.5)}px`;
        piece.style.left = `${left}px`;
        piece.style.top = `${top}px`;
        piece.style.borderRadius = '3px';
        
        // Set the animation
        const angle = Math.random() * 360;
        const distance = 300 + Math.random() * 300;
        const duration = 0.7 + Math.random() * 0.5;
        const delay = Math.random() * 0.3;
        
        piece.style.transition = `all ${duration}s ease-out ${delay}s`;
        piece.style.opacity = 1;
        
        titleContainer.appendChild(piece);
        
        // Start the animation after a small delay
        setTimeout(() => {
            piece.style.transform = `translate(${distance * Math.cos(angle * Math.PI/180)}px, ${distance * Math.sin(angle * Math.PI/180)}px) rotate(${Math.random() * 720 - 360}deg)`;
            piece.style.opacity = 0;
        }, 50);
        
        // Remove pieces after animation
        setTimeout(() => {
            piece.remove();
        }, (duration + delay) * 1000 + 100);
    }
}

/**
 * Animate the train appearance
 */
function animateTrain() {
    const trainContainer = document.querySelector('.train-container');
    if (!trainContainer) return;
    
    // Show the train container
    trainContainer.style.opacity = 1;
    
    // Create train body
    const trainBody = document.createElement('div');
    trainBody.className = 'train-body';
    trainContainer.appendChild(trainBody);
    
    // Create SVG train (you could also use an image or complex HTML structure)
    trainBody.innerHTML = createTrainSVG();
    
    // Create train windows
    const numWindows = 8;
    for (let i = 0; i < numWindows; i++) {
        const trainWindow = document.createElement('div');
        trainWindow.className = 'train-window';
        trainWindow.style.width = '40px';
        trainWindow.style.height = '20px';
        trainWindow.style.top = '40px';
        trainWindow.style.left = `${150 + i * 60}px`;
        
        // Animate window lighting
        trainWindow.style.animation = `lightPulse 1s infinite alternate ${i * 0.1}s`;
        
        trainBody.appendChild(trainWindow);
    }
    
    // Create wheels
    const wheelPositions = [120, 200, 300, 400, 500, 600];
    wheelPositions.forEach(pos => {
        const wheel = document.createElement('div');
        wheel.className = 'train-wheel';
        wheel.style.left = `${pos}px`;
        trainBody.appendChild(wheel);
    });
    
    // Create train lights
    const frontLight = document.createElement('div');
    frontLight.className = 'train-light';
    frontLight.style.left = '95px';
    frontLight.style.top = '60px';
    trainBody.appendChild(frontLight);
    
    // Create tracks
    createTracks();
}

/**
 * Create the train SVG
 */
function createTrainSVG() {
    // Return SVG for a futuristic train
    return `
    <svg width="800" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Train body -->
        <path d="M100,60 L95,100 L700,100 L695,60 Z" fill="#1e40af" stroke="#38bdf8" stroke-width="2" />
        <!-- Train front -->
        <path d="M95,100 L80,150 L700,150 L700,100 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        <!-- Train nose -->
        <path d="M80,150 L60,150 Q40,125 40,100 Q40,75 60,70 L95,70 L95,100 L80,150 Z" fill="#1e40af" stroke="#38bdf8" stroke-width="2" />
        <!-- Windows -->
        <path d="M150,70 L150,95 L190,95 L190,70 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M210,70 L210,95 L250,95 L250,70 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M270,70 L270,95 L310,95 L310,70 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M330,70 L330,95 L370,95 L370,70 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M390,70 L390,95 L430,95 L430,70 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M450,70 L450,95 L490,95 L490,70 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M510,70 L510,95 L550,95 L550,70 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M570,70 L570,95 L610,95 L610,70 Z" fill="rgba(255,255,255,0.7)" />
        <!-- Train details -->
        <path d="M60,100 L60,110 L700,110 L700,100 Z" fill="#38bdf8" />
        <path d="M60,120 L60,125 L700,125 L700,120 Z" fill="#38bdf8" />
        <circle cx="70" cy="150" r="5" fill="#f59e0b" />
        <!-- Glow effects -->
        <rect x="40" y="150" width="660" height="5" fill="#38bdf8" opacity="0.5" />
        <!-- Circuit patterns -->
        <path d="M100,80 L140,80 M160,80 L180,80 M220,80 L240,80 M280,80 L300,80" stroke="#38bdf8" stroke-width="1" stroke-dasharray="5,5" opacity="0.7" />
    </svg>
    `;
}

/**
 * Create the train tracks
 */
function createTracks() {
    const container = document.querySelector('.animation-container');
    if (!container) return;
    
    // Create the track base
    const tracks = document.createElement('div');
    tracks.className = 'tracks';
    container.appendChild(tracks);
    
    // Create track sleepers (ties)
    const containerWidth = container.offsetWidth;
    const sleeperCount = Math.floor(containerWidth / 40);
    
    for (let i = 0; i < sleeperCount; i++) {
        const sleeper = document.createElement('div');
        sleeper.className = 'track-sleeper';
        sleeper.style.left = `${i * 40}px`;
        container.appendChild(sleeper);
    }
}

/**
 * Show the feature cards after the train animation
 */
function showFeatureCards() {
    const cardsContainer = document.querySelector('.feature-cards-container');
    if (!cardsContainer) return;
    
    // Show the container
    cardsContainer.style.opacity = 1;
    
    // Animate each card
    const cards = document.querySelectorAll('.animated-card');
    cards.forEach((card, index) => {
        card.style.animation = `cardSlideUp 0.5s forwards ${0.1 + index * 0.1}s`;
    });
}

/**
 * Set up interactions for feature cards
 */
function setupFeatureCardInteractions() {
    // Get all animated cards
    const cards = document.querySelectorAll('.animated-card');
    
    cards.forEach(card => {
        // Add click event
        card.addEventListener('click', function() {
            // Get the target URL from data attribute
            const targetUrl = this.getAttribute('data-url');
            if (!targetUrl) return;
            
            // Show loading spinner
            const spinner = document.createElement('div');
            spinner.className = 'train-spinner';
            spinner.style.top = '50%';
            spinner.style.left = '50%';
            spinner.style.transform = 'translate(-50%, -50%)';
            spinner.style.display = 'block';
            this.appendChild(spinner);
            
            // Navigate to the target page
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 500);
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
            this.style.boxShadow = '0 0 30px rgba(56, 189, 248, 0.5)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.3)';
        });
    });
}

/**
 * Reset the animation for replay
 */
function resetAnimation() {
    // Hide train container
    const trainContainer = document.querySelector('.train-container');
    if (trainContainer) {
        trainContainer.style.opacity = 0;
        trainContainer.innerHTML = '';
    }
    
    // Show title again
    const title = document.querySelector('.animated-title');
    if (title) {
        title.style.opacity = 1;
    }
    
    // Hide feature cards
    const cardsContainer = document.querySelector('.feature-cards-container');
    if (cardsContainer) {
        cardsContainer.style.opacity = 0;
        const cards = document.querySelectorAll('.animated-card');
        cards.forEach(card => {
            card.style.animation = 'none';
            card.style.opacity = 0;
            card.style.transform = 'translateY(100px)';
        });
    }
    
    // Hide replay button
    const replayBtn = document.getElementById('replayAnimationBtn');
    if (replayBtn) {
        replayBtn.style.opacity = 0;
    }
    
    // Remove any remaining shatter pieces
    const shatterPieces = document.querySelectorAll('.title-shatter');
    shatterPieces.forEach(piece => piece.remove());
}