const API_KEY = 'PK817D57NCDH7J6WSU3C';
const API_SECRET = '2JPvTyN6JK0aCgOAjb5qxIOfa4P09CDaVHzLzHcm';
const MINUTE = 60000;
const PAPER = true;

const theStock = "AAPL";

class theTest {
    constructor(API_KEY, API_SECRET, PAPER) {
        this.Alpaca = require('@alpacahq/alpaca-trade-api');
        this.alpaca = new this.Alpaca({
            keyId: API_KEY,
            secretKey: API_SECRET,
            paper: PAPER
        });
        this.runningAverage = 0;
        this.lastOrder = null;
        this.timeToClose = null;
        this.stock = theStock;

        setInterval(() => { }, 1 << 30); //keep terminal open
    }

    async run() {
        await this.submitMarketOrder(1, this.stock, 'buy')
    }

    async cancelAll() {
        var orders;
        await this.alpaca.getOrders({
            status: 'open',
            direction: 'asc'
        }).then((resp) => {
            orders = resp;
        }).catch((err) => { console.log(err.error); });
        orders.forEach(async (order) => {
            this.alpaca.cancelOrder(order.id).catch((err) => { console.log(err.error); });
            console.log("Order " + order.id + " canceled.")
        });
        console.log("Cancel Finished.")
    }

    async submitMarketOrder(quantity, stock, side) {
        if (quantity > 0) {
            await this.alpaca.createOrder({
                symbol: stock,
                qty: quantity,
                side: side,
                type: 'market',
                time_in_force: 'day'
            }).then((resp) => {
                this.lastOrder = resp;
                console.log("Market order of |" + quantity + " " + stock + " " + side + "| completed.");
            }).catch((err) => {
                console.log("Order of |" + quantity + " " + stock + " " + side + "| did not go through.");
            });
        }
        else {
            console.log("Quantity is <=0, order of |" + quantity + " " + stock + " " + side + "| not sent.");
        }
    }
}

var testit = new theTest(API_KEY, API_SECRET, PAPER);

//testit.run();
testit.cancelAll();