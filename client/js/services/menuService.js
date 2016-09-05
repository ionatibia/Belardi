var app = angular.module("app");

app.service('menuService', function() {
    //this.collapseMenu = 
	//	function () {
            $('.navbar-collapse ul li a:not(.dropdown-toggle)').bind('click touchstart', function () {
                    $('.navbar-toggle:visible').click();
      	    });
    	//};
});