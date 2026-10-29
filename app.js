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

function setupFilter(buttonSelector, itemSelector, dataKey, statusId, noun) {
  const buttons = [...document.querySelectorAll(buttonSelector)];
  const items = [...document.querySelectorAll(itemSelector)];
  buttons.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset[dataKey];
    buttons.forEach(other => {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });
    items.forEach(item => { item.hidden = selected !== 'all' && item.dataset[dataKey === 'publicationFilter' ? 'type' : 'category'] !== selected; });
    const count = items.filter(item => !item.hidden).length;
    document.getElementById(statusId).textContent = `Showing ${count} ${noun}.`;
  }));
}
setupFilter('[data-publication-filter]', '.publication', 'publicationFilter', 'publication-status', 'publications');
setupFilter('[data-gallery-filter]', '.gallery-item', 'galleryFilter', 'gallery-status', 'photographs');

const photos = [
  {src:'assets/shoreline.jpg',title:'Shoreline',description:'The meeting of water, light, and sand.',alt:'Foamy waves tracing a pale sandy beach',credit:'Mathilde Langevin',url:'https://unsplash.com/photos/00Qb3lpbRxk'},
  {src:'assets/mountains.jpg',title:'Into the mist',description:'Mountains and forest, softened by passing cloud.',alt:'A mountain rising through low cloud above dark forest',credit:'Unsplash mountain collection',url:'https://unsplash.com/s/photos/foggy-mountain'},
  {src:'assets/sea.jpg',title:'Where the water meets',description:'A quiet meeting of sea and shoreline.',alt:'Turquoise ocean meeting a sunlit sandy beach',credit:'CJ',url:'https://unsplash.com/photos/NOFIzpYPF54'},
  {src:'assets/forest.jpg',title:'Quiet layers',description:'A forest gradually disappearing into the mist.',alt:'Layers of evergreen forest receding into pale mist',credit:'Basit Manzoor',url:'https://unsplash.com/photos/JjyYprvl4Xk'}
];
const lightbox = document.getElementById('lightbox');
let currentPhoto = 0;
let activePhotos = [];
let openedBy = null;
function showPhoto(index) {
  currentPhoto = index;
  const photo = photos[index];
  document.getElementById('lightbox-image').src = photo.src;
  document.getElementById('lightbox-image').alt = photo.alt;
  document.getElementById('lightbox-title').textContent = photo.title;
  document.getElementById('lightbox-description').textContent = photo.description;
  const credit = document.getElementById('lightbox-credit');
  credit.href = photo.url;
  credit.textContent = `Sample · ${photo.credit} ↗`;
  document.getElementById('lightbox-count').textContent = `${String(activePhotos.indexOf(index)+1).padStart(2,'0')} / ${String(activePhotos.length).padStart(2,'0')}`;
}
function movePhoto(direction) {
  const next = (activePhotos.indexOf(currentPhoto) + direction + activePhotos.length) % activePhotos.length;
  showPhoto(activePhotos[next]);
}
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  activePhotos = [...document.querySelectorAll('.gallery-item:not([hidden]) [data-photo]')].map(item => Number(item.dataset.photo));
  openedBy = button;
  showPhoto(Number(button.dataset.photo));
  lightbox.showModal();
  document.body.classList.add('modal-open');
  document.getElementById('lightbox-close').focus();
}));
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
