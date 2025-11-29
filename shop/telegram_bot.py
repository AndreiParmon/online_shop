import pytz
from django.utils import timezone
import requests
from django.conf import settings


def send_telegram_message(order):
    """Отправка уведомления о заказе в Telegram"""
    from django.conf import settings
    minsk_tz = pytz.timezone('Europe/Minsk')
    formatted_time = timezone.now().astimezone(minsk_tz).strftime('%d.%m.%Y %H:%M')

    # Проверяем наличие настроек Telegram
    if not hasattr(settings, 'TELEGRAM_BOT_TOKEN') or not hasattr(settings, 'TELEGRAM_CHAT_ID'):
        print("Telegram настройки не найдены")
        return False

    bot_token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    message = f"""
🆕 НОВЫЙ ЗАКАЗ #{order.id}

👤 Клиент: {order.first_name}
📞 Телефон: {order.phone}
📧 Email: {order.email}
💬 Комментарий: {order.comments or 'Не указан'}

🛒 Состав заказа:
"""

    # Добавляем товары
    total_cost = 0
    for item in order.items.all():
        item_total = item.price * item.quantity
        total_cost += item_total
        message += f"\n• {item.product.name} - {item.quantity} шт. × {item.price} Br = {item_total} Br"

    message += f"\n\n💰 ИТОГО: {total_cost} Br"
    message += f"\n⏰ Время заказа: {formatted_time}"

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