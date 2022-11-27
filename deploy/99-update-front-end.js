const { ethers, network } = require("hardhat")
const fs = require('fs')
require("dotenv").config()

const FRONT_END_ADDRESSES_FILE = "../nextjs-smartcontract-lottery-fcc/constants/contractAddress.json"
const FRONT_END_ABI_FIEL = "../nextjs-smartcontract-lottery-fcc/constants/abi.json"

module.exports = async function() {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")
        updateContractAddresses()
        updateAbi()
    }
}

async function updateAbi() {
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONT_END_ABI_FIEL, raffle.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const raffle = await ethers.getContract("Raffle")
    const chainId = network.config.chainId.toString()
    const currentAddress = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, 'utf-8'))
    if (chainId in currentAddress) {
        if (!currentAddress[chainId].includes(raffle.address)) {
            currentAddress[chainId].push(raffle.address)
        }
    } else {
        currentAddress[chainId] =  [raffle.address]
    }
    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddress))
}


module.exports.tags = ["all"]