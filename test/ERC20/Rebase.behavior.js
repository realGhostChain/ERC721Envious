const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS, MAX_UINT256 } = constants;

function shouldBehaveLikeERC20 (errorPrefix, initialSupply, initialHolder, recipient, anotherAccount) {
  describe('total supply', function () {
    it('returns the initial total amount of tokens', async function () {
      expect(await this.token.totalSupply()).to.be.bignumber.equal(initialSupply);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        expect(await this.token.balanceOf(anotherAccount)).to.be.bignumber.equal('0');
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(initialSupply);
      });
    });
  });

  describe('transfer', function () {
    shouldBehaveLikeERC20Transfer(errorPrefix, initialHolder, recipient, initialSupply,
      function (from, to, value) {
        return this.token.transfer(to, value, { from });
      },
    );
  });

  describe('transfer from', function () {
    const spender = recipient;

    describe('when the token owner is not the zero address', function () {
      const tokenOwner = initialHolder;

      describe('when the recipient is not the zero address', function () {
        const to = anotherAccount;

        describe('when the spender has enough allowance', function () {
          beforeEach(async function () {
            await this.token.approve(spender, initialSupply, { from: initialHolder });
          });

          describe('when the token owner has enough balance', function () {
            const amount = initialSupply;

            it('transfers the requested amount', async function () {
              await this.token.transferFrom(tokenOwner, to, amount, { from: spender });

              expect(await this.token.balanceOf(tokenOwner)).to.be.bignumber.equal('0');

              expect(await this.token.balanceOf(to)).to.be.bignumber.equal(amount);
            });

            it('decreases the spender allowance', async function () {
              await this.token.transferFrom(tokenOwner, to, amount, { from: spender });

              expect(await this.token.allowance(tokenOwner, spender)).to.be.bignumber.equal('0');
            });

            it('emits a transfer event', async function () {
              expectEvent(
                await this.token.transferFrom(tokenOwner, to, amount, { from: spender }),
                'Transfer'
              );
            });

            it('emits an approval event', async function () {
              expectEvent(
                await this.token.transferFrom(tokenOwner, to, amount, { from: spender }),
                'Approval',
                { owner: tokenOwner, spender: spender, value: await this.token.allowance(tokenOwner, spender) },
              );
            });
          });

          describe('when the token owner does not have enough balance', function () {
            const amount = initialSupply;

            beforeEach('reducing balance', async function () {
              await this.token.transfer(to, 1, { from: tokenOwner });
            });


            it('reverts', async function () {
              await expectRevert.unspecified(this.token.transferFrom(tokenOwner, to, amount, { from: spender }));
            });
          });
        });

        describe('when the spender does not have enough allowance', function () {
          const allowance = initialSupply.subn(1);

          beforeEach(async function () {
            await this.token.approve(spender, allowance, { from: tokenOwner });
          });

          describe('when the token owner has enough balance', function () {
            const amount = initialSupply;

            it('reverts', async function () {
              await expectRevert.unspecified(this.token.transferFrom(tokenOwner, to, amount, { from: spender }));
            });
          });

          describe('when the token owner does not have enough balance', function () {
            const amount = allowance;

            beforeEach('reducing balance', async function () {
              await this.token.transfer(to, 2, { from: tokenOwner });
            });

            it('reverts', async function () {
              await expectRevert.unspecified(this.token.transferFrom(tokenOwner, to, amount, { from: spender }));
            });
          });
        });

        describe('when the spender has unlimited allowance', function () {
          beforeEach(async function () {
            await this.token.approve(spender, MAX_UINT256, { from: initialHolder });
          });

          it('does not decrease the spender allowance', async function () {
            await this.token.transferFrom(tokenOwner, to, 1, { from: spender });

            expect(await this.token.allowance(tokenOwner, spender)).to.be.bignumber.equal(MAX_UINT256.subn(1));
          });
        });
      });
    });
  });

  describe('approve', function () {
    shouldBehaveLikeERC20Approve(errorPrefix, initialHolder, recipient, initialSupply,
      function (owner, spender, amount) {
        return this.token.approve(spender, amount, { from: owner });
      },
    );
  });
}

function shouldBehaveLikeERC20Transfer (errorPrefix, from, to, balance, transfer) {
  describe('when the recipient is not the zero address', function () {
    describe('when the sender does not have enough balance', function () {
      const amount = balance.addn(1);

      it('reverts', async function () {
        await expectRevert.unspecified(transfer.call(this, from, to, amount));
      });
    });

    describe('when the sender transfers all balance', function () {
      const amount = balance;

      it('transfers the requested amount', async function () {
        await transfer.call(this, from, to, amount);

        expect(await this.token.balanceOf(from)).to.be.bignumber.equal('0');

        expect(await this.token.balanceOf(to)).to.be.bignumber.equal(amount);
      });

      it('emits a transfer event', async function () {
        expectEvent(
          await transfer.call(this, from, to, amount),
          'Transfer',
          { from, to, value: amount },
        );
      });
    });

    describe('when the sender transfers zero tokens', function () {
      const amount = new BN('0');

      it('transfers the requested amount', async function () {
        await transfer.call(this, from, to, amount);

        expect(await this.token.balanceOf(from)).to.be.bignumber.equal(balance);

        expect(await this.token.balanceOf(to)).to.be.bignumber.equal('0');
      });

      it('emits a transfer event', async function () {
        expectEvent(
          await transfer.call(this, from, to, amount),
          'Transfer',
          { from, to, value: amount },
        );
      });
    });
  });
}

function shouldBehaveLikeERC20Approve (errorPrefix, owner, spender, supply, approve) {
  describe('when the spender is not the zero address', function () {
    describe('when the sender has enough balance', function () {
      const amount = supply;

      it('emits an approval event', async function () {
        expectEvent(
          await approve.call(this, owner, spender, amount),
          'Approval',
          { owner: owner, spender: spender, value: amount },
        );
      });

      describe('when there was no approved amount before', function () {
        it('approves the requested amount', async function () {
          await approve.call(this, owner, spender, amount);

          expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(amount);
        });
      });

      describe('when the spender had an approved amount', function () {
        beforeEach(async function () {
          await approve.call(this, owner, spender, new BN(1));
        });

        it('approves the requested amount and replaces the previous one', async function () {
          await approve.call(this, owner, spender, amount);

          expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(amount);
        });
      });
    });

    describe('when the sender does not have enough balance', function () {
      const amount = supply.addn(1);

      it('emits an approval event', async function () {
        expectEvent(
          await approve.call(this, owner, spender, amount),
          'Approval',
          { owner: owner, spender: spender, value: amount },
        );
      });

      describe('when there was no approved amount before', function () {
        it('approves the requested amount', async function () {
          await approve.call(this, owner, spender, amount);

          expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(amount);
        });
      });

      describe('when the spender had an approved amount', function () {
        beforeEach(async function () {
          await approve.call(this, owner, spender, new BN(1));
        });

        it('approves the requested amount and replaces the previous one', async function () {
          await approve.call(this, owner, spender, amount);

          expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(amount);
        });
      });
    });
  });
}

function shouldBehaveLikeERC20Rebase (errorPrefix, owner, spender, supply) {
  it('arbitrary address could not rebase', async function () {
    await expectRevert(
	  this.rebaseToken.rebase(new BN('0'), new BN('1'), { from: spender }),
	  'sSTRL: only for staking contract'
	);
    await expectRevert(
	  this.rebaseToken.rebase(new BN('0'), new BN('1'), { from: owner }),
	  'sSTRL: only for staking contract'
	);
  });

  it('staking address can rebase with zero profit', async function () {
  	const prevBalance = await this.rebaseToken.balanceOf(this.staking.address);
	expect(prevBalance).to.be.bignumber.equal(supply);
	await this.staking.rebase(new BN('0'), new BN('1'));
	
	const newBalance = await this.rebaseToken.balanceOf(this.staking.address);
	expect(prevBalance).to.be.bignumber.equal(supply);
	expect(prevBalance).to.be.bignumber.equal(newBalance);
  });

  it('staking address can rebase with non-zero profit', async function () {
  	const prevBalance = await this.rebaseToken.balanceOf(this.staking.address);
	expect(prevBalance).to.be.bignumber.equal(supply);
	await this.staking.rebase(new BN('100000000'), new BN('1'));
	
	const newBalance = await this.rebaseToken.balanceOf(this.staking.address);
	expect(prevBalance).to.be.bignumber.lt(newBalance);
  });
}

module.exports = {
  shouldBehaveLikeERC20,
  shouldBehaveLikeERC20Transfer,
  shouldBehaveLikeERC20Approve,
  shouldBehaveLikeERC20Rebase,
};
