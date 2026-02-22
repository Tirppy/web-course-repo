const mascotElement = document.getElementById('mascot');

if (mascotElement) {
  const mascotDelayMs = 2800;

  setTimeout(() => {
    mascotElement.classList.remove('mascot-hidden');
  }, mascotDelayMs);
}