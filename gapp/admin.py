from django.contrib import admin
from .models import Assignment, Grade, User
# Register your models here.

admin.site.register(Assignment)
admin.site.register(Grade)
admin.site.register(User)