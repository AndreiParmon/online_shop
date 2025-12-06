from django.db import models
from django.urls import reverse
from django.core.validators import MinValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/%Y/%m/%d', blank=True, null=True)
    available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        indexes = [
            models.Index(fields=['id', 'slug']),
        ]

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('shop:product_detail', args=[self.id, self.slug])


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        related_name='additional_images',
        on_delete=models.CASCADE,
        verbose_name='Товар'
    )
    image = models.ImageField(
        upload_to='products/additional/%Y/%m/%d',
        verbose_name='Изображение'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Порядок'
    )

    class Meta:
        verbose_name = 'Дополнительное изображение'
        verbose_name_plural = 'Дополнительные изображения'
        ordering = ['order']

    def __str__(self):
        return f"Изображение для {self.product.name}"


class Order(models.Model):
    readonly_fields = ['created','updated']  # Добавить все не редактируемые поля
    first_name = models.CharField(max_length=50, verbose_name='Имя')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Телефон')  # Обязательное поле
    comments = models.TextField(blank=True, verbose_name='Комментарий к заказу')  # Новое поле
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created',)
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    def __str__(self):
        return f'Заказ {self.id}'

    def get_total_cost(self):
        return sum(item.get_cost() for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = 'Информация о заказе'
        verbose_name_plural = 'Информация о заказе'

    def __str__(self):
        return str(self.id)

    def get_cost(self):
        return self.price * self.quantity

    @property
    def total_price(self):
        """Вычисляемая общая стоимость позиции"""
        if self.price is not None and self.quantity is not None:
            return self.price * self.quantity
        return 0

    @property
    def price_display(self):
        """Безопасное отображение цены"""
        if self.price is not None:
            return f"{self.price:.2f}"
        return "—"

    @property
    def total_price_display(self):
        """Безопасное отображение общей стоимости"""
        if self.price is not None and self.quantity is not None:
            return f"{self.price * self.quantity:.2f}"
        return "—"


class ContactInfo(models.Model):
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    working_hours = models.TextField()
    map_code = models.TextField(help_text="HTML код для карты")

    class Meta:
        verbose_name_plural = "Контактная информация"

    def __str__(self):
        return "Контактная информация"


class Feedback(models.Model):
    name = models.CharField(max_length=100, verbose_name="Имя")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=20, verbose_name="Телефон", blank=True)
    subject = models.CharField(max_length=200, verbose_name="Тема")
    message = models.TextField(verbose_name="Сообщение")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата отправки")
    is_processed = models.BooleanField(default=False, verbose_name="Обработано")

    class Meta:
        verbose_name = "Обратная связь"
        verbose_name_plural = "Обратная связь"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"
