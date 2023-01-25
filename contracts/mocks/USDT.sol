// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../openzeppelin/token/ERC20/ERC20.sol";
import "../openzeppelin/utils/Context.sol";

contract TetherToken is Context, ERC20 {
    constructor() ERC20("Tether USD", "USDT") {}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }

	function decimals() public pure override returns (uint8) {
		return 6;
	}
}
