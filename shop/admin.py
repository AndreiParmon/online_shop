from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, Order, OrderItem, ProductImage
from .models import ContactInfo, Feedback


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


# Inline для дополнительных изображений
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'order']
    ordering = ['order']
    verbose_name = 'Дополнительное изображение'
    verbose_name_plural = 'Дополнительные изображения'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'available', 'image_preview']
    list_filter = ['available', 'created', 'category']
    list_editable = ['price', 'available']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    inlines = [ProductImageInline]
    readonly_fields = ['image_preview']

    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'category', 'image', 'description', 'image_preview')
        }),
        ('Цена и наличие', {
            'fields': ('price', 'available'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
        return "Нет изображения"

    image_preview.short_description = 'Превью'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'email', 'created', 'updated']
    list_filter = ['created', 'updated']
    inlines = [OrderItemInline]
    fieldsets = (
        ('Информация о клиенте', {
            'fields': ('first_name', 'email', 'phone')
        }),
        ('Информация о заказе', {
            'fields': ('created', 'updated')
        }),
    )


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ['address', 'phone', 'email']

    def has_add_permission(self, request):
        # Разрешить только одну запись контактной информации
        if self.model.objects.count() >= 1:
            return False
        return super().has_add_permission(request)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'created_at', 'is_processed']
    list_filter = ['is_processed', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    readonly_fields = ['created_at']
    list_editable = ['is_processed']
