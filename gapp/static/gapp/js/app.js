var app = angular.module('GradesApp', []);

app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
});

app.run(function ($rootScope) {
	//$rootScope.currenUser;
	$rootScope.assignments = ['1 KT', '2 KT', 'Lisapunktid', 'Eksam'];
	$rootScope.assignments2 = [{name:'1 KT', id:"dasd21"},{name:'2 KT', id:'jkl243'},{name:'Lisa', id:"lkasdjka2"},{name:'Eksam', id:'asdsad8'}];
	var grades = {
		'dasd21': 5,
		'jkl243': 2,
		'lkasdjka2': 3,
		'asdsad8': 7
	};
	var grades1 = {
		'dasd21': 1,
		'jkl243': 4,
		'lkasdjka2': 5

	};
	var grades2 = {
		'dasd21': 7,
		'jkl243': 0,
		'lkasdjka2': 9,
		'asdsad8': 1
	};
	var grades3 = {
		'dasd21': 11,
		'jkl243': 4,
		'lkasdjka2': 0,
		'asdsad8': 7
	};
	var grades4 = {
		'dasd21': 4,
		'jkl243': 4,
		'lkasdjka2': 5,
		'asdsad8': 5
	};

	$rootScope.users = [
		{id: 312123, email: 'm@m.mm', firstName: 'Mikk', lastName: 'K', pass: 's', status: 'student', code: 123123, grades: grades},
		{id: 312133, email: 'm@m1.mm', firstName: 'Paul', lastName: 'K', pass: 's', status: 'student', code: 123523, grades: grades1},
		{id: 412123, email: 'm@m2.mm', firstName: 'Jeesus', lastName: 'K', pass: 's', status: 'student', code: 123153, grades: grades2},
		{id: 312223, email: 'm@m3.mm', firstName: 'Roberta', lastName: 'K', pass: 's', status: 'student', code: 126123, grades: grades3},
		{id: 312124, email: 'm@m4.mm', firstName: 'Roberto', lastName: 'K', pass: 's', status: 'student', code: 123723, grades: grades4},
		{
			id: 123421, email: 't@t.tt', firstName: 'Teacher', lastName: 'T', pass: 't', status: 'teacher'
		}];

	$rootScope.assignments = ['1 KT', '2 KT', 'Lisapunktid', 'Eksam'];

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

	// HANDLES INITIAL ROOTING

	// if (window.localStorage['userId']) {
	// 	$rootScope.currenUser = _.find($rootScope.users, function (u) {return u.id == window.localStorage['userId']});
	// } else {
	// 	var page = window.location.href.split("/").pop();
	// 	if (page !== 'login.html') {
	// 		window.localStorage.removeItem('userId');
	// 		window.location.replace('./login.html');
	// 	}
	// }
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
		var url = 'http://127.0.0.1:8000/api/login';
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
		// var user = this.getValidUser(this.user);
		// if (user) {
		// 	$rootScope.currenUser = user;
		// 	$rootScope.$broadcast('userChanged');
		// 	this.error = false;
		// 	window.localStorage['userId'] = user.id;
		// 	if (user.status === 'student') {
		// 		window.location.replace('./student.html')
		// 	} else if (user.status === 'teacher') {
		// 		window.location.replace('./teacher.html')
		// 	}
		// } else {
		// 	this.error = true;
		// }
	};

	// this.getValidUser = function (user) {
	// 	var usr = undefined;
	// 	$rootScope.users.forEach(function (u) {
	// 		if (user.email === u.email && user.pass === u.pass) {
	// 			usr = u;
	// 		}
	// 	});
	// 	return usr;
	// }
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

	// using jQuery
	this.getCookie = function(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	};

	this.register = function () {
		var url = 'http://127.0.0.1:8000/api/register';
		// this.user.CSRF = this.getCookie('csrftoken');
		data = this.user;

		this.user.status = this.status;
		this.infoSet = this.user.email && this.user.firstName && this.user.lastName && this.user.pass
			&& (this.status === 'student' && this.user.code || this.status === 'teacher');

		if (this.status === 'teacher') {
			this.user.code = '';
		}

		var data = JSON.stringify(this.user);

		$http.post(url, data).then(function (response) {
			console.log('respinse', response);
			response = response.data;
			if (!response.success) {
				console.log('error,', response.error)
				$scope.error = response.error;

				console.log('scope error', $scope.error);
				return;
			} else {
				$scope.error = undefined;
				window.location.href = '/app'
			}
		});

		// $.post(url, data, function (response) {
			// console.log('respinse', response);
			// if (!response.success) {
			// 	console.log('error,', response.error)
			// 	console.log('this', this)
			// 	this.error = response.error;
			// 	return;
			// } else {
			// 	this.error = undefined;
			// }
		// });
		// if (!this.emailAvailable(this.user.email)) {
		// 	this.error = true;
		// 	return;
		// }
		// if (this.infoSet) {
		// 	this.user.id = Math.random();
		// 	$rootScope.users.push(this.user);
		// 	$rootScope.currenUser = this.user;
		// 	$rootScope.$broadcast('userChanged');
		// 	this.error = false;
		// 	window.localStorage['userId'] = this.user.id;
		// 	if (this.user.status === 'student') {
		// 		window.location.replace('./student.html')
		// 	} else if (this.user.status === 'teacher') {
		// 		window.location.replace('./teacher.html')
		// 	}
		// }
	};

	this.emailAvailable = function (email) {
		var avaialble = true;
		$rootScope.users.forEach(function (u) {
			if (email === u.email) {
				console.log(email + "===" + u.email);
				avaialble = false;
				return false;
			}
		});
		return avaialble;
	}
});

app.controller('TableCtrl', function ($scope, $rootScope, $interval, $http) {
	$scope.students = $rootScope.users.filter(function (u) { return u.status === 'student' });
	$scope.assignments = $rootScope.assignments;
	$scope.assignments = $rootScope.assignments2;
	this.selected = [];
	this.multiselect = false;
	this.tab = 'all';


    $scope.$watch(function () {
        return $rootScope.users
    }, function () {
        $scope.$applyAsync(function () {
            $scope.students = $rootScope.users.filter(function (u) { return u.status === 'student' });
            $scope.assignments = $rootScope.assignments2;
        });
    });

	this.hoverIn = function (event, assignment) {
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
		}
		console.log(event);
	};

	this.hoverOut = function () {

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
		if (this.newAssPopupVisible) {
			return;
		}
		this.currentStudent = student;
	};

	this.selectMultiple = function () {
		this.multiselect = !this.multiselect;
		this.selected = [];
	};

	this.select = function (student) {
		if (!this.multiselect) return;
		if (!_.contains(this.selected, student)) {
			this.selected.push(student);
		} else {
			this.selected = _.without(this.selected, student);
		}
	};

	this.studentSelected = function (student) {
		var b = _.contains(this.selected, student);
		return b;
	};

	this.updateStudent = function (student, ass, grade) {
		if (this.multiselect && this.studentSelected(student)) {
			this.selected.forEach(function (s) {
				s.grades[ass.id] = grade;
			});
		} else {
			student.grades[ass.id] = grade;
		}
	};

	this.showPopup = function (name) {
		if (name === 'new_ass') {
			this.newAssPopupVisible = true;
		} else if (name === 'edit') {
			this.editPopupVisible = true;
		}
	};

	this.create = function () {
		if (this.newAssName) {
			$rootScope.assignments2.push({
				id: "asdas" + Math.floor((Math.random()*100)),
				name: this.newAssName
			});
			this.newAssPopupVisible = false;
			this.newAssName = "";
		}
	};

	this.save = function () {

	};

	this.cancel = function () {
		this.newAssPopupVisible = false;
		this.editPopupVisible = false;
	};

	this.remove  = function (assignment) {
		$rootScope.assignments2 = _.without($rootScope.assignments2, assignment);
		$scope.assignments = $rootScope.assignments2;
		console.log(assignment);
		$rootScope.$broadcast('assChange');
	}
});

app.controller('GradesCtrl', function ($scope, $rootScope, $http, $interval) {
	$scope.assignments = $rootScope.assignments2;
    console.log('assss', $rootScope.assignments2)
    console.log('uress', $rootScope.currentUser)
	$scope.grades = $rootScope.currentUser.grades;

    $scope.$watch(function () {
        return $rootScope.currentUser
    }, function () {
        $scope.$applyAsync(function () {
            $scope.grades = $rootScope.currentUser.grades;
            $scope.assignments = $rootScope.assignments2;
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

	this.submit = function () {
		var file = $('#file-input')[0].files[0];
		var comments = this.comments;
		$('#file-input').val('');
		this.comments = undefined;
		if (file) {
			console.log(file);
			console.log(comments);
			// TODO: UPLOAD FILE
		}
		this.currentAssignment = undefined;
	};

	this.submitAssignment = function (index) {
		this.currentAssignment = $scope.assignments[index];
		console.log(this.currentAssignment)
	};

	this.cancel = function () {
		this.currentAssignment = undefined;
	}


});

app.controller('AssCtrl', function ($rootScope) {
	this.assignments = $rootScope.assignments2;

	this.create = function () {
		if (this.newAssName) {
			$rootScope.assignments2.push({
				id: "asdas" + Math.floor((Math.random()*100)),
				name: this.newAssName
			});
			this.newAssPopupVisible = false;
			this.newAssName = "";
		}
	};

	this.remove  = function (assignment) {
		$rootScope.assignments2 = _.without($rootScope.assignments2, assignment);
		this.assignments = $rootScope.assignments2;
		console.log(assignment);
		$rootScope.$broadcast('assChange');
	}
});