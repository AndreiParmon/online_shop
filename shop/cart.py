from django.conf import settings
from .models import Product


class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get(settings.CART_SESSION_ID)
        if not cart:
            cart = self.session[settings.CART_SESSION_ID] = {}
        self.cart = cart

    def add(self, product, quantity=1, override_quantity=False):
        product_id = str(product.id)
        if product_id in self.cart:
            if override_quantity:
                self.cart[product_id]['quantity'] = quantity
            else:
                self.cart[product_id]['quantity'] += quantity
        else:
            self.cart[product_id] = {
                'quantity': quantity,
                'price': str(product.price),
                'name': product.name,
                'slug': product.slug,
                'image': product.image.url if product.image else ''
            }
        self.save()

    def save(self):
        self.session.modified = True

    def remove(self, product):
        product_id = str(product.id)
        if product_id in self.cart:
            del self.cart[product_id]
            self.save()

    def clear(self):
        if settings.CART_SESSION_ID in self.session:
            del self.session[settings.CART_SESSION_ID]
            self.save()

    def get_total_price(self):
        return sum(float(item['price']) * item['quantity'] for item in self.cart.values())

    def __len__(self):
        return sum(item['quantity'] for item in self.cart.values())

    def __iter__(self):
        product_ids = [pid for pid in self.cart.keys() if pid.isdigit()]
        products = Product.objects.filter(id__in=product_ids)
        product_dict = {str(product.id): product for product in products}

        items_to_remove = []

        for item_id, item_data in self.cart.items():
            if item_id in product_dict:
                product = product_dict[item_id]
                yield {
                    'product': product,
                    'quantity': item_data['quantity'],
                    'price': float(item_data['price']),
                    'total_price': float(item_data['price']) * item_data['quantity'],
                    'name': item_data.get('name', product.name),
                    'slug': item_data.get('slug', product.slug),
                    'image': item_data.get('image', product.image.url if product.image else '')
                }
            else:
                # Помечаем для удаления, если продукт не найден
                items_to_remove.append(item_id)

        # Удаляем несуществующие продукты
        for item_id in items_to_remove:
            del self.cart[item_id]
        if items_to_remove:
            self.save()

    def get_total_items(self):
        """Общее количество товаров в корзине"""
        return sum(item['quantity'] for item in self.cart.values())