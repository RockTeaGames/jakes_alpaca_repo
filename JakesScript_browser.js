class JakesCode {
  constructor(API_KEY, API_SECRET, PAPER) {
    this.alpaca = new AlpacaCORS({
      keyId: API_KEY,
      secretKey: API_SECRET,
      paper: PAPER,
      baseUrl: "https://paper-api.alpaca.markets",
    });
    this.SMA12 = 0;
    this.EMA12 = 0;
    this.EMA12p = 0;

    this.SMA26 = 0;
    this.EMA26 = 0;
    this.EMA26p = 0;

    this.MACDsignalSMA = 0;
    this.MACDvalue = 0;
    this.MACDsignal = 0;
    this.MACDsignalp = 0;

    this.lastOrder = null;
    this.timeToClose = null;
    // Stock that the algo will trade.
    this.stock = theStock;
  }

  async run() {
    // First, cancel any existing orders so they don't impact our buying power.
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
      this.alpaca.cancelOrder(order.id).catch((err) => {
        writeToEventLog(err.error);
      });
      writeToEventLog("Order " + order.id + " canceled.");
    });
    writeToEventLog("Pre-Script Cancelling Finished.");

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
            this.timeToClose = Math.floor((openTime - currTime) / 1000 / 60);
            writeToEventLog(
              `${this.timeToClose} minutes til next market open.`
            );
          }
        } catch (err) {
          writeToEventLog(err.error);
        }
      }, MINUTE);
    });
    // Wait for market to open.
    writeToEventLog("Waiting for market to open...");
    await awaitMarketOpen;
    writeToEventLog("Market opened!");

    // Get the running average of prices of the last 20 minutes, waiting until we have 20 bars from market open.
    var promBars = new Promise((resolve, reject) => {
      var barChecker = setInterval(async () => {
        await this.alpaca.getCalendar(Date.now()).then(async (resp) => {
          var marketOpen = resp[0].open;
          await this.alpaca
            .getBars("minute", this.stock, {
              start: marketOpen,
            })
            .then((resp) => {
              var bars = resp[this.stock];
              if (bars.length >= 20) {
                clearInterval(barChecker);
                resolve();
              }
            })
            .catch((err) => {
              writeToEventLog(err.error);
            });
        });
      }, MINUTE);
    });
    writeToEventLog("Waiting for 20 bars...");
    await promBars;
    writeToEventLog("We have 20 bars!");

    // Rebalance our portfolio every minute based off running average data.
    var spin = setInterval(async () => {
      // Clear the last order so that we only have 1 hanging order.
      if (this.lastOrder != null)
        await this.alpaca.cancelOrder(this.lastOrder.id).catch((err) => {
          writeToEventLog(err.error);
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
          writeToEventLog(err.error);
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
              writeToEventLog(err.error);
            });
        } catch (err) {
          /*console.log(err.error);*/
        }
        clearInterval(spin);
        writeToEventLog("Sleeping until market close (15 minutes).");
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
    theKill = true;
    clearInterval(this.spin);
    clearInterval(this.barChecker);
  }

  // Rebalance our position after an update.
  async rebalance() {
    var positionQuantity = 0;
    var positionValue = 0;

    // Get our position, if any.
    try {
      await this.alpaca.getPosition(this.stock).then((resp) => {
        positionQuantity = resp.qty;
        positionValue = resp.market_value;
      });
    } catch (err) {
      writeToEventLog(err.error);
    }

    // Get the new updated price and running average.
    var bars;
    await this.alpaca
      .getBars("minute", this.stock, {
        limit: 20,
      })
      .then((resp) => {
        bars = resp[this.stock];
      })
      .catch((err) => {
        writeToEventLog(err.error);
      });
    var currPrice = bars[bars.length - 1].closePrice;
    this.runningAverage = 0;
    bars.forEach((bar) => {
      this.runningAverage += bar.closePrice;
    });
    this.runningAverage /= 20;
    writeToEventLog(bars);

    if (currPrice > this.runningAverage) {
      // Sell our position if the price is above the running average, if any.
      if (positionQuantity > 0) {
        writeToEventLog("Setting position to zero.");
        await this.submitLimitOrder(
          positionQuantity,
          this.stock,
          currPrice,
          "sell"
        );
      } else writeToEventLog("No position in the stock.  No action required.");
    } else if (currPrice < this.runningAverage) {
      // Determine optimal amount of shares based on portfolio and market data.
      var portfolioValue;
      var buyingPower;
      await this.alpaca
        .getAccount()
        .then((resp) => {
          portfolioValue = resp.portfolio_value;
          buyingPower = resp.buying_power;
        })
        .catch((err) => {
          writeToEventLog(err.error);
        });
      var portfolioShare =
        ((this.runningAverage - currPrice) / currPrice) * 200;
      var targetPositionValue = portfolioValue * portfolioShare;
      var amountToAdd = targetPositionValue - positionValue;

      // Add to our position, constrained by our buying power; or, sell down to optimal amount of shares.
      if (amountToAdd > 0) {
        if (amountToAdd > buyingPower) amountToAdd = buyingPower;
        var qtyToBuy = Math.floor(amountToAdd / currPrice);
        await this.submitLimitOrder(qtyToBuy, this.stock, currPrice, "buy");
      } else {
        amountToAdd *= -1;
        var qtyToSell = Math.floor(amountToAdd / currPrice);
        if (qtyToSell > positionQuantity) qtyToSell = positionQuantity;
        await this.submitLimitOrder(qtyToSell, this.stock, currPrice, "sell");
      }
    }
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

  async testing() {
    var bars;
    var plot_bars = [];
    var plot_EMA12 = [];
    var plot_EMA26 = [];
    var plot_MACD = [];
    var plot_MACDsignal = [];
    var loopCounter = 0;
    await this.alpaca
      .getBars("minute", this.stock, {
        limit: 150,
      })
      .then((resp) => {
        bars = resp[this.stock];
      })
      .catch((err) => {
        writeToEventLog(err.error);
      });
    var currPrice = bars[bars.length - 1].c;

    bars.forEach((bar) => {
      // Calculate EMA12
      if (loopCounter > 12) {
        this.EMA12 = (bar.c - this.EMA12p) * (2 / (12 + 1)) + this.EMA12p;
        this.EMA12p = this.EMA12;
        plot_EMA12[loopCounter] = { x: loopCounter, y: this.EMA12 };
      } else {
        this.SMA12 += bar.c;
        if (loopCounter == 12 - 1) {
          this.SMA12 /= 12;
          this.EMA12p = this.SMA12;
        }
      }
      // Calculate EMA26
      if (loopCounter > 26) {
        this.EMA26 = (bar.c - this.EMA26p) * (2 / (26 + 1)) + this.EMA26p;
        this.EMA26p = this.EMA26;
        plot_EMA26[loopCounter] = { x: loopCounter, y: this.EMA26 };
      } else {
        this.SMA26 += bar.c;
        if (loopCounter == 26 - 1) {
          this.SMA26 /= 26;
          this.EMA26p = this.SMA26;
        }
      }

      this.MACDvalue = this.EMA12 - this.EMA26;
      if (loopCounter > (26 + 9)) {
        // Calculate MACD value and signal
        this.MACDsignal =
          (this.MACDvalue - this.MACDsignalp) * (2 / (9 + 1)) +
          this.MACDsignalp;
        this.MACDsignalp = this.MACDsignal;
        plot_MACDsignal[loopCounter] = { x: loopCounter, y: this.MACDsignal };
      } else {
        this.MACDsignalSMA += this.MACDvalue;
        if (loopCounter == 26 + 9 - 1) {
          this.MACDsignalSMA /= 9;
          this.MACDsignalp = this.MACDsignal;
        }
      }

      plot_bars[loopCounter] = { x: loopCounter, y: bar.c };
      plot_MACD[loopCounter] = { x: loopCounter, y: this.MACDvalue };
      writeToEventLog(
        loopCounter +
          " | " +
          bar.c +
          " | " +
          this.EMA12 +
          " | " +
          this.EMA26 +
          " | " +
          this.MACDvalue +
          " | " +
          this.MACDsignal
      );
      loopCounter += 1;
    });

    writeToEventLog(plot_bars[plot_bars.length - 1].y);
    writeToEventLog(plot_EMA12[plot_EMA12.length - 1].y);
    writeToEventLog(plot_EMA26[plot_EMA26.length - 1].y);
    writeToEventLog(plot_MACD[plot_MACD.length - 1].y);

    //theChart = document.getElementById('chart');
    //plotly.newplot(document.getElementById('chart'),plot_bars);

    var myIDstring = JSON.stringify(plot_MACD, null, 1);
    document.querySelector(".log-info").innerHTML = myIDstring;

    //writeToEventLog(bars)
  }
}
