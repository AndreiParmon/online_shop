// Функции для работы с корзиной
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function updateCartIcon(totalQuantity) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalQuantity > 0 ? totalQuantity : '';

        // Анимация
        cartCount.classList.add('pulse');
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 500);
    }
}

function showMessage(message, type) {
    // Создаем элемент для сообщения
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type} fixed-top mt-5`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = 'z-index: 1050; margin: 20px auto; left: 50%; transform: translateX(-50%); max-width: 500px; background: ' + (type === 'success' ? '#007a66' : '#ff0017') + '; padding: 15px; border-radius: 5px; border: 1px solid ' + (type === 'success' ? '#007a66' : '#ff0017') + ';';

    document.body.appendChild(messageDiv);

    // Автоматически скрываем сообщение через 4 секунды
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.transition = 'opacity 0.5s ease';
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 500);
        }
    }, 4000);
}

// Функция для удаления системных сообщений Django
function removeMessage(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.style.transition = 'opacity 0.5s ease';
        messageElement.style.opacity = '0';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 500);
    }
}

// Функции для рекламного модального окна - ОДИН РАЗ за сессию!
function showAdModal() {
    console.log('🔄 Попытка показать рекламное окно...');
    console.log('📊 sessionStorage adShown:', sessionStorage.getItem('adShown'));

    // ВАЖНО: Проверяем sessionStorage - показываем только если еще не показывали
    const adShown = sessionStorage.getItem('adShown');
    if (adShown === 'true') {
        console.log('📝 Рекламное окно уже было показано в этой сессии');
        return;
    }

    const modal = document.getElementById('adModal');
    if (!modal) {
        console.error('❌ Элемент adModal не найден!');
        return;
    }

    console.log('✅ Элемент adModal найден');

    // Проверяем, может окно уже показано
    if (modal.style.display === 'flex') {
        console.log('ℹ️ Окно уже показано');
        return;
    }

    // Показываем с задержкой
    setTimeout(() => {
        const modalCheck = document.getElementById('adModal');
        if (modalCheck) {
            console.log('🔄 Показываем модальное окно через 1.5 сек...');

            // 1. Сначала показываем элемент
            modalCheck.style.display = 'flex';

            // 2. Через небольшой промежуток добавляем класс для анимации
            setTimeout(() => {
                modalCheck.classList.add('active');
                console.log('✅ Класс "active" добавлен');
            }, 50);

            // 3. Блокируем прокрутку
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            // 4. Запоминаем в sessionStorage, что показали
            sessionStorage.setItem('adShown', 'true');
            console.log('✅ sessionStorage установлен в "true"');

            // 5. Автоматическое закрытие через 30 секунд
            setTimeout(() => {
                if (modalCheck.style.display === 'flex') {
                    console.log('⏰ Автоматическое закрытие через 30 сек');
                    closeAdModal();
                }
            }, 30000);
        }
    }, 1500);
}

function closeAdModal() {
    console.log('🔄 Закрытие рекламного окна...');
    const modal = document.getElementById('adModal');
    if (modal) {
        // 1. Убираем класс анимации
        modal.classList.remove('active');

        // 2. Ждем окончания анимации и скрываем
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            console.log('✅ Модальное окно закрыто');

            // 3. Устанавливаем sessionStorage при закрытии
            // (на случай если пользователь закрыл до автоматического закрытия)
            sessionStorage.setItem('adShown', 'true');
        }, 300);
    } else {
        // На всякий случай устанавливаем sessionStorage
        sessionStorage.setItem('adShown', 'true');
    }
}

// Выпадающее меню для мобильной версии
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (!mobileMenuBtn || !dropdownMenu) return;

    function toggleDropdown() {
        dropdownMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (dropdownMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    function closeDropdown() {
        dropdownMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }

    // Открытие/закрытие меню
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown();
    });

    // Закрытие меню при клике на ссылку
    const dropdownLinks = dropdownMenu.querySelectorAll('.dropdown-link');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', closeDropdown);
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', function(event) {
        if (!mobileMenuBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            closeDropdown();
        }
    });

    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && dropdownMenu.classList.contains('active')) {
            closeDropdown();
        }
    });
}

// Основная инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ DOM загружен, начинаем инициализацию...');

    // 1. Инициализация рекламного окна
    console.log('1. Инициализация рекламного окна...');
    console.log('- adModal элемент:', document.getElementById('adModal'));
    console.log('- closeAdModal кнопка:', document.getElementById('closeAdModal'));
    console.log('- startShoppingBtn кнопка:', document.getElementById('startShoppingBtn'));

    // Показываем рекламное окно
    showAdModal();

    // Назначаем обработчики для модального окна
    const closeBtn = document.getElementById('closeAdModal');
    const startBtn = document.getElementById('startShoppingBtn');
    const modal = document.getElementById('adModal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAdModal);
    }

    if (startBtn) {
        startBtn.addEventListener('click', closeAdModal);
    }

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeAdModal();
            }
        });
    }

    // Закрытие по ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('adModal');
            if (modal && modal.style.display === 'flex') {
                closeAdModal();
            }
        }
    });

    // 2. Автоматическое скрытие системных сообщений Django
    console.log('2. Обработка системных сообщений...');
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        setTimeout(() => {
            removeMessage(message.id);
        }, 5000);
    });

    // 3. Инициализация мобильного меню
    console.log('3. Инициализация мобильного меню...');
    initMobileMenu();

    // 4. Обработчики форм добавления в корзину
    console.log('4. Настройка обработчиков корзины...');

    // Обработчик для всех форм добавления в корзину
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    addToCartForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Пропускаем форму на странице товара (она обрабатывается отдельно)
            if (this.id === 'add-to-cart-form') {
                console.log('Пропускаем форму товара, т.к. она обрабатывается в product_detail.js');
                return;
            }

            const url = this.action;
            const formData = new FormData(this);

            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        updateCartIcon(data.cart_total_quantity);
                        showMessage(data.message, 'success');
                    } else {
                        showMessage(data.error, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('Произошла ошибка при добавлении в корзину', 'error');
                });
        });
    });

    // Обработчик для формы с количеством на странице товара
    const purchaseForm = document.querySelector('.purchase-form');
    if (purchaseForm) {
        purchaseForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Пропускаем, если это форма товара с id 'add-to-cart-form'
            if (this.id === 'add-to-cart-form') {
                console.log('Пропускаем форму товара в purchaseForm обработчике');
                return;
            }

            const url = this.action;
            const formData = new FormData(this);

            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateCartIcon(data.cart_total_quantity);
                        showMessage(data.message, 'success');
                    } else {
                        showMessage(data.error, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('Произошла ошибка при добавлении в корзину', 'error');
                });
        });
    }

    console.log('✅ Вся инициализация завершена!');
});

// Глобальная обработка ошибок
window.addEventListener('error', function(e) {
    console.error('❌ Глобальная ошибка:', e.message);
    console.error('Файл:', e.filename);
    console.error('Строка:', e.lineno);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Необработанное обещание:', e.reason);
});