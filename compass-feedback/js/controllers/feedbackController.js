var feedbackApp = angular.module("feedbackApp", ["ngResource", "firebase", "ngclipboard", "ui.bootstrap"]);

feedbackApp.constant("FirebaseUrl", "https://netpulse-feedback.firebaseio.com");

feedbackApp.constant("ChainName", "Three Rivers");

feedbackApp.constant("ClubId" , "27b30fad-c756-4d96-afe0-6d3cb0ebc425");

feedbackApp.constant("OverViewKey", "0000");

feedbackApp.service("rootRef", ["FirebaseUrl", Firebase]);

feedbackApp.service("club", ["rootRef", "$firebaseArray", "$firebaseObject", "ChainName", "ClubId", "OverViewKey", function club(rootRef, $firebaseArray, $firebaseObject, ChainName, ClubId, OverViewKey){
	var clubId = rootRef.child(ChainName).child(ClubId);
	var overView = clubId.child(OverViewKey);
	this.getOverView = function() {
		return $firebaseObject(overView);
	};
	this.getAllData = function(index){
		return $firebaseArray(clubId.limitToLast(index));
	};
}]);

feedbackApp.service("fbhelper", ["$filter", function fbhelper($filter){

	this.getPhoneText = function(feedbackPhone, defaultPhoneText){
		var phoneText = defaultPhoneText;
		if(feedbackPhone && feedbackPhone != ""){
			phoneText = $filter('tel')(feedbackPhone);
		}
		return phoneText;
	};

	this.getEmailText = function(feedbackEmail, defaultEmailText){
		var emailText = defaultEmailText;
		if(feedbackEmail && feedbackEmail != ""){
			emailText = feedbackEmail;
		}
		return emailText;
	};

	this.getReasons = function(reason1,reason2,reason3,reason4,reason5,reason6){

		var reasons = reason1;
		reasons = addReasons(reasons,reason2);
		reasons = addReasons(reasons,reason3);
		reasons = addReasons(reasons,reason4);
		reasons = addReasons(reasons,reason5);
		reasons = addReasons(reasons,reason6);
		return reasons;
		
	};

	function addReasons(reasons,newReason){
		var joiningString = "";

		if(reasons != ""){
			joiningString = ",";
		}

		if(newReason != ""){
			return reasons + joiningString + newReason;
		}else{
			return reasons;
		}
	}

	this.isThereNoComment = function(length){
		if (length > 0) {
			return false;
		}else{
			return true;
		}
	};

	this.getVisitedDateObject = function(str){
		//"04/27/2016 15:32:53 PDT"
		//new Date(year, month, day, hours, minutes, seconds, milliseconds)
		//fullDate or EEEE, MMMM d
		var date = str.split(" ")[0].split("/");

		return new Date(date[2], date[0] - 1, date[1]);
	};

	this.getDateObject = function(str){
		var dateArray = str.split("-");
		return new Date(dateArray[0],dateArray[1]-1,dateArray[2]);
	};
}]);

feedbackApp.filter('tel', function(){
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
    };
});

feedbackApp.controller("feedbackController", ["$scope", "club", "fbhelper", "OverViewKey", function($scope, club, fbhelper, OverViewKey){
	$scope.OverViewKey = OverViewKey;
	$scope.daysTobeViewed = 1;

	$scope.overView = club.getOverView();

	$scope.allData = club.getAllData($scope.daysTobeViewed);

	$scope.getMoreData = function(){
		$scope.daysTobeViewed++;
		$scope.allData = club.getAllData($scope.daysTobeViewed);
	};

	$scope.callText = "Call";
	$scope.emailText = "Email";

	$scope.getPhoneText = fbhelper.getPhoneText;
	$scope.getEmailText = fbhelper.getEmailText;
	$scope.getReasons = fbhelper.getReasons;
	$scope.isThereNoComment = fbhelper.isThereNoComment;
	$scope.getVisitedDateObject = fbhelper.getVisitedDateObject;
	$scope.getDateObject = fbhelper.getDateObject;
}]);