// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC721Envious.sol";

/**
 * @title Additional extension for IERC721Envious, in order to get royalty payments.
 * @author 571nkY @ghostchain
 * @dev Ability to get royalty payments from collateral NFTs.
 */
interface IERC721EnviousRoyalty is IERC721Envious {
	/**
	 * @dev Royalties for user addresses and smart contracts. If sender 
	 * and receiver are user address first element of array will be used,
	 * otherwise second.
	 *
	 * NOTE: 3 decimal buffer, e.g 1,000 = 1%
	 *
	 * @param id unique identifier for royalty payment in array
	 */
	function royalties(uint256 id) external view returns (uint256);

	/**
	 * @dev Set royalty payments.
	 *
	 * @param user percentage of collateral if sender and receiver are user addresses
	 * @param smart percentage of collateral if sender or receiver are smart contract
	 */
	function changeRoyalties(uint256 user, uint256 smart) external;
}
