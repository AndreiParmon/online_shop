from .cart import Cart

def cart(request):
    return {
        'cart': Cart(request),
        'cart_total_quantity': Cart(request).get_total_items()
    }