const { OrderRecom, ProductSearch } = require("../model/recommendation");
const RabbitMQService = require("../config/rabbitmq");

exports.orderbyuser = async (message) => {
  const { orderId, order } = message;

  try {
    const { products } =message.order;
    
    console.log(message.order.userId);
    
    const categories = [...new Set(products.map(p => p.category))];
    const subCategories = [...new Set(products.map(p => p.subcategory))];
    const companies = [...new Set(products.map(p => p.company))];
    const productNames = [...new Set(products.map(p => p.name))];
    const prices = [...new Set(products.map(p => p.price))];

    let order = await OrderRecom.findOne({ userId:message.order.userId });

    if (order) {
        order.categories = [...new Set([...order.categories, ...categories])];
        order.subCategories = [...new Set([...order.subCategories, ...subCategories])];
        order.companies = [...new Set([...order.companies, ...companies])];
        order.productNames = [...new Set([...order.productNames, ...productNames])];
        order.prices = [...new Set([...order.prices, ...prices])];
    } else {
        order = new OrderRecom({
            userId:message.order.userId,
            categories,
            subCategories,
            companies,
            productNames,
            prices
        });
    }
    
    const res=await order.save();
    console.log('====================================');
    console.log(res);
    console.log('====================================');
    console.log('Order recommendation saved successfully');  } catch (error) {
    console.error("Error processing inventory check:", error);
  }
};
exports.productsearch = async (message) => {
    try {
      const { product, userId } = message;
  
      if (!product || !userId) {
        console.error("Invalid message format");
        return;
      }
  
      const likes = product.likes ? product.likes.length : 0;
      const categories = product.category ? [product.category] : [];
      const subCategories = product.subcategory ? [product.subcategory] : [];
      const companies = product.company ? [product.company] : [];
      const productNames = product.productname ? [product.productname] : [];
      const prices = product.price ? [product.price] : [];
  
      let order = await OrderRecom.findOne({ userId });
  
      if (order) {
        order.categories = [...new Set([...order.categories, ...categories])];
        order.subCategories = [...new Set([...order.subCategories, ...subCategories])];
        order.companies = [...new Set([...order.companies, ...companies])];
        order.productNames = [...new Set([...order.productNames, ...productNames])];
        order.prices = [...new Set([...order.prices, ...prices])];
        order.likes = likes;
      } else {
        order = new OrderRecom({
          userId,
          categories,
          subCategories,
          companies,
          productNames,
          prices,
          likes,
        });
      }
  
     const res = await order.save();
      console.log("Order recommendation saved successfully:", res);
    } catch (error) {
      console.error("Error processing product search:", error);
    }
  };
  