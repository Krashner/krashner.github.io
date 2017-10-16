$(document).ready(function() {
  var contentList = document.getElementById("content-list");

  var streamers = [
    "ESL_SC2",
    "OgamingSC2",
    "cretetion",
    "freecodecamp",
    "storbeck",
    "habathcx",
    "RobotCaleb",
    "noobs2ninjas"
  ];

  GetStreams();

  function GetStreams() {
    contentList.innerHTML = "";
    $.each(streamers, function(index, value) {
      var url =
        "https://wind-bow.gomix.me/twitch-api/streams/" + value + "?callback=?";

      $.getJSON(url, function(data) {
        if (data.stream != null) {
          displayResultsOnline(data);
        } else {
          displayResultsOffline(streamers[index]);
        }
      });
    });
  }

  function displayResultsOffline(data) {
    var buttonLink = document.createElement("a");
    buttonLink.href = "https://www.twitch.tv/" + data;
    buttonLink.target = "_blank";
    buttonLink.className += " row";

    var textDiv = document.createElement("div");
    textDiv.className += " col text offline-text";

    var title = document.createElement("h4");
    title.className += " title";
    title.innerHTML = data;

    var live = document.createElement("p");
    live.className += " description";
    live.innerHTML =
      "<i class='fa fa-circle offline' aria-hidden='true'></i> Offline";

    //textDiv.append(title, live);
    textDiv.appendChild(title);
    textDiv.appendChild(live);
    buttonLink.appendChild(textDiv);

    var listItem = document.createElement("li");
    listItem.appendChild(buttonLink);
    listItem.className += " button col offline-button";

    listItem.style.height = "auto";
    listItem.style.backgroundColor = "rgb(31,31,31)";

    contentList.appendChild(listItem);
  }

  function displayResultsOnline(data) {
    //console.log(data);

    var buttonLink = document.createElement("a");
    buttonLink.href = data.stream.channel.url;
    buttonLink.target = "_blank";
    buttonLink.className += " row";

    var textDiv = document.createElement("div");
    textDiv.className += " col text";

    var imgDiv = document.createElement("div");
    imgDiv.className += " center-text col-xs-3 logo";

    var title = document.createElement("h4");
    title.className += " title";
    title.innerHTML = data.stream.channel.display_name;

    var live = document.createElement("p");
    live.className += " liveStatus";
    live.innerHTML =
      "<i class='fa fa-circle online' aria-hidden='true'></i> Online";

    var game = document.createElement("p");
    game.className += " description";
    game.innerHTML =
      data.stream.channel.game + " | " + data.stream.channel.status;

    var image = document.createElement("img");
    image.src = data.stream.channel.logo;
    image.className += " logo";

    imgDiv.appendChild(image);
    //textDiv.append(title, live, game);
    textDiv.appendChild(title);
    textDiv.appendChild(live);
    textDiv.appendChild(game);
    // buttonLink.append(imgDiv, textDiv);
    buttonLink.appendChild(imgDiv);
    buttonLink.appendChild(textDiv);
    var listItem = document.createElement("li");

    listItem.appendChild(buttonLink);
    listItem.className += " button";

    listItem.style.background =
      "url(" + data.stream.preview.large + ") no-repeat center center";

    contentList.insertBefore(listItem, contentList.firstChild);
  }
});
