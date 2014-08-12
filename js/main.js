/**
 * Created by Christian on 10.08.14.
 */

/* model */
var boardModel={"columns":[
    {
        caption:"backlog",
        cards:[
            {
                title:"Hey ho",
                description:"some blabla and text and stuff",
                color:"red"
            },
            {
                title:"Let's go",
                description:"another blabla and text and stuff"
            },
            {
                title:"enough",
                description:"lorem ipsum argh.."
            }
        ]
    },
    {
        caption:"today",
        cards:[
            {
                title:"Hey ho",
                description:"some blabla and text and stuff"
            },
            {
                title:"Let's go",
                description:"another blabla and text and stuff"
            },
            {
                title:"enough",
                description:"lorem ipsum argh.."
            }
        ]
    },
    {
        caption:"doing",
        cards:[
            {
                title:"Hey ho",
                description:"some blabla and text and stuff"
            },
            {
                title:"Let's go",
                description:"another blabla and text and stuff"
            },
            {
                title:"enough",
                description:"lorem ipsum argh.."
            }
        ]
    },
    {
        caption:"done",
        cards:[
            {
                title:"Hey ho",
                description:"some blabla and text and stuff"
            },
            {
                title:"Let's go",
                description:"another blabla and text and stuff"
            },
            {
                title:"enough",
                description:"lorem ipsum argh.."
            }
        ]
    }
]};

/*some helpers*/
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};


// random title generator
var titles = ['a task manager', 'what you will do today', 'you\'ll need a few more cards'];

function getRandomFromArray(array) {
    var index = Math.floor(Math.random() * (array.length));
    return array[index];
}
$('title').text('Probably ' + getRandomFromArray(titles));

/*the app*/


var probablyMain=angular.module('probablyMain',['ui.sortable',"ngStorage"]);

var mainController=probablyMain.controller("mainController",["$scope","$timeout","$localStorage",
    function($scope,$timeout,$localStorage){
        $scope.board=$localStorage.$default(boardModel);
        $scope.editColIndex=-1;
        $scope.editCardIndex=-1;
        $scope.editMode=-1;//1=title, 2=description
        $scope.searchFilter="";
        $scope.isInEditMode=function(colIndex,cardIndex,mode){
            return $scope.editColIndex==colIndex && $scope.editCardIndex==cardIndex && $scope.editMode==mode;
        };

        $scope.deleteCard=function(colIndex,cardIndex){
            $scope.board.columns[colIndex].cards.splice(cardIndex,1);
        };

        $scope.deleteColumn=function(colIndex){
            $scope.board.columns.splice(colIndex,1);
        };

        $scope.addColumn=function(){
            $scope.board.columns.push({caption:"new column",cards:[]});
        };

        var focusEditor=function(){
            $(".editor:visible").focus();
            $("input.editor:visible").select();
        };

        $scope.startEdit=function(colIndex,cardIndex,mode){
            $scope.editColIndex=colIndex;
            $scope.editCardIndex=cardIndex;
            $scope.editMode=mode;
            $timeout(function(){focusEditor();});
        };

        $scope.stopEdit=function(colIndex,cardIndex,mode){
            if($scope.editColIndex==colIndex &&
            $scope.editCardIndex==cardIndex&&
            $scope.editMode==mode)
            {
                $scope.editColIndex=-1;
                $scope.editCardIndex=-1;
                $scope.editMode=-1;
            }

        };

        $scope.addCard=function(colIndex){
            $scope.board.columns[colIndex].cards.push({'title':"New Card",'description':"Description"});
            $scope.startEdit(colIndex,$scope.board.columns[colIndex].cards.length);
        };

}
]);