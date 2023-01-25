// SPDX-License-Identifier: AGPL-3.0
  
pragma solidity ^0.8.0;

import "../interfaces/IsSTRL.sol";

contract StakingMock {
	uint256 public value;
	address public tokenAddress;

	constructor (uint256 some, address other) {
		value = some;
		tokenAddress = other;
	}

	function supplyInWarmup() public view returns (uint256) {
		return value;
	}

	function rebase(uint256 profit, uint256 epoch) public returns (uint256) {
		return IsSTRL(tokenAddress).rebase(profit, epoch);
	}

	function fund(uint256 amount) external {
		IERC20(tokenAddress).transfer(msg.sender, amount);
	}
}
