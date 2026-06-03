/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

document.addEventListener('DOMContentLoaded', () => {
  const books = {
    "1": {
      title: "The Whispering Shadows",
      author: "Elara Vance",
      genre: "Fantasy",
      description: "A gripping tale of an ancient forest that holds the echoes of forgotten magic. Elara Vance takes you on a perilous journey with a rogue mage seeking to uncover the truth behind the shadows that whisper in the dark.",
      coverImage: "assets/cover1.png"
    },
    "2": {
      title: "Midnight at the Oasis",
      author: "Sarah J. Reed",
      genre: "Mystery",
      description: "When a wealthy archaeologist goes missing in the Sahara, a cynical detective is called to the scene. Beneath the desert stars, secrets are buried deep. A classic whodunit with a modern, atmospheric twist.",
      coverImage: "assets/cover2.png"
    },
    "3": {
      title: "The Sunlit Path",
      author: "Aurora Chandler",
      genre: "Romance",
      description: "A heartwarming story about second chances. Evelyn returns to her childhood cottage, hoping to heal from a broken past. She finds that the path to love and belonging is paved with golden sunlight and unexpected friendships.",
      coverImage: "assets/cover3.png"
    },
    "4": {
      title: "Silent Echoes",
      author: "Kaelen Flynn",
      genre: "Sci-Fi",
      description: "In a city of perpetual neon, the silence is deafening. A rogue hacker discovers a hidden signal buried in the city's mainframe—a message from a forgotten past.",
      coverImage: "assets/cover4.png"
    },
    "5": {
      title: "The Clockwork Heart",
      author: "Jasper Thorne",
      genre: "Steampunk",
      description: "A thrilling adventure in an empire driven by steam and gears. A young mechanist must uncover the secret of a legendary artifact to save her father.",
      coverImage: "assets/cover5.png"
    },
    "6": {
      title: "Emerald Skies",
      author: "Talia Thorne",
      genre: "Adventure",
      description: "A sweeping epic across undiscovered archipelagos. Talia Thorne guides you through storms, forgotten ruins, and dangerous alliances.",
      coverImage: "assets/cover6.png"
    },
    "7": {
      title: "Beneath the Surface",
      author: "Julian Vance",
      genre: "Thriller",
      description: "A chilling psychological thriller. When a small town's lake recedes, it reveals a long-buried truth that threatens to tear the community apart.",
      coverImage: "assets/cover7.png"
    }
  };

  const scroller = document.getElementById('book-scroller');
  const bookItems = document.querySelectorAll('.book-item');
  const detailsPlaceholder = document.getElementById('details-placeholder');
  const bookDetails = document.getElementById('book-details');
  const detailsSection = document.getElementById('details-section');
  
  const detailsCoverDisplay = document.getElementById('details-cover-display');
  const detailsGenre = document.getElementById('details-genre');
  const detailsTitle = document.getElementById('details-title');
  const detailsAuthor = document.getElementById('details-author');
  const detailsDescription = document.getElementById('details-description');

  function showBookDetails(bookId) {
    const book = books[bookId];
    if (!book) return;

    const updateContent = () => {
      // Update content
      detailsGenre.textContent = book.genre;
      detailsTitle.textContent = book.title;
      detailsAuthor.textContent = book.author;
      detailsDescription.textContent = book.description;

      // Update cover image
      detailsCoverDisplay.src = book.coverImage;
      detailsCoverDisplay.alt = `${book.title} cover`;

      // Reveal the details
      detailsPlaceholder.classList.add('hidden');
      bookDetails.classList.remove('hidden');
      bookDetails.style.opacity = '1';
    };

    // TODO MWG: Modernize the page transitions when updating book details.
    updateContent();

    // Smoothly scroll to details
    detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  bookItems.forEach(item => {
    // Click event
    item.addEventListener('click', () => {
      const bookId = item.dataset.book;
      showBookDetails(bookId);
    });

    // Accessibility: Enter key
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const bookId = item.dataset.book;
        showBookDetails(bookId);
      }
    });
  });

  // Legacy navigation toggling
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && menuClose && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.add('show');
    });
    menuClose.addEventListener('click', () => {
      navMenu.classList.remove('show');
    });
  }

  // TODO MWG: Modernize the scroll effects on the book items.
  console.log('Applying JS IntersectionObserver scroll scaling effect.');
  
  const options = {
    root: scroller,
    rootMargin: '0px',
    threshold: [0, 0.5, 1]
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const ratio = entry.intersectionRatio;
      // Scale between 0.75 and 1.05 based on visibility
      const scale = 0.75 + (0.3 * ratio);
      const opacity = 0.4 + (0.6 * ratio);
      
      entry.target.style.transform = `scale(${scale})`;
      entry.target.style.opacity = opacity;
    });
  }, options);

  bookItems.forEach(item => observer.observe(item));
});
