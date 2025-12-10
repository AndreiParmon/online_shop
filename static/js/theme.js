// theme.js - Управление темной темой (обновленная версия)

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Инициализация темы...');

    // Устанавливаем transition для плавного перехода
    document.documentElement.style.transition = 'all 0.3s ease';
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

    // Получаем переключатели
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');

    // Получаем сохраненную тему или определяем по умолчанию
    let currentTheme = localStorage.getItem('klimiron_theme');

    // Если тема не сохранена, проверяем системные настройки
    if (!currentTheme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = 'dark';
        } else {
            currentTheme = 'light';
        }
        localStorage.setItem('klimiron_theme', currentTheme);
    }

    // Устанавливаем тему
    setTheme(currentTheme);

    // Добавляем обработчики
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }

    // Обновляем текст текущей темы в футере
    updateThemeLabel(currentTheme);

    console.log('✅ Тема инициализирована:', currentTheme);
});

function setTheme(theme) {
    // Устанавливаем data-атрибут на html
    document.documentElement.setAttribute('data-theme', theme);

    // Сохраняем в localStorage
    localStorage.setItem('klimiron_theme', theme);

    // Обновляем состояние переключателя
    updateToggleState(theme === 'dark');

    // Обновляем иконки
    updateIcons(theme);

    // Обновляем текст в футере
    updateThemeLabel(theme);

    // Добавляем класс для анимации
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Анимация переключения
    document.documentElement.style.opacity = '0.9';

    setTimeout(() => {
        setTheme(newTheme);
        document.documentElement.style.opacity = '1';
    }, 150);

    console.log('🔄 Переключена тема:', newTheme);
}

function updateToggleState(isDark) {
    const toggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('theme-toggle-mobile');

    if (toggle) {
        if (isDark) {
            toggle.setAttribute('aria-label', 'Включить светлую тему');
            toggle.setAttribute('title', 'Включить светлую тему');
        } else {
            toggle.setAttribute('aria-label', 'Включить темную тему');
            toggle.setAttribute('title', 'Включить темную тему');
        }
    }
}

function updateIcons(theme) {
    const mobileToggle = document.getElementById('theme-toggle-mobile');

    if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        const text = mobileToggle.querySelector('span');

        if (icon && text) {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                text.textContent = 'Светлая тема';
            } else {
                icon.className = 'fas fa-moon';
                text.textContent = 'Тёмная тема';
            }
        }
    }
}

function updateThemeLabel(theme) {
    const themeLabel = document.getElementById('current-theme-label');
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Тёмная' : 'Светлая';
    }
}

// Слушаем изменения системной темы
if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    colorSchemeQuery.addEventListener('change', function(e) {
        // Меняем тему только если пользователь не делал выбор вручную
        const savedTheme = localStorage.getItem('klimiron_theme');
        if (!savedTheme) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
            console.log('🌐 Системная тема изменена:', newTheme);
        }
    });
}

// Экспортируем для отладки
window.themeManager = {
    toggleTheme,
    setTheme,
    getTheme: () => document.documentElement.getAttribute('data-theme') || 'light'
};