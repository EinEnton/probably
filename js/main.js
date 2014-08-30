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
                repetition:"daily",
                repetitionTarget:"today"

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

function resetCard(sourceCol,card, targetColumn, board)
{
    var boardColumn=null;
    board.columns.forEach(function(col){
        if(col.caption==targetColumn)
            boardColumn=col;
    });
    if(boardColumn!=null)
    {
        var oldIndex=sourceCol.cards.indexOf(card);
        if (oldIndex > -1) {
            sourceCol.cards.splice(oldIndex, 1);
        }
        boardColumn.cards.push(card);
    }
}

function getLastWeekDay(day)
{
    var workDate= new Date(new Date().getTime());
    workDate.setMilliseconds(0);
    workDate.setHours(0);
    workDate.setSeconds();
    workDate.setMinutes(0);
    var weekDay=workDate.getDay();
    if(day!=weekDay)return workDate;
    if(day<weekDay)
    {
        return new Date(workDate.getTime()-1000*60*60*24*(day-weekDay));
    }
    else
    {
        return new Date(workDate.getTime()-1000*60*60*24*(day-weekDay-7));
    }
}

function getLastFullHour(time)
{
    var workDate= new Date();
    workDate.setMilliseconds(0);

    workDate.setSeconds();
    workDate.setMinutes(0);
   return workDate;
}

function processRepetitions(board,scope)
{
    var somethingChanged=false;
    var lastCheckDate=board.lastRepetitionCheckDate;
    if(lastCheckDate==undefined)
    {
        lastCheckDate=new Date(1000);//something quite early... it will trigger immediate processing of all repetitions
    }

    if(!(lastCheckDate instanceof Date))
    {
        lastCheckDate=new Date(lastCheckDate);
    }

    var currentDate=new Date();

    board.columns.forEach(function(col){
        col.cards.forEach(function(card){
            var reset=false;
            if(card.repetition)
            {
                if(card.repetition=="daily")
                {
                    if(lastCheckDate.toDateString()!=currentDate.toDateString())
                    {
                        reset=true;
                    }
                }
                else
                {

                    var weekDay=1;
                    switch (card.repetition)
                    {
                        case "sunday":weekDay=0;
                            break;
                        case "monday":weekDay=1;
                            break;
                        case "tuesday":weekDay=2;
                            break;
                        case "wednesday":weekDay=3;
                            break;
                        case "thursday":weekDay=4;
                            break;
                        case "friday":weekDay=5;
                            break;
                        case "saturday":weekDay=6;
                            break;
                    }

                    var lastwd=getLastWeekDay(weekDay);

                    if(lastCheckDate.toDateString()!=currentDate.toDateString() && (lastCheckDate<lastwd) )
                    {
                        reset=true;
                    }
                }


                if(reset)
                {
                    if(card.repetitionTarget!=col.caption)
                    {
                        resetCard(col,card,card.repetitionTarget,board);
                        somethingChanged=true;
                    }
                }
            }
        });
    });
    board.lastRepetitionCheckDate=currentDate;
    if(somethingChanged)
    {
        scope.$apply();
    }
}


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

var DefaultCard = function(){this.title="New Card"; this.description="";this.style="default";};

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

        window.setInterval(function(){processRepetitions($scope.board,$scope);},10000);

        $scope.allStyles=definedStyles;

        $scope.editColIndex=-1;
        $scope.editCardIndex=-1;
        $scope.editMode=-1;//1=title, 2=description
        $scope.searchFilter="";
        $scope.isInEditMode=function(colIndex,cardIndex,mode){
            return $scope.editColIndex==colIndex && $scope.editCardIndex==cardIndex && (mode==undefined || $scope.editMode==mode);
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

        $scope.setRepetition=function(card,targetColumn,repetitionMode){

            if(targetColumn=="" || repetitionMode=="")
            {
                card.repetition="";
                card.repetitionTarget="";
            }
            else
            {
                card.repetition=repetitionMode;
                card.repetitionTarget=targetColumn;
            }
            $scope.stopEdit(-1);
        };


}
]);