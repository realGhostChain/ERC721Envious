const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const {
  shouldBehaveLikeERC20,
  shouldBehaveLikeERC20Transfer,
  shouldBehaveLikeERC20Approve,
  shouldBehaveLikeERC20Rebase,
} = require('./ERC20/Rebase.behavior');

const ERC20Mock = artifacts.require('RebaseToken');
const StakingMock = artifacts.require('StakingMock');

contract('Rebase ERC20 Token', function (accounts) {
  const [ initialHolder, recipient, anotherAccount ] = accounts;

  const name = 'Staked eGHST';
  const symbol = 'sGHST';

  const initialSupply = new BN('5000000000000000');

  beforeEach(async function () {
    this.token = await ERC20Mock.new();
    this.rebaseToken = await ERC20Mock.new();
    this.staking = await StakingMock.new(new BN('0'), this.rebaseToken.address);
	await this.token.initialize(initialHolder, anotherAccount);
	await this.rebaseToken.initialize(this.staking.address, anotherAccount);
  });

  it('has a name', async function () {
    expect(await this.token.name()).to.equal(name);
  });

  it('has a symbol', async function () {
    expect(await this.token.symbol()).to.equal(symbol);
  });

  it('has 9 decimals', async function () {
    expect(await this.token.decimals()).to.be.bignumber.equal('9');
  });

  shouldBehaveLikeERC20('ERC20', initialSupply, initialHolder, recipient, anotherAccount);

  describe('decrease allowance', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      function shouldDecreaseApproval (amount) {
        describe('when the spender had an approved amount', function () {
          const approvedAmount = amount;

          beforeEach(async function () {
            await this.token.approve(spender, approvedAmount, { from: initialHolder });
          });

          it('emits an approval event', async function () {
            expectEvent(
              await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder }),
              'Approval',
              { owner: initialHolder, spender: spender, value: new BN(0) },
            );
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal('1');
          });

          it('sets the allowance to zero when all allowance is removed', async function () {
            await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal('0');
          });
        });
      }

      describe('when the sender has enough balance', function () {
        const amount = initialSupply;

        shouldDecreaseApproval(amount);
      });

      describe('when the sender does not have enough balance', function () {
        const amount = initialSupply.addn(1);

        shouldDecreaseApproval(amount);
      });
    });
  });

  describe('increase allowance', function () {
    const amount = initialSupply;

    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          expectEvent(
            await this.token.increaseAllowance(spender, amount, { from: initialHolder }),
            'Approval',
            { owner: initialHolder, spender: spender, value: amount },
          );
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), { from: initialHolder });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = initialSupply.addn(1);

        it('emits an approval event', async function () {
          expectEvent(
            await this.token.increaseAllowance(spender, amount, { from: initialHolder }),
            'Approval',
            { owner: initialHolder, spender: spender, value: amount },
          );
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), { from: initialHolder });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

            expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });
    });
  });

  describe('_transfer', function () {
    shouldBehaveLikeERC20Transfer('ERC20', initialHolder, recipient, initialSupply, function (from, to, amount) {
      return this.token.transfer(to, amount, { from: from });
    });
  });

  describe('_approve', function () {
    shouldBehaveLikeERC20Approve('ERC20', initialHolder, recipient, initialSupply, function (owner, spender, amount) {
      return this.token.approve(spender, amount, { from: owner });
    });
  });

  describe('rebase', function () {
    shouldBehaveLikeERC20Rebase('ERC20', initialHolder, recipient, initialSupply);
  });
});
