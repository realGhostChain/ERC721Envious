const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const firstTokenId = new BN(1);
const secondTokenId = new BN(2);
const mockData = '0x42';

function shouldBehaveLikeERC721Pausable (errorPrefix, owner, receiver, operator) {
  context('when token is paused', function () {
    beforeEach(async function () {
      // CHANGED in order to allign with implementation
      await this.token.mint(owner, { from: owner });
      await this.token.pause();
    });

    it('reverts when trying to transferFrom', async function () {
      await expectRevert(
        this.token.transferFrom(owner, receiver, firstTokenId, { from: owner }),
        `${errorPrefix}: token transfer while paused`,
      );
    });

    it('reverts when trying to safeTransferFrom', async function () {
      await expectRevert(
        this.token.safeTransferFrom(owner, receiver, firstTokenId, { from: owner }),
        `${errorPrefix}: token transfer while paused`,
      );
    });

    it('reverts when trying to safeTransferFrom with data', async function () {
      await expectRevert(
        this.token.methods['safeTransferFrom(address,address,uint256,bytes)'](
          owner, receiver, firstTokenId, mockData, { from: owner },
        ), `${errorPrefix}: token transfer while paused`,
      );
    });

    it('reverts when trying to mint', async function () {
      await expectRevert(
        this.token.mint(receiver),
        `${errorPrefix}: token transfer while paused`,
      );
    });

    it('reverts when trying to burn', async function () {
      await expectRevert(
        this.token.burn(firstTokenId),
        `${errorPrefix}: token transfer while paused`,
      );
    });

    describe('getApproved', function () {
      it('returns approved address', async function () {
        const approvedAccount = await this.token.getApproved(firstTokenId);
        expect(approvedAccount).to.equal(ZERO_ADDRESS);
      });
    });

    describe('balanceOf', function () {
      it('returns the amount of tokens owned by the given address', async function () {
        const balance = await this.token.balanceOf(owner);
        expect(balance).to.be.bignumber.equal('1');
      });
    });

    describe('ownerOf', function () {
      it('returns the amount of tokens owned by the given address', async function () {
        const ownerOfToken = await this.token.ownerOf(firstTokenId);
        expect(ownerOfToken).to.equal(owner);
      });
    });

    describe('exists', function () {
      it('returns token existence', async function () {
        expect(await this.token.ownerOf(firstTokenId)).to.be.not.equal(ZERO_ADDRESS);
      });
    });

    describe('isApprovedForAll', function () {
      it('returns the approval of the operator', async function () {
        expect(await this.token.isApprovedForAll(owner, operator)).to.equal(false);
      });
    });
  });
};

module.exports = { shouldBehaveLikeERC721Pausable };
