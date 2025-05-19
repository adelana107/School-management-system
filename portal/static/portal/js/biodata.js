function printBioData() {
    // Add a loading state to the button
    const printBtn = document.querySelector('.btn-primary');
    const originalHtml = printBtn.innerHTML;
    printBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Preparing...';
    printBtn.disabled = true;
    
    // Delay print to allow button state to update
    setTimeout(() => {
        window.print();
        printBtn.innerHTML = originalHtml;
        printBtn.disabled = false;
    }, 500);
}

// Add animation when scrolling
document.addEventListener('DOMContentLoaded', function() {
    const bioDataCard = document.querySelector('.bio-data-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    if (bioDataCard) {
        observer.observe(bioDataCard);
    }
});