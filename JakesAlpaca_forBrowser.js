var PAPER;
var theStock;
var API_KEY_paper;
var API_SECRET_paper;
var API_KEY;
var API_SECRET;
const MINUTE = 60000;
var theKill = false;

const testissue = true;

function website_load() {
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
    document.querySelector(".theTitle").innerHTML = "Jake's Alpaca | PAPER Trading"
  } else {
    PAPER = false;
    API_KEY = API_KEY_real;
    API_SECRET = API_SECRET_real;
    document.getElementById("paper_checkbox").checked = false;
    document.querySelector(".theTitle").innerHTML = "Jake's Alpaca | LIVE Trading"
  }

  const navToggle = document.querySelector(".nav__toggle");
  navToggle.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });

  //console.log(PAPER,API_KEY,API_SECRET);
}

function save_keys() {
  const PAPER = document.getElementById("paper_checkbox");
  const theStock = document.querySelector(".nav-input-stock").value;

  const theKeyPaper = document.querySelector(".nav-paper-key").value;
  const theSecretPaper = document.querySelector(".nav-paper-secret").value;
  const theKeyReal = document.querySelector(".nav-real-key").value;
  const theSecretReal = document.querySelector(".nav-real-secret").value;

  localStorage.setItem("PAPER", PAPER.checked);
  localStorage.setItem("STOCK", theStock);
  localStorage.setItem("API_KEY_paper", theKeyPaper);
  localStorage.setItem("API_SECRET_paper", theSecretPaper);
  localStorage.setItem("API_KEY_real", theKeyReal);
  localStorage.setItem("API_SECRET_real", theSecretReal);

  website_load();
}

function run_run() {
  theKill = false;
  //writeToEventLog("Starting Script");
  //theStock = document.getElementById("ticker").value;
  var runIt = new JakesCode(API_KEY, API_SECRET, PAPER, theStock);
  runIt.run();
}

function run_stop() {
  theKill = true;
  writeToCurrStatus("Script Stopped", "");
  writeToEventLog("Stopping Script");
  //theStock = document.getElementById("ticker").value;
  var runIt = new JakesCode(API_KEY, API_SECRET, PAPER, theStock);
  runIt.stopIt();
  //send_logEmail();
}

function send_logEmail() {
  var email_to = "rochteja@outlook.com";
  var email_Subject = "Alpaca String Log | " + Date();
  var email_Body = document
    .querySelector(".log-output")
    .innerHTML.replace(/<br>/g, " %0D ");
  //console.log(email_Body.length)
  window.open(
    "mailto:" + email_to + "?subject=" + email_Subject + "&body=" + email_Body
  );
}

function run_myAccount() {
  var runIt = new theTest(API_KEY, API_SECRET,PAPER,theStock);
  runIt.myaccount();
  //createChart();
}
/*
function run_submitOrder() {
  var theticker = document.getElementById("ticker").value;
  var theqty = document.getElementById("qty").value;

  if (theticker == "") {
    theticker = theticker_default;
  }
  if (theqty == "") {
    theqty = theqty_default;
  }

  var runIt = new theTest(API_KEY, API_SECRET,PAPER,theStock);
  runIt.submitMarketOrder(theqty, theticker, "buy");
  setTimeout(() => {
    run_myAccount();
  }, 500);
}

function run_cancelAll() {
  var runIt = new theTest(API_KEY, API_SECRET,PAPER,theStock);
  runIt.cancelAll();
  setTimeout(() => {
    run_myAccount();
  }, 500);
}
*/
function writeToEventLog(text) {
  //console.log(`${text}`);
  var someDiv = document.querySelector(".log-output");
  var addBreak = document.createElement("br");
  someDiv.append(`${text}`, addBreak);
  someDiv.scrollTop = someDiv.scrollHeight;
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

function createChart(chartData, refreshTime) {
  chartObj = document.getElementById("chart");

  var chartlayout = {
    title: "Refreshed: " + refreshTime,
    margin: { t: 30, b: 30, l: 45, r: 30 },
    layout: {
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
    },
    grid: {
      rows: 3,
      columns: 1,
      roworder: "top to bottom",
    },
  };

  Plotly.newPlot(chartObj, chartData, chartlayout);
}

function manual_rebalance() {
  writeToEventLog("Manual Rebalance Started");
  //theStock = document.getElementById("ticker").value;
  var runIt = new JakesCode(API_KEY, API_SECRET, PAPER, theStock);
  runIt.rebalance();
  //writeToEventLog("Manual Rebalance Finished");
}
