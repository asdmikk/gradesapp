import json
import traceback

from django.shortcuts import render
from django.core import serializers
from django.http import HttpResponse, JsonResponse
from .models import User
from django.views.decorators.csrf import csrf_exempt

# Create your views here.


def login(request):
    return render(request, 'gapp/login.html', {})


def app(request):
    return render(request, 'gapp/test.html', {})


@csrf_exempt
def api_login(request):
    data = {}
    if request.method == 'POST':
        post_data = json.loads(request.body.decode('utf-8'))
        print(post_data)

        try:
            email = post_data['email']
            password = post_data['pass']
        except KeyError as e:
            return JsonResponse({
                'success': False,
                'error': e.__class__.__name__,
                'content': str(e),
                'traceback': traceback.format_exc()
            })

        try:
            existing_user = User.objects.get(email=email, password=password)
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'No match found'
            })

        data = {'success': True}

    else:
        pass

    return JsonResponse(data)

@csrf_exempt
def api_register(request):
    data = {}
    if request.method == 'POST':
        post_data = json.loads(request.body.decode('utf-8'))
        print(post_data)

        try:
            email = post_data['email']
            password = post_data['pass']
            first_name = post_data['firstName']
            last_name = post_data['lastName']
            status = post_data['status']
            student_code = post_data['code']
        except KeyError as e:
            return JsonResponse({
                'success': False,
                'error': e.__class__.__name__,
                'content': str(e),
                'traceback': traceback.format_exc()
            })

        try:
            existing_user = User.objects.get(email=email)
        except User.DoesNotExist:
            existing_user = None

        if existing_user:
            return JsonResponse({
                'success': False,
                'error': 'User with that email exists'
            })

        try:
            if status == 'student':
                status_code = 0
            else:
                status_code = 1

            new_user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=password,
                status=status_code,
                student_code=student_code
            )
            new_user.save()
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': e.__class__.__name__,
                'content': str(e),
                'traceback': traceback.format_exc()
            })

        data = {'success': True}

    else:
        pass

    return JsonResponse(data)