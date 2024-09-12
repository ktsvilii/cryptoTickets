import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import Navigation from './components/Navigation';
import Sort from './components/Sort';
import Card from './components/Card';
import SeatChart from './components/SeatChart';

import CryptoTickets from './abis/CryptoTickets.json';

import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  const [contract, setContract] = useState(null);
  const [occasions, setOccasions] = useState([]);

  const [occasion, setOccasion] = useState({});
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const { chainId } = await provider.getNetwork();
    const { address } = config[chainId].CryptoTickets;
    const contract = new ethers.Contract(address, CryptoTickets, provider);
    setContract(contract);

    const totalOccasions = await contract.totalOccasions();
    const occasions = [];
    for (let i = 1; i <= totalOccasions; i++) {
      const occasion = await contract.getOccasion(i);
      occasions.push(occasion);
    }
    setOccasions(occasions);

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />

        <h2 className='header__title'>
          <strong>Event</strong> Tickets
        </h2>
      </header>

      <Sort />

      <div className='cards'>
        {occasions.map((occasion, index) => (
          <Card
            occasion={occasion}
            id={index + 1}
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setOccasion={setOccasion}
            key={occasion.name}
          />
        ))}
      </div>

      {toggle && <SeatChart occasion={occasion} contract={contract} provider={provider} setToggle={setToggle} />}
    </div>
  );
}

export default App;
