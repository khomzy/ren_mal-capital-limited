// Calculator Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calculator if on home page
    const loanAmountSlider = document.getElementById('loanAmount');
    const loanTermSlider = document.getElementById('loanTerm');
    const interestRateInput = document.getElementById('interestRate');
    
    if (loanAmountSlider && loanTermSlider) {
        const amountValue = document.getElementById('amountValue');
        const termValue = document.getElementById('termValue');
        const totalRepayment = document.getElementById('totalRepayment');
        const principalAmount = document.getElementById('principalAmount');
        const interestAmount = document.getElementById('interestAmount');
        const amountButtons = document.querySelectorAll('.amount-btn');
        const termButtons = document.querySelectorAll('.term-btn');
        
        // Format currency
        function formatMWK(amount) {
            return 'MWK ' + parseInt(amount).toLocaleString('en-MW');
        }
        
        // Calculate loan
        function calculateLoan() {
            const principal = parseInt(loanAmountSlider.value);
            const weeks = parseInt(loanTermSlider.value);
            let interestRate = 0;
            
            // Set interest rate based on weeks
            switch(weeks) {
                case 1: interestRate = 20; break;
                case 2: interestRate = 30; break;
                case 3: interestRate = 40; break;
                case 4: interestRate = 50; break;
            }
            
            const interest = (principal * interestRate) / 100;
            const total = principal + interest;
            
            // Update display
            if (amountValue) amountValue.textContent = formatMWK(principal);
            if (termValue) termValue.textContent = weeks + ' Week' + (weeks > 1 ? 's' : '');
            if (interestRateInput) interestRateInput.value = interestRate;
            if (totalRepayment) totalRepayment.textContent = formatMWK(total);
            if (principalAmount) principalAmount.textContent = formatMWK(principal);
            if (interestAmount) interestAmount.textContent = formatMWK(interest);
            
            // Update active buttons
            amountButtons.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.amount) === principal);
            });
            
            termButtons.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.weeks) === weeks);
            });
        }
        
        // Event listeners
        loanAmountSlider.addEventListener('input', calculateLoan);
        loanTermSlider.addEventListener('input', calculateLoan);
        
        // Amount button clicks
        amountButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const amount = parseInt(this.dataset.amount);
                loanAmountSlider.value = amount;
                calculateLoan();
            });
        });
        
        // Term button clicks
        termButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const weeks = parseInt(this.dataset.weeks);
                loanTermSlider.value = weeks;
                calculateLoan();
            });
        });
        
        // Initial calculation
        calculateLoan();
    }
    
    // Form submissions are handled directly by Formspree via the native HTML form submission.
    // No JS interception is required for the current basic HTML integration.
    
    // Smooth scrolling for anchor links
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
    
    // Mobile menu toggle (if needed)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        }
    });

    // Reveal on scroll using IntersectionObserver
    const revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach(el => io.observe(el));
    } else {
        // Fallback: reveal all
        revealEls.forEach(el => el.classList.add('in-view'));
    }
});