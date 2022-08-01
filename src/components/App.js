import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3';
import Navbar from './Navbar';
import Main from './Main';
// import logo from '../logo.png';,
import './App.css';
//import contracts
import EthSwap from '../abis/EthSwap.json';
import Token from '../abis/Token.json';


const App = (props) => {

    // state variables
    const [currentAccount, setCurrentAccount] = useState(""); 
    const [currentEthBalance, setCurrentEthBalance] = useState(0);
    const [currentTokenBalance, setCurrentTokenBalance] = useState(0);
    const [tokenContract, setTokenContract] = useState();
    const [ethSwapContract, setEthSwapContract] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isMining, setIsMining] = useState(false);

    const componentMounted = useRef(true);

    const loadWeb3 = async () => {
      if(window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({method: "eth_requestAccounts"});
      } else {
        console.log("Non-ethereum browser detected. Consider installing Metamask.")
      }
    }

    const setupEventListener = async () => {
      const { ethereum } = window;

      if(!ethereum){
        return;
      }

      // Add listener when accounts switch
      ethereum.on('accountsChanged', (accounts) => {
        console.log("Account changed: ", accounts[0]);
        setCurrentAccount(accounts[0]);
      });
    }  

    const checkIfChainIsRinkeby = async () => {
      const { ethereum } = window;
  
      if (!ethereum) {
        console.log("Make sure you have Metamask");
        return;
      } else {
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        
        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = "0x4"; 
        if (chainId !== rinkebyChainId) {
          alert("You are not connected to the Rinkeby Test Network!");
        }
      }
    }
    
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;
  
      if (!ethereum) {
        console.log("Make sure you have Metamask");
        return;
      }
  
      const accounts = await ethereum.request({method: 'eth_accounts'});
  
      if(accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);

        setupEventListener();
      } else {
        console.log("No authorized account found.");
      }
    }

    const updateBalances = async () => {
      const web3 = window.web3;

      const tokenBalance = await tokenContract.methods.balanceOf(currentAccount).call();
      const accounts = await web3.eth.getAccounts();
      const currentEthBalance = await web3.eth.getBalance(accounts[0]);

      setCurrentEthBalance(currentEthBalance);
      setCurrentTokenBalance(tokenBalance.toString());
    }

    const loadBlockchainData = async () => {
      const web3 = window.web3;

      const accounts = await web3.eth.getAccounts();
      const ethBalance = await web3.eth.getBalance(accounts[0]);
      console.log("ethbalance:", ethBalance);
      setCurrentEthBalance(ethBalance);

      // load contract and set the state of our application
      const networkId = await web3.eth.net.getId();

      const tokenNetworkData = Token.networks[networkId];
      const ethSwapNetworkData = EthSwap.networks[networkId];
      
      if(tokenNetworkData && ethSwapNetworkData){
        const token = new web3.eth.Contract(Token.abi, tokenNetworkData.address);
        const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapNetworkData.address);

        // Query J4KE Token balance from Token smart contract
        let tokenBalance = await token.methods.balanceOf(accounts[0]).call();

        let tokenBalanceOfEthSwapContract = await token.methods.balanceOf(ethSwap.address).call();

        console.log("tokenBalanceOfEthSwapContract", tokenBalanceOfEthSwapContract.toString())

        setTokenContract(token);
        setEthSwapContract(ethSwap);
        setCurrentTokenBalance(tokenBalance.toString());
      } else {
        window.alert("Token contract not deployed to the detected network.");
      }
    }

    const sellTokensMethod = (tokensToSell) => {
      setIsMining(true);
      // have to approve the ethSwap contract to transfer tokens to itself
      // first send txn to approve 0 tokens then send the txn to approve 'tokensToSell' to prevent the attack vector
      // attack details: https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/

      // return tokenContract.methods.approve(ethSwapContract.address, 0).send({from: currentAccount})
      //   .then(receipt => {
      //     tokenContract.methods.approve(ethSwapContract.address, tokensToSell).send({from: currentAccount});
      //   })
      //   .then(receipt =>{
      //     ethSwapContract.methods.sellTokens(tokensToSell).send({from: currentAccount});
      //   })
      //   .then(receipt => {
      //     setIsMining(false);
      //   })
      //   .catch(e => {
      //     console.log("Error while selling tokens: ", e);
      //     setIsMining(false);
      //   })

      tokenContract.methods.approve(ethSwapContract.address, 0).send({from: currentAccount}).on('transactionHash', txhash => {
        tokenContract.methods.approve(ethSwapContract.address, tokensToSell).send({from: currentAccount})
          .on('transactionHash', (hash) => {
            ethSwapContract.methods.sellTokens(tokensToSell).send({from: currentAccount})
              .on('confirmation', async (innerHash) => {
                await updateBalances();
                setIsMining(false);
              })
              .on('error', (error, receipt) => {
                console.log("Transaction failed with error:", error);
                setIsMining(false);
              });
          })
          .on('error', (error, receipt) => {
            console.log("Transaction failed with error:", error);
            setIsMining(false);
          });
      }).on('error', (error, receipt) => {
        console.log("Transaction failed with error:", error);
        setIsMining(false);
      });
    }

    const buyTokensMethod = (etherToBuy) => {
      setIsMining(true);
      console.log("value", etherToBuy, " currentAccount: ", currentAccount);
      
      ethSwapContract.methods.buyTokens().send({value: etherToBuy, from: currentAccount})
        .on('confirmation', async hash => {
          await updateBalances();
          setIsMining(false);
        })
        .on('error', (error, receipt) => {
          console.log("Transaction failed with error:", error);
          setIsMining(false);
        });
        // .then(receipt => {
        //   setIsMining(false);
        // })
        // .catch(e => {
        //   console.log("Error while buying tokens: ", e);
        //   setIsMining(false);
        // });
    }

    const loadDataOnComponentLoad = async () => {
        await checkIfWalletIsConnected();
        await checkIfChainIsRinkeby();
        await loadWeb3();
        await loadBlockchainData();
    }

    useEffect(() => {
      // checkIfChainIsRinkeby();
      setIsLoading(true);
      console.log("Loading data. This means that app component is mounted.")
      loadDataOnComponentLoad();
      if (componentMounted.current) { // is component still mounted?
        setIsLoading(false);
      }

      return () => { // This code runs when component is unmounted
        // this avoids memory leaks
        // reference: https://stackoverflow.com/a/66891949
        componentMounted.current = false; // set it to false when we leave the page/component
      }
    }, []);


    return (
      <div className='app-body'>
        <Navbar account={currentAccount}/>
        <div className="container-fluid d-flex h-100 flex-column mt-5">
          <div className="row d-flex justify-content-start flex-fill">
            <main role="main" className="col-lg-12 d-flex align-items-center text-center">
              <div className="content mr-auto ml-auto">
                  {isLoading ? (<p>Loading...</p>) : (
                    <Main 
                      ethBalance={currentEthBalance} 
                      tokenBalance={currentTokenBalance} 
                      sellTokensMethod={sellTokensMethod} 
                      buyTokensMethod={buyTokensMethod} 
                      isMining={isMining}
                    />
                  )}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
}

export default App;
