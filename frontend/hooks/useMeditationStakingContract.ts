import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getMeditationStakingContract } from '../lib/contract/contract'; 

const useMeditationStaking = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
      } else {
        console.error('Please install MetaMask to interact with the blockchain.');
      }
    };
    initProvider();
  }, []);

  useEffect(() => {
    if (provider) {
      console.log('Provider initialized:', provider);
    }
  }, [provider]);

  useEffect(() => {
    if (provider && userAddress) {
      fetchUserData();
    }
  }, [provider, userAddress]);

  const fetchUserData = useCallback(async () => {
    if (!provider || !userAddress) return;

    setIsLoading(true);
    try {
      const contract = getMeditationStakingContract(provider);
      const user = await contract.getUser(userAddress);
      setUserData(user);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  }, [provider, userAddress]);

  const register = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const contract = getMeditationStakingContract(provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.register();
      await tx.wait();
      fetchUserData();
    } catch (err: any) {
      console.error('Error registering:', err);
      setError('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const stake = async (amount: string) => {
    if (!provider || !userAddress) return;
    setIsStaking(true);
    try {
      const contract = getMeditationStakingContract(provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.stake({ value: ethers.utils.parseEther(amount) });
      await tx.wait();
      fetchUserData();
    } catch (err: any) {
      console.error('Error staking:', err);
      setError('Staking failed');
    } finally {
      setIsStaking(false);
    }
  };
  const addRewards=async(steps: Number)=>{
    if(!provider) return;
    setIsLoading(true);
    try {
      const contract = getMeditationStakingContract(provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.addRewards(steps);
      await tx.wait();
      fetchUserData();
    } catch (err: any) {
      console.error('Error adding rewards:', err);
      setError('Adding Rewards failed');
    } finally {
      setIsLoading(false);
    }
  }
  const checkIn = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const contract = getMeditationStakingContract(provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.checkIn();
      await tx.wait();
      fetchUserData();

    } catch (err: any) {
      console.error('Error checking in:', err);
      setError('Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const contract = getMeditationStakingContract(provider);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.withdraw();
      await tx.wait();
      fetchUserData();
    } catch (err: any) {
      console.error('Error withdrawing:', err);
      setError('Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    provider,
    userData,
    isLoading,
    isStaking,
    error,
    userAddress,
    register,
    stake,
    checkIn,
    withdraw,
    addRewards
  };
};

export default useMeditationStaking;
