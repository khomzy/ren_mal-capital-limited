// Calculator Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calculator if on home page
    const loanAmountSlider = document.getElementById('loanAmount');
    const loanTermSlider = document.getElementById('loanTerm');
    const customAmountInput = document.getElementById('customAmount');
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
        function clampAmount(value) {
            const parsed = Number(value);
            if (!Number.isFinite(parsed) || parsed < 100000) return 100000;
            if (parsed > 5000000) return 5000000;
            return Math.round(parsed / 100000) * 100000;
        }

        function calculateLoan() {
            const principal = clampAmount(loanAmountSlider.value);
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
            
            if (loanAmountSlider) loanAmountSlider.value = principal;
            if (customAmountInput) customAmountInput.value = principal;

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
        loanAmountSlider.addEventListener('input', function() {
            const principal = clampAmount(loanAmountSlider.value);
            loanAmountSlider.value = principal;
            if (customAmountInput) customAmountInput.value = principal;
            calculateLoan();
        });

        if (customAmountInput) {
            customAmountInput.addEventListener('input', function() {
                const principal = clampAmount(customAmountInput.value);
                if (loanAmountSlider) loanAmountSlider.value = principal;
                customAmountInput.value = principal;
                calculateLoan();
            });
        }

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
    
    const supabaseUrl = window.SUPABASE_URL || '';
    const supabaseAnonKey = window.SUPABASE_ANON_KEY || '';
    const supabase = (typeof window !== 'undefined' && window.supabase && supabaseUrl && supabaseAnonKey)
        ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
        : null;

    function toNumber(value) {
        if (value === null || value === undefined || value === '' || String(value).trim() === '') {
            return null;
        }

        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function buildApplicantRecord(textFields, uploadedDocumentUrls, formId) {
        return {
            form_type: formId,
            full_name: textFields.fullName || textFields.ownerName || textFields.businessName || null,
            phone: textFields.phone || null,
            email: textFields.email || null,
            national_id: textFields.nationalId || null,
            address: textFields.address || textFields.businessAddress || null,
            occupation: textFields.occupation || null,
            employer: textFields.employer || null,
            monthly_income: toNumber(textFields.monthlyIncome || textFields.monthlyRevenue),
            loan_amount: toNumber(textFields.loanAmount),
            repayment_period: textFields.repaymentPeriod || null,
            loan_purpose: textFields.loanPurpose || null,
            collateral: textFields.collateral || null,
            collateral_value: toNumber(textFields.collateralValue),
            guarantor_name: textFields.guarantorName || null,
            guarantor_phone: textFields.guarantorPhone || null,
            guarantor_relationship: textFields.guarantorRelationship || null,
            business_name: textFields.businessName || null,
            business_type: textFields.businessType || null,
            years_in_business: toNumber(textFields.yearsInBusiness) ? Math.trunc(toNumber(textFields.yearsInBusiness)) : null,
            employees: toNumber(textFields.employees) ? Math.trunc(toNumber(textFields.employees)) : null,
            business_address: textFields.businessAddress || null,
            owner_name: textFields.ownerName || null,
            monthly_revenue: toNumber(textFields.monthlyRevenue),
            monthly_expenses: toNumber(textFields.monthlyExpenses),
            guarantor_occupation: textFields.guarantorOccupation || null,
            form_data: textFields,
            document_urls: uploadedDocumentUrls,
            created_at: new Date().toISOString()
        };
    }

    function getBucketForField(key) {
        if (key.includes('ownerPhoto')) return 'owner-photos';
        if (key.includes('nationalIdFront') || key.includes('nationalIdBack')) return 'national-id-documents';
        if (key.includes('businessLicence')) return 'business-licences';
        if (key.includes('utilityBill')) return 'utility-documents';
        if (key.includes('applicantPhoto')) return 'applicant-photos';
        if (key.includes('collateralPhoto') || key.includes('collateralDocs')) return 'collateral-documents';
        return 'loan-documents';
    }

    async function uploadFilesToSupabase(files, form) {
        if (!supabase || !files.length) return [];

        const uploaded = [];

        for (const item of files) {
            const bucket = getBucketForField(item.key);
            const fileName = `${Date.now()}-${item.value.name.replace(/\s+/g, '-')}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, item.value, { cacheControl: '3600', upsert: false });

            if (uploadError) {
                throw new Error(`Upload failed for ${item.key}: ${uploadError.message}`);
            }

            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from(bucket)
                .createSignedUrl(fileName, 60 * 60 * 24 * 7);

            if (signedUrlError) {
                throw new Error(`Signed URL failed for ${item.key}: ${signedUrlError.message}`);
            }

            uploaded.push({
                field: item.key,
                bucket,
                name: item.value.name,
                url: signedUrlData.signedUrl
            });
        }

        return uploaded;
    }

    document.querySelectorAll('form.application-form').forEach((form) => {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            const originalLabel = submitButton ? submitButton.textContent : 'Submit Application';

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
            }

            try {
                if (!supabase) {
                    throw new Error('Supabase is not configured. Please check the project URL and anon key.');
                }

                const formData = new FormData(form);
                const textFields = {};
                const imageFields = [];

                formData.forEach((value, key) => {
                    if (value instanceof File && value.size > 0) {
                        imageFields.push({ key, value });
                    } else if (value instanceof FileList) {
                        Array.from(value).forEach((file) => {
                            if (file && file.size > 0) {
                                imageFields.push({ key, value: file });
                            }
                        });
                    } else {
                        textFields[key] = value;
                    }
                });

                const uploadedDocumentUrls = await uploadFilesToSupabase(imageFields, form);

                const applicantRecord = buildApplicantRecord(textFields, uploadedDocumentUrls, form.id);

                if (supabase) {
                    const { error: dbError } = await supabase
                        .from('loan_applications')
                        .insert([applicantRecord]);

                    if (dbError) {
                        const message = dbError.code === '42P01' || /relation .*loan_applications/i.test(dbError.message)
                            ? 'Supabase table "loan_applications" is missing. Run the SQL setup in Supabase first, then submit again.'
                            : 'Supabase record save failed: ' + dbError.message;
                        throw new Error(message);
                    }
                }

                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new URLSearchParams(textFields)
                });

                if (!response.ok) {
                    throw new Error('Form submission failed. Please try again.');
                }

                alert('Application submitted successfully.');
                form.reset();
            } catch (error) {
                console.error(error);
                alert(error.message || 'Something went wrong while submitting the application.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalLabel;
                }
            }
        });
    });

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
