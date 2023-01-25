const { 
	shouldBehaveLikeERC721, 
	shouldBehaveLikeERC721Metadata,
	shouldBehaveLikeERC721Enumerable
} = require('./ERC721/ERC721.behavior');

const {
	shouldBehaveLikeERC721Envious, 
	shouldBehaveLikeERC721Discounted, 
	shouldBehaveLikeERC721Dynamic 
} = require('./ERC721/ERC721Envious.behavior');

const { shouldSupportInterfaces } = require('./utils/introspection/SupportsInterface.behavior');

const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const ERC721EnviousMock = artifacts.require('ERC721EnviousDynamicPreset');
const BaseToken = artifacts.require('BaseToken');
const BlackHole = artifacts.require('BlackHole');

contract('ERC721EnviousDynamicPreset', function (accounts) {
	const [ holder ] = accounts;;

	const name = 'Non Fungible Token';
	const symbol = 'NFT';
	const uri = 'ipfs://QmRE5goojZnQj5rmXr2jsFPuuvazSGwCNofknByK5Hswwz/';

	const edgeValues  = [new BN('0'), new BN('2000'), new BN('3000'), new BN('4000')];
	const edgeOffsets = [new BN('1'), new BN('1001'), new BN('1501'), new BN('1901')];
	const edgeRanges  = [new BN('1000'), new BN('500'), new BN('400'), new BN('100')];
	
	beforeEach(async function () {
		this.measureToken = await BaseToken.new('Measure Token', 'MST');
		this.blackHole = { address: ZERO_ADDRESS };
		this.harvestToken = { address: ZERO_ADDRESS }

		this.token = await ERC721EnviousMock.new(
			name, 
			symbol, 
			uri, 
			edgeValues, 
			edgeOffsets, 
			edgeRanges, 
			this.measureToken.address
		);

		this.collateralFee = new BN('0');
		this.uncollateralFee = new BN('0');
		this.bondingTimeOffset = 100; // in seconds
	});

	shouldBehaveLikeERC721('ERC721', ...accounts);
	shouldBehaveLikeERC721Metadata('ERC721', name, symbol, uri, true, ...accounts);
	shouldBehaveLikeERC721Enumerable('ERC721', ...accounts);
	shouldBehaveLikeERC721Dynamic(holder, edgeValues, edgeOffsets, edgeRanges, uri);
	shouldBehaveLikeERC721Envious(...accounts);
	shouldBehaveLikeERC721Discounted(...accounts);
	shouldSupportInterfaces([
        'ERC721Envious',
        'ERC721EnviousDynamic',
    ]);
});
