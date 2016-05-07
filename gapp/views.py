import json
import traceback

from django.shortcuts import render
from django.core import serializers
from django.http import HttpResponse, JsonResponse
from .models import User, Assignment, Grade, Submission
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
    submissions = {}

    if user_object.status == 0:
        status = 'student'

        try:
            grade_objects = Grade.objects.filter(user=user_object)
            print(grade_objects)
            for grade in grade_objects:
                grades[str(grade.assignment.id)] = grade.value
        except Grade.DoesNotExist:
            pass

        try:
            submission_objects = Submission.objects.filter(user=user_object)
            print(submission_objects)
            for sub in submission_objects:
                submissions[str(sub.assignment.id)] = sub.submitted
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
            'grades': grades,
            'submissions': submissions
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
                'error': 'Wrong email or password'
            })

        data = get_user_data(existing_user.id)

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


@csrf_exempt
def api_assignment_new(request):
    data = {}
    if request.method == 'POST':
        post_data = json.loads(request.body.decode('utf-8'))
        print(post_data)

        try:
            name = post_data['name']
        except KeyError as e:
            return get_error_response(e)

        try:
            new_assignment = Assignment(name=name)
            new_assignment.save()
        except Exception as e:
            return get_error_response(e)

        assignments = Assignment.objects.all()

        data = {
            'assignments': [{
                'id': str(x.id),
                'name': x.name
            } for x in assignments]
        }

    else:
        pass
    return JsonResponse(data)


@csrf_exempt
def api_assignment_update(request):
    data = {}
    if request.method == 'POST':
        post_data = json.loads(request.body.decode('utf-8'))
        print(post_data)

        try:
            name = post_data['name']
            id = int(post_data['id'])
        except KeyError as e:
            return get_error_response(e)

        try:
            existing_assignment = Assignment.objects.get(pk=id)
            existing_assignment.name = name
            existing_assignment.save()
        except Exception as e:
            return get_error_response(e)

        assignments = Assignment.objects.all()

        data = {
            'assignments': [{
                'id': str(x.id),
                'name': x.name
            } for x in assignments]
        }

    else:
        pass
    return JsonResponse(data)


@csrf_exempt
def api_assignment_delete(request):
    data = {}
    if request.method == 'POST':
        post_data = json.loads(request.body.decode('utf-8'))
        print(post_data)

        try:
            id = int(post_data['id'])
        except KeyError as e:
            return get_error_response(e)

        try:
            existing_assignment = Assignment.objects.get(pk=id)
        except Exception as e:
            return get_error_response(e)

        try:
            Grade.objects.filter(assignment=existing_assignment).delete()
        except Exception as e:
            return get_error_response(e)

        try:
            Assignment(pk=id).delete()
        except Exception as e:
            return get_error_response(e)

        assignments = Assignment.objects.all()

        data = {
            'assignments': [{
                'id': str(x.id),
                'name': x.name
            } for x in assignments]
        }

    else:
        pass
    return JsonResponse(data)


@csrf_exempt
def api_upload(request):
    data = {}
    if request.method == 'POST':
        post_data = json.loads(request.body.decode('utf-8'))
        print(post_data)

        try:
            submitted = post_data['submitted']
            assignment_id = int(post_data['assignment'])
            user_id = int(post_data['user'])
        except KeyError as e:
            return get_error_response(e)

        try:
            comment = post_data['comment']
        except KeyError:
            comment = None

        try:
            existing_assignment = Assignment.objects.get(pk=assignment_id)
            existing_user = User.objects.get(pk=user_id)
        except Exception as e:
            return get_error_response(e)

        try:
            submission = Submission.objects.get(user=existing_user, assignment=existing_assignment)
        except Submission.DoesNotExist:
            submission = Submission(submitted=submitted, user=existing_user, assignment=existing_assignment)

        try:
            submission.save()
        except Exception as e:
            return get_error_response(e)

        data = get_user_data(existing_user.id)

    else:
        pass

    return JsonResponse(data)

def get_error_response(e):
    return JsonResponse({
                'success': False,
                'error': e.__class__.__name__,
                'content': str(e),
                'traceback': traceback.format_exc()
            })