const { ethers } = require("hardhat");

async function main() {
  const meditationStaking = await ethers.getContractFactory("MeditationStaking");
  const MeditationStakings = await meditationStaking.deploy();
  console.log("MeditationStaking deployed to:", MeditationStakings.target);
}
main()
.then(()=>console.log("Successful")).catch(err=>console.log("errr  ",  err))