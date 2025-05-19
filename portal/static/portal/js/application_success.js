// Play success sound only if user hasn't disabled audio
        document.addEventListener('DOMContentLoaded', function() {
            if (!window.localStorage.getItem('audioDisabled')) {
                try {
                    const audio = new Audio('{% static "sounds/success.mp3" %}');
                    audio.volume = 0.2;
                    setTimeout(() => { audio.play().catch(e => console.log('Audio play prevented:', e)); }, 500);
                } catch (e) {
                    console.log('Audio error:', e);
                }
            }
            
            // Print-friendly version
            if (window.location.search.includes('print=true')) {
                window.print();
            }
        });