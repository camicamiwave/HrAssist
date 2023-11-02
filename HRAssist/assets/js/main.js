(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Hero carousel indicators
   */
  let heroCarouselIndicators = select("#hero-carousel-indicators")
  let heroCarouselItems = select('#heroCarousel .carousel-item', true)

  heroCarouselItems.forEach((item, index) => {
    (index === 0) ?
    heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "' class='active'></li>":
      heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "'></li>"
  });

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });

      }, true);
    }

  });

   /**
   * Prompt request form
   */

  document.addEventListener('DOMContentLoaded', function() {
    const requestLeaveButton = document.querySelector('.button1');
    const leaveRequestForm = document.querySelector('.leave-request');
    const requestLocatorButton = document.querySelector('.button2');
    const locatorRequestForm = document.querySelector('.locator-request');

    requestLeaveButton.addEventListener('click', function() {
      if (leaveRequestForm.style.display === 'none' || leaveRequestForm.style.display === '') {
        setTimeout(() => {
          leaveRequestForm.style.display = 'block';
        }, 300); // Adjust the delay time (in milliseconds) as needed
      } else {
        leaveRequestForm.style.display = 'none';
      }
      locatorRequestForm.style.display = 'none'; // Hides the locator form
    });

    requestLocatorButton.addEventListener('click', function() {
      if (locatorRequestForm.style.display === 'none' || locatorRequestForm.style.display === '') {
        setTimeout(() => {
          locatorRequestForm.style.display = 'block';
        }, 300); // Adjust the delay time (in milliseconds) as needed
      } else {
        locatorRequestForm.style.display = 'none';
      }
      leaveRequestForm.style.display = 'none'; // Hides the leave form
    });
  });

    /**
   * End Prompt request form
   */



    document.addEventListener("DOMContentLoaded", function () {
      let itemsAppended = false;
      let mobileNav = document.querySelector('.navbar ul');
      let profileDropdown = document.querySelector('.action .menu ul');
      let changePasswordItem = profileDropdown.children[0].cloneNode(true);
      let logoutItem = profileDropdown.children[1].cloneNode(true);
      let actionDiv = document.querySelector('.action');
  
      function removeIcons(item) {
        item.querySelectorAll('i').forEach(icon => icon.remove());
      }
  
      function appendToMobileNav() {
        if (!itemsAppended && mobileNav) {
          var mobileNavList1 = document.createElement("li");
          mobileNavList1.appendChild(changePasswordItem.cloneNode(true));
          mobileNavList1.classList.add('profile-item');
          removeIcons(mobileNavList1);
          mobileNav.appendChild(mobileNavList1);
  
          var mobileNavList2 = document.createElement("li");
          mobileNavList2.appendChild(logoutItem.cloneNode(true));
          mobileNavList2.classList.add('profile-item');
          removeIcons(mobileNavList2);
          mobileNav.appendChild(mobileNavList2);
  
          itemsAppended = true;
        }
      }
  
      function handleResize() {
        if (window.innerWidth <= 768) {
          appendToMobileNav();
          actionDiv.style.display = 'none';
        } else if (window.innerWidth > 768 && itemsAppended) {
          let profileItems = document.querySelectorAll('.profile-item');
          profileItems.forEach(function (item) {
            mobileNav.removeChild(item);
          });
          itemsAppended = false;
          actionDiv.style.display = 'flex';
        }
      }
  
      // Add event listener for window resize
      window.addEventListener('resize', handleResize);
  
      // Call the function initially
      if (window.innerWidth <= 768) {
        appendToMobileNav();
        actionDiv.style.display = 'none';
      }
    });





    


  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()