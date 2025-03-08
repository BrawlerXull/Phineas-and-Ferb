import { toast } from 'sonner';

const useWalletLogin = () => {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          toast.success(`Successfully connected as: ${accounts[0]}`)
        } else {
        console.error('No accounts found in MetaMask');
        }
      } catch (error: any) {
        console.error('Error connecting to MetaMask:', error);
        alert('Could not connect to MetaMask. Please try again.');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask!');
    }
  };

  const disconnectWalletHandler = () => {
    toast.success(`Successfully disconnected!`)
  };

  return { connectWallet, disconnectWalletHandler };
};

export default useWalletLogin;