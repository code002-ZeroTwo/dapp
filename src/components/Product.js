import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Rating from "./Rating";

import close from "../assets/close.svg";

const Product = ({ item, provider, account, dappazon, togglePop }) => {
  const [order, setorder] = useState(null);  
  const [hasbought, sethasbought] = useState(false);  

  // fetch the details from blockchain
  const fetchDetails = async () =>{
    const events = await dappazon.queryFilter("Buy")
    const orders = events.filter(
      (evento) => evento.args.buyer === account && evento.args.itemId.toString() === item.id.toString() 
    )

    if(orders.length === 0) return
    
    const order = await dappazon.orders(account,orders[0].args.orderId)
    setorder(order);

  }

  const buyHandler = async () => {
    const signer = await provider.getSigner();
    let tranaction = dappazon.connect(signer).buy(item.id,{value: item.cost})
    await tranaction.wait();

    sethasbought(true);
  };

  useEffect(() => {
    fetchDetails();
  },[hasbought])

  return (
    <div className="product">
      <div className="product__details">
        <div className="product__image">
          <img src={item.image} alt="Product" />
        </div>
        <div className="product__overview">
          <h1>{item.name}</h1>

          <Rating value={item.rating} />

          <hr />

          <p>{item.address}</p>

          <h2>{ethers.utils.formatUnits(item.cost.toString(), "ether")} ETH</h2>

          <hr />

          <h2>Overview</h2>

          <p>
            {item.description}
            this is the random paragraph. description of the product. product
            might be anything. it might be shoes, sunglasses, toys or any other
            items.
          </p>
        </div>

        <div className="product__order">
          <h1>{ethers.utils.formatUnits(item.cost.toString(), "ether")} ETH</h1>

          <p>
            Delivery cost: <i>0.01</i> ETH <br />
            <strong>
              {new Date(Date.now() + 345600000).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </p>

          {item.stock > 0 ? <p>In stock.</p> : <p>Product not availiable.</p>}

          <button className="product__buy" onClick={buyHandler}>
            Buy Now.
          </button>

          <p>
            <small>From </small>random text
          </p>
          <p>
            <small>To </small>random text
          </p>

          {order && (
            <div className="product__bought">
              Item bought on <br />
              <strong>
                {new Date(
                  Number(order.time.toString() + "000")
                ).toLocaleDateString(undefined, {
                  weekday: "long",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}
              </strong>
            </div>
          )}
        </div>
        <button onClick={togglePop} className="product__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Product;
