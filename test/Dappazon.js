// automated testing for smartcontract
const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ID = 1
const Name = "Shoes"
const Category = "clothing"
const Image = "image"
const cost = tokens(1);
const rating = 4
const stock = 5

describe("Dappazon", () => {
  let dappazon;
  let deployer, buyer;

  beforeEach(async () => {
    [deployer , buyer] = await ethers.getSigners();

    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });

  describe("Deployment", () => {
    it("sets the owner" , async () => {
      expect(await dappazon.owner()).to.equal(deployer.address)
    })

  });

  describe("Listing", () => {
    let transaction

    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(
        ID, Name,Category,Image,cost,rating,stock
      )
      await transaction.wait()

      transaction = await dappazon.connect(buyer).buy(ID,{value:cost})
    })

    it("Returns item attributes" , async () => {
    const item = await dappazon.items(ID);
    expect(item.id).to.equal(ID);
    expect(item.name).to.equal(Name);
    expect(item.category).to.equal(Category);
    expect(item.image).to.equal(Image);
    expect(item.cost).to.equal(cost);
    expect(item.rating).to.equal(rating);
    expect(item.stock).to.equal(stock);
    })

    it("emits the List event" , () => {
      expect(transaction).to.emit(dappazon,"List")
    }) 

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(cost)
    })

  });
});
