class JakesCode {
  constructor(API_KEY, API_SECRET, PAPER, theStock) {
    this.alpaca = new AlpacaCORS({
      keyId: API_KEY,
      secretKey: API_SECRET,
      paper: PAPER,
      baseUrl: "https://paper-api.alpaca.markets",
    });

    this.lastOrder = null;
    this.timeToOpen = null;
    this.hoursToOpen = null;
    this.minsToOpen = null;
    this.timeToClose = null;
    // Stock that the algo will trade.
    this.stock = theStock;
  }

  async run() {
    // First, cancel any existing orders so they don't impact our buying power.
    //writeToEventLog("Starting Script using " + this.stock);
    writeToCurrStatus("Script Running with " + this.stock, null);
    var orders;
    await this.alpaca
      .getOrders({ status: "open", direction: "asc" })
      .then((resp) => {
        orders = resp;
      })
      .catch((err) => {
        writeToEventLog(err.error);
      });
    orders.forEach(async (order) => {
      await this.alpaca
        .cancelOrder(order.id)
        .then(writeToEventLog("Order " + order.id + " canceled."))
        .catch((err) => {
          writeToEventLog("Pre-script Cancelling error: " + err.error);
        });
    });
    writeToEventLog("Pre-Script Cancelling Finished.");

    await this.alpaca
      .cancelAllPositions()
      .then(writeToEventLog("Pre-Script Position Selling Finished."));

    var awaitMarketOpen = new Promise((resolve, reject) => {
      var check = setInterval(async () => {
        try {
          if (theKill) {
            clearInterval(check);
          }
          let clock = await this.alpaca.getClock();
          if (clock.is_open) {
            resolve();
            clearInterval(check);
          } else {
            let openTime = new Date(
              clock.next_open.substring(0, clock.next_close.length - 6)
            );
            let currTime = new Date(
              clock.timestamp.substring(0, clock.timestamp.length - 6)
            );
            this.timeToOpen = Math.floor((openTime - currTime) / 1000 / 60);
            this.hoursToOpen = Math.floor(this.timeToOpen / 60);
            this.minsToOpen = this.timeToOpen - this.hoursToOpen * 60;
            writeToCurrStatus(
              null,
              this.hoursToOpen +
                " hours, " +
                this.minsToOpen +
                " minutes until next open"
            );
            //writeToEventLog(`${this.timeToOpen} minutes til next market open.`);
          }
        } catch (err) {
          writeToEventLog("check if market open error: " + err.error);
        }
      }, MINUTE);
    });
    // Wait for market to open.
    writeToEventLog("Waiting for market to open...");
    await awaitMarketOpen;
    writeToEventLog("Market opened!");
    writeToCurrStatus(null, "");

    // Rebalance our portfolio every minute based off MACD
    var spin = setInterval(async () => {
      // Clear the last order so that we only have 1 hanging order.
      if (this.lastOrder != null)
        await this.alpaca.cancelOrder(this.lastOrder.id).catch((err) => {
          writeToEventLog("cancel last order error: " + err.error);
        });

      // Figure out when the market will close so we can prepare to sell beforehand.
      var closingTime;
      var currTime;
      await this.alpaca
        .getClock()
        .then((resp) => {
          closingTime = new Date(
            resp.next_close.substring(0, resp.next_close.length - 6)
          );
          currTime = new Date(
            resp.timestamp.substring(0, resp.timestamp.length - 6)
          );
        })
        .catch((err) => {
          writeToEventLog("getClock closing time error: " + err.error);
        });
      this.timeToClose = closingTime - currTime;

      if (this.timeToClose < MINUTE * 15) {
        // Close all positions when 15 minutes til market close.
        writeToEventLog("Market closing soon.  Closing positions.");
        try {
          await this.alpaca
            .getPosition(this.stock)
            .then(async (resp) => {
              var positionQuantity = resp.qty;
              var promOrder = this.submitMarketOrder(
                positionQuantity,
                this.stock,
                "sell"
              );
              await promOrder;
            })
            .catch((err) => {
              writeToEventLog("GetPosition to sell 15min error: " + err.error);
            });
        } catch (err) {
          /*console.log(err.error);*/
        }
        clearInterval(spin);
        writeToCurrStatus(null, "Sleeping until close (15 minutes).");
        setTimeout(() => {
          // Run script again after market close for next trading day.
          this.run();
        }, MINUTE * 15);
      } else {
        // Rebalance the portfolio.
        await this.rebalance();
      }
    }, MINUTE);
  }

  async stopIt() {
    clearInterval(this.spin);
    clearInterval(this.barChecker);

    await this.alpaca.cancelAllPositions().then((resp) => {
      var myIDstring = JSON.stringify(resp, null, 1);
      document.querySelector(".log-info").innerHTML = myIDstring;
    });
  }

  // Submit a limit order if quantity is above 0.
  async submitLimitOrder(quantity, stock, price, side) {
    if (quantity > 0) {
      await this.alpaca
        .createOrder({
          symbol: stock,
          qty: quantity,
          side: side,
          type: "limit",
          time_in_force: "day",
          limit_price: price,
        })
        .then((resp) => {
          this.lastOrder = resp;
          writeToEventLog(
            "Limit order of |" + quantity + " " + stock + " " + side + "| sent."
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
              "| did not go through."
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

  // Submit a market order if quantity is above 0.
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
              "| did not go through."
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

  async rebalance() {
    var bars;
    var plot_bars = { x: [], y: [], name: "bars" };

    //var SMA12 = 0;
    var EMA12 = 0;
    var EMA12p = 0;
    var plot_EMA12 = { x: [], y: [], name: "EMA12" };

    //var SMA26 = 0;
    var EMA26 = 0;
    var EMA26p = 0;
    var plot_EMA26 = { x: [], y: [], name: "EMA26" };

    //var MACDsignalSMA = 0;
    var MACDvalue = 0;
    var plot_MACD = { x: [], y: [], name: "MACD", yaxis: "y2" };
    var MACDsignal = 0;
    var MACDsignalp = 0;
    var plot_MACDsignal = { x: [], y: [], name: "MACD Signal", yaxis: "y2" };

    var MACDgo = 0;
    var MACDgop = 0;
    var MACDgoColor = "rgba(0,0,0,0)";
    var plot_MACDgoColor = [];
    var plot_MACDgo = {
      x: [],
      y: [],
      name: "Buy-Sell",
      yaxis: "y3",
      type: "bar",
      marker: { color: plot_MACDgoColor },
    };

    var loopCounter = 0;
    await this.alpaca
      .getBars("minute", this.stock, {
        limit: 250,
      })
      .then((resp) => {
        bars = resp[this.stock];
      })
      .catch((err) => {
        writeToEventLog("getBars error: " + err.error);
      });
    var currPrice = bars[bars.length - 1].c;

    EMA12 = EMA12p = EMA26 = EMA26p = bars[0].c;

    bars.forEach((bar) => {
      // Calculate EMA12

      EMA12 = (bar.c - EMA12p) * (2 / (12 + 1)) + EMA12p;
      EMA12p = EMA12;
      plot_EMA12.x.push(loopCounter);
      plot_EMA12.y.push(EMA12);

      // Calculate EMA26
      EMA26 = (bar.c - EMA26p) * (2 / (26 + 1)) + EMA26p;
      EMA26p = EMA26;
      plot_EMA26.x.push(loopCounter);
      plot_EMA26.y.push(EMA26);

      // Calculate MACD value and signal
      MACDvalue = EMA12 - EMA26;
      plot_MACD.x.push(loopCounter);
      plot_MACD.y.push(MACDvalue);
      MACDsignal = (MACDvalue - MACDsignalp) * (2 / (9 + 1)) + MACDsignalp;
      MACDsignalp = MACDsignal;
      plot_MACDsignal.x.push(loopCounter);
      plot_MACDsignal.y.push(MACDsignal);
      MACDgop = MACDgo;
      MACDgo = MACDvalue - MACDsignal;
      plot_MACDgo.x.push(loopCounter);
      plot_MACDgo.y.push(MACDgo);

      if (MACDgo < 0) {
        MACDgoColor = "rgba(220,0,0,0.75)";
      } else {
        MACDgoColor = "rgba(0,220,0,0.75)";
      }
      plot_MACDgoColor.push(MACDgoColor);

      plot_bars.x.push(loopCounter);
      plot_bars.y.push(bar.c);

      loopCounter += 1;
    });

    //var myIDstring = JSON.stringify(plot_MACDgo, null, 1);
    //document.querySelector(".log-info").innerHTML = myIDstring;
    createChart(
      [
        plot_bars,
        plot_EMA12,
        plot_EMA26,
        plot_MACD,
        plot_MACDsignal,
        plot_MACDgo,
      ],
      Date()
    );

    // Get our position, if any.
    var positionQuantity = 0;
    await this.alpaca
      .getPosition(this.stock)
      .then((resp) => {
        positionQuantity = resp.qty;
        if (positionQuantity == undefined) {
          positionQuantity = 0;
        }
        /* writeToEventLog(
          "Current Position: " + this.stock + " | " + positionQuantity
        ); */
      })
      .catch((err) => {
        console.log(err.error);
      });

    var buyingPower;
    var portfolioValue;
    var today_tradeCount;
    await this.alpaca
      .getAccount()
      .then((resp) => {
        buyingPower = resp.buying_power;
        portfolioValue = resp.portfolio_value;
        today_tradeCount = resp.daytrade_count;
        //writeToEventLog("Buying Power: " + buyingPower);
      })
      .catch((err) => {
        console.log(err.error);
      });
    // Minute Updates to right side
    var minuteUpdate;
    minuteUpdate =
      "Updated: " +
      Date() +
      "<br>Stock: " +
      this.stock +
      "<br>Current Price: $" +
      currPrice +
      "<br>Current Position: " +
      positionQuantity +
      "<br>Portfolio Value: $" +
      portfolioValue +
      "<br>Buying Power: $" +
      buyingPower +
      "<br>Daytrade Count: " +
      today_tradeCount;
    document.querySelector(".log-info").innerHTML = minuteUpdate;

    // Minute updates to title of tab
    var titleUpdate;
    titleUpdate =
      "$" +
      portfolioValue +
      "|" +
      positionQuantity +
      "|" +
      this.stock +
      "|$" +
      currPrice +
      "|$" +
      buyingPower;
    document.title = titleUpdate;

    if (MACDgo > 0 && MACDgop < 0) {
      // negative to positive - buy condition
      var qtyToBuy = Math.floor(buyingPower / currPrice);
      writeToEventLog(
        "Positive | Buying " +
          qtyToBuy +
          " shares of " +
          this.stock +
          " @ " +
          currPrice
      );
      await this.submitLimitOrder(qtyToBuy, this.stock, currPrice, "buy");
    } else if (MACDgo < 0 && MACDgop > 0) {
      // positive to negative - sell condition
      writeToEventLog(
        "Negative | Closing all " +
          positionQuantity +
          " shares of " +
          this.stock +
          " @ " +
          currPrice
      );
      await this.submitMarketOrder(positionQuantity, this.stock, "sell");
      //await this.alpaca.cancelAllPositions();
    } else {
      //writeToEventLog("");
    }
  }
}
