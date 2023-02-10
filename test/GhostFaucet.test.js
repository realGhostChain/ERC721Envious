const {
    BN,
    time,
    balance,
    constants,
    expectEvent,
    expectRevert
} = require("@openzeppelin/test-helpers");

const {
    expect
} = require("chai");

const {
    ZERO_ADDRESS
} = constants;

const ERC20 = artifacts.require("GhostMcAfeeVision");

const BlackHole = artifacts.require("BlackHole");

const GhostCollection = artifacts.require("GhostCollection");

const GhostFaucet = artifacts.require("GhostFaucet");

contract("EnviousHouse", function(accounts) {
    const [ user, defaultAddress, stranger ] = accounts;
    const enviousName = "Dynamic Collection";
    const enviousSymbol = "DCL";
    const blackHoleName = "testy";
    const disperseUnit = new BN("100");
    const rewardUnit = new BN("10");
    const uri = "https://test.com/api/";
    const sigmoid = [ 3, 3, 3 ];
    const edgeValues = [ new BN("0"), new BN("2000"), new BN("3000"), new BN("4000") ];
    const edgeOffsets = [ new BN("1"), new BN("1001"), new BN("1501"), new BN("1901") ];
    const edgeRanges = [ new BN("1000"), new BN("500"), new BN("400"), new BN("100") ];
    beforeEach(async function() {
        this.token = await ERC20.new();
        this.hole = await BlackHole.new(blackHoleName);
        this.collection = await GhostCollection.new(enviousName, enviousSymbol, uri, edgeValues, edgeOffsets, edgeRanges, this.token.address);
        this.faucet = await GhostFaucet.new(this.collection.address, this.token.address, disperseUnit, rewardUnit, sigmoid);
        this.amount = new BN("100000");
        await this.collection.mint(defaultAddress);
        await this.collection.renewSuperMinter(this.faucet.address);
        await this.token.mint(this.faucet.address, this.amount);
    });
    describe("post-deployment checks", function() {
        it("initial disperse unit is correct", async function() {
            expect(await this.faucet.baseDisperse()).to.be.bignumber.eq(disperseUnit);
        });
        it("initial reward unit is correct", async function() {
            expect(await this.faucet.baseAmount()).to.be.bignumber.eq(rewardUnit);
        });
        it("collection address is correct", async function() {
            expect(await this.faucet.nftAddress()).to.be.eq(this.collection.address);
        });
        it("token address is correct", async function() {
            expect(await this.faucet.tokenAddress()).to.be.eq(this.token.address);
        });
        it("initial minted tokens amount is zero", async function() {
            expect(await this.faucet.tokensMinted(user)).to.be.bignumber.eq(new BN("0"));
            expect(await this.faucet.tokensMinted(defaultAddress)).to.be.bignumber.eq(new BN("0"));
            expect(await this.faucet.tokensMinted(stranger)).to.be.bignumber.eq(new BN("0"));
            expect(await this.faucet.totalTokensMinted()).to.be.bignumber.eq(new BN("0"));
            expect(await this.token.totalSupply()).to.be.bignumber.eq(this.amount);
            expect(await this.token.balanceOf(this.faucet.address)).to.be.bignumber.eq(this.amount);
        });
        it("initial referral number is zero", async function() {
            expect(await this.faucet.referralsNumber(user)).to.be.bignumber.eq(new BN("0"));
            expect(await this.faucet.referralsNumber(defaultAddress)).to.be.bignumber.eq(new BN("0"));
            expect(await this.faucet.referralsNumber(stranger)).to.be.bignumber.eq(new BN("0"));
        });
    });
    it("sigmoid calculation is correct according to predefined params", async function() {
        expect(await this.faucet.sigmoidValue(new BN("1"))).to.be.bignumber.eq(new BN("0"));
        expect(await this.faucet.sigmoidValue(new BN("2"))).to.be.bignumber.eq(new BN("2"));
        expect(await this.faucet.sigmoidValue(new BN("5"))).to.be.bignumber.eq(new BN("6"));
        expect(await this.faucet.sigmoidValue(new BN("100"))).to.be.bignumber.eq(new BN("6"));
    });
    it("event on success airdrop is emitted", async function() {
        expectEvent(await this.faucet.sendMeGhostNft(defaultAddress), "AssetAirdropped", {
            sender: user,
            friend: defaultAddress,
            amount: rewardUnit
        });
    });
    it("URI can be changed by super user", async function() {
        expect(await this.collection.tokenURI(new BN("1"))).to.contain("https://test.com/api/");
        await this.collection.changeBaseUri("https://google.com/nft/");
        expect(await this.collection.tokenURI(new BN("1"))).to.not.contain("https://test.com/api/");
        expect(await this.collection.tokenURI(new BN("1"))).to.contain("https://google.com/nft/");
    });
    it("URI could not be changed by arbitrary address", async function() {
        await expectRevert(this.collection.changeBaseUri("failed", {
            from: stranger
        }), "only for super user");
    });
    it("GHOST addresses can be changed by super user", async function() {
        expect(await this.collection.ghostAddress()).to.be.eq(ZERO_ADDRESS);
        expect(await this.collection.ghostBondingAddress()).to.be.eq(ZERO_ADDRESS);
        await this.collection.setGhostAddresses(this.token.address, stranger);
        expect(await this.collection.ghostAddress()).to.be.eq(this.token.address);
        expect(await this.collection.ghostBondingAddress()).to.be.eq(stranger);
    });
    it("GHOST addresses could not be changed by arbitrary address", async function() {
        await expectRevert(this.collection.setGhostAddresses(this.token.address, stranger, {
            from: stranger
        }), "only for super user");
    });
    describe("affiliate usage", function() {
        it("could aidrop tokens", async function() {
            expect(await this.collection.collateralBalances(new BN("1"), this.token.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.collection.totalSupply()).to.be.bignumber.eq(new BN("1"));
            expect(await this.collection.balanceOf(defaultAddress)).to.be.bignumber.eq(new BN("1"));
            expect(await this.collection.balanceOf(user)).to.be.bignumber.eq(new BN("0"));
            await this.faucet.sendMeGhostNft(defaultAddress);
            expect(await this.collection.collateralBalances(new BN("1"), this.token.address)).to.be.bignumber.eq(rewardUnit);
            expect(await this.collection.totalSupply()).to.be.bignumber.eq(new BN("2"));
            expect(await this.collection.balanceOf(defaultAddress)).to.be.bignumber.eq(new BN("1"));
            expect(await this.collection.balanceOf(user)).to.be.bignumber.eq(new BN("1"));
        });
        it("could not aidrop tokens if no NFT on friends wallet", async function() {
            await expectRevert(this.faucet.sendMeGhostNft(stranger), "ERC721Enumerable: owner index out of bounds");
        });
        it("could aidrop tokens to the first NFT on the friends wallet", async function() {
            await this.collection.renewSuperMinter(user);
            await this.collection.mint(defaultAddress);
            await this.collection.renewSuperMinter(this.faucet.address);
            expect(await this.collection.collateralBalances(new BN("1"), this.token.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.collection.collateralBalances(new BN("2"), this.token.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.collection.totalSupply()).to.be.bignumber.eq(new BN("2"));
            expect(await this.collection.balanceOf(defaultAddress)).to.be.bignumber.eq(new BN("2"));
            expect(await this.collection.balanceOf(user)).to.be.bignumber.eq(new BN("0"));
            await this.faucet.sendMeGhostNft(defaultAddress);
            expect(await this.collection.collateralBalances(new BN("1"), this.token.address)).to.be.bignumber.eq(rewardUnit);
            expect(await this.collection.collateralBalances(new BN("2"), this.token.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.collection.totalSupply()).to.be.bignumber.eq(new BN("3"));
            expect(await this.collection.balanceOf(defaultAddress)).to.be.bignumber.eq(new BN("2"));
            expect(await this.collection.balanceOf(user)).to.be.bignumber.eq(new BN("1"));
        });
        it("changes number of referrals", async function() {
            expect(await this.faucet.referralsNumber(defaultAddress)).to.be.bignumber.eq(new BN("0"));
            await this.faucet.sendMeGhostNft(defaultAddress);
            expect(await this.faucet.referralsNumber(defaultAddress)).to.be.bignumber.eq(new BN("1"));
        });
        it("changes total number of minted tokens", async function() {
            expect(await this.faucet.tokensMinted(defaultAddress)).to.be.bignumber.eq(new BN("0"));
            expect(await this.faucet.totalTokensMinted()).to.be.bignumber.eq(new BN("0"));
            await this.faucet.sendMeGhostNft(defaultAddress);
            expect(await this.faucet.tokensMinted(defaultAddress)).to.be.bignumber.eq(rewardUnit);
            expect(await this.faucet.totalTokensMinted()).to.be.bignumber.eq(rewardUnit);
        });
        it("changes number of minted NFTs", async function() {
            expect(await this.faucet.nftsMinted(user)).to.be.bignumber.eq(new BN("0"));
            expect(await this.collection.totalSupply()).to.be.bignumber.eq(new BN("1"));
            await this.faucet.sendMeGhostNft(defaultAddress);
            expect(await this.faucet.nftsMinted(user)).to.be.bignumber.eq(new BN("1"));
            expect(await this.collection.totalSupply()).to.be.bignumber.eq(new BN("2"));
        });
        it("does not change total number of minted NFTs if it is minted outside", async function() {
            await this.faucet.sendMeGhostNft(defaultAddress);
            expect(await this.faucet.nftsMinted(user)).to.be.bignumber.eq(new BN("1"));
            expect(await this.collection.totalSupply()).to.be.bignumber.eq(new BN("2"));
            await this.collection.renewSuperMinter(user);
            await this.collection.mint(defaultAddress);
            expect(await this.faucet.nftsMinted(user)).to.be.bignumber.eq(new BN("1"));
            expect(await this.collection.totalSupply()).to.be.bignumber.eq(new BN("3"));
        });
        it("increases reward based on sigmoid", async function() {
            await this.faucet.sendMeGhostNft(defaultAddress);
            let prev = await this.collection.collateralBalances(new BN("1"), this.token.address);
            for (let i = 1; i < 5; i++) {
                const multiplier = await this.faucet.sigmoidValue(new BN(i));
                const result = rewardUnit.add(rewardUnit.mul(multiplier));
                await this.faucet.sendMeGhostNft(defaultAddress, {
                    value: new BN("1000")
                });
                expect(await this.collection.collateralBalances(new BN("1"), this.token.address)).to.be.bignumber.eq(result.add(prev));
                prev = result.add(prev);
            }
        });
    });
    describe("multiple self minting", function() {
        it("revert if not enough ETH was send", async function() {
            await this.faucet.sendMeGhostNft(defaultAddress);
            await expectRevert.unspecified(this.faucet.sendMeGhostNft(defaultAddress));
        });
        it("leads to increasing of collection disperse in ETH", async function() {
            await this.faucet.sendMeGhostNft(defaultAddress);
            expect(await this.collection.balanceOf(user)).to.be.bignumber.eq(new BN("1"));
            expect(await this.collection.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            const multiplier = await this.faucet.sigmoidValue(new BN("1"));
            const result = disperseUnit.add(disperseUnit.mul(multiplier));
            await this.faucet.sendMeGhostNft(defaultAddress, {
                value: result
            });
            expect(await this.collection.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(result);
            expect(await this.collection.balanceOf(user)).to.be.bignumber.eq(new BN("2"));
        });
        it("leads to increasing of disperse needed based on sigmoid params", async function() {
            await this.faucet.sendMeGhostNft(defaultAddress);
            let prev = await this.collection.disperseBalance(ZERO_ADDRESS);
            for (let i = 1; i < 5; i++) {
                const multiplier = await this.faucet.sigmoidValue(new BN(i));
                const result = disperseUnit.add(disperseUnit.mul(multiplier));
                await this.faucet.sendMeGhostNft(defaultAddress, {
                    value: result
                });
                expect(await this.collection.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(result.add(prev));
                prev = result.add(prev);
            }
        });
        it("leads to increasing of disperse needed if initial NFT was transfered to other wallet", async function() {
            await this.faucet.sendMeGhostNft(defaultAddress);
            await this.collection.transferFrom(user, stranger, new BN("2"));
            await expectRevert.unspecified(this.faucet.sendMeGhostNft(defaultAddress));
        });
    });
});