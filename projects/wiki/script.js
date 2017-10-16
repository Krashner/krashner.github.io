$(document).ready(function() {
  var contentList = document.getElementById("content-list");
  var searchInput = document.getElementById("search-input");

  
  //submit button
  $("#submit-search").on("click", function() {
    search();
  });

  //on enter in textbox
  searchInput.onkeydown = function(e) {
    if (e.keyCode == 13) {
      search();
    }
  };

  function search() {
    console.log("test");
    if (searchInput.value) {
      getPage(searchInput.value);
    }
  }

  function getPage(searchValue) {
    //clear the list
    contentList.innerHTML = "";

    //get the data
    $.ajax({
      dataType: "json",
      type: "POST",
      url:
        "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
          searchValue +
          "&utf8=&format=json&callback=?",
      success: function(data) {
        console.log(data);
        displayResults(data);
      }
    });
  }

  function displayResults(searchData) {
    //create an array of buttons that link to the wiki pages
    for (var i = 0; i < searchData.query.search.length; i++) {
      var container = document.createElement("a");
      container.href =
        "https://en.wikipedia.org/wiki/" + searchData.query.search[i].title;
      container.target = "_blank";

      var title = document.createElement("h4");
      title.className += " title";
      title.innerHTML = searchData.query.search[i].title;

      var snippet = document.createElement("p");
      snippet.className += " description";
      snippet.innerHTML = searchData.query.search[i].snippet;

      container.appendChild(title);
      container.appendChild(snippet);

      var listItem = document.createElement("li");

      listItem.appendChild(container);
      listItem.className += " button";

      contentList.appendChild(listItem);
    }
  }
});
