import json
import traceback

from django.shortcuts import render
from django.core import serializers
from django.http import HttpResponse, JsonResponse
from .models import User, Assignment, Grade
from django.views.decorators.csrf import csrf_exempt

# Create your views here.


def login(request):
    return render(request, 'gapp/login.html', {})


def app(request):
    return render(request, 'gapp/test.html', {})


def student(request):
    return render(request, 'gapp/student.html', {})


def teacher(request):
    return render(request, 'gapp/teacher.html', {})


def api_user(request, user_id):
    data = get_user_data(user_id)
    return JsonResponse(data)


def api_users(request):
    return JsonResponse({
        'success': True,
        'users': [get_user_data(x.id) for x in User.objects.all()]
    })


def get_user_data(user_id):
    try:
        user_object = User.objects.get(pk=user_id)
    except Exception as e:
        return {
            'success': False,
            'error': e.__class__.__name__,
            'content': str(e),
            'traceback': traceback.format_exc()
        }

    grades = {}

    if user_object.status == 0:
        status = 'student'

        try:
            grade_objects = Grade.objects.filter(user=user_object)
            print(grade_objects)
            for grade in grade_objects:
                grades[str(grade.assignment.id)] = grade.value
        except Grade.DoesNotExist:
            pass

    else:
        status = 'teacher'

    assignment_objects = Assignment.objects.all()

    return {
        'success': True,
        'user': {
            'id': user_object.id,
            'email': user_object.email,
            'firstName': user_object.first_name,
            'lastName': user_object.last_name,
            'status': status,
            'code': user_object.student_code,
            'grades': grades
        },
        'assignments': [{
            'id': str(x.id),
            'name': x.name
        } for x in assignment_objects]
    }

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
        # {id: 312123, email: 'm@m.mm', firstName: 'Mikk', lastName: 'K', pass: 's', status: 'student', code: 123123, grades: grades},

        grades = {}

        if existing_user.status == 0:
            status = 'student'

            try:
                grade_objects = Grade.objects.filter(user=existing_user)
                print(grade_objects)
                for grade in grade_objects:
                    grades[str(grade.assignment.id)] = grade.value
            except Grade.DoesNotExist:
                pass
        else:
            status = 'teacher'

        assignment_objects = Assignment.objects.all()

        data = {
            'success': True,
            'user': {
                'id': existing_user.id,
                'email': existing_user.email,
                'firstName': existing_user.first_name,
                'lastName': existing_user.last_name,
                'status': status,
                'code': existing_user.student_code,
                'grades': grades
            },
            'assignments': [{
                'id': str(x.id),
                'name': x.name
            } for x in assignment_objects]
        }

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

        data = get_user_data(new_user.id)

    else:
        pass

    return JsonResponse(data)


@csrf_exempt
def api_update(request):
    data = {}
    if request.method == 'POST':
        post_data = json.loads(request.body.decode('utf-8'))
        print(post_data)

        try:
            student_id = int(post_data['student'])
            assignment_id = int(post_data['assignment'])
            grade = post_data['grade']
        except KeyError as e:
            return get_error_response(e)

        try:
            user = User.objects.get(pk=student_id)
        except User.DoesNotExist as e:
            return get_error_response(e)

        try:
            assignment = Assignment.objects.get(pk=assignment_id)
        except Assignment.DoesNotExist as e:
            return get_error_response(e)

        if grade is not None:
            grade = int(grade)
        else:
            Grade.objects.get(user=user, assignment=assignment).delete()
            return JsonResponse(data)

        try:
            grade_object = Grade.objects.get(user=user, assignment=assignment)
            grade_object.value = grade
        except Grade.DoesNotExist:
            grade_object = Grade(
                assignment=assignment,
                user=user,
                value=grade
            )

        try:
            grade_object.save()
        except Exception as e:
            return get_error_response(e)

        data = {'success': True}

    else:
        pass;

    return JsonResponse(data)


def get_error_response(e):
    return JsonResponse({
                'success': False,
                'error': e.__class__.__name__,
                'content': str(e),
                'traceback': traceback.format_exc()
            })