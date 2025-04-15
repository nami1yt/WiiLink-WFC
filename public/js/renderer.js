import {
  getIconForGenre,
  getRating,
  getController,
  loadImage,
  fetchCompatData,
} from "/js/helper_functions.js";
import { onlineUpdater } from "/js/online_updater.js";
import { getRecommendedTitles } from "/js/recommended_titles.js";

document.addEventListener("DOMContentLoaded", function () {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      render(this);
    }
  };
  xmlhttp.open("GET", "/xml/wiitdb.xml", true);
  xmlhttp.send();
});

function render(xml) {
  var xmlDoc = xml.responseXML;
  var x = xmlDoc.getElementsByTagName("game");
  var desiredLang = "EN"; // Replace with the desired language

  for (var i = 0; i < x.length; i++) {
    // Loop through gamelist of gameTDB
    var id = x[i].getElementsByTagName("id")[0];
    var type = x[i].getElementsByTagName("type")[0];
    var titleCheck = document.getElementById("gameId").textContent;
    var gamespyCheck = document.getElementById("gamespyId").textContent;
    titleCheck = titleCheck.replace(/ /g, "");
    gamespyCheck = gamespyCheck.replace(/ /g, "");
    if (id.textContent === titleCheck || id.textContent === gamespyCheck) {
      // Check if the titleid of the query matches the titleid of the gameTDB entry
      var locales = x[i].getElementsByTagName("locale");
      // Loop through available locales
      var region = x[i].getElementsByTagName("region")[0].textContent;
      if (locales[0].getAttribute("lang") === desiredLang) {
        // Check if the locale matches the desired language (to be added at a later date)

        // Get all the data from the XML
        var trueName = x[i].getAttribute("name") || "Unknown";
        var developer =
          x[i].getElementsByTagName("developer")[0]?.textContent || "Unknown";
        var region =
          x[i].getElementsByTagName("region")[0]?.textContent || "Unknown";
        var languages =
          x[i].getElementsByTagName("languages")[0]?.textContent || "Unknown";
        var publisher =
          x[i].getElementsByTagName("publisher")[0]?.textContent || "Unknown";
        var date =
          x[i].getElementsByTagName("date")[0]?.getAttribute("year") || "YYYY";
        var month =
          x[i].getElementsByTagName("date")[0]?.getAttribute("month") || "MM";
        var day =
          x[i].getElementsByTagName("date")[0]?.getAttribute("day") || "DD";
        var genre =
          x[i].getElementsByTagName("genre")[0]?.textContent || "Unknown";
        var mainGenre = genre.split(",")[0].trim();
        // Format the data in a more appealing way
        genre = genre
          .split(",")
          .map(function (item) {
            var genreIconClass = getIconForGenre(item.trim());
            return (
              '<b style="font-size:20px"><i class="fas ' +
              genreIconClass +
              '" style="margin-right:5px;"></i> ' +
              item.charAt(0).toUpperCase() +
              item.slice(1) +
              "</b>"
            );
          })
          .join("<br>");
        var rating =
          x[i].getElementsByTagName("rating")[0]?.getAttribute("value") ||
          "Unknown";
        var classification =
          x[i].getElementsByTagName("rating")[0]?.getAttribute("type") ||
          "Unknown";

        rating = getRating(rating, classification);

        var wifiPlayers =
          x[i].getElementsByTagName("wi-fi")[0]?.getAttribute("players") ||
          "Unknown";
        var onlineSupport =
          x[i]
            .getElementsByTagName("wi-fi")[0]
            ?.getElementsByTagName("feature") || [];
        var isSupported = Array.from(onlineSupport)
          .map((feature) => feature.textContent)
          .join(" | ");

        var inputPlayers = x[i]
          .getElementsByTagName("input")[0]
          .getAttribute("players");
        var controlTypes = getController(xml, i);

        // Get extra data
        var romName = x[i].getElementsByTagName("rom")[0].getAttribute("name");
        var romSize = (
          x[i].getElementsByTagName("rom")[0].getAttribute("size") /
          1024 /
          1024 /
          1024
        ).toFixed(2);
        var romVersion = x[i]
          .getElementsByTagName("rom")[0]
          .getAttribute("version");
        var hash = x[i].getElementsByTagName("rom")[0].getAttribute("crc");
        var hash2 = x[i].getElementsByTagName("rom")[0].getAttribute("md5");
        var hash3 = x[i].getElementsByTagName("rom")[0].getAttribute("sha1");
        var extraDataTitle = `Name: ${trueName}\nRom Dump: ${romName}\nFilesize: ${romSize}GB\nVersion: ${romVersion}\ncrc: ${hash}\nmd5: ${hash2}\nsha1: ${hash3}`;


        var data = document.getElementById("data");

        var displayMode = localStorage.getItem("displayMode");
        var display = "display:grid;";
        var extraDisplay = "display:flex;";
        var sizeFix = "height:86%; margin-top:15px;";
        var size1 = "grid-column: auto / span 5; grid-row: auto / span 2;";
        var size2 = "grid-column: auto / span 5; grid-row: auto / span 2;";
        var size3 = "grid-column: auto / span 6; grid-row: auto / span 1;";
        var size4 = "grid-column: auto / span 6; grid-row: auto / span 1;";

        switch (displayMode) {
          case complete:
            break;
          case "compact":
            display = "display:none;";
            size1 = "grid-column: auto / span 3; grid-row: auto / span 2;";
            size2 = "grid-column: auto / span 9; grid-row: auto / span 2;";
            size3 = "grid-column: auto / span 2; grid-row: auto / span 1;";
            size4 = "grid-column: auto / span 10; grid-row: auto / span 1;";
            sizeFix = "height:100%; margin-top:0px;";
            break;
          case "utilitarian":
            display = "display:none !important;";
            extraDisplay = "display:none !important;";
            sizeFix = "height:100%; margin-top:0px;";
            size2 = "grid-column: auto / span 12; grid-row: auto / span 2;";
            size3 = "grid-column: auto / span 2; grid-row: auto / span 1;";
            size4 = "grid-column: auto / span 10; grid-row: auto / span 1;";
            document.getElementById("errhide").style.display = "none";
            break;
        }

        document.getElementById("fetchData").style.display = "none";
        document.getElementById("mobilehide").style.display = "block";
        document.getElementById("powered").style.display = "block";
        document.getElementById("errhide").style.display = "block";
        data.innerHTML = `<div class="smalldatapill" style="${display}; animation: fadein 200ms ease-in-out forwards; opacity:0;"><l id="extradata" title="${extraDataTitle}" style="grid-column: auto / span 5; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;"><i class="fa-solid fa-compact-disc"></i> ${trueName}</l> <l title="${developer} | ${publisher}" id="publisher" style="grid-column: auto / span 3; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; position:relative;"><i class="fa-solid fa-file-code"></i> ${developer} | ${publisher}</l> <l style="grid-column: auto / span 2;"><i class="fa-solid fa-earth-americas"></i> ${region}</l> <l title="${languages}" style="grid-column: auto / span 3; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; position:relative;"><i class="fa-solid fa-language"></i> ${languages}</l> <l style="grid-column: auto / span 3;"><i class="fa-solid fa-calendar"></i> ${day}/${month}/${date}</l></div>`;
        data.innerHTML += `<div class="bigdatapill" style="${sizeFix}; animation: fadein 200ms ease-in-out forwards; opacity:0;"><l class="genre" style="border:2px solid #4287f520; ${size1} display:flex; flex-direction:column; align-items:center; justify-content:center; ${extraDisplay}"><div class="macremove" style="color:#4287f5; bottom:-50px; left:-20px; opacity:0.1; text-transform:uppercase; font-family:Gilroy; font-size:100px;position:absolute;">Genre</div> ${genre}</l> <l class="rating"  style="border:2px solid #42f55d20; grid-column: auto / span 2; grid-row: auto / span 2; ${display}"><div class="macremove" style="color:#42f55d; bottom:-50px; left:-20px; opacity:0.1; text-transform:uppercase; font-family:Gilroy; font-size:100px;position:absolute;">${classification}</div> ${rating}</l> <l id="onlinemobile" style="min-height:250px; border:2px solid #dd42f520; ${size2} display:flex; justify-content:center; align-items:center; position:relative;"><div class="macremove" style="color:#dd42f5; bottom:-50px; left:-20px; opacity:0.1; text-transform:uppercase; font-family:Gilroy; font-size:100px; position:absolute;">WI-FI</div><b id="WFCdetails" style="width:100%; max-width:330px;"><img src="/img/loading.gif" id="onlineload" style="left:50%; transform:translate(-50%, 0); filter:brightness(100000000); display:none; position:relative;" width="30px"></b> <div id="onlineplaycontainer" style="top:20px; display:flex; align-items:center; justify-content:center; position:absolute;"><b id="onlineplayno" style="font-size:30px; margin-right:18px;">${wifiPlayers}</b><b id="wifino"></b></div> <d style="bottom:20px; lext-align:left; position:absolute;">${isSupported}</d></l> <l style="border:2px solid #dd42f520; ${size3} display:flex; justify-content:center; align-items:center;"><div class="macremove" style="color:#dd42f560; bottom:-50px; left:-20px; opacity:0.2; text-transform:uppercase; font-family:Gilroy; font-size:100px;position:absolute;">Players</div> <b style="font-size:30px; margin-right:18px;">${inputPlayers}</b> <b id="playerno"></b></l> <l style="border:2px solid #ffffff20; ${size4}"><div class="macremove" style="bottom:-50px; left:-20px; opacity:0.03; text-transform:uppercase; font-family:Gilroy; font-size:100px;position:absolute;">Controllers</div> <br>${controlTypes}</l></div>`;

        var playIcon1 = document.getElementById("wifino");
        var playIcon2 = document.getElementById("onlineplaycontainer");
        if (wifiPlayers == 0) {
          document.getElementById("onlineplayno").style.display = "none";
          playIcon1.innerHTML +=
            '<i class="fa-solid fa-triangle-exclamation"></i> This title does not support online multiplayer.';
          playIcon2.style.top = "45%";
        } else if (wifiPlayers == 10) {
          for (var l = 0; l < wifiPlayers; l++) {
            playIcon1.innerHTML +=
              '<i class="fa fa-user" style="margin-right:8px;"></i>';
          }
          document.getElementById("WFCdetails").innerHTML = `
            <i class="fa fa-triangle-exclamation" style="margin-right:5px;"></i> Call of Duty is not supported by WiiLink WFC.`;
        } else if (wifiPlayers == 0) {
          document.getElementById("onlineplayno").innerHTML = "0";
          playIcon1.innerHTML +=
            '<i class="fa fa-user" style="margin-right:8px;"></i>';
        } else {
          for (var l = 0; l < wifiPlayers; l++) {
            playIcon1.innerHTML +=
              '<i class="fa fa-user" style="margin-right:8px;"></i>';
          }
        }
        var playIcon2 = document.getElementById("playerno");
        for (var l = 0; l < inputPlayers; l++) {
          playIcon2.innerHTML +=
            '<i class="fa fa-user" style="margin-right:8px;"></i>';
        }
        var synopsis = document.getElementById("synopsis");
        synopsis.innerHTML =
          locales[0].getElementsByTagName("synopsis")[0].textContent;
        marked.parse(synopsis.innerHTML);
      }

      fetch("../../json/pages.json") // Check for gamespy support
        .then((response) => response.json())
        .then((data) => {
          var isFound = false;
          for (let j = 0; j < data.length; j++) {
            if (
              !isFound &&
              data[j]?.patchId &&
              data[j]?.patchId[0].substring(0, 4) ===
              id.textContent.substring(0, 4)
            ) {
              isFound = true;
              document.getElementById("onlineload").style.display = "block";
              // MKW specific patches
              if (data[j]?.patchId[0].substring(0, 3) == "RMC") {
                document.getElementById("downloadPatchButton").innerHTML +=
                  "<button class='btn btn-primary' onclick='openDNSInstructions();' style='left:50%; transform:translate(-50%, 0); width:95%; margin-right:10px; position:relative;'><i class='fa fa-wifi' style='margin-right:5px;'></i> <b>DNS Patch</b></button><li><hr class='dropdown-divider'></li>";
                document.getElementById("downloadPatchButton").innerHTML +=
                  "<a href='/patches/wiilink-wfc-mkw-geckoos.zip'><button class='btn btn-secondary' style='left:50%; transform:translate(-50%, 0); width:95%; margin-right:10px; position:relative;'><i class='fa fa-gamepad' style='margin-right:5px;'></i> <b>Gecko helper for Wii</b></button></a><li></a><hr class='dropdown-divider'></li>";
              }

              // Format data better
              for (let l = 0; l < data[j].patchId.length; l++) {
                var patchRegion = "Unknown";
                var patchEmoji = "🌍";
                switch (data[j].patchId[l].charAt(3)) {
                  case "E":
                    patchRegion = "NTSC-U";
                    patchEmoji = "🇺🇸";
                    break;
                  case "P":
                    patchRegion = "PAL";
                    patchEmoji = "🇪🇺";
                    break;
                  case "J":
                    patchRegion = "NTSC-J";
                    patchEmoji = "🇯🇵";
                    break;
                  case "K":
                    patchRegion = "NTSC-K";
                    patchEmoji = "🇰🇷";
                    break;
                }

                document.getElementById("onlineSpecialInfo").style.display =
                  "block";
                document.getElementById("downloadPatchButton").innerHTML +=
                  "<li style='cursor:pointer; display:flex; flex-direction:row; align-items:center;'>" +
                  "<div class='dropdown-item' style='display:flex; gap:8px; flex-direction:row; justify-content:space-between;'><p style='margin-bottom:0;' onclick='downloadGCT(\"" +
                  data[j].patchId[l] +
                  '", "/patches/' +
                  data[j].patchId[l] +
                  ".txt\")'>" +
                  patchEmoji +
                  "  " +
                  data[j].patchId[l].slice(0, 4) +
                  data[j].patchId[l].slice(5) +
                  "(" +
                  patchRegion +
                  ")</p><div><span class='badge' style='font-size:15px; color:black; background-color:#00000010; font-weight:normal; transition:0.1s;' onclick='downloadGCT(\"" +
                  data[j].patchId[l] +
                  '", "/patches/' +
                  data[j].patchId[l] +
                  ".txt\")'>.gct</span><a href='/patches/" +
                  data[j].patchId[l] +
                  ".txt' style='text-decoration:none;' download> <span class='badge' style='font-size:15px;  color:black; background-color:#00000010; font-weight:normal; transition:0.1s;'>.txt</span></a></div></div></li>";
              }
              document.getElementById("downloadPatchButton").innerHTML +=
                "<hr style='margin:8px 0;'><li style='transform:translate(15px, 0); margin-top:5px; font-size:15px; opacity:0.5;'><i class='fa fa-circle-info'></i> These patches are <u>gecko codes</u><br style='margin-bottom:8px;'><a href='/setup' style='text-decoration:none;'><i class='fa fa-circle-question'></i> How do I install?</a></li>";
              fetchCompatData(data[j].patchId[0].substring(0, 3)).then(
                (data) => {
                  switch (data[0][1]) {
                    case "Not tested":
                      data[0][1] =
                        "<i class='fa fa-circle-question' style='color:gray;'></i> " +
                        data[0][1];
                      break;
                    case "Gameplay works":
                      data[0][1] =
                        "<i class='fa fa-circle-check' style='color:green;'></i> " +
                        data[0][1];
                      break;
                    case "Login fail":
                      data[0][1] =
                        "<i class='fa fa-circle-exclamation' style='color:red;'></i> " +
                        data[0][1];
                      break;
                    case "Error 20910":
                      data[0][1] =
                        "<i class='fa fa-circle-exclamation' style='color:red;'></i> " +
                        data[0][1];
                      break;
                    default:
                      data[0][1] =
                        "<i class='fa fa-circle-question' style='color:gray;'></i> " +
                        data[0][1];
                      break;
                  }

                  document.getElementById("compat").innerHTML +=
                    "<center>" +
                    data[0][1] +
                    "</center><li><div style='width:100%; margin-top:8px; padding:8px; background-color:#00000020; border-radius:4px; position:relative;'>" +
                    data[0][2] +
                    "</div></li>";
                }
              );

              // Hide the MKW link if the game is MKW
              if (
                data[j].gameId == "mariokartwii" ||
                data[j].gameId.startsWith("RMC")
              ) {
                document.getElementById("mkwlink").style.display = "none";
              }

              for (let l = 0; l < data.length; l++) {
                if (
                  data[l]?.gamespyId &&
                  data[l]?.gamespyId.substring(0, 3) ==
                  id.textContent.substring(0, 3)
                ) {
                  onlineUpdater(data[l]); // Fetch data on page load
                  setInterval(() => {
                    onlineUpdater(data[l]); // Fetch data on a 5 second interval
                  }, 5000);
                }
              }
            }
          }
        });

      break;
    }
  }
  if (localStorage.getItem("displayMode") != "utilitarian") {
    getRecommendedTitles(mainGenre, x);
  }
}
