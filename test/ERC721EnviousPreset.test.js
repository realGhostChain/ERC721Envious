const {
    shouldBehaveLikeERC721,
    shouldBehaveLikeERC721Metadata,
    shouldBehaveLikeERC721Enumerable
} = require("./ERC721/ERC721.behavior");

const {
    shouldBehaveLikeAccessControl,
    shouldBehaveLikeAccessControlEnumerable
} = require("./access/AccessControl.behavior");

const {
    shouldBehaveLikeERC721Envious,
    shouldBehaveLikeERC721Discounted
} = require("./ERC721/ERC721Envious.behavior");

const {
    shouldBehaveLikeERC721Pausable
} = require("./ERC721/ERC721Pausable.behavior");

const {
    shouldBehaveLikeERC721Burnable
} = require("./ERC721/ERC721Burnable.behavior");

const {
    shouldSupportInterfaces
} = require("./utils/introspection/SupportsInterface.behavior");

const {
    BN,
    constants,
    expectRevert
} = require("@openzeppelin/test-helpers");

const {
    expect
} = require("chai");

const {
    ZERO_ADDRESS
} = constants;

const ERC721EnviousMock = artifacts.require("ERC721EnviousPreset");

const BlackHole = artifacts.require("BlackHole");

const BaseToken = artifacts.require("BaseToken");

contract("ERC721EnviousPreset", function(accounts) {
    const [ holder, stranger ] = accounts;
    const name = "Non Fungible Token";
    const symbol = "NFT";
    const ghst = accounts[0];
    const bonding = accounts[1];
    const token = accounts[2];
    const incomingFee = new BN("10000");
    const outcomingFee = new BN("5000");
    const uri = "ipfs://QmRE5goojZnQj5rmXr2jsFPuuvazSGwCNofknByK5Hswwz/";
    beforeEach(async function() {
        this.blackHole = await BlackHole.new("test");
        this.harvestToken = await BaseToken.new("Harvest Token", "HVT");
        this.token = await ERC721EnviousMock.new(name, symbol, uri);
        await this.token.changeCommissions(incomingFee, outcomingFee);
        await this.token.changeCommunityAddresses(this.harvestToken.address, this.blackHole.address);
        this.collateralFee = incomingFee;
        this.uncollateralFee = outcomingFee;
        this.bondingTimeOffset = 100;
        await this.token.changeCommunityAddresses(this.harvestToken.address, this.blackHole.address);
        await this.token.changeCommissions(this.collateralFee, this.uncollateralFee);
    });
    describe("post deployment checks", function() {
        it("baseURI is correct", async function() {
            expect(await this.token.baseURI()).to.be.eq(uri);
        });
        it("total supply is zero", async function() {
            expect(await this.token.totalSupply()).to.be.bignumber.eq(new BN("0"));
        });
    });
    describe("community addresses", function() {
        it("harvest token could not be zero address", async function() {
            await expectRevert(this.token.changeCommunityAddresses(ZERO_ADDRESS, this.blackHole.address), "zero address");
        });
        it("revert if called from arbitrary address", async function() {
            await expectRevert(this.token.changeCommunityAddresses(this.harvestToken.address, this.blackHole.address, {
                from: accounts[1]
            }), "incorrect role");
        });
    });
    shouldBehaveLikeERC721("ERC721", ...accounts);
    shouldBehaveLikeERC721Metadata("ERC721", name, symbol, uri, false, ...accounts);
    shouldBehaveLikeERC721Enumerable("ERC721", ...accounts);
    shouldBehaveLikeAccessControl("AccessControl", ...accounts);
    shouldBehaveLikeAccessControlEnumerable("AccessControl", ...accounts);
    shouldBehaveLikeERC721Pausable("ERC721Pausable", ...accounts);
    shouldBehaveLikeERC721Burnable("ERC721", ...accounts);
    shouldBehaveLikeERC721Envious(...accounts);
    shouldBehaveLikeERC721Discounted(...accounts);
    shouldSupportInterfaces([ "ERC721Envious" ]);
});