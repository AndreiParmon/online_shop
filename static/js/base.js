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

// Автоматическое скрытие системных сообщений Django через 5 секунд
document.addEventListener('DOMContentLoaded', function () {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        setTimeout(() => {
            removeMessage(message.id);
        }, 5000); // 5 секунд
    });
});

// Обработчик для всех форм добавления в корзину
document.addEventListener('DOMContentLoaded', function () {
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');

    addToCartForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

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
});

// Обработчик для формы с количеством на странице товара
const purchaseForm = document.querySelector('.purchase-form');
if (purchaseForm) {
    purchaseForm.addEventListener('submit', function (e) {
        e.preventDefault();

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


// Функции для рекламного модального окна
function showAdModal() {
    // Проверяем, не показывали ли уже модалку в этой сессии
    if (!sessionStorage.getItem('adShown')) {
        setTimeout(() => {
            const modal = document.getElementById('adModal');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Блокируем прокрутку
        }, 1000); // Показываем через 1 секунду после загрузки
    }
}

function closeAdModal() {
    const modal = document.getElementById('adModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Разблокируем прокрутку
    sessionStorage.setItem('adShown', 'true'); // Запоминаем, что показали
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    // Показываем рекламное модальное окно
    showAdModal();

    // Назначаем обработчики для модального окна
    document.getElementById('closeAdModal').addEventListener('click', closeAdModal);
    document.getElementById('startShoppingBtn').addEventListener('click', closeAdModal);

    // Закрытие по клику на затемненную область
    document.getElementById('adModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeAdModal();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAdModal();
        }
    });
});

// Выпадающее меню для мобильной версии
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // Функция переключения меню
    function toggleDropdown() {
        dropdownMenu.classList.toggle('active');

        // Меняем иконку
        const icon = mobileMenuBtn.querySelector('i');
        if (dropdownMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    // Функция закрытия меню
    function closeDropdown() {
        dropdownMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }

    // Обработчики событий
    if (mobileMenuBtn && dropdownMenu) {
        // Открытие/закрытие меню по клику на кнопку
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
});
