const { BN, balance, constants, time, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_BYTES32, ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const StakingMock = artifacts.require('StakingMock');
const RebaseToken = artifacts.require('RebaseToken');
const BaseToken = artifacts.require('BaseToken');
const Dai = artifacts.require('DAI');
const Usdt = artifacts.require('TetherToken');
const BadToken = artifacts.require('BadToken');
const BondingMock = artifacts.require('BondingMock');

function shouldBehaveLikeERC721Envious (holder, stranger) {
  context('like a ERC721Envious', function () {
	beforeEach(async function () {
	  this.baseToken = await BaseToken.new('Base Token', 'BST');
	  this.rebaseToken = await RebaseToken.new();
	  this.staking = await StakingMock.new(new BN('0'), this.rebaseToken.address);
	  this.daiToken = await Dai.new(new BN('1'));
	  this.usdtToken = await Usdt.new();
	  this.amount = new BN('100000');

	  await this.rebaseToken.initialize(this.staking.address, holder);
	  await this.staking.fund(this.amount);
	  await this.baseToken.mint(holder, this.amount);
	  await this.daiToken.mint(holder, this.amount);
	  await this.usdtToken.mint(holder, this.amount);

	  await this.baseToken.approve(this.token.address, this.amount);
	  await this.daiToken.approve(this.token.address, this.amount);
	  await this.usdtToken.approve(this.token.address, this.amount);
	  await this.rebaseToken.approve(this.token.address, this.amount);

	  await this.token.mint(holder);
	  this.tokenId = new BN('1');
	  this.commissionCollateral = this.amount.mul(this.collateralFee).div(new BN('100000'));
	  this.commissionUncollateral = this.amount.mul(this.uncollateralFee).div(new BN('100000'));
	});

    describe('post deployment checks', function () {
	  it('black hole address is correct', async function () {
	    expect(await this.token.blackHole()).to.be.eq(this.blackHole.address);
	  });

	  it('token for harvesting is correct', async function () {
	    expect(await this.token.communityToken()).to.be.eq(this.harvestToken.address);
	  });

	  it('commissions are correct', async function () {
	    const collateralFee = await this.token.commissions(new BN('0'));
	    expect(collateralFee).to.be.bignumber.eq(this.collateralFee);
	    const uncollateralFee = await this.token.commissions(new BN('1'));
	    expect(uncollateralFee).to.be.bignumber.eq(this.uncollateralFee);
	  });

	  it('ghost token address is zero by default', async function () {
	    expect(await this.token.ghostAddress()).to.be.eq(ZERO_ADDRESS);
	  });

	  it('ghost bonding address is ero by default', async function () {
	    expect(await this.token.ghostBondingAddress()).to.be.eq(ZERO_ADDRESS);
	  });

	  it('could set community addresses', async function () {
	    await this.token.changeCommunityAddresses(holder, holder);
	    expect(await this.token.communityToken()).to.be.eq(holder);
	    expect(await this.token.blackHole()).to.be.eq(holder);
	  });
	});

    describe('collateralization', function () {
	  it('with basic token', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));
	    await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address]);
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(this.baseToken.address);
	    expect(await this.token.collateralBalances(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.amount.sub(this.commissionCollateral));
	  });

	  it('with DAI mock', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.daiToken.address)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));
	    await this.token.collateralize(this.tokenId, [this.amount], [this.daiToken.address]);
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(this.daiToken.address);
	    expect(await this.token.collateralBalances(this.tokenId, this.daiToken.address)).to.be.bignumber.eq(this.amount.sub(this.commissionCollateral));
	  });

	  it('with USDT mock', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.usdtToken.address)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));
	    await this.token.collateralize(this.tokenId, [this.amount], [this.usdtToken.address]);
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(this.usdtToken.address);
	    expect(await this.token.collateralBalances(this.tokenId, this.usdtToken.address)).to.be.bignumber.eq(this.amount.sub(this.commissionCollateral));
	  });

	  it('with rebasing token', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.rebaseToken.address)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));
	    await this.token.collateralize(this.tokenId, [this.amount], [this.rebaseToken.address]);
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(this.rebaseToken.address);
	    expect(await this.token.collateralBalances(this.tokenId, this.rebaseToken.address)).to.be.bignumber.eq(this.amount.sub(this.commissionCollateral));
	  });

	  it('with ether', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));
	    await this.token.collateralize(this.tokenId, [this.amount], [ZERO_ADDRESS], { value: this.amount });
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(ZERO_ADDRESS);
	    expect(await this.token.collateralBalances(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amount.sub(this.commissionCollateral));
	  });

	  it('emits an event Collateralize', async function () {
	    expectEvent(
	      await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address]),
	      'Collateralized',
	      { 
	    	  tokenId: this.tokenId, amount: this.amount, 
	    	  tokenAddress: this.baseToken.address
	      }
	    )
	  });
	  
	  it('with multiple tokens', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.rebaseToken.address)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));
	   
	    const amounts = [ this.amount, this.amount, this.amount, this.amount, this.amount ];
	    const tokens = [ this.baseToken.address, this.daiToken.address, this.usdtToken.address, this.rebaseToken.address, ZERO_ADDRESS ];
	    await this.token.collateralize(this.tokenId, amounts, tokens, { value: this.amount });
	    
	    for (let i = 0; i < tokens.length; i++) {
	      expect(await this.token.collateralTokens(this.tokenId, new BN(i.toString()))).to.be.eq(tokens[i]);
	      expect(await this.token.collateralBalances(this.tokenId, tokens[i])).to.be.bignumber.eq(amounts[i].sub(this.commissionCollateral));
	    }
	  });
	  
	  it('with multiple tokens while array lengths should match', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.rebaseToken.address)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));
	   
	    const wrongAmounts = [this.amount];
	    const amounts = [this.amount, this.amount, this.amount, this.amount, this.amount];
	    const tokens = [this.rebaseToken.address, this.daiToken.address, this.usdtToken.address, this.rebaseToken.address, ZERO_ADDRESS];
	    const wrongTokens = [this.rebaseToken.address];
	    
	    await expectRevert(
	    	this.token.collateralize(this.tokenId, wrongAmounts, tokens),
	    	'ERC721Envious: lengths not match'
	    )
	    
	    await expectRevert(
	    	this.token.collateralize(this.tokenId, amounts, wrongTokens),
	    	'ERC721Envious: lengths not match'
	    )
	  });
	  
	  it('multiple times', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));

	    await this.token.collateralize(this.tokenId, [this.amount.div(new BN('2'))], [this.baseToken.address]);
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(this.baseToken.address);
	    expect(await this.token.collateralBalances(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.amount.sub(this.commissionCollateral).div(new BN('2')));

	    await this.token.collateralize(this.tokenId, [this.amount.div(new BN('2'))], [this.baseToken.address]);
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(this.baseToken.address);
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('1')));
	    expect(await this.token.collateralBalances(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.amount.sub(this.commissionCollateral));
	  });
	  
	  it('available for any arbitrary address', async function () {
	    await this.baseToken.mint(stranger, this.amount, { from: stranger });
	    await this.baseToken.approve(this.token.address, this.amount, { from: stranger });

	    expectEvent(
	      await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address], { from: stranger }),
	      'Collateralized',
	      { 
	    	  tokenId: this.tokenId, amount: this.amount, 
	    	  tokenAddress: this.baseToken.address 
	      }
	    )
	  });

	  it('revert if amounts exceeds actual balance', async function () {
	    await expectRevert.unspecified(this.token.collateralize(this.tokenId, [this.amount, this.amount], [this.baseToken.address, this.baseToken.address]));
	  });

	  it('revert if amount not match to ether sent value', async function () {
	    await expectRevert.unspecified(this.token.collateralize(this.tokenId, [this.amount], [ZERO_ADDRESS], { value: new BN('1') }));
	  });

	  it('extra ether will be send back', async function () {
	    const eth = await balance.current(holder);
	    const tx = await this.token.collateralize(this.tokenId, [this.amount], [ZERO_ADDRESS], { value: this.amount.mul(new BN('2')), gasPrice: 63632263 });
	    let gasUsed = new BN(tx.receipt.gasUsed);
	    gasUsed = gasUsed.mul(new BN('63632263'));
	    expect(await balance.current(holder)).to.be.bignumber.eq(eth.sub(gasUsed).sub(this.amount));
	  });

	  it('total balances correct', async function () {
	    expect(await this.baseToken.balanceOf(this.token.address)).to.be.bignumber.eq(new BN('0'));
	    expect(await balance.current(this.token.address)).to.be.bignumber.eq(new BN('0'));
	
	    await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address]);
	    await this.token.collateralize(this.tokenId, [this.amount], [ZERO_ADDRESS], { value: this.amount });
	
	    expect(await this.baseToken.balanceOf(this.token.address)).to.be.bignumber.eq(this.amount);
	    expect(await balance.current(this.token.address)).to.be.bignumber.eq(this.amount);
	  });
	});

    describe('uncollateralization', function () {
	  beforeEach(async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address]);
	    await this.token.collateralize(this.tokenId, [this.amount], [this.rebaseToken.address]);
	    await this.token.collateralize(this.tokenId, [this.amount], [this.daiToken.address]);
	    await this.token.collateralize(this.tokenId, [this.amount], [this.usdtToken.address]);
	    await this.token.collateralize(this.tokenId, [this.amount], [ZERO_ADDRESS], { value: this.amount });

		this.backAmount = this.amount.div(new BN('2'));
		this.afterCollateral = this.amount.mul(this.collateralFee).div(new BN('100000'));
		this.afterHalfFee = this.backAmount.mul(this.uncollateralFee).div(new BN('100000'));
		this.afterfullFee = this.afterCollateral.mul(this.uncollateralFee).div(new BN('100000'));

		this.amountAfterCollateral = this.amount.sub(this.afterCollateral);
		this.amountAfterUncollateral = this.amountAfterCollateral.sub(this.backAmount);
	  });

	  it('of basic token', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.amountAfterCollateral);
	    expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(new BN('0'));
	    await this.token.uncollateralize(this.tokenId, [this.backAmount], [this.baseToken.address]);
	    expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(this.backAmount.sub(this.afterHalfFee));
	    expect(await this.token.collateralBalances(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.amountAfterUncollateral);
	  });

	  it('of DAI mock', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.daiToken.address)).to.be.bignumber.eq(this.amountAfterCollateral);
	    expect(await this.daiToken.balanceOf(holder)).to.be.bignumber.eq(new BN('0'));
	    await this.token.uncollateralize(this.tokenId, [this.backAmount], [this.daiToken.address]);
	    expect(await this.daiToken.balanceOf(holder)).to.be.bignumber.eq(this.backAmount.sub(this.afterHalfFee));
	    expect(await this.token.collateralBalances(this.tokenId, this.daiToken.address)).to.be.bignumber.eq(this.amountAfterUncollateral);
	  });

	  it('of USDT mock', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.usdtToken.address)).to.be.bignumber.eq(this.amountAfterCollateral);
	    expect(await this.usdtToken.balanceOf(holder)).to.be.bignumber.eq(new BN('0'));
	    await this.token.uncollateralize(this.tokenId, [this.backAmount], [this.usdtToken.address]);
	    expect(await this.usdtToken.balanceOf(holder)).to.be.bignumber.eq(this.backAmount.sub(this.afterHalfFee));
	    expect(await this.token.collateralBalances(this.tokenId, this.usdtToken.address)).to.be.bignumber.eq(this.amountAfterUncollateral);
	  });

	  it('of rebasing token', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, this.rebaseToken.address)).to.be.bignumber.eq(this.amountAfterCollateral);
	    expect(await this.rebaseToken.balanceOf(holder)).to.be.bignumber.eq(new BN('0'));
	    await this.token.uncollateralize(this.tokenId, [this.backAmount], [this.rebaseToken.address]);
	    expect(await this.rebaseToken.balanceOf(holder)).to.be.bignumber.eq(this.backAmount.sub(this.afterHalfFee));
	    expect(await this.token.collateralBalances(this.tokenId, this.rebaseToken.address)).to.be.bignumber.eq(this.amountAfterUncollateral);
	  });

	  it('of ether', async function () {
	    expect(await this.token.collateralBalances(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amountAfterCollateral);
	    const eth = await balance.current(holder);
	    let tx = await this.token.uncollateralize(this.tokenId, [this.backAmount], [ZERO_ADDRESS], { gasPrice: 63632263 });
		let gasUsed = new BN(tx.receipt.gasUsed);
		gasUsed = gasUsed.mul(new BN('63632263'));
	    expect(await this.token.collateralBalances(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amountAfterUncollateral);
	    const result = this.backAmount.sub(this.backAmount.mul(this.uncollateralFee).div(new BN('100000')));
	    expect(await balance.current(holder)).to.be.bignumber.eq(eth.sub(gasUsed).add(result));
	  });

	  it('total balances correct', async function () {
	    expect(await this.baseToken.balanceOf(this.token.address)).to.be.bignumber.eq(this.amount);
	    expect(await balance.current(this.token.address)).to.be.bignumber.eq(this.amount);
	
	    await this.token.uncollateralize(this.tokenId, [this.backAmount], [this.baseToken.address]);
	    await this.token.uncollateralize(this.tokenId, [this.backAmount], [ZERO_ADDRESS]);
	    const result = this.backAmount.add(this.backAmount.mul(this.uncollateralFee).div(new BN('100000')));

	    expect(await this.baseToken.balanceOf(this.token.address)).to.be.bignumber.eq(result);
	    expect(await balance.current(this.token.address)).to.be.bignumber.eq(result);
	  });

	  it('of multiple tokens', async function () {
	    const tokens = [this.baseToken, this.daiToken, this.usdtToken, this.rebaseToken, ZERO_ADDRESS];

	    for (let i = 0; i < tokens.length; i++) {
	      if (tokens[i] === ZERO_ADDRESS) {
	        expect(await this.token.collateralBalances(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amountAfterCollateral);
	        const eth = await balance.current(holder);
	        let tx = await this.token.uncollateralize(this.tokenId, [this.backAmount], [ZERO_ADDRESS], { gasPrice: 63632263 });
			let gasUsed = new BN(tx.receipt.gasUsed);
			gasUsed = gasUsed.mul(new BN('63632263'));
	        expect(await this.token.collateralBalances(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.amountAfterUncollateral);
	        const result = this.backAmount.sub(this.backAmount.mul(this.uncollateralFee).div(new BN('100000')));
	        expect(await balance.current(holder)).to.be.bignumber.eq(eth.sub(gasUsed).add(result));
	      } else {
	        expect(await this.token.collateralBalances(this.tokenId, tokens[i].address)).to.be.bignumber.eq(this.amountAfterCollateral);
	        expect(await tokens[i].balanceOf(holder)).to.be.bignumber.eq(new BN('0'));
	        await this.token.uncollateralize(this.tokenId, [this.backAmount], [tokens[i].address]);
	        expect(await tokens[i].balanceOf(holder)).to.be.bignumber.eq(this.backAmount.sub(this.afterHalfFee));
	        expect(await this.token.collateralBalances(this.tokenId, tokens[i].address)).to.be.bignumber.eq(this.amountAfterUncollateral);
	      }
	    }
	  });

	  it('emits an event Uncollateralize', async function () {
	    expectEvent(
	      await this.token.uncollateralize(this.tokenId, [this.backAmount], [this.baseToken.address]),
	      'Uncollateralized',
	      { 
	    	  tokenId: this.tokenId, amount: this.backAmount.sub(this.backAmount.mul(this.uncollateralFee).div(new BN('100000'))), 
	    	  tokenAddress: this.baseToken.address
	      }
	    )
	  });

	  it('clears array of addresses', async function () {
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(this.baseToken.address);
	    expect(await this.token.collateralTokens(this.tokenId, new BN('4'))).to.be.eq(ZERO_ADDRESS);

	    const full = await this.token.collateralBalances(this.tokenId, this.baseToken.address);
	    await this.token.uncollateralize(this.tokenId, [full], [this.baseToken.address]);

	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(ZERO_ADDRESS);
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('4')));
	  });

	  it('forbidden for arbitrary address', async function () {
	    await expectRevert(
	    	this.token.uncollateralize(this.tokenId, [this.backAmount], [this.baseToken.address], { from: stranger }),
	    	'ERC721Envious: only for owner'
	    );
	  });

	  it('revert if amounts not match with addresses', async function () {
	    const wrongAmounts = [this.amount];
	    const amounts = [this.amount, this.amount, this.amount, this.amount, this.amount];
	    const wrongTokens = [ZERO_ADDRESS]
	    const tokens = [this.baseToken.address, this.daiToken.address, this.usdtToken.address, this.rebaseToken.address, ZERO_ADDRESS]

	    await expectRevert(
	    	this.token.uncollateralize(this.tokenId, wrongAmounts, tokens),
	    	'ERC721Envious: lengths not match'
	    );

	    await expectRevert(
	    	this.token.uncollateralize(this.tokenId, amounts, wrongTokens),
	    	'ERC721Envious: lengths not match'
	    );
	  });

	  it('revert if amounts exceeds actual collateral', async function () {
	    await expectRevert.unspecified(this.token.uncollateralize(this.tokenId, [this.amount.mul(new BN('2'))], [this.baseToken.address]));
	  });
	});

    describe('disperse', function () {
	  it('of basic token', async function () {
	    expect(await this.token.disperseBalance(this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(this.amount);
	    await expectRevert.unspecified(this.token.disperseTokens(new BN('0')));

	    await this.token.disperse([this.amount], [this.baseToken.address]);
	    expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(new BN('0'));

	    expect(await this.token.disperseBalance(this.baseToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseTokens(new BN('0'))).to.be.eq(this.baseToken.address);
	  });
	    
	  it('of DAI mock', async function () {
	    expect(await this.token.disperseBalance(this.daiToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.daiToken.balanceOf(holder)).to.be.bignumber.eq(this.amount);
	    await expectRevert.unspecified(this.token.disperseTokens(new BN('0')));

	    await this.token.disperse([this.amount], [this.daiToken.address]);
	    expect(await this.daiToken.balanceOf(holder)).to.be.bignumber.eq(new BN('0'));

	    expect(await this.token.disperseBalance(this.daiToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseTokens(new BN('0'))).to.be.eq(this.daiToken.address);
	  });

	  it('of USDT mock', async function () {
	    expect(await this.token.disperseBalance(this.usdtToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.usdtToken.balanceOf(holder)).to.be.bignumber.eq(this.amount);
	    await expectRevert.unspecified(this.token.disperseTokens(new BN('0')));

	    await this.token.disperse([this.amount], [this.usdtToken.address]);
	    expect(await this.usdtToken.balanceOf(holder)).to.be.bignumber.eq(new BN('0'));

	    expect(await this.token.disperseBalance(this.usdtToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseTokens(new BN('0'))).to.be.eq(this.usdtToken.address);
	  });

	  it('of rebasing token', async function () {
	    expect(await this.token.disperseBalance(this.rebaseToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.rebaseToken.balanceOf(holder)).to.be.bignumber.eq(this.amount);
	    await expectRevert.unspecified(this.token.disperseTokens(new BN('0')));

	    await this.token.disperse([this.amount], [this.rebaseToken.address]);
	    expect(await this.rebaseToken.balanceOf(holder)).to.be.bignumber.eq(new BN('0'));

	    expect(await this.token.disperseBalance(this.rebaseToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseTokens(new BN('0'))).to.be.eq(this.rebaseToken.address);
	  });

	  it('of ether', async function () {
	    expect(await this.token.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(new BN('0'));
	    const prevBalance = await balance.current(holder);;
	    await expectRevert.unspecified(this.token.disperseTokens(new BN('0')));

	    let tx = await this.token.disperse([this.amount], [ZERO_ADDRESS], { value: this.amount, gasPrice: 63632263 });
		let gasUsed = new BN(tx.receipt.gasUsed);
		gasUsed = gasUsed.mul(new BN('63632263'));
	    expect(await balance.current(holder)).to.be.bignumber.eq(prevBalance.sub(gasUsed).sub(this.amount));

	    expect(await this.token.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseTokens(new BN('0'))).to.be.eq(ZERO_ADDRESS);
	  });

	  it('of ether without msg.value fails', async function () {
	    await expectRevert.unspecified(this.token.disperse([this.amount], [ZERO_ADDRESS]));
	  });

	  it('of ether, rest is returned back', async function () {
	    const value = await balance.current(holder);
	    await this.token.disperse([this.amount], [ZERO_ADDRESS], { value: value.div(new BN('2')) })
	    expect(await balance.current(holder)).to.be.bignumber.gt(value.div(new BN('2')));
	  });

	  it('emits event Dispersed', async function () {
	  	expectEvent(
	      await this.token.disperse([this.amount], [this.baseToken.address]),
	      'Dispersed',
	      { tokenAddress: this.baseToken.address, amount: this.amount }
	    );
	  });

	  it('with direct sending of ether to smart contract', async function () {
	    expect(await this.token.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(new BN('0'));
	  	expectEvent(
	      await this.token.sendTransaction({ from: holder, to: this.token.address , value: this.amount }),
	      'Dispersed',
	      { tokenAddress: ZERO_ADDRESS, amount: this.amount }
	    );
	    expect(await this.token.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
	  });

	  it('disperse of multiple tokens', async function () {
	    await expectRevert.unspecified(this.token.disperseTokens(new BN('0')));
	    const amounts = [this.amount, this.amount, this.amount, this.amount, this.amount];
	    const tokens = [ this.baseToken.address, this.daiToken.address, this.usdtToken.address, this.rebaseToken.address, ZERO_ADDRESS ];

	    await this.token.disperse(amounts, tokens, { value: this.amount });

	    expect(await this.token.disperseTokens(new BN('0'))).to.be.eq(this.baseToken.address);
	    expect(await this.token.disperseTokens(new BN('1'))).to.be.eq(this.daiToken.address);
	    expect(await this.token.disperseTokens(new BN('2'))).to.be.eq(this.usdtToken.address);
	    expect(await this.token.disperseTokens(new BN('3'))).to.be.eq(this.rebaseToken.address);
	    expect(await this.token.disperseTokens(new BN('4'))).to.be.eq(ZERO_ADDRESS);

	    expect(await this.token.disperseBalance(this.baseToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseBalance(this.daiToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseBalance(this.usdtToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseBalance(this.rebaseToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(this.amount);
	  });
	  
	  it('any arbitrary address can disperse', async function () {
	    await this.baseToken.transfer(stranger, this.amount);
	    await this.baseToken.approve(this.token.address, this.amount, { from: stranger });

	  	expectEvent(
	      await this.token.sendTransaction({ from: stranger, to: this.token.address , value: this.amount }),
	      'Dispersed',
	      { tokenAddress: ZERO_ADDRESS, amount: this.amount }
	    );

	  	expectEvent(
	      await this.token.disperse([this.amount], [this.baseToken.address], { from: stranger }),
	      'Dispersed',
	      { tokenAddress: this.baseToken.address, amount: this.amount }
	    );
	  });
	  
      it('revert if amounts not match with addresses', async function () {
	    const amounts = [ this.amount, this.amount, this.amount, this.amount, this.amount ];
	    const wrongAmounts = [ this.amount ];
	    const tokens = [ this.baseToken.address, this.daiToken.address, this.usdtToken.address, this.rebaseToken.address, ZERO_ADDRESS ];
	    const wrongTokens = [ this.baseToken.address ];
	    
	    await expectRevert(this.token.disperse(wrongAmounts, tokens), 'ERC721Envious: lengths not match');
	    await expectRevert(this.token.disperse(amounts, wrongTokens), 'ERC721Envious: lengths not match');
	  });

	  it('revert if amounts exceeds actual balance', async function () {
	    await expectRevert.unspecified(this.token.disperse([this.amount.mul(new BN('2'))], [this.baseToken.address]))
	  });

	  it('revert if amount not match to ether sent value', async function () {
	    await expectRevert.unspecified(this.token.disperse([this.amount], [ZERO_ADDRESS], { value: new BN('1') }))
	  });
	});

    describe('harvest', function () {
	  beforeEach(async function () {
		if (this.collateralFee.toString() === '0' && this.uncollateralFee.toString() === '0') {
		  this.skip();
		} else {
		  await this.harvestToken.mint(stranger, this.amount);
		  await this.harvestToken.approve(this.token.address, this.amount, { from: stranger });
		}
	  });
		
	  it('of basic token', async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address]);
	    let collected = this.amount.mul(this.collateralFee).div(new BN('100000'));
	    let tokenBalance = this.amount.sub(collected);

	    expect(await this.baseToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.baseToken.balanceOf(this.token.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(new BN('0'));

	    if (this.uncollateralFee.toString() !== '0') {
	      await this.token.uncollateralize(this.tokenId, [this.amount.sub(collected)], [this.baseToken.address]);
	      collected = collected.add(this.amount.sub(collected).mul(this.uncollateralFee).div(new BN('100000')));
	      tokenBalance = new BN('0');
	    }

	    await this.token.harvest([this.amount], [this.baseToken.address], { from: stranger });

	    expect(await this.baseToken.balanceOf(stranger)).to.be.bignumber.eq(collected);
	    expect(await this.baseToken.balanceOf(this.token.address)).to.be.bignumber.eq(tokenBalance);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(this.amount);

	    await expectRevert.unspecified(this.token.communityPool(new BN('0')));
	  });

	  it('of DAI mock', async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [this.daiToken.address]);
	    let collected = this.amount.mul(this.collateralFee).div(new BN('100000'));
	    let tokenBalance = this.amount.sub(collected);

	    expect(await this.daiToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.daiToken.balanceOf(this.token.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(new BN('0'));

	    if (this.uncollateralFee.toString() !== '0') {
	      await this.token.uncollateralize(this.tokenId, [this.amount.sub(collected)], [this.daiToken.address]);
	      collected = collected.add(this.amount.sub(collected).mul(this.uncollateralFee).div(new BN('100000')));
	      tokenBalance = new BN('0');
	    }

	    await this.token.harvest([this.amount], [this.daiToken.address], { from: stranger });

	    expect(await this.daiToken.balanceOf(stranger)).to.be.bignumber.eq(collected);
	    expect(await this.daiToken.balanceOf(this.token.address)).to.be.bignumber.eq(tokenBalance);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(this.amount);

	    await expectRevert.unspecified(this.token.communityPool(new BN('0')));
	  });

	  it('of USDT mock', async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [this.usdtToken.address]);
	    let collected = this.amount.mul(this.collateralFee).div(new BN('100000'));
	    let tokenBalance = this.amount.sub(collected);

	    expect(await this.usdtToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.usdtToken.balanceOf(this.token.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(new BN('0'));

	    if (this.uncollateralFee.toString() !== '0') {
	      await this.token.uncollateralize(this.tokenId, [this.amount.sub(collected)], [this.usdtToken.address]);
	      collected = collected.add(this.amount.sub(collected).mul(this.uncollateralFee).div(new BN('100000')));
	      tokenBalance = new BN('0');
	    }

	    await this.token.harvest([this.amount], [this.usdtToken.address], { from: stranger });

	    expect(await this.usdtToken.balanceOf(stranger)).to.be.bignumber.eq(collected);
	    expect(await this.usdtToken.balanceOf(this.token.address)).to.be.bignumber.eq(tokenBalance);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(this.amount);

	    await expectRevert.unspecified(this.token.communityPool(new BN('0')));
	  });

	  it('of rebasing token', async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [this.rebaseToken.address]);
	    let collected = this.amount.mul(this.collateralFee).div(new BN('100000'));
	    let tokenBalance = this.amount.sub(collected);

	    expect(await this.rebaseToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.rebaseToken.balanceOf(this.token.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(new BN('0'));

	    if (this.uncollateralFee.toString() !== '0') {
	      await this.token.uncollateralize(this.tokenId, [this.amount.sub(collected)], [this.rebaseToken.address]);
	      collected = collected.add(this.amount.sub(collected).mul(this.uncollateralFee).div(new BN('100000')));
	      tokenBalance = new BN('0');
	    }

	    await this.token.harvest([this.amount], [this.rebaseToken.address], { from: stranger });

	    expect(await this.rebaseToken.balanceOf(stranger)).to.be.bignumber.eq(collected);
	    expect(await this.rebaseToken.balanceOf(this.token.address)).to.be.bignumber.eq(tokenBalance);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(this.amount);

	    await expectRevert.unspecified(this.token.communityPool(new BN('0')));
	  });

	  it('of ether', async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [ZERO_ADDRESS], { gasPrice: 63632263, value: this.amount });
	    let collected = this.amount.mul(this.collateralFee).div(new BN('100000'));
	    let tokenBalance = this.amount.sub(collected);
	    let etherBalanceStranger = await balance.current(stranger);

	    expect(await balance.current(stranger)).to.be.bignumber.eq(etherBalanceStranger);
	    expect(await balance.current(this.token.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(this.amount);
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(new BN('0'));

	    if (this.uncollateralFee.toString() !== '0') {
	      await this.token.uncollateralize(this.tokenId, [this.amount.sub(collected)], [ZERO_ADDRESS], { gasPrice: 63632263 });
	      collected = collected.add(this.amount.sub(collected).mul(this.uncollateralFee).div(new BN('100000')));
	      tokenBalance = new BN('0');
	      etherBalanceStranger = await balance.current(stranger);
	    }

	    const tx = await this.token.harvest([this.amount], [ZERO_ADDRESS], { from: stranger, gasPrice: 63632263 });
	    let gasUsed = new BN(tx.receipt.gasUsed);
	    gasUsed = gasUsed.mul(new BN('63632263'));

	    expect(await balance.current(stranger)).to.be.bignumber.eq(collected.add(etherBalanceStranger).sub(gasUsed));
	    expect(await balance.current(this.token.address)).to.be.bignumber.eq(tokenBalance);
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(this.amount);

	    await expectRevert.unspecified(this.token.communityPool(new BN('0')));
	  });

	  it('of multiple tokens', async function () {
	    await this.rebaseToken.transfer(this.staking.address, this.amount);
	    await this.baseToken.burn(this.amount);
	    await this.daiToken.burn(holder, this.amount);
	    await this.usdtToken.burn(this.amount);

	    await this.staking.fund(new BN('100000000'));
	    await this.baseToken.mint(holder, new BN('100000000000000000'));
	    await this.daiToken.mint(holder, new BN('100000000000000000'));
	    await this.usdtToken.mint(holder, new BN('100000'));

	    await this.baseToken.approve(this.token.address, new BN('100000000000000000'));
	    await this.daiToken.approve(this.token.address, new BN('100000000000000000'));
	    await this.usdtToken.approve(this.token.address, new BN('100000'));
	    await this.rebaseToken.approve(this.token.address, new BN('100000000'));

	    const amounts = [
	      new BN('100000000000000000'),
	      new BN('100000000000000000'),
	      new BN('100000'),
	      new BN('100000000'),
	      new BN('100000000000000000'),
	    ];
	    const tokens = [
	      this.baseToken,
	      this.daiToken,
	      this.usdtToken,
	      this.rebaseToken,
	      ZERO_ADDRESS
	    ];

		const partHarvest = this.amount.div(new BN('5'));
	    const tokenAddresses = tokens.map((el) => el === ZERO_ADDRESS ? ZERO_ADDRESS : el.address);
	    let commissions = amounts.map((el) => el.mul(this.collateralFee).div(new BN('100000')))
	    let backAmounts = amounts.map((el) => el.sub(el.mul(this.collateralFee).div(new BN('100000'))));
	    let etherBalanceStranger = await balance.current(stranger);
	    
		let tx = await this.token.collateralize(this.tokenId, amounts, tokenAddresses, { value: new BN('100000000000000000'), gasPrice: 63632263 });
	    let gasUsed = new BN(tx.receipt.gasUsed);
	    gasUsed = gasUsed.mul(new BN('63632263'));

	    if (this.uncollateralFee.toString() !== '0') {
	      await this.token.uncollateralize(this.tokenId, backAmounts, tokenAddresses);
	      etherBalanceStranger = await balance.current(stranger);
		  for (let i = 0; i < commissions.length; i++) {
		    const amount = backAmounts[i];
			commissions[i] = commissions[i].add(amount.mul(this.uncollateralFee).div(new BN('100000')));
		  }
	    }

	    for (let i = 0; i < tokens.length; i++) {
	      expect(await this.token.getAmount(partHarvest, tokenAddresses[i])).to.be.bignumber.eq(commissions[i]);
	    }

	    tx = await this.token.harvest(Array(5).fill(partHarvest), tokenAddresses, { from: stranger, gasPrice: 63632263 });
	    gasUsed = new BN(tx.receipt.gasUsed);
	    gasUsed = gasUsed.mul(new BN('63632263'));

	    for (let i = 0; i < tokens.length; i++) {
	      if (tokenAddresses[i] === ZERO_ADDRESS) {
	        expect(await balance.current(stranger)).to.be.bignumber.eq(commissions[i].add(etherBalanceStranger).sub(gasUsed));
	      } else {
	    	expect(await tokens[i].balanceOf(stranger)).to.be.bignumber.eq(commissions[i]);
	      }
	    }

	    await expectRevert.unspecified(this.token.communityPool(new BN('0')));
	    expect(await this.harvestToken.balanceOf(stranger)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.harvestToken.balanceOf(this.blackHole.address)).to.be.bignumber.eq(this.amount);
	  });

	  it('emits Harvested event', async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address]);
	    if (this.uncollateralFee.toString() !== '0') {
	       const value = this.amount.sub(this.amount.mul(this.collateralFee).div(new BN('100000'))); 
	       await this.token.uncollateralize(this.tokenId, [value], [this.baseToken.address]);
	    }
	    const scaled = await this.token.getAmount(this.amount, this.baseToken.address, { from: stranger });

	    expectEvent(
	      await this.token.harvest([this.amount], [this.baseToken.address], { from: stranger }),
	      'Harvested',
	      { tokenAddress: this.baseToken.address, amount: this.amount, scaledAmount: scaled }
	    );
	  });

	  it('only for community token owners', async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address]);
	    await expectRevert.unspecified(this.token.harvest([this.amount.add(new BN('1'))], [this.baseToken.address]))
	  });

	  it('revert if amount exceeds actual balance', async function () {
	    await this.token.collateralize(this.tokenId, [this.amount], [this.baseToken.address]);
	    await this.token.collateralize(this.tokenId, [this.amount], [this.daiToken.address]);
	    await expectRevert.unspecified(this.token.harvest([this.amount], [this.baseToken.address], { from: stranger }))
	  });
	});

    describe('_disperse', function () {
	  beforeEach(async function () {
	    await this.token.mint(holder);
	    this.otherTokenId = new BN('2');
		this.actualAmount = this.amount.div(new BN('2'));
		this.dispersedAmount = this.actualAmount.div(new BN('2'));
	    await this.token.disperse([this.actualAmount, this.actualAmount], [this.baseToken.address, ZERO_ADDRESS], { value: this.actualAmount });
		this.commissionTaken = this.actualAmount.mul(this.collateralFee).div(new BN('100000'));
		this.afterCommission = this.actualAmount.sub(this.commissionTaken);
	  });

	  it('amount stored correctly after tx', async function () {
	    expect(await this.token.disperseBalance(this.baseToken.address)).to.be.bignumber.eq(this.actualAmount);
	    expect(await this.token.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(this.actualAmount);

	    expect(await this.baseToken.balanceOf(this.token.address)).to.be.bignumber.eq(this.actualAmount);
	    expect(await balance.current(this.token.address)).to.be.bignumber.eq(this.actualAmount);
	  });
	  
	  it('amount from dispersed goes to actual collateral', async function () {
	    await this.token.collateralize(this.tokenId, [this.actualAmount, this.actualAmount], [this.baseToken.address, ZERO_ADDRESS], { value: this.actualAmount });

	    expect(await this.token.disperseBalance(this.baseToken.address)).to.be.bignumber.eq(this.actualAmount);
	    expect(await this.token.disperseBalance(ZERO_ADDRESS)).to.be.bignumber.eq(this.actualAmount);

	    expect(await this.token.disperseTaken(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(this.dispersedAmount);
	    expect(await this.token.disperseTaken(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(this.dispersedAmount);
	    expect(await this.token.disperseTaken(this.otherTokenId, this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.token.disperseTaken(this.otherTokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN('0'));

	    expect(await this.baseToken.balanceOf(this.token.address)).to.be.bignumber.eq(this.amount);
	    expect(await balance.current(this.token.address)).to.be.bignumber.eq(this.amount);
	  });

	  it('amount in ERC20 token from dispersed could be uncollateralized', async function () {
	    const part = this.actualAmount.div(new BN('2'));
	    const result = part.sub(part.mul(this.uncollateralFee).div(new BN('100000')));

	    await this.token.uncollateralize(this.tokenId, [part], [this.baseToken.address]);
	    expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(this.actualAmount.add(result));
	    expect(await this.token.disperseTaken(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(part);
	    expect(await this.token.disperseTaken(this.otherTokenId, this.baseToken.address)).to.be.bignumber.eq(new BN('0'));

	    const doubleResult = part.mul(this.uncollateralFee).div(new BN('100000')).mul(new BN('2'));
	    await this.token.uncollateralize(this.otherTokenId, [part], [this.baseToken.address]);
	    expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(this.amount.sub(doubleResult));
	    expect(await this.token.disperseTaken(this.tokenId, this.baseToken.address)).to.be.bignumber.eq(part);
	    expect(await this.token.disperseTaken(this.otherTokenId, this.baseToken.address)).to.be.bignumber.eq(part);
	  });

	  it('amount in ether from dispersed could be uncollateralized', async function () {
	    let prevBalance = await balance.current(holder);
	    const part = this.actualAmount.div(new BN('2'));
	    const result = part.sub(part.mul(this.uncollateralFee).div(new BN('100000')));

	    let tx = await this.token.uncollateralize(this.tokenId, [part], [ZERO_ADDRESS], { gasPrice: 63632263 });
	    let gasUsed = new BN(tx.receipt.gasUsed);
	    gasUsed = gasUsed.mul(new BN('63632263'));

	    expect(await balance.current(holder)).to.be.bignumber.eq(prevBalance.add(result).sub(gasUsed));
	    expect(await this.token.disperseTaken(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(part);
	    expect(await this.token.disperseTaken(this.otherTokenId, ZERO_ADDRESS)).to.be.bignumber.eq(new BN('0'));

	    prevBalance = await balance.current(holder);
	    tx = await this.token.uncollateralize(this.otherTokenId, [part], [ZERO_ADDRESS], { gasPrice: 63632263 });
	    gasUsed = new BN(tx.receipt.gasUsed);
	    gasUsed = gasUsed.mul(new BN('63632263'));

	    expect(await balance.current(holder)).to.be.bignumber.eq(prevBalance.add(result).sub(gasUsed));
	    expect(await this.token.disperseTaken(this.tokenId, ZERO_ADDRESS)).to.be.bignumber.eq(part);
	    expect(await this.token.disperseTaken(this.otherTokenId, ZERO_ADDRESS)).to.be.bignumber.eq(part);
	  });

	  it('uncollateralization amount could not be greater than dispersed', async function () {
	    await expectRevert.unspecified(this.token.uncollateralize(this.tokenId, [this.amount], [this.baseToken.address]));
	  });

	  it('could not take same disperse multiple times', async function () {
	    const disperse = await this.token.disperseBalance(this.baseToken.address);
	    await this.token.uncollateralize(this.tokenId, [disperse.div(new BN('2'))], [this.baseToken.address]);
        await expectRevert.unspecified(this.token.uncollateralize(this.tokenId, [disperse.div(new BN('2'))], [this.baseToken.address]));
	  });

	  it('do not overlapping during increasing of total supply', async function () {
	    const thirdTokenId = new BN('3');
	    const fourthTokenId = new BN('4');
	   
	    const disperse = await this.token.disperseBalance(this.baseToken.address);
	    const quarterDisperse = disperse.div(new BN('4'));
	    const balance = await this.baseToken.balanceOf(holder);
	    const balanceAfterHalf = disperse.div(new BN('2')).sub(disperse.div(new BN('2')).mul(this.uncollateralFee).div(new BN('100000')));
	    const balanceAfterQuarter = quarterDisperse.add(quarterDisperse.mul(this.uncollateralFee).div(new BN('100000')));

	    expect(await this.token.disperseTotalTaken(this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
	    await this.token.uncollateralize(this.tokenId, [disperse.div(new BN('2'))], [this.baseToken.address]);
	    expect(await this.token.disperseTotalTaken(this.baseToken.address)).to.be.bignumber.eq(disperse.div(new BN('2')));
        
	    await this.token.mint(holder);
	    await this.token.mint(holder);

        await expectRevert.unspecified(this.token.uncollateralize(this.tokenId, [disperse.div(new BN('2'))], [this.baseToken.address]));
	    await this.token.uncollateralize(this.otherTokenId, [quarterDisperse], [this.baseToken.address]);
	    await this.token.uncollateralize(thirdTokenId, [quarterDisperse], [this.baseToken.address]);

	    const takenDisperse = await this.token.disperseTotalTaken(this.baseToken.address);
	    const leftBalance = disperse.sub(takenDisperse);
	    const afterLeftBalance = leftBalance.sub(leftBalance.mul(this.uncollateralFee).div( new BN('100000')));

	    await expectRevert.unspecified(this.token.uncollateralize(fourthTokenId, [quarterDisperse], [this.baseToken.address]));

	    if (leftBalance.toString() !== "0") {
	      await this.token.uncollateralize(thirdTokenId, [leftBalance], [this.baseToken.address]);
	    }
	    
	    expect(await this.token.disperseTotalTaken(this.baseToken.address)).to.be.bignumber.eq(this.actualAmount);
	    const extractBalance = quarterDisperse.mul(new BN('2')).add(disperse.div(new BN('2'))).mul(this.uncollateralFee).div(new BN('100000'));
	    const finalBalance = balance.add(disperse).sub(extractBalance);
	    expect(await this.baseToken.balanceOf(holder)).to.be.bignumber.eq(finalBalance);
	  });
	})

	describe('bad collateral token', function () {
	  beforeEach(async function () {
	    this.badToken = await BadToken.new(new BN('1'));
		await this.badToken.mint(holder, this.amount);
		await this.badToken.approve(this.token.address, this.amount);
	  })

	  it('revert single collateral if token do not contain decimals', async function () {
	  	await expectRevert.unspecified(this.token.collateralize(this.tokenId, [this.amount], [this.badToken.address]));
	  });

	  it('revert multi collateral if token do not contain decimals', async function () {
	  	await expectRevert.unspecified(
		  this.token.collateralize(
			  this.tokenId, 
			  [this.amount, this.amount, this.amount], 
			  [this.baseToken.address, this.daiToken.address, this.badToken.address]
		  ));
	  });

	  it('revert multi collateral with ether if token do not contain decimals', async function () {
	  	await expectRevert.unspecified(
		  this.token.collateralize(
			  this.tokenId, 
			  [this.amount, this.amount, this.amount], 
			  [this.baseToken.address, ZERO_ADDRESS, this.badToken.address],
			  { value: this.amount }
		  ));
	  });

	  it('revert single disperse if token do not contain decimals', async function () {
	  	await expectRevert.unspecified(this.token.disperse([this.amount], [this.badToken.address]));
	  });

	  it('revert multi disperse if token do not contain decimals', async function () {
	  	await expectRevert.unspecified(
		  this.token.disperse(
			  [this.amount, this.amount, this.amount], 
			  [this.baseToken.address, this.daiToken.address, this.badToken.address]
		  ));
	  });

	  it('revert multi disperse with ether if token do not contain decimals', async function () {
	  	await expectRevert.unspecified(
		  this.token.disperse(
			  [this.amount, this.amount, this.amount], 
			  [this.baseToken.address, ZERO_ADDRESS, this.badToken.address],
			  { value: this.amount }
		  ));
	  });
	});
  });
}

function shouldBehaveLikeERC721Discounted (holder) {
  context('like a ERC721Envious with discount', function () {
	beforeEach(async function () {
	  this.tokenId = new BN('1');
	  this.bondId = new BN('1');
	  this.amount = new BN('100000');
	  this.maxPrice = this.amount.mul(new BN('2'));
	  
	  this.ghostToken = await BaseToken.new('Ghost Token', 'GHST');
	  this.quoteToken = await BaseToken.new('Bond Quote Token', 'BQT');
	  this.bondingMock = await BondingMock.new(this.ghostToken.address, this.quoteToken.address, this.bondingTimeOffset);

	  await this.token.mint(holder);
	  await this.quoteToken.mint(holder, this.amount);
	  await this.quoteToken.approve(this.token.address, this.amount);
	});

    describe('buy DeFi 2.0 bond', function () {
	  describe('revert if bonding address is incorrect', function () {
	    it('bonding address is zero', async function () {
	      await expectRevert.unspecified(this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, this.amount, this.maxPrice));
		});
	  });

	  describe('if bonding address is correct', function () {
		beforeEach(async function () {
	      await this.token.setGhostAddresses(this.ghostToken.address, this.bondingMock.address);
		});

	    it('initially no bonds for token', async function () {
	      await expectRevert.unspecified(this.bondingMock.pendingFor(this.token.address, new BN('0')));
		  const indexesFor = await this.bondingMock.indexesFor(this.token.address);
		  expect(indexesFor.length).to.be.eq(0);
	    });

	    it('bought bond is registered correctly', async function () {
	      const index = new BN('0');
		  const payout = this.amount;
	      await this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, this.amount, this.maxPrice);
	      const pendingFor = await this.bondingMock.pendingFor(this.token.address, index);
		  expect(pendingFor[0]).to.be.bignumber.eq(payout);
		  expect(pendingFor[1]).to.be.eq(false);
	    });

	    it('can store multiple bonds', async function () {
		  const length = 5;
		  const amountToSend = this.amount.div(new BN(length.toString()));
		  const payout = amountToSend;
		  for (let i = 1; i < length + 1; i++) {
	        await this.token.getDiscountedCollateral(new BN(i.toString()), this.quoteToken.address, this.tokenId, amountToSend, this.maxPrice);
			const pendingFor = await this.bondingMock.pendingFor(this.token.address, i-1);
		    expect(pendingFor[0]).to.be.bignumber.eq(payout.mul(new BN(i.toString())));
		    expect(pendingFor[1]).to.be.eq(false);
		  }
		  const indexesFor = await this.bondingMock.indexesFor(this.token.address);
		  expect(indexesFor.length).to.be.eq(length);
	    });

		it('bondIndexes stored correctly', async function () {
		  await expectRevert.unspecified(this.token.bondIndexes(this.tokenId, new BN('0')));
          await this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, this.amount, this.maxPrice);
		  expect(await this.token.bondIndexes(this.tokenId, new BN('0'))).to.be.bignumber.eq(new BN('0'));
		});

		it('bondPayouts stored correctly', async function () {
		  expect(await this.token.bondPayouts(this.tokenId)).to.be.bignumber.eq(new BN('0'));
          await this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, this.amount, this.maxPrice);
		  expect(await this.token.bondPayouts(this.tokenId)).to.be.bignumber.eq(this.amount);
		});

	    it('discounted collateral emits event Bond', async function () {
		  const price = this.bondId;
		  const receipt = await this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, this.amount, this.maxPrice);
	      expectEvent.inTransaction(
			receipt.tx,
			this.bondingMock,
			'Bond',
		    { id: this.bondId, amount: this.amount, price: price }
		  );
	    });

	    it('revert if tokenId does not exist', async function () {
	      await expectRevert(
	        this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, new BN('0'), this.amount, this.maxPrice),
	        'ERC721: invalid token ID'
	      );
	    });

	    it('revert if bond does not exist', async function () {
	      await expectRevert(
	        this.token.getDiscountedCollateral(new BN('0'), this.quoteToken.address, this.tokenId, this.amount, this.maxPrice),
	        'Depository: market concluded'
	      );
	    });

	    it('revert if bond not available for current maxPrice', async function () {
	      await expectRevert(
	        this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, this.amount, new BN('0')),
	        'Depository: market concluded'
	      );
	    });

	    it('revert if bond is over', async function () {
	      await expectRevert(
	        this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, new BN('0'), this.maxPrice),
	        'Depository: max size exceeded'
	      );
	    });

	    it('revert if quote token is incorrect', async function () {
	      this.wrongToken = await BaseToken.new('Wrong Quote Token', 'WQT');
	      await this.wrongToken.mint(holder, this.amount);
	      await this.wrongToken.approve(this.token.address, this.amount);
	      await expectRevert.unspecified(this.token.getDiscountedCollateral(this.bondId, this.wrongToken.address, this.tokenId, this.amount, this.maxPrice));
	    });
	  });
	});

    describe('claim DeFi 2.0 bond', function () {
	  beforeEach(async function () {
	    await this.token.setGhostAddresses(this.ghostToken.address, this.bondingMock.address);
	    await this.ghostToken.mint(this.bondingMock.address, this.amount.mul(new BN('10')));
	    await this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, this.amount, this.maxPrice);
	    this.claimIndex = new BN('0');
	  });

	  it('could not claim before expiration', async function () {
	    let pendingFor = await this.bondingMock.pendingFor(this.token.address, this.claimIndex);
	    expect(await this.token.collateralBalances(this.tokenId, this.ghostToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(pendingFor[0]).to.be.bignumber.eq(this.amount);
	    expect(pendingFor[1]).to.be.eq(false);

	    await this.token.claimDiscountedCollateral(this.tokenId, [this.claimIndex]);

	    pendingFor = await this.bondingMock.pendingFor(this.token.address, this.claimIndex);
	    expect(await this.token.collateralBalances(this.tokenId, this.ghostToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(pendingFor[0]).to.be.bignumber.eq(this.amount);
	    expect(pendingFor[1]).to.be.eq(false);
	  });

	  it('claimed correctly', async function () {
	    await time.increase(this.bondingTimeOffset + 1);
	    const collateral = await this.token.collateralBalances(this.tokenId, this.ghostToken.address);
	    const takeAmount = this.amount.sub(this.amount.mul(this.collateralFee).div(new BN('100000')));
	    await this.token.claimDiscountedCollateral(this.tokenId, [this.claimIndex]);
	    expect(await this.token.collateralBalances(this.tokenId, this.ghostToken.address)).to.be.bignumber.eq(collateral.add(takeAmount));
	  });

	  it('clear bondIndexes after claiming', async function () {
	    await time.increase(this.bondingTimeOffset + 1);
	    expect(await this.token.bondIndexes(this.tokenId, new BN('0'))).to.be.bignumber.eq(this.claimIndex);
	    await this.token.claimDiscountedCollateral(this.tokenId, [this.claimIndex]);
	    await expectRevert.unspecified(this.token.bondIndexes(this.tokenId, new BN('0')));
	  });

	  it('clear bondPayouts after claiming', async function () {
	    await time.increase(this.bondingTimeOffset + 1);
	    expect(await this.token.bondPayouts(this.tokenId)).to.be.bignumber.eq(this.amount);
	    await this.token.claimDiscountedCollateral(this.tokenId, [this.claimIndex]);
	    expect(await this.token.bondPayouts(this.tokenId)).to.be.bignumber.eq(new BN('0'));
	  });

	  it('emits Collateralized event', async function () {
	    await time.increase(this.bondingTimeOffset + 1);
	    expectEvent(
	      await this.token.claimDiscountedCollateral(this.tokenId, [this.claimIndex]),
	  	'Collateralized',
	  	{ tokenId: this.tokenId, amount: this.amount, tokenAddress: this.ghostToken.address }
	    );
	  });

	  it('added claim token if not exists', async function () {
	    await time.increase(this.bondingTimeOffset + 1);
	    await expectRevert.unspecified(this.token.collateralTokens(this.tokenId, new BN('0')));
	    await this.token.claimDiscountedCollateral(this.tokenId, [this.claimIndex]);
	    expect(await this.token.collateralTokens(this.tokenId, new BN('0'))).to.be.eq(this.ghostToken.address);
	  });

	  it('array of indexes could be claimed', async function () {
	    const otherIndex = new BN('1');
	    await this.quoteToken.mint(holder, this.amount);
	    await this.quoteToken.approve(this.token.address, this.amount);
	    await this.token.getDiscountedCollateral(this.bondId, this.quoteToken.address, this.tokenId, this.amount, this.maxPrice);
	    await time.increase(this.bondingTimeOffset + 1);
	    
	    expect(await this.token.collateralBalances(this.tokenId, this.ghostToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.token.bondPayouts(this.tokenId)).to.be.bignumber.eq(this.amount.mul(new BN('2')));
	    expect(await this.token.bondIndexes(this.tokenId, new BN('0'))).to.be.bignumber.eq(this.claimIndex);
	    expect(await this.token.bondIndexes(this.tokenId, new BN('1'))).to.be.bignumber.eq(otherIndex);

	    const collateral = await this.token.collateralBalances(this.tokenId, this.ghostToken.address);
	    const afterCommission = this.amount.sub(this.amount.mul(this.collateralFee).div(new BN('100000'))).mul(new BN('2'));
	    await this.token.claimDiscountedCollateral(this.tokenId, [this.claimIndex, otherIndex]);

	    expect(await this.token.collateralBalances(this.tokenId, this.ghostToken.address)).to.be.bignumber.eq(collateral.add(afterCommission));
	    expect(await this.token.bondPayouts(this.tokenId)).to.be.bignumber.eq(new BN('0'));
	    await expectRevert.unspecified(this.token.bondIndexes(this.tokenId, new BN('0')));
	  });

	  it('revert if bond does not exists', async function () {
	    await time.increase(this.bondingTimeOffset + 1);
	    await expectRevert.unspecified(this.token.claimDiscountedCollateral(this.tokenId, [new BN('100')]));
	  });
	});
  });
}

function shouldBehaveLikeERC721Dynamic (holder, edgeValues, edgeOffsets, edgeRanges, uri) {
  context('like a ERC721Dynamic', function () {
    describe('post deployment checks', function () {
      it('measerement token is correct', async function () {
        expect(await this.token.measurmentTokenAddress()).to.be.eq(this.measureToken.address);
      });

      it('initial edges are correct', async function () {
        const firstEdge  = await this.token.edges(new BN('0'));
        const secondEdge = await this.token.edges(new BN('1'));
        const thirdEdge  = await this.token.edges(new BN('2'));
        const fourthEdge = await this.token.edges(new BN('3'));
        expect(firstEdge[0]).to.be.bignumber.eq(edgeValues[0]);
        expect(firstEdge[1]).to.be.bignumber.eq(edgeOffsets[0]);
        expect(firstEdge[2]).to.be.bignumber.eq(edgeRanges[0]);
        expect(secondEdge[0]).to.be.bignumber.eq(edgeValues[1]);
        expect(secondEdge[1]).to.be.bignumber.eq(edgeOffsets[1]);
        expect(secondEdge[2]).to.be.bignumber.eq(edgeRanges[1]);
        expect(thirdEdge[0]).to.be.bignumber.eq(edgeValues[2]);
        expect(thirdEdge[1]).to.be.bignumber.eq(edgeOffsets[2]);
        expect(thirdEdge[2]).to.be.bignumber.eq(edgeRanges[2]);
        expect(fourthEdge[0]).to.be.bignumber.eq(edgeValues[3]);
        expect(fourthEdge[1]).to.be.bignumber.eq(edgeOffsets[3]);
        expect(fourthEdge[2]).to.be.bignumber.eq(edgeRanges[3]);
      });

      it('base URI is correct', async function () {
        expect(await this.token.baseURI()).to.be.eq(uri);
      });

      it('initial total supply correct', async function () {
        expect(await this.token.totalSupply()).to.be.bignumber.eq(new BN('0'));
      });

      it('total supply changes after minting', async function () {
        await this.token.mint(holder);
        expect(await this.token.totalSupply()).to.be.bignumber.eq(new BN('1'));
      });
    });

	describe('getTokenPointer', function () {
      beforeEach(async function () {
        await this.token.mint(holder);
        this.tokenId = new BN('1');
      });

	  it('default value greater or equal than first offset', async function () {
	    const edge = await this.token.edges(new BN('0'));
		expect(await this.token.getTokenPointer(this.tokenId)).to.be.bignumber.gte(edge[1]);
	  });

	  it('default value less than first range', async function () {
	    const edge = await this.token.edges(new BN('0'));
		expect(await this.token.getTokenPointer(this.tokenId)).to.be.bignumber.lt(edge[2]);
	  });
	});

	describe('setting ghost related addresses', function () {
      beforeEach(async function () {
        this.rebaseToken = await RebaseToken.new();
        this.staking = await StakingMock.new(new BN('0'), this.rebaseToken.address);
      });

      it('token address must be non-zero', async function () {
        await expectRevert(
          this.token.setGhostAddresses(ZERO_ADDRESS, this.staking.address),
          'zero address found'
        );
      });

      it('staking address must be non-zero', async function () {
        await expectRevert(
          this.token.setGhostAddresses(this.rebaseToken.address, ZERO_ADDRESS),
          'zero address found'
        );
      });

      it('ghost related addresses could be set', async function () {
        await this.token.setGhostAddresses(this.rebaseToken.address, this.staking.address);
      });
    });

	describe('dynamic uri', function () {
      beforeEach(async function () {
        this.baseToken = await BaseToken.new('Base Token', 'BST');

        await this.baseToken.mint(holder, new BN('15000'));
        await this.baseToken.approve(this.token.address, new BN('15000'));

        await this.measureToken.mint(holder, new BN('15000'));
        await this.measureToken.approve(this.token.address, new BN('15000'));

        this.amount = new BN('100');
        await this.token.mint(holder);
      });

      it('tokenURI stays the same without collateral change', async function () {
        const tokenUri = await this.token.tokenURI(new BN('1'));
        expect(await this.token.tokenURI(new BN('1'))).to.be.eq(`${tokenUri}`);
        expect(await this.token.tokenURI(new BN('1'))).to.be.eq(`${tokenUri}`);
        expect(await this.token.tokenURI(new BN('1'))).to.be.eq(`${tokenUri}`);
      });

      it('on adding collateral in measure token URI changes', async function () {
        const tokenUri = await this.token.tokenURI(new BN('1'));
        await this.token.collateralize(new BN('1'), [this.amount], [this.measureToken.address]);
        const newTokenUri = await this.token.tokenURI(new BN('1'));
        expect(newTokenUri).to.be.not.eq(tokenUri);
      });

      it('on removing collateral in measure token URI changes', async function () {
        const tokenUri = await this.token.tokenURI(new BN('1'));
        await this.token.collateralize(new BN('1'), [this.amount], [this.measureToken.address]);
        const afterTokenUri = await this.token.tokenURI(new BN('1'));
        await this.token.uncollateralize(new BN('1'), [this.amount], [this.measureToken.address]);
        expect(await this.token.tokenURI(new BN('1'))).to.be.not.eq(afterTokenUri);
        expect(tokenUri).to.be.not.eq(afterTokenUri);
      });

      it('on dispersing collateral in measure token URI changes', async function () {
        const tokenUri = await this.token.tokenURI(new BN('1'));
        await this.token.disperse([this.amount], [this.measureToken.address]);
        const newTokenUri = await this.token.tokenURI(new BN('1'));
        expect(newTokenUri).to.be.not.eq(tokenUri);
      });

      it('on adding collateral not in measure token URI stays the same', async function () {
        const tokenUri = await this.token.tokenURI(new BN('1'));
        await this.token.collateralize(new BN('1'), [this.amount], [this.baseToken.address]);
        expect(await this.token.tokenURI(new BN('1'))).to.be.eq(tokenUri);
      });

      it('on removing collateral not in measure token URI stays the same', async function () {
        const tokenURI = await this.token.tokenURI(new BN('1'));
        await this.token.collateralize(new BN('1'), [this.amount], [this.baseToken.address]);
        expect(await this.token.tokenURI(new BN('1'))).to.be.eq(tokenURI);
        await this.token.uncollateralize(new BN('1'), [this.amount], [this.baseToken.address]);
        expect(await this.token.tokenURI(new BN('1'))).to.be.eq(tokenURI);
      });

      it('on dispersing collateral not in measure token URI stays the same', async function () {
        const tokenUri = await this.token.tokenURI(new BN('1'));
        await this.token.disperse([this.amount], [this.baseToken.address]);
        expect(await this.token.tokenURI(new BN('1'))).to.be.eq(tokenUri);
      });

      describe('different range for tokenURI after crossing the edge', function () {
        it('before first edge', async function () {
          await this.token.collateralize(new BN('1'), [new BN('500')], [this.measureToken.address]);
          let myUri = await this.token.tokenURI(new BN('1'));
          myUri = myUri.replace(uri, '');
          myUri = myUri.replace('.json', '');
          expect(parseInt(myUri)).to.be.gte(1);
          expect(parseInt(myUri)).to.be.lte(1000);
        });

        it('before second edge and after first edge', async function () {
          await this.token.collateralize(new BN('1'), [new BN('1500')], [this.measureToken.address]);
          let myUri = await this.token.tokenURI(new BN('1'));
          myUri = myUri.replace(uri, '');
          myUri = myUri.replace('.json', '');
          expect(parseInt(myUri)).to.be.gte(1);
          expect(parseInt(myUri)).to.be.lte(1000);
        });

        it('before third edge and after second edge', async function () {
          await this.token.collateralize(new BN('1'), [new BN('2500')], [this.measureToken.address]);
          let myUri = await this.token.tokenURI(new BN('1'));
          myUri = myUri.replace(uri, '');
          myUri = myUri.replace('.json', '');
          expect(parseInt(myUri)).to.be.gte(1001);
          expect(parseInt(myUri)).to.be.lte(1500);
        });

        it('before fourth edge and after third edge', async function () {
          await this.token.collateralize(new BN('1'), [new BN('3500')], [this.measureToken.address]);
          let myUri = await this.token.tokenURI(new BN('1'));
          myUri = myUri.replace(uri, '');
          myUri = myUri.replace('.json', '');
          expect(parseInt(myUri)).to.be.gte(1501);
          expect(parseInt(myUri)).to.be.lte(1900);
        });

        it('after fourth edge', async function () {
          await this.token.collateralize(new BN('1'), [new BN('4500')], [this.measureToken.address]);
          let myUri = await this.token.tokenURI(new BN('1'));
          myUri = myUri.replace(uri, '');
          myUri = myUri.replace('.json', '');
          expect(parseInt(myUri)).to.be.gte(1901);
          expect(parseInt(myUri)).to.be.lte(2001);
        });
      });
    });
  });
};

function shouldBehaveLikeERC721Vrf (holder, stranger) {
  context('like a VRF v2', function () {
	describe('VRF initialization', function () {
	  beforeEach(async function () {
	    await this.token.initializeVRF(new BN('1'), ZERO_BYTES32, new BN('1'), new BN('1'), new BN('1'));
	  });

	  it('coordinator address is correct', async function () {
	    expect(await this.token.vrfCoordinatorAddress()).to.be.eq(this.vrfCoordinator.address);
	  });

	  it('subscription id is correct', async function () {
	    expect(await this.token.sSubscriptionId()).to.be.bignumber.eq(new BN('1'));
	  });

	  it('key hash is correct', async function () {
	    expect(await this.token.sKeyHash()).to.be.eq(ZERO_BYTES32);
	  });

	  it('callback gas limit is correct', async function () {
	    expect(await this.token.callbackGasLimit()).to.be.bignumber.eq(new BN('1'));
	  });

	  it('number of words is correct', async function () {
	    expect(await this.token.callbackGasLimit()).to.be.bignumber.eq(new BN('1'));
	  });

	  it('request confirmations is correct', async function () {
	    expect(await this.token.callbackGasLimit()).to.be.bignumber.eq(new BN('1'));
	  });
	});

	describe('prepare randomness', function() {
      beforeEach(async function () {
	    await this.vrfCoordinator.createSubscription();
		await this.vrfCoordinator.addConsumer(new BN('1'), this.token.address);
		await this.token.initializeVRF(new BN('1'), ZERO_BYTES32, new BN('1'), new BN('100000'), new BN('1'));
	  });

	  it('revert on 0 number of words', async function () {
	    await this.token.initializeVRF(new BN('1'), ZERO_BYTES32, new BN('0'), new BN('1'), new BN('1'));
	    await expectRevert(this.token.prepareRandomness(), "vrf not initialized");
	  });

	  it('revert on repeating request of randomness', async function () {
	    await this.token.mint(holder);
		await this.vrfCoordinator.fundSubscription(new BN('1'), new BN('100000000000000000000'));
		await this.token.prepareRandomness();
		await this.vrfCoordinator.fulfillRandomWords(new BN('1'), this.token.address);
		await expectRevert(this.token.prepareRandomness(), "vrf already used");
	  });
	});
	
	it('initializeVRF emits event', async function () {
	  const one = new BN('1');
	  expectEvent(
	    await this.token.initializeVRF(one, ZERO_BYTES32, one, one, one),
		'VrfChanged',
		{ newSSubscriptionId: one, newSKeyHash: ZERO_BYTES32, newNumWords: one, newCallbackGasLimit: one, newRequestConfirmations: one }
	  );
	});

	describe('collateral random tokens', function () {
	  beforeEach(async function () {
	    await this.vrfCoordinator.createSubscription();
		await this.vrfCoordinator.addConsumer(new BN('1'), this.token.address);
		await this.token.initializeVRF(new BN('1'), ZERO_BYTES32, new BN('1'), new BN('100000'), new BN('1'));
		await this.vrfCoordinator.fundSubscription(new BN('1'), new BN('100000000000000000000'));
	    await this.token.mint(holder);
		await this.token.prepareRandomness();
		await this.vrfCoordinator.fulfillRandomWords(new BN('1'), this.token.address);

	    this.baseToken = await BaseToken.new('Base Token', 'BST');
	    this.wrongToken = await BadToken.new(new BN('1'));
	    this.amount = new BN('100000');

	    await this.baseToken.mint(holder, this.amount);
	    await this.baseToken.approve(this.token.address, this.amount);
	    await this.wrongToken.mint(holder, this.amount);
	    await this.wrongToken.approve(this.token.address, this.amount);
	  });

	  it('revert if length of arrays not match', async function () {
	    await expectRevert(
	      this.token.collateralRandomTokens([this.amount, this.amount], [this.baseToken.address]),
	      'lengths not match'
	    );
	  });

	  it('revert if denominator is zero', async function () {
	    await this.token.collateralRandomTokens([this.amount], [this.baseToken.address]),
	    await expectRevert(
	      this.token.collateralRandomTokens([this.amount], [this.baseToken.address]),
	      'vrf not prepared'
	    );
	  });

	  it('revert on wrong token collateralization', async function () {
	    await expectRevert.unspecified(this.token.collateralRandomTokens([this.amount], [this.wrongToken.address]));
	  });

	  it('could collateral random tokens', async function () {
	    expect(await this.token.extraDisperseAmount(this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
	    expect(await this.token.extraDisperseTokenId(this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
	    await this.token.collateralRandomTokens([this.amount], [this.baseToken.address]);
	    expect(await this.token.extraDisperseAmount(this.baseToken.address)).to.be.bignumber.eq(this.amount);
	    expect(await this.token.extraDisperseTokenId(this.baseToken.address)).to.be.bignumber.eq(new BN('1'));
	  });

	  it('could collateral with ether random tokens and return ether surplus', async function () {
	    const prevBalance = await balance.current(holder);
	    const tx = await this.token.collateralRandomTokens([this.amount], [ZERO_ADDRESS], { value: this.amount, gasPrice: 63632263 });
	    let gasUsed = new BN(tx.receipt.gasUsed);
	    gasUsed = gasUsed.mul(new BN('63632263'));
	    expect(await balance.current(holder)).to.be.bignumber.eq(prevBalance.sub(this.amount).sub(gasUsed));
	  });
	})

	describe('collateral random amounts', function () {
	  beforeEach(async function () {
	    await this.vrfCoordinator.createSubscription();
		await this.vrfCoordinator.addConsumer(new BN('1'), this.token.address);
		await this.token.initializeVRF(new BN('1'), ZERO_BYTES32, new BN('1'), new BN('100000'), new BN('1'));
		await this.vrfCoordinator.fundSubscription(new BN('1'), new BN('100000000000000000000'));
	    await this.token.mint(holder);
		await this.token.prepareRandomness();
		await this.vrfCoordinator.fulfillRandomWords(new BN('1'), this.token.address);

	    this.baseToken = await BaseToken.new('Base Token', 'BST');
	    this.wrongToken = await BadToken.new(new BN('1'));
	    this.amount = new BN('100000');

	    await this.baseToken.mint(holder, this.amount);
	    await this.baseToken.approve(this.token.address, this.amount);
	    await this.wrongToken.mint(holder, this.amount);
	    await this.wrongToken.approve(this.token.address, this.amount);
	  });

	  it('revert if vrf not prepared', async function () {
	    await this.token.collateralRandomTokens([this.amount], [this.baseToken.address]);
	    await expectRevert(
	      this.token.collateralRandomAmounts([new BN('1')], this.amount, this.baseToken.address),
	      'vrf not prepared'
	    );
	  });

	  it('revert if ether value not match with amount', async function () {
	    await expectRevert.unspecified(this.token.collateralRandomAmounts([new BN('1')], this.amount, ZERO_ADDRESS));
	  });

	  it('revert if bad token', async function () {
	    await expectRevert.unspecified(this.token.collateralRandomAmounts([new BN('1')], this.amount, this.wrongToken.address));
	  });

	  it('amounts changed', async function () {
	    expect(await this.token.randomAmountsDisperse(this.baseToken.address, new BN('1'))).to.be.bignumber.eq(new BN('0'));
	    await this.token.collateralRandomAmounts([new BN('1')], this.amount, this.baseToken.address),
	    expect(await this.token.randomAmountsDisperse(this.baseToken.address, new BN('1'))).to.be.bignumber.gt(new BN('0'));
	    expect(await this.token.randomAmountsDisperse(this.baseToken.address, new BN('1'))).to.be.bignumber.lte(this.amount);
	  });
	});

	describe('_disperse', function () {
	  beforeEach(async function () {
	    await this.vrfCoordinator.createSubscription();
		await this.vrfCoordinator.addConsumer(new BN('1'), this.token.address);
		await this.token.initializeVRF(new BN('1'), ZERO_BYTES32, new BN('1'), new BN('100000'), new BN('1'));
		await this.vrfCoordinator.fundSubscription(new BN('1'), new BN('100000000000000000000'));
	    await this.token.mint(holder);
		await this.token.prepareRandomness();
		await this.vrfCoordinator.fulfillRandomWords(new BN('1'), this.token.address);

	    this.baseToken = await BaseToken.new('Base Token', 'BST');
	    this.amount = new BN('100000');

	    await this.baseToken.mint(holder, this.amount);
	    await this.baseToken.approve(this.token.address, this.amount);
	  });
		
	  it('after random ids', async function () {
		await this.token.collateralRandomTokens([this.amount], [this.baseToken.address]);

		expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
		expect(await this.token.extraDisperseTaken(this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
		await expectRevert.unspecified(this.token.collateralTokens(new BN('1'), new BN('0')));

		await this.token.uncollateralize(new BN('1'), [new BN('1')], [this.baseToken.address])

		expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(this.amount.sub(new BN('1')));
		expect(await this.token.collateralTokens(new BN('1'), new BN('0'))).to.be.eq(this.baseToken.address);
		expect(await this.token.extraDisperseTaken(this.baseToken.address)).to.be.bignumber.eq(this.amount);
	  })

	  it('after random amounts', async function () {
		await this.token.collateralRandomAmounts([new BN('1')], this.amount, this.baseToken.address);

		expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
		await expectRevert.unspecified(this.token.collateralTokens(new BN('1'), new BN('0')));
		expect(await this.token.disperseTotalTaken(this.baseToken.address)).to.be.bignumber.eq(new BN('0'));

		await this.token.uncollateralize(new BN('1'), [new BN('1')], [this.baseToken.address])

		expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.lte(this.amount.sub(new BN('1')));
		expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.gt(new BN('0'));
		expect(await this.token.collateralTokens(new BN('1'), new BN('0'))).to.be.eq(this.baseToken.address);
		expect(await this.token.disperseTotalTaken(this.baseToken.address)).to.be.bignumber.lte(this.amount);
		expect(await this.token.disperseTotalTaken(this.baseToken.address)).to.be.bignumber.gt(new BN('0'));
	  })
	})
  });
}

module.exports = {
	shouldBehaveLikeERC721Envious, 
	shouldBehaveLikeERC721Discounted, 
	shouldBehaveLikeERC721Dynamic,
	shouldBehaveLikeERC721Vrf
};
