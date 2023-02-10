// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../token/ERC721/ERC721.sol";

/**
 * @title ERC721Mock
 * This mock just provides a public safeMint, mint, and burn functions for testing purposes
 */
contract ERC721Mock is ERC721 {
	uint256 private _totalSupply;
	
	constructor(string memory name, string memory symbol) ERC721(name, symbol) {}
	
	function baseURI() public view returns (string memory) {
		return _baseURI();
	}

	function totalSupply() external view returns (uint256) {
		return _totalSupply;
	}
	
	function exists(uint256 tokenId) public view returns (bool) {
		return _exists(tokenId);
	}
	
	function mint(address to, uint256 tokenId) public {
		_mint(to, tokenId);
		_totalSupply += 1;
	}
	
	function safeMint(address to, uint256 tokenId) public {
		_safeMint(to, tokenId);
		_totalSupply += 1;
	}
	
	function safeMint(
		address to,
		uint256 tokenId,
		bytes memory _data
	) public {
		_safeMint(to, tokenId, _data);
		_totalSupply += 1;
	}
	
	function burn(uint256 tokenId) public {
		_burn(tokenId);
		_totalSupply -= 1;
	}
}
