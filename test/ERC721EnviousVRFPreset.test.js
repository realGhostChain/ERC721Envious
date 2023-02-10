const {
    shouldBehaveLikeERC721,
    shouldBehaveLikeERC721Metadata
} = require("./ERC721/ERC721.behavior");

const {
    shouldBehaveLikeERC721Envious,
    shouldBehaveLikeERC721Discounted,
    shouldBehaveLikeERC721Vrf
} = require("./ERC721/ERC721Envious.behavior");

const {
    shouldBehaveLikeERC721Ownable
} = require("./ERC721/ERC721Ownable.behavior");

const {
    shouldSupportInterfaces
} = require("./utils/introspection/SupportsInterface.behavior");

const {
    BN,
    constants,
    expectEvent,
    expectRevert
} = require("@openzeppelin/test-helpers");

const {
    expect
} = require("chai");

const {
    ZERO_ADDRESS,
    ZERO_BYTES32
} = constants;

const ERC721EnviousMock = artifacts.require("ERC721EnviousVRFPreset");

const BlackHole = artifacts.require("BlackHole");

const BaseToken = artifacts.require("BaseToken");

const VRFCoordinatorV2Mock = artifacts.require("VRFCoordinatorV2Mock");

contract("ERC721EnviousVRFPreset", function(accounts) {
    const name = "Non Fungible Token";
    const symbol = "NFT";
    const ghst = accounts[0];
    const bonding = accounts[1];
    const uri = "ipfs://QmRE5goojZnQj5rmXr2jsFPuuvazSGwCNofknByK5Hswwz/";
    beforeEach(async function() {
        this.blackHole = await BlackHole.new("test");
        this.harvestToken = await BaseToken.new("Harvest Token", "HVT");
        this.vrfCoordinator = await VRFCoordinatorV2Mock.new(new BN("0"), new BN("0"));
        this.token = await ERC721EnviousMock.new(name, symbol, uri, this.vrfCoordinator.address);
        this.collateralFee = new BN("0");
        this.uncollateralFee = new BN("10000");
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
    shouldBehaveLikeERC721("ERC721", ...accounts);
    shouldBehaveLikeERC721Metadata("ERC721", name, symbol, uri, false, ...accounts);
    shouldBehaveLikeERC721Ownable(...accounts);
    shouldBehaveLikeERC721Envious(...accounts);
    shouldBehaveLikeERC721Discounted(...accounts);
    shouldSupportInterfaces([ "ERC721Envious", "ERC721EnviousVrf" ]);
    shouldBehaveLikeERC721Vrf(...accounts);
});