// applicant_profile.js

document.addEventListener('DOMContentLoaded', function() {
    initializeApplicantProfile();
});

function initializeApplicantProfile() {
    handleDocumentCards();
    handleActionButtons();
    handleStatCards();
    handleSidebarIntegration();
    addRippleEffect();
    handleScrollAnimations();
}

// Document Cards Functionality
function handleDocumentCards() {
    const documentCards = document.querySelectorAll('.document-card');
    
    documentCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const link = this.querySelector('a[href]');
            if (link) {
                // Add click animation
                this.style.transform = 'translateY(-12px) scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-8px) scale(1)';
                    window.open(link.href, '_blank');
                }, 150);
            }
        });

        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
        });
    });
}

// Action Buttons Functionality
function handleActionButtons() {
    const actionButtons = document.querySelectorAll('.btn-action');
    
    actionButtons.forEach(button => {
        // Add loading animation for critical actions
        if (button.href && (button.href.includes('approve') || 
                           button.href.includes('decline') || 
                           button.href.includes('revoke'))) {
            button.addEventListener('click', function(e) {
                if (!confirm('Are you sure you want to perform this action?')) {
                    e.preventDefault();
                    return;
                }
                
                const originalText = this.innerHTML;
                const originalBg = this.style.background;
                
                this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                this.style.pointerEvents = 'none';
                this.style.opacity = '0.7';
                
                // Reset after navigation or timeout
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.pointerEvents = 'auto';
                    this.style.opacity = '1';
                    this.style.background = originalBg;
                }, 5000);
            });
        }

        // Enhanced hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.05)';
            this.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        });
    });
}

// Stat Cards Animation
function handleStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        // Staggered animation on load
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);

        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.03)';
            this.style.boxShadow = '0 20px 45px rgba(0,0,0,0.18)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
        });
    });
}

// Sidebar Integration
function handleSidebarIntegration() {
    const sidebar = document.querySelector('.sidebar-container');
    const mainContent = document.querySelector('.main-content');
    const footer = document.querySelector('.footer');
    
    function updateLayout() {
        if (!sidebar || !mainContent || !footer) return;
        
        if (window.innerWidth <= 992) {
            mainContent.style.marginLeft = '0';
            footer.style.marginLeft = '0';
        } else {
            const isCollapsed = sidebar.classList.contains('collapsed');
            const marginLeft = isCollapsed ? '80px' : '280px';
            
            mainContent.style.marginLeft = marginLeft;
            footer.style.marginLeft = marginLeft;
        }
    }

    // Listen for sidebar toggle
    document.addEventListener('click', function(e) {
        if (e.target.matches('.sidebar-toggle') || e.target.closest('.sidebar-toggle')) {
            setTimeout(updateLayout, 300);
        }
    });

    // Handle window resize
    window.addEventListener('resize', debounce(updateLayout, 250));
    
    // Initial layout update
    updateLayout();
}

// Ripple Effect
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn-action, .stat-card, .document-card');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                pointer-events: none;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                z-index: 1;
            `;
            
            // Ensure button has relative positioning
            if (getComputedStyle(this).position === 'static') {
                this.style.position = 'relative';
            }
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Scroll Animations
function handleScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    const sections = document.querySelectorAll('.info-section, .action-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease';
        observer.observe(section);
    });
}

// Profile Picture Modal (if needed)
function initProfilePictureModal() {
    const profilePicture = document.querySelector('.profile-avatar');
    
    if (profilePicture) {
        profilePicture.addEventListener('click', function() {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div class="modal fade" id="profilePictureModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Profile Picture</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body text-center">
                                <img src="${this.src}" class="img-fluid rounded" alt="Profile Picture">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const bootstrapModal = new bootstrap.Modal(modal.querySelector('.modal'));
            bootstrapModal.show();
            
            // Remove modal from DOM when hidden
            modal.querySelector('.modal').addEventListener('hidden.bs.modal', function() {
                modal.remove();
            });
        });
        
        profilePicture.style.cursor = 'pointer';
        profilePicture.title = 'Click to view larger image';
    }
}

// Status Badge Animation
function animateStatusBadge() {
    const statusBadge = document.querySelector('.status-badge');
    
    if (statusBadge) {
        // Add pulsing animation for pending status
        if (statusBadge.classList.contains('status-pending')) {
            statusBadge.style.animation = 'pulse 2s infinite';
        }
        
        // Add success animation for approved status
        if (statusBadge.classList.contains('status-approved')) {
            setTimeout(() => {
                statusBadge.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    statusBadge.style.transform = 'scale(1)';
                }, 200);
            }, 500);
        }
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS animations dynamically
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.7;
            }
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .info-table tr {
            transition: all 0.3s ease;
        }
        
        .info-table tr:hover {
            background-color: #f8f9fa !important;
            transform: translateX(5px);
        }
        
        .section-header {
            transition: all 0.3s ease;
        }
        
        .section-header:hover {
            background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%) !important;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    addDynamicStyles();
    initProfilePictureModal();
    animateStatusBadge();
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Export functions for external use if needed
window.ApplicantProfile = {
    updateLayout: handleSidebarIntegration,
    refreshAnimations: handleScrollAnimations,
    initModal: initProfilePictureModal
};