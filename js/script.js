$(document).ready(function() {
    //Behaviour of heading menu buttons
    $(".btn-block__btn--add").click(function() {
        $(".menu-block").hide();
        $(".add-new-form").fadeIn();
    });
    
    $(".btn-block__btn--show").click(function() {
        $(".add-new-form").hide();
        $(".menu-block").fadeIn();
    });

    //Heading menu after scroll
    $(document).scroll(function() {
        var dist = $(this).scrollTop();

        if (dist > 100) {
            $(".heading-block").addClass("heading-block--scroll");
            $(".heading-block__logo").hide();
        }

        else {
            $(".heading-block").removeClass("heading-block--scroll");
            $(".heading-block__logo").show();
        }
    });

    //Selecting photo for a new pizza
    var pizzaPics = ["pizza1.jpg", "pizza2.jpg", "pizza3.jpg", "pizza4.jpg", "pizza5.jpg"];

    pizzaPics = pizzaPics.map(picPath => "img/pizza_pics/" + picPath);

    $(".photo-select__photo").attr("src", pizzaPics[0]); //setting a default pic on page load
    var picIdx = 0; //index of a selected picture

    $(".photo-select__btn--previous").click(function() {
        var pizzaPhoto = $(".photo-select__photo");

        if (picIdx == 0) {
            pizzaPhoto.attr("src", pizzaPics[4]);
            picIdx = 4;
        }
        else {
            pizzaPhoto.attr("src", pizzaPics[picIdx - 1]);
            picIdx -= 1;
        }
    });

    $(".photo-select__btn--next").click(function() {
        var pizzaPhoto = $(".photo-select__photo");

        if (picIdx == 4) {
            pizzaPhoto.attr("src", pizzaPics[0]);
            picIdx = 0;
        }
        else {
            pizzaPhoto.attr("src", pizzaPics[picIdx + 1]);
            picIdx += 1;
        }
    });


    //Additional topping fields
    $(".add-new-form__add-topping").click(function() {
        //Creating a new input field
        var toppingField            = document.createElement("input");
        toppingField.placeholder    = "Topping";
        toppingField.type           = "text";
        toppingField.name           = "toppings[]";
        toppingField.classList      = "add-new-form__input add-new-form__input--topping-select";

        //Adding field to the document
        $(".add-new-form__topping-list").append(toppingField);

    });

    //Class for creating pizza object
    class Pizza {
        constructor(pizzaName, price, heat, toppings, picIdx) {
            this.pizzaName  = pizzaName;
            this.price      = Number(price).toFixed(2);
            this.heat       = Number(heat);
            this.toppings   = toppings;
            this.picIdx     = picIdx;
        }

        picPath() {
            return pizzaPics[this.picIdx];
        }

        toppingsToStr() {
            var toppingsStr = "";
            for (let i in this.toppings) {
                if (i > 0) {
                    toppingsStr += ", ";
                }

                toppingsStr += this.toppings[i];
            }

            return toppingsStr;
        }

        priceCurrency(currency = "$") {
            return this.price + currency;
        }
    }

    //Getting saved menu from localStorage
    pizzasList = [];
    pizzasList = getPizzasListFromLocalStorage();

    refreshList();

    //Adding new pizza to the list
    $(".add-new-form__add-btn").click(function() {
        var pizzaName   = $(".add-new-form__input--name").val();
        var price       = Number($(".add-new-form__input--price").val());
        var heat        = Number($(".add-new-form__input--heat-select").val());
        var toppings    = [];
        $(".add-new-form__input--topping-select").each(function() {
            if(this.value != ""){
                toppings.push(this.value);
            }
        });

        let nameRepetition = false;

        //Checking if there already is pizza with the same name
        function nameRepeatCheck(pizza) {
            if (pizzaName == pizza.pizzaName) {
                nameRepetition = true;
            }
        }
        
        pizzasList.forEach(nameRepeatCheck);

        //Validating input
        if (pizzaName == "") {
            wrongInput("Pizza name must be specified!");
        }
        else if (nameRepetition == true) {
            wrongInput("Pizza name must be unique!");
        }
        else if (price == NaN || price <= 0) {
            wrongInput("Price must be a number greater than 0!");
        }
        else if (toppings.length < 2) {
            wrongInput("There must be at least 2 toppings!");
        }
        else {
            let pizza = new Pizza(pizzaName, price, heat, toppings, picIdx);
            pizzasList.push(pizza);
            
            //Adding new pizza to localStorage
            localStorage.setItem("pizzasList", JSON.stringify(pizzasList));

            refreshList();
            goodInput();
            inputDefaultValues();
        }

        //Scroll to message
        $(document.documentElement, document.body).animate({
            scrollTop: $(document).height()
        }, 1000);
    });

    //Remove pizza from menu

    $("body").on('click', '.pizza__remove-btn', function() {
        var pizzaToRemoveIdx = $(this).parent().index();
        console.log(pizzaToRemoveIdx);

        //Disable deleting other elements while deleting current
        $(".pizza__remove-btn").each(function(){
            $(this).attr("disabled", true);
        });

        var currentState = $(this).parent();

        //Asking user whether they really want to delete item
        $(this).parent().empty();
        var heading         = document.createElement("h2");
        heading.classList   = "pizza__caption";
        heading.innerText   = "Delete this?";
        currentState.append(heading);

        var yesBtn          = document.createElement("button");
        yesBtn.classList    = "pizza__remove-ask pizza__remove-ask--yes";
        yesBtn.innerText    = "Yes";
        currentState.append(yesBtn);

        var noBtn           = document.createElement("button");
        noBtn.classList     = "pizza__remove-ask pizza__remove-ask--no";
        noBtn.innerText     = "No";
        currentState.append(noBtn);

        //Yes button clicked
        $(".pizza__remove-ask--yes").click(function() {
            //Remove from array
            pizzasList.splice(pizzaToRemoveIdx, 1);
    
            //Refresh menu
            refreshList();
            
            //Record changes to localStorage
            localStorage.setItem("pizzasList", JSON.stringify(pizzasList));
        });

        //No button clicked
        $(".pizza__remove-ask--no").click(function() {
            refreshList();
        });
    });

    //---------Functions---------

    //Restore input fields default values
    function inputDefaultValues() {
        $(".add-new-form__input--name").val("");
        $(".add-new-form__input--price").val("");
        $(".add-new-form__input--heat-select").val(0);
        $(".photo-select__photo").attr("src", pizzaPics[0]);

        picIdx = 0;

        var toppingsList = [];
        toppingsList = $(".add-new-form__input--topping-select");

        toppingsList[0].value = "";
        toppingsList[1].value = "";

        for (let i = 2; i < toppingsList.length; i++) {
            toppingsList[i].remove();
        }

    }

    //Refresh pizzas menu
    function refreshList () {
        //Message if the menu is empty
        if (pizzasList.length == 0) {
            $(".menu-block").empty();

            let noItems = document.createElement("div");

            let noItemsText1        = document.createElement("p");
            noItemsText1.innerText  = "There are no pizzas yet :(";
            noItemsText1.classList  = "pizza__no-items-text";
            $(".menu-block").append(noItemsText1);

            let noItemsPic          = document.createElement("img");
            noItemsPic.src          = "img/pizza_logo_black.svg";
            noItemsPic.width        = "200";
            noItemsPic.height       = "200";
            noItemsPic.classList    = "pizza__no-items-pic";
            $(".menu-block").append(noItemsPic);

            let noItemsText2        = document.createElement("p");
            noItemsText2.innerText  = "But you can add some right now!";
            noItemsText2.classList  = "pizza__no-items-text";
            $(".menu-block").append(noItemsText2);
        }

        else {
            $(".menu-block").empty();

            for (let i in pizzasList) {
                var newPizza        = document.createElement("div");
                newPizza.classList  = "pizza";
    
                var heading         = document.createElement("h2");
                heading.classList   = "pizza__caption";
                heading.innerText   = pizzasList[i].pizzaName;
                newPizza.append(heading);
    
                var photo           = document.createElement("img");
                photo.classList     = "pizza__photo";
                photo.src           = pizzasList[i].picPath();
                newPizza.append(photo);
    
                var heat            = document.createElement("div");
                heat.classList      = "pizza__heat";
                for (let j = 0; j < pizzasList[i].heat; j++) {
                    var heatPic     = document.createElement("img");
                    heatPic.src     = "img/chilli.svg";
                    heatPic.alt     = "Chilli pepper";
                    heatPic.width   = "20";
                    heatPic.height  = "20";
                    heat.append(heatPic);
                }
                newPizza.append(heat);
    
                var toppings        = document.createElement("p");
                toppings.classList  = "pizza__toppings";
                toppings.innerText  = pizzasList[i].toppingsToStr();
                newPizza.append(toppings);
    
                var price           = document.createElement("p");
                price.classList     = "pizza__price";
                price.innerText     = pizzasList[i].priceCurrency("$");
                newPizza.append(price);
    
                var removeBtn           = document.createElement("button");
                removeBtn.classList     = "pizza__remove-btn";
                removeBtn.innerText     = "Remove";
                newPizza.append(removeBtn);
    
                $(".menu-block").append(newPizza);
            }
        }
    }

    //Get items from localStorage
    function getPizzasListFromLocalStorage () {
        var pizzas = [];

        if (localStorage.getItem("pizzasList") != null) {
            pizzas = JSON.parse(localStorage.getItem("pizzasList"));
        }

        var pizzasClass = [];
        var pizzaClass;
        
        for (let i in pizzas) {
            pizzaClass = new Pizza(pizzas[i].pizzaName, pizzas[i].price, pizzas[i].heat,
                                        pizzas[i].toppings, pizzas[i].picIdx);

            pizzasClass.push(pizzaClass);
        }

        return pizzasClass;
    }

    //Display info about an input mistake
    function wrongInput (message) {
        var msgBlock        = document.createElement("div");
        msgBlock.classList  = "add-new-form__msg-block msg-block";
        msgBlock.id         = "msg";

        var img     = document.createElement("img");
        img.src     = "img/cross.svg";
        img.width   = "40";
        img.height  = "40";
        msgBlock.append(img);

        var p           = document.createElement("p");
        p.innerText     = message;
        msgBlock.append(p);

        $(msgBlock).hide().appendTo($(".add-new-form")).fadeIn("slow");

        setTimeout(function() {$(".add-new-form__msg-block").fadeOut("slow");}, 5000);
    }

    function goodInput () {
        var msgBlock        = document.createElement("div");
        msgBlock.classList  = "add-new-form__msg-block msg-block";
        msgBlock.id         = "msg";

        var img     = document.createElement("img");
        img.src     = "img/check.svg";
        img.width   = "40";
        img.height  = "40";
        msgBlock.append(img);

        var p           = document.createElement("p");
        p.innerText     = "Successfully added";
        msgBlock.append(p);

        $(msgBlock).hide().appendTo($(".add-new-form")).fadeIn("slow");

        setTimeout(function() {$(".add-new-form__msg-block").fadeOut("slow");}, 5000); 
    }
});