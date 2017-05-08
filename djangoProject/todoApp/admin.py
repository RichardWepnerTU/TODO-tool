from django.contrib import admin

# Register your models here.
from .models import ToDoEntry

admin.site.register(ToDoEntry)