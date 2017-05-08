from django.db import models


class ToDoEntry(models.Model):
    name = models.CharField(max_length=48)
    description = models.CharField(max_length=1024)
    dueDate = models.DateTimeField()
    progress = models.IntegerField()
    
    def __str__(self):
        return self.name