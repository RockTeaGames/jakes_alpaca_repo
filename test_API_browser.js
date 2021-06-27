const API_KEY = "PKSSJH4T5HZL15DXGM49";
const API_SECRET = "axb4eQ8sQlA9ULzngpc6dZbVwk6i2zArWM4Ow6nH";
const MINUTE = 60000;
const PAPER = true;

const theStock = "AAPL";

class theTest {
  constructor(API_KEY, API_SECRET, PAPER) {
    this.alpaca = new AlpacaCORS({
      keyId: API_KEY,
      secretKey: API_SECRET,
      baseUrl: "https://paper-api.alpaca.markets",
    });
    this.stock = theStock;
  }

  async myaccount() {
    var myID = await this.alpaca.getAccount();
    var myIDstring = JSON.stringify(myID, null, 1);
    document.querySelector(".log-info").innerHTML = myIDstring;
    //someDiv.value = myIDstring;
  }

  async cancelAll() {
    var orders;
    await this.alpaca
      .getOrders({
        status: "open",
        direction: "asc",
      })
      .then((resp) => {
        orders = resp;
      })
      .catch((err) => {
        console.log(err.error);
      });
    orders.forEach(async (order) => {
      this.alpaca.cancelOrder(order.id).catch((err) => {
        console.log(err.error);
      });
      writeToEventLog("Order " + order.id + " canceled.");
    });
    writeToEventLog("Cancel Finished.");
  }

  async submitMarketOrder(quantity, stock, side) {
    if (quantity > 0) {
      await this.alpaca
        .createOrder({
          symbol: stock,
          qty: quantity,
          side: side,
          type: "market",
          time_in_force: "day",
        })
        .then((resp) => {
          this.lastOrder = resp;
          writeToEventLog(
            "Market order of |" +
              quantity +
              " " +
              stock +
              " " +
              side +
              "| completed."
          );
        })
        .catch((err) => {
          writeToEventLog(
            "Order of |" +
              quantity +
              " " +
              stock +
              " " +
              side +
              "| did not go through. " +
              err
          );
        });
    } else {
      writeToEventLog(
        "Quantity is <=0, order of |" +
          quantity +
          " " +
          stock +
          " " +
          side +
          "| not sent."
      );
    }
  }
}

function run_myAccount() {
  var runIt = new theTest(API_KEY, API_SECRET);
  runIt.myaccount();
  //writeToEventLog('this is a test');
}

function run_cancelAll() {
  var runIt = new theTest(API_KEY, API_SECRET);
  runIt.cancelAll();
  setTimeout(() => {
    run_myAccount();
  }, 500);
}

function run_submitOrder() {
  var theticker = document.getElementById("ticker").value;
  var theqty = document.getElementById("qty").value;

  var runIt = new theTest(API_KEY, API_SECRET);
  runIt.submitMarketOrder(theqty, theticker, "buy");
  setTimeout(() => {
    run_myAccount();
  }, 500);
}

function writeToEventLog(text) {
  //console.log(`${text}`);
  var someDiv = document.querySelector(".log-output");
  var addBreak = document.createElement("br");
  someDiv.append(addBreak, `${text}`);
  someDiv.scrollTop = someDiv.scrollHeight;
}
