const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name) ? describe.skip : describe("Raffle Unit Tests", async function () {
    let raffle, raffleEntranceFee, deployer

    beforeEach(async function () {
        deployer = await getNamedAccounts().deployer
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle", deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
    })

    describe("fulfillRandomWords", function() {
        isCallTrace("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function() {
            const startingTimeStamp = await raffle.getLatestTimeStamp()
            const accounts = ethers.getSigners();

            await new Promise(async (resolve, reject) => {
                raffle.once("WinnerPicked", async () => {
                    console.log("WinerPicked event fired!")
                   
                    try{
                        const recentWinner = await raffle.getRecentWinner()
                        const raffleState = await raffle.getRaffleState()
                        const winnerEndingBalance = await accounts[0].getBalance()
                        const endingTimeStamp = await raffle.getLatestTimeStamp()
                        await expect(raffle.getPlayer(0)).to.be.reverted
                        assert.equal(recentWinner.toString(), accounts[0].address);
                        assert.equal(raffleState, 0)
                        assert.equal(
                            winnerEndingBalance.toString(),
                            winnerStartingBalance.add(raffleEntranceFee).toString()
                        )
                        assert(endingTimeStamp > startingTimeStamp)
                        resolve()
                    } catch(error) {
                        console.log(error)
                        reject(error)
                    }
                })
                await raffle.enterRaffle({ value: raffleEntranceFee })
                const winnerStartingBalance = await accounts[0].getBalance()
            })
        })
    })
})