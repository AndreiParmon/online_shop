// Управление темой сайта

// Проверка поддержки localStorage
const isLocalStorageAvailable = () => {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.warn('localStorage недоступен, тема будет сохранена только в текущей сессии');
        return false;
    }
};

// Ключи для хранения настроек темы
const THEME_KEY = 'klimiron_theme';
const THEME_TOGGLE_STATE = 'klimiron_theme_toggle';

// Доступные темы
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Получение текущей темы
function getCurrentTheme() {
    // 1. Проверяем сохраненную тему
    if (isLocalStorageAvailable()) {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme && (savedTheme === THEMES.DARK || savedTheme === THEMES.LIGHT)) {
            return savedTheme;
        }
    }

    // 2. Проверяем настройки системы
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        return THEMES.DARK;
    }

    // 3. По умолчанию светлая тема
    return THEMES.LIGHT;
}

// Установка темы
function setTheme(theme) {
    // Проверяем, что тема допустима
    if (!Object.values(THEMES).includes(theme)) {
        console.error(`Недопустимая тема: ${theme}`);
        return;
    }

    // Устанавливаем data-атрибут на html
    document.documentElement.setAttribute('data-theme', theme);

    // Сохраняем в localStorage
    if (isLocalStorageAvailable()) {
        try {
            localStorage.setItem(THEME_KEY, theme);
            localStorage.setItem(THEME_TOGGLE_STATE, theme === THEMES.DARK ? 'on' : 'off');
        } catch (e) {
            console.warn('Не удалось сохранить тему в localStorage:', e);
        }
    }

    // Обновляем мета-тег theme-color
    updateThemeColorMeta(theme);

    // Обновляем состояние переключателя
    updateThemeToggle(theme === THEMES.DARK);

    console.log(`Тема установлена: ${theme}`);
}

// Обновление мета-тега theme-color
function updateThemeColorMeta(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.content = theme === THEMES.DARK ? '#121212' : '#007a66';
}

// Обновление состояния переключателя
function updateThemeToggle(isDark) {
    const desktopToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('theme-toggle-mobile');

    if (desktopToggle) {
        if (isDark) {
            desktopToggle.setAttribute('aria-checked', 'true');
            desktopToggle.setAttribute('aria-label', 'Включить светлую тему');
        } else {
            desktopToggle.setAttribute('aria-checked', 'false');
            desktopToggle.setAttribute('aria-label', 'Включить тёмную тему');
        }
    }

    if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        const text = mobileToggle.querySelector('span');

        if (isDark) {
            if (icon) icon.className = 'fas fa-sun';
            if (text) text.textContent = 'Светлая тема';
        } else {
            if (icon) icon.className = 'fas fa-moon';
            if (text) text.textContent = 'Тёмная тема';
        }
    }
}

// Переключение темы
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(newTheme);

    // Анимация переключения (опционально)
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);
}

// Инициализация темы при загрузке страницы
function initTheme() {
    console.log('Инициализация темы...');

    // Получаем текущую тему
    const currentTheme = getCurrentTheme();

    // Устанавливаем тему
    setTheme(currentTheme);

    // Добавляем обработчики событий
    const desktopToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('theme-toggle-mobile');

    if (desktopToggle) {
        desktopToggle.addEventListener('click', toggleTheme);
        console.log('Десктопный переключатель темы инициализирован');
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme();
        });
        console.log('Мобильный переключатель темы инициализирован');
    }

    // Слушаем изменения системных настроек темы
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', (e) => {
        // Если пользователь не менял тему вручную, следуем системным настройкам
        if (isLocalStorageAvailable()) {
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (!savedTheme) {
                const systemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
                setTheme(systemTheme);
                console.log('Тема обновлена по системным настройкам:', systemTheme);
            }
        }
    });

    console.log('Тема инициализирована:', currentTheme);
}

// Экспорт функций для использования в консоли (для отладки)
window.ThemeManager = {
    getCurrentTheme,
    setTheme,
    toggleTheme,
    initTheme,
    THEMES
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initTheme);

// Аварийная инициализация, если DOM уже загружен
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initTheme, 100);
}