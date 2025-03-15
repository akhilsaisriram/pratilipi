const cron = require('node-cron');
const Order = require("../model/order");
const notification=require('../consumer/rabbitmq_consumer')
async function updateordersandnotify() {
    console.log("cron job");
    
    try {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

        const ordersToUpdate = await Order.find({
            orderStatus: "confirmed",
            orderDate: { $lte: twelveHoursAgo }
        });

        if (ordersToUpdate.length === 0) {
            console.log("no orders to update");
            
            return;
        }

        for (const order of ordersToUpdate) {
            order.orderStatus = "shipped";
            await order.save();
            await notification(order);
        }


    } catch (error) {
        console.error("Error in cron job:", error);
    }
}

// Run cron job every 12 hours (at 12 AM, 12 PM, etc.)
cron.schedule('0 */12 * * *', async () => {
    console.log("running scheduled job to update orders");
    await updateordersandnotify();
});

module.exports = updateordersandnotify;
