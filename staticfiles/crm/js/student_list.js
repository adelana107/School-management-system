 // Auto-expand first school on page load
        document.addEventListener('DOMContentLoaded', function() {
            var firstSchool = document.querySelector('.accordion-button');
            if (firstSchool) {
                firstSchool.click();
            }
        });