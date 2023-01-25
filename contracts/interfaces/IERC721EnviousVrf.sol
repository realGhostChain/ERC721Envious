// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC721Envious.sol";

/// @title Additional extension for IERC721Envious, extra VRF-based functionality.
/// @author 571nkY @ghostchain
/// @dev Ability to randomize collateralization process.
interface IERC721EnviousVrf is IERC721Envious {
	event VrfChanged(
		uint64 newSSubscriptionId,
		bytes32 newSKeyHash,
		uint32 newNumWords,
		uint32 newCallbackGasLimit,
		uint16 newRequestConfirmations
	);

	/// @dev VRF Coordinator address. Immutable and specific to each network.
	/// See https://docs.chain.link/docs/vrf-contracts/#configurations.
	/// @return address VRF coordinator.
	function vrfCoordinatorAddress() external view returns (address);

	/// @dev Your subscription ID.
	/// @return Chainlink synscription id.
	function sSubscriptionId() external view returns (uint64);

	/// @dev The gas lane to use, which specifies the maximum gas price to bump to.
	/// For a list of available gas lanes on each network,
	/// see https://docs.chain.link/docs/vrf-contracts/#configuration.
	/// @return maximum gas price.
	function sKeyHash() external view returns (bytes32);
	
	/// @dev Depends on the number of requested values that you want sent to the
	/// fulfillRandomWords() function. Storing each word costs about 20,000 gas,
	/// so 40,000 is a safe default for this example contract. Test and adjust
	/// this limit based on the network that you select, the size of the request,
	/// and the processing of the callback request in the fulfillRandomWords()
	/// function.
	/// @return gas for fulfillRandomWords() call.
	function callbackGasLimit() external view returns (uint32);
	
	/// @dev Number of words to return. Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
	/// @return number of words.
	function numWords() external view returns (uint32);
	
	/// @dev Needed number of block confirmation. The default is 3.
	/// @return number of block confirmations.
	function requestConfirmations() external view returns (uint16);

    /// @dev Get on-chain randomness from Chainlink VRF v2.
    /// 
    /// @return requestId unique identifier.
	function prepareRandomness() external returns (uint256);

	/// @dev Extra amount to be distributed for randomly chosen tokens.
	/// 
	/// @param tokenAddress address of distributed token.
	/// @return extra amount to be distributed.
	function extraDisperseAmount(address tokenAddress) external view returns (uint256);

	/// @dev Extra disperse that is already taken.
	///
	/// @param tokenAddress address of distributed token.
	/// @return already taken extra disperse.
	function extraDisperseTaken(address tokenAddress) external view returns (uint256);

	/// @dev All `tokenId`s that are divisible by this number without a remainder are
	/// randomly choosen for exra distribution.
	/// 
	/// @param tokenAddress address of token of distributed token.
	/// @return divisor for tokenId.
	function extraDisperseTokenId(address tokenAddress) external view returns (uint256);

	/// @dev Additional randomly generated amount of tokens to be distributed.
	/// 
	/// @param tokenAddress address of distributed token.
	/// @param tokenId unique identifier of token.
	/// @return addiional amount to be distributed.
	function randomAmountsDisperse(address tokenAddress, uint256 tokenId) external view returns(uint256);

    /// @dev Collateralize random token ids with predefined `amounts` of `tokenAddresses`.
    /// 
    /// Requirements:
    /// - length of tokens and length of amounts must match
    /// 
    /// @param amounts of tokens to be send as collateral
    /// @param tokenAddresses address of tokens to be send as collateral
	function collateralRandomTokens(
		uint256[] memory amounts, 
		address[] memory tokenAddresses
	) external payable;

    /// @dev Collateralize specified token ids with random amounts.
    /// 
    /// Requirements:
    /// - amount should match with `msg.value` if ETH is used
    /// 
    /// @param tokenIds array of tokens to be collateralized
    /// @param amount of tokens, total amount that will be split
    /// @param tokenAddress address of token to be used as collateral
	function collateralRandomAmounts(
		uint256[] memory tokenIds,
		uint256 amount,
		address tokenAddress
	) external payable;

    /// @dev Initialize all chainlink related information.
    /// 
    /// @param newSSubscriptionId your subscription id
    /// @param newSKeyHash the gas lane to use, which specifies the maximum gas price to bump to
	/// @param newNumWords number of random values to retrieve
    /// @param newCallbackGasLimit needed gaslimit for fulfillRandomWords()
    /// @param newRequestConfirmations number of confirmations before the result
	function initializeVRF(
        uint64 newSSubscriptionId,
        bytes32 newSKeyHash,
		uint32 newNumWords,
        uint32 newCallbackGasLimit,
        uint16 newRequestConfirmations
	) external;
}
