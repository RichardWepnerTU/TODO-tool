from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

from .models import ToDoEntry


def index(request):
	return todoList(request)

def todoList(request):
    todoEntries = ToDoEntry.objects.order_by('dueDate')
    template = loader.get_template('todoList.html')
    context = {
        'todoEntries': todoEntries,
    }
    return HttpResponse(template.render(context, request))
    
def todoEntry(request, id):
    return HTTPResponse("" % id)