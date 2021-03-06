function Game() {
    this.deck = [];
    this.players = [];
    this.playing = true;
    this.turnPlayer = "";
    this.askPlayer = "";
    this.askCard = "";
}

Game.prototype.init = function(people) {
    var game = this;
    game.fillCards();
    game.shuffle();
    _.each(people, function(player) {
        player.playGoFish(game);
    });
    game.deal();
    this.players[0].showStartButton();
};
Game.prototype.deal = function() {
    var game = this;
    _(handSize).times(function() {
        _.each(game.players, function(player) {
            player.hand.push(game.deck.pop());
        });
    });
    _.each(game.players, function(player) {
        player.displayHandDown();
    });
};
Game.prototype.shuffle = function() {
    this.deck = _.shuffle(this.deck);
};
Game.prototype.fillCards = function() {
    for (var i = 0; i < cardsInSuit; i++) {
        this.deck.push(new Card("clubs", i));
        this.deck.push(new Card("hearts", i));
        this.deck.push(new Card("diamonds", i));
        this.deck.push(new Card("spades", i));
    }
};
Game.prototype.findWinner = function() {
    return _.max(this.players, function(player) {
        return player.score;
    });
};
Game.prototype.nextplayer = function(player) {
  var num = _.indexOf(this.players, player)+1;
  if (num===this.players.length){
    num=0;
  }
  return this.players[num];
};

function Player(name, imgURL) {
    this.name = name;
    this.image = imgURL || defaultPic;
    this.hand = [];
    this.score = 0;
    $(".players").append(playerTemplate(this));
}
Player.prototype.playGoFish = function(game) {
    game.players.push(this);
};
Player.prototype.hasCard = function(card) {
    return _.indexOf(this.hand, _.findWhere(this.hand, {
        number: card.number
    }));
};
Player.prototype.goFishing = function(game) {
    var card = game.deck.pop();
    this.hand.push(card);
    $(".instructions").html("You went fishing and caught a "+cardTemplate(card));
};
Player.prototype.displayHand = function() {
    var handID = "#" + this.name + "Hand";
    $(handID).html("");
    _.each(this.hand, function(card, idx) {
        $(handID).append(cardTemplate(card));
    });
};
Player.prototype.displayHandDown = function() {
    var handID = "#" + this.name + "Hand";
    $(handID).html("");
    _.each(this.hand, function(card, idx) {
        $(handID).append(cardBack);
    });
};
Player.prototype.showStartButton = function() {
    var turnButton = "#" + this.name + "StartTurn";
    $(turnButton).removeClass("hidden");
    gamePage.thisGame.turnPlayer = this;
    $(".instructions").html(this.name + ", click 'Start turn' to begin.");
};
Player.prototype.takeTurn = function(game) {
    var player = this;
    if (game.playing) {
        player.displayHand();
        player.removePairs(game);
    }
};
Player.prototype.removePairs = function(game) {
    var numCards = this.hand.length;
    var pairsFound = "";

    //set twos to be the cards that are pairs from the hand
    var twos =  _.chain(this.hand).groupBy(function(card) {
        return card.number;
    }).filter(function(group) {
        return group.length % 2 != 1;
      }).value();
    if (twos.length>0){
      //remove twos from the hand
      this.hand = _.chain(this.hand).groupBy(function(card) {
          return card.number;
      }).filter(function(group) {
          return group.length % 2 === 1;
      }).flatten().value();

      _.each(twos,function (pair) {
        _.each(pair,function (card) {
          pairsFound+=cardTemplate(card);
        })
      });
    }

    //set threes to be the cards that are triples from the hand
    var threes = _.chain(this.hand).groupBy(function(card) {
        return card.number;
    }).filter(function(group) {
        return group.length === 3;
    }).value();
    if (threes.length > 0) {
        //remove threes from the hand
        this.hand = _.chain(this.hand).groupBy(function(card) {
            return card.number;
        }).filter(function(group) {
            return group.length != 3;
        }).flatten().value();

        //put one card of the threes back in the hand
        this.hand.push(threes[0].pop());
        _.each(threes,function (pair) {
          _.each(pair,function (card) {
            pairsFound+=cardTemplate(card);
          })
        });
    }
    var scoreDiff = ((numCards - this.hand.length) / 2);
    this.score += scoreDiff;
    if (scoreDiff > 0) {
        var scorespan = "#"+this.name+"score";
        $(scorespan).html("Pairs: "+this.score);
        $(".instructions").html("Your pairs: "+ pairsFound);
        this.displayHand();
    }
    if (this.hand.length === 0) {
        game.playing = false;
        var winner = game.findWinner();
        $(".instructions").html("The game has ended and " + winner.name +
            " is the winner with " + winner.score + " pairs.");

    }
    return scoreDiff;
};

Player.prototype.ask = function() {
    game = gamePage.thisGame;
    card = game.askCard;
    askplayer = game.askPlayer;
    player = this;
    var cardIndex = askplayer.hasCard(card);

    //player doesn't have the card, go fishing
    if (cardIndex === -1) {
        player.goFishing(game);
    } else {
        //get the card from their hand
        player.hand.push(askplayer.hand.splice(cardIndex, 1)[0]);
    }
    var gotPair = player.removePairs(game);
    //wait to take the next turn so you can see tthe card you drew
    if (gotPair > 0) {
        setTimeout( function () {
          player.takeTurn(game);
        }
          ,delayInterval);
    } else {
      player.displayHandDown();
      //wait to take the next turn so you can see the card you drew
      setTimeout( function () {
        game.nextplayer(player).showStartButton();
      }
        ,delayInterval);
    }
    game.askCard="";
    game.askPlayer="";
};

function Card(suit, number) {
    this.suit = suit;
    this.number = number;
    this.suitcode = cardCodes[suit];
    this.cardcode = cardCodes[number];
}

var gamePage = {
    init: function(argument) {
        gamePage.events();
        gamePage.styling();
    },
    events: function() {
        $("#addPlayer").on("click", function() {
            $("form").removeClass("hidden");
            $("#addPlayer").addClass("hidden");
        });
        $("input").on("keypress",function (event){
          if(event.charCode===13){
            event.preventDefault();
            var newPlayer = new Player($("#playerName").val(),
                $("#playerURL").val());
            newPlayer.playGoFish(gamePage.thisGame);
            $("#playerName").val("");
            $("#playerURL").val("");
            if (gamePage.thisGame.players.length > 1) {
                $("#startGame").removeClass("hidden");
            }
          }
        });


        $("#startGame").on("click", function(event) {
            gamePage.thisGame.init();
        });
        $(".players").on("click", ".startTurn", function(argument) {
            $(this).addClass("hidden");
            var player = gamePage.thisGame.turnPlayer;
            player.takeTurn(gamePage.thisGame);
            setTimeout(function () {
              $(".instructions").html("Click a card from your hand and another player to ask for that card.");
            },delayInterval);
        });
        $(".players").on("click", ".card", function() {
            var game = gamePage.thisGame;
            var cardNum = $(this).index();
            var player = game.turnPlayer;
            var card = player.hand[cardNum];
            game.askCard=card;
            if (game.askPlayer!=""){
              player.ask();
            }
        });
        $(".players").on("click", ".mdl-card", function() {
          var game = gamePage.thisGame;
          var playerName = $(this).attr("id");
          var askPlayer = _.findWhere(game.players, {
              name: playerName
          });
          var player = game.turnPlayer;
          game.askPlayer = askPlayer;
          if (game.askCard!=""){
            player.ask();
          }
      });
    },
    styling: function() {
        gamePage.thisGame = new Game();
    },
    thisGame: {},
};
$("document").ready(function() {
    gamePage.init();
});
