// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../extension/ERC721Envious.sol";
import "../openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";
import "../openzeppelin/token/ERC721/extensions/ERC721Burnable.sol";
import "../openzeppelin/token/ERC721/extensions/ERC721Pausable.sol";
import "../openzeppelin/token/ERC20/IERC20.sol";
import "../openzeppelin/token/ERC20/utils/SafeERC20.sol";
import "../openzeppelin/access/AccessControlEnumerable.sol";
import "../openzeppelin/utils/Counters.sol";
import "../openzeppelin/utils/Strings.sol";

/**
 * @title ERC721 Collateralization Mock
 * This mock shows a generic implementation of ERC721Envious with additional
 * ability to use {IBondDepository} and {INoteKeeper}. ERC721Enumerable is used,
 * so in this example {_disperse} function is based on {totalSupply} of it.
 * While current smart contract will implement 5 extensions, resulting size is
 * ~23.59 KiB according to 1337 optimization runs.
 *
 * @author F4T50 @ghostchain
 */
contract ERC721EnviousPreset is
	AccessControlEnumerable, 
	ERC721Burnable, 
	ERC721Pausable, 
	ERC721Enumerable,
	ERC721Envious
{

	using SafeERC20 for IERC20;
	using Counters for Counters.Counter;
	using Strings for uint256;

	string private _baseTokenURI;

	// solhint-disable-next-line
	string private constant ONLY_OWNER = "incorrect role";
	// solhint-disable-next-line
	string private constant ZERO_ADDRESS = "zero address";

	// solhint-disable-next-line
	bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");
	// solhint-disable-next-line
	bytes32 private constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
	// solhint-disable-next-line
	bytes32 private constant GHOSTY_ROLE = keccak256("GHOSTY_ROLE");

	Counters.Counter private _tokenTracker;

	constructor(
		string memory tokenName,
		string memory tokenSymbol,
		string memory baseTokenURI
	) ERC721(tokenName, tokenSymbol) {
		_setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

		_setupRole(MINTER_ROLE, _msgSender());
		_setupRole(PAUSER_ROLE, _msgSender());
		_setupRole(GHOSTY_ROLE, _msgSender());

		_baseTokenURI = baseTokenURI;
	}

	receive() external payable {
		_disperseTokenCollateral(msg.value, address(0));
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
	 * @dev See {IERC165-supportsInterface}.
	 */ 
	function supportsInterface(bytes4 interfaceId)
		public 
		view 
		virtual
		override(AccessControlEnumerable, ERC721Envious, ERC721Enumerable, ERC721) 
		returns (bool) 
	{
		return ERC721Envious.supportsInterface(interfaceId) || 
			AccessControlEnumerable.supportsInterface(interfaceId) || 
			ERC721Enumerable.supportsInterface(interfaceId);
	}

	/**
	 * @dev Create new token.
	 *
	 * Requirements:
	 * - `msg.sender` must has MINTER_ROLE
	 *
	 * @param to recevier address of created token
	 */
	function mint(address to) public virtual override {
		require(hasRole(MINTER_ROLE, _msgSender()), ONLY_OWNER);
		_tokenTracker.increment();
		_safeMint(to, _tokenTracker.current());
	}

	/**
	 * @dev Pause token.
	 */
	function pause() external virtual {
		require(hasRole(PAUSER_ROLE, _msgSender()), ONLY_OWNER);
		_pause();
	}

	/**
	 * @dev Unpause token.
	 */
	function unpause() external virtual {
		require(hasRole(PAUSER_ROLE, _msgSender()), ONLY_OWNER);
		_unpause();
	}

	/**
	 * dev Change underlying ghost related addresses.
	 *
	 * Requirements:
	 * - `ghostToken` must be non-zero address
	 * - `ghostBonding` must be non-zero address
	 * - `msg.sender` must has GHOSTY_ROLE
	 *
	 * @param ghostToken address of non-rebasing wrapping token
	 * @param ghostBonding address of bonding smart contract
	 */ 
	function setGhostAddresses(address ghostToken, address ghostBonding) public virtual {
		require(
			ghostToken != address(0) && ghostBonding != address(0),
			ZERO_ADDRESS
		);
		require(hasRole(GHOSTY_ROLE, _msgSender()), ONLY_OWNER);
		_changeGhostAddresses(ghostToken, ghostBonding);
	}

	/**
	 * @dev Change token for commission harvesting.
	 *
	 * Requirements:
	 * - `newTokenAddress` must be non-zero address
	 *
	 * @param newTokenAddress address of new harvesting token.
	 */ 
	function changeCommunityAddresses(address newTokenAddress, address newBlackHole) public virtual {
		require(newTokenAddress != address(0), ZERO_ADDRESS);
		require(hasRole(GHOSTY_ROLE, _msgSender()), ONLY_OWNER);
		_changeCommunityAddresses(newTokenAddress, newBlackHole);
	}

	/**
	 * @dev Change commission for NFT collateralization.
	 *
	 * Requirements:
	 * - `msg.sender` must has GHOSTY_ROLE
	 *
	 * @param incoming commission percentage for each collateralization
	 * @param outcoming commission percentage for each uncollateralization
	 */
	function changeCommissions(uint256 incoming, uint256 outcoming) public virtual {
		require(hasRole(GHOSTY_ROLE, _msgSender()), ONLY_OWNER);
		_changeCommissions(incoming, outcoming);
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
	) internal virtual override(ERC721, ERC721Pausable, ERC721Enumerable) {
		ERC721Enumerable._beforeTokenTransfer(from, to, tokenId, batchSize);
		require(!paused(), "token paused");
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
