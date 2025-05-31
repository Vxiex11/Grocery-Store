const preloader = document.querySelector('.preloader');
const loaderContainer = document.getElementById('loader');

if (loaderContainer && preloader) {
  const animation = lottie.loadAnimation({
    container: loaderContainer,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'data.json'
  });

  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
      if (link.target === '_blank' || link.href.startsWith('javascript:')) return;

      e.preventDefault();
      document.body.classList.add('loading');
      preloader.style.display = 'flex';

      setTimeout(() => {
        window.location.href = link.href;
      }, 1000);
    });
  });

  window.addEventListener('pageshow', () => {
    preloader.style.display = 'none';
    document.body.classList.remove('loading');
  });
} else {
  console.warn('No se encontró el contenedor .preloader o #loader');
}
