class theTest {
  constructor(API_KEY, API_SECRET, PAPER, theStock) {
    var theBaseURL;
    if (PAPER == true) {
      theBaseURL = "https://paper-api.alpaca.markets";
    } else {
      theBaseURL = "https://api.alpaca.markets";
    }

    this.alpaca = new AlpacaCORS({
      keyId: API_KEY,
      secretKey: API_SECRET,
      baseUrl: theBaseURL,
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
