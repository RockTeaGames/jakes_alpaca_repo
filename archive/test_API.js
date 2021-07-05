const API_KEY = 'PKSSJH4T5HZL15DXGM49';
const API_SECRET = 'axb4eQ8sQlA9ULzngpc6dZbVwk6i2zArWM4Ow6nH';
const MINUTE = 60000;
const PAPER = true;

const theStock = "AAPL";

class theTest {
    constructor(API_KEY, API_SECRET, PAPER) {
        this.Alpaca = require('../lib/alpaca-trade-api');
        this.alpaca = new this.Alpaca({
            keyId: API_KEY,
            secretKey: API_SECRET,
            paper: PAPER
        });
        this.stock = theStock;

        setInterval(() => { }, 1 << 30); //keep terminal open
    }

    async myaccount() {
        var myID = await this.alpaca.getAccount();
        console.log(myID)
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
                console.log("Order of |" + quantity + " " + stock + " " + side + "| did not go through. " + err);
            });
        }
        else {
            console.log("Quantity is <=0, order of |" + quantity + " " + stock + " " + side + "| not sent.");
        }
    }
}

var testit = new theTest(API_KEY, API_SECRET, PAPER);

testit.myaccount();
//testit.submitMarketOrder(2, 'MSFT', 'sell');
//testit.submitMarketOrder(2, 'MSFT', 'buy');
//testit.cancelAll();