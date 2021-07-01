const API_KEY = "PKSSJH4T5HZL15DXGM49";
const API_SECRET = "axb4eQ8sQlA9ULzngpc6dZbVwk6i2zArWM4Ow6nH";
const MINUTE = 60000;
const PAPER = true;
var theKill = false;

const theStock = "AAPL";
var theticker_default = "AAPL";
var theqty_default = 10;

const testissue = true;

function run_run() {
  writeToEventLog("Starting Script");
  var runIt = new JakesCode(API_KEY, API_SECRET);
  runIt.run();
}

function run_stop() {
  writeToEventLog("Stopping Script");
  var runIt = new JakesCode(API_KEY, API_SECRET);
  runIt.stopIt();
}

function run_myAccount() {
  var runIt = new theTest(API_KEY, API_SECRET);
  runIt.myaccount();
}

function run_submitOrder() {
  var theticker = document.getElementById("ticker").value;
  var theqty = document.getElementById("qty").value;

  if (theticker == "") {
    theticker = theticker_default;
  }
  if (theqty == "") {
    theqty = theqty_default;
  }

  var runIt = new theTest(API_KEY, API_SECRET);
  runIt.submitMarketOrder(theqty, theticker, "buy");
  setTimeout(() => {
    run_myAccount();
  }, 500);
}

function run_cancelAll() {
  var runIt = new theTest(API_KEY, API_SECRET);
  runIt.cancelAll();
  setTimeout(() => {
    run_myAccount();
  }, 500);
}

function writeToEventLog(text) {
  //console.log(`${text}`);
  var someDiv = document.querySelector(".log-output");
  var addBreak = document.createElement("br");
  someDiv.append(`${text}`,addBreak);
  someDiv.scrollTop = someDiv.scrollHeight;
}
