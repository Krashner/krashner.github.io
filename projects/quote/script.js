$(document).ready(function() {
  changeBG();
  var colorIndex = 0;
  getQuote();

  $("#btn-twitter").on("click", function() {
    var address =
      'https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text="' +
      $(".quote-text").text() +
      '" ' +
      $(".quote-author").html();
    $("#twitterLink").attr("href", address);
  });

  $("#btn-new-quote").on("click", function() {
    changeBG();
    $(".quote-text").html("");
    $(".quote-author").html("");
    getQuote();
  });

  function getQuote() {
    var leftQuote =
      '<i class="fa fa-quote-left quotes" aria-hidden="true"></i>';
    var rightQuote =
      '<i class="fa fa-quote-right quotes" aria-hidden="true"></i>';

    $.ajax({
      dataType: "json",
      url: "https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1",
      success: function(data) {
        var post = data[0];
        $(".quote-text").html(leftQuote + $(post.content).text() + rightQuote);
        $(".quote-author").html("– " + post.title);
      },
      cache: false
    });
  }

  function changeBG() {
    var colors = [
      "#73A857",
      "#77B1A9",
      "#472E32",
      "#27AE60",
      "#b78888",
      "#c09f69",
      "#BDBE93",
      "#86A282",
      "#92b4e6",
      "#333333"
    ];

    //get nonrepeating random color
    var newColorIndex = Math.floor(Math.random() * colors.length);
    while (colorIndex == newColorIndex) {
      newColorIndex = Math.floor(Math.random() * colors.length);
    }
    colorIndex = newColorIndex;

    $("html body").animate({
      backgroundColor: colors[newColorIndex],
      color: colors[newColorIndex]
    });
    $(".button").animate({
      backgroundColor: colors[newColorIndex]
    });
  }
});
