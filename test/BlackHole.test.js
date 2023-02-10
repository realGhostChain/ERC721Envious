const {
    BN
} = require("@openzeppelin/test-helpers");

const {
    expect
} = require("chai");

const ERC20 = artifacts.require("BaseToken");

const BlackHole = artifacts.require("BlackHole");

contract("Blackhole", function(accounts) {
    const [ initialHolder ] = accounts;
    const name = "testy";
    const tokenName = "My Token";
    const tokenSymbol = "MTK";
    const initialSupply = new BN("100000");
    beforeEach(async function() {
        this.hole = await BlackHole.new(name);
        this.token = await ERC20.new(tokenName, tokenSymbol);
        await this.token.mint(initialHolder, initialSupply);
    });
    it("has correct name", async function() {
        expect(await this.hole.whoAmI()).to.be.eq(`I'm ${name} blackhole`);
    });
    it("zero initial absorbed balance", async function() {
        const absorbed = await this.hole.absorbedBalance(this.token.address);
        expect(absorbed).to.be.bignumber.eq(new BN("0"));
        expect(await this.token.balanceOf(this.hole.address)).to.be.bignumber.eq(absorbed);
    });
    it("absorbed balance after transfer is correct", async function() {
        const amount = new BN("10000");
        await this.token.transfer(this.hole.address, amount);
        const absorbed = await this.hole.absorbedBalance(this.token.address);
        expect(absorbed).to.be.bignumber.eq(amount);
        expect(await this.token.balanceOf(this.hole.address)).to.be.bignumber.eq(absorbed);
    });
    it("zero initial available supply", async function() {
        const available = await this.hole.availableSupply(this.token.address);
        expect(await this.token.totalSupply()).to.be.bignumber.eq(available);
    });
    it("available supply after transfer is correct", async function() {
        const amount = new BN("10000");
        const totalSupply = await this.token.totalSupply();
        await this.token.transfer(this.hole.address, amount);
        const available = await this.hole.availableSupply(this.token.address);
        expect(totalSupply.sub(amount)).to.be.bignumber.eq(available);
    });
});