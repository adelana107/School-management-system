// Enhanced confetti effect with better performance
        function createConfetti() {
            const colors = ['#0056b3', '#28a745', '#ffd700', '#dc3545', '#17a2b8'];
            const confettiContainer = document.createElement('div');
            confettiContainer.style.position = 'fixed';
            confettiContainer.style.top = '0';
            confettiContainer.style.left = '0';
            confettiContainer.style.width = '100%';
            confettiContainer.style.height = '100%';
            confettiContainer.style.pointerEvents = 'none';
            confettiContainer.style.zIndex = '10';
            document.body.appendChild(confettiContainer);
            
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = Math.random() * 10 + 5 + 'px';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = -20 + 'px';
                confetti.style.position = 'absolute';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
                confettiContainer.appendChild(confetti);
                
                let duration = Math.random() * 3 + 2;
                
                // Animate confetti
                confetti.animate([
                    { top: -20 + 'px', opacity: 1, transform: 'rotate(0deg)' },
                    { top: window.innerHeight + 'px', opacity: 0, transform: 'rotate(360deg)' }
                ], {
                    duration: duration * 1000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.9, 1)',
                    delay: Math.random() * 2 * 1000
                });
                
                // Remove confetti after animation
                setTimeout(() => {
                    confetti.remove();
                    if (confettiContainer.children.length === 0) {
                        confettiContainer.remove();
                    }
                }, duration * 1000);
            }
        }
        
        // Create confetti on load and every 10 seconds (but limit for performance)
        let confettiCount = 0;
        const maxConfettiShows = 5;
        
        function triggerConfetti() {
            if (confettiCount < maxConfettiShows) {
                createConfetti();
                confettiCount++;
                setTimeout(triggerConfetti, 10000);
            }
        }
        
        // Play celebration sound (optional)
        function playCelebrationSound() {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio play prevented:', e));
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            triggerConfetti();
            playCelebrationSound();
        });