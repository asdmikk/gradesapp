from django.contrib import admin
from .models import Assignment, Grade, User, Submission
# Register your models here.

admin.site.register(Assignment)
admin.site.register(Grade)
admin.site.register(User)
admin.site.register(Submission)