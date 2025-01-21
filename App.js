import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import VotingContract from './contracts/Voting.json';
import './App.css'; // Import CSS if you have it

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
        setWeb3(web3);

        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = VotingContract.networks[networkId];

        if (!deployedNetwork) {
          throw new Error("Contract not deployed to current network.");
        }

        const instance = new web3.eth.Contract(
          VotingContract.abi,
          deployedNetwork.address
        );
        setContract(instance);

        const candidates = await instance.methods.getCandidates().call();
        setCandidates(candidates);
      } catch (err) {
        console.error("Error initializing:", err);
        setError(err.message || "Could not load blockchain data."); // Set error state
      } finally {
        setLoading(false); // Set loading to false regardless of success/failure
      }
    };

    init();
  }, []);

  const vote = async (index) => {
    try {
      await contract.methods.vote(index).send({ from: account });
      const updatedCandidates = await contract.methods.getCandidates().call();
      setCandidates(updatedCandidates);
    } catch (err) {
      console.error("Error voting:", err);
      setError(err.message || "Could not process vote.");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message
  }

  return (
    <div className="App">
      <h1>Blockchain Voting System</h1>
      <p>Connected Account: {account}</p>
      <ul>
        {candidates.map((candidate, index) => (
          <li key={index}>
            {candidate.name} - Votes: {candidate.voteCount}{' '}
            <button onClick={() => vote(index)}>Vote</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;