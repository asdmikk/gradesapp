var app = angular.module('GradesApp', []);

app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
});

app.run(function ($rootScope) {
    if (window.localStorage['user']) {
		var usr = JSON.parse(window.localStorage['user']);
        var asss = JSON.parse(window.localStorage['assignments']);
        $rootScope.assignments2 = asss;
        console.log('cuser', usr);
        $rootScope.currentUser = usr;
	} else {
        var page = window.location.href.split("/").pop();
		if (page !== 'login') {
			window.localStorage.removeItem('user');
            window.location.href = '/login';
		}
	}

    if (window.localStorage['users']) {
        var usrs = JSON.parse(window.localStorage['users']);
        $rootScope.users = usrs;
    }

});

app.controller('AppCtrl', function ($scope, $rootScope) {
	this.currentUser = $rootScope.currenUser;
	$scope.$on('userChanged', function () {
		this.currentUser = $rootScope.currenUser;
		console.log('user', this.currentUser);
	});

	this.logout = function () {
		$rootScope.currentUser = undefined;
		this.currentUser = $rootScope.currentUser;
		window.localStorage.removeItem('user');
		window.localStorage.removeItem('users');
		window.localStorage.removeItem('assignments');
		window.location.href = ('/login');
	}
});

app.controller('IntroCtrl', function ($rootScope) {
	this.login = true;
	this.switch = function () {
		this.login = !this.login;
	};
});

function routeToApp(user) {
    if (user.status === 'student') {
        window.location.href = '/student';
    } else {
        window.location.href = '/teacher'
    }
}

app.controller('LoginCtrl', function ($scope, $rootScope, $http) {
	this.login = true;
	$scope.error = undefined;
	this.user = {};

	this.login = function () {
		var url = '/api/login';
		console.log(this.user);
		$http.post(url, this.user).then(function (response) {
			response = response.data;
			console.log('resoponse', response);
			if (response.success) {
				$scope.error = undefined;
                var user = response.user;
				window.localStorage['user'] = JSON.stringify(user);
                window.localStorage['assignments'] = JSON.stringify(response.assignments);

                if (response.user.status === 'teacher') {
                    var url = '/api/users';
                    $http.get(url).then(function (response) {
                        response = response.data;
                        var usrs = response.users.map(function (e) {
                           return e.user;
                        });
                        window.localStorage['users'] = JSON.stringify(usrs);
                        routeToApp(user);
                    });
                } else {
                    routeToApp(user);
                }
			} else {
				$scope.error = response.error;
			}
		});
	};

});

app.controller('RegisterCtrl', function ($rootScope, $scope, $http, $timeout) {
	this.status = 'student';
	$scope.error = undefined;
	this.infoSet = true;
	this.user = {};

	$('.mdl-radio.student').click(function  () {
		$(".student-code").show( "slow" );
	});
	$('.mdl-radio.teacher').click(function () {
		$(".student-code").slideUp();
	});

	this.register = function () {
		var url = '/api/register';
		data = this.user;

		this.user.status = this.status;
		this.infoSet = this.user.email && this.user.firstName && this.user.lastName && this.user.pass
			&& (this.status === 'student' && this.user.code || this.status === 'teacher');

        if (!this.infoSet) return;

		if (this.status === 'teacher') {
			this.user.code = '';
		}

		var data = JSON.stringify(this.user);

		$http.post(url, data).then(function (response) {
            response = response.data;
            if (response.success) {
				$scope.error = undefined;
                var user = response.user;
				window.localStorage['user'] = JSON.stringify(user);
                window.localStorage['assignments'] = JSON.stringify(response.assignments);

                if (response.user.status === 'teacher') {
                    var url = '/api/users';
                    $http.get(url).then(function (response) {
                        response = response.data;
                        var usrs = response.users.map(function (e) {
                           return e.user;
                        });
                        window.localStorage['users'] = JSON.stringify(usrs);
                        routeToApp(user);
                    });
                } else {
                    routeToApp(user);
                }
			} else {
				$scope.error = response.error;
			}
		});

	};
});

app.controller('TableCtrl', function ($scope, $rootScope, $interval, $timeout, $http) {
	$scope.students = $rootScope.users.filter(function (u) { return u.status === 'student' });
	$scope.assignments = $rootScope.assignments;
	$scope.assignments = $rootScope.assignments2;
	$scope.selected = [];
	$scope.multiselect = false;
	this.tab = 'all';


    $scope.$watch(function () {
        return $rootScope.users
    }, function () {
        $scope.$applyAsync(function () {
            $scope.students = $rootScope.users.filter(function (u) { return u.status === 'student' });
            $scope.assignments = $rootScope.assignments2;
        });
    });

	$scope.$watch(function () {
        return $rootScope.assignments2
    }, function () {
        $scope.$applyAsync(function () {
            $scope.assignments = $rootScope.assignments2;
        });
    });

	this.hoverIn = function (event, assignment) {
        $scope.hoverHand = assignment;
	};

	this.hoverOut = function () {
        $scope.hoverHand = undefined;
	};

	this.setTab = function (tab) {
		this.tab = tab;
	};

	this.checkEmpty = function (assignment) {
		if (assignment.name === "") {
			assignment.name = "Unnamed"
		}
	};

	this.edit = function (student) {
		console.log('student', student);
		if ($scope.newAssPopupVisible) {
			return;
		}
		this.currentStudent = student;
	};

	$scope.selectMultiple = function () {
		$scope.multiselect = !$scope.multiselect;
		$scope.selected = [];
	};

	this.select = function (student) {
		if (!$scope.multiselect) return;
		if (!_.contains($scope.selected, student)) {
			$scope.selected.push(student);
		} else {
			$scope.selected = _.without($scope.selected, student);
		}
	};

	$scope.studentSelected = function (student) {
		var b = _.contains($scope.selected, student);
		return b;
	};

    function saveUpdate(student, ass, grade) {
        var url = '/api/update';
        var data = {
            student: student.id,
            assignment: ass.id,
            grade: grade
        };
        $http.post(url, data);
    }

	$scope.updateStudent = function (student, ass, grade) {
        console.log('multiselect', $scope.multiselect);
        console.log('$scope.studentSelected(student)', $scope.studentSelected(student));
		if ($scope.multiselect && $scope.studentSelected(student)) {
            console.log('changeing multiple')
			$scope.selected.forEach(function (s) {
				s.grades[ass.id] = grade;
                saveUpdate(s, ass, grade)
			});
		} else {
            console.log('changeingsingle ')
			student.grades[ass.id] = grade;
            saveUpdate(student, ass, grade)
		}
        window.localStorage['users'] = JSON.stringify($rootScope.users)
	};

	this.showPopup = function (name) {
		if (name === 'new_ass') {
			$scope.newAssPopupVisible = true;
		} else if (name === 'edit') {
			this.editPopupVisible = true;
		}
	};

	this.create = function () {
		if (this.newAssName) {
			var url = '/api/assignment/new';
			var data = { name: this.newAssName };
			$http.post(url, data).then(function (response) {
				response = response.data;
				$rootScope.assignments2 = response.assignments;
				window.localStorage['assignments'] = JSON.stringify(response.assignments);
			});
			$scope.newAssPopupVisible = false;
			this.newAssName = "";
		}
	};

    var inputChangedPromise;
    $scope.updateAssignment = function (assignment) {
        if(inputChangedPromise){
            $timeout.cancel(inputChangedPromise);
        }
        inputChangedPromise = $timeout(function () {
            if (!assignment.name || assignment.name.trim() === '') return;
            var url = '/api/assignment/update';
            $http.post(url, assignment).then(function (response) {
				response = response.data;
				$rootScope.assignments2 = response.assignments;
				window.localStorage['assignments'] = JSON.stringify(response.assignments);
			});
            console.log(assignment);
        },1000);
    };

    $scope.deleteAssignment = function (assignent) {
        $scope.assignmentToDelete = assignent
    };

    $scope.confirmDeleteAssignment = function () {
        if (!$scope.assignmentToDelete || !$scope.assignmentToDelete.id) return;
            var url = '/api/assignment/delete';
            $http.post(url, $scope.assignmentToDelete).then(function (response) {
				response = response.data;
				$rootScope.assignments2 = response.assignments;
				window.localStorage['assignments'] = JSON.stringify(response.assignments);
			});
        $scope.assignmentToDelete = undefined;
    };

    $scope.calcSum = function (student) {
        var sum = 0;
        for (var key in student.grades) {
            sum += student.grades[key];
        }
        return sum;
    }

	this.save = function () {

	};

	$scope.cancel = function () {
		$scope.newAssPopupVisible = false;
		this.editPopupVisible = false;
        $scope.assignmentToDelete = undefined
	};

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            $scope.$apply(function () {
                $scope.cancel();
                if ($scope.multiselect) {
                    $scope.selectMultiple();
                }
            })
        }
    });

	this.remove  = function (assignment) {
		$rootScope.assignments2 = _.without($rootScope.assignments2, assignment);
		$scope.assignments = $rootScope.assignments2;
		console.log(assignment);
		$rootScope.$broadcast('assChange');
	}
});

app.controller('GradesCtrl', function ($scope, $rootScope, $http, $interval, $timeout) {
	$scope.assignments = $rootScope.assignments2;
	$scope.grades = $rootScope.currentUser.grades;
    $scope.submissions = $rootScope.currentUser.submissions;

	$scope.progress = 90;
	$scope.maxprogress = 100

	$scope.loadingAssignments = [];

    $scope.$watch(function () {
        return $rootScope.currentUser
    }, function () {
        $scope.$applyAsync(function () {
            $scope.grades = $rootScope.currentUser.grades;
            $scope.assignments = $rootScope.assignments2;
            $scope.submissions = $rootScope.currentUser.submissions;
        });
    });


    this.reloadInterval = $interval(function () {
        console.log('asd');
        var url = '/api/user/' + $rootScope.currentUser.id;
        $http.get(url).then(function (response) {
            response = response.data;
            console.log('reload resp', response);
            if (response.success) {
                window.localStorage['user'] = JSON.stringify(response.user);
                window.localStorage['assignments'] = JSON.stringify(response.assignments);
                $rootScope.currentUser = response.user;
                $rootScope.assignments2 = response.assignments;
            }
        });
    }, 3000);

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            $scope.$apply(function () {
                $scope.cancel();
            })
        }
    });

	$scope.submit = function () {
		var file = $('#file-input')[0].files[0];
		var comments = $scope.comments;
		$('#file-input').val('');
		$scope.comments = undefined;
		if (file) {
			console.log(file);
			console.log(comments);
			// TODO: UPLOAD FILE

            var url = '/api/upload';
            var data = {
                submitted: true,
                assignment: $scope.currentAssignment.id,
                user: $rootScope.currentUser.id,
                comment: comments
            };

			var loadingAssignment = $scope.currentAssignment

			$scope.loadingAssignments.push(loadingAssignment)

			$http.post(url, data).then(function (response) {
				response = response.data;
				console.log(response)
				window.localStorage['user'] = JSON.stringify(response.user);
				window.localStorage['assignments'] = JSON.stringify(response.assignments);
				$rootScope.currentUser = response.user;
				$rootScope.assignments2 = response.assignments;

			});
			$scope.loadingAssignments = $scope.loadingAssignments.filter(function (ass) {
				return ass.id != loadingAssignment.id;
			});



		}
		$scope.currentAssignment = undefined;
	};

	$scope.isUploading = function (assignment) {
		var a = $scope.loadingAssignments.filter(function (ass) {
			return ass.id === assignment.id;
		});
		return a.length > 0
	};
	
	$scope.submitAssignment = function (index) {
        if ($scope.submissions[$scope.assignments[index].id]) return;
		$scope.currentAssignment = $scope.assignments[index];
		console.log($scope.currentAssignment)
	};

	$scope.cancel = function () {
		$scope.currentAssignment = undefined;
	}


});