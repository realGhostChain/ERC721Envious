const { makeInterfaceId } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const INTERFACES = {
  ERC165: [
    'supportsInterface(bytes4)',
  ],
  ERC721: [
    'balanceOf(address)',
    'ownerOf(uint256)',
    'approve(address,uint256)',
    'getApproved(uint256)',
    'setApprovalForAll(address,bool)',
    'isApprovedForAll(address,address)',
    'transferFrom(address,address,uint256)',
    'safeTransferFrom(address,address,uint256)',
    'safeTransferFrom(address,address,uint256,bytes)',
  ],
  ERC721Enumerable: [
    'totalSupply()',
    'tokenOfOwnerByIndex(address,uint256)',
    'tokenByIndex(uint256)',
  ],
  ERC721Metadata: [
    'name()',
    'symbol()',
    'tokenURI(uint256)',
  ],
  ERC1155: [
    'balanceOf(address,uint256)',
    'balanceOfBatch(address[],uint256[])',
    'setApprovalForAll(address,bool)',
    'isApprovedForAll(address,address)',
    'safeTransferFrom(address,address,uint256,uint256,bytes)',
    'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
  ],
  ERC1155Receiver: [
    'onERC1155Received(address,address,uint256,uint256,bytes)',
    'onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)',
  ],
  AccessControl: [
    'hasRole(bytes32,address)',
    'getRoleAdmin(bytes32)',
    'grantRole(bytes32,address)',
    'revokeRole(bytes32,address)',
    'renounceRole(bytes32,address)',
  ],
  AccessControlEnumerable: [
    'getRoleMember(bytes32,uint256)',
    'getRoleMemberCount(bytes32)',
  ],
  Governor: [
    'name()',
    'version()',
    'COUNTING_MODE()',
    'hashProposal(address[],uint256[],bytes[],bytes32)',
    'state(uint256)',
    'proposalSnapshot(uint256)',
    'proposalDeadline(uint256)',
    'votingDelay()',
    'votingPeriod()',
    'quorum(uint256)',
    'getVotes(address,uint256)',
    'hasVoted(uint256,address)',
    'propose(address[],uint256[],bytes[],string)',
    'execute(address[],uint256[],bytes[],bytes32)',
    'castVote(uint256,uint8)',
    'castVoteWithReason(uint256,uint8,string)',
    'castVoteBySig(uint256,uint8,uint8,bytes32,bytes32)',
  ],
  GovernorWithParams: [
    'name()',
    'version()',
    'COUNTING_MODE()',
    'hashProposal(address[],uint256[],bytes[],bytes32)',
    'state(uint256)',
    'proposalSnapshot(uint256)',
    'proposalDeadline(uint256)',
    'votingDelay()',
    'votingPeriod()',
    'quorum(uint256)',
    'getVotes(address,uint256)',
    'getVotesWithParams(address,uint256,bytes)',
    'hasVoted(uint256,address)',
    'propose(address[],uint256[],bytes[],string)',
    'execute(address[],uint256[],bytes[],bytes32)',
    'castVote(uint256,uint8)',
    'castVoteWithReason(uint256,uint8,string)',
    'castVoteWithReasonAndParams(uint256,uint8,string,bytes)',
    'castVoteBySig(uint256,uint8,uint8,bytes32,bytes32)',
    'castVoteWithReasonAndParamsBySig(uint256,uint8,string,bytes,uint8,bytes32,bytes32)',
  ],
  GovernorTimelock: [
    'timelock()',
    'proposalEta(uint256)',
    'queue(address[],uint256[],bytes[],bytes32)',
  ],
  ERC2981: [
    'royaltyInfo(uint256,uint256)',
  ],
  // extra interfaces
  ERC721Envious: [
    'commissions(uint256)',
    'ghostAddress()',
    'ghostBondingAddress()',
    'blackHole()',
    'communityToken()',
    'communityPool(uint256)',
    'communityBalance(address)',
    'disperseTokens(uint256)',
    'disperseBalance(address)',
    'disperseTotalTaken(address)',
    'disperseTaken(uint256,address)',
    'bondPayouts(uint256)',
    'bondIndexes(uint256,uint256)',
    'collateralTokens(uint256,uint256)',
    'collateralBalances(uint256,address)',
    'getAmount(uint256,address)',
    'harvest(uint256[],address[])',
    'collateralize(uint256,uint256[],address[])',
    'uncollateralize(uint256,uint256[],address[])',
    'getDiscountedCollateral(uint256,address,uint256,uint256,uint256)',
    'claimDiscountedCollateral(uint256,uint256[])',
    'disperse(uint256[],address[])',
    'mint(address)'
  ],
  ERC721EnviousRoyalty: [
    'royalties(uint256)',
    'changeRoyalties(uint256,uint256)',
  ],
  ERC721EnviousVrf: [
    'vrfCoordinatorAddress()',
    'sSubscriptionId()',
    'sKeyHash()',
    'callbackGasLimit()',
    'numWords()',
    'requestConfirmations()',
    'prepareRandomness()',
    'extraDisperseAmount(address)',
    'extraDisperseTaken(address)',
    'extraDisperseTokenId(address)',
    'randomAmountsDisperse(address,uint256)',
    'collateralRandomTokens(uint256[],address[])',
    'collateralRandomAmounts(uint256[],uint256,address)',
    'initializeVRF(uint64,bytes32,uint32,uint32,uint16)',
  ],
  ERC721EnviousDynamic: [
    'getTokenPointer(uint256)',
  ],
};

const INTERFACE_IDS = {};
const FN_SIGNATURES = {};
for (const k of Object.getOwnPropertyNames(INTERFACES)) {
  INTERFACE_IDS[k] = makeInterfaceId.ERC165(INTERFACES[k]);
  for (const fnName of INTERFACES[k]) {
    // the interface id of a single function is equivalent to its function signature
    FN_SIGNATURES[fnName] = makeInterfaceId.ERC165([fnName]);
  }
}

function shouldSupportInterfaces (interfaces = []) {
  describe('ERC165', function () {
    beforeEach(function () {
      this.contractUnderTest = this.mock || this.token || this.holder || this.accessControl;
    });

    it('supportsInterface uses less than 30k gas', async function () {
      for (const k of interfaces) {
        const interfaceId = INTERFACE_IDS[k];
        expect(await this.contractUnderTest.supportsInterface.estimateGas(interfaceId)).to.be.lte(30000);
      }
    });

    it('all interfaces are reported as supported', async function () {
      for (const k of interfaces) {
        const interfaceId = INTERFACE_IDS[k];
        expect(await this.contractUnderTest.supportsInterface(interfaceId)).to.equal(true);
      }
    });

    it('all interface functions are in ABI', async function () {
      for (const k of interfaces) {
        for (const fnName of INTERFACES[k]) {
          const fnSig = FN_SIGNATURES[fnName];
          expect(this.contractUnderTest.abi.filter(fn => fn.signature === fnSig).length).to.equal(1);
        }
      }
    });
  });
}

module.exports = {
  shouldSupportInterfaces,
};
