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
    ZERO_ADDRESS
} = constants;

const {
    shouldBehaveLikeERC20,
    shouldBehaveLikeERC20Transfer,
    shouldBehaveLikeERC20Approve
} = require("./ERC20/DAI.behavior");

const ERC20Mock = artifacts.require("DAI");

contract("DAI Stablecoin Token", function(accounts) {
    const [ initialHolder, recipient, anotherAccount ] = accounts;
    const name = "Dai Stablecoin";
    const symbol = "DAI";
    const initialSupply = new BN(100);
    beforeEach(async function() {
        this.token = await ERC20Mock.new(new BN("1"));
        await this.token.mint(initialHolder, initialSupply);
    });
    it("has a name", async function() {
        expect(await this.token.name()).to.equal(name);
    });
    it("has a symbol", async function() {
        expect(await this.token.symbol()).to.equal(symbol);
    });
    it("has 18 decimals", async function() {
        expect(await this.token.decimals()).to.be.bignumber.equal("18");
    });
    shouldBehaveLikeERC20("Dai", initialSupply, initialHolder, recipient, anotherAccount);
    describe("_mint", function() {
        const amount = new BN(50);
        describe("for a non zero account", function() {
            beforeEach("minting", async function() {
                this.receipt = await this.token.mint(recipient, amount);
            });
            it("increments totalSupply", async function() {
                const expectedSupply = initialSupply.add(amount);
                expect(await this.token.totalSupply()).to.be.bignumber.equal(expectedSupply);
            });
            it("increments recipient balance", async function() {
                expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
            });
            it("emits Transfer event", async function() {
                const event = expectEvent(this.receipt, "Transfer", {
                    src: ZERO_ADDRESS,
                    dst: recipient,
                    wad: amount
                });
                expect(event.args.wad).to.be.bignumber.equal(amount);
            });
        });
    });
    describe("_burn", function() {
        describe("for a non zero account", function() {
            it("rejects burning more than balance", async function() {
                await expectRevert(this.token.burn(initialHolder, initialSupply.addn(1), {
                    from: initialHolder
                }), "Dai/insufficient-balance");
            });
            const describeBurn = function(description, amount) {
                describe(description, function() {
                    beforeEach("burning", async function() {
                        this.receipt = await this.token.burn(initialHolder, amount, {
                            from: initialHolder
                        });
                    });
                    it("decrements totalSupply", async function() {
                        const expectedSupply = initialSupply.sub(amount);
                        expect(await this.token.totalSupply()).to.be.bignumber.equal(expectedSupply);
                    });
                    it("decrements initialHolder balance", async function() {
                        const expectedBalance = initialSupply.sub(amount);
                        expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(expectedBalance);
                    });
                    it("emits Transfer event", async function() {
                        const event = expectEvent(this.receipt, "Transfer", {
                            src: initialHolder,
                            dst: ZERO_ADDRESS,
                            wad: amount
                        });
                        expect(event.args.wad).to.be.bignumber.equal(amount);
                    });
                });
            };
            describeBurn("for entire balance", initialSupply);
            describeBurn("for less amount than balance", initialSupply.subn(1));
        });
    });
    describe("_transfer", function() {
        shouldBehaveLikeERC20Transfer("Dai", initialHolder, recipient, initialSupply, function(from, to, amount) {
            return this.token.transfer(to, amount, {
                from: from
            });
        });
    });
    describe("_approve", function() {
        shouldBehaveLikeERC20Approve("Dai", initialHolder, recipient, initialSupply, function(owner, spender, amount) {
            return this.token.approve(spender, amount, {
                from: owner
            });
        });
    });
});