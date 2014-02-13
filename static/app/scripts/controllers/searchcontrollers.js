app.controller('SearchFormController', ['$scope','Search',
    function($scope,Search) {
     if (annyang) {
        console.log('Okkkkkkkkkkkkkkkkk');
        // Let's define our first command. First the text we expect, and then the function it should call
        var commands = {
          'search *term': function(term) {
            $scope.searchQuery = term;

            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
            $scope.$apply();
            $scope.executeSearch($scope.searchQuery);
          }
        };


        // Add our commands to annyang
        annyang.addCommands(commands);

        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start();
      }
     var params ={};
     $scope.result = undefined;
     $scope.q = undefined;
     $scope.$watch('searchQuery', function() {
         params['q'] = $scope.searchQuery;
         gapi.client.crmengine.search(params).execute(function(resp) {
            if (resp.items){
              $scope.results = resp.items;
              $scope.$apply();
            };
            
          });
     });
     $scope.selectResult = function(){
      console.log('You are welcome On the morning day');
        var url = Search.getUrl($scope.searchQuery.type,$scope.searchQuery.id);
        $scope.searchQuery=' ';
        window.location.replace(url);
     };
     $scope.executeSearch = function(searchQuery){
      if (typeof(searchQuery)=='string'){
         window.location.replace('#/search/'+searchQuery);
      }else{
        var url = Search.getUrl($scope.searchQuery.type,$scope.searchQuery.id);
        $scope.searchQuery=' ';
        window.location.replace(url);
      }
      
     };
}]);

app.controller('SearchShowController', ['$scope','$route', 'Auth','Search',
    function($scope,$route,Auth,Search) {
     $scope.isSignedIn = false;
     $scope.immediateFailed = false;
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.isLoading = false;
     $scope.pagination = {};
     $scope.currentPage = 01;
     $scope.pages = [];
    
     // What to do after authentication
     $scope.runTheProcess = function(){
          var params = {'limit':7,'q':$route.current.params.q};
          Search.list($scope,params);
     };
     // We need to call this to refresh token when user credentials are invalid
     $scope.refreshToken = function() {
          Auth.refreshToken();
     };
     
     $scope.listNextPageItems = function(){
        var nextPage = $scope.currentPage + 1;
        var params = {};
          if ($scope.pages[nextPage]){
            params = {'q':$route.current.params.q,
                      'limit':7,
                      
                      'pageToken':$scope.pages[nextPage]
                     }
          }else{
            params = {'q':$route.current.params.q,
                      'limit':7}
          }

          $scope.currentPage = $scope.currentPage + 1 ; 
          Search.list($scope,params);
     };
     $scope.listPrevPageItems = function(){
       var prevPage = $scope.currentPage - 1;
       var params = {};
          if ($scope.pages[prevPage]){
            params = { 'q':$route.current.params.q,
                      'limit':7,

                      'pageToken':$scope.pages[prevPage]
                     }
        }else{
            params = {'q':$route.current.params.q,
                      'limit':7}
          }
          $scope.currentPage = $scope.currentPage - 1 ;
          Search.list($scope,params);
     };   

     // Google+ Authentication 
     Auth.init($scope);
     
}]);
