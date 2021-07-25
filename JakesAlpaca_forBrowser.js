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
  var runIt = new theTest(API_KEY, API_SECRET, PAPER, theStock);
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

function createTheChart(
  plot_bars,
  plot_EMA12,
  plot_EMA26,
  plot_MACD,
  plot_MACDsignal,
  plot_MACDgo
) {
  document.getElementById("topChart").innerHTML = "";
  document.getElementById("botChart").innerHTML = "";
  //const chartHeight = document.getElementById("topChart").clientHeight ;
  //console.log(chartHeight);
  const topchart = LightweightCharts.createChart(
    document.getElementById("topChart"),
    {
      //width: chartWidth,
      //height: chartHeight,
      layout: {
        backgroundColor: "rgba(0, 0, 0, 0)",
        textColor: "rgba(0, 0, 0, 1)",
      },
      grid: {
        vertLines: {
          color: "rgba(100, 100, 100, 0.5)",
          style: LightweightCharts.LineStyle.Dotted,
        },
        horzLines: {
          color: "rgba(100, 100, 100, 0.5)",
          style: LightweightCharts.LineStyle.Dotted,
        },
      },
    }
  );
  //topchart.timeScale().fitContent();
  topchart.applyOptions({
    timeScale: {
      timeVisible: true,
    },
  });

  const botchart = LightweightCharts.createChart(
    document.getElementById("botChart"),
    {
      //width: chartWidth,
      //height: chartHeight,
      layout: {
        backgroundColor: "rgba(0, 0, 0, 0)",
        textColor: "rgba(0, 0, 0, 1)",
      },
      grid: {
        vertLines: {
          color: "rgba(100, 100, 100, 0.5)",
          style: LightweightCharts.LineStyle.Dotted,
        },
        horzLines: {
          color: "rgba(100, 100, 100, 0.5)",
          style: LightweightCharts.LineStyle.Dotted,
        },
      },
    }
  );
  //botchart.timeScale().fitContent();
  botchart.applyOptions({
    timeScale: {
      timeVisible: true,
    },
  });

  const barsSeries = topchart.addLineSeries({
    color: "rgba(0,75,30,1)",
    //title: theStock,
  });
  barsSeries.setData(plot_bars);

  const EMA12Series = topchart.addLineSeries({
    color: "rgba(200,75,0,1)",
    //title: "EMA12",
  });
  EMA12Series.setData(plot_EMA12);

  const EMA26Series = topchart.addLineSeries({
    color: "rgba(0,100,200,1)",
    //title: "EMA26",
  });
  EMA26Series.setData(plot_EMA26);

  const MACDSeries = botchart.addLineSeries({
    color: "rgba(75, 100, 200,1)",
    //title: "MACD"
  });
  MACDSeries.setData(plot_MACD);

  const MACDSignalSeries = botchart.addLineSeries({
    color: "rgba(200, 100, 75,1)",
    //title: "MACDSignal"
  });
  MACDSignalSeries.setData(plot_MACDsignal);

  const MACDGoSeries = botchart.addHistogramSeries({
    //title: "MACDGo"
  });
  MACDGoSeries.setData(plot_MACDgo);
}

function manual_rebalance() {
  writeToEventLog("Manual Rebalance Started");
  //theStock = document.getElementById("ticker").value;
  var runIt = new JakesCode(API_KEY, API_SECRET, PAPER, theStock);
  runIt.rebalance();
  //writeToEventLog("Manual Rebalance Finished");
}
