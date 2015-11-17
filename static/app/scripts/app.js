var app = angular.module('crmEngine', ['googlechart', 'easypiechart', 'xeditable', 'ui.bootstrap', 'ui.select2', 'angularMoment',
    'angular-sortable-view',
    'crmEngine.authservices', 'crmEngine.accountservices', 'crmEngine.contactservices', 'crmEngine.topicservices',
    'crmEngine.taskservices', 'crmEngine.eventservices', 'crmEngine.leadservices', 'crmEngine.opportunityservices',
    'crmEngine.caseservices', 'crmEngine.userservices', 'crmEngine.groupservices', 'crmEngine.noteservices',
    'crmEngine.commentservices', 'crmEngine.settingservices', 'crmEngine.importservices', 'mapServices',
    'crmEngine.infonodeservices', 'crmEngine.edgeservices', 'crmEngine.discoverservices', 'crmEngine.reportservices',
    'crmEngine.profileservices', 'crmEngine.linkedinservices']);
var public_blog_app = angular.module('publicBlogEngine',['blogEngine.blogservices','ui.bootstrap','ui.select2']);
//app.js Single page application


app.config(function($interpolateProvider){
  $interpolateProvider.startSymbol('<%=');
  $interpolateProvider.endSymbol('%>');
});
app.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);
app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
app.run(['$rootScope', function($rootScope){
    

}]);

app.config(['$routeProvider', function($routeProvider) {
     $routeProvider.
     // Accounts
     
     when('/discovers/', {
        controller: 'DiscoverListCtrl',
        templateUrl:'/views/discovers/list'
      }).when('/discovers/new', {
        controller: 'DiscoverNewCtrl',
        templateUrl:'/views/discovers/new'
      }).when('/discovers/show/:tweetId', {
        controller: 'DiscoverShowCtrl',
        templateUrl:'/views/discovers/show'
      }).

      when('/accounts/', {
        controller: 'AccountListCtrl',
        templateUrl:'/views/accounts/list'
      }).when('/accounts/show/:accountId', {
        controller: 'AccountShowCtrl',
        templateUrl:'/views/accounts/show'
      }).when('/accounts/new', {
        controller: 'AccountNewCtrl',
        templateUrl:'/views/accounts/new'
      }).
      // Contacts
      when('/contacts/new', {
        controller: 'ContactNewCtrl',
        templateUrl:'/views/contacts/new'
      }).when('/contacts/', {
        controller: 'ContactListCtrl',
        templateUrl:'/views/contacts/list'

      }).when('/contacts/show/:contactId', {
        controller: 'ContactShowCtrl',
        templateUrl:'/views/contacts/show'
      }).
      // Opportunities
      when('/opportunities/', {
        controller: 'OpportunityListCtrl',
        templateUrl:'/views/opportunities/list'
      }).when('/opportunities/show/:opportunityId', {
        controller: 'OpportunityShowCtrl',
        templateUrl:'/views/opportunities/show'
      }).when('/opportunities/new', {
        controller: 'OpportunityNewCtrl',
        templateUrl:'/views/opportunities/new'
      }).
      // Leads
      when('/leads/', {
        controller: 'LeadListCtrl',
        templateUrl:'/views/leads/list'
      }).when('/leads/show/:leadId', {
        controller: 'LeadShowCtrl',
        templateUrl:'/views/leads/show'
      }).
      when('/leads/new', {
        controller: 'LeadNewCtrl',
        templateUrl:'/views/leads/new'
      }).
      // Cases
      when('/cases/', {
        controller: 'CaseListCtrl',
        templateUrl:'/views/cases/list'
      }).when('/cases/show/:caseId', {
        controller: 'CaseShowCtrl',
        templateUrl:'/views/cases/show'
      }).when('/cases/new', {
        controller: 'CaseNewCtrl',
        templateUrl:'/views/cases/new'
      }).
      // Needs
      when('/needs/show/:needId', {
        controller: 'NeedShowCtrl',
        templateUrl:'/views/needs/show'
      }).
      // Notes
      when('/notes/show/:noteId',{
      controller : 'NoteShowController',
      templateUrl:'/views/notes/show'
      }).
      // Events
      when('/events/show/:eventId',{
      controller : 'EventShowController',
      templateUrl:'/views/events/show'
      }).
      // Tasks
      when('/tasks/show/:taskId',{
      controller : 'TaskShowController',
      templateUrl:'/views/tasks/show'
      }).

      // All Tasks
      when('/tasks/',{
      controller : 'AllTasksController',
      templateUrl:'/views/tasks/list'
      }).
      // Documents
      when('/documents/show/:documentId',{
      controller : 'DocumentShowController',
      templateUrl:'/views/documents/show'
      }).
      // Search
      when('/search/:q', {
        controller: 'SearchShowController',
        templateUrl:'/views/search/list'
      }).

      // Admin Console
      when('/admin/users', {
        controller: 'UserListCtrl',
        templateUrl:'/views/admin/users/list'
      }).when('/admin/users/new', {
        controller: 'UserNewCtrl',
        templateUrl:'/views/admin/users/new'
      }).when('/admin/users/show/:userGID', {
        controller: 'UserShowCtrl',
        templateUrl:'/views/admin/users/show'
      }).when('/admin/groups', {
        controller: 'GroupListCtrl',
        templateUrl:'/views/admin/groups/list'
      }).when('/admin/groups/show/:groupId', {
        controller: 'GroupShowCtrl',
        templateUrl:'/views/admin/groups/show'
      }).when('/admin/settings',{
        controller:'SettingsShowCtrl',
        templateUrl:'/views/admin/settings'

      }).when('/admin/imports', {
        controller: 'ImportListCtrl',
        templateUrl:'/views/admin/imports/list'
      }).when('/admin/imports/new', {
        controller: 'ImportNewCtrl',
        templateUrl:'/views/admin/imports/new'
      }).
      //Shows
      when('/live/shows', {
        controller: 'ShowListCtrl',
        templateUrl:'/views/shows/list'
      }).when('/live/shows/show/:showId', {
        controller: 'ShowShowCtrl',
        templateUrl:'/views/shows/show'

      }).when('/live/company_profile/:organizationId',{
        controller:'CompanyProfileShowCtrl',
        templateUrl:'/views/live/company_profile'

      }).when('/live/product_videos',{
        controller:'ProductVideoListCtrl',
        templateUrl:'/views/live/product_videos'

      }).when('/live/product_videos/product_video/:productId',{
        controller:'ProductVideoShowCtrl',
        templateUrl:'/views/live/product_videos/show'

      }).when('/live/customer_stories',{
        controller:'CustomerStoriesListCtrl',
        templateUrl:'/views/live/customer_stories'

      }).when('/live/customer_stories/customer_story/:customerstoryId',{
        controller:'CustomerStoriesShowCtrl',
        templateUrl:'/views/live/customer_stories/show'

      }).when('/live/feedbacks',{
        controller:'FeedBacksListCtrl',
        templateUrl:'/views/live/feedbacks'
      }).when('/live/feedbacks/feedback/:feedbackId',{
        controller:'FeedBacksShowCtrl',
        templateUrl:'/views/live/feedbacks/show'
      }).
       //Calendar
       when('/calendar/', {
        controller: 'EventListController',
        templateUrl:'/views/calendar/show'
      })
       .when('/billing/', {
        controller: 'BillingListController',
        templateUrl:'/views/billing/list'
      })
       .when('/billing/show/:userId', {
        controller: 'BillingShowController',
        templateUrl:'/views/billing/show'
      }).when('/dashboard/', {
        controller: 'dashboardCtrl',
        templateUrl:'/views/dashboard'
         }).when('/admin/company', {
             controller: 'BillingListController',
             templateUrl: '/views/admin/company/edit'
         }).when('/admin/email_signature', {
             controller: 'EmailSignatureEditCtrl',
             templateUrl: '/views/admin/email_signature/edit'
         }).when('/admin/regional', {
             controller: 'RegionalEditCtrl',
             templateUrl: '/views/admin/regional/edit'
         }).when('/admin/opportunity', {
             controller: 'OpportunityEditCtrl',
             templateUrl: '/views/admin/opportunity/edit'
         }).when('/admin/case_status', {
             controller: 'CaseStatusEditCtrl',
             templateUrl: '/views/admin/case_status/edit'
         }).when('/admin/lead_status', {
             controller: 'LeadStatusEditCtrl',
             templateUrl: '/views/admin/lead_status/edit'
         }).when('/admin/data_transfer', {
             controller: 'DataTransferEditCtrl',
             templateUrl: '/views/admin/data_transfer/edit'
         }).when('/admin/synchronisation', {
             controller: 'SynchronisationEditCtrl',
             templateUrl: '/views/admin/synchronisation/edit'
         }).when('/admin/custom_fields/:customfieldId', {
             controller: 'CustomFieldsEditCtrl',
             templateUrl: '/views/admin/custom_fields/edit'
      });
}]);

var myApp = angular.module('myApp', []);
myApp.filter('inStage', function() {
  return function(input, stage) {
    var out = [];
      for (var i = 0; i < input.length; i++){
          if(input[i].current_stage.name == stage)
              out.push(input[i]);
      }      
    return out;
  };
});
app.filter("customCurrency", function (numberFilter)
  {
    function isNumeric(value)
    {
      return (!isNaN(parseFloat(value)) && isFinite(value));
    }

    return function (inputNumber, currencySymbol, decimalSeparator, thousandsSeparator, decimalDigits) {
      if (isNumeric(inputNumber))
      {
        // Default values for the optional arguments
        currencySymbol = (typeof currencySymbol === "undefined") ? "$" : currencySymbol;
        decimalSeparator = (typeof decimalSeparator === "undefined") ? "." : decimalSeparator;
        thousandsSeparator = (typeof thousandsSeparator === "undefined") ? "," : thousandsSeparator;
        decimalDigits = (typeof decimalDigits === "undefined" || !isNumeric(decimalDigits)) ? 2 : decimalDigits;

        if (decimalDigits < 0) decimalDigits = 0;

        // Format the input number through the number filter
        // The resulting number will have "," as a thousands separator
        // and "." as a decimal separator.
        var formattedNumber = numberFilter(inputNumber, decimalDigits);

        // Extract the integral and the decimal parts
        var numberParts = formattedNumber.split(".");

        // Replace the "," symbol in the integral part
        // with the specified thousands separator.
        numberParts[0] = numberParts[0].split(",").join(thousandsSeparator);

        // Compose the final result
        var result = currencySymbol + numberParts[0];

        if (numberParts.length == 2)
        {
          result += decimalSeparator + numberParts[1];
        }

        return result;
      }
      else
      {
        return inputNumber;
      }
    };
  });
app.filter('exists', function(){
  return function(elem, array) {
    for (var index in array) {
      if (array[index].id == elem.id) {
        return index;
      }
    }
    return -1;
  }
});
Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{3})+' + (n > 0 ? '\\D' : '$') + ')';
        var re1 = '\\d(?=(\\d{2})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));
    
    return (c ? num.replace('.', c) : num).replace(new RegExp(re1, 'g'), '$&' + (s || ','));
};

app.filter('curr', function(){
 /* @param integer n: length of decimal
  @param integer x: length of whole part
  @param mixed   s: sections delimiter
  @param mixed   c: decimal delimiter*/
  return function(input,n, x, s, c) {
      n=(typeof(n) !== 'string') ? parseFloat(n) : n;
      x=(typeof(x) !== 'string') ? parseFloat(x) : x;
    if (typeof(input) !== 'undefined') {
      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = input.toFixed(Math.max(0, ~~n));
    
      return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    }else{
      return "";
    };
   }
});
app.filter('startFrom', function() {
    return function(input, start) {
        if(input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
/***header scroll detection for bottom shadow***/
$(window).scroll(function(){
  var y = $(window).scrollTop();
  if( y > 0 ){
    $(".subHeader").addClass("header-bottom-shadow");
  } else {
    $(".subHeader").removeClass("header-bottom-shadow");
  }
  /*if(y > 48){
         if ($(window).width()>992) {
          $(".afterScrollBtn").removeClass("hidden");
          $(".newAccountBtnOnscroll").removeClass( "hidden" );
          $(".newAccountBtnOnscroll").fadeIn( "slow" );
         };

  }else{
    if ($(window).width()>992) {
       $(".afterScrollBtn").addClass("hidden");
       $(".newAccountBtnOnscroll").hide();
     }
  }*/
 });
app.constant('angularMomentConfig', {
    preprocess: 'unix', // optional
    timezone: 'Europe/London' // optional
});

function trackMixpanelAction (actionName){
  var user={
    'email':document.getElementById("userEmail").value,
    'name' :document.getElementById("userDisplayname").value,
    'created_at':document.getElementById("usercreated_at").value,
    'language' :document.getElementById("userLanguage").value,
    'organization' :document.getElementById("userorganization").value,
    'id' :document.getElementById("userId").value
  };
  mixpanel.identify(user.id);
   mixpanel.people.set({
    "$email": user.email,    // only special properties need the $
    "$name":user.name,
    "$created": user.created_at,
    //"$updated_at": user.,
    "$organization": user.organization,
    "$language": user.language
    
    // "$created": "2011-03-16 16:53:54",
    // "$last_login": new Date(),         // properties can be dates...
    
    // "credits": 150,                    // ...or numbers
    
    // "gender": "{{user.google_display_name}}"                    // feel free to define your own properties
      });
  mixpanel.track(actionName,{"Displayname":user.name,"email":user.email,"organization":user.organization});
    
    
}
