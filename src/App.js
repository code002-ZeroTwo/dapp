import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappazon from './abis/Dappazon.json'

// Config
import config from './config.json'

function App() {
  const [account, setAccount] = useState(null);
  const [dappazon, setdappazon] = useState(null);

  const [provider, setprovider] = useState(null);

  const [electronics, setelectronics] = useState(null);
  const [clothing, setclothing] = useState(null);
  const [toys, settoys] = useState(null);
  
  const togglePop = async () => {

  }
  

  const loadBlockchainData = async () => {
    // connect blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum); 
    setprovider(provider);

    const network = await provider.getNetwork();
    console.log(network);

    // connect to smart contract
    // create js version of smart contract ??
    const dappazon = new ethers.Contract(
      config[network.chainId].dappazon.address,
      Dappazon,
      provider
    )
    setdappazon(dappazon);

    // Load products
    const items = [];

    for(let i=0; i<9; i++){
      const item = await dappazon.items(i+1);
      items.push(item);
    }

    const electronics = items.filter((item) => item.category === 'electronics')
    const clothing= items.filter((item) => item.category === 'clothing')
    const toys= items.filter((item) => item.category === 'toys')

    setelectronics(electronics);
    setclothing(clothing);
    settoys(toys);



  }

  useEffect(() => {
    loadBlockchainData()
  }, [])
  
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <h2>Dappazon Best Sellers</h2>

      {electronics && clothing && toys && (
        <>
        <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
        <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
        <Section title={"Toys and Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}
    </div>
  );
}

export default App;
