/*app.directive('editTooltip', function() {
  return {
    restrict: 'A',
    require:'?ngModel',
    link: function ($scope, elem, attrs,ngModel) {
     var field=$(elem);
     var position=field.position();
    console.log("woooooooooooo");
        field.hover(function() {
          console.log('test hover');
          $(this).append('<div class="cusTooltip" id="inlineEditTooltip"><a href=""><i class="fa fa-trash-o"></i></a><a href="">edit</a></div>');   
          $('#inlineEditTooltip').css('top', position.top);
          $('#inlineEditTooltip').css('left', position.left - 59 );
        });
  }
}});*/
app.directive('edittooltip',  function() {
   return {
    restrict: 'A',
    require:'?ngModel',
    link: function ($scope, elem, attrs,ngModel) {
     var field=$(elem);
     field.popover({
          html: true,
          placement: 'auto',
          delay: {show: 50, hide: 400},
          trigger:'click hover',
          content: '<div class="customTip"><span id="inlineDeleteElement" ><i class="fa fa-trash-o"></i></span><span  id="inlineEditElement">edit</span></div>'
      }).parent().on('click', '#inlineEditElement', function() {
          /*$scope.textBtnForm.$show();*/
          console.log("e-form");
          var item=field.attr('e-form');
          $scope[item].$show();
      }).on('click', '#inlineDeleteElement', function() {
          $scope.beforedeleteInfonde();
      });
  }
}});
app.directive('ngBlur', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngBlur']);
    element.bind('blur', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  }
}]);
app.directive('ngEnter', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngBlur']);
    element.bind("keydown keypress", function(event) {
       if(event.which === 13) {
          scope.$apply(function() {
            fn(scope, {$event:event});
          });
       }
    });
  }
}]);
/*app.directive('cuscheckbox', function () {
  return {
    restrict: 'A',
    link: function(scope, element) {
     if (jQuery().uniform) {
              var el=$(element)
              if (el.parents(".checker").size() == 0) {
                  $(el).show();
                  $(el).uniform();
              }
     };
     scope.$watch
     
    }
  }
});*/
/*app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                        scope.$apply(function(){
                                scope.$eval(attrs.ngEnter);
                        });
                        
                        event.preventDefault();
                }
            });
        };
});*/
app.directive('currency',  function() {
  return {
    restrict: 'A',
    require:'?ngModel',
    link: function ($scope, elem, attrs,ngModel) {

        var all_currency=[
                  {"value":"USD" , "symbol":"$"},
                  {"value":"EUR", "symbol":"€"},
                  {"value":"CAD", "symbol":"$"},
                  {"value":"GBP", "symbol":"£"},
                  {"value":"AUD", "symbol":"$"},
                  {"value":"", "symbol":""},
                  {"value":"AED", "symbol":"د.إ"},
                  {"value":"ANG", "symbol":"ƒ"},
                  {"value":"AOA", "symbol":"AOA"},
                  {"value":"ARS", "symbol":"$"},
                  {"value":"BAM", "symbol":"KM"},
                  {"value":"BBD", "symbol":"$"},
                  {"value":"BGL", "symbol":"лв"},
                  {"value":"BHD", "symbol":"BD"},
                  {"value":"BND", "symbol":"$"},
                  {"value":"BRL", "symbol":"R$"},
                  {"value":"BTC", "symbol":"฿"},
                  {"value":"CHF", "symbol":"Fr"},
                  {"value":"CLF", "symbol":"UF"},
                  {"value":"CLP", "symbol":"$"},
                  {"value":"CNY", "symbol":"¥"},
                  {"value":"COP", "symbol":"$"},
                  {"value":"CRC", "symbol":"₡"},
                  {"value":"CZK", "symbol":"Kč"},
                  {"value":"DKK", "symbol":"kr"},
                  {"value":"EEK", "symbol":"KR"},
                  {"value":"EGP", "symbol":"E£"},
                  {"value":"FJD", "symbol":"FJ$"},
                  {"value":"GTQ", "symbol":"Q"},
                  {"value":"HKD", "symbol":"$"},
                  {"value":"HRK", "symbol":"kn"},
                  {"value":"HUF", "symbol":"Ft"},
                  {"value":"IDR", "symbol":"Rp"},
                  {"value":"ILS", "symbol":"₪"},
                  {"value":"INR", "symbol":"₨"},
                  {"value":"IRR", "symbol":"ریال"},
                  {"value":"ISK", "symbol":"kr"},
                  {"value":"JOD", "symbol":"د.ا"},
                  {"value":"JPY", "symbol":"¥"},
                  {"value":"KES", "symbol":"KSh"},
                  {"value":"KRW", "symbol":"₩"},
                  {"value":"KWD", "symbol":"KD"},
                  {"value":"KYD", "symbol":"$"},
                  {"value":"LTL", "symbol":"Lt"},
                  {"value":"LVL", "symbol":"Ls"},
                  {"value":"MAD", "symbol":"د.م."},
                  {"value":"MVR", "symbol":"Rf"},
                  {"value":"MXN", "symbol":"$"},
                  {"value":"MYR", "symbol":"RM"},
                  {"value":"NGN", "symbol":"₦"},
                  {"value":"NOK", "symbol":"kr"},
                  {"value":"NZD", "symbol":"$"},
                  {"value":"OMR", "symbol":"ر.ع"},
                  {"value":"PEN", "symbol":"S/."},
                  {"value":"PHP", "symbol":"₱"},
                  {"value":"PLN", "symbol":"zł"},
                  {"value":"QAR", "symbol":"ر.ق"},
                  {"value":"RON", "symbol":"L"},
                  {"value":"RUB", "symbol":"руб."},
                  {"value":"SAR", "symbol":"ر.س"},
                  {"value":"SEK", "symbol":"kr"},
                  {"value":"SGD", "symbol":"$"},
                  {"value":"THB", "symbol":"฿"},
                  {"value":"TRY", "symbol":"TL"},
                  {"value":"TTD", "symbol":"$"},
                  {"value":"TWD", "symbol":"$"},
                  {"value":"UAH", "symbol":"₴"},
                  {"value":"VEF", "symbol":"Bs F"},
                  {"value":"VND", "symbol":"₫"},
                  {"value":"XCD", "symbol":"$"},
                  {"value":"ZAR", "symbol":"R"}];
          $.each(all_currency, function (i, item) {
            $(elem).append('<option value='+item.value+'>'+item.symbol+ " - "+item.value+'</option>');
          });

     }
}});
app.directive('amount', function() {
    return {
      restrict: 'A',
      require:'?ngModel',
      link: function ($scope, elem, attrs,ngModel) {
        var field=$(elem);
        field.blur(function() {
          var value=$(this).val();
         $(this).val(value.replace(/\./g, ''));     
        });
        field.focus(function() {
          var value=$(this).val();
          $(this).val(numberWithCommas(value));
        });
        field.keyup(function() {
          var value=$(this).val();
          $(this).val(numberWithCommas(value));
        });
        function numberWithCommas(n) {
          var par=n.toString().split(",");
          n=par[0];
          n= n.replace(/\./g, '');
          n=n.replace(/,/g, '');
          var parts=n.toString().split(".");
            return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (parts[1] ? "," + parts[1] : "");
        }
      }
 }
});
app.directive('ngDrag', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngDrag']);
    element.bind('drag', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  }
}]);
app.directive('ngDrop', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngDrop']);
    element.bind('drop', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  }
}]);
app.directive('draggable', function() {
   return function(scope, element) {
        // this gives us the native JS object
        var el = element[0];

        el.draggable = true;

        el.addEventListener(
            'dragstart',
            function(e) {
              /* var ell=$(el).closest(".cardElement");
                var position=$(ell).position();
                                console.log(position);
                ell.offset({ top: (15-position.top), left: (15-position.left)});
                var position=$(ell).position();
                                console.log(position);*/
               /* $(el).css({"position":"absolute"});*/
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('Text', this.id);
                this.classList.add('drag');
                return false;
            },
            false
        );

        el.addEventListener(
            'dragend',
            function(e) {
                this.classList.remove('drag');
                return false;
            },
            false
        );
        el.addEventListener(
            'drop',
            function(e) {
                // Stops some browsers from redirecting.
                if (e.stopPropagation) e.stopPropagation();

                this.classList.remove('over');

                //var item = document.getElementById(e.dataTransfer.getData('Text'));
                //this.appendChild(item);

                return false;
            },
            false
        );
    }
});

app.directive('droppable', function() {
    return function(scope, element) {
        var el = element[0];
        el.addEventListener(
            'dragover',
            function(e) {
                e.dataTransfer.dropEffect = 'move';
                // allows us to drop
                if (e.preventDefault) e.preventDefault();
                this.classList.add('over');
                return false;
            },
            false
        );
        el.addEventListener(
            'dragenter',
            function(e) {
                this.classList.add('over');
                return false;
            },
            false
        );

        el.addEventListener(
            'dragleave',
            function(e) {
                this.classList.remove('over');
                return false;
            },
            false
        );
        el.addEventListener(
            'drop',
            function(e) {
                // Stops some browsers from redirecting.
                if (e.stopPropagation) e.stopPropagation();

                this.classList.remove('over');

                //var item = document.getElementById(e.dataTransfer.getData('Text'));
                //this.appendChild(item);

                return false;
            },
            false
        );
    }
});
app.directive('searchresult', function($compile) {
      return {
      restrict: 'A',
      require:'?ngModel',
       link: function($scope, element, attrs,ngModel) {
        console.log(attrs);
        var resultsName=attrs.results;
        console.log(resultsName);
        var items=$scope[resultsName];
        var index= parseInt(attrs.resultindex);
        console.log(items);
        var item=items[index];
        console.log(item);
        var  el= "";
        var elmnt=$(element);
        console.log("directiiiiiiiiive work");
        console.log(item.type);
          switch(item.type) {
            case 'Case':
                el='<li class="linkedinListItem withoutimgitem"><div class="pic"><i class="fa fa-suitcase"></i></div><div class="text"><ul class="list-group linkedinItemDetails"><li class="likedinItemName">'+item.title+'</li><li class="likedinItemType"><i class="fa fa-user"></i>Elon Musk</li><li class="likedinItemAddress"><i class="fa fa-building"></i>Tesla Motors</li><li class="likedinType"><span class="pull-right">Case</span></li></ul></div><div class="clearfix"></div></li>'
                $(elmnt).append(el);  
                console.log("Case");
                break;
            case 'Contact':
                 el='<div class="item-content"><div class="pic"><img src="https://pbs.twimg.com/profile_images/2912811960/15de2786cae224752bd52c4c50810d36_400x400.png" ></div><div class="text"><ul class="list-group linkedinItemDetails"><li class="likedinItemName">'+item.title+'</li><li class="likedinItemType">Customer Development &amp; Secret History, Teaching </li><li class="likedinItemAddress"><i class="fa fa-building"></i>Stanford, Berkeley and Columbia</li><li class="likedinType"><span class="pull-right">Contact</span></li></ul></div><div class="clearfix"></div></div>'; 
                $(elmnt).append(el); 
                console.log("Contact"); 
                break;
            case 'Lead':
                 el='<div class="item-content"><div class="pic"><img src="https://pbs.twimg.com/profile_images/2912811960/15de2786cae224752bd52c4c50810d36_400x400.png" ></div><div class="text"><ul class="list-group linkedinItemDetails"><li class="likedinItemName">'+item.title+'</li><li class="likedinItemType">Customer Development &amp; Secret History, Teaching </li><li class="likedinItemAddress"><i class="fa fa-building"></i>Stanford, Berkeley and Columbia</li><li class="likedinType"><span class="pull-right">Lead</span></li></ul></div><div class="clearfix"></div></div>'; 
                $(elmnt).append(el); 
                console.log("Contact"); 
                break;
            case 'Account':
                el='  <li class="linkedinListItem" ><div class="pic" ><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAB5CAMAAAAqJH57AAAAWlBMVEX/wwAAtPGRwwD4aCzz8/Pz9vf19Pf39fPJ4/LY6fP169j01Mv4WQDb5sn/vwDk69j04NuIvwD25skAr/Hz8evz7+0AqvH/uwDo7/Pt8Oj5SQCAuwD/wxqSwxnuQeATAAAA0UlEQVRoge3byQ6CMBhFYdQyyCCzgsP7v6alCXXtxaQxnLO/+dL1n0YmVNFu5VjJLROljzwWSqNdzpXSvMpxcS+FGvvquhV6VImXy5OQk49CLTIyMjIyMjIyMjIyMjIyMjIyMjIyMjLyjuTXJtmMjdJyuzG1kr/dbLlX6YW+0QWTp7PSskxzpWGV06w/CC10/oy+79IlP5AFGBkZGRkZGRkZGRkZGRkZGRkZGRkZGRn5D+VrL+Tki9DNy2bKlCa7HDolf7uxr1Zyy41/yoK0R/kN5dqvMsR/IbgAAAAASUVORK5CYII="></div><div class="text" ><ul class="list-group linkedinItemDetails" ><li class="likedinItemName" >'+item.title+'</li><li class="likedinItemType" >Logiciels informatiques</li><li class="likedinItemAddress" ><i class="fa fa-map-marker" ></i>Région de Seattle , États-Unis+ de 10 000 employés</li><li class="likedinType" ><span class="pull-right">Account</span></li></ul></div><div class="clearfix"></div></li>'
                $(elmnt).append(el);
                console.log("Account");
                break;
            case 'Task':
                 el='<li class="linkedinListItem withoutimgitem"><div class="pic"><i class="fa fa-check"></i></div><div class="text"><ul class="list-group linkedinItemDetails" ><li class="likedinItemName">'+item.title+'</li><li class="likedinItemType" ><i class="fa fa-user" ></i>Tedj, Yacine, Hakim</li><li class="likedinItemAddress" ><i class="fa fa-calendar" ></i>May 27th, 2015</li><li class="likedinType" ><span class="pull-right">Task</span></li></ul></div><div class="clearfix"></div></li>'
                 $(elmnt).append(el);  
                 console.log("Task");
                break;
            case 'Event':
                el='<li class="linkedinListItem withoutimgitem" ><div class="pic" ><i class="fa fa-calendar"></i></div><div class="text" ><ul class="list-group linkedinItemDetails" ><li class="likedinItemName" >'+item.title+'</li><li class="likedinItemType" ><i class="fa fa-calendar" ></i> May 27th–29th, 2015 </li><li class="likedinItemAddress" ><i class="fa fa-map-marker" ></i>Amelia Island, FL</li><li class="likedinType" ><span class="pull-right">Event</span></li></ul></div><div class="clearfix"></div></li>'
                $(elmnt).append(el);  
                 console.log("Event");
                break;
             case 'Opportunity':
                 el='<li class="linkedinListItem withoutimgitem" ><div class="pic" ><i class="fa fa-money"></i></div><div class="text" ><ul class="list-group linkedinItemDetails" ><li class="likedinItemName" >'+item.title+'</li><li class="likedinItemType" ><i class="fa fa-user" ></i>Satya Nadella</li><li class="likedinItemAddress" ><i class="fa fa-building" ></i>Microsoft</li><li class="likedinType" ><span class="pull-right">Opportunity</span></li></ul></div><div class="clearfix"></div></li>'
                 $(elmnt).append(el);  
                 console.log("Opportunity");
                break;
          }
    }
  }
});
app.directive('editoptions', function($compile) {
      return {
      restrict: 'A',
      require:'?ngModel',
       link: function($scope, element, attrs,ngModel) {
        $scope.data=attrs.editdataattr;
        $scope.showVariable=attrs.editshow;
        var element=$(element).parent();
        if($scope.editshow == 'undefined'){
            $(element).mouseenter(function() {
              console.log($scope.editshow);         
              if($(element).prop("tagName")=='LI'){
                    $(element).find(".page-meta").remove();
                     var edit = $(element).find("a[editable-text]" );
                     var trigger=$(edit).attr("e-form"); 
                    
                     var el = $compile('<span class="page-meta"><a  ng-hide="'+trigger+'.$visible" '+'ng-click="'+trigger+'.$show()'+'" class="btn-link addAnotherPhone"><i class="fa fa-pencil"></i></a></span>')($scope);
                     $(element).append(el);          
                      var el = $compile('<span class="page-meta"><a ng-hide="'+trigger+'.$visible" '+'ng-click="'+$scope.data+'"  class="btn-link addAnotherPhone"><i class="fa fa-trash-o"></i></a></span>')($scope);
                      $(element).append(el); 
               }
            });
             $(element).mouseleave(function() {
         
                  if($(element).prop("tagName")=='LI'){
                    $(element).find(".page-meta").remove();
                  }
            });
        }else{
          console.log("enter to else");
          if($(element).prop("tagName")=='LI'){
                    $(element).find(".page-meta").remove();
                     var edit = $(element).find("a[editable-text]" );
                     var trigger=$(edit).attr("e-form"); 
                    
                     var el = $compile('<span class="page-meta"><a  ng-show="'+$scope.showVariable +'" ng-click="'+trigger+'.$show()'+'" class="btn-link addAnotherPhone"><i class="fa fa-pencil"></i></a></span>')($scope);
                     $(element).append(el);          
                      var el = $compile('<span class="page-meta"><a ng-show="'+$scope.showVariable +'" ng-click="'+$scope.data+'"  class="btn-link addAnotherPhone"><i class="fa fa-trash-o"></i></a></span>')($scope);
                      $(element).append(el); 
               }
        };
        
    }
  }
});
app.directive('cusdatetimepicker', function($parse) {
      return {
      restrict: 'A',
      require:'?ngModel',
       link: function($scope, element, attrs,ngModel) {
        var dp = $(element);
        var params={
          "dateFormat": (attrs.dateFormat) ? attrs.dateFormat : "YY/MM/DD h:m",
          "closeOnSelected": (attrs.closeOnSelected=="false") ? false: true,
          "autodateOnStart": (attrs.autodateOnStart=="true") ? true: false,
          "onHide": function(handler){
                         model.assign($scope, dp.handleDtpicker('getDate'));
                         $scope.$apply();
          }

        }
        var model = $parse(attrs.model);
        dp.appendDtpicker(params);
        dp.val(null);
        $scope.$watch(attrs.model, function(newValue, oldValue) {
              if (newValue==null) {
                dp.val(null);
              };
        });
    }
  }
});
app.directive('gototext', function($parse) {
      return {
      scope: {
      'limit': '@',
      'text': '='
      },
      restrict: 'A',
      require:'?ngModel',
      link: function($scope, element, attrs,ngModel) {
          var limit = $scope.limit;
          var model = $scope.text;
          var ellipsestext = "...";
          console.log($scope.text);
          var moretext = attrs.moretext;
          var lesstext = attrs.lesstext;
          console.log($scope.moretext)
          if (model!=null) {
              console.log(model.length);
              if(model.length > limit) {
              var shortText = model.substr(0, limit);
              var h = model.substr(limit-1, model.length - limit);
              var cont = shortText + '<span class="moreelipses less">'+ellipsestext+'</span>&nbsp;<span class="morecontent more">' + h + '</span>&nbsp;&nbsp;<span><a href="" class="morelink">'+moretext+'</a></span>';
              $(element).html(cont);
            }
          /*  console.log(shortText);
            console.log(h);*/
            $(".morelink").click(function(){
              if($(".morelink").hasClass("less")) {
                $(this).removeClass("less");
                $(".morecontent").removeClass("less");
                $(".morecontent").addClass("more");
                $(".moreelipses").addClass("less");
                $(".moreelipses").removeClass("more");
                $(this).html(moretext);
              } else {
                $(this).addClass("less");        
                $(".moreelipses").addClass("more");
                $(".moreelipses").removeClass("less");
                $(".morecontent").removeClass("more");
                $(".morecontent").addClass("less");
                $(this).html(lesstext);
              }
              return false;
            });
          };
          
    }
  }
});
app.directive('taggable', ['$parse',function($parse) {
    return {
      restrict: 'A',
      require:'?ngModel',
      template: '<input typeahead="tag as tag.name  for tag in getSearchResult($viewValue) | filter:getSearchText($viewValue) | limitTo:8" typeahead-on-select="selectItem(<%=modelName%>)"/>',
      replace: true,

      link: function ($scope, elem, attrs,ngModel) {
        $scope.modelName=attrs.ngModel;
        $scope.attribute='name';
        $scope.currentAttribute='name';
        $scope.objectName='user';
        $scope.tagInfo=$scope[attrs.taggabledata];
        $scope.newTaskValue=null;
        function ReturnWord(text, caretPos) {
              var preText =text, posText =text, wordsBefore=[], wordsAfter=[], pre='', post='';
                preText = preText.substring(0, caretPos);
                wordsBefore= preText.split(" ");
                pre = wordsBefore[wordsBefore.length - 1]; 
                posText = posText.substring(caretPos);
                wordsAfter = posText.split(" ");
                post = wordsAfter[0];
                wordsBefore.splice(wordsBefore.length - 1,1);
                wordsAfter.splice(0,1);
              return {
                before:wordsBefore.join(' '),
                after:wordsAfter.join(' '),
                word:pre+post
              }
          }
        $scope.getSearchText=function(value){
                $scope.pattern=null;
                $scope.newTaskText=$(elem).val();
                $scope.newTaskValue=ReturnWord($(elem).val(),$(elem).caret()).word;
                $scope.matchPattern=false;
                $scope.returnedValue=undefined;
                
                angular.forEach($scope.tagInfo, function(item){
                     if (item.tag=='#') {$scope.pattern = /^#([\w]*)/;}
                     if (item.tag=='@') {$scope.pattern = /^@([\w]*)/;};
                     if (item.tag=='!') {$scope.pattern = /^!([\w]*)/;};
                     var text=$scope.newTaskValue;
                     console.log(value);
                     console.log($scope.pattern);
                     console.log($scope.newTaskValue);
                     console.log($scope.newTaskValue);
                     
                     if($scope.pattern.test($scope.newTaskValue)){
                          console.log('fired');
                          $scope.returnedValue = text.replace($scope.pattern, "$1");
                          $scope.matchPattern=true;
                        }else{
                          console.log('not matchPattern');
                        }
                    });
                if ($scope.matchPattern) {
                  return $scope.returnedValue;
                }else{
                  return null;
                };  
            }
          $scope.getSearchResult=function(value){
               
                if($scope.getSearchText(value)!=null){
                  var text= ReturnWord($(elem).val(),$(elem).caret()).word;
                  var tag= text.substring(0,1);
                  $scope.datar={};
                  angular.forEach($scope.tagInfo, function(item){
                    if (item.tag==tag) {
                      $scope.data=$scope[item.data.name];
                      $scope.currentAttribute=item.data.attribute;
                      $scope.datar=$scope.data;
                          angular.forEach($scope.datar, function(itm){
                          if (!itm.hasOwnProperty('name')) {
                                    itm.name = itm[$scope.currentAttribute];
                                }
                          }); 
                          $scope.objectName=item.data.name;
                      };
                    });
                  return $scope.datar;
                  }else{
                     return [];
                  }
          }
        $scope.selectItem = function(value){
          console.log("fired");
         console.log($scope.modelName); 
          angular.forEach($scope.tagInfo, function(item){
              if (item.data.name==$scope.objectName) {
                  console.log(value);
                  if ($scope.currentAttribute!='name') {
                      delete value["value"];
                  };
                  if (item.selected.indexOf(value) == -1) {
                   item.selected.push(value);
                   }
                  var text= ReturnWord($(elem).val(),$(elem).caret()).word;
                  var beforeText= ReturnWord($(elem).val(),$(elem).caret()).before;
                  var afterText= ReturnWord($(elem).val(),$(elem).caret()).after;
                  var tag= text.substring(0,1);
                  $parse(attrs.ngModel).assign($scope, beforeText+' '+tag+value[item.data.attribute]+' '+afterText);
                  console.log($parse(attrs.ngModel).assign($scope, beforeText+' '+tag+value[item.data.attribute]+' '+afterText));
              }; 
           });
           
         };

      }
  }
}]);
app.directive('fittext', function($timeout) {
  'use strict';

  return {
    scope: {
      minFontSize: '@',
      maxFontSize: '@',
      fontt: '@',
      text: '@',
      firstname: '=',
      lastname: '=',
    },
    restrict: 'C',
    transclude: true,
    template: '<span ng-transclude class="textContainer" ng-bind="text"></span>',
    controller: function($scope, $element, $attrs) {
      var maxFontSize = $scope.maxFontSize || 50;
      var minFontSize = $scope.minFontSize || 8;
      // text container
      var textContainer = $element[0].querySelector('.textContainer');

      // max dimensions for text container
      var maxHeight = $element[0].offsetHeight;
      var maxWidth = $element[0].offsetWidth;

      var textContainerHeight;
      var textContainerWidth;
      var fontSize = maxFontSize;

      var resizeText = function(){
        $timeout(function(){
          // set new font size and determine resulting dimensions
          textContainer.style.fontSize = fontSize + 'px';
          textContainerHeight = textContainer.offsetHeight;
          textContainerWidth = textContainer.offsetWidth;

          if((textContainerHeight > maxHeight || textContainerWidth > maxWidth) && fontSize > minFontSize){

            // shrink font size
            var ratioHeight = Math.floor(textContainerHeight / maxHeight);
            var ratioWidth = Math.floor(textContainerWidth / maxWidth);
            var shrinkFactor = ratioHeight > ratioWidth ? ratioHeight : ratioWidth;
            fontSize -= shrinkFactor;
            // console.log("fontSize", fontSize);
            resizeText();
          }else{
            /*textContainer.style.visibility = "visible";*/
          }
        }, 0);
      };

      // watch for changes to text
      $scope.$watch('text', function(newText, oldText){
        if(newText === undefined) return;

        // text was deleted
        if(oldText !== undefined && newText.length < oldText.length){
          fontSize = maxFontSize;
           console.log("Letter was deleted");
        }
        /*textContainer.style.visibility = "hidden";*/
        resizeText();
      });
    }
  };
});

app.directive('parseUrl', function () {
    console.log('work');
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
    return {
        restrict: 'A',
        require: 'ngModel',
        replace: true,
        scope: {
            props: '=parseUrl',
            ngModel: '=ngModel'
        },
        link: function compile(scope, element, attrs, controller) {
            scope.$watch('ngModel', function (value) {
                var match = urlPattern.exec(value);
                var test0=match[0];
                console.log(match);                                
                var html = value.replace(urlPattern, '<a target="' + scope.props.target + '" href="$&">$&</a>') + " | " + scope.props.otherProp;
                element.html(html);
            });
        }
    };
});
app.directive('stopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
            }
        };
     });