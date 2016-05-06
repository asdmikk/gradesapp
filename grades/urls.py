"""grades URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin

from gapp import views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/register$', views.api_register),
    url(r'^api/login$', views.api_login),
    url(r'^api/user/(?P<user_id>\d+)/$', views.api_user),
    url(r'^api/users$', views.api_users),
    url(r'^api/update$', views.api_update),
    url(r'^login$', views.login),
    url(r'^app$', views.app),
    url(r'^student$', views.student),
    url(r'^teacher$', views.teacher)
]
