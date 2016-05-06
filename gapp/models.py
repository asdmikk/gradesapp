from django.db import models
import uuid


class Assignment(models.Model):
    name = models.CharField(max_length=128)

    def __str__(self):
        return self.name


class Grade(models.Model):
    value = models.PositiveSmallIntegerField()
    assignment = models.ForeignKey('Assignment', on_delete=models.CASCADE)
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return str(self.value)


class User(models.Model):
    email = models.EmailField(max_length=255)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128)
    student_code = models.CharField(max_length=64, null=True, blank=True)
    status = models.SmallIntegerField()

    def __str__(self):
        return self.email