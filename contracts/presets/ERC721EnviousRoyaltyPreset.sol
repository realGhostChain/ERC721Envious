// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../extension/ERC721Envious.sol";
import "../interfaces/IERC721EnviousRoyalty.sol";
import "../openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";
import "../openzeppelin/token/ERC20/IERC20.sol";
import "../openzeppelin/token/ERC20/utils/SafeERC20.sol";
import "../openzeppelin/access/Ownable.sol";
import "../openzeppelin/utils/Counters.sol";
import "../openzeppelin/utils/Address.sol";
import "../openzeppelin/utils/Strings.sol";

/**
 * @title ERC721 Collateralization Royaly Mock
 * This mock shows an implementation of ERC721Envious with royalty payments that
 * are taken from collateral. Handmade `totalSupply` function will be used in
 * order to be used in {_disperse} function.
 *
 * @author 5Tr3TcH @ghostchain
 */
contract ERC721EnviousRoyaltyPreset is Ownable, IERC721EnviousRoyalty, ERC721Enumerable, ERC721Envious {

	using SafeERC20 for IERC20;
	using Address for address;
	using Strings for uint256;
	using Counters for Counters.Counter;

	string private _baseTokenURI;
	Counters.Counter private _tokenTracker;

	/**
	 * @dev See {IERC721EnviousRoyalty-royalties}
	 */
	uint256[2] public override royalties;

	// solhint-disable-next-line
	string private constant ZERO_ADDRESS = "zero address found";
	
	constructor(
		string memory tokenName,
		string memory tokenSymbol,
		string memory uri,
		uint256 royalyForAddress,
		uint256 roylatyForSmart
	) ERC721(tokenName, tokenSymbol) {
		royalties[0] = royalyForAddress;
		royalties[1] = roylatyForSmart;
		_baseTokenURI = uri;
	}

	receive() external payable {
		_disperseTokenCollateral(msg.value, address(0));
	}

	/**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC721Enumerable, ERC721Envious)
        returns (bool)
    {
        return interfaceId == type(IERC721EnviousRoyalty).interfaceId ||
			ERC721Enumerable.supportsInterface(interfaceId) ||
			ERC721Envious.supportsInterface(interfaceId);
    }

	/**
     * @dev See {_baseURI}.
     */
    function baseURI() external view virtual returns (string memory) {
        return _baseURI();
    }

	/**
     * @dev Getter function for each token URI.
     *
     * Requirements:
     * - `tokenId` must exist.
     *
     * @param tokenId unique identifier of token
     * @return token URI string
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory currentURI = _baseURI();
        return string(abi.encodePacked(currentURI, tokenId.toString(), ".json"));
    }

	/**
     * @dev Set ghost related addresses.
     *
     * Requirements:
     * - `ghostAddress` must be non-zero address
     * - `ghostBonding` must be non-zero address
     *
     * @param ghostToken non-rebasing wrapping token address
     * @param ghostBonding bonding contract address
     */
	function setGhostAddresses(
		address ghostToken, 
		address ghostBonding
	) public virtual onlyOwner {
		require(
			ghostToken != address(0) && ghostBonding != address(0),
			ZERO_ADDRESS
		);
		_changeGhostAddresses(ghostToken, ghostBonding);
	}

	/**
     * @dev See {IERC721Envious-_changeCommunityAddresses}.
     */
    function changeCommunityAddresses(
		address newTokenAddress, 
		address newBlackHole
	) public virtual onlyOwner {
        require(newTokenAddress != address(0), ZERO_ADDRESS);
        _changeCommunityAddresses(newTokenAddress, newBlackHole);
    }

	/**
	 * @dev See {ERC721Envious-_changeCommissions}.
	 */ 
	function changeCommissions(uint256 incoming, uint256 outcoming) public virtual onlyOwner {
		_changeCommissions(incoming, outcoming);
	}

	/**
	 * @dev See {IERC721EnviousRoyalty-changeRoyalties}
	 */ 	
	function changeRoyalties(uint256 user, uint256 smart) public virtual override onlyOwner {
		royalties[0] = user;
		royalties[1] = smart;
	}
	
	/**
	 * @dev See {ERC721-_mint}
	 */
	function mint(address to) public virtual override onlyOwner {
		_tokenTracker.increment();
		_safeMint(to, _tokenTracker.current());
	}

	/**
	 * @dev See {ERC721-_burn}
	 */
	function burn(uint256 tokenId) external virtual {
		_burn(tokenId);
	}

	/**
	 * @dev See {ERC721Envious-_disperse}.
	 */
	function _disperse(address tokenAddress, uint256 tokenId) internal virtual override {
		uint256 balance = disperseBalance[tokenAddress] / totalSupply();

		if (disperseTotalTaken[tokenAddress] + balance > disperseBalance[tokenAddress]) {
			balance = disperseBalance[tokenAddress] - disperseTotalTaken[tokenAddress];
		}

		if (balance > disperseTaken[tokenId][tokenAddress]) {
			uint256 amount = balance - disperseTaken[tokenId][tokenAddress];
			disperseTaken[tokenId][tokenAddress] += amount;

			(bool shouldAppend,) = _arrayContains(tokenAddress, collateralTokens[tokenId]);
			if (shouldAppend) {
				collateralTokens[tokenId].push(tokenAddress);
			}

			collateralBalances[tokenId][tokenAddress] += amount;
			disperseTotalTaken[tokenAddress] += amount;
		}
	}

	/**
	 * @dev See {ERC721-_beforeTokenTransfer}.
	 */	
	function _beforeTokenTransfer(
		address from, 
		address to, 
		uint256 tokenId, 
		uint256 batchSize
	) internal virtual override (ERC721, ERC721Enumerable) {
		uint256 royalty = to.isContract() || from.isContract() ? royalties[1] : royalties[0];
		// NOTE: if you need to make tokens without collateral to be non-transferable
		// require(total > 0, "no collateral found");
		_getRoyaltyFromCollateral(tokenId, royalty);
        ERC721Enumerable._beforeTokenTransfer(from, to, tokenId, batchSize);
	}

	/**
	 * @dev Take commission on all collateral.
	 *
	 * @param tokenId unique identifier of token
	 * @param royalty percentage of commission required to take 
	 */	
	function _getRoyaltyFromCollateral(
		uint256 tokenId, 
		uint256 royalty
	) internal virtual {
		address[] memory allAddresses = collateralTokens[tokenId];
		for (uint256 i = 0; i < allAddresses.length; i++) {
			address tokenAddress = allAddresses[i];
			
			_disperse(tokenAddress, tokenId);
			
			collateralBalances[tokenId][tokenAddress] = _communityCommission(
				collateralBalances[tokenId][tokenAddress], 
				royalty, 
				tokenAddress
			);
		}
	}

	/**
     * @dev Getter function for `_baseTokenURI`.
     *
     * @return base URI string
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
}
