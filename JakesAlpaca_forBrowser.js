var PAPER;
var theStock;
var API_KEY_paper;
var API_SECRET_paper;
var API_KEY_real;
var API_SECRET_real;
var API_KEY;
var API_SECRET;

const MINUTE = 60000;
var theKill = false;

var theMACD;

const testissue = true;

function website_load(firstLoad) {
  PAPER = localStorage.getItem("PAPER");
  theStock = localStorage.getItem("STOCK");

  API_KEY_paper = localStorage.getItem("API_KEY_paper");
  API_SECRET_paper = localStorage.getItem("API_SECRET_paper");
  API_KEY_real = localStorage.getItem("API_KEY_real");
  API_SECRET_real = localStorage.getItem("API_SECRET_real");

  document.querySelector(".nav-input-stock").value = theStock;
  document.querySelector(".nav-paper-key").value = API_KEY_paper;
  document.querySelector(".nav-paper-secret").value = API_SECRET_paper;
  document.querySelector(".nav-real-key").value = API_KEY_real;
  document.querySelector(".nav-real-secret").value = API_SECRET_real;

  if (PAPER == "true") {
    PAPER = true;
    API_KEY = API_KEY_paper;
    API_SECRET = API_SECRET_paper;
    document.getElementById("paper_checkbox").checked = true;
    document.querySelector(".theTitle").innerHTML =
      "Jake's Alpaca | PAPER Trading";
  } else {
    PAPER = false;
    API_KEY = API_KEY_real;
    API_SECRET = API_SECRET_real;
    document.getElementById("paper_checkbox").checked = false;
    document.querySelector(".theTitle").innerHTML =
      "Jake's Alpaca | LIVE Trading";
  }

  if (firstLoad == true) {
    document.querySelector(".nav__toggle").addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
      save_keys();
    });
  }
}

function save_keys() {
  PAPER = document.getElementById("paper_checkbox");
  theStock = document.querySelector(".nav-input-stock").value;

  API_KEY_paper = document.querySelector(".nav-paper-key").value;
  API_SECRET_paper = document.querySelector(".nav-paper-secret").value;
  API_KEY_real = document.querySelector(".nav-real-key").value;
  API_SECRET_real = document.querySelector(".nav-real-secret").value;

  localStorage.setItem("PAPER", PAPER.checked);
  localStorage.setItem("STOCK", theStock);
  localStorage.setItem("API_KEY_paper", API_KEY_paper);
  localStorage.setItem("API_SECRET_paper", API_SECRET_paper);
  localStorage.setItem("API_KEY_real", API_KEY_real);
  localStorage.setItem("API_SECRET_real", API_SECRET_real);

  website_load(false);
}

function theLocalDateTime() {
  const theDateTime =
    new Date().toLocaleDateString("en-US") +
    " @ " +
    new Date().toLocaleTimeString("en-US");
  return theDateTime;
}

function run_run() {
  theKill = false;
  writeToEventLog("Script Started: " + theLocalDateTime());
  //writeToEventLog("Starting Script");
  //theStock = document.getElementById("ticker").value;
  theMACD = new MACDScript(API_KEY, API_SECRET, PAPER, theStock);
  theMACD.run();
}

function run_stop() {
  try {
    theKill = true;
    theMACD.stopIt();
    writeToCurrStatus("Script Not Running", "");
    writeToEventLog("Stopping Script: " + theLocalDateTime());
  } catch {
    writeToEventLog("Script not initialized!");
  }
  //send_logEmail();
}

function run_myAccount() {
  var ManualFuncs = new ManualAPIFunctions(
    API_KEY,
    API_SECRET,
    PAPER,
    theStock
  );
  ManualFuncs.myaccount();
  //createChart();
}

function writeToEventLog(text) {
  //console.log(`${text}`);
  var someDiv = document.querySelector(".log-output");
  var addBreak = document.createElement("br");
  someDiv.prepend(`${text}`, addBreak);
  // someDiv.scrollTop = someDiv.scrollHeight;
}

function writeToCurrStatus(textTop, textBot) {
  //console.log(textTop,textBot)
  if (textTop != undefined || textTop != null) {
    document.querySelector(".status-top").innerHTML = textTop;
  }
  if (textBot != undefined || textBot != null) {
    document.querySelector(".status-bot").innerHTML = textBot;
  }
}

function manual_rebalance() {
  writeToEventLog("Manual Rebalance Started");
  theMACD = new MACDScript(API_KEY, API_SECRET, PAPER, theStock);
  theMACD.rebalance();
}

function theTest() {

  return fetch(`https://api.alpaca.markets/v2/puzzle/202108/hint/3131302d646179732d61667465722d6c65686d616e2d636f6c6c61707365642e6a7067`, {
    method: 'get', 
    mode: 'cors', 
    headers: {
      // "s": '3131302d646179732d61667465722d6c65686d616e2d636f6c6c61707365642e6a7067',
      "APCA-API-KEY-ID": 'PKRWGNPNNCEZ4SQCBO3Y', 
      "APCA-API-SECRET-KEY": '8FZTsX1r2aH8c1kewUvIqb0bwPBtpfoqTUgkUvG0'
    },
    body: undefined,
  }).then((resp) => {
    return resp.json();
  });

}