// AJAX функции для работы с корзиной
class CartManager {
    constructor() {
        this.csrfToken = this.getCSRFToken();
        this.initEvents();
    }

    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    initEvents() {
        // Обработчики для инпутов количества
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                const productId = e.target.dataset.productId;
                const quantity = parseInt(e.target.value);
                if (quantity > 0 && quantity <= 99) {
                    this.setQuantity(productId, quantity);
                } else {
                    this.showMessage('Количество должно быть от 1 до 99', 'error');
                    this.updateCartView();
                }
            });
        });

        // Подтверждение очистки корзины
        document.querySelector('.btn-clear-cart')?.addEventListener('click', (e) => {
            if (!confirm('Вы уверены, что хотите очистить корзину?')) {
                e.preventDefault();
            }
        });
    }

    async updateQuantity(productId, change) {
        const quantityInput = document.getElementById(`quantity-${productId}`);
        const currentQuantity = parseInt(quantityInput?.value) || 1;
        let newQuantity = currentQuantity + change;

        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > 99) newQuantity = 99;

        await this.setQuantity(productId, newQuantity);
    }

    async setQuantity(productId, quantity) {
        if (quantity < 1 || quantity > 99) return;

        this.showLoading(productId, true);

        try {
            const formData = new FormData();
            formData.append('quantity', quantity);
            formData.append('override', 'true');
            formData.append('csrfmiddlewaretoken', this.csrfToken);

            const response = await fetch(`/cart/add/${productId}/`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                await this.updateCartView();
                this.showMessage('Количество обновлено', 'success');
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Ошибка при обновлении количества', 'error');
            await this.updateCartView();
        } finally {
            this.showLoading(productId, false);
        }
    }

    async removeItem(productId) {
        if (!confirm('Вы уверены, что хотите удалить товар из корзины?')) {
            return;
        }

        this.showLoading(productId, true);

        try {
            const formData = new FormData();
            formData.append('csrfmiddlewaretoken', this.csrfToken);

            const response = await fetch(`/cart/remove/${productId}/`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                await this.updateCartView();
                this.showMessage('Товар удален из корзины', 'success');
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Ошибка при удалении товара', 'error');
            await this.updateCartView();
        }
    }

    async clearCart() {
        if (!confirm('Вы уверены, что хотите очистить всю корзину?')) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('csrfmiddlewaretoken', this.csrfToken);

            const response = await fetch('/cart/clear/', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                await this.updateCartView();
                this.showMessage('Корзина очищена', 'success');
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Ошибка при очистке корзины', 'error');
        }
    }

    async updateCartView() {
        try {
            const response = await fetch('/cart/');
            const html = await response.text();

            // Парсим HTML и обновляем только содержимое корзины
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.getElementById('cart-content');

            if (newContent) {
                document.getElementById('cart-content').innerHTML = newContent.innerHTML;

                // Обновляем счетчик в хедере
                const cartCount = doc.querySelector('.cart-count');
                if (cartCount) {
                    document.querySelector('.cart-count').textContent = cartCount.textContent;
                }

                // Переинициализируем события
                this.initEvents();
            }
        } catch (error) {
            console.error('Error updating cart view:', error);
        }
    }

    showLoading(productId, show) {
        const loadingElement = document.getElementById(`loading-${productId}`);
        const quantityInput = document.querySelector(`[data-product-id="${productId}"] .quantity-input`);
        const buttons = document.querySelectorAll(`[data-product-id="${productId}"] .quantity-btn`);

        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }

        if (quantityInput) {
            quantityInput.disabled = show;
        }

        buttons.forEach(btn => {
            btn.disabled = show;
        });
    }

    showMessage(message, type = 'info') {
        // Создаем временное сообщение
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} alert-dismissible`;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Добавляем в начало контейнера
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        // Автоматически удаляем через 3 секунды
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 3000);
    }

    // Вспомогательные методы для анимаций
    animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const value = start + (range * easeOutQuart);

            element.textContent = Math.round(value);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.cartManager = new CartManager();
});

// Глобальные функции для вызова из HTML
function updateQuantity(productId, change) {
    window.cartManager?.updateQuantity(productId, change);
}

function setQuantity(productId, quantity) {
    window.cartManager?.setQuantity(productId, parseInt(quantity));
}

function removeItem(productId) {
    window.cartManager?.removeItem(productId);
}

function clearCart() {
    window.cartManager?.clearCart();
}