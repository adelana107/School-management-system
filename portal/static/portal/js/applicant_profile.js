function printBiodata() {
        var printContents = document.getElementById("print-section").innerHTML;
        var originalContents = document.body.innerHTML;
        
        // Create a print-friendly header
        var universityHeader = `
            <div style="text-align:center; margin-bottom:20px;">
                <h2 style="color:#003366;">Oceanview University</h2>
                <h3 style="color:#0056b3;">Applicant Biodata</h3>
                <hr style="border-top:2px solid #ffc107; width:50%; margin:10px auto;">
            </div>
        `;
        
        document.body.innerHTML = universityHeader + printContents;
        window.print();
        document.body.innerHTML = originalContents;
    }

    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        const icon = document.querySelector('.btn-dark i');
        if (document.body.classList.contains("dark-mode")) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        // Save preference to localStorage
        const isDarkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem('darkMode', isDarkMode);
    }
    
    // Check for saved dark mode preference
    document.addEventListener('DOMContentLoaded', function() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add("dark-mode");
            const icon = document.querySelector('.btn-dark i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });