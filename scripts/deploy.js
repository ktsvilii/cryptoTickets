const hre = require('hardhat');

const tokens = n => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const NAME = 'CryptoTickets';
  const SYMBOL = 'CTS';

  // Deploy contract
  const CryptoTickets = await ethers.getContractFactory('CryptoTickets');
  const cryptoTickets = await CryptoTickets.deploy(NAME, SYMBOL);
  await cryptoTickets.deployed();

  console.log(`Deployed CryptoTickets Contract at: ${cryptoTickets.address}\n`);

  const occasions = [
    {
      name: 'Chess World Championship',
      cost: tokens(0.5),
      tickets: 50,
      date: 'Dec 12, 2024',
      time: '10:00AM CET',
      location: 'Olympiastadion, Berlin, Germany',
    },
    {
      name: 'Blockchain Developers Meet',
      cost: tokens(1.5),
      tickets: 0,
      date: 'Jan 20, 2025',
      time: '11:30AM IST',
      location: 'Bombay Exhibition Centre, Mumbai, India',
    },
    {
      name: 'Crypto Summit 2025',
      cost: tokens(2),
      tickets: 100,
      date: 'Feb 15, 2025',
      time: '10:00AM GMT',
      location: 'ExCeL London, London, UK',
    },
    {
      name: 'Global AI Conference',
      cost: tokens(1),
      tickets: 150,
      date: 'Mar 10, 2025',
      time: '9:00AM PST',
      location: 'Moscone Center, San Francisco, CA',
    },
    {
      name: 'UFC Miami',
      cost: tokens(1),
      tickets: 0,
      date: 'Nov 2, 2024',
      time: '6:00PM EST',
      location: 'Kaseya Center, Miami, FL',
    },
  ];

  for (let i = 0; i < occasions.length; i++) {
    const transaction = await cryptoTickets
      .connect(deployer)
      .list(
        occasions[i].name,
        occasions[i].cost,
        occasions[i].tickets,
        occasions[i].date,
        occasions[i].time,
        occasions[i].location,
      );

    await transaction.wait();

    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
