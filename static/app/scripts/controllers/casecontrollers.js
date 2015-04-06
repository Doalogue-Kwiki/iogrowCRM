app.controller('CaseListCtrl', ['$scope','$filter','Auth','Case','Account','Contact','Casestatus','Tag','Edge',
    function($scope,$filter,Auth,Case,Account,Contact,Casestatus,Tag,Edge) {

     document.title = "Cases: Home";
     $("ul.page-sidebar-menu li").removeClass("active");
     $("#id_Cases").addClass("active");
     $scope.isSignedIn = false;
     $scope.immediateFailed = false;
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.isLoading = false;
     $scope.nbLoads=0;
     $scope.isMoreItemLoading = false;
     $scope.pagination = {};
     $scope.casepagination={};
     $scope.currentPage = 01;
     $scope.pages = [];
     $scope.status_selected={};
     //HKA 11.12.2013 Manage Next & Prev
     $scope.casepagination = {};
     $scope.caseCurrentPage=01;
     $scope.casepages=[];

     $scope.cases = [];
     $scope.casee = {};
     $scope.casee.access ='public';
     $scope.casee.status = 'pending';
     $scope.casee.priority = 4;
     $scope.casee.account_name = undefined;
     $scope.casee.contact_name = undefined;
     $scope.order = '-updated_at';
     $scope.selected_tags = [];
     $scope.draggedTag=null;
     $scope.tag = {};
     $scope.showUntag=false;
     $scope.edgekeytoDelete=undefined;
        $scope.showNewTag=false;
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
      $scope.selectedCasee=null;
      $scope.currentCasee=null;
      $scope.showTagsFilter=false;
      $scope.showNewTag=false;
      $scope.show="cards";
      $scope.selectedCards=[];
      $scope.allCardsSelected=false;   
      $scope.inProcess=function(varBool,message){
        
          if (varBool) {           
            if (message) {
              console.log("starts of :"+message);
            };
            $scope.nbLoads=$scope.nbLoads+1;
            if ($scope.nbLoads==1) {
              $scope.isLoading=true;
            };
          }else{
            if (message) {
              console.log("ends of :"+message);
            };
            console.log("-------------yeah idiot down here------");
            $scope.nbLoads=$scope.nbLoads-1;
            if ($scope.nbLoads==0) {
               $scope.isLoading=false;
 
            };

          };
        }        
        $scope.apply=function(){
         
          if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
               $scope.$apply();
              }
              return false;
        }
      $scope.fromNow = function(fromDate){
          return moment(fromDate,"YYYY-MM-DD HH:mm Z").fromNow();
      }
      // What to do after authentication
       $scope.runTheProcess = function(){
            var params = {'order' : $scope.order,'limit':20}
            Case.list($scope,params);
            Casestatus.list($scope,{});
            console.log($scope.cases);
            var paramsTag = {'about_kind':'Case'};
            Tag.list($scope,paramsTag);
              // for (var i=0;i<100;i++)
              // {
              //     var casee = {
              //               'name':  i.toString() + ' Sync with Microsoft',
              //               'access':'public',
              //               'account': 'ahNkZXZ-Z2NkYzIwMTMtaW9ncm93chQLEgdBY2NvdW50GICAgICAgIgKDA'
              //             }
              //     Case.insert($scope,casee);
              // }
              ga('send', 'pageview', '/cases');
              if (localStorage['caseShow']!=undefined) {
                  $scope.show=localStorage['caseShow'];
              };
             window.Intercom('update');
       };



// HADJI HICHAM -04/02/2015

   $scope.removeTag = function(tag,casee) {
            

            /*var params = {'tag': tag,'index':$index}

            Edge.delete($scope, params);*/
            $scope.dragTagItem(tag,casee);
            $scope.dropOutTag();
        }

/***********************************************************/
       $scope.switchShow=function(){
            if ($scope.show=='list') {      

                 $scope.show = 'cards';
                 localStorage['caseShow']="cards";
                 $scope.selectedCards =[];
                 $( window ).trigger( 'resize' ); 


            }else{

              if ($scope.show=='cards') {
                 $scope.show = 'list';
                  localStorage['caseShow']="list";
                  $scope.selectedCards =[];
              }
              
            };
        }
         $scope.isSelectedCard = function(casee) {
            return ($scope.selectedCards.indexOf(casee) >= 0||$scope.allCardsSelected);
          };
          $scope.unselectAll = function($event){
               var element=$($event.target);
               if(element.hasClass('waterfall')){
                  $scope.selectedCards=[];
               };
              /*$scope.selectedCards=[];*/
          }
          $scope.selectAll = function($event){
         
              var checkbox = $event.target;
               if(checkbox.checked){
                  $scope.selectedCards=[];
                  $scope.selectedCards=$scope.selectedCards.concat($scope.cases);
                    
                  $scope.allCardsSelected=true;

               }else{

                $scope.selectedCards=[];
                $scope.allCardsSelected=false;
                
               }
          };
          $scope.editbeforedeleteselection = function(){
            $('#BeforedeleteSelectedCases').modal('show');
            console.log($scope.selectedCards.length);
          };
          $scope.deleteSelection = function(){
              angular.forEach($scope.selectedCards, function(selected_case){

                  var params = {'entityKey':selected_case.entityKey};
                  Case.delete($scope, params);

              });             
              $('#BeforedeleteSelectedCases').modal('hide');
          };
          $scope.caseDeleted = function(resp){

            if ($scope.selectedCards.length >0) {
              angular.forEach($scope.selectedCards, function(selected_case){
                 $scope.cases.splice($scope.cases.indexOf(selected_case) , 1);
                }); 
            };        
              $scope.selectedCards=[];
          };
          $scope.selectCardwithCheck=function($event,index,casee){

              var checkbox = $event.target;

               if(checkbox.checked){
                  if ($scope.selectedCards.indexOf(casee) == -1) {             
                    $scope.selectedCards.push(casee);
                  }
               }else{       
                    $scope.selectedCards.splice($scope.selectedCards.indexOf(casee) , 1);
               }

          }
           $scope.filterBy=function(text){
              if ($scope.fltby!=text) {
                     $scope.fltby = text; $scope.reverse=false
              }else{
                     $scope.fltby = '-'+text; $scope.reverse=false;
              };
          }
          $scope.getPosition= function(index){
            if(index<4){

              return index+1;
            }else{
              return (index%4)+1;
            }
         };
        // We need to call this to refresh token when user credentials are invalid
       $scope.refreshToken = function() {
            Auth.refreshToken();
       };
      $scope.editbeforedelete = function(casee){
         $scope.selectedCards=[casee];
         $('#BeforedeleteSelectedCases').modal('show');
       };
      $scope.deletecase = function(){
         var params = {'entityKey':$scope.selectedCards[0].entityKey};
         Case.delete($scope, params);
         $('#BeforedeleteSelectedCases').modal('hide');
         $scope.selectedCards=[];
       };
      $scope.showAssigneeTags=function(casee){
            $('#assigneeTagsToCases').modal('show');
            $scope.currentCasee=casee;
         };
        $scope.addTagsTothis=function(){
          var tags=[];
          var items = [];
          tags=$('#select2_sample2').select2("val");
              angular.forEach(tags, function(tag){
                var edge = {
                  'start_node': $scope.currentCasee.entityKey,
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
          $scope.currentCasee=null;
          $('#assigneeTagsToCases').modal('hide');
         };
          $scope.addTagstoCases=function(){
           var tags=[];
              var items = [];
              tags=$('#select2_sample2').select2("val");
              console.log(tags);
              if ($scope.currentCasee!=null) {
                angular.forEach(tags, function(tag){
                         var params = {
                           'parent': $scope.currentCasee.entityKey,
                           'tag_key': tag
                        };
                       Tag.attach($scope, params);
                       
                      });
                $scope.currentCasee=null;
              }else{
                angular.forEach($scope.selectedCards, function(selected_case){
                  angular.forEach(tags, function(tag){
                    var params = {
                      'parent': selected_case.entityKey,
                      'tag_key': tag
                    };
                     Tag.attach($scope, params);
                     console.log("request sent");
                  });
              });
              }
              $scope.apply();
              $('#select2_sample2').select2("val", "");
              $('#assigneeTagsToCases').modal('hide');
       }
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
     $scope.listNextPageItems = function(){

        var nextPage = $scope.caseCurrentPage + 1;
        var params = {};
          if ($scope.casepages[nextPage]){
            params = {'order' : $scope.order,'limit':6,
                      'pageToken':$scope.casepages[nextPage]
                     }
          }else{
            params = {'order' : $scope.order,'limit':6}
          }
          console.log('in listNextPageItems');
          $scope.caseCurrentPage = $scope.caseCurrentPage + 1 ;
          Case.list($scope,params);
     }
     $scope.listMoreItems = function(){

        var nextPage = $scope.caseCurrentPage + 1;
        var params = {};
          if ($scope.casepages[nextPage]){
            params = {
                      'order' : $scope.order,
                      'limit':20,
                      'pageToken':$scope.casepages[nextPage]
                     }
            $scope.caseCurrentPage = $scope.caseCurrentPage + 1 ;
            Case.listMore($scope,params);
          }
     }
     $scope.listPrevPageItems = function(){

       var prevPage = $scope.caseCurrentPage - 1;
       var params = {};
          if ($scope.casepages[prevPage]){
            params = {'order' : $scope.order,'limit':6,
                      'pageToken':$scope.casepages[prevPage]
                     }
          }else{
            params = {'order' : $scope.order,'limit':6}
          }
          $scope.caseCurrentPage = $scope.caseCurrentPage - 1 ;
          Case.list($scope,params);
     }



     $scope.showModal = function(){
        console.log('button clicked');
        $('#addCaseModal').modal('show');

      };


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

    $scope.save = function(casee){

        casee.status = $scope.status_selected.entityKey;
        casee.status_name = $scope.status_selected.status;
        if (typeof(casee.account)=='object'){

          casee.account = $scope.searchAccountQuery.entityKey;

          if (typeof(casee.contact)=='object'){

              casee.contact_name = casee.contact.firstname + ' '+ casee.contact.lastname ;
              casee.contact = casee.contact.entityKey;
          }

          Case.insert($scope,casee);

        }else if($scope.searchAccountQuery.length>0){
            // create a new account with this account name
            var params = {'name': $scope.searchAccountQuery,
                          'access': casee.access
            };
            $scope.casee = casee;
            Account.insert($scope,params);


        };


        $('#addCaseModal').modal('hide');
      };
   $scope.priorityColor=function(pri){
      if (pri<4) {
          return '#BBE535';
      }else{
        if (pri<6) {
             return '#EEEE22';
        }else{
          if (pri<8) {
               return '#FFBB22';
           }else{
               return '#F7846A';
           }
        }
      }
     }
     $scope.getStatusColor=function(status){
        if (status=='open') {
          return '#d84a38';
        };
        if (status=='pendding') {
          return '#FFBB22';
        };
        if (status=='closed') {
            return '#1d943b';
        };
     }
      $scope.addCaseOnKey = function(casee){
        if(event.keyCode == 13 && casee.name){
            $scope.save(casee);
        }
      };
      $scope.accountInserted = function(resp){
          $scope.casee.account = resp;
          $scope.save($scope.casee);
      };

     var params_search_account ={};
     $scope.contactResult = undefined;
     $scope.accountResult = undefined;
     $scope.q = undefined;

      $scope.$watch('searchAccountQuery', function() {
        if($scope.searchAccountQuery){

           params_search_account['q'] = $scope.searchAccountQuery;
           gapi.client.crmengine.accounts.search(params_search_account).execute(function(resp) {

              if (resp.items){
                $scope.accountsResults = resp.items;

                $scope.apply();
              };

            });

        }
      });
      $scope.selectAccount = function(){
        $scope.casee.account = $scope.searchAccountQuery;
        $scope.apply();

     };
     var params_search_contact ={};
     $scope.$watch('searchContactQuery', function() {
      if($scope.searchContactQuery){
        if($scope.searchContactQuery.length>1){
         params_search_contact['q'] = $scope.searchContactQuery;
         gapi.client.crmengine.contacts.search(params_search_contact).execute(function(resp) {

            if (resp.items){
              $scope.contactsResults = resp.items;

              $scope.apply();
            };

          });
         }
      }

      });
     $scope.selectContact = function(){
        $scope.casee.contact = $scope.searchContactQuery;
        var account = {'entityKey':$scope.searchContactQuery.account,
                      'name':$scope.searchContactQuery.account_name};
        $scope.casee.account = account;
        $scope.searchAccountQuery = $scope.searchContactQuery.account_name;
      };
    // Quick Filtering
     var searchParams ={};
     $scope.result = undefined;
     $scope.q = undefined;

     $scope.$watch('searchQuery', function() {
         searchParams['q'] = $scope.searchQuery;
         searchParams['limit'] = 7;
         if ($scope.searchQuery){
         Case.search($scope,searchParams);
       };
     });
     $scope.selectResult = function(){
          window.location.replace('#/cases/show/'+$scope.searchQuery.id);
     };
     $scope.executeSearch = function(searchQuery){
        if (typeof(searchQuery)=='string'){
           var goToSearch = 'type:Case ' + searchQuery;
           window.location.replace('#/search/'+goToSearch);
        }else{
          window.location.replace('#/cases/show/'+searchQuery.id);
        }
        $scope.searchQuery=' ';
        $scope.apply();
     };
     // Sorting
     $scope.orderBy = function(order){
        var params = { 'order': order,
                        'limit':6};
        $scope.order = order;
        Case.list($scope,params);
     };
     $scope.filterByOwner = function(filter){
        if (filter){
          var params = { 'owner': filter,
                         'order': $scope.order}
        }
        else{
          var params = {
              'order': $scope.order
            }
        };
        $scope.isFiltering = true;
        Case.list($scope,params);
     };
     $scope.filterByStatus = function(filter){
        if (filter){
          var params = { 'status': filter,
                         'order': $scope.order
                       }
        }
        else{
          var params = {
              'order': $scope.order
            }
        };
        $scope.isFiltering = true;
        Case.list($scope,params);
     };


    /***********************************************
      HKA 19.02.2014  tags
***************************************************************************************/
$scope.listTags=function(){
      var paramsTag = {'about_kind':'Case'}
      Tag.list($scope,paramsTag);
     };
$scope.edgeInserted = function () {
       $scope.listcases();
     };
$scope.listcases = function(){
  var params = { 'order': $scope.order,
                        'limit':6}
          Case.list($scope,params);
};


$scope.addNewtag = function(tag){
       var params = {
                          'name': tag.name,
                          'about_kind':'Case',
                          'color':tag.color.color
                      }  ;
       Tag.insert($scope,params);
        $scope.tag.name='';
        $scope.tag.color= {'name':'green','color':'#BBE535'};
        var paramsTag = {'about_kind':'Case'};
        Tag.list($scope,paramsTag);

     }
$scope.updateTag = function(tag){
            params ={ 'id':tag.id,
                      'title': tag.name,
                      'status':tag.color
            };
      Tag.patch($scope,params);
  };
  $scope.deleteTag=function(tag){
          params = {
            'entityKey': tag.entityKey
          }
          Tag.delete($scope,params);

      };


$scope.selectTag= function(tag,index,$event){
          if(!$scope.manage_tags){
         var element=$($event.target);
         if(element.prop("tagName")!='LI'){
              element=element.parent();
              element=element.parent();
         }
         var text=element.find(".with-color");
         if($scope.selected_tags.indexOf(tag) == -1){
            $scope.selected_tags.push(tag);
         }else{
            $scope.selected_tags.splice($scope.selected_tags.indexOf(tag),1);
         }
         ;
         $scope.filterByTags($scope.selected_tags);

      }

    };
// $scope.selectTag= function(tag,index,$event){
//       if(!$scope.manage_tags){
//          var element=$($event.target);
//          if(element.prop("tagName")!='LI'){
//               element=element.parent();
//               element=element.parent();
//          }
//          var text=element.find(".with-color");
//          if($scope.selected_tags.indexOf(tag) == -1){
//             $scope.selected_tags.push(tag);
//             element.css('background-color', tag.color+'!important');
//             text.css('color',$scope.idealTextColor(tag.color));

//          }else{
//             element.css('background-color','#ffffff !important');
//             $scope.selected_tags.splice($scope.selected_tags.indexOf(tag),1);
//              text.css('color','#000000');
//          }
//          ;
//          $scope.filterByTags($scope.selected_tags);

//       }

//     };
  $scope.filterByTags = function(selected_tags){
         var tags = [];
         angular.forEach(selected_tags, function(tag){
            tags.push(tag.entityKey);
         });
         var params = {
          'tags': tags,
          'order': $scope.order,
                        'limit':20
         }
        $scope.isFiltering = true;
         Case.list($scope,params);

  };

$scope.unselectAllTags= function(){
        $('.tags-list li').each(function(){
            var element=$(this);
            var text=element.find(".with-color");
             element.css('background-color','#ffffff !important');
             text.css('color','#000000');
        });
     };
//HKA 19.02.2014 When delete tag render account list
 $scope.tagDeleted = function(){
    $scope.listTags();
    $scope.listcases();

 };


$scope.manage=function(){
        $scope.unselectAllTags();
      };
$scope.tag_save = function(tag){
          if (tag.name) {
             Tag.insert($scope,tag);

           };
      };

$scope.editTag=function(tag,index){
  document.getElementById("tag_"+index).style.backgroundColor="white";
  document.getElementById("closy_"+index).style.display="none";
  document.getElementById("checky_"+index).style.display="none";
     //$scope.hideeverything=true;
    
     }
$scope.hideEditable=function(index,tag){
  document.getElementById("tag_"+index).style.backgroundColor=tag.color;
  document.getElementById("closy_"+index).removeAttribute("style");
  document.getElementById("checky_"+index).style.display="inline";
  //$scope.hideeverything=false;
  $scope.edited_tag=null;

}
$scope.doneEditTag=function(tag){
        $scope.edited_tag=null;
        $scope.updateTag(tag);
     }
$scope.addTags=function(){
      var tags=[];
      var items = [];
      tags=$('#select2_sample2').select2("val");

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

      params = {
        'items': items
      }

      Edge.insert($scope,params);
      $('#assigneeTagsToTask').modal('hide');

     };

     var handleColorPicker = function () {
          if (!jQuery().colorpicker) {
              return;

          }
          $('.colorpicker-default').colorpicker({
              format: 'hex'
          });
      }
      handleColorPicker();

      $('#addMemberToTask > *').on('click', null, function(e) {
            e.stopPropagation();
        });
      $scope.idealTextColor=function(bgColor){
        var nThreshold = 105;
         var components = getRGBComponents(bgColor);
         var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

         return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
      }
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
      $scope.dragTag=function(tag){
        $scope.draggedTag=tag;
      };
      $scope.dropTag=function(casee,index){
        console.log(casee);
        var items = [];

        var params = {
              'parent': casee.entityKey,
              'tag_key': $scope.draggedTag.entityKey
        };
        $scope.draggedTag=null;
        Tag.attach($scope,params,index);

      };
      $scope.tagattached=function(tag,index){

         if (index>=0) {
             if ($scope.cases[index].tags == undefined){
            $scope.cases[index].tags = [];
            }
            var ind = $filter('exists')(tag, $scope.cases[index].tags);
           if (ind == -1) {
                $scope.cases[index].tags.push(tag);
                var card_index = '#card_'+index;
                $(card_index).removeClass('over');
            }else{
                 var card_index = '#card_'+index;
                $(card_index).removeClass('over');
            }

                
           }else{
             console.log('$scope.selectedCards.length ');
             console.log($scope.selectedCards.length);
             if ($scope.selectedCards.length >0) {
              console.log("enter to $scope.selectedCards.length ");
              angular.forEach($scope.selectedCards, function(selected_case){
                console.log(selected_case);
                  var existstag=false;
                  angular.forEach(selected_case.tags, function(elementtag){

                      if (elementtag.id==tag.id) {
                         existstag=true;
                      };                       
                  }); 
                  if (!existstag) {
                     if (selected_case.tags == undefined) {
                        selected_case.tags = [];
                        }
                     selected_case.tags.push(tag);
                  };  
                  console.log("tag  tested");
            });        
            /*$scope.selectedCards=[];*/
          };
         $scope.apply();
      };
    }

  // HKA 12.03.2014 Pallet color on Tags
      $scope.checkColor=function(color){
        $scope.tag.color=color;
      };
 //HKA 19.06.2014 Detache tag on contact list
     $scope.dropOutTag=function(){


        var params={'entityKey':$scope.edgekeytoDelete}
        Edge.delete($scope,params);

        $scope.edgekeytoDelete=undefined;
        $scope.showUntag=false;
      };
       $scope.dragTagItem = function(tag,casee) {

            $scope.showUntag = true;
            $scope.edgekeytoDelete = tag.edgeKey;
            $scope.tagtoUnattach = tag;
            $scope.casetoUnattachTag = casee;
        }
        $scope.tagUnattached = function() {
          console.log("inter to tagDeleted");
            $scope.casetoUnattachTag.tags.splice($scope.casetoUnattachTag.tags.indexOf($scope.tagtoUnattach),1)
            $scope.apply()
        };
   // Google+ Authentication
     Auth.init($scope);
     $(window).scroll(function() {
          if (!$scope.isLoading && !$scope.isFiltering && ($(window).scrollTop() >  $(document).height() - $(window).height() - 100)) {
              $scope.listMoreItems();
          }
      });


}]);

app.controller('CaseShowCtrl', ['$scope','$filter', '$route','Auth','Case', 'Topic','Note','Task','Event','Permission','User','Casestatus','Email','Attachement','InfoNode','Tag','Edge',
    function($scope,$filter,$route,Auth,Case,Topic,Note,Task,Event,Permission,User,Casestatus,Email,Attachement,InfoNode,Tag,Edge) {
      $("ul.page-sidebar-menu li").removeClass("active");
      $("#id_Cases").addClass("active");

     $scope.selectedTab = 2;
     $scope.isSignedIn = false;
     $scope.immediateFailed = false;
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.isLoading = false;
     $scope.nbLoads=0;
     $scope.pagination = {};
      //HKA 10.12.2013 Var topic to manage Next & Prev
     $scope.topicCurrentPage=01;
     $scope.topicpagination={};
     $scope.topicpages = [];
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.status_selected={};
     $scope.currentPage = 01;
     $scope.pages = [];
     $scope.cases = [];
     $scope.users = [];
     $scope.collaborators_list=[];
     $scope.user = undefined;
     $scope.slected_memeber = undefined;
     $scope.email = {};
     $scope.documentpagination = {};
     $scope.documentCurrentPage=01;
     $scope.documentpages=[];
     $scope.infonodes = {};
     $scope.sharing_with = [];
     $scope.customfield={};
     $scope.newTaskform=false;
     $scope.newEventform=false;
     $scope.newTask={};
     $scope.ioevent = {};
     $scope.selected_members=[];
     $scope.selected_member={};
     $scope.showPage=true;
     $scope.ownerSelected={};
     $scope.sendWithAttachments=[];
     $scope.inProcess=function(varBool,message){
          if (varBool) {           
            if (message) {
              console.log("starts of :"+message);
            };
            $scope.nbLoads=$scope.nbLoads+1;
            if ($scope.nbLoads==1) {
              $scope.isLoading=true;
            };
          }else{
            if (message) {
              console.log("ends of :"+message);
            };
            $scope.nbLoads=$scope.nbLoads-1;
            if ($scope.nbLoads==0) {
               $scope.isLoading=false;
 
            };

          };
        }        
        $scope.apply=function(){
         
          if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
               $scope.$apply();
              }
              return false;
        }
     $scope.$watch('isLoading', function() 
     {
      console.log($scope.isLoading)
     });
    $scope.fromNow = function(fromDate){
        return moment(fromDate,"YYYY-MM-DD HH:mm Z").fromNow();
    }
     // What to do after authentication
       $scope.runTheProcess = function(){
          var params = {
                          'id':$route.current.params.caseId,

                          'topics':{
                            'limit': '7'
                          },

                          'documents':{
                            'limit': '15'
                          },

                          'tasks':{

                          },

                          'events':{

                          }
                      };
          Case.get($scope,params);
          User.list($scope,{});
          Casestatus.list($scope,{});
          var paramsTag = {'about_kind': 'Case'};
          Tag.list($scope, paramsTag);
          $( window ).trigger( "resize" );
          ga('send', 'pageview', '/cases/show');
          window.Intercom('update');
       };
        // We need to call this to refresh token when user credentials are invalid
       $scope.refreshToken = function() {
            Auth.refreshToken();
       };
       $scope.getColaborators=function(){
           
          Permission.getColaborators($scope,{"entityKey":$scope.casee.entityKey});  
        }
  $scope.deleteInfonode = function(entityKey,kind){
    var params = {'entityKey':entityKey,'kind':kind};

    InfoNode.delete($scope,params);

  };
    $scope.addTagsTothis=function(){
          var tags=[];
          var items = [];
          tags=$('#select2_sample2').select2("val");
          console.log(tags);
              angular.forEach(tags, function(tag){
                var params = {
                      'parent': $scope.casee.entityKey,
                      'tag_key': tag
                };
                console.log(params);
                Tag.attach($scope,params);
              });
        };
        $scope.tagattached = function(tag, index) {
          if ($scope.casee.tags == undefined) {
              $scope.casee.tags = [];
          }
          var ind = $filter('exists')(tag, $scope.casee.tags);
          if (ind == -1) {
              $scope.casee.tags.push(tag);
              
          } else {
          }
          $('#select2_sample2').select2("val", "");
          $scope.apply();
        };
         $scope.edgeInserted = function() {
          /* $scope.tags.push()*/
          };
         $scope.removeTag = function(tag,$index) {
          console.log('work.....');
            var params = {'tag': tag,'index':$index}
            Edge.delete($scope, params);
        }
        $scope.edgeDeleted=function(index){
         $scope.casee.tags.splice(index, 1);
         $scope.apply();
        }


    // 
       $scope.isEmptyArray=function(Array){
                if (Array!=undefined && Array.length>0) {
                return false;
                }else{
                    return true;
                };    
            
        }
     $scope.TopiclistNextPageItems = function(){


        var nextPage = $scope.topicCurrentPage + 1;
        var params = {};
          if ($scope.topicpages[nextPage]){
            params = {
                      'id':$scope.casee.id,
                        'topics':{
                          'limit': '7',
                          'pageToken':$scope.topicpages[nextPage]
                        }
                     }
            $scope.topicCurrentPage = $scope.topicCurrentPage + 1 ;
            Case.get($scope,params);
            }


     }

     $scope.listTopics = function(opportunity){
        var params = {
                      'id':$scope.casee.id,
                      'topics':{
                             'limit': '7'
                       }
                    };
          Case.get($scope,params);

     }
     $scope.listTags=function(){
      var paramsTag = {'about_kind':'Case'}
      Tag.list($scope,paramsTag);
     };
     $scope.hilightTopic = function(){

       $('#topic_0').effect( "bounce", "slow" );
       $('#topic_0 .message').effect("highlight","slow");
     }
     $scope.selectMember = function(){
        $scope.slected_memeber = $scope.user;
        $scope.user = '';
        $scope.sharing_with.push($scope.slected_memeber);

     };
  $scope.share = function(){
           var id = $scope.casee.id;
           var params ={
                        'id':id,
                        'access':$scope.casee.access
                      };
           Case.patch($scope,params);
               // who is the parent of this event .hadji hicham 21-07-2014.

                params["parent"]="case";
                Event.permission($scope,params);
                Task.permission($scope,params);




        if ($scope.sharing_with.length>0){

          var items = [];

          angular.forEach($scope.sharing_with, function(user){
                      var item = {
                                  'type':"user",
                                  'value':user.entityKey
                                };
                      items.push(item);
          });

          if(items.length>0){
              var params = {
                            'about': $scope.casee.entityKey,
                            'items': items
              }
              Permission.insert($scope,params);
          }


          $scope.sharing_with = [];


        }

     };

     $scope.updateCollaborators = function(){

          Case.get($scope,$scope.casee.id);

     };
     $scope.showModal = function(){
        console.log('button clicked');
        $('#addCaseModal').modal('show');

      };

    $scope.addNote = function(note){
        var params ={
                    'about': $scope.casee.entityKey,
                    'title': note.title,
                    'content': note.content
        };
      Note.insert($scope,params);
      $scope.note.title='';
      $scope.note.content='';
    };




    $scope.editcase = function() {
       $('#EditCaseModal').modal('show');
    }
    $scope.selectMemberToTask = function() {
      console.log($scope.selected_members);
      if ($scope.selected_members.indexOf($scope.user) == -1) {
          $scope.selected_members.push($scope.user);
          $scope.selected_member = $scope.user;
          $scope.user = $scope.selected_member.google_display_name;
      }
      $scope.user = '';
  };
  $scope.unselectMember = function(index) {
      $scope.selected_members.splice(index, 1);
      console.log($scope.selected_members);
  };
//HKA 09.11.2013 Add a new Task
   $scope.addTask = function(task){
if ($scope.newTaskform==false) {
          $scope.newTaskform=true;
           }else{
            if (task.title!=null) {
                    //  $('#myModal').modal('hide');
            if (task.due){
                var dueDate= $filter('date')(task.due,['yyyy-MM-ddT00:00:00.000000']);
                params ={'title': task.title,
                          'due': dueDate,
                          'parent': $scope.casee.entityKey,
                          'access':$scope.casee.access
                }

            }else{
                params ={'title': task.title,
                         'parent': $scope.casee.entityKey,
                         'access':$scope.casee.access
                       }
            };
            if ($scope.selected_members!=[]) {
                  params.assignees=$scope.selected_members;
                };
                var tags=[];
                tags=$('#select2_sample2').select2("val");
                if (tags!=[]) {
                  var tagitems = [];
                  angular.forEach(tags, function(tag){
                  var item = {'entityKey': tag };
                  tagitems.push(item);
                });
                  params.tags=tagitems;
                };
            Task.insert($scope,params);
            $scope.newTask={};
            $scope.newTaskform=false;
            $scope.selected_members=[];
            $("#select2_sample2").select2("val", "");
        }else{
            $scope.newTask={};
            $scope.newTaskform=false;
      }
     }
     };

    //HKA 27.07.2014 Add button cancel on Task form
       $scope.closeTaskForm=function(newTask){
               $scope.newTask={};
                $scope.newTaskform=false;
    };

     $scope.hilightTask = function(){

        $('#task_0').effect("highlight","slow");
        $('#task_0').effect( "bounce", "slow" );

     }
     $scope.listTasks = function(){
        var params = {
                        'id':$scope.casee.id,
                        'tasks':{}
                      };
        Case.get($scope,params);

     }
 //HKA 10.11.2013 Add event
 $scope.addEvent = function(ioevent){

        if ($scope.newEventform==false) {
                $scope.newEventform=true;
           }else{


            if (ioevent.title!=null&&ioevent.title!="") {

                    var params ={}


                  // hadji hicham 13-08-2014.
                  if($scope.allday){
                         var ends_at=moment(moment(ioevent.starts_at_allday).format('YYYY-MM-DDT00:00:00.000000'))

                   params ={'title': ioevent.title,
                            'starts_at': $filter('date')(ioevent.starts_at_allday,['yyyy-MM-ddT00:00:00.000000']),
                            'ends_at':ends_at.add('hours',23).add('minute',59).add('second',59).format('YYYY-MM-DDTHH:mm:00.000000'),
                            'where': ioevent.where,
                            'parent':$scope.casee.entityKey,
                            'allday':"true",
                            'access':$scope.casee.access
                      }



                  }else{

                  if (ioevent.starts_at){
                    if (ioevent.ends_at){
                      params ={'title': ioevent.title,
                              'starts_at': $filter('date')(ioevent.starts_at,['yyyy-MM-ddTHH:mm:00.000000']),
                              'ends_at': $filter('date')(ioevent.ends_at,['yyyy-MM-ddTHH:mm:00.000000']),
                              'where': ioevent.where,
                              'parent':$scope.casee.entityKey,
                              'allday':"false",
                              'access':$scope.casee.access
                      }

                    }else{
                      params ={
                        'title': ioevent.title,
                              'starts_at': $filter('date')(ioevent.starts_at,['yyyy-MM-ddTHH:mm:00.000000']),
                              'where': ioevent.where,
                              'parent':$scope.lead.entityKey,
                              'ends_at':moment(ioevent.ends_at).add('hours',2).format('YYYY-MM-DDTHH:mm:00.000000'),
                              'allday':"false",
                              'access':$scope.casee.access
                      }
                    }




                  }


                  }

                   Event.insert($scope,params);
                  $scope.ioevent={};
                  $scope.newEventform=false;



        }
     }

    };


// hadji hicham 14-07-2014 . update the event after we add .
$scope.updateEventRenderAfterAdd= function(){};

         $scope.deleteEvent =function(eventt){
    var params = {'entityKey':eventt.entityKey};
     Event.delete($scope,params);
     //$('#addLeadModal').modal('show');
   }
      $scope.eventDeleted = function(resp){
   };
    $scope.closeEventForm=function(ioevent){
      $scope.ioevent={};
      $scope.newEventform=false;
    }
     $scope.hilightEvent = function(){
        console.log('Should higll');
        $('#event_0').effect("highlight","slow");
        $('#event_0').effect( "bounce", "slow" );

     }
     $scope.listEvents = function(){
        var params = {
                        'id':$scope.casee.id,
                        'events':{

                        }
                      };
        Case.get($scope,params);

     };

//HKA 22.11.2013 Update Case
$scope.updatCasetHeader = function(casee){

  params = {'id':$scope.casee.id,
             'owner':$scope.ownerSelected.google_user_id,
             'name':casee.name,
             'priority' :casee.priority
             //'status':$scope.casee.current_status.name
           }
  Case.patch($scope,params);

    $('#EditCaseModal').modal('hide');
  };
 $scope.updateCase=function(params){
      Case.patch($scope,params);
  };
 $scope.updateCaseStatus = function(){

    var params = {
                  'entityKey':$scope.casee.entityKey,
                  'status': $scope.casee.current_status.entityKey
    };
    Case.update_status($scope,params);
 }
    
  $('#some-textarea').wysihtml5();

  $scope.showAttachFilesPicker = function() {
          var developerKey = 'AIzaSyDHuaxvm9WSs0nu-FrZhZcmaKzhvLiSczY';
          var docsView = new google.picker.DocsView()
              .setIncludeFolders(true)
              .setSelectFolderEnabled(true);
          var picker = new google.picker.PickerBuilder().
              addView(new google.picker.DocsUploadView()).
              addView(docsView).
              setCallback($scope.attachmentUploaderCallback).
              setOAuthToken(window.authResult.access_token).
              setDeveloperKey(developerKey).
              setAppId('935370948155-qm0tjs62kagtik11jt10n9j7vbguok9d').
                enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
              build();
          picker.setVisible(true);
      };
      $scope.attachmentUploaderCallback= function(data){
        if (data.action == google.picker.Action.PICKED) {
                $.each(data.docs, function(index) {
                    var file = { 'id':data.docs[index].id,
                                  'title':data.docs[index].name,
                                  'mimeType': data.docs[index].mimeType,
                                  'embedLink': data.docs[index].url
                    };
                    $scope.sendWithAttachments.push(file);
                });
                $scope.apply();
        }
      }

      $scope.sendEmail = function(email){
        
        email.body = $('#some-textarea').val();
        var params = {
                  'to': email.to,
                  'cc': email.cc,
                  'bcc': email.bcc,
                  'subject': email.subject,
                  'body': email.body,
                  'about':$scope.casee.entityKey
                  };
        if ($scope.sendWithAttachments){
            params['files']={
                            'parent':$scope.casee.entityKey,
                            'access':$scope.casee.access,
                            'items':$scope.sendWithAttachments
                            };
        };
        
        Email.send($scope,params);
      };


//HKA 29.12.2013 Delet Case
 $scope.editbeforedelete = function(){
     $('#BeforedeleteCase').modal('show');
   };
$scope.deletecase = function(){
     var caseid = {'entityKey':$scope.casee.entityKey};
     Case.delete($scope,caseid);
     $('#BeforedeleteCase').modal('hide');
     };

     $scope.DocumentlistNextPageItems = function(){


        var nextPage = $scope.documentCurrentPage + 1;
        var params = {};
          if ($scope.documentpages[nextPage]){
            params = {
                        'id':$scope.casee.id,
                        'documents':{
                          'limit': '15',
                          'pageToken':$scope.documentpages[nextPage]
                        }
                      }
            $scope.documentCurrentPage = $scope.documentCurrentPage + 1 ;

            Case.get($scope,params);

          }


     }

     $scope.listDocuments = function(){
        var params = {
                        'id':$scope.casee.id,
                        'documents':{
                          'limit': '15'
                        }
                      }
        Case.get($scope,params);

     };
     $scope.showCreateDocument = function(type){

        $scope.mimeType = type;
        $('#newDocument').modal('show');
     };
     $scope.createDocument = function(newdocument){
        var mimeType = 'application/vnd.google-apps.' + $scope.mimeType;
        var params = {
                      'parent': $scope.casee.entityKey,
                      'title':newdocument.title,
                      'mimeType':mimeType
                     };
        Attachement.insert($scope,params);

     };
     $scope.createPickerUploader = function() {
          var developerKey = 'AIzaSyDHuaxvm9WSs0nu-FrZhZcmaKzhvLiSczY';
          var projectfolder = $scope.casee.folder;
          var docsView = new google.picker.DocsView()
              .setIncludeFolders(true)
              .setSelectFolderEnabled(true);
          var picker = new google.picker.PickerBuilder().
              addView(new google.picker.DocsUploadView().setParent(projectfolder)).
              addView(docsView).
              setCallback($scope.uploaderCallback).
              setOAuthToken(window.authResult.access_token).
              setDeveloperKey(developerKey).
              setAppId('935370948155-qm0tjs62kagtik11jt10n9j7vbguok9d').
                enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
              build();
          picker.setVisible(true);
      };
      // A simple callback implementation.
      $scope.uploaderCallback = function(data) {


        if (data.action == google.picker.Action.PICKED) {
                var params = {
                              'access': $scope.casee.access,
                              'parent':$scope.casee.entityKey
                            };
                params.items = new Array();

                 $.each(data.docs, function(index) {
                      console.log(data.docs);
                      /*
                      {'about_kind':'Account',
                      'about_item': $scope.account.id,
                      'title':newdocument.title,
                      'mimeType':mimeType };
                      */
                      var item = { 'id':data.docs[index].id,
                                  'title':data.docs[index].name,
                                  'mimeType': data.docs[index].mimeType,
                                  'embedLink': data.docs[index].url

                      };
                      params.items.push(item);

                  });
                 Attachement.attachfiles($scope,params);

          }
      };

   //01.03.2014 Edit Close date, Type, Description, Source : show Modal

     $scope.editclosedate = function(){
     $('#EditCloseDate').modal('show')
     };
     $scope.editdescription = function(){
     $('#EditDescription').modal('show')
     };
      $scope.edittype = function(){
     $('#EditType').modal('show')
     };
    $scope.editcaseorigin = function(){
     $('#EditOrigin').modal('show')
     };



    $scope.updateDescription = function(casem){
      params = {'id':$scope.casee.id,
              'description':casee.description};
      Case.patch($scope,params);
      $('#EditDescription').modal('hide');
     };
    $scope.updateType = function(casem){
      params = {'id':$scope.casee.id,
              'type_case':casem.type_case};
      Case.patch($scope,params);
      $('#EditType').modal('hide');
     };
     $scope.updatcaseorigin= function(casem){
      params = {'id':$scope.casee.id,
              'case_origin':casem.case_origin};
      Case.patch($scope,params);
      $('#EditOrigin').modal('hide');
     };
      $scope.updateClosedate= function(casem){
      var close_at = $filter('date')(casem.closed_date,['yyyy-MM-ddTHH:mm:00.000000']);
      params = {'id':$scope.casee.id,
              'closed_date':close_at};
      Case.patch($scope,params);
      $('#EditCloseDate').modal('hide');
     };


//HKA 11.03.2014 Add Custom field

    $scope.addCustomField = function(customField){
      console.log('*****************************');
      console.log(customField);
      params = {
                'parent':$scope.casee.entityKey,
                'kind':'customfields',
                'fields':[
                  {
                    "field": customField.field,
                    "value": customField.value
                  }
                  ]
              };


    InfoNode.insert($scope,params);
    $scope.customfield={};
    $scope.showCustomFieldForm = false;

};

$scope.listInfonodes = function(kind) {
     params = {
               'parent':$scope.casee.entityKey,
               'connections': kind
              };
      console.log('-----Listing infonodes----');
      console.log(params);

     InfoNode.list($scope,params);

 };

 // HKA 19.03.2014 inline update infonode
     $scope.inlinePatch=function(kind,edge,name,entityKey,value){

   if (kind=='Case') {
          params = {'id':$scope.casee.id,
             name:value}
         Case.patch($scope,params);}
       };

  // HKA 26.05.2014 return URL topic
  $scope.getTopicUrl = function(type,id){
      return Topic.getUrl(type,id);
    };
    $scope.waterfallTrigger= function(){


          /* $('.waterfall').hide();
         $('.waterfall').show();*/
         $( window ).trigger( "resize" );
         if($(".chart").parent().width()==0){
          var leftMargin=210-$(".chart").width();
                 $(".chart").css( "left",leftMargin/2);
                 $(".oppStage").css( "left",leftMargin/2-2);
         }else{
             var leftMargin=$(".chart").parent().width()-$(".chart").width();
                 $(".chart").css( "left",leftMargin/2);
                 $(".oppStage").css( "left",leftMargin/2-2);

         }
    };

     $scope.listMoreOnScroll = function(){
       switch ($scope.selectedTab)
           {

           case 7:
             $scope.DocumentlistNextPageItems();
             break;
           case 1:
             $scope.TopiclistNextPageItems();
             break;

           }
     };
    // LBA 27-10-2014
    $scope.DeleteCollaborator=function(entityKey){
            console.log("delete collaborators")
            var item = {
                          'type':"user",
                          'value':entityKey,
                          'about':$scope.casee.entityKey
                        };
            Permission.delete($scope,item)
            console.log(item)
        };
    // Google+ Authentication
    Auth.init($scope);
    $(window).scroll(function() {
         if (!$scope.isLoading && ($(window).scrollTop() >  $(document).height() - $(window).height() - 100)) {
             $scope.listMoreOnScroll();
         }
     });
}]);

app.controller('CaseNewCtrl', ['$scope','Auth','Casestatus','Case', 'Account','Contact',
    function($scope,Auth,Casestatus,Case,Account,Contact) {
      document.title = "Cases: Home";
      $("ul.page-sidebar-menu li").removeClass("active");
      $("#id_Cases").addClass("active");
      $scope.isSignedIn = false;
      $scope.immediateFailed = false;
      $scope.nextPageToken = undefined;
      $scope.prevPageToken = undefined;
      $scope.isLoading = false;
      $scope.nbLoads=0;
      $scope.pagination = {};
      $scope.currentPage = 01;
      $scope.pages = [];
      $scope.stage_selected={};
      $scope.contacts = [];
      $scope.casee = {};
      $scope.order = '-updated_at';
      $scope.showPhoneForm=false;
      $scope.showEmailForm=false;
      $scope.showWebsiteForm=false;
      $scope.showSociallinkForm=false;
      $scope.showCustomFieldForm =false;
      $scope.phones=[];
      $scope.addresses=[];
      $scope.emails=[];
      $scope.websites=[];
      $scope.sociallinks=[];
      $scope.customfields=[];
      $scope.results=[];
      $scope.imageSrc = '/static/img/default_company.png';
      $scope.casee = {
                      'access': 'public',
                      'priority':4
                    };
     $scope.case_err={
                      'name':false,
                      'account':false,
                      'contact':false,
                      };
      $scope.inProcess=function(varBool,message){
          if (varBool) {           
            if (message) {
              console.log("starts of :"+message);
            };
            $scope.nbLoads=$scope.nbLoads+1;
            if ($scope.nbLoads==1) {
              $scope.isLoading=true;
            };
          }else{
            if (message) {
              console.log("ends of :"+message);
            };
            $scope.nbLoads=$scope.nbLoads-1;
            if ($scope.nbLoads==0) {
               $scope.isLoading=false;
 
            };

          };
        }        
        $scope.apply=function(){
         
          if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
               $scope.$apply();
              }
              return false;
        }
      $scope.status_selected={};
      $scope.initObject=function(obj){
          for (var key in obj) {
                obj[key]=null;
              }
      }
      $scope.pushElement=function(elem,arr){
          if (arr.indexOf(elem) == -1) {
            if (elem.field && elem.value) {
              var copyOfElement = angular.copy(elem);
              arr.push(copyOfElement);
              console.log(elem);
              $scope.initObject(elem);}

          }else{
            alert("item already exit");
          }
      }
      $scope.runTheProcess = function(){
          Casestatus.list($scope,{});
          ga('send', 'pageview', '/cases/new');
          window.Intercom('update');
      };
        // We need to call this to refresh token when user credentials are invalid
       $scope.refreshToken = function() {
            Auth.refreshToken();
       };

       $scope.accountInserted = function(resp){
          $scope.contact.account = resp;
          $scope.save($scope.contact);
      };

       var params_search_account ={};
       $scope.result = undefined;
       $scope.q = undefined;
       $scope.$watch('searchAccountQuery', function() {
            console.log('i am searching');
           params_search_account['q'] = $scope.searchAccountQuery;
           Account.search($scope,params_search_account);

        });
        $scope.selectAccount = function(){
          $scope.contact.account = $scope.searchAccountQuery;

       };
       $scope.accountInserted = function(resp){
          console.log('account inserted ok');
          console.log(resp);
          $scope.contact.account = resp;
          $scope.save($scope.contact);
      };



      var params_search_contact ={};
      $scope.$watch('searchContactQuery', function() {
        if($scope.searchContactQuery){
            if($scope.searchContactQuery.length>1){
              params_search_contact['q'] = $scope.searchContactQuery;
              gapi.client.crmengine.contacts.search(params_search_contact).execute(function(resp) {
                if (resp.items){
                $scope.contactsResults = resp.items;
                $scope.apply();
              };
            });
          }
        }
      });
     $scope.selectContact = function(){
        console.log($scope.searchContactQuery);
        $scope.casee.contact = $scope.searchContactQuery;
        var account = {'entityKey':$scope.searchContactQuery.account.entityKey,
                      'name':$scope.searchContactQuery.account.name};
        $scope.casee.account = account;
        $scope.searchAccountQuery = $scope.searchContactQuery.account.name;
      };

      var params_search_account ={};
      $scope.result = undefined;
      $scope.q = undefined;
      $scope.$watch('searchAccountQuery', function() {
          params_search_account['q'] = $scope.searchAccountQuery;
          Account.search($scope,params_search_account);
      });

      $scope.selectAccount = function(){
          $scope.casee.account  = $scope.searchAccountQuery;
      };
      $scope.prepareInfonodes = function(){
        var infonodes = [];
        angular.forEach($scope.customfields, function(customfield){
            var infonode = {
                            'kind':'customfields',
                            'fields':[
                                    {
                                    'field':customfield.field,
                                    'value':customfield.value
                                    }
                            ]

                          };
            infonodes.push(infonode);
        });
        return infonodes;
    };
      $scope.save = function(casee){
        var hasContact = false;
        var hasAccount = false;
        casee.status = $scope.status_selected.entityKey;

        if (typeof(casee.account)=='object'){
            hasAccount = true;
            casee.account = casee.account.entityKey;
            if (typeof(casee.contact)=='object'){
                casee.contact = casee.contact.entityKey;
                hasContact = true;
            }
            else if($scope.searchContactQuery){
              if($scope.searchContactQuery.length>0){
                var firstName = $scope.searchContactQuery.split(' ').slice(0, -1).join(' ') || " ";
                var lastName = $scope.searchContactQuery.split(' ').slice(-1).join(' ') || " ";
                var params = {
                              'firstname':  firstName ,
                              'lastname': lastName ,
                              'account': casee.account,
                              'access': casee.access
                            };
                Contact.insert($scope,params);
              }
            };


        }else if($scope.searchAccountQuery.length>0){
            // create a new account with this account name
            var params = {
                          'name': $scope.searchAccountQuery,
                          'access': casee.access
                        };
            $scope.casee = casee;
            Account.insert($scope,params);
        };
        if (hasContact && hasAccount){
            casee.infonodes = $scope.prepareInfonodes();
            Case.insert($scope,casee);
        }else{
            // should highlight contact and account
        }

      };
      $scope.$watch('casee', function(newVal, oldVal){
          if (newVal.name)  $scope.case_err.name=false;
      }, true); 
      $scope.$watch('searchAccountQuery', function(newVal, oldVal){
          if (newVal )$scope.case_err.account =false;
      });   
      $scope.$watch('searchContactQuery', function(newVal, oldVal){
          if (newVal )$scope.case_err.contact =false;
      });
      
      $scope.validateBeforeSave=function(casee){
           if (!casee.name) $scope.case_err.name=true;
            else $scope.case_err.name=false;  
          if (!$scope.searchAccountQuery) $scope.case_err.account=true;
            else $scope.case_err.account=false;
          if (!$scope.searchContactQuery) $scope.case_err.contact=true;
            else $scope.case_err.contact=false;
          if (!($scope.case_err.name && ($scope.case_err.account||$scope.case_err.contact)  )) $scope.save(casee)
      }
      $scope.accountInserted = function(resp){
          $scope.casee.account = resp;
          $scope.save($scope.casee);
      };
      $scope.contactInserted = function(resp){
          $scope.casee.contact = resp;
          $scope.save($scope.casee);
      }
      $scope.caseInserted = function(resp){
          window.location.replace('#/cases');
      }






   // Google+ Authentication
     Auth.init($scope);
}]);
