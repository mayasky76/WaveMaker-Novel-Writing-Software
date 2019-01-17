var cardColors=['default','#71cac4','#e2e647','#f49ebb','#fbad4b'];

function setupCardmanager() {
    cardToolsave = true;
    $("#app").load("html/cardmanager.html", function () {
        $('#app').append("<button id='addCardsManagerChapter' class='sideBtn'><i class='fa fa-plus'></i> Add Column</button><button type='button' id='toggleCompletedCardsCardEditor' class='sideBtn sideBtnSplit'><i class='fa fa-toggle-on'></i> Toggle </button>");
        $('.popover').popover('hide');
        GoCardManager();
    })
}

function GoCardManager() {
    if (!WaveMaker.writer) {
        WaveMaker.writer = {};
    }
    $('#cardmanager').html("");
    panelwidth = 0;
    $.each(WaveMaker.writer, function (key, value) {
        panelwidth = panelwidth + 370
        $("#cardmanager").append('<div id="' + key + '" class="cardsorter"><button class="addNewCard"><i class="fa fa-plus"></i></button><div class="CardmanagerTitle">' + WaveMaker.writer[key].title + '</div> <ul id="' + key + '_list" class="sortableCards connectedSortable"></ul> </div>');
        $.each(WaveMaker.writer[key].cards, function (cardID, currentCard) {

            addStyle = "";
            if (currentCard.completed) {
                addStyle=addStyle+" markAsDone " ;
            }
            if(currentCard.cardColor){
                    addStyle=addStyle+" color"+currentCard.cardColor+" " ;
            }

            $("#" + key + "_list").append('<li><div class="wmcard cardSelect ' + addStyle + '"  id="' + cardID + '" data-parent="' + key + '">  <button type="button" class="pull-right btn btn-danger btn-circle btn-xs deleteCard"><i class="fa fa-times" title="Delete this Section"></i></button>        <div class="wmcard-body">          <div class="wmcard-title">' + currentCard.cardtype + '</div>          <p class="wmcard-text">' + nl2br(currentCard.cardtext) + '</p>        </div>          <button class="smallButtons cardEdit" ><i class="fa fa-edit"></i></button><button class="smallButtons cardToggle pull-right" title="Toggle Card Off" ><i class="fa fa-check"></i></button>      </div>    </li>');

        })

    })
    $('#cardmanager').width(panelwidth + "px")

    // make all the cards sortable

    $(".sortableCards").sortable({
        connectWith: ".connectedSortable",
        update: function (event, ui) {
            sortableCardsUpdate(this.id)
        },
        receive: function (event, ui) {


            sortableCardsUpdate(ui.sender[0].id)

        }
    }).disableSelection();

    function sortableCardsUpdate(listRef) {
        SectionToUpdate = listRef.replace("_list", "")
        var newObj = {}
        var pos = 0
        $.each($("#" + listRef + ">li"), function () {
            var completed = false;
            if ($(this).find(".wmcard").hasClass("markAsDone")) { completed = true };

            newObj[$(this).find(".wmcard").attr("id")] = {
                "cardtype": $(this).find(".wmcard-title").text(),
                "cardtext": $(this).find(".wmcard-text").text(),
                "completed": completed,
                "position": pos
            }

            pos++;
        })


        WaveMaker.writer[SectionToUpdate].cards = newObj;

    }


    $("#addSection").unbind().click(function () {
        addEditorSection();
        GoCardManager();
    })

   CardManagerButtonsInit()

}



function CardManagerButtonsInit() {


    $("#addCardsManagerChapter").unbind().click(function () {

        addEditorSection();
        GoCardManager();
    })

    $("#addCard").unbind().click(function () {
        selectedCard = false;
        $("#CardModal").modal("show");
        $("#CardText").val("");
        autosize($('.texteditor'));
    })

    $(".addNewCard").unbind().click(function () {

        selectedSection = $(this).parent().attr("id");
        selectedCard = false;
        $("#CardModal").modal("show");
        $("#CardText").val("");
        $("#cardColorCoice").val('')
        autosize($('.texteditor'));
    })


    $('.cardToggle').unbind().click(function () {
        toggleCardDone($(this).parent());
    })


    $("#toggleCompletedCards").unbind().click(function () {
        toggleCards()
    })


    $("#toggleCompletedCardsCardEditor").unbind().click(function () {
        toggleCards()
    })

    $('.cardEdit').unbind().click(function () {
        selectedCard = $(this).parent().attr("id");
        selectedSection = $(this).parent().data("parent")
        $("#CardType").val(WaveMaker.writer[selectedSection].cards[selectedCard].cardtype);
        $("#CardText").val(WaveMaker.writer[selectedSection].cards[selectedCard].cardtext);
        $("#cardColorCoice").val(WaveMaker.writer[selectedSection].cards[selectedCard].cardColor)
        $("#CardModal").modal("show");
        autosize($('.texteditor'));
        autosize.update($(".texteditor"));
    })



    $('.deleteCard').unbind().click(function (evt) {
        evt.stopPropagation();
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete it!'
        }).then((result) => {
            if (result.value) {
                kill = $(this).parent().attr("id")
                section = $(this).parent().data("parent")
                $("#" + kill).remove()
                delete WaveMaker.writer[section].cards[kill];
                //setupRightHandSide()
                swal(
                    'Deleted!',
                    'Your Card has been deleted.',
                    'success'
                )
            }
        })
    })

}


function saveCard() {
    //console.log(selectedSection)
    cardsObj = WaveMaker.writer[selectedSection].cards;
    type = $("#CardType").val();
    text = $("#CardText").val();
    color = $("#cardColorCoice").val();
    if (!selectedCard) {
        timestamp = new Date().getTime() + "" + new Date().getUTCMilliseconds();
        cardsObj["card_" + timestamp] = {
            cardtype: type,
            cardtext: text,
            cardColor: color,
            position: Object.size(cardsObj)
        }
    } else {
        cardsObj[selectedCard].cardtype = type
        cardsObj[selectedCard].cardtext = text
        cardsObj[selectedCard].cardColor = color
    }
    $("#" + selectedCard).find(".wmcard-title").html(type)
    $("#" + selectedCard).find(".wmcard-text").html(nl2br(text))
    selectedCard = false;
    $("#CardModal").modal("hide")

    $('.modal-backdrop').remove();

    if (cardToolsave) {
        GoCardManager();
    } else {
        setupRightHandSide()
    }
}


function toggleCardDone(mycard) {
    myref = mycard.attr("id")
    myparent = mycard.data("parent")
    if ($("#" + myref).hasClass("markAsDone")) {
        $("#" + myref).removeClass("markAsDone")
        WaveMaker.writer[myparent].cards[myref].completed = false
    } else {
        $("#" + myref).addClass("markAsDone")
        WaveMaker.writer[myparent].cards[myref].completed = true
    }
    updatecompletedcards();
}


function toggleCards() {
    showcompletedcards = !showcompletedcards;
    updatecompletedcards()
}



function updatecompletedcards() {
    if (showcompletedcards) {
        $(".markAsDone").slideDown();
    } else {
        $(".markAsDone").slideUp();
    }
}


$(".CardsColourPickerButton").unbind().click(function () {
    $("#cardColorCoice").val($(this).data("color"))
})
