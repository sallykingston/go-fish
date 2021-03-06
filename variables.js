var handSize = 7;
var cardsInSuit = 13;
var delayInterval = 1000;

var cardTemplate = _.template($("#cardTmpl").html());
var playerTemplate = _.template($("#playerTmpl").html());

var defaultPic = "https://dl.dropboxusercontent.com/u/2828114/Fish.png";
var cardBack = "<div class='card'>&#x1F0A0</div>";
var cardCodes={
  spades:"1F0A",
  hearts:"1F0B",
  diamonds:"1F0C",
  clubs:"1F0D",
  0:"1",
  1:"E",
  2:"2",
  3:"3",
  4:"4",
  5:"5",
  6:"6",
  7:"7",
  8:"8",
  9:"9",
  10:"A",
  11:"B",
  12:"D",
};
