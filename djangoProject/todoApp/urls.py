from django.conf.urls import url
from django.contrib import admin

from . import views

urlpatterns = [
    url(r'^todo/', views.index, name='index'),
    url(r'^admin/', admin.site.urls), 
    url(r'^list/', views.requestMethod, name='list'),
    #url(r'^list/(?P<id>[0-9]+)/$', views.requestMethod_2, name='something')
]
