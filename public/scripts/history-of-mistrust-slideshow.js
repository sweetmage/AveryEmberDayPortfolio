
    (function() {
      'use strict';

      /* ── Slide data ── */
      const BASE = '/images/myart/A History of Mistrust/slides/';

      /* Exact words written on each slide (used as alt text + caption).
         Transcribed directly from the artwork on 2026-07-27. Entries 7-18 had been out of
         order since before that date: the four slides that close Set 1 (7-10) were sitting
         behind Set 2's opening block (11-18), so screen readers got the wrong words on
         twelve slides and the lightbox paired wrong captions with wrong images. Set title
         cards must land on 1 / 11 / 21 to match the Math.ceil(n / 10) set math below. */
      const SLIDE_ALT = [
        "A History of Mistrust: Why Some Communities Struggle to Trust Doctors",
        "Fun Fact: Being LGBTQ+ is normal and okay",
        "Un-Fun Fact: Homosexuality was classified as a mental disorder that was treated with harmful conversion therapy or even shock therapy until 1973. Even after guidelines were changed, harmful treatments persisted through the 1980s, and discrimination persists today.",
        "POC & LGBTQ+ individuals often face systemic discrimination when seeking healthcare.",
        "Black, Indigenous, and Latinx women have been sterilized without consent as recently as 2013.",
        "Tuskegee Experiment (1932-1972): American healthcare providers lied to Black men and denied them treatment for syphilis to study the disease, even after a widespread cure was developed.",
        "The US Government's slow response disproportionately harmed LGBTQ+ & POC communities. Current information on the subject has been removed from USA.gov.",
        "Mistrust leads to: Late diagnoses, Poorer mental health, Non-adherence to necessary treatment, Higher mortality rates",
        "“Health is more than the absence of disease. Health is about jobs and employment, education, the environment, and all of those things that go into making us healthy.” -Dr. Joycelyn Elders",
        "The first step to rebuilding trust is understanding why it was broken. Share this series with your community and let's start that conversation together.",
        "AIDS Care in Marginalized Communities",
        "Black people represent only 12% of the population but bear 38% of new diagnoses (which is a >3x disparity ratio), while Hispanic individuals represent 18% of the population but bear 32% of new diagnoses. Why?",
        "Systemic barriers prevent access to life-saving treatments like PrEP",
        "High costs, Lack of access to healthcare, Stigma & discrimination all contribute to these disparities.",
        "LGBTQ+ individuals and POC often receive disproportionately inferior treatment and face dismissal of symptoms.",
        "This discrimination leads to avoidance of crucial treatment.",
        "This directly leads these communities to later diagnoses & worse health outcomes.",
        "The AIDS crisis emerged in the early 1980s, claiming the lives of over 44 million people worldwide.",
        "Do your part: Get yourself tested, End the stigma behind STDs, Educate yourself, Encourage your loved ones to get tested",
        "Awareness is only effective in numbers. Share this post among your community. Let's work towards a better future together.",
        "Rebuilding Trust Between Marginalized Communities & Healthcare Providers",
        "Rebuilding trust is critical to closing the gap in medical care for marginalized communities. Okay sounds cool, but...",
        "How Do We Start?",
        "Support Community-led Clinics. Clinics run by LGBTQ+ & POC often provide safe, affirming care.",
        "Representation Matters. Patients trust providers who reflect their race, culture, & experiences.",
        "Cultural Competency is Essential. Training doctors and nurses to understand diverse experiences is key to changing how marginalized communities receive care.",
        "“We do have the power, if we come together, to make change.” -Dr. Karthik Sivashanker",
        "Advocate for Policy Changes. We need policies that require inclusive care and punish discriminatory practices in healthcare systems.",
        "Community support for policy changes is necessary to ensure inclusive healthcare for all!",
        "Share this to spread awareness so we can secure a future with healthcare that is: inclusive, affordable, accessible, culturally competent."
      ];

      const slides = [];
      for (let i = 1; i <= 30; i++) {
        slides.push({
          src: BASE + 'slide-' + String(i).padStart(2, '0') + '.webp',
          full: BASE + 'slide-' + String(i).padStart(2, '0') + '@2x.webp',
          alt: SLIDE_ALT[i - 1],
          n: i
        });
      }

      /* ── Lightbox ── */
      const lightbox = document.getElementById('lightbox');
      const lbTrack = document.querySelector('.lightbox-track');
      const lbCaption = document.getElementById('lightbox-caption');
      const lbClose = document.querySelector('.lightbox-close');
      const lbPrev = document.querySelector('.lightbox-prev');
      const lbNext = document.querySelector('.lightbox-next');
      const lbFrame = document.querySelector('.lightbox-frame');
      let lbIndex = 0;
      let lastFocused = null;
      let isDragging = false;
      let startX = 0;
      let prevTranslate = 0;
      const dragThreshold = 80;
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

      const lightboxSlides = slides.map((slide, index) => ({
        ...slide,
        index,
        caption: 'Slide ' + slide.n + ' of 30 · Set ' + Math.ceil(slide.n / 10)
      }));

      lightboxSlides.forEach((slide) => {
        const pane = document.createElement('div');
        pane.className = 'lightbox-slide';
        const img = document.createElement('img');
        img.src = slide.full;
        img.alt = slide.alt;
        img.decoding = 'async';
        pane.appendChild(img);
        lbTrack.appendChild(pane);
      });

      function updateLightboxPosition(animate = true) {
        lbTrack.style.transition = animate ? 'transform 240ms ease' : 'none';
        lbTrack.style.transform = `translateX(${-lbIndex * 100}%)`;
      }

      function setLightboxControls() {
        lbPrev.disabled = lbIndex === 0;
        lbNext.disabled = lbIndex === lightboxSlides.length - 1;
      }

      function updateLightboxCaption() {
        lbCaption.textContent = lightboxSlides[lbIndex].caption;
      }

      function openLightbox(index) {
        if (index < 0 || index >= lightboxSlides.length) return;
        lbIndex = index;
        lastFocused = document.activeElement;
        lightbox.hidden = false;
        void lightbox.offsetWidth;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateLightboxCaption();
        setLightboxControls();
        updateLightboxPosition(false);
        lbFrame.focus();
      }

      function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
          lightbox.hidden = true;
        }, 200);
        if (lastFocused) lastFocused.focus();
      }

      function showLightbox(index) {
        if (index < 0 || index >= lightboxSlides.length) return;
        lbIndex = index;
        updateLightboxCaption();
        setLightboxControls();
        updateLightboxPosition();
      }

      lbClose.addEventListener('click', closeLightbox);
      lbPrev.addEventListener('click', () => showLightbox(lbIndex - 1));
      lbNext.addEventListener('click', () => showLightbox(lbIndex + 1));

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });

      lightbox.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); showLightbox(lbIndex - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); showLightbox(lbIndex + 1); }
        const focusables = Array.from(lightbox.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      function getFrameWidth() {
        return lbFrame.clientWidth || lbFrame.getBoundingClientRect().width;
      }

      function pointerDown(event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (event.target.closest('button')) return;
        isDragging = true;
        startX = event.clientX;
        prevTranslate = -lbIndex * getFrameWidth();
        lbFrame.setPointerCapture(event.pointerId);
        lbFrame.classList.add('dragging');
        lbTrack.style.transition = 'none';
      }

      function pointerMove(event) {
        if (!isDragging) return;
        const delta = event.clientX - startX;
        lbTrack.style.transform = `translateX(${prevTranslate + delta}px)`;
      }

      function pointerUp(event) {
        if (!isDragging) return;
        isDragging = false;
        lbFrame.releasePointerCapture(event.pointerId);
        lbFrame.classList.remove('dragging');
        const delta = event.clientX - startX;
        if (Math.abs(delta) > dragThreshold) {
          if (delta < 0) showLightbox(lbIndex + 1);
          else showLightbox(lbIndex - 1);
        } else {
          showLightbox(lbIndex);
        }
      }

      lbFrame.addEventListener('pointerdown', pointerDown);
      lbFrame.addEventListener('pointermove', pointerMove);
      lbFrame.addEventListener('pointerup', pointerUp);
      lbFrame.addEventListener('pointercancel', pointerUp);
      lbFrame.addEventListener('pointerleave', pointerUp);

      /* ── Per-set slideshows ── */
      document.querySelectorAll('.set-slideshow').forEach((widget) => {
        const setNum = parseInt(widget.dataset.set, 10);
        const startGlobal = (setNum - 1) * 10; // 0-based index into slides
        const track = widget.querySelector('.set-ss-track');
        const counter = widget.querySelector('.set-ss-counter');
        const viewer = widget.querySelector('.set-ss-viewer');
        const prevBtn = widget.querySelector('.set-ss-prev');
        const nextBtn = widget.querySelector('.set-ss-next');
        const setSlides = slides.slice(startGlobal, startGlobal + 10);
        let local = 0;

        setSlides.forEach((s) => {
          const pane = document.createElement('div');
          pane.className = 'set-ss-slide';
          const img = document.createElement('img');
          img.src = s.src;
          img.alt = s.alt;
          img.decoding = 'async';
          img.loading = 'lazy';
          pane.appendChild(img);
          track.appendChild(pane);
        });

        function preload(j) {
          if (j >= 0 && j < setSlides.length) {
            const im = new Image();
            im.src = setSlides[j].src;
          }
        }

        function update(animate) {
          track.classList.toggle('no-transition', !animate);
          track.style.transform = `translateX(${-local * 100}%)`;
          if (!animate) setTimeout(() => track.classList.remove('no-transition'), 10);
          counter.textContent = 'Slide ' + (local + 1) + ' of ' + setSlides.length;
          prevBtn.disabled = local === 0;
          nextBtn.disabled = local === setSlides.length - 1;
          preload(local - 1);
          preload(local + 1);
        }

        prevBtn.addEventListener('click', () => { if (local > 0) { local--; update(true); } });
        nextBtn.addEventListener('click', () => { if (local < setSlides.length - 1) { local++; update(true); } });
        viewer.addEventListener('click', () => openLightbox(startGlobal + local));

        widget.addEventListener('keydown', (e) => {
          if (lightbox.classList.contains('active')) return;
          if (e.key === 'ArrowLeft') { e.preventDefault(); if (local > 0) { local--; update(true); } }
          if (e.key === 'ArrowRight') { e.preventDefault(); if (local < setSlides.length - 1) { local++; update(true); } }
        });

        update(false);
      });

      /* ── Carousel set images → lightbox at set start ── */
      document.querySelectorAll('.carousel-set img').forEach((img, i) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openLightbox(i * 10));
      });
    })();
    