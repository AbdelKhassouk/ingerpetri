document.addEventListener('DOMContentLoaded', function() {

  // ==========================================================
  // Helper Functions
  // ==========================================================

  // Simple Email Validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Highlight Invalid Form Fields
  function highlightField(field, isInvalid) {
    if (!field) return;
    if (isInvalid) {
      field.style.borderColor = '#e74c3c'; // Reddish border for error
      field.style.backgroundColor = 'rgba(231, 76, 60, 0.05)';
    } else {
      field.style.borderColor = '#e1e8e9'; // Default border color
      field.style.backgroundColor = 'white';
    }
  }

  // Show Form Submission Feedback (Contact & Newsletter)
  function showSubmitFeedback(form, message, isSuccess) {
    if (!form) return;
    // Remove existing feedback
    const existingFeedback = form.querySelector('.form-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'form-feedback';
    feedback.textContent = message;

    // Style based on success/error
    feedback.style.marginTop = '15px';
    feedback.style.padding = '10px';
    feedback.style.borderRadius = '8px';
    if (isSuccess) {
      feedback.style.color = form.closest('.footer-top') ? 'white' : '#27ae60'; // Success color (white for footer)
      feedback.style.backgroundColor = form.closest('.footer-top') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(39, 174, 96, 0.1)';
    } else {
      feedback.style.color = form.closest('.footer-top') ? '#ffcccc' : '#e74c3c'; // Error color (lighter red for footer)
      feedback.style.backgroundColor = form.closest('.footer-top') ? 'rgba(255, 0, 0, 0.1)' : 'rgba(231, 76, 60, 0.1)';
    }

    // Add feedback to the form
    form.appendChild(feedback);

    // Remove feedback after 5 seconds
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (feedback.parentNode === form) { // Check if still attached
            form.removeChild(feedback);
        }
      }, 500);
    }, 5000);
  }

  // ==========================================================
  // Header and Navigation Logic
  // ==========================================================
  function initializeHeader() {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerOverlay = document.querySelector('.mobile-drawer-overlay');
    const drawerClose = document.querySelector('.drawer-close');
    const drawerLinks = document.querySelectorAll('.drawer-link, .drawer-button'); // Links inside the drawer

    // --- Mobile Drawer Functionality ---
    if (mobileToggle && mobileDrawer && drawerOverlay) {
      const closeDrawer = () => {
        mobileDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
        mobileToggle.classList.remove('open');
      };

      // Open drawer
      mobileToggle.addEventListener('click', function() {
        mobileDrawer.classList.add('active');
        drawerOverlay.classList.add('active');
        document.body.classList.add('drawer-open');
        this.classList.add('open');
      });

      // Close drawer triggers
      if (drawerClose) {
        drawerClose.addEventListener('click', closeDrawer);
      }
      drawerOverlay.addEventListener('click', closeDrawer);

      // Close drawer on link click (if it's an internal scroll link)
      drawerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default jump
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            closeDrawer(); // Close the drawer first

            // Scroll after drawer is closed
            setTimeout(() => {
              if (targetElement) {
                smoothScrollTo(targetElement);
              }
            }, 350); // Delay slightly longer than CSS transition
          });
        }
        // Allow normal navigation for external links or non-anchor links
      });

      // Close drawer on window resize if screen becomes larger than mobile breakpoint
      window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileDrawer.classList.contains('active')) {
          closeDrawer();
        }
      });
    }

    // --- Sticky Header ---
    let lastScrollTop = 0;
    const scrollThreshold = 50; // Pixels to scroll before header becomes sticky
    if (header) {
      window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > scrollThreshold) {
          header.classList.add('sticky-header');
        } else {
          header.classList.remove('sticky-header');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
      }, false);
    }

    // --- Dropdown Accessibility ---
    const dropdownToggles = document.querySelectorAll('.has-dropdown > .nav-link');
    dropdownToggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
      const parentItem = toggle.closest('.has-dropdown');
      if (parentItem) {
        parentItem.addEventListener('mouseenter', () => toggle.setAttribute('aria-expanded', 'true'));
        parentItem.addEventListener('mouseleave', () => toggle.setAttribute('aria-expanded', 'false'));
        // Basic keyboard support (optional but recommended)
        toggle.addEventListener('focus', () => toggle.setAttribute('aria-expanded', 'true'));
        const lastDropdownItem = parentItem.querySelector('.dropdown-menu .dropdown-item:last-child');
        if (lastDropdownItem) {
            lastDropdownItem.addEventListener('blur', () => toggle.setAttribute('aria-expanded', 'false'));
        } else {
             // If no items, handle blur on the menu itself or parent
             const dropdownMenu = parentItem.querySelector('.dropdown-menu');
             if (dropdownMenu) {
                 dropdownMenu.addEventListener('focusout', (e) => {
                     if (!parentItem.contains(e.relatedTarget)) {
                         toggle.setAttribute('aria-expanded', 'false');
                     }
                 });
             }
        }
      }
    });
  }


  // ==========================================================
  // Smooth Scrolling for Internal Links
  // ==========================================================
  function smoothScrollTo(targetElement) {
      if (!targetElement) return;
      const headerOffset = document.querySelector('.site-header')?.offsetHeight || 80; // Adjust offset based on sticky header height
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
      });
  }

  function initializeSmoothScroll() {
      // Select all potential anchor links, including those added dynamically
      document.body.addEventListener('click', function(event) {
          const link = event.target.closest('a'); // Find the nearest anchor link clicked

          if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
              const href = link.getAttribute('href');
              // Ensure it's not just a placeholder '#'
              if (href.length > 1) {
                  event.preventDefault(); // Prevent default jump
                  const targetId = href.substring(1);
                  const targetElement = document.getElementById(targetId);
                  smoothScrollTo(targetElement);
              }
          }
      });
  }


  // ==========================================================
  // Scroll-Triggered Animations
  // ==========================================================
  function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .control-point'); // Add other classes if needed
    const animationThreshold = window.innerHeight * 0.85; // Trigger when 85% visible

    const handleScroll = () => {
      animatedElements.forEach((element, index) => {
        const elementPosition = element.getBoundingClientRect().top;

        if (elementPosition < animationThreshold) {
          // Apply staggered delay for control points
          if (element.classList.contains('control-point')) {
            setTimeout(() => {
              element.classList.add('active');
            }, index * 150); // Stagger effect
          } else {
            element.classList.add('active');
          }
        }
        // Optional: Remove 'active' class if element scrolls out of view (for re-animation)
        // else if (elementPosition > window.innerHeight) {
        //   element.classList.remove('active');
        // }
      });
    };

    // Initial check on load (after a short delay)
    setTimeout(handleScroll, 100);

    // Check on scroll
    window.addEventListener('scroll', handleScroll);
  }


  // ==========================================================
  // Testimonial Slider Logic
  // ==========================================================
  function initializeTestimonialSlider() {
    const sliderContainer = document.querySelector('.testimonials-container');
    if (!sliderContainer) return; // Exit if slider doesn't exist

    const slider = sliderContainer.querySelector('.testimonials-slider');
    const prevButton = sliderContainer.querySelector('.testimonial-nav.prev-button'); // Assuming classes prev/next-button exist
    const nextButton = sliderContainer.querySelector('.testimonial-nav.next-button');
    const cards = sliderContainer.querySelectorAll('.testimonial-card');

    if (!slider || !prevButton || !nextButton || cards.length === 0) {
        console.warn("Testimonial slider elements not found or incomplete.");
        return;
    }

    let currentIndex = 0;
    let visibleSlides = 3; // Default for desktop

    const updateSliderState = () => {
        // Determine visible slides based on window width
        if (window.innerWidth <= 768) {
            // Mobile: Stack vertically - disable slider functionality
            slider.style.transform = ''; // Reset transform
            cards.forEach(card => card.style.transform = ''); // Reset card transforms
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
            return; // Stop slider logic on mobile
        } else if (window.innerWidth <= 1024) {
            visibleSlides = 2;
        } else {
            visibleSlides = 3;
        }

        // Show buttons if hidden
        prevButton.style.display = 'flex';
        nextButton.style.display = 'flex';

        // Calculate offset
        const cardWidth = cards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(slider).gap) || 20; // Get gap from CSS
        const totalCardWidth = cardWidth + gap;
        const offset = -currentIndex * totalCardWidth;
        slider.style.transform = `translateX(${offset}px)`;

        // Update button disabled state and appearance
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= cards.length - visibleSlides;
        prevButton.style.opacity = prevButton.disabled ? '0.5' : '1';
        prevButton.style.cursor = prevButton.disabled ? 'default' : 'pointer';
        nextButton.style.opacity = nextButton.disabled ? '0.5' : '1';
        nextButton.style.cursor = nextButton.disabled ? 'default' : 'pointer';
    };

    // Event Listeners
    prevButton.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSliderState();
      }
    });

    nextButton.addEventListener('click', () => {
      if (currentIndex < cards.length - visibleSlides) {
        currentIndex++;
        updateSliderState();
      }
    });

    window.addEventListener('resize', () => {
        // Reset index on resize to avoid broken states
        currentIndex = 0;
        updateSliderState();
    });

    // Initial setup
    updateSliderState();

    // --- Read More Functionality ---
    const readMoreButtons = sliderContainer.querySelectorAll('.testimonial-read-more');
    const fullTexts = { // Example full texts (replace with actual data source if possible)
        'Sofie Andersen': 'Ingers coaching hjalp mig med at finde balancen igen efter en stressende periode. Hendes rolige og empatiske tilgang gjorde, at jeg følte mig tryg fra første session. Gennem vores samtaler lærte jeg at sætte grænser og finde små øjeblikke af ro i en travl hverdag. Jeg har nu værktøjer til at håndtere stress på en helt anden måde end før.',
        'Thomas Nielsen': 'Efter kurset hos Inger føler jeg mig langt bedre rustet til at håndtere presset på arbejdspladsen. Hendes praktiske værktøjer og indsigtsfulde vejledning har været guld værd. Jeg har lært at genkende mine egne stresssymptomer og handle på dem, før de bliver for overvældende. Den opmærksomhed jeg nu kan give mine kollegaer har også forbedret arbejdsmiljøet.',
        'Louise Madsen': 'Jeg kan varmt anbefale Ingers parterapi. Med hendes hjælp fandt min mand og jeg tilbage til hinanden efter en svær periode. Hendes evne til at skabe en åben dialog gjorde, at vi kunne tale om de svære ting på en konstruktiv måde. Inger gav os konkrete redskaber til at håndtere konflikter og har lært os at lytte til hinanden på en ny måde.',
        'Kim Rasmussen': 'Stresshåndteringskurset var præcis hvad jeg havde brug for. Inger formår at formidle kompleks viden på en letforståelig måde og skaber et trygt rum for personlig udvikling. Efter kurset har jeg kunne implementere små ændringer i min hverdag, som har gjort en stor forskel. Jeg er særligt glad for de praktiske øvelser, som jeg nu bruger dagligt.'
    };

    readMoreButtons.forEach(button => {
        const card = button.closest('.testimonial-card');
        const testimonialText = card.querySelector('.testimonial-text');
        const authorName = card.querySelector('.testimonial-author h3')?.textContent;
        const originalText = testimonialText.textContent; // Store the initial truncated text

        button.addEventListener('click', function() {
            if (this.textContent === 'Læs mere') {
                if (authorName && fullTexts[authorName]) {
                    testimonialText.textContent = fullTexts[authorName];
                }
                // Store original text if not already stored
                if (!this.hasAttribute('data-original-text')) {
                    this.setAttribute('data-original-text', originalText);
                }
                this.textContent = 'Læs mindre';
            } else {
                testimonialText.textContent = this.getAttribute('data-original-text') || originalText; // Fallback to initial if attribute missing
                this.textContent = 'Læs mere';
            }
            // Important: Recalculate slider state if needed, as card height might change
            // updateSliderState(); // Only necessary if height changes affect layout significantly
        });
    });
  }


  // ==========================================================
  // Courses Section Logic (Placeholder/Example)
  // ==========================================================
  function initializeCoursesSection() {
    const courseCards = document.querySelectorAll('.course-card');

    // Optional: Add hover effects for touch devices (improves feedback)
    courseCards.forEach(card => {
      card.addEventListener('touchstart', function() {
        // You might need specific CSS for '.touch-hover'
        this.classList.add('touch-hover');
      }, { passive: true });

      card.addEventListener('touchend', function() {
        this.classList.remove('touch-hover');
      }, { passive: true });
    });

    // Click handler (if cards link somewhere or open modals)
    // This uses the existing smooth scroll if linking to #id
    // Add specific logic here if cards should open modals, etc.
    courseCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) {
                // If it's not an internal anchor link, let the default navigation happen
                // Or add modal opening logic here:
                // e.preventDefault();
                // console.log(`Course card clicked: ${this.querySelector('h3')?.textContent}`);
                // openCourseModal(this.dataset.courseId); // Example
            }
            // Internal anchor links are handled by initializeSmoothScroll
        });
    });
  }

  // ==========================================================
  // Contact Form Logic
  // ==========================================================
  function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    const nameField = contactForm.querySelector('#name');
    const emailField = contactForm.querySelector('#email');
    const subjectField = contactForm.querySelector('#subject'); // Make sure ID exists in HTML
    const messageField = contactForm.querySelector('#message'); // Make sure ID exists in HTML

    contactForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Stop default submission

      let isValid = true;

      // --- Validation ---
      // Name
      if (!nameField || !nameField.value.trim()) {
        highlightField(nameField, true);
        isValid = false;
      } else {
        highlightField(nameField, false);
      }

      // Email
      if (!emailField || !emailField.value.trim() || !isValidEmail(emailField.value)) {
        highlightField(emailField, true);
        isValid = false;
      } else {
        highlightField(emailField, false);
      }

      // Subject (Optional, add check if required)
       if (!subjectField || !subjectField.value.trim()) { // Assuming subject is required
           highlightField(subjectField, true);
           isValid = false;
       } else {
           highlightField(subjectField, false);
       }

      // Message
      if (!messageField || !messageField.value.trim()) {
        highlightField(messageField, true);
        isValid = false;
      } else {
        highlightField(messageField, false);
      }

      // --- Submission ---
      if (isValid) {
        // ** REPLACE WITH ACTUAL FORM SUBMISSION LOGIC (e.g., fetch API) **
        console.log('Form data is valid. Submitting (simulated)...');
        const formData = {
          name: nameField.value.trim(),
          email: emailField.value.trim(),
          subject: subjectField?.value.trim(), // Use optional chaining if not required
          message: messageField.value.trim()
        };
        console.log(formData);

        // Show success message
        showSubmitFeedback(contactForm, 'Tak for din besked! Jeg vender tilbage til dig hurtigst muligt.', true);
        contactForm.reset(); // Clear the form
        // Remove highlights on reset
        highlightField(nameField, false);
        highlightField(emailField, false);
        highlightField(subjectField, false);
        highlightField(messageField, false);

      } else {
        // Show general error message if validation fails
        showSubmitFeedback(contactForm, 'Udfyld venligst alle påkrævede felter korrekt.', false);
      }
    });
  }


  // ==========================================================
  // Footer Logic (Newsletter & Back-to-Top)
  // ==========================================================
  function initializeFooter() {
    // --- Newsletter Form ---
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const checkboxInput = newsletterForm.querySelector('input[type="checkbox"]'); // Make sure ID/selector is correct

      newsletterForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let isValid = true;
        let message = '';

        // Validate Email
        if (!emailInput || !emailInput.value.trim() || !isValidEmail(emailInput.value)) {
          isValid = false;
          message = 'Indtast venligst en gyldig emailadresse.';
          highlightField(emailInput, true);
        } else {
          highlightField(emailInput, false);
        }

        // Validate Checkbox (if present and required)
        if (!checkboxInput || !checkboxInput.checked) {
          isValid = false;
          // Append to message if email was also invalid, or set if email was valid
          message = message ? message + ' Du skal også acceptere betingelserne.' : 'Du skal acceptere betingelserne.';
          // Optionally highlight the checkbox area or label
          // highlightField(checkboxInput.closest('.checkbox-container'), true); // Example - needs CSS styling
        } else {
          // highlightField(checkboxInput.closest('.checkbox-container'), false);
        }


        if (isValid) {
          // ** REPLACE WITH ACTUAL NEWSLETTER SIGNUP LOGIC (e.g., Mailchimp API) **
          console.log('Newsletter signup valid:', emailInput.value);

          showSubmitFeedback(newsletterForm, 'Tak for din tilmelding! Du vil snart modtage en bekræftelsesmail.', true);
          newsletterForm.reset();
          highlightField(emailInput, false);
          // highlightField(checkboxInput.closest('.checkbox-container'), false);

        } else {
          showSubmitFeedback(newsletterForm, message || 'Der opstod en fejl.', false);
        }
      });
    }

    // --- Back to Top Button ---
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '&uarr;'; // Up arrow
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Tilbage til toppen');

    // Basic Styling (consider moving to CSS)
    Object.assign(backToTopButton.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px', // Adjust if overlapping with sticky book button
      backgroundColor: '#E7C27B', // Match theme
      color: '#2F4E52',
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      border: 'none',
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      cursor: 'pointer',
      display: 'flex', // Use flex for centering
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      opacity: '0',
      visibility: 'hidden', // Use visibility for better accessibility
      transition: 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease',
      transform: 'translateY(10px)', // Start slightly down
      zIndex: '98' // Below drawer overlay but above most content
    });

    document.body.appendChild(backToTopButton);

    // Show/Hide Logic
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) { // Show after scrolling 300px
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
        backToTopButton.style.transform = 'translateY(0)';
      } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
        backToTopButton.style.transform = 'translateY(10px)';
      }
    });

    // Click to Scroll Top
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================
  // Sticky "Book Tid" Button Logic
  // ==========================================================
  function initializeStickyBookButton() {
    const stickyButton = document.querySelector('.sticky-book-button');
    if (!stickyButton) return;

    // Initial state (optional: could be set via CSS)
    stickyButton.style.opacity = '0';
    stickyButton.style.visibility = 'hidden';
    stickyButton.style.transform = 'translateY(10px)';

    // Show button after a short delay
    setTimeout(() => {
      stickyButton.style.opacity = '1';
      stickyButton.style.visibility = 'visible';
      stickyButton.style.transform = 'translateY(0)';
    }, 1500); // Delay in ms

    // Optional: Hide button when near the footer or contact form
    const contactSection = document.querySelector('.contact-section'); // Target element to hide near
    let hideThreshold = Infinity;
    if (contactSection) {
        // Calculate threshold based on contact section top position
         // Run calculation on load and resize
        const calculateThreshold = () => {
            hideThreshold = contactSection.getBoundingClientRect().top + window.pageYOffset - window.innerHeight + 150; // Hide 150px before it comes into view
        }
        calculateThreshold();
        window.addEventListener('resize', calculateThreshold);
    }


    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
       if (scrollTop > hideThreshold) {
           stickyButton.style.opacity = '0';
           stickyButton.style.visibility = 'hidden';
           stickyButton.style.transform = 'translateY(10px)';
       } else if (scrollTop > 100) { // Ensure it doesn't immediately reappear if threshold logic fails
           stickyButton.style.opacity = '1';
           stickyButton.style.visibility = 'visible';
           stickyButton.style.transform = 'translateY(0)';
       }
    });

    // Click handler (smooth scrolls to contact section)
    stickyButton.addEventListener('click', function(event) {
        event.preventDefault();
        const targetElement = document.getElementById('kontakt') || document.querySelector('.contact-section'); // Find contact section by ID or class
        smoothScrollTo(targetElement);
    });
  }

  // ==========================================================
  // Placeholder Click Handlers (Video, Buttons)
  // ==========================================================
  function initializePlaceholders() {
    // Video Placeholder
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (videoPlaceholder) {
      videoPlaceholder.addEventListener('click', function() {
        alert('Videoafspiller åbner her. Erstat denne placeholder med din videoindlejringskode.');
        // Example: Replace placeholder with iframe
        // const iframe = document.createElement('iframe');
        // iframe.src = 'YOUR_VIDEO_URL?autoplay=1'; // Add autoplay if desired
        // iframe.width = '100%';
        // iframe.height = '100%';
        // iframe.allow = 'autoplay; encrypted-media';
        // iframe.allowFullscreen = true;
        // videoPlaceholder.innerHTML = ''; // Clear placeholder content
        // videoPlaceholder.appendChild(iframe);
        // videoPlaceholder.style.cursor = 'default'; // Remove pointer cursor
      });
    }

    // General CTA/Consultation Buttons (if they don't scroll)
    const alertButtons = document.querySelectorAll('.consultation-button, .cta-button, .accent-button, .outline-button');
     alertButtons.forEach(button => {
        const href = button.getAttribute('href');
        // Only add alert if it's NOT an internal scroll link
        if (!href || !href.startsWith('#')) {
             button.addEventListener('click', function(e) {
                // Prevent default if it's a link without a scroll target
                if (href && href !== '#') {
                   // Allow default navigation for actual external links
                } else {
                   e.preventDefault();
                   if (this.classList.contains('outline-button')) {
                       alert('Mere information om coaching tilgangen vil vises her (modal/sektion).');
                   } else {
                       alert('Booking formular/modal åbner her.');
                   }
                }

             });
        }
     });
  }


  // ==========================================================
  // Initialize All Components
  // ==========================================================
  initializeHeader();
  initializeSmoothScroll();
  initializeScrollAnimations();
  initializeTestimonialSlider();
  initializeCoursesSection();
  initializeContactForm();
  initializeFooter();
  initializeStickyBookButton();
  initializePlaceholders();

}); // End DOMContentLoaded
// Coaching Page Scripts

document.addEventListener('DOMContentLoaded', function() {
  // Initialize animations for fade-in elements
  initFadeAnimations();
  
  // Initialize mobile menu functionality
  initMobileMenu();
  
  // Initialize sticky header on scroll
  initStickyHeader();
  
  // Initialize scroll animations
  initScrollAnimations();
});

// Initialize fade animations for elements with 'fade-in' class
function initFadeAnimations() {
  setTimeout(function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(function(element) {
      element.classList.add('active');
    });
  }, 100);
}

// Initialize mobile menu functionality
function initMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileDrawerOverlay = document.querySelector('.mobile-drawer-overlay');
  const drawerClose = document.querySelector('.drawer-close');
  
  if (mobileMenuToggle && mobileDrawer && mobileDrawerOverlay && drawerClose) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileDrawer.classList.add('active');
      mobileDrawerOverlay.classList.add('active');
      document.body.classList.add('drawer-open');
      this.classList.add('open');
    });
    
    function closeDrawer() {
      mobileDrawer.classList.remove('active');
      mobileDrawerOverlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
      mobileMenuToggle.classList.remove('open');
    }
    
    drawerClose.addEventListener('click', closeDrawer);
    mobileDrawerOverlay.addEventListener('click', closeDrawer);
    
    // Close drawer when menu items are clicked
    const drawerLinks = document.querySelectorAll('.drawer-link');
    drawerLinks.forEach(function(link) {
      link.addEventListener('click', closeDrawer);
    });
  }
}

// Initialize sticky header on scroll
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  const headerHeight = header.offsetHeight;
  let lastScrollPosition = 0;
  
  window.addEventListener('scroll', function() {
    const currentScrollPosition = window.pageYOffset;
    
    // Add sticky header when scrolling down past header height
    if (currentScrollPosition > headerHeight * 2) {
      if (currentScrollPosition > lastScrollPosition) {
        // Scrolling down - hide header
        header.classList.remove('sticky-header');
      } else {
        // Scrolling up - show sticky header
        header.classList.add('sticky-header');
      }
    } else {
      // At the top - normal header
      header.classList.remove('sticky-header');
    }
    
    lastScrollPosition = currentScrollPosition;
  });
}

// Initialize scroll animations
function initScrollAnimations() {
  // Check if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    const elementsToAnimate = document.querySelectorAll('.benefit-card, .section-title, .hero-title, .problem-title, .coach-title, .cta-title, .cta-box');
    
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add animation class when element comes into view
          entry.target.classList.add('active');
          // Stop observing after animation is triggered
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null, // viewport
      threshold: 0.1, // trigger when 10% of the element is visible
      rootMargin: '0px 0px -50px 0px' // trigger a bit before the element comes into view
    });
    
    elementsToAnimate.forEach(element => {
      // Start observing element
      animationObserver.observe(element);
    });
  }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    
    // Only apply smooth scroll for anchor links within the page
    if (targetId.length > 1) {
      e.preventDefault();
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    let isValid = true;
    const requiredFields = contactForm.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
    
    if (isValid) {
      // Form is valid, add loading state
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.innerHTML = 'Sender...';
      submitButton.disabled = true;
      
      // Simulate form submission (replace with actual form submission)
      setTimeout(function() {
        submitButton.innerHTML = 'Besked sendt!';
        submitButton.classList.add('success');
        
        // Reset form
        contactForm.reset();
        
        // Reset button after a delay
        setTimeout(function() {
          submitButton.innerHTML = originalButtonText;
          submitButton.disabled = false;
          submitButton.classList.remove('success');
        }, 3000);
      }, 1500);
    }
  });
}
document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('hero-video');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressContainer');
  const currentTimeDisplay = document.getElementById('currentTime');
  const durationDisplay = document.getElementById('duration');
  const muteBtn = document.getElementById('muteBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const volumeHighIcon = document.getElementById('volumeHighIcon');
  const volumeMuteIcon = document.getElementById('volumeMuteIcon');
  const volumeSlider = document.getElementById('volumeSlider');
  
  // Autoplay video when page loads
  video.play().catch(error => {
    console.log('Autoplay prevented: ', error);
    // Show play button if autoplay is prevented
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });
  
  // Toggle play/pause
  function togglePlayPause() {
    if (video.paused || video.ended) {
      video.play();
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      video.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }
  
  // Update progress bar
  function updateProgress() {
    if (video.duration) {
      const percentage = (video.currentTime / video.duration) * 100;
      progressBar.style.width = `${percentage}%`;
      
      // Update time displays
      currentTimeDisplay.textContent = formatTime(video.currentTime);
      durationDisplay.textContent = formatTime(video.duration);
    }
  }
  
  // Format time to MM:SS
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  // Handle progress bar clicks
  function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = video.duration;
    video.currentTime = (clickX / width) * duration;
  }
  
  // Toggle mute
  function toggleMute() {
    video.muted = !video.muted;
    
    if (video.muted) {
      volumeIcon.style.display = 'none';
      volumeHighIcon.style.display = 'none';
      volumeMuteIcon.style.display = 'block';
      volumeSlider.value = 0;
    } else {
      volumeMuteIcon.style.display = 'none';
      
      if (video.volume > 0.5) {
        volumeIcon.style.display = 'none';
        volumeHighIcon.style.display = 'block';
      } else {
        volumeIcon.style.display = 'block';
        volumeHighIcon.style.display = 'none';
      }
      
      volumeSlider.value = video.volume;
    }
  }
  
  // Update volume
  function updateVolume() {
    video.volume = volumeSlider.value;
    video.muted = video.volume === 0;
    
    if (video.volume === 0 || video.muted) {
      volumeIcon.style.display = 'none';
      volumeHighIcon.style.display = 'none';
      volumeMuteIcon.style.display = 'block';
    } else {
      volumeMuteIcon.style.display = 'none';
      
      if (video.volume > 0.5) {
        volumeIcon.style.display = 'none';
        volumeHighIcon.style.display = 'block';
      } else {
        volumeIcon.style.display = 'block';
        volumeHighIcon.style.display = 'none';
      }
    }
  }
  
  // Event listeners
  playPauseBtn.addEventListener('click', togglePlayPause);
  video.addEventListener('click', togglePlayPause);
  video.addEventListener('timeupdate', updateProgress);
  progressContainer.addEventListener('click', setProgress);
  muteBtn.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', updateVolume);
  
  // Show correct play/pause icon when video starts or ends
  video.addEventListener('play', () => {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  });
  
  video.addEventListener('pause', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });
  
  video.addEventListener('ended', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    progressBar.style.width = '0%';
    video.currentTime = 0;
  });
  
  // Set initial duration display once metadata is loaded
  video.addEventListener('loadedmetadata', () => {
    durationDisplay.textContent = formatTime(video.duration);
  });
});