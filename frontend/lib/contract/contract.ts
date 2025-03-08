import { ethers } from 'ethers';
import MeditationStakingContractABI from '../../config/MeditationStakingContract.json';

const meditationStakingContractAddress = process.env.MEDITATION_STAKING_CONTRACT_ADDRESS! || "0x93b1411A185701984b2744b4F7ee8B621596D434";

export const getMeditationStakingContract = (provider: ethers.providers.Provider) => {
  return new ethers.Contract(meditationStakingContractAddress, MeditationStakingContractABI, provider);
};
