app.controller('UserListCtrl', ['$scope','Auth','User',
    function($scope,Auth,User) {
     
     $("ul.page-sidebar-menu li").removeClass("active");
     $("#id_Users").addClass("active");
     $scope.isSignedIn = false;
     $scope.immediateFailed = false;
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.isLoading = false;
     $scope.pagination = {};
     $scope.currentPage = 01;
     $scope.selected_users=[];
     $scope.selected_invitees=[];
     $scope.pages = [];
     $scope.organization = {};
     $scope.users = [];
     
     

     // What to do after authentication
     $scope.runTheProcess = function(){
          var params = {'limit':7};
          User.getOrganizationLicensesStatus($scope,{});
          User.list($scope,params);
     };
     // We need to call this to refresh token when user credentials are invalid
     $scope.refreshToken = function() {
            Auth.refreshToken();
     };
     $scope.listNextPageItems = function(){
        
        
        var nextPage = $scope.currentPage + 1;
        var params = {};
          if ($scope.pages[nextPage]){
            params = {'limit':7,
                      'pageToken':$scope.pages[nextPage]
                     }
          }else{
            params = {'limit':7}
          }
          console.log('in listNextPageItems');
          $scope.currentPage = $scope.currentPage + 1 ; 
          User.list($scope,params);
     }
     $scope.filterByName=function(){
      if ($scope.predicate!='google_display_name') {
            console.log($scope.predicate);
             $scope.predicate = 'google_display_name'; $scope.reverse=false
      }else{
             console.log($scope.predicate);
             $scope.predicate = '-google_display_name'; $scope.reverse=false;
      };
     }
     $scope.listPrevPageItems = function(){
       
       var prevPage = $scope.currentPage - 1;
       var params = {};
          if ($scope.pages[prevPage]){
            params = {'limit':7,
                      'pageToken':$scope.pages[prevPage]
                     }
          }else{
            params = {'limit':7}
          }
          $scope.currentPage = $scope.currentPage - 1 ;
          User.list($scope,params);
     }
     $scope.select_all_invitees = function($event){
       
        var checkbox = $event.target;
         if(checkbox.checked){
            $scope.selected_invitees=[];
             $scope.selected_invitees=$scope.selected_invitees.concat($scope.invitees);
              $scope.allInvitees=true;

         }else{
          $scope.selected_invitees=[];
          $scope.allInvitees=false;
         }
    };
    $scope.select_invitee= function(invitee,index,$event){
         var checkbox = $event.target;
         if(checkbox.checked){
            if ($scope.selected_invitees.indexOf(invitee) == -1) {
              $scope.selected_invitees.push(invitee);
           }
         }else{
            $scope.selected_invitees.splice(index, 1);
         }
    };
     $scope.isSelectedInvitee = function(index) {
        return ($scope.selected_invitees.indexOf(index) >= 0||$scope.allInvitees);
      };
      $scope.select_all_users = function($event){
       
        var checkbox = $event.target;
         if(checkbox.checked){
            $scope.selected_users=[];
             $scope.selected_users=$scope.selected_users.concat($scope.users);
              $scope.isSelectedAll=true;

         }else{
          $scope.selected_users=[];
          $scope.isSelectedAll=false;
         }
    };
    $scope.select_user= function(user,index,$event){
      console.log('fffff');
      console.log(user+index+$event);
         var checkbox = $event.target;
         if(checkbox.checked){
            if ($scope.selected_users.indexOf(user) == -1) {
              $scope.selected_users.push(user);
           }
         }else{
            $scope.selected_users.splice(index, 1);
         }
    };
     $scope.isSelected = function(index) {
        return ($scope.selected_users.indexOf(index) >= 0||$scope.isSelectedAll);
      };
    

     
     $scope.showModal = function(){
        console.log('button clicked');
        $('#addAccountModal').modal('show');

      };
      
    $scope.addNewUser = function(user){
      console.log('add a new user');
      console.log(user);
      $('#addAccountModal').modal('hide');
      User.insert($scope,user);
    };
    $scope.getPosition= function(index){
        if(index<4){
         
          return index+1;
        }else{
          return (index%4)+1;
        }
     };
     
     
   
  // Google+ Authentication 
    Auth.init($scope);
    
}]);

app.controller('UserNewCtrl', ['$scope','Auth','User',
    function($scope,Auth,User) {
     
     $("ul.page-sidebar-menu li").removeClass("active");
     $("#id_Users").addClass("active");
     $scope.isSignedIn = false;
     $scope.immediateFailed = false;
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.isLoading = false;
     $scope.pagination = {};
     $scope.currentPage = 01;
     $scope.pages = [];
     $scope.emails=[];
     $scope.users = [];
     $scope.message="";
     

      $scope.status = 'New';

      $scope.showEmailForm=false;
     
     

     // What to do after authentication
     $scope.runTheProcess = function(){
          var params = {'limit':7};
          User.list($scope,params);
     };
     // We need to call this to refresh token when user credentials are invalid
     $scope.refreshToken = function() {
            Auth.refreshToken();
     };
     



    $scope.deleteInfos = function(arr,index){
          arr.splice(index, 1);
      };
  
      
    $scope.addNewUser = function(message){
      console.log('add a new user');      
      emailss=[];
      for (i=0; i< ($scope.emails).length; i++){
        emailss[i]=$scope.emails[i].email;
      }
     
      params={'emails':emailss,
                'message' : $scope.message
                }
      User.insert($scope,params);
    };

    $scope.getPosition= function(index){
        if(index<4){
         
          return index+1;
        }else{
          return (index%4)+1;
        }
     };
     
      $scope.initObject=function(obj){
          for (var key in obj) {
                obj[key]=null;
              }
      }
      $scope.pushElement = function(elem, arr, infos) {
            if (arr.indexOf(elem) == -1) {

                switch (infos) {
                    
                    case 'emails' :
                        if (elem.email) {
                            var copyOfElement = angular.copy(elem);
                            arr.push(copyOfElement);
                            $scope.initObject(elem);
                        }
                        $scope.showEmailForm = false;
                        $scope.email.email = ''
                        break;
                                    }
            } else {
                alert("item already exit");
            }
        };

   
     

     



     
   
  // Google+ Authentication 
    Auth.init($scope);
    
}]);


app.controller('UserShowCtrl', ['$scope','$route', '$filter','Auth','Task','User','Contributor','Tag','Edge',
    function($scope,$route,$filter,Auth,Task,User,Contributor,Tag,Edge) {
     $("ul.page-sidebar-menu li").removeClass("active");
     $("#id_Users").addClass("active");
     document.title = "Team: Home";
     $scope.isSignedIn = false;
     $scope.immediateFailed = false;
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.isLoading = false;
     $scope.isMoreItemLoading = false;
     $scope.pagination = {};
     $scope.currentPage = 01;
     $scope.pages = [];
     $scope.accounts = [];
     $scope.account = {};
     $scope.tag = {};
     $scope.account.access ='public';
     $scope.order = '-updated_at';
     $scope.filter = undefined;
     $scope.status = 'pending';
     $scope.account.account_type = 'Customer';
     $scope.slected_members = [];
     $scope.tasks_checked = [];
     $scope.selected_tasks = [];
     $scope.selected_tags = [];
     $scope.manage_tags =false;
     $scope.edited_task =null;
     $scope.edited_tag =null;
     $scope.selectedTab=1;
     $scope.newTask={};
     $scope.newTask.title='';
     $scope.newTask.assignees=[];
     $scope.showUntag=false;
     $scope.edgekeytoDelete=undefined;
     $scope.task_title='';
     $scope.color_pallet=[
         {'name':'red','color':'#F7846A'},
         {'name':'orange','color':'#FFBB22'},
         {'name':'yellow','color':'#EEEE22'},
         {'name':'green','color':'#BBE535'},
         {'name':'blue','color':'#66CCDD'},
         {'name':'gray','color':'#B5C5C5'},
         {'name':'teal','color':'#77DDBB'},
         {'name':'purple','color':'#E874D6'},
     ];
     $scope.tag.color= {'name':'green','color':'#BBE535'};
     $scope.newTaskValue=null;
     $scope.draggedTag={};
     $scope.task_checked = false;
     $scope.isSelectedAll = false;
     $scope.showNewTag=false;
     $scope.taskpagination={};
     $scope.taggableOptions=[];
     $scope.taggableOptions.push(
      {'tag':'@','data':{
      name:'users',
      attribute:'google_display_name'
      },'selected':[]},
      {'tag':'#','data':{
      name:'tags',
      attribute:'name'
      },'selected':[]}
      );
      $scope.selectedTask=null;
         $scope.currentTask=null;
         $scope.showTagsFilter=false;
           $scope.showNewTag=false;
     var handleColorPicker = function () {
          if (!jQuery().colorpicker) {
              return;
              console.log('errooooooooooooooor');
              console.log("working******************************");
          }
          $('.colorpicker-default').colorpicker({
              format: 'hex'
          });
      }

      $('.typeahead').css("width", $('.typeahead').prev().width()+'px !important');
      $('.typeahead').width(433);
      handleColorPicker();
        $scope.isBlankState=function(tasks){
      if (typeof tasks !== 'undefined' && tasks.length > 0) {
        return false;
      }else{
        return true
      }
    }
      $scope.idealTextColor=function(bgColor){
        var nThreshold = 105;
         var components = getRGBComponents(bgColor);
         var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

         return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
      };

     $scope.$watch('newTask.due', function(newValue, oldValue) {
              $scope.showStartsCalendar=false;
     });
      $scope.showNewTagForm=function(){
            $scope.showNewTag=true;
            $( window ).trigger( 'resize' );  
          }
          $scope.hideNewTagForm=function(){
            $scope.showNewTag=false;
            $( window ).trigger( 'resize' ); 
          }
          $scope.hideTagFilterCard=function(){
            $scope.showTagsFilter=false;
            $( window ).trigger( 'resize' ); 
          }
          $scope.showTagFilterCard=function(){
            $scope.showTagsFilter=true;
            $( window ).trigger( 'resize' ); 
          }
   // delete task from list hadji hicham 08-07-2014 
   $scope.deleteThisTask= function(entityKey){

    var params = {'entityKey':entityKey};
     Task.delete($scope, params);
   };
// rederection after delete from list of tasks. hadji hicham  08-07-2014
   $scope.taskDeleted = function(resp){
   var params = { 'order': $scope.order,

                        'limit':20}
          Task.list($scope,params,true);
     };


      function getRGBComponents(color) {

          var r = color.substring(1, 3);
          var g = color.substring(3, 5);
          var b = color.substring(5, 7);

          return {
             R: parseInt(r, 16),
             G: parseInt(g, 16),
             B: parseInt(b, 16)
          };
      }
      $scope.checkColor=function(color){
        $scope.tag.color=color;
      }
      $scope.customWidth=function(width,due,reminder){
       /* if(due==null&&$reminder==null){
                return 30;
           }else{
                if($scope.newTask.due==null||$scope.newTask.reminder==null){

                      return 150;
                }else{
                   return 260;
                }
           }*/
           console.log(width);
           console.log(due);
           console.log(reminder);
      }
      $scope.dragTag=function(tag){
        $scope.draggedTag=tag;
      }
      $scope.dropTag=function(task){
        var items = [];
        var edge = {
              'start_node': task.entityKey,
              'end_node': $scope.draggedTag.entityKey,
              'kind':'tags',
              'inverse_edge': 'tagged_on'
        };
        items.push(edge);
        params = {
          'items': items
        }
        Edge.insert($scope,params);
        $scope.draggedTag=null;
      }
     // What to do after authentication
     $scope.runTheProcess = function(){
          var user_params = {'google_user_id':$route.current.params.userGID};
          User.get_user_by_gid($scope,user_params);
          var tasks_params = { 
                              'order': $scope.order,
                              'assignee' : $route.current.params.userGID,
                              'status':'open'
                            }
          Task.list($scope,tasks_params,true);
          User.list($scope,{});
          var varTagname = {'about_kind':'Task'};
          Tag.list($scope,varTagname);

     };
     $scope.renderCalendar=function(resp){

     }
     // We need to call this to refresh token when user credentials are invalid
     $scope.refreshToken = function() {
          Auth.refreshToken();
     };

     $scope.getUrl = function(type,id){
        var base_url = undefined;
          switch (type)
              {
              case 'Account':
                base_url = '/#/accounts/show/';
                break;
              case 'Contact':
                base_url = '/#/contacts/show/';
                break;
              case 'Lead':
                base_url = '/#/leads/show/';
                break;
              case 'Opportunity':
                base_url = '/#/opportunities/show/';
                break;
              case 'Case':
                base_url = '/#/cases/show/';
                break;
              }
            return base_url+id;
        }

        // hadji hicham 23-07-2014 . inlinepatch for labels .
  $scope.inlinePatch=function(kind,edge,name,tag,value){
      
        if(kind=="tag"){

        params={'id':tag.id,
                'entityKey':tag.entityKey,
                'about_kind':'Lead',
                'name':value
                  };


           Tag.patch($scope,params);
      };



             }
     $scope.assigneeModal = function(){
        $('#assigneeModal').modal('show');
      };
     // Next and Prev pagination
     $scope.listNextPageItems = function(){
        var nextPage = $scope.currentPage + 1;
        var params = {};
          if ($scope.pages[nextPage]){
            params = {'limit':7,
                      'order' : $scope.order,
                      'pageToken':$scope.pages[nextPage]
            }
          }else{
            params = {'order' : $scope.order,'limit':7}
          }
          $scope.currentPage = $scope.currentPage + 1 ;
          Account.list($scope,params);
     };
     $scope.listPrevPageItems = function(){
       var prevPage = $scope.currentPage - 1;
       var params = {};
          if ($scope.pages[prevPage]){
            params = {'limit':7,
                      'order' : $scope.order,
                      'pageToken':$scope.pages[prevPage]
            }
          }else{
            params = {'order' : $scope.order,'limit':7}
          }
          $scope.currentPage = $scope.currentPage - 1 ;
          Account.list($scope,params);
     };
     // Add a new account methods
     // Show the modal
     $scope.showModal = function(){
        $('#addAccountModal').modal('show');
     };
     $scope.showAssigneeTags=function(){
        $('#assigneeTagsToTask').modal('show');
     };

     $scope.edit_task=function(task){
        $scope.edited_task=task;
     }

     $scope.done_edit_task=function(task){
        $scope.edited_task=null;
        $scope.updateTask(task);
     }

     // Insert the account if enter button is pressed
     $scope.addAccountOnKey = function(account){
        if(event.keyCode == 13 && account){
            $scope.save(account);
        };
     };
     // inserting the account
     $scope.save = function(account){
          if (account.name) {
             Account.insert($scope,account);
           };
      };

    $scope.addAccountOnKey = function(account){
      if(event.keyCode == 13 && account){
          $scope.save(account);
      }


    };
    $scope.select_all_tasks = function($event){
        var checkbox = $event.target;
         if(checkbox.checked){
            $scope.selected_tasks=[];
             $scope.selected_tasks.push($scope.tasks);
              $scope.isSelectedAll=true;
         }else{
          $scope.selected_tasks=[];
          $scope.isSelectedAll=false;
          console.log($scope.selected_tasks);
         }
    };
    $scope.addNewTask=function(){
       
      $scope.treatTheTitle($scope.newTask.title);

       if($scope.newTask.title != ""){

       
        if ($scope.newTask.due){


            var dueDate= $filter('date')($scope.newTask.due,['yyyy-MM-ddTHH:mm:00.000000']);
           /* dueDate = dueDate +'T00:00:00.000000'*/
            params ={'title': $scope.task_title,
                      'due': dueDate,
                      'about': $scope.account.entityKey
            }
            console.log(dueDate);

        }else{
            
            params ={'title': $scope.task_title}
        };
        angular.forEach($scope.taggableOptions, function(option){
          if(option.data.name=='users'&&option.selected!=[]){
        
            params.assignees=option.selected;
            option.selected=[];
            console.log(params.assignees);
          }
          if(option.data.name=='tags'&&option.selected!=[]){
            params.tags=option.selected;
            option.selected=[];
          }

        });
         
         Task.insert($scope,params);
      }
        $scope.tagInfo.selected = [];

        console.log($scope.newTask.title);
        $scope.newTask.title='';
        $scope.newTask.due=null;
        $scope.newTask.reminder=null;
         $scope.task_title='';
    }


      // hadji hicham ,under the test : treat the title 
  $scope.treatTheTitle=function(title){
    if(title !=""){

      for(var i=0;i<title.length;i++){

       if(title.charAt(i)!="@"){
     
        $scope.task_title+=title.charAt(i);
        $scope.$apply();
            
       }else{
        break;
       }
        
      } 


    }
        
  }

   $scope.updateTask = function(task){
            params ={ 'id':task.id,
                      'title': task.title,
                      'status':task.status
            };
      Task.patch($scope,params);
    };

    $scope.select_task= function(task,index,$event){
      console.log(task);
         var checkbox = $event.target;
         if(checkbox.checked){
            if ($scope.selected_tasks.indexOf(task) == -1) {
              console.log("checked");
              $scope.selected_tasks.push(task);
             console.log($scope.selected_tasks);

           }
         }else{
            $scope.selected_tasks.splice(index, 1);
             console.log("unchecked");
             console.log($scope.selected_tasks);
         }
    };
/**********************************************************
      adding Tag member to new task
***********************************************************/


/************************************/
      $scope.isSelected = function(index) {
        return ($scope.selected_tasks.indexOf(index) >= 0||$scope.isSelectedAll);
      };
      /************************************/
      $scope.beforecloseTask = function(){
          $('#beforecloseTask').modal('show');
         };
      $scope.closeTask = function(){
       
        angular.forEach($scope.selected_tasks, function(selected_task){
           if (selected_task.status=='open'||selected_task.status=='pending') {
            console.log("woooork");
              params = {'id':selected_task.id,
            'status':'closed'
            };
            Task.patch($scope,params);
           }
        });
             $('#beforecloseTask').modal('hide');
      };
       $scope.deleteTask = function(){
        console.log($scope.selected_tasks);
        angular.forEach($scope.selected_tasks, function(selected_task){
            var params = {'entityKey':selected_task.entityKey};
            Task.delete($scope, params);
        });
        $scope.selected_tasks=[];
      };
      $scope.reopenTask = function(){
        angular.forEach($scope.selected_tasks, function(selected_task){
          if (selected_task.status=='closed') {
            params = {'id':selected_task.id,
            'status':'pending'
            };
            Task.patch($scope,params);
          };

        });
      };
     $scope.selectMember = function(){
        if ($scope.slected_members.indexOf($scope.user) == -1) {
           $scope.slected_members.push($scope.user);
           $scope.slected_memeber = $scope.user;
           $scope.user = $scope.slected_memeber.google_display_name;
        }
        $scope.user='';
     };

     $scope.unselectMember =function(index){
         $scope.slected_members.splice(index, 1);
          console.log($scope.slected_members);
     };
     $scope.addNewContributors = function(){
      items = [];
      angular.forEach($scope.slected_members, function(selected_user){
         angular.forEach($scope.selected_tasks, function(selected_task){

            var edge = {
              'start_node': selected_task.entityKey,
              'end_node': selected_user.entityKey,
              'kind':'assignees',
              'inverse_edge': 'assigned_to'
            };
            items.push(edge);


         });
      });
      if (items){
        params = {
          'items': items
        }
        Edge.insert($scope,params);
      }
     $('#assigneeModal').modal('hide');
     };
     $scope.listContributors = function(){
      var params = {'discussionKey':$scope.task.entityKey,
                     'order':'-created_at'};
      Contributor.list($scope,params);
      };
     $scope.accountInserted = function(resp){
          $('#addAccountModal').modal('hide');
          window.location.replace('#/accounts/show/'+resp.id);
     };
     //tags


     $scope.listTasks=function(){
      $scope.selected_tasks=[];/*we have to change it */
      var tasks_params = { 
                              'order': $scope.order,
                              'assignee' : $route.current.params.userGID,
                              'status':'open'
                            }
          Task.list($scope,tasks_params);

     }
     $scope.hilightTask = function(){

       $('#task_0').effect( "bounce", "slow" );
       $('#task_0 .list-group-item-heading').effect("highlight","slow");
     }
     $scope.edgeInserted = function () {
       $scope.listTasks();
     }
     // Quick Filtering
     var searchParams ={};
     $scope.result = undefined;
     $scope.q = undefined;

     /*$scope.$watch('searchQuery', function() {
         searchParams['q'] = $scope.searchQuery;
         Account.search($scope,searchParams);
     });*/
     $scope.selectResult = function(){
          window.location.replace('#/accounts/show/'+$scope.searchQuery.id);
     };
     $scope.executeSearch = function(searchQuery){
        if (typeof(searchQuery)=='string'){
           var goToSearch = 'type:Account ' + searchQuery;
           window.location.replace('#/search/'+goToSearch);
        }else{
          window.location.replace('#/accounts/show/'+searchQuery.id);
        }
        $scope.searchQuery=' ';
        $scope.$apply();
     };
     // Sorting
     $scope.orderBy = function(order){
      if($scope.filter!=undefined){
        var params = { 'order': order,
                        'status': $scope.filter,
                        'limit':7};
      }else{
          var params = { 'order': order,
                        'limit':7};
      }

        $scope.order = order;
        Task.list($scope,params);
     };
     $scope.filterByOwner = function(filter){
        if (filter){
          var params = { 'owner': filter,
                         'order': $scope.order,
                         'limit':7}
        }
        else{
          var params = {
              'order': $scope.order,

              'limit':7}
        };
        console.log('Filtering by');
        console.log(params);
        $scope.filter=filter;
        Task.list($scope,params);
     };
     $scope.filterByStatus = function(){
        if ($scope.status){
          var params = { 'status': $scope.status,
                         'order': $scope.order,
                         'limit':7}
        }
        else{
          var params = {
              'order': $scope.order,

              'limit':7}
        };
        $scope.filter=$scope.status;
        $scope.isFiltering = true;
        Task.list($scope,params);
     };
/***********************************************
        tags
***************************************************************************************/
$scope.listTags=function(){
     var varTagname = {'about_kind':'Task'};
     console.log('testtesttag');
      Tag.list($scope,varTagname);
}
$scope.addNewtag = function(tag){
       var params = {
                          'name': tag.name,
                          'about_kind':'Task',
                          'color':tag.color.color
                      }  ;
       Tag.insert($scope,params);
       var varTagname = {'about_kind':'Task'};
        Tag.list($scope,varTagname);
         tag.name='';
     }

$scope.updateTag = function(tag){
            params ={ 'id':tag.id,
                      'title': tag.name,
                      'status':tag.color
            };
      Tag.patch($scope,params);
  };
$scope.selectTag= function(tag,index,$event){
      if(!$scope.manage_tags){
         var element=$($event.target);
         if(element.prop("tagName")!='LI'){
              element=element.parent().closest('LI');
         }
         var text=element.find(".with-color");
         if($scope.selected_tags.indexOf(tag) == -1){
            $scope.selected_tags.push(tag);
           /* element.css('background-color', tag.color+'!important');
            text.css('color',$scope.idealTextColor(tag.color));*/

         }else{
           /* element.css('background-color','#ffffff !important');*/
            $scope.selected_tags.splice($scope.selected_tags.indexOf(tag),1);
            /* text.css('color','#000000');*/
         }

         $scope.filterByTags($scope.selected_tags);

      }

    };
      $scope.showAssigneeTags=function(task){
            $('#assigneeTagsToTask').modal('show');
            $scope.currentTask=task;
         };
      $scope.addTagsTothis=function(){
          var tags=[];
          var items = [];
          tags=$('#select2_sample2').select2("val");
              angular.forEach(tags, function(tag){
                var edge = {
                  'start_node': $scope.currentTask.entityKey,
                  'end_node': tag,
                  'kind':'tags',
                  'inverse_edge': 'tagged_on'
                };
                items.push(edge);
              });
          params = {
            'items': items
          }
          Edge.insert($scope,params);
          $scope.currentTask=null;
          $('#assigneeTagsToTask').modal('hide');
         };
   $scope.listMoreItems = function(){
        var nextPage = $scope.currentPage + 1;
        var params = {};
        console.log($scope.pages)
        if ($scope.pages[nextPage]){
          console.log('wooooooooooooork2');
            params = {
                      'limit':20,
                      'order' : $scope.order,
                      'pageToken':$scope.pages[nextPage]
                    }
            $scope.currentPage = $scope.currentPage + 1 ;
            Task.listMore($scope,params);
        }
      };
  $scope.filterByTags = function(selected_tags){
         var tags = [];
         angular.forEach(selected_tags, function(tag){
            tags.push(tag.entityKey);
         });
         var params = {
          'tags': tags,
          'limit':20
         }
         Task.list($scope,params);

  };

  //HKA 03.03.2014 When tag is deleted render task.list
   $scope.tagDeleted = function(){
    $scope.listasks();
 };

 $scope.listasks = function(){
   var params = { 'order': $scope.order,

                        'limit':7}
          Task.list($scope,params,true);
 }

  $scope.filterByOwner = function(selected_tags){
         var tags = [];
         angular.forEach(selected_tags, function(tag){
            tags.push(tag.entityKey);
         });
         var params = {
          'tags': tags
         }
         Task.list($scope,params);

  }
  $scope.completedTasks = function(){
         $scope.tasks = [];
         $scope.isLoading = true;
         var tasks_params = { 
                              'order': $scope.order,
                              'assignee' : $route.current.params.userGID,
                              'status':'closed'
                            }
          console.log('***');
          console.log(tasks_params);
          Task.list($scope,tasks_params,true);

  }
  $scope.openTasks = function(){
         $scope.tasks = [];
         $scope.isLoading = true;
         var tasks_params = { 
                              'order': $scope.order,
                              'assignee' : $route.current.params.userGID,
                              'status':'open'
                            }
          console.log('***');
          console.log(tasks_params);
          Task.list($scope,tasks_params,true);

  }
 $scope.createdByMe=function(owner){
    var params = {
                'order': $scope.order,
                'owner': owner,
                'limit':7
              };
    Task.list($scope,params,true);

 }
 $scope.assignedToMe=function(assignedTo){
   var params = { 'order': $scope.order,
                  'assignee' : assignedTo,

                  'limit':7
                }
    Task.list($scope,params,true);

 }
 $scope.privateTasks=function(){
   var params = { 'order': $scope.order,

                        'limit':7}
          Task.list($scope,params,true);

 }
$scope.unselectAllTags= function(){
        $('.tags-list li').each(function(){
            var element=$(this);
            var text=element.find(".with-color");
             element.css('background-color','#ffffff !important');
             text.css('color','#000000');
        });
     };


$scope.manage=function(){
        $scope.unselectAllTags();
      };
$scope.tag_save = function(tag){
          if (tag.name) {
             Tag.insert($scope,tag);
             console.log("tag saved");
           };
      };
$scope.deleteTag=function(tag){
          params = {
            'entityKey': tag.entityKey
          }
          Tag.delete($scope,params);

      };
$scope.editTag=function(tag){
        $scope.edited_tag=tag;
     }
$scope.doneEditTag=function(tag){
        $scope.edited_tag=null;
        $scope.updateTag(tag);
     }

$scope.addTags=function(){
      var tags=[];
      var items = [];
      tags=$('#select2_sample2').select2("val");
      if ($scope.currentTask!=null) {
        angular.forEach(tags, function(tag){
                var edge = {
                  'start_node': $scope.currentTask.entityKey,
                  'end_node': tag,
                  'kind':'tags',
                  'inverse_edge': 'tagged_on'
                };
                items.push(edge);
              });
      }else{
        angular.forEach($scope.selected_tasks, function(selected_task){
          angular.forEach(tags, function(tag){
            var edge = {
              'start_node': selected_task.entityKey,
              'end_node': tag,
              'kind':'tags',
              'inverse_edge': 'tagged_on'
            };
            items.push(edge);
          });
      });
      }
      
      params = {
        'items': items
      }
      Edge.insert($scope,params);
      $('#assigneeTagsToTask').modal('hide');

     };
 // ask before delete task hadji hicham . 08-07-2014 .
       $scope.editbeforedelete = function(){
     $('#BeforedeleteTask').modal('show');
   };

   $scope.deleteTaskonList= function(){
      
     var params = {'entityKey':$scope.selected_tasks.entityKey};

       angular.forEach($scope.selected_tasks, function(selected_task){
           
           
              params = {'entityKey':selected_task.entityKey,
            
            };
             Task.delete($scope, params); 
          
        });
     
    
      $('#BeforedeleteTask').modal('hide');



     };

 //HKA 19.06.2014 Detache tag on contact list
     $scope.dropOutTag=function(){


        var params={'entityKey':$scope.edgekeytoDelete}
        Edge.delete($scope,params);

        $scope.edgekeytoDelete=undefined;
        $scope.showUntag=false;
      };
      $scope.dragTagItem=function(edgekey){
        $scope.showUntag=true;
        $scope.edgekeytoDelete=edgekey;
      };
     // Google+ Authentication
     Auth.init($scope);
     $(window).scroll(function() {
          if (!$scope.isLoading && ($(window).scrollTop() >  $(document).height() - $(window).height() - 100)) {
              $scope.listMoreItems();
          }
      });

}]);

