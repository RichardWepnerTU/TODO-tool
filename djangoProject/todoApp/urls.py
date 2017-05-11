from django.conf.urls import url
from django.contrib import admin

from . import views

urlpatterns = [
    url(r'^todo/', views.index, name='index'),
    url(r'^admin/', admin.site.urls), 
    url(r'^list/$', views.requestMethod, name='list'),
    url(r'^list/(?P<id>\d+)/', views.requestMethod)
   
]
