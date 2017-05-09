from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
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

def requestMethod(request):
	if request.method == 'GET':
	    todoGet(request)
	elif request.method == 'PUT':
	    todoPut(request, id)
	elif request.method == 'DELETE':
	    todoDelete(request, id)

#get spectific entry    
#def todoEntry(request, id):
    #return HTTPResponse("" % id)

#returns all current object in db
def todoGet(request):
	data = []
	for elem in ToDoEntry.objects.all():
		data.append({'id':elem.id, 'name':elem.name, 'description':elem.description, 'dueDate':elem.dueDate, 'progress':elem.progress})
	return JsonResponse(data, safe=False)

#put
def todoPut(request):
	modelform = modelform_factory(ToDoEntry)
	form = modelform(request.PUT)
	if form.is_valid():
		form.save()
	return redirect('restview')

#post
def todoPost(request, id):
	pass
	#obj = ToDoEntry.objects.get(pk=id)


#delete
def todoDelete(request, id):
	pass
	#ToDoEntry.objects.get(id).delete()
	#return HTTPResponse()