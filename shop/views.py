from django.conf import settings
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.contrib import messages
from .models import Product, Category, Order, OrderItem
from .cart import Cart
from .forms import OrderForm
from .telegram_bot import send_telegram_message
from django.http import JsonResponse
from django.template.loader import render_to_string
from .models import ContactInfo, Feedback
from .forms import FeedbackForm
import pytz
from django.utils import timezone
from datetime import datetime
import traceback


def product_list(request, category_slug=None):
    category = None
    categories = Category.objects.all()
    products = Product.objects.filter(available=True)

    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=category)

    return render(request, 'product_list.html', {
        'category': category,
        'categories': categories,
        'products': products
    })


def product_detail(request, id, slug):
    product = get_object_or_404(Product, id=id, slug=slug, available=True)

    # Собираем все изображения товара
    all_images = []

    # Основное изображение
    if product.image:
        all_images.append({
            'url': product.image.url,
            'is_main': True
        })

    # Дополнительные изображения
    additional_images = product.additional_images.all().order_by('order')
    for img in additional_images:
        all_images.append({
            'url': img.image.url,
            'is_main': False
        })

    context = {
        'product': product,
        'images': all_images,
    }
    return render(request, 'product_detail.html', context)


def cart_detail(request):
    cart = Cart(request)
    return render(request, 'cart.html', {'cart': cart})


@require_POST
def cart_add(request, product_id):
    print(f"=== DEBUG CART_ADD START ===")
    print(f"Product ID: {product_id}")
    print(f"Session: {request.session.session_key}")

    try:
        # Проверяем существование товара
        try:
            product = Product.objects.get(id=product_id)
            print(f"Product found: {product.name}, Price: {product.price}")
        except Product.DoesNotExist as e:
            print(f"ERROR: Product {product_id} does not exist")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': 'Товар не найден'}, status=404)
            else:
                messages.error(request, 'Товар не найден')
                return redirect('shop:product_list')

        # Инициализируем корзину
        cart = Cart(request)
        print(f"Cart before: {cart.cart}")

        # Получаем параметры
        quantity = int(request.POST.get('quantity', 1))
        override = request.POST.get('override', 'false') == 'true'
        print(f"Quantity: {quantity}, Override: {override}")

        # Добавляем товар
        cart.add(product=product, quantity=quantity, override_quantity=override)
        print(f"Cart after: {cart.cart}")

        # Вычисляем общее количество
        total_quantity = cart.get_total_items()
        print(f"Total quantity: {total_quantity}")

        # Для AJAX запросов
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            response_data = {
                'success': True,
                'cart_total_quantity': total_quantity,
                'cart_items_count': len(cart.cart),  # Количество уникальных товаров
                'message': f'Товар "{product.name}" добавлен в корзину'
            }
            print(f"Sending JSON response: {response_data}")
            return JsonResponse(response_data)
        else:
            messages.success(request, f'Товар "{product.name}" добавлен в корзину')
            return redirect('shop:cart_detail')

    except Exception as e:
        print(f"CRITICAL ERROR in cart_add: {str(e)}")
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Full traceback:\n{error_traceback}")

        # Сохраняем ошибку в файл
        with open('debug_cart_errors.log', 'a', encoding='utf-8') as f:
            f.write(f"\n{'=' * 50}\n")
            f.write(f"Time: {timezone.now()}\n")
            f.write(f"Error: {str(e)}\n")
            f.write(f"Traceback:\n{error_traceback}\n")

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'error': 'Внутренняя ошибка сервера. Проверьте логи.'
            }, status=500)
        else:
            messages.error(request, 'Произошла внутренняя ошибка')
            return redirect('shop:product_list')

    print("=== DEBUG CART_ADD END ===")


@require_POST
def cart_remove(request, product_id):
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    product_name = product.name
    cart.remove(product)

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'cart_items_count': len(cart.cart),  # Количество уникальных товаров
            'cart_total_quantity': len(cart),  # Общее количество товаров
            'message': f'Товар "{product_name}" удален из корзины'
        })
    else:
        messages.success(request, f'Товар "{product_name}" удален из корзины')
        return redirect('shop:cart_detail')


@require_POST
def cart_clear(request):
    cart = Cart(request)
    cart.clear()
    messages.success(request, 'Корзина очищена')
    return redirect('shop:cart_detail')


def cart_detail(request):
    cart = Cart(request)

    # Отладочная информация в консоль
    print("=== ОТЛАДКА КОРЗИНЫ ===")
    print(f"Количество товаров: {len(cart)}")
    print(f"Содержимое корзины: {dict(cart.cart)}")
    print(f"ID сессии: {request.session.session_key}")
    print("=======================")

    context = {
        'cart': cart,
    }

    return render(request, 'cart_fixed.html', context)


def checkout(request):
    cart = Cart(request)

    # Проверяем, что корзина не пуста
    if not cart:
        messages.error(request, 'Ваша корзина пуста')
        return redirect('shop:cart_detail')

    if request.method == 'POST':
        form = OrderForm(request.POST)
        print(f"Форма валидна: {form.is_valid()}")  # Отладка
        print(f"Ошибки формы: {form.errors}")  # Отладка

        if form.is_valid():
            try:
                order = form.save(commit=False)
                order.paid = False  # Явно указываем, что заказ не оплачен
                order.save()

                # Создаем элементы заказа
                for item in cart:
                    OrderItem.objects.create(
                        order=order,
                        product=item['product'],
                        price=item['price'],
                        quantity=item['quantity']
                    )

                print(f"Заказ создан: {order.id}")  # Отладка

                # Отправка уведомления в Telegram
                telegram_sent = send_telegram_message(order)
                if not telegram_sent:
                    print("Ошибка отправки в Telegram")  # Отладка

                # Очищаем корзину
                cart.clear()

                # Перенаправляем на страницу успеха
                return render(request, 'order_success.html', {'order': order})

            except Exception as e:
                print(f"Ошибка при создании заказа: {e}")  # Отладка
                messages.error(request, f'Произошла ошибка при оформлении заказа: {e}')
        else:
            # Если форма невалидна, показываем ошибки
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = OrderForm()

    return render(request, 'checkout.html', {'cart': cart, 'form': form})


def contacts(request):
    # Получаем или создаем контактную информацию по умолчанию
    contact_info = ContactInfo.objects.first()
    if not contact_info:
        contact_info = ContactInfo.objects.create(
            address="г. Минск, ул. Примерная, 123",
            phone="+375 (29) 123-45-67",
            email="info@myshop.by",
            working_hours="Пн-Пт: 09:00 - 19:00\nСб-Вс: 10:00 - 17:00",
        )

    # Очищаем ВСЕ существующие сообщения при загрузке страницы
    storage = messages.get_messages(request)
    for message in storage:
        pass  # Помечаем все как прочитанные
    storage.used = True

    if request.method == 'POST':
        form = FeedbackForm(request.POST)
        if form.is_valid():
            try:
                feedback = form.save()

                # Очищаем сообщения ПЕРЕД добавлением нового
                storage = messages.get_messages(request)
                for message in storage:
                    pass
                storage.used = True

                # Пытаемся отправить в Telegram
                try:
                    telegram_sent = send_feedback_to_telegram(feedback)
                except Exception as e:
                    print(f"Ошибка Telegram: {e}")

                # Добавляем только ОДНО сообщение
                messages.success(request, 'Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.')

                # Сразу делаем редирект, чтобы избежать повторной отправки
                response = redirect('shop:contacts')

                # Добавляем заголовок, чтобы предотвратить кэширование формы
                response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                response['Pragma'] = 'no-cache'
                response['Expires'] = '0'

                return response

            except Exception as e:
                print(f"Ошибка при сохранении обратной связи: {e}")
                # Очищаем перед добавлением ошибки
                storage = messages.get_messages(request)
                for message in storage:
                    pass
                storage.used = True
                messages.error(request, 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз.')
        else:
            # Очищаем перед добавлением ошибок валидации
            storage = messages.get_messages(request)
            for message in storage:
                pass
            storage.used = True

            # Добавляем только одну общую ошибку вместо множества
            if form.errors:
                messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')
    else:
        form = FeedbackForm()

    context = {
        'contact_info': contact_info,
        'form': form,
    }

    response = render(request, 'contacts.html', context)
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response


def send_feedback_to_telegram(feedback):
    """Отправка обратной связи в Telegram"""
    from django.conf import settings
    minsk_tz = pytz.timezone('Europe/Minsk')
    formatted_time = timezone.now().astimezone(minsk_tz).strftime('%d.%m.%Y %H:%M')

    # Проверяем наличие настроек Telegram
    if not hasattr(settings, 'TELEGRAM_BOT_TOKEN') or not hasattr(settings, 'TELEGRAM_CHAT_ID'):
        print("Telegram настройки не найдены")
        return False

    bot_token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    # Проверяем, что настройки не пустые
    if not bot_token or not chat_id:
        print("Telegram токен или chat_id не установлены")
        return False

    message = f"""
📩 НОВОЕ СООБЩЕНИЕ ОБРАТНОЙ СВЯЗИ

👤 От: {feedback.name}
📧 Email: {feedback.email}
📞 Телефон: {feedback.phone or 'Не указан'}
📋 Тема: {feedback.subject}

💬 Сообщение:
{feedback.message}

⏰ Дата: {formatted_time}
"""

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'HTML'
    }

    try:
        import requests
        response = requests.post(url, data=data)
        return response.status_code == 200
    except Exception as e:
        print(f"Ошибка отправки в Telegram: {e}")
        return False
