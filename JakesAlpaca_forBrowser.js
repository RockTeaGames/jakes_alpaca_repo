const API_KEY = "PKDSBV3IAVADYZVKMIOT";
const API_SECRET = "Fm6mMt7Ghh3QK2HBm4xtASacoqdABpWoboJOsdK2";
const MINUTE = 60000;
const PAPER = true;
var theKill = false;

var theStock_default = "GPRO";
//var theqty_default = 10;

const testissue = true;

function set_default_stock(){
  document.getElementById("ticker").placeholder = theStock_default;
}

function run_run() {
  //writeToEventLog("Starting Script");
  var theStock = document.getElementById("ticker").value;
  if (theStock == "") {
    theStock = theStock_default;
  }
  var runIt = new JakesCode(API_KEY, API_SECRET, PAPER, theStock);
  runIt.run();
}

function run_stop() {
  writeToEventLog("Stopping Script");
  var theStock = document.getElementById("ticker").value;
  if (theStock == "") {
    theStock = theStock_default;
  }
  var runIt = new JakesCode(API_KEY, API_SECRET, PAPER, theStock);
  runIt.stopIt();
  //send_logEmail();
}

function send_logEmail(){
  var email_to = "rochteja@outlook.com";
  var email_Subject = "Alpaca String Log | " + Date();
  var email_Body = document.querySelector('.log-output').innerHTML.replace(/<br>/g,' %0D ');
  //console.log(email_Body.length)
  window.open('mailto:'+ email_to +'?subject=' + email_Subject + '&body=' + email_Body)
}

function run_myAccount() {
  var runIt = new theTest(API_KEY, API_SECRET);
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
  var theStock = document.getElementById("ticker").value;
  if (theStock == "") {
    theStock = theStock_default;
  }
  var runIt = new JakesCode(API_KEY, API_SECRET, PAPER, theStock);
  runIt.rebalance();
  //writeToEventLog("Manual Rebalance Finished");
}
