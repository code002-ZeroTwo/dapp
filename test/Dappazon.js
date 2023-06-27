// automated testing for smartcontract
const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ID = 1;
const Name = "Shoes";
const Category = "clothing";
const Image = "image";
const cost = tokens(1);
const rating = 4;
const stock = 5;

describe("Dappazon", () => {
  let dappazon;
  let deployer, buyer;

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();

    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });

  describe("Deployment", () => {
    it("sets the owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });

  describe("Listing", () => {
    let transaction;

    beforeEach(async () => {
      // List an item
      transaction = await dappazon
        .connect(deployer)
        .list(ID, Name, Category, Image, cost, rating, stock);
      await transaction.wait();
    });

    it("Returns item attributes", async () => {
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(Name);
      expect(item.category).to.equal(Category);
      expect(item.image).to.equal(Image);
      expect(item.cost).to.equal(cost);
      expect(item.rating).to.equal(rating);
      expect(item.stock).to.equal(stock);
    });

    it("emits the List event", () => {
      expect(transaction).to.emit(dappazon, "List");
    });
  });

  describe("Buying", () => {
    let transaction;

    beforeEach(async () => {
      // list an item
      transaction = await dappazon
        .connect(deployer)
        .list(ID, Name, Category, Image, cost, rating, stock);
      await transaction.wait();

      // buy an item
      transaction = await dappazon.connect(buyer).buy(ID, { value: cost });
      await transaction.wait();
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(cost);
    });

    it("Updates buyer's  order count", async () => {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });

    it("Adds the order", async () => {
      const order = await dappazon.orders(buyer.address, 1);

      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(Name);
    });

    it("Emits the Buy event", async () => {
      expect(transaction).to.emit(dappazon, "Buy");
    });
  });

  describe("Withdraw", () => {
    let balanceBefore;

    beforeEach(async () => {
      // list an item
      let transaction = await dappazon
        .connect(deployer)
        .list(ID, Name, Category, Image, cost, rating, stock);
      await transaction.wait();

      // buy an item
      transaction = await dappazon.connect(buyer).buy(ID, { value: cost });
      await transaction.wait();

      // get deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      // Withdraw
      transaction = await dappazon.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("updates the contract balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(dappazon.address);
      expect(balanceAfter).to.equal(0);
    });
  });
});
