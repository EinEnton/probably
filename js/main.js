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
                style:"red"
            },
            {
                title:"Let's go",
                description:"another blabla and text and stuff",
                style:"blue"
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
                title:"Pay for the hamburger",
                description:"I will gladly pay you",
                repetition:"weekly on Tuesday"
            },
            {
                title:"Eat an apple",
                description:"it keeps the doctor away",
                repetition:"daily"
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


// random title generator
var titles = ['a task manager', 'what you will do today', 'you\'ll need a few more cards', 'something to do'];

function getRandomFromArray(array) {
    var index = Math.floor(Math.random() * (array.length));
    return array[index];
}

var newTitle = getRandomFromArray(titles);
$('title').text('Probably ' + newTitle);
$('#innerTitle').text(newTitle);

/*the app*/

var DefaultCard = function(){this.title="New Card"; this.description="Description";this.style="default";};

var probablyMain=angular.module('probablyMain',['ui.sortable',"ngStorage"]);
probablyMain.directive('pbEnterBlur', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                $(element).blur();

                event.preventDefault();
            }
        });
    };
});
var definedStyles=["red","blue","green","yellow","gray"];

var mainController=probablyMain.controller("mainController",["$scope","$timeout","$localStorage",
    function($scope,$timeout,$localStorage){
        $scope.board=$localStorage.$default(boardModel);
        $scope.allStyles=definedStyles;

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

            //stopEdit(-1) --> stop all the edits
            if((colIndex==-1) || ($scope.editColIndex==colIndex &&
            $scope.editCardIndex==cardIndex&&
            $scope.editMode==mode))
            {
                $scope.editColIndex=-1;
                $scope.editCardIndex=-1;
                $scope.editMode=-1;
            }


        };

        $scope.addCard=function(colIndex){
            $scope.board.columns[colIndex].cards.push(new DefaultCard());
            $timeout(function(){
                var newCardIndex=$scope.board.columns[colIndex].cards.length;
                $scope.startEdit(colIndex,newCardIndex,1);
            });
        };

        $scope.setStyle=function(card,style){

            card.style=style;
            $scope.stopEdit(-1);
        };

}
]);