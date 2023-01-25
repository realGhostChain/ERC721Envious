const {
	shouldBehaveLikeERC721,
	shouldBehaveLikeERC721Metadata,
	shouldBehaveLikeERC721Enumerable
} = require('./ERC721/ERC721.behavior');

const { 
	shouldBehaveLikeERC721Envious, 
	shouldBehaveLikeERC721Discounted,
} = require('./ERC721/ERC721Envious.behavior');

const { shouldBehaveLikeERC721Ownable } = require('./ERC721/ERC721Ownable.behavior');
const { shouldSupportInterfaces } = require('./utils/introspection/SupportsInterface.behavior');

const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const ERC721EnviousMock = artifacts.require('ERC721EnviousRoyaltyPreset');
const ERC721ReceiverMock = artifacts.require('ERC721ReceiverMock');
const BlackHole = artifacts.require('BlackHole');
const BaseToken = artifacts.require('BaseToken');

contract('ERC721EnviousRoyaltyPreset', function (accounts) {
	const [ holder, other ] = accounts;

	const name = 'Non Fungible Token';
	const symbol = 'NFT';

	const ghst = accounts[0];
	const bonding = accounts[1];
	const token = accounts[2];
	
	const feeForAddress = new BN('1000'); // 1%
	const feeForSmart = new BN('2000');   // 2%
	const incomingFee = new BN('1000');   // 1%
	const outcomingFee = new BN('2000');  // 2%
	const uri = 'ipfs://QmRE5goojZnQj5rmXr2jsFPuuvazSGwCNofknByK5Hswwz/';
	
	beforeEach(async function () {
		this.blackHole = await BlackHole.new('test');
		this.harvestToken = await BaseToken.new('Harvest Token', 'HVT');
		this.token = await ERC721EnviousMock.new(
			name, 
			symbol, 
			uri,
			feeForAddress,
			feeForSmart
		);

		this.collateralFee = incomingFee;
		this.uncollateralFee = outcomingFee;
		this.bondingTimeOffset = 100; // in seconds
		await this.token.changeCommunityAddresses(this.harvestToken.address, this.blackHole.address);
        await this.token.changeCommissions(this.collateralFee, this.uncollateralFee);
	});

	describe('post deployment checks', function () {
		it('royalties are correct', async function () {
			const addressRoyalty = await this.token.royalties(0);
			expect(addressRoyalty).to.be.bignumber.eq(feeForAddress);
			const smartRoyalty = await this.token.royalties(1);
			expect(smartRoyalty).to.be.bignumber.eq(feeForSmart);
		});

		it('total supply is zero', async function () {
			expect(await this.token.totalSupply()).to.be.bignumber.eq(new BN('0'));
		});
	});

	describe('reseting availability', function () {
		it('arbitrary address could not change ghost related addresses', async function () {
			await expectRevert(
				this.token.setGhostAddresses(ghst, bonding, { from: other }), 
				'Ownable: caller is not the owner'
			);
		});
		
		it('arbitrary address could not change commissions', async function () {
			await expectRevert(
				this.token.changeCommissions(new BN('0'), new BN('0'), { from: other }),
				'Ownable: caller is not the owner'
			);
		});
		
		it('arbitrary address could not change royalties', async function () {
			await expectRevert(
				this.token.changeRoyalties(feeForAddress, feeForSmart, { from: other }),
				'Ownable: caller is not the owner'
			);
		});

		it('ghost token address could not be zero address', async function () {
			await expectRevert(
				this.token.setGhostAddresses(ZERO_ADDRESS, bonding), 
				'zero address found'
			);
		});

		it('ghost bonding address could not be zero address', async function () {
			await expectRevert(
				this.token.setGhostAddresses(ghst, ZERO_ADDRESS), 
				'zero address found'
			);
		});
		
		it('ghost related addresses could be changed by owner', async function () {
			await this.token.setGhostAddresses(ghst, bonding);
		});
		
		it('commissions could be changed by owner', async function () {
			await this.token.changeCommissions(new BN('0'), new BN('0'));
		});
		
		it('royalties could be changed by owner', async function () {
			await this.token.changeRoyalties(feeForAddress, feeForSmart);
		});
	});

	describe('minting', function () {
		it('arbitrary address could not mint tokens', async function () {
			await expectRevert(
				this.token.mint(holder, { from: other }),
				'error'
			);
		});

		it('owner can mint new tokens', async function () {
			expect(await this.token.totalSupply()).to.be.bignumber.eq(new BN('0'));
			await this.token.mint(holder);
			expect(await this.token.totalSupply()).to.be.bignumber.eq(new BN('1'));
			expect(await this.token.balanceOf(holder)).to.be.bignumber.eq(new BN('1'));
		});
	});

	describe('royalties', function () {
		beforeEach(async function () {
			this.amount = new BN('10000');
			this.baseToken = await BaseToken.new('Base Token', 'BST');
			this.receiverSmart = await ERC721ReceiverMock.new('0x150b7a02', 0);

			await this.token.changeRoyalties(feeForAddress, feeForSmart);
			await this.baseToken.mint(holder, this.amount);
			await this.baseToken.approve(this.token.address, this.amount);
			await this.token.mint(holder);
			await this.token.collateralize(new BN('1'), [this.amount], [this.baseToken.address]);
		
			this.amountCollateralFee = this.amount.mul(this.collateralFee).div(new BN('100000'))
			this.afterCollateralFee = this.amount.sub(this.amountCollateralFee);
			this.amountUncollateralFee = this.afterCollateralFee.mul(this.uncollateralFee).div(new BN('100000'))
			this.afterUncollateralFee = this.afterCollateralFee.sub(this.amountUncollateralFee);
		});

		it('taken when receiver and sender are addresses', async function () {
			expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(this.afterCollateralFee);

			await this.token.transferFrom(holder, other, new BN('1'));
			const after = this.afterCollateralFee.mul(feeForAddress).div(new BN('100000'));

			expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(this.afterCollateralFee.sub(after));
			expect(await this.token.communityBalance(this.baseToken.address)).to.be.bignumber.eq(this.amountCollateralFee.add(after));
		});
		
		it('taken when receiver or address is smart', async function () {
			expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(this.afterCollateralFee);
			
			await this.token.transferFrom(holder, this.receiverSmart.address, new BN('1'));
			const after = this.afterCollateralFee.mul(feeForSmart).div(new BN('100000'));
			
			expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(this.afterCollateralFee.sub(after));
			expect(await this.token.communityBalance(this.baseToken.address)).to.be.bignumber.eq(this.amountCollateralFee.add(after));
		});
		
		it('not taken when collateral is zero', async function () {
			await this.token.uncollateralize(new BN('1'), [this.afterCollateralFee], [this.baseToken.address]);
			const sumFee = this.amountCollateralFee.add(this.amountUncollateralFee)
			expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
			expect(await this.token.communityBalance(this.baseToken.address)).to.be.bignumber.eq(sumFee);

			await this.token.transferFrom(holder, other, new BN('1'));
			
			expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(new BN('0'));
			expect(await this.token.communityBalance(this.baseToken.address)).to.be.bignumber.eq(sumFee);
		});
		
		it('all underlying currencies are used as collateral', async function () {
			const otherToken = await BaseToken.new('Other Token', 'OTT');
			await otherToken.mint(holder, this.amount);
			await otherToken.approve(this.token.address, this.amount);
			await this.token.collateralize(new BN('1'), [this.amount], [otherToken.address]);

			expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(this.afterCollateralFee);
			expect(await this.token.communityBalance(this.baseToken.address)).to.be.bignumber.eq(this.amountCollateralFee);
			
			expect(await this.token.collateralBalances(new BN('1'), otherToken.address)).to.be.bignumber.eq(this.afterCollateralFee);
			expect(await this.token.communityBalance(otherToken.address)).to.be.bignumber.eq(this.amountCollateralFee);

			await this.token.transferFrom(holder, other, new BN('1'));
			const after = this.afterCollateralFee.mul(feeForAddress).div(new BN('100000'));

			expect(await this.token.collateralBalances(new BN('1'), this.baseToken.address)).to.be.bignumber.eq(this.afterCollateralFee.sub(after));
			expect(await this.token.communityBalance(this.baseToken.address)).to.be.bignumber.eq(this.amountCollateralFee.add(after));

			expect(await this.token.collateralBalances(new BN('1'), otherToken.address)).to.be.bignumber.eq(this.afterCollateralFee.sub(after));
			expect(await this.token.communityBalance(otherToken.address)).to.be.bignumber.eq(this.amountCollateralFee.add(after));
		});
	});

	shouldBehaveLikeERC721('ERC721', ...accounts);
	shouldBehaveLikeERC721Metadata('ERC721', name, symbol, uri, false, ...accounts);
	shouldBehaveLikeERC721Enumerable('ERC721', ...accounts);
	shouldBehaveLikeERC721Ownable(...accounts);
	shouldBehaveLikeERC721Envious(...accounts);
	shouldBehaveLikeERC721Discounted(...accounts);
	shouldBehaveLikeERC721Discounted(...accounts);
	shouldSupportInterfaces([
		'ERC721Envious',
		'ERC721EnviousRoyalty',
	]);
});
