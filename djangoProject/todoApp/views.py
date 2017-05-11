from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.template import loader
from django.forms.models import modelform_factory
from django.core import serializers

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

def requestMethod(request, id=0):
	#print('wasjdddddkdfjdjfjsdfffffffffgjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj')
	if request.method == 'GET':
	    return todoGet(request)
	elif request.method == 'POST':
	    return todoPost(request)
	elif request.method == 'DELETE':
	    return todoDelete(request, id)
	elif request.method == 'PUT':
		return todoPut(request)

#returns all current object in db
def todoGet(request):
	data = []
	for elem in ToDoEntry.objects.all():
		data.append({'id':elem.id, 'name':elem.name, 'description':elem.description, 'dueDate':elem.dueDate, 'progress':elem.progress})
	return JsonResponse(data, safe=False)

#post new todo
def todoPost(request):
	post = QueryDict(request.body)
	#newDate = post.get('dueDate')
	newObj = ToDoEntry(name=post.get('name'), description=post.get('description'), dueDate='2017-09-25 16:00',progress=post.get('progress'))
	newObj.save()
	return HttpResponse(status=201)

#put modify existing todo
def todoPut(request):
	put = QueryDict(request.body)
	obj = ToDoEntry.objects.get(pk=put.get('id'))
	obj.name = put.get('name')
	obj.description = put.get('description')
	obj.progress = put.get('progress')
	obj.dueDate = put.get('dueDate')
	obj.save()
	return HttpResponse(status=200)

#delete
def todoDelete(request, id):
	# delete = QueryDict(request.body)
	#print('jsdjsjskjkkdkkdkkkdkkkkd', id)
	ToDoEntry.objects.get(pk=id).delete()
	return HttpResponse(status=200)
	#pass