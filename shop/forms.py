import re

from django import forms
from django.core.validators import EmailValidator
from .models import Order
from .models import Feedback


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['first_name', 'email', 'phone', 'comments']
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'required': True,
                'placeholder': 'Введите ваше имя'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'example@email.com'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'required': True,
                'placeholder': '+375 (29) 123-45-67',
                'pattern': '^\\+375 \\(\\d{2}\\) \\d{3}-\\d{2}-\\d{2}$'
            }),
            'comments': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Дополнительные пожелания к заказу...'
            }),
        }
        labels = {
            'first_name': 'Имя *',
            'email': 'Email',
            'phone': 'Телефон *',
            'comments': 'Комментарий к заказу',
        }

    def clean_phone(self):
        phone = self.cleaned_data['phone'].strip()

        if not phone:
            raise forms.ValidationError("Поле телефона обязательно для заполнения")

        # Очищаем номер от всех символов, кроме цифр и +
        cleaned_phone = re.sub(r'[^\d+]', '', phone)

        # Проверяем формат номера
        # Допустимые форматы:
        # +375291234567
        # +375 (29) 123-45-67
        # 375291234567
        # 80291234567

        # Проверяем белорусские номера
        belarus_patterns = [
            r'^\+375\d{9}$',  # +375291234567
            r'^375\d{9}$',  # 375291234567
            r'^80\d{9}$',  # 80291234567
        ]

        # Проверяем длину (мин 9 цифр для 80xx, мин 12 цифр для +375xx)
        digit_count = len(cleaned_phone.replace('+', ''))

        if cleaned_phone.startswith('+'):
            if not cleaned_phone.startswith('+375'):
                raise forms.ValidationError(
                    "Для международного формата используйте код Беларуси +375. "
                    "Пример: +375 (29) 123-45-67"
                )
            if digit_count != 12:
                raise forms.ValidationError(
                    "Неверная длина номера. В международном формате должно быть 12 цифр. "
                    "Пример: +375 (29) 123-45-67"
                )
        elif cleaned_phone.startswith('375'):
            if digit_count != 12:
                raise forms.ValidationError(
                    "Неверная длина номера. Должно быть 12 цифр. "
                    "Пример: 375291234567"
                )
        elif cleaned_phone.startswith('80'):
            if digit_count != 11:
                raise forms.ValidationError(
                    "Неверная длина номера. В формате 80xxx должно быть 11 цифр. "
                    "Пример: 80291234567"
                )
        else:
            raise forms.ValidationError(
                "Неверный формат номера. Используйте один из форматов: "
                "+375 (29) 123-45-67, 375291234567 или 80291234567"
            )

        # Проверяем код оператора (29, 33, 44, 25)
        if cleaned_phone.startswith(('+375', '375')):
            operator_code = cleaned_phone[4:6] if cleaned_phone.startswith('+375') else cleaned_phone[3:5]
        else:  # 80 format
            operator_code = cleaned_phone[2:4]

        valid_operators = ['29', '33', '44', '25', '17']
        if operator_code not in valid_operators:
            raise forms.ValidationError(
                f"Неверный код оператора '{operator_code}'. "
                f"Допустимые коды: {', '.join(valid_operators)}"
            )

        # Форматируем номер в единый формат для сохранения
        if cleaned_phone.startswith('+375'):
            formatted_phone = cleaned_phone
        elif cleaned_phone.startswith('375'):
            formatted_phone = '+' + cleaned_phone
        else:  # 80 format
            formatted_phone = '+375' + cleaned_phone[2:]

        return formatted_phone

    def clean_first_name(self):
        first_name = self.cleaned_data['first_name'].strip()
        if not first_name:
            raise forms.ValidationError("Поле имени обязательно для заполнения")

        # Проверяем, что имя содержит только буквы и пробелы
        if not re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-]+$', first_name):
            raise forms.ValidationError("Имя может содержать только буквы, пробелы и дефисы")

        if len(first_name) < 2:
            raise forms.ValidationError("Имя должно содержать минимум 2 символа")

        if len(first_name) > 50:
            raise forms.ValidationError("Имя не должно превышать 50 символов")

        return first_name

    def clean_email(self):
        email = self.cleaned_data['email']
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise forms.ValidationError("Введите корректный email адрес")
        return email


class FeedbackForm(forms.ModelForm):
    class Meta:
        model = Feedback
        fields = ['name', 'email', 'phone', 'subject', 'message']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Ваше имя',
                'required': True
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-input',
                'placeholder': 'example@email.com',
                'required': True
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': '+375 (29) 123-45-67'
            }),
            'subject': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Тема сообщения',
                'required': True
            }),
            'message': forms.Textarea(attrs={
                'class': 'form-input',
                'placeholder': 'Ваше сообщение...',
                'rows': 5,
                'required': True
            }),
        }

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if phone:
            # Простая валидация телефона (можно улучшить)
            if len(phone) < 5:
                raise forms.ValidationError("Номер телефона слишком короткий")
        return phone

    def clean_message(self):
        message = self.cleaned_data.get('message')
        if len(message.strip()) < 10:
            raise forms.ValidationError("Сообщение должно содержать не менее 10 символов")
        return message
