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

const ERC20 = artifacts.require("BaseToken");

const BlackHole = artifacts.require("BlackHole");

const ERC721 = artifacts.require("ERC721Mock");

const ERC721Envious = artifacts.require("ERC721EnviousPreset");

const EnviousHouse = artifacts.require("EnviousHouse");

const BondingMock = artifacts.require("BondingMock");

contract("EnviousHouse", function(accounts) {
    const [ holder, other ] = accounts;
    const basicName = "Basic ERC721";
    const enviousName = "Envious ERC721";
    const blackHoleName = "testy";
    const basicSymbol = "BERC";
    const enviousSymbol = "EERC";
    const minimalEthAmount = new BN("100000");
    const uri = "https://test.com/api/";
    beforeEach(async function() {
        this.hole = await BlackHole.new(blackHoleName);
        this.otherHole = await BlackHole.new(`other ${blackHoleName}`);
        this.basicCollection = await ERC721.new(basicName, basicSymbol);
        this.enviousCollection = await ERC721Envious.new(enviousName, enviousSymbol, uri);
        this.baseToken = await ERC20.new("Base Token", "BST");
        this.house = await EnviousHouse.new(this.hole.address, minimalEthAmount);
        this.bondingTimeOffset = 100;
        this.ghost = await ERC20.new("Ghost Token", "GHST");
        this.bonding = await BondingMock.new(this.ghost.address, this.baseToken.address, this.bondingTimeOffset);
        this.amount = minimalEthAmount;
        this.halfAmount = this.amount.div(new BN("2"));
        this.tokenId = new BN("1");
        await this.baseToken.mint(holder, this.amount);
        await this.baseToken.approve(this.enviousCollection.address, this.halfAmount);
        await this.baseToken.approve(this.house.address, this.halfAmount);
        await this.enviousCollection.mint(holder);
        await this.basicCollection.mint(holder, this.tokenId);
    });
    it("black hole address is correct", async function() {
        expect(await this.house.blackHole(this.basicCollection.address)).to.be.eq(this.hole.address);
        expect(await this.house.blackHole(this.enviousCollection.address)).to.be.eq(ZERO_ADDRESS);
    });
    it("comissions are correct", async function() {
        await this.house.registerCollection(this.basicCollection.address, this.baseToken.address, new BN("1"), new BN("1"), {
            value: this.amount
        });
        await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        expect(await this.house.commissions(this.basicCollection.address, new BN("0"))).to.be.bignumber.eq(new BN("1"));
        expect(await this.house.commissions(this.basicCollection.address, new BN("1"))).to.be.bignumber.eq(new BN("1"));
        expect(await this.house.commissions(this.enviousCollection.address, new BN("0"))).to.be.bignumber.eq(new BN("0"));
        expect(await this.house.commissions(this.enviousCollection.address, new BN("1"))).to.be.bignumber.eq(new BN("0"));
    });
    it("community tokens are correct", async function() {
        await this.house.registerCollection(this.basicCollection.address, this.baseToken.address, new BN("1"), new BN("1"), {
            value: this.amount
        });
        await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        expect(await this.house.communityToken(this.basicCollection.address)).to.be.eq(this.baseToken.address);
        expect(await this.house.communityToken(this.enviousCollection.address)).to.be.eq(ZERO_ADDRESS);
    });
    it("number of total collections is correct", async function() {
        expect(await this.house.totalCollections()).to.be.bignumber.eq(new BN("0"));
        await this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        expect(await this.house.totalCollections()).to.be.bignumber.eq(new BN("1"));
        await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        expect(await this.house.totalCollections()).to.be.bignumber.eq(new BN("2"));
    });
    it("collections mapping is correct", async function() {
        await this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        expect(await this.house.collections(new BN("0"))).to.be.bignumber.eq(ZERO_ADDRESS);
        expect(await this.house.collections(new BN("1"))).to.be.bignumber.eq(this.basicCollection.address);
        expect(await this.house.collections(new BN("2"))).to.be.bignumber.eq(this.enviousCollection.address);
    });
    it("collections mapping is correct", async function() {
        await this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        expect(await this.house.collectionIds(this.basicCollection.address)).to.be.bignumber.eq(new BN("1"));
        expect(await this.house.collectionIds(this.enviousCollection.address)).to.be.bignumber.eq(new BN("2"));
        expect(await this.house.collectionIds(this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
    });
    it("could not set if disperse amount is low", async function() {
        await expectRevert(this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0")), "low amount");
    });
    it("could not set if commission exists but no community token provided", async function() {
        await expectRevert(this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("1"), new BN("0"), {
            value: this.amount
        }), "no community token provided");
        await expectRevert(this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("1"), {
            value: this.amount
        }), "no community token provided");
    });
    it("revert if collection already registered", async function() {
        await this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        }), await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        }), await expectRevert(this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("1"), {
            value: this.amount
        }), "collection exists");
        await expectRevert(this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("1"), {
            value: this.amount
        }), "collection exists");
    });
    it("revert if address is not ERC721", async function() {
        await expectRevert.unspecified(this.house.registerCollection(this.baseToken.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        }));
    });
    it("could not set ghost addresses from arbitrary address", async function() {
        await expectRevert.unspecified(this.house.setGhostAddresses(this.baseToken.address, this.baseToken.address, {
            from: other
        }));
    });
    it("could not set ghost addresses when token address is empty", async function() {
        await expectRevert.unspecified(this.house.setGhostAddresses(ZERO_ADDRESS, this.baseToken.address));
    });
    it("could not set ghost addresses when bonding address is empty", async function() {
        await expectRevert.unspecified(this.house.setGhostAddresses(this.baseToken.address, ZERO_ADDRESS));
    });
    it("could set ghost addresses from initializor", async function() {
        await this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
            value: this.amount
        });
        expect(await this.house.ghostAddress(this.basicCollection.address)).to.be.eq(ZERO_ADDRESS);
        expect(await this.house.ghostAddress(this.enviousCollection.address)).to.be.eq(ZERO_ADDRESS);
        expect(await this.house.ghostBondingAddress(this.basicCollection.address)).to.be.eq(ZERO_ADDRESS);
        expect(await this.house.ghostBondingAddress(this.enviousCollection.address)).to.be.eq(ZERO_ADDRESS);
        await this.house.setGhostAddresses(this.ghost.address, this.bonding.address);
        expect(await this.house.ghostAddress(this.basicCollection.address)).to.be.eq(this.ghost.address);
        expect(await this.house.ghostAddress(this.enviousCollection.address)).to.be.eq(ZERO_ADDRESS);
        expect(await this.house.ghostBondingAddress(this.basicCollection.address)).to.be.eq(this.bonding.address);
        expect(await this.house.ghostBondingAddress(this.enviousCollection.address)).to.be.eq(ZERO_ADDRESS);
    });
    describe("collateralize", function() {
        beforeEach(async function() {
            this.communityToken = await ERC20.new("Community Token", "CMT");
            this.badCollection = await ERC721.new("Bad Collection", "BCL");
            await this.house.registerCollection(this.basicCollection.address, this.communityToken.address, new BN("1000"), new BN("1000"), {
                value: this.amount
            });
            await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            });
        });
        it("revert for empty collection", async function() {
            await expectRevert(this.house.collateralize(this.badCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]), "no tokens minted");
        });
        it("with token", async function() {
            await expectRevert.unspecified(this.house.communityPool(this.basicCollection.address, new BN("0")));
            await expectRevert.unspecified(this.house.collateralTokens(this.basicCollection.address, this.tokenId, new BN("0")));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            await this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]);
            const taken = this.halfAmount.mul(new BN("1000")).div(new BN("100000"));
            const newBalance = this.halfAmount.sub(taken);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(this.baseToken.address);
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(taken);
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(newBalance);
        });
        it("with ether", async function() {
            await expectRevert.unspecified(this.house.communityPool(this.basicCollection.address, new BN("0")));
            await expectRevert.unspecified(this.house.collateralTokens(this.basicCollection.address, this.tokenId, new BN("0")));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            await this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ ZERO_ADDRESS ], {
                value: this.halfAmount
            });
            const taken = this.halfAmount.mul(new BN("1000")).div(new BN("100000"));
            const newBalance = this.halfAmount.sub(taken);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.collateralTokens(this.basicCollection.address, this.tokenId, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(taken);
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount.add(newBalance));
        });
        it("emits event Collateralized", async function() {
            expectEvent(await this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]), "Collateralized", {
                collection: this.basicCollection.address,
                tokenId: this.tokenId,
                amount: this.halfAmount,
                tokenAddress: this.baseToken.address
            });
        });
        it("revert if lengths not match", async function() {
            await expectRevert(this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount, this.halfAmount ], [ this.baseToken.address ]), "lengths not match");
        });
        it("with multiple assets", async function() {
            await expectRevert.unspecified(this.house.communityPool(this.basicCollection.address, new BN("0")));
            await expectRevert.unspecified(this.house.collateralTokens(this.basicCollection.address, this.tokenId, new BN("0")));
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            await this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount, this.halfAmount ], [ ZERO_ADDRESS, this.baseToken.address ], {
                gasPrice: 63632263,
                value: this.halfAmount
            });
            const taken = this.halfAmount.mul(new BN("1000")).div(new BN("100000"));
            const newBalance = this.halfAmount.sub(taken);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("1"))).to.be.eq(this.baseToken.address);
            expect(await this.house.collateralTokens(this.basicCollection.address, this.tokenId, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.collateralTokens(this.basicCollection.address, this.tokenId, new BN("1"))).to.be.eq(this.baseToken.address);
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(taken);
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(taken);
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(newBalance);
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount.add(newBalance));
        });
        it("if collateral exists, could not register", async function() {
            await this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]);
            await expectRevert(this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            }), "collection exists");
        });
        describe("for envious", function() {
            it("revert from house", async function() {
                await expectRevert(this.house.collateralize(this.enviousCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]), "already envious");
            });
            it("result is visible from house", async function() {
                await expectRevert.unspecified(this.house.communityPool(this.enviousCollection.address, new BN("0")));
                expect(await this.house.communityBalance(this.enviousCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
                await this.enviousCollection.collateralize(this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]), 
                await expectRevert.unspecified(this.house.communityPool(this.enviousCollection.address, new BN("0")));
                expect(await this.house.communityBalance(this.enviousCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            });
        });
    });
    describe("disperse", function() {
        beforeEach(async function() {
            this.communityToken = await ERC20.new("Community Token", "CMT");
            this.badCollection = await ERC721.new("Bad Collection", "BCL");
            await this.house.registerCollection(this.basicCollection.address, this.communityToken.address, new BN("1000"), new BN("1000"), {
                value: this.amount
            });
            await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            });
        });
        it("revert for empty collection", async function() {
            await expectRevert(this.house.disperse(this.badCollection.address, [ this.halfAmount ], [ this.baseToken.address ]), "no tokens minted");
        });
        it("with token", async function() {
            expect(await this.house.disperseTokens(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            await expectRevert.unspecified(this.house.disperseTokens(this.basicCollection.address, new BN("1")));
            expect(await this.house.disperseBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            await this.house.disperse(this.basicCollection.address, [ this.halfAmount ], [ this.baseToken.address ]);
            expect(await this.house.disperseTokens(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.disperseTokens(this.basicCollection.address, new BN("1"))).to.be.eq(this.baseToken.address);
            expect(await this.house.disperseBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(this.halfAmount);
        });
        it("with ether", async function() {
            expect(await this.house.disperseTokens(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.disperseBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
            await this.house.disperse(this.basicCollection.address, [ this.halfAmount ], [ ZERO_ADDRESS ], {
                gasPrice: 63632263,
                value: this.halfAmount
            });
            expect(await this.house.disperseTokens(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            await expectRevert.unspecified(this.house.disperseTokens(this.basicCollection.address, new BN("1")));
            expect(await this.house.disperseBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount.add(this.halfAmount));
        });
        it("emits event Dispersed", async function() {
            expectEvent(await this.house.disperse(this.basicCollection.address, [ this.halfAmount ], [ this.baseToken.address ]), "Dispersed", {
                collection: this.basicCollection.address,
                amount: this.halfAmount,
                tokenAddress: this.baseToken.address
            });
        });
        it("revert if lengths not match", async function() {
            await expectRevert(this.house.disperse(this.basicCollection.address, [ this.halfAmount, this.halfAmount ], [ this.baseToken.address ]), "lengths not match");
        });
        it("with multiple assets", async function() {
            expect(await this.house.disperseTokens(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            await expectRevert.unspecified(this.house.disperseTokens(this.basicCollection.address, new BN("1")));
            expect(await this.house.disperseBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
            await this.house.disperse(this.basicCollection.address, [ this.halfAmount, this.halfAmount ], [ ZERO_ADDRESS, this.baseToken.address ], {
                gasPrice: 63632263,
                value: this.halfAmount
            });
            expect(await this.house.disperseTokens(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.disperseTokens(this.basicCollection.address, new BN("1"))).to.be.eq(this.baseToken.address);
            expect(await this.house.disperseBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.house.disperseBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount.add(this.halfAmount));
        });
        it("if collateral exists, could not register", async function() {
            await this.house.disperse(this.basicCollection.address, [ this.halfAmount ], [ this.baseToken.address ]);
            await expectRevert(this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            }), "collection exists");
        });
        describe("for envious", function() {
            it("revert from house", async function() {
                await expectRevert(this.house.disperse(this.enviousCollection.address, [ this.halfAmount ], [ this.baseToken.address ]), "already envious");
            });
            it("result is visible from house", async function() {
                await expectRevert.unspecified(this.house.disperseTokens(this.enviousCollection.address, new BN("0")));
                expect(await this.house.disperseBalance(this.enviousCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
                await this.enviousCollection.disperse([ this.halfAmount ], [ this.baseToken.address ]), 
                expect(await this.house.disperseTokens(this.enviousCollection.address, new BN("0"))).to.be.eq(this.baseToken.address);
                expect(await this.house.disperseBalance(this.enviousCollection.address, this.baseToken.address)).to.be.bignumber.eq(this.halfAmount);
            });
        });
    });
    describe("uncollateralize", function() {
        beforeEach(async function() {
            this.communityToken = await ERC20.new("Community Token", "CMT");
            this.badCollection = await ERC721.new("Bad Collection", "BCL");
            await this.house.registerCollection(this.basicCollection.address, this.communityToken.address, new BN("0"), new BN("1000"), {
                value: this.amount
            });
            await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            });
            await this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]);
            await this.enviousCollection.collateralize(this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]);
        });
        it("with token", async function() {
            const prev = await this.baseToken.balanceOf(holder);
            const taken = this.halfAmount.mul(new BN("1000")).div(new BN("100000"));
            const newBalance = this.halfAmount.sub(taken);
            await expectRevert.unspecified(this.house.communityPool(this.basicCollection.address, new BN("0")));
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.halfAmount);
            await this.house.uncollateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(this.baseToken.address);
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(taken);
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(prev.add(newBalance));
        });
        it("with ether", async function() {
            const prev = await balance.current(holder);
            const taken = this.halfAmount.mul(new BN("1000")).div(new BN("100000"));
            const newBalance = this.halfAmount.sub(taken);
            await expectRevert.unspecified(this.house.communityPool(this.basicCollection.address, new BN("0")));
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.disperseTaken(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.disperseTotalTaken(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            const tx = await this.house.uncollateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ ZERO_ADDRESS ], {
                gasPrice: 63632263
            });
            let gasUsed = new BN(tx.receipt.gasUsed);
            gasUsed = gasUsed.mul(new BN("63632263"));
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(taken);
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.house.disperseTaken(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
            expect(await this.house.disperseTotalTaken(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
            expect(await balance.current(holder)).to.be.bignumber.eq(prev.add(newBalance).sub(gasUsed));
        });
        it("emits event Uncollateralized", async function() {
            const result = this.halfAmount.sub(this.halfAmount.mul(new BN("1000")).div(new BN("100000")));
            expectEvent(await this.house.uncollateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]), "Uncollateralized", {
                collection: this.basicCollection.address,
                tokenId: this.tokenId,
                amount: result,
                tokenAddress: this.baseToken.address
            });
        });
        it("revert if lengths not match", async function() {
            await expectRevert(this.house.uncollateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount, this.halfAmount ], [ this.baseToken.address ]), "lengths not match");
        });
        it("only for owner", async function() {
            await expectRevert(this.house.uncollateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ], {
                from: other
            }), "not token owner");
        });
        it("with multiple assets", async function() {
            const prevToken = await this.baseToken.balanceOf(holder);
            const prevEth = await balance.current(holder);
            const taken = this.halfAmount.mul(new BN("1000")).div(new BN("100000"));
            const newBalance = this.halfAmount.sub(taken);
            await expectRevert.unspecified(this.house.communityPool(this.basicCollection.address, new BN("0")));
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.disperseTaken(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.disperseTotalTaken(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            const tx = await this.house.uncollateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount, this.halfAmount ], [ ZERO_ADDRESS, this.baseToken.address ], {
                gasPrice: 63632263
            });
            let gasUsed = new BN(tx.receipt.gasUsed);
            gasUsed = gasUsed.mul(new BN("63632263"));
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("1"))).to.be.eq(this.baseToken.address);
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(taken);
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(taken);
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.house.disperseTaken(this.basicCollection.address, this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
            expect(await this.house.disperseTotalTaken(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
            expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(prevToken.add(newBalance));
            expect(await balance.current(holder)).to.be.bignumber.eq(prevEth.add(newBalance).sub(gasUsed));
            expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(prevToken.add(newBalance));
        });
        it("revert if not registered", async function() {
            await expectRevert(this.house.uncollateralize(this.badCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]), "collection not exists");
        });
        describe("for envious", function() {
            it("revert from house", async function() {
                await expectRevert(this.house.uncollateralize(this.enviousCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]), "already envious");
            });
            it("result is visible from house", async function() {
                const prev = await this.baseToken.balanceOf(holder);
                await expectRevert.unspecified(this.house.communityPool(this.enviousCollection.address, new BN("0")));
                expect(await this.house.communityBalance(this.enviousCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
                expect(await this.house.collateralBalances(this.enviousCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.halfAmount);
                await this.enviousCollection.uncollateralize(this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]);
                expect(await this.house.communityBalance(this.enviousCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
                expect(await this.house.collateralBalances(this.enviousCollection.address, this.tokenId, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
                expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(prev.add(this.halfAmount));
            });
        });
    });
    describe("harvest", function() {
        beforeEach(async function() {
            this.communityToken = await ERC20.new("Community Token", "CMT");
            this.badCollection = await ERC721.new("Bad Collection", "BCL");
            await this.communityToken.mint(holder, this.amount);
            await this.communityToken.approve(this.house.address, this.amount);
            await this.house.registerCollection(this.basicCollection.address, this.communityToken.address, new BN("1000"), new BN("0"), {
                value: this.amount
            });
            await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            });
            await this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ this.baseToken.address ]);
            await this.house.collateralize(this.basicCollection.address, this.tokenId, [ this.halfAmount ], [ ZERO_ADDRESS ], {
                value: this.halfAmount
            });
            this.value = this.halfAmount.mul(new BN("1000")).div(new BN("100000"));
            this.hole = await this.house.blackHole(this.basicCollection.address);
        });
        it("community tokens are correct", async function() {
            expect(await this.house.communityToken(this.basicCollection.address)).to.be.eq(this.communityToken.address);
            expect(await this.house.communityToken(this.enviousCollection.address)).to.be.eq(ZERO_ADDRESS);
        });
        it("with token", async function() {
            const prevBalance = await this.baseToken.balanceOf(holder);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(this.baseToken.address);
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(this.value);
            expect(await this.communityToken.balanceOf(holder)).to.be.bignumber.eq(this.amount);
            expect(await this.communityToken.balanceOf(this.hole)).to.be.bignumber.eq(new BN("0"));
            await this.house.harvest(this.basicCollection.address, [ this.halfAmount ], [ this.baseToken.address ]);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.communityToken.balanceOf(holder)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.communityToken.balanceOf(this.hole)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(prevBalance.add(this.value));
        });
        it("with ether", async function() {
            const prevBalance = await balance.current(holder);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("1"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(this.value);
            expect(await this.communityToken.balanceOf(holder)).to.be.bignumber.eq(this.amount);
            expect(await this.communityToken.balanceOf(this.hole)).to.be.bignumber.eq(new BN("0"));
            const tx = await this.house.harvest(this.basicCollection.address, [ this.halfAmount ], [ ZERO_ADDRESS ], {
                gasPrice: 63632263
            });
            let gasUsed = new BN(tx.receipt.gasUsed);
            gasUsed = gasUsed.mul(new BN("63632263"));
            await expectRevert.unspecified(this.house.communityPool(this.basicCollection.address, new BN("1")));
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.communityToken.balanceOf(holder)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.communityToken.balanceOf(this.hole)).to.be.bignumber.eq(this.halfAmount);
            expect(await balance.current(holder)).to.be.bignumber.eq(prevBalance.sub(gasUsed).add(this.value));
        });
        it("get amount calculation is correct", async function() {
            expect(await this.house.getAmount(this.basicCollection.address, this.halfAmount, this.baseToken.address)).to.be.bignumber.eq(this.value);
            expect(await this.house.getAmount(this.basicCollection.address, this.halfAmount, ZERO_ADDRESS)).to.be.bignumber.eq(this.value);
            await expectRevert.unspecified(this.house.getAmount(this.enviousCollection.address, this.halfAmount, this.baseToken.address));
            await expectRevert.unspecified(this.house.getAmount(this.enviousCollection.address, this.halfAmount, ZERO_ADDRESS));
        });
        it("emits event Harvested", async function() {
            const scaled = await this.house.getAmount(this.basicCollection.address, this.halfAmount, this.baseToken.address);
            expectEvent(await this.house.harvest(this.basicCollection.address, [ this.halfAmount ], [ this.baseToken.address ]), "Harvested", {
                collection: this.basicCollection.address,
                scaledAmount: scaled,
                amount: this.halfAmount,
                tokenAddress: this.baseToken.address
            });
        });
        it("revert if lengths not match", async function() {
            await expectRevert(this.house.harvest(this.basicCollection.address, [ this.halfAmount, this.halfAmount ], [ this.baseToken.address ]), "lengths not match");
        });
        it("with multiple assets", async function() {
            const prevTokenBalance = await this.baseToken.balanceOf(holder);
            const prevEthBalance = await balance.current(holder);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("0"))).to.be.eq(this.baseToken.address);
            expect(await this.house.communityPool(this.basicCollection.address, new BN("1"))).to.be.eq(ZERO_ADDRESS);
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(this.value);
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(this.value);
            expect(await this.communityToken.balanceOf(holder)).to.be.bignumber.eq(this.amount);
            expect(await this.communityToken.balanceOf(this.hole)).to.be.bignumber.eq(new BN("0"));
            const tx = await this.house.harvest(this.basicCollection.address, [ this.halfAmount, this.halfAmount ], [ ZERO_ADDRESS, this.baseToken.address ], {
                gasPrice: 63632263
            });
            let gasUsed = new BN(tx.receipt.gasUsed);
            gasUsed = gasUsed.mul(new BN("63632263"));
            await expectRevert.unspecified(this.house.communityPool(this.basicCollection.address, new BN("0")));
            expect(await this.house.communityBalance(this.basicCollection.address, this.baseToken.address)).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.communityBalance(this.basicCollection.address, ZERO_ADDRESS)).to.be.bignumber.eq(new BN("0"));
            expect(await this.communityToken.balanceOf(holder)).to.be.bignumber.eq(new BN("0"));
            expect(await this.communityToken.balanceOf(this.hole)).to.be.bignumber.eq(this.amount);
            expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(prevTokenBalance.add(this.value));
            expect(await balance.current(holder)).to.be.bignumber.eq(prevEthBalance.sub(gasUsed).add(this.value));
        });
        it("revert if not registered", async function() {
            await expectRevert(this.house.harvest(this.badCollection.address, [ this.halfAmount ], [ this.baseToken.address ]), "collection not exists");
        });
        describe("for envious", function() {
            it("revert from house", async function() {
                await expectRevert(this.house.harvest(this.enviousCollection.address, [ this.halfAmount ], [ this.baseToken.address ]), "already envious");
            });
        });
    });
    describe("getDiscountedCollateral", function() {
        beforeEach(async function() {
            this.badCollection = await ERC721.new("Bad Collection", "BCL");
            await this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            });
            await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            });
            await this.house.setGhostAddresses(this.ghost.address, this.bonding.address);
            await this.enviousCollection.setGhostAddresses(this.ghost.address, this.bonding.address);
        });
        it("ghost addresses are correct", async function() {
            expect(await this.house.ghostAddress(this.basicCollection.address)).to.be.eq(this.ghost.address);
            expect(await this.house.ghostBondingAddress(this.basicCollection.address)).to.be.eq(this.bonding.address);
            expect(await this.house.ghostAddress(this.enviousCollection.address)).to.be.eq(this.ghost.address);
            expect(await this.house.ghostBondingAddress(this.enviousCollection.address)).to.be.eq(this.bonding.address);
        });
        it("with token", async function() {
            const prevBalance = await this.baseToken.balanceOf(holder);
            expect(await this.house.bondPayouts(this.basicCollection.address, this.tokenId)).to.be.bignumber.eq(new BN("0"));
            await expectRevert.unspecified(this.house.bondIndexes(this.basicCollection.address, this.tokenId, new BN("0")));
            await this.house.getDiscountedCollateral(this.basicCollection.address, new BN("1"), this.baseToken.address, this.tokenId, this.halfAmount, this.halfAmount);
            expect(await this.house.bondPayouts(this.basicCollection.address, this.tokenId)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.house.bondIndexes(this.basicCollection.address, this.tokenId, new BN("0"))).to.be.bignumber.eq(new BN("0"));
            expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(prevBalance.sub(this.halfAmount));
        });
        it("collection should be registered", async function() {
            await expectRevert(this.house.getDiscountedCollateral(this.badCollection.address, new BN("1"), this.baseToken.address, this.tokenId, this.halfAmount, this.halfAmount), "collection not exists");
        });
        describe("for envious", function() {
            it("revert from house", async function() {
                await expectRevert(this.house.getDiscountedCollateral(this.enviousCollection.address, new BN("1"), this.baseToken.address, this.tokenId, this.halfAmount, this.halfAmount), "already envious");
            });
            it("envious collection info is visible through house", async function() {
                const prevBalance = await this.baseToken.balanceOf(holder);
                expect(await this.house.bondPayouts(this.enviousCollection.address, this.tokenId)).to.be.bignumber.eq(new BN("0"));
                await expectRevert.unspecified(this.house.bondIndexes(this.enviousCollection.address, this.tokenId, new BN("0")));
                await this.enviousCollection.getDiscountedCollateral(new BN("1"), this.baseToken.address, this.tokenId, this.halfAmount, this.halfAmount);
                expect(await this.house.bondPayouts(this.enviousCollection.address, this.tokenId)).to.be.bignumber.eq(this.halfAmount);
                expect(await this.house.bondIndexes(this.enviousCollection.address, this.tokenId, new BN("0"))).to.be.bignumber.eq(new BN("0"));
                expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(prevBalance.sub(this.halfAmount));
            });
        });
    });
    describe("claimDiscountedCollateral", function() {
        beforeEach(async function() {
            this.badCollection = await ERC721.new("Bad Collection", "BCL");
            await this.house.registerCollection(this.basicCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            });
            await this.house.registerCollection(this.enviousCollection.address, ZERO_ADDRESS, new BN("0"), new BN("0"), {
                value: this.amount
            });
            await this.house.setGhostAddresses(this.ghost.address, this.bonding.address);
            await this.enviousCollection.setGhostAddresses(this.ghost.address, this.bonding.address);
            await this.ghost.mint(this.bonding.address, this.amount);
            await this.house.getDiscountedCollateral(this.basicCollection.address, new BN("1"), this.baseToken.address, this.tokenId, this.halfAmount, this.halfAmount);
            await this.enviousCollection.getDiscountedCollateral(new BN("1"), this.baseToken.address, this.tokenId, this.halfAmount, this.halfAmount);
            await time.increase(this.bondingTimeOffset + 1);
        });
        it("collection should be registered", async function() {
            await expectRevert(this.house.claimDiscountedCollateral(this.badCollection.address, this.tokenId, [ new BN("0") ]), "collection not exists");
        });
        it("correct payout", async function() {
            expect(await this.house.bondPayouts(this.basicCollection.address, this.tokenId)).to.be.bignumber.eq(this.halfAmount);
            expect(await this.house.bondIndexes(this.basicCollection.address, this.tokenId, new BN("0"))).to.be.bignumber.eq(new BN("0"));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.ghost.address)).to.be.bignumber.eq(new BN("0"));
            await this.house.claimDiscountedCollateral(this.basicCollection.address, this.tokenId, [ new BN("0") ]);
            expect(await this.house.bondPayouts(this.basicCollection.address, this.tokenId)).to.be.bignumber.eq(new BN("0"));
            await expectRevert.unspecified(this.house.bondIndexes(this.basicCollection.address, this.tokenId, new BN("0")));
            expect(await this.house.collateralBalances(this.basicCollection.address, this.tokenId, this.ghost.address)).to.be.bignumber.eq(this.halfAmount);
        });
        describe("for envious", function() {
            it("revert from house", async function() {
                await expectRevert(this.house.claimDiscountedCollateral(this.enviousCollection.address, this.tokenId, [ new BN("0") ]), "already envious");
            });
            it("envious collection info is visible throgh house", async function() {
                expect(await this.house.bondPayouts(this.enviousCollection.address, this.tokenId)).to.be.bignumber.eq(this.halfAmount);
                expect(await this.house.bondIndexes(this.enviousCollection.address, this.tokenId, new BN("0"))).to.be.bignumber.eq(new BN("0"));
                expect(await this.house.collateralBalances(this.enviousCollection.address, this.tokenId, this.ghost.address)).to.be.bignumber.eq(new BN("0"));
                await this.enviousCollection.claimDiscountedCollateral(this.tokenId, [ new BN("0") ]);
                expect(await this.house.bondPayouts(this.enviousCollection.address, this.tokenId)).to.be.bignumber.eq(new BN("0"));
                await expectRevert.unspecified(this.house.bondIndexes(this.enviousCollection.address, this.tokenId, new BN("0")));
                expect(await this.house.collateralBalances(this.enviousCollection.address, this.tokenId, this.ghost.address)).to.be.bignumber.eq(this.halfAmount);
            });
        });
    });
});