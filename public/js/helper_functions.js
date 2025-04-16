// Receives a base64 string and returns a link to the rendered mii image
export function renderMii(base64String) {
  // Decode base64 string
  let binaryString = atob(base64String);
  let binaryLen = binaryString.length;
  // Create binary array from base64 decoded string
  let bytes = new Uint8Array(binaryLen);
  // Fill the binary array
  for (let i = 0; i < binaryLen; i++) {
    let ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }

  // Create a blob object
  let blob = new Blob([bytes], { type: "application/octet-stream" });

  // Create a file object from the blob
  let file = new File([blob], "file.miigx");

  // Send the file to the server
  let formData = new FormData();
  formData.append("platform", "wii");
  formData.append("data", file);

  // Use larsen's funky studio.cgi to get the data needed to render the mii
  return fetch("https://miicontestp.wii.rc24.xyz/cgi-bin/studio.cgi", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      let mii = data.mii;

      // Render the mii using Nintendo's servers
      var src =
        "https://studio.mii.nintendo.com/miis/image.png?data=" +
        mii +
        "&type=face_only&expression=normal&width=270&bgColor=FFFFFF00";

      // Return the mii image
      return src;
    });
}

export function prettifyDateTime(timestamp) {
  const dateObj = new Date(timestamp);

  const hour = dateObj.getHours();
  const minute = dateObj.getMinutes();
  const second = dateObj.getSeconds();

  return (`${hour < 10 ? "0" : ""}${hour}:${minute < 10 ? "0" : ""}${minute}:${second < 10 ? "0" : ""
    }${second}`);
}

export function getConnMatrix(connMatrix) {
  const arr = connMatrix.split("&&");
  const names = [];
  connMatrix = [];

  for (let i = 0; i < arr.length; i++) {
    if (i % 2 === 0) {
      names.push(arr[i]);
    } else {
      connMatrix.push(arr[i]);
    }
  }

  for (let i = 0; i < connMatrix.length; i++) {
    connMatrix[i] = connMatrix[i].split("");
    connMatrix[i].splice(i, 0, "\\");
  }

  function emojify(value) {
    switch (value) {
      case "0":
        return " ⬜️ ";
      case "1":
        return " 🟨 ";
      case "2":
        return " 🟩 ";
      case "3":
        return " 🟥 ";
      case "\\":
        return " <b>╲</b> ";
    }
  }

  // display the matrix in a div
  let connMatrixHtml = "<div class='conn-matrix' style='width:280px; padding:20px;'>";
  for (let i = 0; i < connMatrix.length; i++) {
    connMatrixHtml += "<div class='conn-row' style='display:flex; align-items:center; justify-content:space-between;'><div style='font-family:miifont, system-ui;'>" + names[i] + "</div><div style='background-color:#00000010; padding-left:5px; padding-right:5px; border-radius:4px;'>";
    for (let j = 0; j < connMatrix[i].length; j++) {
      connMatrixHtml += emojify(connMatrix[i][j]);
    }
    connMatrixHtml += "</div></div>";
  }
  connMatrixHtml += "</div>";

  return connMatrixHtml;
}

const spreadsheetId = "1KeRbKQ2UwlysHSTtfkiZneLNRq4yDXs2Y-vXt8jHAro";
const ranges = ["B:B", "E:E", "F:F"];
const key = "AIzaSyA3ni8rP12zKhLKb96ZE92grnJGgUcCwfM";

// Function to compatibility data for certain title
export async function fetchCompatData(id) {
  try {
    const data = await Promise.all(
      ranges.map((range) =>
        fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${key}`
        ).then((response) => response.json())
      )
    );

    // We receive an array with 3 objects, each containing the values of the range, we format it into an array with the values combined
    let combined = data[0].values.map((value, i) => [
      value[0],
      data[1].values[i][0],
      data[2].values[i][0],
    ]);

    // Remove the header row (the first one)
    combined.shift();

    // Filter the data based on the three-letter ID passed as argument
    let filtered = combined.filter((value) => value[0] === id);

    return filtered;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Loads the correct GameTDB URL image depending on the region of the game
export function loadImage(format, title) {
  const wiiUrl = (() => {
    switch (title.charAt(3)) {
      case "E":
        return `https://art.gametdb.com/wii/${format}/US/${title}.png`;
      case "P":
      case "D":
      case "H":
      case "X":
      case "Y":
      case "F":
        return `https://art.gametdb.com/wii/${format}/EN/${title}.png`;
      case "J":
        return `https://art.gametdb.com/wii/${format}/JA/${title}.png`;
      case "K":
        return `https://art.gametdb.com/wii/${format}/KO/${title}.png`;
      default:
        return null;
    }
  })();

  let type;
  switch (format) {
    case "cover":
      type="coverfullHQ";
      break;
    case "disc":
      type="cover";
      break;
  }

  const dsUrl = (() => {
    switch (title.charAt(3)) {
      case "E":
        return `https://art.gametdb.com/ds/${type}/US/${title}.jpg`;
      case "P":
      case "D":
      case "H":
      case "X":
      case "Y":
      case "F":
        return `https://art.gametdb.com/ds/${type}/EN/${title}.jpg`;
      case "J":
        return `https://art.gametdb.com/ds/${type}/JA/${title}.jpg`;
      case "K":
        return `https://art.gametdb.com/ds/${type}/KO/${title}.jpg`;
      default:
        return null;
    }
  })();

  // Return a fallback mechanism for the image
  return wiiUrl
    ? `${wiiUrl}" onerror="this.onerror=null;this.src='${dsUrl}'`
    : `${dsUrl}`;
}

// Obtains an accompanying icon for the genre of the game
export function getIconForGenre(genre) {
  switch (genre) {
    case "action":
      return "fa-fist-raised";
    case "adventure":
      return "fa-hiking";
    case "racing":
      return "fa-car-side";
    case "party":
      return "fa-gift";
    case "board game":
      return "fa-dice";
    case "strategy":
      return "fa-chess";
    case "puzzle":
      return "fa-puzzle-piece";
    case "sports":
      return "fa-football-ball";
    case "simulation":
      return "fa-gamepad";
    case "music":
      return "fa-music";
    case "horror":
      return "fa-ghost";
    case "shooter":
      return "fa-crosshairs";
    case "fighting":
      return "fa-user-ninja";
    case "platform":
      return "fa-running";
    case "rpg":
      return "fa-dragon";
    case "bike racing":
      return "fa-motorcycle";
    case "kart racing":
      return "fa-flag-checkered";
    case "platformer":
      return "fa-running";
    // More to be added
    default:
      return "fa-circle-solid";
  }
}

// Obtains the correct age rating image for the game
export function getRating(rating, classification) {
  switch (rating) {
    case "3":
      return '<img src="/img/ratings/pegi3.jpg" alt="Pegi 3" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "7":
      return '<img src="/img/ratings/pegi7.jpg" alt="Pegi 7" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "12":
      if (classification == "PEGI") {
        return '<img src="/img/ratings/pegi12.jpg" alt="Pegi 12" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';
      } else {
        return '<img src="/img/ratings/grac-12.jpg" alt="Pegi 12" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';
      }

    case "16":
      return '<img src="/img/ratings/pegi16.jpg" alt="Pegi 16" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "18":
      if (classification == "PEGI") {
        return '<img src="/img/ratings/pegi18.jpg" alt="Pegi 18" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';
      } else {
        return '<img src="/img/ratings/grac-18.jpg" alt="Pegi 18" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';
      }

    case "EC":
      return '<img src="/img/ratings/esrb-ec.webp" alt="ESRB EC" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "E":
      return '<img src="/img/ratings/esrb-e.webp" alt="ESRB E" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "E10+":
      return '<img src="/img/ratings/esrb-e10.webp" alt="ESRB E10+" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "T":
      return '<img src="/img/ratings/esrb-t.webp" alt="ESRB T" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "M":
      return '<img src="/img/ratings/esrb-m.webp" alt="ESRB M" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "A":
      return '<img src="/img/ratings/cero-a.png" alt="CERO A" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "B":
      return '<img src="/img/ratings/cero-b.png" alt="CERO B" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "C":
      return '<img src="/img/ratings/cero-c.png" alt="CERO C" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "D":
      return '<img src="/img/ratings/cero-d.png" alt="CERO D" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "Z":
      return '<img src="/img/ratings/cero-z.png" alt="CERO Z" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "ALL":
      return '<img src="/img/ratings/grac-all.svg" alt="ALL AGES" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    case "15":
      return '<img src="/img/ratings/grac-15.svg" alt="ALL AGES" style="margin-top:20px; width:130px; left:50%; transform:translate(-50%, 0); position:relative;">';

    default:
      return "<b>Oh snap!</b><br>This title does not have an age rating.";
  }
}

// Obtains the correct controller image for each control type
export function getController(controller) {
  if (controller) {
    switch (controller.type) {
      case "wiimote":
        if (controller.required == "true") {
          return `<img src="/img/controllers/wiimote.svg" style="margin-right:15px; filter:brightness(1000); transform:translate(-150%, 0px);" height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/wiimote.svg" style="margin-right:15px; filter:brightness(1000); transform:translate(-150%, 0px);" height="60px">`;
        }
      case "motionplus":
        if (controller.required == "true") {
          return `<img src="/img/controllers/motionplus.svg" style="margin-right:15px; filter:brightness(1000);"height="60px"><span style="font-size:10px; transform:translate(-80%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/motionplus.svg" style="margin-right:15px; filter:brightness(1000);"height="60px">`;
        }
      case "nunchuk":
        if (controller.required == "true") {
          return `<img src="/img/controllers/nunchuk.svg" style="margin-right:15px; filter:brightness(1000);"height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/nunchuk.svg" style="margin-right:15px; filter:brightness(1000);"height="60px">`;
        }
      case "classiccontroller":
        if (controller.required == "true") {
          return `<img src="/img/controllers/classiccontroller.svg" style="margin-right:15px; filter:brightness(1000);"height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/classiccontroller.svg" style="margin-right:15px; filter:brightness(1000);"height="60px">`;
        }
      case "wheel":
        if (controller.required == "true") {
          return `<img src="/img/controllers/wheel.svg" style="margin-right:15px; filter:brightness(1000);"height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/wheel.svg" style="margin-right:15px; filter:brightness(1000);"height="60px">`;
        }
      case "gamecube":
        if (controller.required == "true") {
          return `<img src="/img/controllers/gamecube.svg" style="margin-right:15px; filter:brightness(1000); scale:85%;" height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/gamecube.svg" style="margin-right:15px; filter:brightness(1000); scale:85%;" height="60px">`;
        }
      case "balanceboard":
        if (controller.required == "true") {
          return `<img src="/img/controllers/balanceboard.svg" style="margin-right:15px; filter:brightness(1000);"height="50px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/balanceboard.svg" style="margin-right:15px; filter:brightness(1000);"height="50px">`;
        }
      case "zapper":
        if (controller.required == "true") {
          return `<img src="/img/controllers/zapper.svg" style="margin-right:15px; filter:brightness(1000);"height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/zapper.svg" style="margin-right:15px; filter:brightness(1000);"height="60px">`;
        }
      case "guitar":
        if (controller.required == "true") {
          return `<img src="/img/controllers/guitar.png" style="margin-right:15px; filter:invert(1);"height="70px"><span style="font-size:10px; transform:translate(-100%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/guitar.png" style="margin-right:15px; filter:invert(1);"height="70px">`;
        }
      case "keyboard":
        if (controller.required == "true") {
          return `<img src="/img/controllers/keyboard.png" style="margin-right:15px; filter:brightness(1000);"height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/keyboard.png" style="margin-right:15px; filter:brightness(1000);"height="60px">`;
        }
      case "drums":
        if (controller.required == "true") {
          return `<img src="/img/controllers/drums.png" style="margin-right:15px; filter:invert(1);"height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/drums.png" style="margin-right:15px; filter:invert(1);"height="60px">`;
        }
      case "microphone":
        if (controller.required == "true") {
          return `<img src="/img/controllers/microphone.png" style="margin-right:15px; filter:invert(1);"height="50px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/microphone.png" style="margin-right:15px; filter:invert(1);"height="50px">`;
        }
      case "nintendods":
        if (controller.required == "true") {
          return `<img src="/img/controllers/nintendods.svg" style="margin-right:15px; filter: invert(1) brightness(1000); scale:80%;"height="60px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/nintendods.svg" style="margin-right:15px; filter:invert(1) brightness(1000); scale:80%;" height="60px">`;
        }
      case "wiispeak":
        if (controller.required == "true") {
          return `<img src="/img/controllers/wiispeak.png" style="margin-right:15px; filter:brightness(1000);"height="40px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/wiispeak.png" style="margin-right:15px; filter:brightness(1000);"height="40px">`;
        }
      case "udraw":
        if (controller.required == "true") {
          return `<img src="/img/controllers/udraw.svg" style="margin-right:15px; filter:brightness(1000);"height="50px"><span style="font-size:10px; transform:translate(-125%, 40px); position:absolute;" class="badge text-bg-danger">Required</span></img>`;
        } else {
          return `<img src="/img/controllers/udraw.svg" style="margin-right:15px; filter:brightness(1000);"height="50px">`;
        }
      case "mii":
        break;
      default:
        return '<img src="/img/controllers/nintendods.svg" alt="DS Controller" style="width:50px; height:auto; transform:translate(0, -10px); filter:invert(1);"/>';
    }
  } else {
    return '<img src="/img/controllers/nintendods.svg" alt="DS Controller" style="width:50px; height:auto; transform:translate(0, -10px); filter:invert(1);"/>';
  }
}

// Prevents HTML injection in the usernames
export function sanitizeHTML(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

export function getOnlineCompat(id, players, features) {
  const blocklist = [
    'RCD',
    'RVY',
    'SC7',
    'RJA',
    'SM8',
  ]

  if (parseInt(players) == 0 && features == undefined) {
    return '<i class="fa-solid fa-triangle-exclamation"></i> This title does not support online multiplayer.';
  } else if (parseInt(players) == 0 && features.length > 0) {
    return '<i class="fa-solid fa-triangle-exclamation"></i> This title does not support online multiplayer, but has online features.';
  }

  if (blocklist.includes(id.substring(0, 3))) {
    return '<i class="fa-solid fa-triangle-exclamation"></i> This title uses a different online system, therefore it is not compatible with WiiLink WFC.';
  }

  return 1;
}

export function getPreferredStyle() {
  let displayMode = localStorage.getItem("displayMode") || "complete";

  // Initialize style variables with defaults
  let styles = {
    display: "display:grid;",
    extraDisplay: "display:flex;",
    sizeFix: "height:86%; margin-top:15px;",
    size1: "grid-column: auto / span 5; grid-row: auto / span 2;",
    size2: "grid-column: auto / span 5; grid-row: auto / span 2;",
    size3: "grid-column: auto / span 6; grid-row: auto / span 1;",
    size4: "grid-column: auto / span 6; grid-row: auto / span 1;",
    hideErrElement: false
  };

  switch (displayMode) {
    case "compact":
      styles.display = "display:none;";
      styles.size1 = "grid-column: auto / span 3; grid-row: auto / span 2;";
      styles.size2 = "grid-column: auto / span 9; grid-row: auto / span 2;";
      styles.size3 = "grid-column: auto / span 2; grid-row: auto / span 1;";
      styles.size4 = "grid-column: auto / span 10; grid-row: auto / span 1;";
      styles.sizeFix = "height:100%; margin-top:0px;";
      break;

    case "utilitarian":
      styles.display = "display:none !important;";
      styles.extraDisplay = "display:none !important;";
      styles.sizeFix = "height:100%; margin-top:0px;";
      styles.size2 = "grid-column: auto / span 12; grid-row: auto / span 2;";
      styles.size3 = "grid-column: auto / span 2; grid-row: auto / span 1;";
      styles.size4 = "grid-column: auto / span 10; grid-row: auto / span 1;";
      styles.hideErrElement = true;
      break;
  }

  // Apply styles to DOM elements if they exist
  if (typeof document !== 'undefined') {
    const elements = {
      "size1": document.querySelectorAll(".size1"),
      "size2": document.querySelectorAll(".size2"),
      "size3": document.querySelectorAll(".size3"),
      "size4": document.querySelectorAll(".size4")
    };

    // Apply styles to elements with corresponding classes
    for (const [className, style] of Object.entries(styles)) {
      if (elements[className]) {
        elements[className].forEach(el => {
          el.setAttribute("style", el.getAttribute("style") + ";" + style);
        });
      }
    }

    // Special handling for the error element
    if (styles.hideErrElement && document.getElementById("errhide")) {
      document.getElementById("errhide").style.display = "none";
    }
  }

  return styles;
}
