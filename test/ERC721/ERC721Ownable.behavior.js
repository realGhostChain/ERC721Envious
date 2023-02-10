const {
    constants,
    expectEvent,
    expectRevert
} = require("@openzeppelin/test-helpers");

const {
    ZERO_ADDRESS
} = constants;

const {
    expect
} = require("chai");

function shouldBehaveLikeERC721Ownable(owner, other) {
    context("like an ownable ERC721", function() {
        it("has an owner", async function() {
            expect(await this.token.owner()).to.equal(owner);
        });
        describe("transfer ownership", function() {
            it("changes owner after transfer", async function() {
                const receipt = await this.token.transferOwnership(other, {
                    from: owner
                });
                expectEvent(receipt, "OwnershipTransferred");
                expect(await this.token.owner()).to.equal(other);
            });
            it("prevents non-owners from transferring", async function() {
                await expectRevert(this.token.transferOwnership(other, {
                    from: other
                }), "Ownable: caller is not the owner");
            });
            it("guards ownership against stuck state", async function() {
                await expectRevert(this.token.transferOwnership(ZERO_ADDRESS, {
                    from: owner
                }), "Ownable: new owner is the zero address");
            });
        });
        describe("renounce ownership", function() {
            it("loses owner after renouncement", async function() {
                const receipt = await this.token.renounceOwnership({
                    from: owner
                });
                expectEvent(receipt, "OwnershipTransferred");
                expect(await this.token.owner()).to.equal(ZERO_ADDRESS);
            });
            it("prevents non-owners from renouncement", async function() {
                await expectRevert(this.token.renounceOwnership({
                    from: other
                }), "Ownable: caller is not the owner");
            });
        });
    });
}

module.exports = {
    shouldBehaveLikeERC721Ownable: shouldBehaveLikeERC721Ownable
};