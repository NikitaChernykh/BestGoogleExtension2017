'use strict';
//get acsses to the background.js
var background = chrome.extension.getBackgroundPage();

//sort websites in descending order by visits
//sorts before load
background.websiteList.sort(function (a, b) {
    return b.websiteVisits - a.websiteVisits;
});

(function () {
    
    var MainController = function ($scope) {

        $scope.websites = background.websiteList;
        //descending sort order
        $scope.sortOrder = "-websiteVisits";
        $scope.authenticated = false;
        //_locales translate TODO => move the translation in saparate file
        $scope.placeholder_msg = chrome.i18n.getMessage("placeholder_msg");
        $scope.table_header_text = chrome.i18n.getMessage("table_header_text");
        $scope.websites_label = chrome.i18n.getMessage("websites_label");
        $scope.visits_label = chrome.i18n.getMessage("visits_label");
        $scope.time_label = chrome.i18n.getMessage("time_label");

        //send popup action to background
        chrome.runtime.sendMessage({action: "popup"}, function(response){
           if(response.user == "null"){
              $scope.authenticated = false;
           } 
           if(response.user = "authenticated"){
              $scope.authenticated = true;
           }
        });
        
        //sort color and order toggle
        $scope.sortToggle = function (order) {
            //track website sorting event
            _gaq.push(['_trackEvent', order, 'listSorted']);

            if (order == "websiteVisits") {
                $scope.ascStyle = {fill: "#ffffff"};
                $scope.desStyle = {fill: "#22d8ff"}
                return $scope.sortOrder = "-websiteVisits";
            }else{
                $scope.ascStyle = {fill: "#22d8ff"};
                $scope.desStyle = {fill: "#ffffff"}
                return $scope.sortOrder = "websiteVisits";
            }
            return;

        };
        //clear all website list
        $scope.settings = function(){
          var newURL = location.origin+"/views/options.html";
          chrome.tabs.create({ url: newURL });
        };

        //remove website
        $scope.remove = function (website) {
            $scope.websites.splice($scope.websites.indexOf(website), 1);
            //track website removal event
            _gaq.push(['_trackEvent', website.websiteName, 'websiteRemoved']);

            //send remove action to background
            chrome.runtime.sendMessage({
                action: "remove",
                list: $scope.websites
            });
        };
       
        
        $scope.gauth = function(){
            chrome.runtime.sendMessage({action: "login"}, function(response) {
            if (response.login == "success") {
                    $scope.authenticated = true;
                    $scope.$apply();
                }
            });
        }
        
        //logoff
        $scope.logoff = function(){
            $scope.authenticated = false;
            chrome.runtime.sendMessage({
               action: "logoff",
            });
        }
        
        //show day table
        $scope.dayBtn = 1;
        $scope.isActive = false;

        //week days in progress TODO
        $scope.days = [];
        for (var i = 6; i >= 1; i--) {
            var date = moment().subtract('days', i);
            var formattedDate = {number: moment(date).format("D"), name: moment(date).format("ddd")};
            $scope.days.push(formattedDate);
            if(i == 5){
                 $scope.dayStyle = {color: "#000"};
            }else{
                $scope.dayStyle = {color: "#fff"};
            }
        }
        var today = {number: moment().format("D"), name: moment().format("ddd")};
        $scope.days.push(today);

        //TODO!
        //        $scope.dayClick = function(day){
        //            $scope.dayBtn = day;
        //            $scope.isActive = !$scope.isActive;
        //            if (day == 1){
        //                $scope.isActive = false;
        //            }
        //        }
        
        //monster toggle
        $scope.monsterToggle = function () {
            if (background.websiteList[0] == undefined || background.websiteList[0].websiteVisits < 0) {
                return true;
            }else{
                return false;
            }
        };
    };

    //regsiter a controller in the module
    app.controller("MainController", ["$scope", MainController]);
}());
