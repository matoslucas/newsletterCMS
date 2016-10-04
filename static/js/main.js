
var  WebFontConfig;
function insertGoogleWebFont(font) {
     WebFontConfig = { google: { families: [font ] } };
    var wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
}
var $mdThemingProviderReference;
var $routeProviderReference;
var app = angular.module('MyApp', ['ngMaterial', 'ngMessages', 'ngRoute', 'ngSanitize']);
app.config(function ($mdThemingProvider, $routeProvider, $locationProvider, $mdIconProvider) {
    
    
     $mdIconProvider.defaultIconSet('static/fonts/mdi.svg');
    
    $mdThemingProviderReference = $mdThemingProvider;
    
	 $mdThemingProvider.theme('default').primaryPalette('grey').accentPalette('orange');
	
   
    
	$mdThemingProvider.theme('red')
    .primaryPalette('red');
	
	$mdThemingProvider.theme('pink')
    .primaryPalette('pink');
    
    $mdThemingProvider.theme('purple')
    .primaryPalette('purple');
    
    $mdThemingProvider.theme('deep-purple')
    .primaryPalette('deep-purple');
	
	$mdThemingProvider.theme('indigo')
    .primaryPalette('indigo');
    
    $mdThemingProvider.theme('blue')
    .primaryPalette('blue');
	
    $mdThemingProvider.theme('light-blue')
    .primaryPalette('light-blue');
	
	$mdThemingProvider.theme('cyan')
    .primaryPalette('cyan');
    
    $mdThemingProvider.theme('teal')
    .primaryPalette('teal');
    
    $mdThemingProvider.theme('green')
    .primaryPalette('green');
	
	$mdThemingProvider.theme('light-green')
    .primaryPalette('light-green');
    
    $mdThemingProvider.theme('lime')
    .primaryPalette('lime');
	
	$mdThemingProvider.theme('yellow')
    .primaryPalette('yellow');
	
	$mdThemingProvider.theme('amber')
    .primaryPalette('amber');
    
    $mdThemingProvider.theme('orange')
    .primaryPalette('orange');
    
    $mdThemingProvider.theme('deep-orange')
    .primaryPalette('deep-orange');
	
	$mdThemingProvider.theme('brown')
    .primaryPalette('brown');
    
    $mdThemingProvider.theme('grey')
    .primaryPalette('grey');
    
	
    $mdThemingProvider.alwaysWatchTheme(true);
    
    $routeProviderReference = $routeProvider;
    

});

app.factory('dataFactory', function($window){
var dataFactory = {};

    dataFactory.init = function (k,cb,l) {
        $window.goldenRetriever.sniff(k,cb,l);
    };
return dataFactory;
});
app.filter('getData', function() { 

  return function(data, q) {
      if(data){
      	 for(i = 0; data['length'] > i; i++){
                 if(data[i].gsx$item.$t==q){
                     return data[i].gsx$value.$t;
                     break;
                 }
        }
      }    
  }

});
app.service('webService', function($http, $route, dataFactory, $window, $location) {
     var domain='https://spreadsheets.google.com/feeds/',
    type='/public/full?alt=json',
    batch,
    batchWasLoaded=false,
    loadFromPath= false,
    feeds,
    defaultPage;
    dataFactory.loadingView=true;
    
    loader = function (t, cb, err){
        $http({ method: 'GET', url: t }).then(cb, err);
    }
    
    err = function (e){
        console.log(e);
    }
    
    getItemData = function (data,q){
		 for(i=0; data.length >i; i++){
			 if(data[i].gsx$item.$t==q){
				 return data[i].gsx$value.$t;
				 break;
			 }
		 }
	 }
        
    function feedCallBack(e){
        
      if(e.data.feed.entry){
                  
        if(e.data.feed.title.$t=='config'){
            
            dataFactory.config=e.data.feed.entry;
           // defaultPage=getItemData(dataFactory.config,"defaultPage");
            batch = getItemData(dataFactory.config,"batch");
            insertGoogleWebFont(getItemData(dataFactory.config,"googleWebFont"));			
        }
        if(e.data.feed.title.$t=='menu'){
            dataFactory.menu=e.data.feed.entry;
        }
        if(e.data.feed.title.$t!='menu'&& e.data.feed.title.$t!='config'){
            
            if(!defaultPage){
                defaultPage = e.data.feed.title.$t;
            }
          
            
            dataFactory[e.data.feed.title.$t]=e.data.feed.entry;
            $routeProviderReference.when('/'+e.data.feed.title.$t, {
                  templateUrl: 'static/tpl/default.html',
                  controller: function($scope) {
                      $scope.data=dataFactory[e.data.feed.title.$t]; 
                  }
                });
        }
          
      } 
       
        feeds.shift();
         loadFeeds();
       
    }
    function loaderEnd(){
                
          dataFactory.loadingView=false;
          $routeProviderReference.when('/pro/:id', {
                  templateUrl: 'static/tpl/product.html',
                  controller: function($scope, $routeParams) {
                     $scope.productId = typeof($routeParams.productId) == "undefined" ? 'default' : $routeParams.productId;
                   
                  }
                });
          $routeProviderReference.otherwise({ redirectTo: '/'+defaultPage });
	
        if(loadFromPath){
             $location.path('/'+defaultPage );
        }else{
            $route.reload();
        }
           
    }
    function loadFeeds(){
      if(feeds.length){
	      loader( feeds[0].link[0].href+'?alt=json' , feedCallBack,err);
      }else{
          if(batchWasLoaded){
               loaderEnd();
          }else{
              batchWasLoaded= true;
             loader(domain+'worksheets/'+batch+type,
                function(e){
                 feeds=e.data.feed.entry;
                 loadFeeds()
                },err); 
          
          }
       	
      }
    }
       
     this.ini = function(id,p){
         loadFromPath=p;
         dataFactory.loadingView=true;
         defaultPage= undefined;
         loader(domain+'worksheets/'+id+type,
        function(e){
         feeds=e.data.feed.entry;
         loadFeeds()
        },err);
     }
     
      
});
app.controller('AppCtrl', function($scope, $window, $location, $anchorScroll, $mdBottomSheet,dataFactory) {
     
    $scope.loadingView=dataFactory.loadingView=true;
    $scope.config=dataFactory.config;
    $scope.$watch(function () { return dataFactory.loadingView }, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
        $scope.config=dataFactory.config;
        $scope.loadingView=dataFactory.loadingView; 
        }
    });
    
          

    $scope.showMenu = function($event) {
        console.log('showMenu')
    $scope.alert = '';
    $mdBottomSheet.show({
      templateUrl: 'static/tpl/bottom-sheet-grid-menu.html',
      controller: 'GridBottomSheetCtrl',
      clickOutsideToClose: false,
      targetEvent: $event
    }).then(function(clickedItem) {
            
    });
  };

});
app.directive('responsiveImage', function($compile) {
  return {	
    restrict: "AE",
    transclude: true,
    replace:true,
    controller: function($scope){
             
    },
    templateUrl: 'static/tpl/responsiveImage.html',
    link: function (scope,element, attr) {         
      scope.url = attr.urlPath;
      scope.alt = attr.alt; 
      scope.type = attr.type;
    }
  };
});
app.directive('responsiveText', function($compile) {
  return {	
    restrict: "AE",
    transclude: true,
    replace:true,
    controller: function($scope){
               
    },
    templateUrl: 'static/tpl/responsiveText.html',
    link: function (scope,element, attr) {
      scope.title = attr.title; 
      scope.text = attr.text;   
    }
  };
});

app.directive('responsiveSquare', function($compile) {
  return {	
    restrict: "AE",
    transclude: true,
    replace:true,
    controller: function($scope){
               
    },
    templateUrl: 'static/tpl/responsiveSquare.html',
    link: function (scope,element, attr) {
      scope.url = attr.urlPath;
      scope.title = attr.title.toUpperCase(); 
      scope.text = attr.text;  
      scope.section = attr.section;  
    }
  };
});

app.directive('responsiveContentHeader', function($compile) {
  return {	
    restrict: "AE",
    transclude: true,
    replace:true,
    controller: function($scope){
               
    },
    templateUrl: 'static/tpl/responsiveContentHeader.html',
    link: function (scope,element, attr) {
      scope.url = attr.urlPath;
      scope.title = attr.title; 
      scope.text = attr.text;  
      scope.section = attr.section;  
    }
  };
});

app.directive('responsiveContent', function($compile) {
  return {	
    restrict: "AE",
    transclude: true,
    replace:true,
    controller: function($scope){
               
    },
    templateUrl: 'static/tpl/responsiveContent.html',
    link: function (scope,element, attr) {
      scope.url = attr.urlPath;
      scope.title = attr.title; 
      scope.text = attr.text;  
      scope.section = attr.section;  
    }
  };
});

app.directive('background', function($compile) {
  return {	
    restrict: "AE",
    transclude: true,
    replace:true,
    templateUrl: 'static/tpl/background.html',
    link: function (scope,element, attr) {
      scope.url = attr.urlPath;
    }
  };
});
app.directive('spacer', function() {
  return {	
    restrict: "E",
    replace:true,
    templateUrl: 'static/tpl/spacer.html'
  };
});

app.controller('GridBottomSheetCtrl', function($window, $scope, $mdBottomSheet, dataFactory, $location, webService) {
    $scope.menuHeader=dataFactory.menuHeader;
    $scope.items = dataFactory.menu;
 
      $scope.listItemClick = function(v,t) {
          console.log(t);
                   
          if(t=='load'){
                       
              webService.ini(v,true);
              
          }else if(t=='_blank'){
              $window.open(v, "_blank");
          }else{
              $location.path(v);
          }
        
        $mdBottomSheet.hide();
      };
    
})


 app.run(function($templateCache, $rootScope, $http, $route, dataFactory, $window, webService) {
     
     		webService.ini('1Vgep7UF7Y4nThiseC7LoRVYd3wg1FrcgQ4UyGZPpOMI');
	 
});