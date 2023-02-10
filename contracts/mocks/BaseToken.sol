// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../openzeppelin/token/ERC20/ERC20.sol";
import "../openzeppelin/utils/Context.sol";

contract BaseToken is Context, ERC20 {
	
	constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
	
	function mint(address account, uint256 amount) public {
		_mint(account, amount);
	}
	
	function burn(uint256 amount) public {
		_burn(_msgSender(), amount);
	}
	
	function burnFrom(address account, uint256 amount) public {
		_spendAllowance(account, _msgSender(), amount);
		_burn(account, amount);
	}
}
