// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
  // code goes here... 
  address public owner;

  struct Item {
      uint256 id; 
      string name;
      string category;
      string image;
      uint256 cost;
      uint256 rating;
      uint256 stock;
  }

  struct Order {
    uint256 time; 
    Item item;
  }

  mapping(uint256 => Item) public items;
  mapping(address => uint256) public orderCount;
  mapping(address => mapping(uint256 => Order)) public orders;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  constructor () {
    owner = msg.sender;
  }

  event Buy(address buyer, uint256 orderId, uint256 itemId);
  event List(string name, uint256 cost,uint256 quantity);

  // list products 
  function list(
        uint256 _id, 
        string memory _name, 
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
  )public onlyOwner{
    // code goes here... 
    
    // create Item struct
    Item memory item = Item(_id, _name,_category,_image,_cost,_rating,_stock);
    
    // save the item to blockchain
    items[_id] = item;

    // Emit an event
    emit List(_name, _cost, _stock);
    
  }


  // buy products 
  function buy(uint256 _id) public payable{
    // Receive crypto


    // Fetch iitem
    Item memory item = items[_id];

    // stock should be greater than 0 
    require(item.stock > 0);

    // Create an order
    Order memory order = Order(block.timestamp , item);


    // Add order for user
    orderCount[msg.sender]++;
    orders[msg.sender][orderCount[msg.sender]] = order;


    // Substact stock
    items[_id].stock = item.stock -1;

    // Emit event
    emit Buy(msg.sender,orderCount[msg.sender], item.id);

  }


  // withdraw  funds 
  function withdraw() public onlyOwner {
    (bool success, ) = owner.call{value:address(this).balance}(""); 
    require(success);
  }

}


