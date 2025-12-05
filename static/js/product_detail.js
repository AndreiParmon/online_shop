function increaseQuantity() {
    const input = document.getElementById('quantity');
    if (parseInt(input.value) < 10) {
        input.value = parseInt(input.value) + 1;
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Элементы слайдера
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (!slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Функция переключения слайда
    function goToSlide(n) {
        currentSlide = (n + totalSlides) % totalSlides;

        // Перемещаем слайдер
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Обновляем активные точки
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        // Обновляем активные миниатюры
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.classList.toggle('active', index === currentSlide);
        });
    }

    // Кнопка "вперед"
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
    }

    // Кнопка "назад"
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
    }

    // Клик по точкам
    dots.forEach(dot => {
        dot.addEventListener('click', function () {
            const slideIndex = parseInt(this.getAttribute('data-slide'));
            goToSlide(slideIndex);
        });
    });

    // Клик по миниатюрам
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            const slideIndex = parseInt(this.getAttribute('data-slide'));
            goToSlide(slideIndex);
        });
    });

    // Управление количеством товара
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');
    const quantityInput = document.getElementById('quantity');

    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function () {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        plusBtn.addEventListener('click', function () {
            let value = parseInt(quantityInput.value);
            if (value < 99) {
                quantityInput.value = value + 1;
            }
        });

        quantityInput.addEventListener('change', function () {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = 1;
            } else if (value > 99) {
                this.value = 99;
            }
        });
    }

    // Добавление товара в корзину
    const addToCartForm = document.getElementById('add-to-cart-form');
    if (addToCartForm) {
        addToCartForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const productId = this.getAttribute('action').split('/').filter(Boolean).pop();

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Обновляем счетчик корзины
                        const cartCount = document.querySelector('.cart-count');
                        if (cartCount) {
                            cartCount.textContent = data.cart_total_quantity;
                            cartCount.classList.add('pulse');
                            setTimeout(() => {
                                cartCount.classList.remove('pulse');
                            }, 500);
                        }

                        // Показываем сообщение
                        showMessage('success', data.message);
                    } else {
                        showMessage('error', data.error || 'Ошибка добавления товара');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('error', 'Произошла ошибка');
                });
        });
    }

    function showMessage(type, text) {
        // Удаляем предыдущие сообщения
        const existingMessages = document.querySelectorAll('.custom-message');
        existingMessages.forEach(msg => msg.remove());

        // Создаем новое сообщение
        const message = document.createElement('div');
        message.className = `custom-message message ${type}`;
        message.innerHTML = `
            <span>${text}</span>
            <button class="message-close"><i class="fas fa-times"></i></button>
        `;

        // Добавляем на страницу
        document.body.appendChild(message);

        // Показываем с анимацией
        setTimeout(() => {
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        }, 10);

        // Автоматическое скрытие через 5 секунд
        const autoHide = setTimeout(() => {
            hideMessage(message);
        }, 5000);

        // Закрытие по клику
        const closeBtn = message.querySelector('.message-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoHide);
            hideMessage(message);
        });
    }

    function hideMessage(message) {
        message.style.opacity = '0';
        message.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            message.remove();
        }, 300);
    }
});





document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, инициализируем слайдер и lightbox...');

    // ========== ПЕРЕМЕННЫЕ ==========
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    const slides = document.querySelectorAll('.slide');
    const mainImages = document.querySelectorAll('.main-image');
    const dots = document.querySelectorAll('.dot');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentLightboxIndex = 0;
    let totalImages = slides.length;
    let currentSlideIndex = 0;
    let isAnimating = false;

    console.log('Найдено слайдов:', totalImages);
    console.log('Найдено больших изображений:', mainImages.length);

    // ========== ФУНКЦИИ LIGHTBOX ==========
    function openLightbox(imageIndex) {
        console.log('Открываем lightbox для изображения с индексом:', imageIndex);

        if (totalImages === 0) {
            console.error('Нет изображений для отображения');
            return;
        }

        currentLightboxIndex = imageIndex;

        // Получаем URL изображения
        const targetSlide = slides[imageIndex];
        const imgElement = targetSlide.querySelector('.main-image');
        const imageUrl = imgElement.getAttribute('data-full') || imgElement.src;

        console.log('URL изображения:', imageUrl);

        // Устанавливаем изображение
        lightboxImage.src = imageUrl;
        lightboxImage.alt = imgElement.alt;

        // Обновляем счетчик
        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${totalImages}`;

        // Показываем lightbox
        lightboxOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Обновляем состояние кнопок навигации
        updateNavButtons();
    }

    function closeLightbox() {
        console.log('Закрываем lightbox');
        lightboxOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateNavButtons() {
        // Включаем/выключаем кнопки навигации
        if (totalImages <= 1) {
            lightboxPrev.disabled = true;
            lightboxNext.disabled = true;
            lightboxPrev.style.opacity = '0.3';
            lightboxNext.style.opacity = '0.3';
        } else {
            lightboxPrev.disabled = false;
            lightboxNext.disabled = false;
            lightboxPrev.style.opacity = '0.8';
            lightboxNext.style.opacity = '0.8';
        }
    }

    function navigateLightbox(direction) {
        if (totalImages <= 1 || isAnimating) return;

        isAnimating = true;

        // Определяем следующий индекс
        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentLightboxIndex + 1) % totalImages;
        } else {
            nextIndex = (currentLightboxIndex - 1 + totalImages) % totalImages;
        }

        // Получаем следующее изображение
        const targetSlide = slides[nextIndex];
        const imgElement = targetSlide.querySelector('.main-image');
        const nextImageUrl = imgElement.getAttribute('data-full') || imgElement.src;

        // Сначала скрываем текущее изображение
        lightboxImage.style.opacity = '0';

        setTimeout(() => {
            // Меняем изображение
            lightboxImage.src = nextImageUrl;
            lightboxImage.alt = imgElement.alt;
            currentLightboxIndex = nextIndex;
            lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${totalImages}`;

            // Показываем новое изображение с анимацией
            lightboxImage.style.opacity = '1';

            // Завершаем анимацию
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        }, 300);
    }

    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ ОТКРЫТИЯ LIGHTBOX ==========
    // Клик по слайду (большому изображению)
    slides.forEach((slide, index) => {
        slide.addEventListener('click', function(e) {
            console.log('Клик по слайду с индексом:', index);
            e.stopPropagation();
            openLightbox(index);
        });
    });

    // Клик по изображению внутри слайда (на всякий случай)
    mainImages.forEach((img, index) => {
        img.addEventListener('click', function(e) {
            console.log('Клик по изображению с индексом:', index);
            e.stopPropagation();
            openLightbox(index);
        });
    });

    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ LIGHTBOX ==========
    // Закрытие по крестику
    lightboxClose.addEventListener('click', closeLightbox);

    // Закрытие по клику на фон
    lightboxOverlay.addEventListener('click', function(e) {
        if (e.target === lightboxOverlay) {
            closeLightbox();
        }
    });

    // Закрытие по клику на изображение в lightbox
    lightboxImage.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
    });

    // Навигация
    lightboxNext.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateLightbox('next');
    });

    lightboxPrev.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateLightbox('prev');
    });

    // ========== УПРАВЛЕНИЕ С КЛАВИАТУРЫ ==========
    document.addEventListener('keydown', function(e) {
        if (!lightboxOverlay.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                navigateLightbox('next');
                break;
            case 'ArrowLeft':
                navigateLightbox('prev');
                break;
        }
    });

    // ========== СВАЙП ДЛЯ МОБИЛЬНЫХ ==========
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxOverlay.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightboxOverlay.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Свайп влево - следующий слайд
                navigateLightbox('next');
            } else {
                // Свайп вправо - предыдущий слайд
                navigateLightbox('prev');
            }
        }
    });

    // ========== ФУНКЦИОНАЛЬНОСТЬ ОСНОВНОГО СЛАЙДЕРА ==========
    if (slides.length > 0) {
        function goToSlide(n) {
            currentSlideIndex = (n + slides.length) % slides.length;

            // Перемещаем слайдер
            const slider = document.querySelector('.slider');
            slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

            // Обновляем активные точки
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlideIndex);
            });

            // Обновляем активные миниатюры
            thumbnails.forEach((thumbnail, index) => {
                thumbnail.classList.toggle('active', index === currentSlideIndex);
            });

            // Обновляем текущий индекс для lightbox
            currentLightboxIndex = currentSlideIndex;
        }

        // Навигация слайдера
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentSlideIndex + 1);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentSlideIndex - 1);
            });
        }

        // Точки навигации
        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                const slideIndex = parseInt(this.getAttribute('data-slide'));
                goToSlide(slideIndex);
            });
        });

        // Клик по миниатюрам
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function(e) {
                const slideIndex = parseInt(this.getAttribute('data-slide'));
                goToSlide(slideIndex);
            });
        });
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    updateNavButtons();
    console.log('Lightbox успешно инициализирован');
});