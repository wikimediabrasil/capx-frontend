if (typeof window !== 'undefined') {
  window.addEventListener('scroll', function () {
    const backToTopButton = document.getElementById('bbtbutton');
    const secondSection = document.getElementById('section02');
    const secondSectionTopPosition = secondSection.getBoundingClientRect();

    if (secondSectionTopPosition.y < 0) {
      backToTopButton.classList.remove('hidden');
    } else {
      backToTopButton.classList.add('hidden');
    }
  });
}
