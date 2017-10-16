$(document).ready(function() {
  var thermometer = document.getElementById("temperature-fa");
  var temperature = document.getElementById("temperature-text");
  var units = document.getElementById("temperature-units");
  var currentUnits = "us";
  var unitSymbol = "°F";
  var temperatureData;

//for testing purposes 
  /*
  $( "#slider" ).slider({
      min: -40,
      max : 80,
    //can use slide
      change: function( event, ui ) {
        temperature.innerHTML = $( "#slider" ).slider( "option", "value" );
        updateDisplay(temperature.innerHTML);
      }
  });
  */
  getLocation();

  $("#change-units").on("click", function() {
    currentUnits = currentUnits == "us" ? "uk" : "us";
    unitSymbol = currentUnits == "us" ? "°F" : "°C";
    if(temperatureData){
      updateDisplay(temperatureData.currently.temperature);
    }
    //getLocation();
  });
  
  function updateDisplay(temp){
     changeColor(temp); 
     temperature.innerHTML = convertTemp(temp);
     units.innerHTML =unitSymbol;
  }

  function getLocation() {
    unitSymbol = currentUnits == "us" ? "°F" : "°C";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successPosition, failedPosition);
    } else {
      temperature.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  function successPosition(pos) {
    getWeather(pos.coords.latitude, pos.coords.longitude, currentUnits);
  }

  function failedPosition(err) {
  //  console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  function getWeather(lat, lon) {
    //temp is us by default
    var thermometer = '<i class="fa fa-thermometer" aria-hidden="true"></i>';
    var api_key = "1222f139d8f8a59f8b57248d7428b8cf";
    var url =
      "https://api.darksky.net/forecast/" +
      api_key +
      "/" +
      lat +
      "," +
      lon +
      "?units=us&exclude=minutely,hourly,daily,alerts";

    $.ajax({
      dataType: "jsonp",
      url: url,
      success: function(data) {
        temperatureData = data;
        updateDisplay(data.currently.temperature);
      },
      cache: false
    });
  }

  function changeColor(temp) {
    var colors = ["#FD3EB5", "#F140B9", "#E543BD", "#DA46C1", "#CE49C5", "#C34CCA",
                  "#B74FCE", "#AC52D2", "#A055D6", "#9557DB", "#895ADF", "#7E5DE3",
                  "#7260E7", "#6763EC", "#5B66F0", "#5069F4", "#446CF8", "#396FFD",
                  "#3877F1", "#3880E5", "#3889D9", "#3792CE", "#379BC2", "#37A4B6",
                  "#36ADAB", "#36B69F", "#36BF93", "#35C888", "#35D17C", "#35DA70",
                  "#34E365", "#34EC59", "#34F54D", "#34FE42", "#40F140", "#4DE43F",
                  "#5AD73E", "#66CA3D", "#73BD3B", "#80B03A", "#8CA339", "#999638",
                  "#A68936", "#B27C35", "#BF6F34", "#CC6233", "#D85531", "#E54830",
                  "#F23B2F", "#FF2E2E"]

    var normalized = clamp((temp - -40) / (80 - -40), 0, 1);//(x-min/max-min)
    var num = Math.floor(normalized / (1.0 / (4)));
    var thermo = '<i class="fa fa-thermometer-'+num+'" aria-hidden="true"></i>';
    
    thermometer.innerHTML = thermo;     
    document.body.style.backgroundColor  =  colors[Math.floor(normalized / (1.0 / (colors.length - 1)))];
    /*                     
    $("html body").animate({
      backgroundColor:
        colors[Math.floor(normalized / (1.0 / (colors.length - 1)))]
    });
    */
  }

  //code always gets F, convert to C
  function convertTemp(temp){
    if (currentUnits == "us") {
      return Math.round(temp);// * 1.8 + 32
    }else
      return Math.round((temp - 32) / 1.8);
   }
  
  function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }
});
