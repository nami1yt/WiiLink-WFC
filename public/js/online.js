import {loadImage} from '/js/helper_functions.js';

var onlineNow = document.getElementById("online-now");
var trueName = "Unknown";
var developer = "Unknown";
var publisher = "Unknown";
var region = "Unknown";
var date = "Unknown";
var month = "Unknown";
var day = "Unknown";
var genre = "Unknown";
var rating = "Unknown";
var languages = "Unknown";
var mainGenre = "Unknown";
var onlineSupport = "Unknown";
var classification = "Unknown";
var wifiPlayers = "Unknown";
var isSupported = "Unknown";
var inputPlayers = "Unknown";
var romName = "Unknown";
var romSize = "Unknown";
var romVersion = "Unknown";
var hash = "Unknown";
var hash2 = "Unknown";
var hash3 = "Unknown";
var imgLang = "Unknown";
var id = "Unknown";

function render(xml, GameID) {
  var xmlDoc = xml.responseXML;
  var x = xmlDoc.getElementsByTagName("game");
  var desiredLang = "EN"; // Replace with the desired language
  for (var i = 0; i < x.length; i++) {
    // Loop through gamelist of gameTDB
    var tid = x[i].getElementsByTagName("id")[0];
    if (tid.childNodes[0].nodeValue === GameID) {
      // Check if the titleid of the query matches the titleid of the gameTDB entry
      var locales = x[i].getElementsByTagName("locale");
      for (var j = 0; j < locales.length; j++) {
        // Loop through available locales
        var region = x[i].getElementsByTagName("region")[0].textContent;
        if (locales[j].getAttribute("lang") === desiredLang) {
          // Get all the data from the XML
          trueName = x[i].getAttribute("name") || "Unknown";
          developer =
            x[i].getElementsByTagName("developer")[0]?.textContent || "Unknown";
          region =
            x[i].getElementsByTagName("region")[0]?.textContent || "Unknown";
          languages =
            x[i].getElementsByTagName("languages")[0]?.textContent || "Unknown";
          publisher =
            x[i].getElementsByTagName("publisher")[0]?.textContent || "Unknown";
          date =
            x[i].getElementsByTagName("date")[0]?.getAttribute("year") ||
            "YYYY";
          month =
            x[i].getElementsByTagName("date")[0]?.getAttribute("month") || "MM";
          day =
            x[i].getElementsByTagName("date")[0]?.getAttribute("day") || "DD";
          genre =
            x[i].getElementsByTagName("genre")[0]?.textContent || "Unknown";
          mainGenre = genre.split(",")[0].trim();
          rating =
            x[i].getElementsByTagName("rating")[0]?.getAttribute("value") ||
            "Unknown";
          classification =
            x[i].getElementsByTagName("rating")[0]?.getAttribute("type") ||
            "Unknown";

          wifiPlayers =
            x[i].getElementsByTagName("wi-fi")[0]?.getAttribute("players") ||
            "Unknown";
          onlineSupport =
            x[i]
              .getElementsByTagName("wi-fi")[0]
              ?.getElementsByTagName("feature") || [];
          isSupported = Array.from(onlineSupport)
            .map((feature) => feature.textContent)
            .join(" | ");

          inputPlayers = x[i]
            .getElementsByTagName("input")[0]
            .getAttribute("players");

          // Get extra data
          romName = x[i].getElementsByTagName("rom")[0].getAttribute("name");
          romSize = (
            x[i].getElementsByTagName("rom")[0].getAttribute("size") /
            1024 /
            1024 /
            1024
          ).toFixed(2);
          romVersion = x[i]
            .getElementsByTagName("rom")[0]
            .getAttribute("version");
          hash = x[i].getElementsByTagName("rom")[0].getAttribute("crc");
          hash2 = x[i].getElementsByTagName("rom")[0].getAttribute("md5");
          hash3 = x[i].getElementsByTagName("rom")[0].getAttribute("sha1");

          id = x[i].getElementsByTagName("id")[0].textContent;

          // Get the correct image URL based on the title's region
          switch (region) {
            case "NTSC-U":
              imgLang = "US";
              break;
            case "PAL":
              imgLang = "EN";
              break;
            case "NTSC-J":
              imgLang = "JA";
              break;
            case "NTSC-K":
              imgLang = "KO";
              break;
          }

          var titleData = [
            trueName,
            developer,
            publisher,
            region,
            date,
            month,
            day,
            genre,
            rating,
            classification,
            wifiPlayers,
            isSupported,
            inputPlayers,
            languages,
            mainGenre,
            romName,
            romSize,
            romVersion,
            hash,
            hash2,
            hash3,
            imgLang,
            id,
          ];
          return titleData;
        }
      }
      break;
    }
  }
}

function displayTitleData(GameID) {
  return new Promise((resolve, reject) => {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var titleData = render(this, GameID);
        resolve(titleData);
      } else if (this.readyState == 4) {
        reject("Error: " + this.status);
      }
    };
    xmlhttp.open("GET", "https://wiilink.ca/extras/wiitdb.xml", true);
    xmlhttp.send();
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Fetch the list of all games and the list of online games in parallel
    const [allGamesResponse, onlineStatsResponse] = await Promise.all([
      fetch("../json/pages.json"),
      fetch("https://api.wfc.wiilink24.com/api/stats"),
    ]);

    const allGames = await allGamesResponse.json();
    const onlineStats = await onlineStatsResponse.json();

    let totalGames = 0;
    let totalPlayers = 0;

    // Create an array of promises to process each game in parallel
    const gamePromises = allGames.map(async (game) => {
      if (
        onlineStats[game.gameId] &&
        onlineStats[game.gameId].online > 0
      ) {
        const extraData = [
          onlineStats[game.gameId].online,
          onlineStats[game.gameId].active,
          onlineStats[game.gameId].groups,
          game.gameId,
        ];

        const titleDataReturn = await displayTitleData(game.gamespyId);

        var isBig = "";
        if (extraData[1] > 6) {
          isBig = "grid-column: auto / span 2; grid-row: auto / span 1;";
        } else {
          isBig = "grid-column: auto / span 1; grid-row: auto / span 1";
        }


        // Add the image elements to the HTML
                onlineNow.innerHTML +=
          '<a href="/online/' +
          extraData[3] +
          '" class="card-online" style="' +
          isBig +
          ' ">' +
          '<img src="' +
          loadImage("cover", titleDataReturn[22]) +
          '" id="card-bg" onerror="this.style.opacity=0;">' +
          '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<img src="' +
          loadImage("disc", titleDataReturn[22]) +
          '" style="width:70px; height:70px;" onerror="this.style.opacity=0;">' +
          '<div><h5 style="font-weight:800; text-align:right;">' +
          titleDataReturn[0] +
          "</h5><h6 style='text-align:right; opacity:0.5;'>" +
          titleDataReturn[1] +
          " / " +
          titleDataReturn[2] +
          "</h6></div></div>" +
          '<p style="padding-top:20px; padding-bottom:25px; display:flex; gap:20px; align-items:center; justify-content:center;">' +
          "<b style='text-align:center;'><b style='font-family:rubik; font-size:30px;'>" +
          extraData[0] +
          "</b><br><i class='fa-solid fa-user' style='margin-right:5px;'></i> online</b>" +
          "<b style='text-align:center;'><b style='font-family:rubik; font-size:30px;'>" +
          extraData[1] +
          "</b><br><i class='fa-solid fa-gamepad' style='margin-right:5px;'></i> Active</b>" +
          "<b style='text-align:center;'><b style='font-family:rubik; font-size:30px;'>" +
          extraData[2] +
          "</b><br><i class='fa-solid fa-users-rays' style='margin-right:5px;'></i>Groups</b></p>" +
          titleDataReturn[7] +
          " <br><div style='display:flex; align-items:center; justify-content:space-between;'>" +
          "<p><span class='badge bg-translucent'>" +
          titleDataReturn[3] +
          "</span> <span class='badge bg-translucent'>" +
          titleDataReturn[4] +
          "</span></p><p><span class='badge bg-translucent'>" +
          titleDataReturn[9] +
          "-" +
          titleDataReturn[8] +
          "</span> <span class='badge bg-translucent'>" +
          titleDataReturn[12] +
          " <i class='fa-solid fa-user'></i> | " +
          titleDataReturn[10] +
          " <i class='fa-solid fa-earth-americas'></i></span></p></div></div></div></a>";

        totalGames++;
        totalPlayers += extraData[0];
      }
    });

    // Wait for all game promises to resolve
    await Promise.all(gamePromises);

    if (Object.keys(onlineStats).length < 2) {
      document.getElementsByClassName("online-now-holder")[0].style.display =
        "none";
      document.getElementById("noResults").style.display = "block";
      document.getElementById("main").style.top = "45%";
      document.getElementById("noResultsHold").classList.add("active");
      document.getElementById("main").style.transform = "translate(-50%, -50%)";
    }

    document.getElementById("onlineInfo").innerHTML +=
      "<p style='opacity:0.3;'>Now serving <b>" +
      totalPlayers +
      "</b> <i class='fa-solid fa-user' style='margin-right:5px;'></i> players in <b>" +
      totalGames +
      "</b> <i class='fa-solid fa-gamepad' style='margin-right:5px;'></i> games!</p>";
  } catch (error) {
    console.error(error);
  }
});
