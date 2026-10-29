const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    menuButton.focus();
  }
});

function normalizePhotoCategories(photo) {
  const values = photo.categories ?? (photo.category ? [photo.category] : []);
  if (!Array.isArray(values) || !values.length || values.some(value =>
    typeof value !== 'string' || !value.trim() || value.trim().toLowerCase() === 'all')) {
    throw new Error('Each photo needs at least one category in photos.json.');
  }
  return [...new Set(values.map(value => value.trim().toLowerCase()))];
}

function matchesPhotoCategory(categories, selected) {
  return selected === 'all' || categories.includes(selected);
}

function setupFilter(buttonSelector, itemSelector, dataKey, statusId, noun) {
  const buttons = [...document.querySelectorAll(buttonSelector)];
  const items = [...document.querySelectorAll(itemSelector)];
  buttons.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset[dataKey];
    buttons.forEach(other => {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });
    items.forEach(item => {
      item.hidden = dataKey === 'publicationFilter'
        ? selected !== 'all' && item.dataset.type !== selected
        : !matchesPhotoCategory(JSON.parse(item.dataset.categories), selected);
    });
    const count = items.filter(item => !item.hidden).length;
    document.getElementById(statusId).textContent = `Showing ${count} ${noun}.`;
  }));
}
setupFilter('[data-publication-filter]', '.publication', 'publicationFilter', 'publication-status', 'publications');

let photos = [];
const lightbox = document.getElementById('lightbox');
let currentPhoto = 0;
let activePhotos = [];
let openedBy = null;
function showPhoto(index) {
  currentPhoto = index;
  const photo = photos[index];
  document.getElementById('lightbox-image').src = photo.src;
  document.getElementById('lightbox-image').alt = photo.alt || photo.title;
  document.getElementById('lightbox-title').textContent = photo.title;
  document.getElementById('lightbox-description').textContent = photo.description || '';
  const credit = document.getElementById('lightbox-credit');
  credit.textContent = `Photo © ${photo.credit || 'Federico Scaramuzza'}`;
  if (photo.url && /^https?:\/\//.test(photo.url)) {
    credit.href = photo.url;
  } else {
    credit.removeAttribute('href');
  }
  document.getElementById('lightbox-count').textContent = `${String(activePhotos.indexOf(index)+1).padStart(2,'0')} / ${String(activePhotos.length).padStart(2,'0')}`;
}
function movePhoto(direction) {
  if (!activePhotos.length) return;
  const next = (activePhotos.indexOf(currentPhoto) + direction + activePhotos.length) % activePhotos.length;
  showPhoto(activePhotos[next]);
}
const gallery = document.getElementById('gallery');
gallery.addEventListener('click', event => {
  const button = event.target.closest('[data-photo]');
  if (!button) return;
  activePhotos = [...gallery.querySelectorAll('.gallery-item:not([hidden]) [data-photo]')].map(item => Number(item.dataset.photo));
  openedBy = button;
  showPhoto(Number(button.dataset.photo));
  lightbox.showModal();
  document.body.classList.add('modal-open');
  document.getElementById('lightbox-close').focus();
});

async function loadGallery() {
  const status = document.getElementById('gallery-status');
  status.textContent = 'Loading photographs…';
  gallery.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('photos.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('Photo list could not be loaded.');
    const entries = await response.json();
    if (!Array.isArray(entries) || entries.some(photo => !photo || typeof photo.src !== 'string' || !photo.src.startsWith('assets/') || typeof photo.title !== 'string' || !photo.title.trim())) {
      throw new Error('Check the entries in photos.json.');
    }
    photos = entries.map(photo => ({...photo, categories: normalizePhotoCategories(photo)}));
    const filters = document.getElementById('gallery-filters');
    gallery.replaceChildren();
    filters.replaceChildren();
    const categories = [...new Set(photos.flatMap(photo => photo.categories))];
    const label = value => value.replace(/[-_]/g,' ').replace(/\b\w/g, char => char.toUpperCase());
    for (const category of ['all', ...categories.filter(category => category !== 'all')]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.galleryFilter = category;
      button.setAttribute('aria-pressed', String(category === 'all'));
      button.classList.toggle('active', category === 'all');
      button.textContent = category === 'all' ? 'All images ' : label(category) + ' ';
      const count = document.createElement('span');
      count.textContent = category === 'all' ? photos.length : photos.filter(photo => photo.categories.includes(category)).length;
      button.append(count);
      filters.append(button);
    }
    photos.forEach((photo, index) => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-item';
      figure.dataset.categories = JSON.stringify(photo.categories);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'photo-button';
      button.dataset.photo = index;
      button.setAttribute('aria-label', `Open photograph: ${photo.title}`);
      const image = document.createElement('img');
      image.src = photo.src;
      image.alt = photo.alt || photo.title;
      image.loading = 'lazy';
      const zoom = document.createElement('span');
      zoom.className = 'zoom';
      zoom.setAttribute('aria-hidden','true');
      zoom.textContent = '↗';
      button.append(image, zoom);
      const caption = document.createElement('figcaption');
      const title = document.createElement('span');
      title.textContent = `${String(index + 1).padStart(2,'0')} / ${photo.title}`;
      const category = document.createElement('span');
      category.textContent = photo.categories.map(label).join(' · ');
      caption.append(title, category);
      figure.append(button, caption);
      gallery.append(figure);
    });
    setupFilter('[data-gallery-filter]', '.gallery-item', 'galleryFilter', 'gallery-status', 'photographs');
    status.textContent = `Showing ${photos.length} photographs.`;
    if (!photos.length) { status.classList.remove('sr-only'); status.textContent = 'Photographs coming soon.'; }
  } catch (error) {
    status.classList.remove('sr-only');
    status.textContent = 'The gallery could not load. Check photos.json and preview the site through a local web server.';
    console.error(error);
  } finally {
    gallery.setAttribute('aria-busy', 'false');
  }
}
loadGallery();
document.getElementById('lightbox-close').addEventListener('click', () => lightbox.close());
document.getElementById('lightbox-prev').addEventListener('click', () => movePhoto(-1));
document.getElementById('lightbox-next').addEventListener('click', () => movePhoto(1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1); }
});
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('close', () => { document.body.classList.remove('modal-open'); openedBy?.focus({preventScroll:true}); });
document.getElementById('year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach(link => {
        const active = link.hash === `#${entry.target.id}`;
        if (active) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin:'-15% 0px -60% 0px',threshold:0});
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
