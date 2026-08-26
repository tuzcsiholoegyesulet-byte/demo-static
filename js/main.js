document.addEventListener('DOMContentLoaded', () => {

  // --- Cookie Banner Logic (CMP) ---
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptAllBtn = document.getElementById('btn-accept-all');
  const savePreferencesBtn = document.getElementById('btn-save-prefs');
  const marketingCookiesCb = document.getElementById('cb-marketing');

  if (!localStorage.getItem('cookieConsent')) {
    if(cookieBanner) cookieBanner.style.display = 'block';
  } else {
    loadScriptsBasedOnConsent();
  }

  acceptAllBtn?.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', JSON.stringify({ functional: true, marketing: true }));
    cookieBanner.style.display = 'none';
    loadScriptsBasedOnConsent();
  });

  savePreferencesBtn?.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', JSON.stringify({ 
      functional: true, 
      marketing: marketingCookiesCb ? marketingCookiesCb.checked : false 
    }));
    cookieBanner.style.display = 'none';
    loadScriptsBasedOnConsent();
  });

  function loadScriptsBasedOnConsent() {
    const consent = JSON.parse(localStorage.getItem('cookieConsent'));
    if (consent?.marketing) {
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
    });
  }

  function initFloatingLogos(cardElement, containerElement) {
    if (!cardElement || !containerElement) return;
    const numHearts = 45;
    const hearts = [];
    for (let i = 0; i < numHearts; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 25 + 15; 
      el.innerHTML = '<img src="images/global/Logo_BEZS_emblema.png" style="width: 100%; height: 100%; object-fit: contain;">';
      el.style.position = 'absolute'; el.style.width = `${size}px`; el.style.height = `${size}px`;
      el.style.opacity = Math.random() * 0.6 + 0.1; el.style.transformOrigin = 'center';
      const startX = Math.random() * 100, startY = Math.random() * 100;
      el.style.left = `${startX}%`; el.style.top = `${startY}%`;
      containerElement.appendChild(el);
      hearts.push({
        el, baseX: startX, baseY: startY, currentOffsetX: 0, currentOffsetY: 0, targetOffsetX: 0, targetOffsetY: 0,
        speed: Math.random() * 0.1 + 0.05, floatSpeedX: Math.random() * 2 - 1, floatSpeedY: Math.random() * 2 - 1, seed: Math.random() * 1000
      });
    }

    let mouseX = -1000, mouseY = -1000, cardRect = cardElement.getBoundingClientRect();
    cardElement.addEventListener('mousemove', (e) => {
      cardRect = cardElement.getBoundingClientRect();
      mouseX = e.clientX - cardRect.left;
      mouseY = e.clientY - cardRect.top;
    });
    cardElement.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

    function animateHearts() {
      const repelRadius = 120, repelForce = 60, time = Date.now() * 0.001;
      if(mouseX !== -1000 && cardRect.width === 0) cardRect = cardElement.getBoundingClientRect();
      hearts.forEach(heart => {
        const heartPxX = (heart.baseX / 100) * cardRect.width, heartPxY = (heart.baseY / 100) * cardRect.height;
        const dx = mouseX - (heartPxX + heart.currentOffsetX), dy = mouseY - (heartPxY + heart.currentOffsetY);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < repelRadius) {
          const force = (repelRadius - distance) / repelRadius, angle = Math.atan2(dy, dx);
          heart.targetOffsetX = -Math.cos(angle) * force * repelForce;
          heart.targetOffsetY = -Math.sin(angle) * force * repelForce;
        } else {
          heart.targetOffsetX = 0; heart.targetOffsetY = 0;
        }
        heart.currentOffsetX += (heart.targetOffsetX - heart.currentOffsetX) * heart.speed;
        heart.currentOffsetY += (heart.targetOffsetY - heart.currentOffsetY) * heart.speed;
        const floatX = Math.sin(time * heart.floatSpeedX + heart.seed) * 10, floatY = Math.cos(time * heart.floatSpeedY + heart.seed) * 10;
        heart.el.style.transform = `translate3d(${heart.currentOffsetX + floatX}px, ${heart.currentOffsetY + floatY}px, 0)`;
      });
      requestAnimationFrame(animateHearts);
    }
    setTimeout(() => { cardRect = cardElement.getBoundingClientRect(); animateHearts(); }, 100);
  }

  // --- Spectacular Donation Card Heart Particles ---
  const donationCard = document.getElementById('donation-card');
  const heartsContainer = document.getElementById('hearts-container');
  if (donationCard && heartsContainer) {
    initFloatingLogos(donationCard, heartsContainer);
    
    // Sparkler effect
    let mouseX = -1000, mouseY = -1000, cardRect = donationCard.getBoundingClientRect(), lastSparkleTime = 0;
    donationCard.addEventListener('mousemove', (e) => {
      cardRect = donationCard.getBoundingClientRect();
      mouseX = e.clientX - cardRect.left;
      mouseY = e.clientY - cardRect.top;
      const now = Date.now();
      if (now - lastSparkleTime > 30) {
        lastSparkleTime = now;
        if (Math.random() > 0.4) {
          const spark = document.createElement('div');
          spark.innerHTML = '<svg viewBox="0 0 512 512" style="width: 100%; height: 100%; fill: #ffffff;"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg>';
          const size = Math.random() * 15 + 10;
          spark.style.position = 'absolute'; spark.style.width = `${size}px`; spark.style.height = `${size}px`; spark.style.pointerEvents = 'none'; spark.style.zIndex = '0';
          const startX = mouseX + (Math.random() * 20 - 10), startY = mouseY + (Math.random() * 20 - 10);
          spark.style.left = `${startX}px`; spark.style.top = `${startY}px`; spark.style.opacity = '1';
          spark.style.transform = `translate(-50%, -50%) scale(1) rotate(${Math.random() * 45 - 22}deg)`;
          spark.style.transition = 'all 0.8s cubic-bezier(0.1, 0.8, 0.3, 1)';
          heartsContainer.appendChild(spark);
          spark.getBoundingClientRect();
          spark.style.opacity = '0';
          const endX = (Math.random() * 100 - 50), endY = -(Math.random() * 50 + 30);
          spark.style.transform = `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0.3) rotate(${Math.random() * 90 - 45}deg)`;
          setTimeout(() => { if(spark.parentNode) spark.parentNode.removeChild(spark); }, 800);
        }
      }
    });
    donationCard.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });
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
      
      const balloon = document.createElement('div');
      balloon.innerHTML = '<svg viewBox="0 0 512 512" style="width: 100%; height: 100%; fill: #ffffff;"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg>';
      balloon.style.position = 'absolute'; balloon.style.width = '60px'; balloon.style.height = '60px';
      balloon.style.left = '50%'; balloon.style.top = '50%'; balloon.style.transform = 'translate(-50%, -50%) scale(0)';
      balloon.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; balloon.style.pointerEvents = 'none'; balloon.style.zIndex = '10';
      btn.appendChild(balloon);
      balloon.getBoundingClientRect();
      balloon.style.transform = 'translate(-50%, -50%) scale(1.5)';
      setTimeout(() => {
        balloon.style.opacity = '0'; balloon.style.transform = 'translate(-50%, -50%) scale(2)'; balloon.style.transition = 'all 0.1s ease-out';
        for(let i=0; i<6; i++) {
          const confetti = document.createElement('div');
          confetti.innerHTML = '<svg viewBox="0 0 512 512" style="width: 100%; height: 100%; fill: #ffffff;"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg>';
          confetti.style.position = 'absolute'; confetti.style.width = '15px'; confetti.style.height = '15px';
          confetti.style.left = '50%'; confetti.style.top = '50%'; confetti.style.pointerEvents = 'none';
          const angle = (Math.PI * 2 / 6) * i, velocity = 40, vx = Math.cos(angle) * velocity, vy = Math.sin(angle) * velocity;
          confetti.style.transform = `translate(-50%, -50%)`; confetti.style.transition = 'all 0.4s ease-out';
          btn.appendChild(confetti);
          confetti.getBoundingClientRect();
          confetti.style.transform = `translate(calc(-50% + ${vx}px), calc(-50% + ${vy}px)) scale(0)`; confetti.style.opacity = '0';
          setTimeout(() => { if(confetti.parentNode) confetti.parentNode.removeChild(confetti); }, 400);
        }
      }, 350);
      setTimeout(() => { if(balloon.parentNode) balloon.parentNode.removeChild(balloon); }, 500);

      if (btn.dataset.amount === 'custom') {
        customAmountInput.style.display = 'block'; customAmountInput.required = true; selectedAmount = 'custom';
      } else {
        customAmountInput.style.display = 'none'; customAmountInput.required = false; customAmountInput.value = ''; selectedAmount = btn.dataset.amount;
      }
    });
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
    });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Mobile Menu Toggle ---
  const menuToggle = document.getElementById('mobile-menu');
  const mainNav = document.querySelector('.main-nav');
  if(menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }

  // --- Project Modal Logic ---
  const projectModal = document.getElementById('project-modal');
  if (projectModal) {
    const openButtons = document.querySelectorAll('.open-project-modal');
    const closeButton = projectModal.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-project-title');
    const amountButtons = projectModal.querySelectorAll('.donation-options .btn');
    const customInput = document.getElementById('project-custom-amount');

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

    const closeModal = () => { projectModal.classList.remove('active'); };
    if (closeButton) closeButton.addEventListener('click', closeModal);
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeModal();
    });

    amountButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        amountButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (customInput) customInput.value = '';
      });
    });

    if (customInput) {
      customInput.addEventListener('input', () => {
        amountButtons.forEach(b => b.classList.remove('active'));
      });
    }
  }

  // --- Project Details Modal Logic ---
  const detailsModal = document.getElementById('details-modal');
  if (detailsModal) {
    const openDetailsButtons = document.querySelectorAll('.open-details-modal');
    const detailsCloseButton = detailsModal.querySelector('.close-modal');
    const detailsTitle = document.getElementById('details-modal-title');
    const detailsDesc = document.getElementById('details-modal-desc');
    const detailsImg = document.getElementById('details-modal-img');
    const toDonationBtn = document.getElementById('details-to-donation-btn');

    const projectData = {
      'kovacs-csalad': {
        title: 'Kovács család lakhatása',
        img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        desc: '<p>A Kovács család egy hirtelen jött betegség miatt elveszítette a családfenntartó munkáját. Emiatt tetemes lakbérhátralékot halmoztak fel, és a kilakoltatás szélére kerültek.</p><p>Ezzel a gyűjtéssel célunk, hogy kifizessük az elmaradást és biztosítsuk számukra a lakhatásukat a következő hat hónapra, amíg újra talpra tudnak állni.</p>'
      },
      'natalia': {
        title: 'Natália középiskolai taníttatása',
        img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        desc: '<p>Natália egy rendkívül tehetséges, állami gondoskodásból kikerült diáklány, aki most nyert felvételt az ország egyik legjobb gimnáziumába. Azonban a kollégiumi díjak, étkezés és tanszerek hatalmas terhet rónak rá.</p><p>A gyűjtésből egy teljes tanévnyi költségét szeretnénk fedezni, hogy csak a tanulásra koncentrálhasson.</p>'
      },
      'csopaki-tabor': {
        title: 'Csopaki nyári tábor 2027',
        img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        desc: '<p>Idén nyáron 50 hátrányos helyzetű gyermeket szeretnénk elvinni a Balatonhoz egy egyhetes élménytáborba.</p><p>A legtöbbjük még sosem látta a Balatont. A támogatás fedezi a szállást, a teljes ellátást és a szabadidős programokat.</p>'
      },
      'iskolakezdes': {
        title: 'Tanszercsomagok 50 rászoruló diáknak',
        img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        desc: '<p>Óriási sikerrel zárult az őszi kampányunk! Köszönhetően a támogatóknak, 50 állami gondozásból kikerült, de továbbtanuló fiatal számára tudtunk biztosítani teljes iskolakezdési tanszercsomagot.</p><p>Ezzel a csomaggal esélyt kaptak arra, hogy ne induljanak hátrányból az osztálytársaikkal szemben.</p>'
      },
      'kozossegi-ter': {
        title: 'Közösségi tér felújítása',
        img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        desc: '<p>A pesterzsébeti ifjúsági találkozópontunk végre új életre kelt! A közösségi finanszírozásból befolyt összegből sikerült szigetelni a tetőt, kicserélni az ablakokat, és beszerezni a szükséges bútorokat.</p><p>Most már télen-nyáron biztonságos és meleg menedéket nyújt a fiataloknak.</p>'
      }
    };

    let currentProjectTitle = '';

    openDetailsButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-project-id');
        const data = projectData[projectId];
        if (data) {
          detailsTitle.textContent = data.title;
          detailsImg.src = data.img;
          detailsDesc.innerHTML = data.desc;
          currentProjectTitle = data.title;
          detailsModal.classList.add('active');
        }
      });
    });

    const closeDetailsModal = () => { detailsModal.classList.remove('active'); };
    if (detailsCloseButton) detailsCloseButton.addEventListener('click', closeDetailsModal);
    detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) closeDetailsModal();
    });

    if (toDonationBtn) {
      toDonationBtn.addEventListener('click', () => {
        closeDetailsModal();
        const projectModal = document.getElementById('project-modal');
        const modalProjectTitle = document.getElementById('modal-project-title');
        if (projectModal && modalProjectTitle) {
          modalProjectTitle.textContent = `${currentProjectTitle} - Támogatás`;
          projectModal.classList.add('active');
        }
      });
    }
  }

  // --- Lightbox Gallery Logic ---
  const scatteredGallery = document.getElementById('scattered-gallery');
  const lightboxModal = document.getElementById('gallery-lightbox');
  
  if (scatteredGallery && lightboxModal) {
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightboxModal.querySelector('.lightbox-close');
    const prevBtn = lightboxModal.querySelector('.lightbox-prev');
    const nextBtn = lightboxModal.querySelector('.lightbox-next');
    
    const cards = scatteredGallery.querySelectorAll('.scatter-card');
    const images = Array.from(cards).map(card => {
      const bg = card.style.backgroundImage;
      return bg.replace(/(url\(|\)|'|")/gi, '');
    });
    
    let currentIndex = 0;

    function openLightbox(index) {
      if (images.length === 0) return;
      currentIndex = index;
      lightboxImg.src = images[currentIndex];
      lightboxModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightboxModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    function changeSlide(step) {
      currentIndex += step;
      if (currentIndex >= images.length) currentIndex = 0;
      if (currentIndex < 0) currentIndex = images.length - 1;
      lightboxImg.style.animation = 'none';
      lightboxImg.offsetHeight;
      lightboxImg.style.animation = 'zoomIn 0.3s ease';
      lightboxImg.src = images[currentIndex];
    }

    scatteredGallery.addEventListener('click', () => openLightbox(0));
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); changeSlide(1); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); changeSlide(-1); });
    
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
      if (lightboxModal.style.display === 'block') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') changeSlide(1);
        if (e.key === 'ArrowLeft') changeSlide(-1);
      }
    });
  }

  // --- Auto-Peek Floating Buttons ---
  const floatingBtns = [
    document.querySelector('.floating-projects-btn'),
    document.querySelector('.floating-housing-btn'),
    document.querySelector('.floating-fecske-btn'),
    document.querySelector('.floating-bistro-btn')
  ].filter(btn => btn !== null);

  if (floatingBtns.length > 0) {
    const currentPath = window.location.pathname;
    const isTargetPage = currentPath.includes('hogyan-segithetsz.html') || 
                         currentPath.includes('szocialis-lakasugynokseg.html') || 
                         currentPath.includes('fecske-adomanybolt.html') || 
                         currentPath.includes('digitalis-bisztro.html');

    if (!isTargetPage) {
      function runWave() {
        const isHovering = floatingBtns.some(btn => btn.matches(':hover'));
        if (isHovering) return;

        // Alkalmazzuk a gyors transition-t minden gombra a hullám idejére (nyitás és csukás is gyors lesz)
        floatingBtns.forEach(btn => btn.classList.add('wave-fast-transition'));

      // 1. Hullám (Fentről lefelé, 0-500ms)
      floatingBtns.forEach((btn, index) => {
        setTimeout(() => { btn.classList.add('auto-peek'); }, index * 100);
        setTimeout(() => { btn.classList.remove('auto-peek'); }, index * 100 + 100);
      });

      // 2. Hullám (Lentről felfelé, 500-1000ms)
      floatingBtns.forEach((btn, index) => {
        const reverseIndex = floatingBtns.length - 1 - index;
        // Itt index a gomb eredeti sorszáma, reverseIndex pedig a fordított sorszám
        setTimeout(() => { btn.classList.add('auto-peek'); }, 500 + reverseIndex * 100);
        setTimeout(() => { btn.classList.remove('auto-peek'); }, 500 + reverseIndex * 100 + 100);
      });

      // A 2 hullám összesen kb 1000ms alatt fut le, így 1100ms után biztonságosan levehetjük a gyors transition-t.
      setTimeout(() => {
        floatingBtns.forEach(btn => btn.classList.remove('wave-fast-transition'));
      }, 1100);
    }
    
    setTimeout(() => {
      setInterval(runWave, 10000);
      runWave();
    }, 3000);
    }
  }

  // --- Bistro Interactive Effects ---
  const bistroCard = document.getElementById('bistro-card');
  const effectsContainer = document.getElementById('bistro-effects-container');
  
  if (bistroCard && effectsContainer) {
    initFloatingLogos(bistroCard, effectsContainer);

    function createMug() {
      const mug = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mug.setAttribute('viewBox', '0 0 512 512');
      mug.classList.add('floating-mug');
      mug.innerHTML = '<path d="M400 32H48C21.5 32 0 53.5 0 80v272c0 70.7 57.3 128 128 128h144c70.7 0 128-57.3 128-128v-32h16c61.9 0 112-50.1 112-112V144c0-61.9-50.1-112-112-112h-16zm16 176h-16v-96h16c26.5 0 48 21.5 48 48s-21.5 48-48 48z"/>';
      const size = Math.random() * 20 + 20;
      mug.style.width = `${size}px`;
      mug.style.height = `${size}px`;
      const left = Math.random() * 100;
      mug.style.left = `${left}%`;
      mug.style.bottom = '-50px';
      const duration = Math.random() * 6 + 6;
      mug.style.animationDuration = `${duration}s`;
      effectsContainer.appendChild(mug);
      setTimeout(() => {
        if (effectsContainer.contains(mug)) {
          effectsContainer.removeChild(mug);
        }
      }, duration * 1000);
    }
    
    setInterval(createMug, 1500);
    
    bistroCard.addEventListener('mousemove', (e) => {
      if (Math.random() > 0.4) return;
      const rect = bistroCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      star.setAttribute('viewBox', '0 0 576 512');
      star.classList.add('bistro-star');
      star.innerHTML = '<path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>';
      const size = Math.random() * 10 + 8;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.fill = '#ffd040';
      star.style.left = `${x - size/2}px`;
      star.style.top = `${y - size/2}px`;
      star.style.setProperty('--tx', `${(Math.random() - 0.5) * 80}px`);
      star.style.setProperty('--ty', `${(Math.random() - 0.5) * 80 + 30}px`);
      effectsContainer.appendChild(star);
      setTimeout(() => {
        if (effectsContainer.contains(star)) {
          effectsContainer.removeChild(star);
        }
      }, 800);
    });
  }

  // --- Global Tax 1% Modal Logic ---
  window.openTaxModal = function(e) {
    if (e) e.preventDefault();
    let overlay = document.getElementById('tax-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tax-modal-overlay';
      overlay.className = 'tax-modal-overlay';
      overlay.innerHTML = `
        <div class="tax-modal-content">
          <button class="tax-modal-close" onclick="closeTaxModal()">&times;</button>
          <div class="tax-modal-body">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-red);">1%</div>
            <h3 style="color: var(--color-dark-blue); margin-bottom: 1rem;">Adó 1% felajánlása</h3>
            <p style="color: var(--color-dark-blue); margin-bottom: 1.5rem; line-height: 1.6;">Adód 1%-ának felajánlásával közvetlenül hozzájárulhatsz a nehéz sorsú családok támogatásához és programjaink fenntartásához. Számodra ez nem kerül semmibe, nekünk viszont hatalmas segítség!</p>
            <div style="background-color: #f4ece4; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--color-red); text-align: center;">
              <strong>Adószámunk:</strong><br>
              <span style="font-size: 1.25rem; font-weight: bold; color: var(--color-dark-blue); letter-spacing: 1px;">19241841-1-15</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Close on clicking outside
      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) {
          closeTaxModal();
        }
      });
    }

    // Force reflow and add active class for transition
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);
  };

  window.closeTaxModal = function() {
    const overlay = document.getElementById('tax-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      // Optional: remove from DOM after transition
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
    }
  };

  // --- Interactive Cosmic Banner Logic ---
  const cosmicBanner = document.querySelector('.tax-banner-gradient');
  if (cosmicBanner) {
    cosmicBanner.addEventListener('mousemove', (e) => {
      const rect = cosmicBanner.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cosmicBanner.style.setProperty('--mouse-x', `${x}%`);
      cosmicBanner.style.setProperty('--mouse-y', `${y}%`);
    });
  }

});
