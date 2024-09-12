const { expect } = require('chai');
const { ethers } = require('hardhat');

const CONTRACT_NAME = 'CryptoTickets';
const CONTRACT_SYMBOL = 'CTS';

const OCCASION_NAME = 'ETH Chicago';
const OCCASION_COST = ethers.utils.parseUnits('1', 'ether');
const OCCASION_MAX_TICKETS = 100;
const OCCASION_DATE = 'Sep 6, 2024';
const OCCASION_TIME = '5:00PM CST';
const OCCASION_LOCATION = 'Chicago, Illinois';

describe('CryptoTickets', () => {
  let cryptoTicketsInstance;
  let deployer, buyer;

  beforeEach(async () => {
    const CryptoTickets = await ethers.getContractFactory('CryptoTickets');

    [deployer, buyer] = await ethers.getSigners();

    cryptoTicketsInstance = await CryptoTickets.deploy(CONTRACT_NAME, CONTRACT_SYMBOL);

    const transaction = await cryptoTicketsInstance
      .connect(deployer)
      .list(OCCASION_NAME, OCCASION_COST, OCCASION_MAX_TICKETS, OCCASION_DATE, OCCASION_TIME, OCCASION_LOCATION);

    await transaction.wait();
  });

  describe('Deployment', async () => {
    it('Sets the name', async () => {
      const name = await cryptoTicketsInstance.name();

      expect(name).to.equal(CONTRACT_NAME);
    });

    it('Sets the symbol', async () => {
      const symbol = await cryptoTicketsInstance.symbol();

      expect(symbol).to.equal(CONTRACT_SYMBOL);
    });

    it('Sets the owner', async () => {
      const owner = await cryptoTicketsInstance.owner();

      expect(owner).to.equal(deployer.address);
    });
  });

  describe('Occasions', async () => {
    it('Updates the occasions count', async () => {
      let totalOccasions = await cryptoTicketsInstance.totalOccasions();
      expect(totalOccasions).to.equal(1);
    });

    it('Should not create a new occasion if sender is not a contract owner', async () => {
      let totalOccasions = await cryptoTicketsInstance.totalOccasions();
      expect(totalOccasions).to.equal(1);

      await expect(
        cryptoTicketsInstance
          .connect(buyer)
          .list(OCCASION_NAME, OCCASION_COST, OCCASION_MAX_TICKETS, OCCASION_DATE, OCCASION_TIME, OCCASION_LOCATION),
      ).to.be.revertedWith('Only the owner can perform this action');

      totalOccasions = await cryptoTicketsInstance.totalOccasions();
      expect(totalOccasions).to.equal(1);
    });

    it('Returns occasion details', async () => {
      const { id, name, cost, tickets, maxTickets, date, time, location } = await cryptoTicketsInstance.getOccasion(1);

      expect(id).to.equal(1);
      expect(name).to.equal(OCCASION_NAME);
      expect(cost).to.equal(OCCASION_COST);
      expect(tickets).to.equal(OCCASION_MAX_TICKETS);
      expect(maxTickets).to.equal(OCCASION_MAX_TICKETS);
      expect(date).to.equal(OCCASION_DATE);
      expect(time).to.equal(OCCASION_TIME);
      expect(location).to.equal(OCCASION_LOCATION);
    });
  });

  describe('Minting', async () => {
    const EVENT_ID = 1;
    const SEAT_ID = 50;
    const AMOUNT_PER_SEAT = ethers.utils.parseUnits('1', 'ether');

    beforeEach(async () => {
      const transaction = await cryptoTicketsInstance
        .connect(buyer)
        .mint(EVENT_ID, SEAT_ID, { value: AMOUNT_PER_SEAT });
      await transaction.wait();
    });

    it('Should decrease amount of available tickets', async () => {
      const event = await cryptoTicketsInstance.getOccasion(EVENT_ID);

      expect(event.tickets).to.be.equal(OCCASION_MAX_TICKETS - 1);
    });

    it('Updating buying status', async () => {
      const status = await cryptoTicketsInstance.hasBought(EVENT_ID, buyer.address);

      expect(status).to.be.equal(true);
    });

    it('Update info that seat has been taken', async () => {
      const addressOfSeatOwner = await cryptoTicketsInstance.seatTaken(EVENT_ID, SEAT_ID);

      expect(addressOfSeatOwner).to.be.equal(buyer.address);
    });

    it('Return taken seats for the event', async () => {
      const takenSeats = await cryptoTicketsInstance.getSeatsTaken(EVENT_ID);

      expect(takenSeats.length).to.be.equal(1);
      expect(takenSeats[0]).to.equal(SEAT_ID);
    });

    it('Updates current balance of the contract', async () => {
      const balance = await ethers.provider.getBalance(cryptoTicketsInstance.address);

      expect(balance).to.equal(AMOUNT_PER_SEAT);
    });
  });

  describe('Withdraw', async () => {
    const EVENT_ID = 1;
    const SEAT_ID = 50;
    const AMOUNT_PER_SEAT = ethers.utils.parseUnits('1', 'ether');

    let currentContractBalance;

    beforeEach(async () => {
      const transaction = await cryptoTicketsInstance
        .connect(buyer)
        .mint(EVENT_ID, SEAT_ID, { value: AMOUNT_PER_SEAT });
      await transaction.wait();

      currentContractBalance = await ethers.provider.getBalance(cryptoTicketsInstance.address);
    });

    it('Withdraw from the contract if the owner', async () => {
      const deployerBalanceBefore = await ethers.provider.getBalance(deployer.address);

      const transaction = await cryptoTicketsInstance.connect(deployer).withdraw();
      await transaction.wait();

      currentContractBalance = await ethers.provider.getBalance(cryptoTicketsInstance.address);
      const deployerBalanceAfter = await ethers.provider.getBalance(deployer.address);

      expect(deployerBalanceAfter).to.be.greaterThan(deployerBalanceBefore);
      expect(currentContractBalance).to.equals(0);
    });

    it('Should not withdraw from the contract if not the owner', async () => {
      expect(currentContractBalance).to.equals(AMOUNT_PER_SEAT);

      await expect(cryptoTicketsInstance.connect(buyer).withdraw()).to.be.revertedWith(
        'Only the owner can perform this action',
      );

      expect(currentContractBalance).to.equals(AMOUNT_PER_SEAT);
    });
  });
});
