document.addEventListener('DOMContentLoaded', function() {
    // Initialize clipboard.js
    new ClipboardJS('.copy-btn');
    
    // Add feedback when copying
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.classList.remove('fa-copy');
            icon.classList.add('fa-check');
            
            // Show tooltip feedback
            const tooltip = bootstrap.Tooltip.getInstance(this);
            if (tooltip) {
                tooltip.setContent({ '.tooltip-inner': 'Copied!' });
                tooltip.show();
                
                setTimeout(() => {
                    tooltip.setContent({ '.tooltip-inner': 'Copy reference' });
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-copy');
                }, 2000);
            }
        });
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Payment details modal
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const paymentId = this.dataset.paymentId;
            const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
            const modalBody = document.getElementById('paymentDetailsContent');
            const receiptBtn = document.querySelector('.receipt-btn');
            
            // Show loading state
            modalBody.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            // Fetch payment details
            fetch(`/payments/details/${paymentId}/`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(html => {
                    modalBody.innerHTML = html;
                    receiptBtn.classList.remove('d-none');
                    receiptBtn.setAttribute('data-payment-id', paymentId);
                    modal.show();
                })
                .catch(error => {
                    console.error('Error:', error);
                    modalBody.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            Failed to load payment details. Please try again.
                        </div>
                    `;
                    receiptBtn.classList.add('d-none');
                    modal.show();
                });
        });
    });
    
    // Receipt download handler
    document.querySelector('.receipt-btn')?.addEventListener('click', function() {
        const paymentId = this.getAttribute('data-payment-id');
        window.open(`/payments/receipt/${paymentId}/`, '_blank');
    });
    
    // Animate table rows on scroll
    const animateOnScroll = () => {
        const rows = document.querySelectorAll('.table tbody tr');
        rows.forEach(row => {
            const rowPosition = row.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (rowPosition < screenPosition) {
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check
});