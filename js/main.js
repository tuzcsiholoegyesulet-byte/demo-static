document.addEventListener('DOMContentLoaded', () => {
  // --- Cookie Banner Logic (CMP) ---
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptAllBtn = document.getElementById('btn-accept-all');
  const savePreferencesBtn = document.getElementById('btn-save-prefs');
  const marketingCookiesCb = document.getElementById('cb-marketing');

  if (!localStorage.getItem('cookieConsent')) {
    cookieBanner.style.display = 'block';
  } else {
    loadScriptsBasedOnConsent();
  }

  acceptAllBtn?.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', JSON.stringify({ functional: true, marketing: true }));
    cookieBanner.style.display = 'none';
    loadScriptsBasedOnConsent();
  
  // --- Scroll to Top Logic ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

  savePreferencesBtn?.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', JSON.stringify({ 
      functional: true, 
      marketing: marketingCookiesCb ? marketingCookiesCb.checked : false 
    }));
    cookieBanner.style.display = 'none';
    loadScriptsBasedOnConsent();
  
  // --- Scroll to Top Logic ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

  function loadScriptsBasedOnConsent() {
    const consent = JSON.parse(localStorage.getItem('cookieConsent'));
    if (consent?.marketing) {
      // Load marketing/analytics scripts here
      console.log('Marketing cookies enabled. Loading analytics...');
    }
  }

  // --- Newsletter Form Logic ---
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const consentCb = document.getElementById('newsletter-consent');
      if (!consentCb.checked) {
        alert('Kérjük, fogadja el az adatkezelési tájékoztatót a feliratkozáshoz.');
        return;
      }
      alert('Köszönjük! Sikeres feliratkozás a hírlevélre.');
      newsletterForm.reset();
    
  // --- Scroll to Top Logic ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
  }

  
  
  
  // --- Spectacular Donation Card Heart Particles ---
  const donationCard = document.getElementById('donation-card');
  const heartsContainer = document.getElementById('hearts-container');
  if (donationCard && heartsContainer) {
    const numHearts = 45;
    const hearts = [];
    const colors = ['#eb203b', '#ff7eb3', '#1ab5a8', '#ffdf85', '#ff9a9e']; // Red, Pink, Teal, Yellow, Light Pink

    for (let i = 0; i < numHearts; i++) {
      const el = document.createElement('div');
      el.innerHTML = '<svg viewBox="0 0 512 512"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg>';
      
      const size = Math.random() * 20 + 10; // 10px to 30px
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      el.style.position = 'absolute';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.fill = color;
      el.style.opacity = Math.random() * 0.4 + 0.2; // 0.2 to 0.6 opacity
      el.style.transformOrigin = 'center';
      
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      el.style.left = `${startX}%`;
      el.style.top = `${startY}%`;

      heartsContainer.appendChild(el);
      
      hearts.push({
        el,
        baseX: startX,
        baseY: startY,
        currentOffsetX: 0,
        currentOffsetY: 0,
        targetOffsetX: 0,
        targetOffsetY: 0,
        speed: Math.random() * 0.1 + 0.05,
        floatSpeedX: Math.random() * 2 - 1,
        floatSpeedY: Math.random() * 2 - 1,
        seed: Math.random() * 1000
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    let cardRect = donationCard.getBoundingClientRect();

    donationCard.addEventListener('mousemove', (e) => {
      cardRect = donationCard.getBoundingClientRect();
      mouseX = e.clientX - cardRect.left;
      mouseY = e.clientY - cardRect.top;
    });

    donationCard.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    function animateHearts() {
      const repelRadius = 120;
      const repelForce = 60;
      const time = Date.now() * 0.001;
      
      // Update cardRect periodically in case of resize, though cheap enough to just rely on hover
      if(mouseX !== -1000 && cardRect.width === 0) cardRect = donationCard.getBoundingClientRect();

      hearts.forEach(heart => {
        const heartPxX = (heart.baseX / 100) * cardRect.width;
        const heartPxY = (heart.baseY / 100) * cardRect.height;
        
        const dx = mouseX - (heartPxX + heart.currentOffsetX);
        const dy = mouseY - (heartPxY + heart.currentOffsetY);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < repelRadius) {
          const force = (repelRadius - distance) / repelRadius;
          const angle = Math.atan2(dy, dx);
          heart.targetOffsetX = -Math.cos(angle) * force * repelForce;
          heart.targetOffsetY = -Math.sin(angle) * force * repelForce;
        } else {
          heart.targetOffsetX = 0;
          heart.targetOffsetY = 0;
        }

        heart.currentOffsetX += (heart.targetOffsetX - heart.currentOffsetX) * heart.speed;
        heart.currentOffsetY += (heart.targetOffsetY - heart.currentOffsetY) * heart.speed;

        const floatX = Math.sin(time * heart.floatSpeedX + heart.seed) * 10;
        const floatY = Math.cos(time * heart.floatSpeedY + heart.seed) * 10;

        heart.el.style.transform = `translate3d(${heart.currentOffsetX + floatX}px, ${heart.currentOffsetY + floatY}px, 0)`;
      });

      requestAnimationFrame(animateHearts);
    }
    
    setTimeout(() => {
      cardRect = donationCard.getBoundingClientRect();
      animateHearts();
    }, 100);
  }

  // --- Donation Logic ---
  const donationBtns = document.querySelectorAll('.donation-btn');
  const customAmountInput = document.getElementById('custom-amount');
  const donationForm = document.getElementById('donation-form');
  
  let selectedAmount = null;

  donationBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      donationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (btn.dataset.amount === 'custom') {
        customAmountInput.style.display = 'block';
        customAmountInput.required = true;
        selectedAmount = 'custom';
      } else {
        customAmountInput.style.display = 'none';
        customAmountInput.required = false;
        customAmountInput.value = '';
        selectedAmount = btn.dataset.amount;
      }
    
  // --- Scroll to Top Logic ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
  
  // --- Scroll to Top Logic ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

  if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const consentCb = document.getElementById('donation-consent');
      if (!consentCb.checked) {
        alert('Kérjük, fogadja el az adatkezelési tájékoztatót a támogatáshoz.');
        return;
      }
      
      let finalAmount = selectedAmount === 'custom' ? customAmountInput.value : selectedAmount;
      if (!finalAmount) {
        alert('Kérjük, válasszon vagy adjon meg egy támogatási összeget.');
        return;
      }

            const freq = document.querySelector('input[name="donation_frequency"]:checked');
      const freqText = freq ? (freq.value === 'monthly' ? 'Havi rendszeres' : 'Egyszeri') : '';
      alert(`Átirányítás a Stripe Checkout oldalra... (Összeg: ${finalAmount} Ft - ${freqText})`);
      // Integration with Stripe Checkout would occur here.
    
  // --- Scroll to Top Logic ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
  }

  // --- Header Scroll Logic ---
  const selectHeader = document.querySelector('header');
  if (selectHeader) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        selectHeader.classList.add('scrolled');
      } else {
        selectHeader.classList.remove('scrolled');
      }
    
  // --- Scroll to Top Logic ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
    // Trigger on load
    if (window.scrollY > 50) {
      selectHeader.classList.add('scrolled');
    }
  }

  // --- Scroll to Top Logic ---
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});


// --- Mobile Menu Toggle ---
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('mobile-menu');
  const mainNav = document.querySelector('.main-nav');
  if(menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
});

// Project Modal Logic
document.addEventListener('DOMContentLoaded', () => {
  const projectModal = document.getElementById('project-modal');
  if (!projectModal) return;

  const openButtons = document.querySelectorAll('.open-project-modal');
  const closeButton = projectModal.querySelector('.close-modal');
  const modalTitle = document.getElementById('modal-project-title');
  const amountButtons = projectModal.querySelectorAll('.donation-options .btn');
  const customInput = document.getElementById('project-custom-amount');

  // Open modal
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectName = btn.getAttribute('data-project');
      if (modalTitle && projectName) {
        modalTitle.textContent = `${projectName} - Támogatás`;
      }
      projectModal.classList.add('active');
    });
  });

  // Close modal
  const closeModal = () => {
    projectModal.classList.remove('active');
  };

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) {
      closeModal();
    }
  });

  // Amount selection
  amountButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      amountButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (customInput) customInput.value = ''; // clear custom input
    });
  });

  if (customInput) {
    customInput.addEventListener('input', () => {
      amountButtons.forEach(b => b.classList.remove('active'));
    });
  }
});
