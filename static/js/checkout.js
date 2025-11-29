document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('order-form');
    const phoneInput = document.querySelector('input[name="phone"]');

    // Улучшенная маска для телефона
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            // Автоматически добавляем +375 если номер начинается с 80
            if (value.startsWith('80') && value.length <= 11) {
                value = '375' + value.substring(2);
            }

            // Форматируем в красивый вид +375 (XX) XXX-XX-XX
            if (value.startsWith('375') && value.length >= 12) {
                let formatted = '+375 (' + value.substring(3, 5) + ') ';
                if (value.length > 5) formatted += value.substring(5, 8);
                if (value.length > 8) formatted += '-' + value.substring(8, 10);
                if (value.length > 10) formatted += '-' + value.substring(10, 12);
                e.target.value = formatted;
            } else if (value.startsWith('+375') && value.length >= 13) {
                let formatted = '+375 (' + value.substring(4, 6) + ') ';
                if (value.length > 6) formatted += value.substring(6, 9);
                if (value.length > 9) formatted += '-' + value.substring(9, 11);
                if (value.length > 11) formatted += '-' + value.substring(11, 13);
                e.target.value = formatted;
            }
        });

        // Валидация телефона на стороне клиента
        phoneInput.addEventListener('blur', function(e) {
            const value = e.target.value.replace(/\D/g, '');
            let isValid = false;

            if (value.startsWith('375') && value.length === 12) {
                isValid = true;
            } else if (value.startsWith('80') && value.length === 11) {
                isValid = true;
            }

            if (!isValid && value) {
                phoneInput.classList.add('error');
            } else {
                phoneInput.classList.remove('error');
            }
        });
    }

    // Валидация формы
    orderForm.addEventListener('submit', function(e) {
        let isValid = true;
        const requiredFields = orderForm.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');

                // Показываем сообщение об ошибке
                let errorDiv = field.parentNode.querySelector('.error-list');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-list';
                    field.parentNode.appendChild(errorDiv);
                }
                errorDiv.innerHTML = '<span class="error">Это поле обязательно для заполнения</span>';
            } else {
                field.classList.remove('error');
                const errorDiv = field.parentNode.querySelector('.error-list');
                if (errorDiv) {
                    errorDiv.remove();
                }
            }
        });

        // Дополнительная проверка телефона
        if (phoneInput && phoneInput.value) {
            const phoneValue = phoneInput.value.replace(/\D/g, '');
            let phoneValid = false;

            if ((phoneValue.startsWith('375') && phoneValue.length === 12) ||
                (phoneValue.startsWith('80') && phoneValue.length === 11)) {
                phoneValid = true;
            }

            if (!phoneValid) {
                isValid = false;
                phoneInput.classList.add('error');
                let errorDiv = phoneInput.parentNode.querySelector('.error-list');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-list';
                    phoneInput.parentNode.appendChild(errorDiv);
                }
                errorDiv.innerHTML = '<span class="error">Неверный формат номера телефона</span>';
            }
        }

        if (!isValid) {
            e.preventDefault();
            // Прокручиваем к первой ошибке
            const firstError = orderForm.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // Убираем ошибки при вводе
    orderForm.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', function() {
            this.classList.remove('error');
            const errorDiv = this.parentNode.querySelector('.error-list');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
    });
});