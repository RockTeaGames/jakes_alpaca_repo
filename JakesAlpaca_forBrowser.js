const API_KEY = "PKSSJH4T5HZL15DXGM49";
const API_SECRET = "axb4eQ8sQlA9ULzngpc6dZbVwk6i2zArWM4Ow6nH";
const MINUTE = 60000;
const PAPER = true;
var theKill = false;

var theStock_default = "AAPL";
//var theqty_default = 10;

const testissue = true;

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
