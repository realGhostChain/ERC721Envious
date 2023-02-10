// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../extension/ERC721Envious.sol";
import "../interfaces/IERC721EnviousVrf.sol";

import "../openzeppelin/token/ERC20/IERC20.sol";
import "../openzeppelin/token/ERC20/utils/SafeERC20.sol";
import "../openzeppelin/access/Ownable.sol";
import "../openzeppelin/utils/Counters.sol";
import "../openzeppelin/utils/Strings.sol";
import "../openzeppelin/utils/Address.sol";

import "../chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "../chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/**
 * @title ERC721 Collateralization Royaly Mock
 * This mock shows an implementation of ERC721Envious with additional functionality
 * from ChainLink. Verified Random Function (VRF) will be used in order to
 * achieve on-chain randomness for differen types of "random collateralization".
 *
 * @author 5Tr3TcH @ghostchain
 */
contract ERC721EnviousVRFPreset is Ownable, IERC721EnviousVrf, ERC721Envious, VRFConsumerBaseV2 {

	using SafeERC20 for IERC20;
	using Counters for Counters.Counter;
	using Strings for uint256;

	string private _baseTokenURI;

	// solhint-disable-next-line
	string private constant ZERO_ADDRESS = "zero address found";
	
	Counters.Counter private _nextTokenId;

	/// @dev See {IERCEnviousVrf-_vrfCoordinatorAddress}.
	address public override vrfCoordinatorAddress;

	/// @dev See {IERC721EnviousVrf-sSubscriptionId}
	uint64 public override sSubscriptionId;

	/// @dev See {IERC721EnviousVrf-sKeyHash}
	bytes32 public override sKeyHash;

	/// @dev See {IERC721EnviousVrf-callbackGasLimit}
	uint32 public override callbackGasLimit;

	/// @dev See {IERC721EnviousVrf-numWords}
	uint32 public override numWords;

	/// @dev See {IERC721EnviousVrf-requestConfirmations}
	uint16 public override requestConfirmations;

	/// @dev See {IERC721EnviousVrf-extraDisperseAmount}
	mapping(address => uint256) public override extraDisperseAmount;

	/// @dev See {IERC721EnviousVrf-extraDisperseTaken}
	mapping(address => uint256) public override extraDisperseTaken;

	/// @dev See {IERC721EnviousVrf-extraDisperseTokenId}
	mapping(address => uint256) public override extraDisperseTokenId;

	/// @dev See {IERC721EnviousVrf-randomAmountsDisperse}
	mapping(address => mapping(uint256 => uint256)) public override randomAmountsDisperse;

	// map donator addresses to requestIds
	mapping(uint256 => address) private _donators;

	// map full amount to donator
	mapping(address => uint256) private _requestFullAmount;

	// map vrf results to _donators
	mapping(address => uint256) private _requestRandomIds;

	constructor(
		string memory tokenName,
		string memory tokenSymbol,
		string memory uri,
		address coordinator
	) ERC721(tokenName, tokenSymbol) VRFConsumerBaseV2(coordinator) {
		require(coordinator != address(0), ZERO_ADDRESS);

		_baseTokenURI = uri;
		vrfCoordinatorAddress = coordinator;
		
		// nextTokenId is initialized to 1, since starting at 0 leads to higher gas cost 
		// for the first minter
		_nextTokenId.increment();
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
		override(IERC165, ERC721Envious)
		returns (bool)
	{
		return interfaceId == type(IERC721EnviousVrf).interfaceId ||
			interfaceId == type(VRFConsumerBaseV2).interfaceId ||
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
	 * @dev Getter function for amount of minted tokens.
	 *
	 * @return total supply 
	 */
	function totalSupply() public view virtual returns (uint256) {
		return _nextTokenId.current() - 1;
	}

	/**
	 * @dev See {IERC721EnviousVrf-initializeVRF}
	 */ 
	function initializeVRF(
		uint64 newSSubscriptionId,
		bytes32 newSKeyHash,
		uint32 newNumWords,
		uint32 newCallbackGasLimit,
		uint16 newRequestConfirmations
	) public virtual override onlyOwner {
		sSubscriptionId = newSSubscriptionId;
		sKeyHash = newSKeyHash;
		numWords = newNumWords;
		callbackGasLimit = newCallbackGasLimit;
		requestConfirmations = newRequestConfirmations;
		emit VrfChanged(
			newSSubscriptionId, 
			newSKeyHash, 
			newNumWords,
			newCallbackGasLimit, 
			newRequestConfirmations
		);
	}

	/**
	 * @dev See {ERC721Envious-_changeGhostAddresses}.
	 */
	function setGhostAddresses(
		address ghostToken, 
		address ghostBonding
	) public virtual {
		_changeGhostAddresses(ghostToken, ghostBonding);
	}

	/**
	 * @dev See {IERC721Envious-__changeCommunityAddresses}.
	 */
	function changeCommunityAddresses(address newTokenAddress, address newBlackHole) public virtual {
		require(newTokenAddress != address(0), ZERO_ADDRESS);
		_changeCommunityAddresses(newTokenAddress, newBlackHole);
	}

	/*
	 * @dev See {IERC721Envious-_changeCommissions}.
	 */
	function changeCommissions(uint256 incoming, uint256 outcoming) public virtual {
		_changeCommissions(incoming, outcoming);
	}

	/**
	 * @dev See {IERC721EnviousVrf-prepareRandomness}
	 */ 
	function prepareRandomness() public virtual override returns (uint256 requestId) {
		require(numWords > 0, "vrf not initialized");
		require(_requestRandomIds[_msgSender()] == 0, "vrf already used");
		requestId = VRFCoordinatorV2Interface(vrfCoordinatorAddress).requestRandomWords(
			sKeyHash,
			sSubscriptionId,
			requestConfirmations,
			callbackGasLimit,
			numWords
		);

		_donators[requestId] = _msgSender();
	}

	/**
	 * @dev See {IERC721EnviousVrf-collateralRandomTokens}
	 */ 	
	function collateralRandomTokens(
		uint256[] memory amounts, 
		address[] memory tokenAddresses
	) public virtual override payable {
		require(amounts.length == tokenAddresses.length, "lengths not match");
		require(_requestRandomIds[_msgSender()] != 0, "vrf not prepared");
		
		uint256 ethAmount = msg.value;
		
		for (uint256 i = 0; i < amounts.length; i++) {
			if (tokenAddresses[i] == address(0)) {
				ethAmount -= amounts[i];
			} else {
				IERC20(tokenAddresses[i]).safeTransferFrom(_msgSender(), address(this), amounts[i]);
			}

			_checkValidity(tokenAddresses[i]);

			extraDisperseAmount[tokenAddresses[i]] += amounts[i];
			extraDisperseTokenId[tokenAddresses[i]] = _requestRandomIds[_msgSender()];
		}

		_nullifyRandomness(_msgSender());

		if (ethAmount > 0) {
			Address.sendValue(payable(_msgSender()), ethAmount);
		}
	}
	
	/**
	 * @dev See {IERC721EnviousVrf-collateralRandomAmounts}
	 */ 	
	function collateralRandomAmounts(
		uint256[] memory tokenIds, 
		uint256 amount, 
		address tokenAddress
	) public virtual override payable {
		require(_requestFullAmount[msg.sender] > amount, "vrf not prepared");
		if (tokenAddress == address(0)) {
			require(amount == msg.value, "amounts not match");
		} else {
			IERC20(tokenAddress).safeTransferFrom(_msgSender(), address(this), amount);
		}

		_checkValidity(tokenAddress);
		
		for (uint256 i = 0; i < tokenIds.length; i++) {
			if (amount == 0) {
				break;
			}
		
			uint256 part = _requestFullAmount[msg.sender] % amount + 1;
			randomAmountsDisperse[tokenAddress][tokenIds[i]] += part;
			amount -= part;
		}

		_nullifyRandomness(_msgSender());
	}
	
	/**
	 * @dev See {ERC721-_mint}
	 */
	function mint(address to) public virtual override onlyOwner {
		uint256 currentTokenId = _nextTokenId.current();
		_nextTokenId.increment();
		_safeMint(to, currentTokenId);
	}

	function burn(uint256 tokenId) external virtual {
		_burn(tokenId);
	}

	/**
	 * @dev See {ERC721Envious-_disperse}.
	 */
	function _disperse(address tokenAddress, uint256 tokenId) internal virtual override {
		uint256 balance = disperseBalance[tokenAddress] / (_nextTokenId.current() - 1);
		
		if (disperseTotalTaken[tokenAddress] + balance > disperseBalance[tokenAddress]) {
			balance = disperseBalance[tokenAddress] - disperseTotalTaken[tokenAddress];
		}
		
		// adjust result from `collateralRandomAmounts`
		balance += randomAmountsDisperse[tokenAddress][tokenId];
		
		// adjust result from `collateralRandomIds`
		if (extraDisperseTokenId[tokenAddress] != 0 && tokenId % extraDisperseTokenId[tokenAddress] == 0) {
			uint256 piece = (_nextTokenId.current() - 1) / extraDisperseTokenId[tokenAddress];
			uint256 extraBalance = piece > 0 ? extraDisperseAmount[tokenAddress] / piece : 0;
			
			if (extraDisperseTaken[tokenAddress] + extraBalance > extraDisperseAmount[tokenAddress]) {
				extraBalance = extraDisperseAmount[tokenAddress] - extraDisperseTaken[tokenAddress];
			}
			
			balance += extraBalance;
			extraDisperseTaken[tokenAddress] += extraBalance;
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

	/* solhint-disable */
	/**
	 * @dev Some action on the contract state should be taken here, like storing the result.
	 * @dev WARNING: take care to avoid having multiple VRF requests in flight if their order
	 * of arrival would result in contract states with different outcomes. Otherwise miners 
	 * or the VRF operator would could take advantage by controlling the order.
	 *
	 * @dev The VRF Coordinator will only send this function verified responses, and the parent 
	 * VRFConsumerBaseV2 contract ensures that this method only receives randomness from the 
	 * designated VRFCoordinator.
	 *
	 * @param requestId request unqiue identifier
	 * @param randomWords the random result returned by the oracle
	 */
	function fulfillRandomWords(
		uint256 requestId, 
		uint256[] memory randomWords
	) internal virtual override {
		// NOTE: we believe that it highly unlikely that random number will be greater
		// than total supply of all NFTs.
		uint256 magicNumber = (_nextTokenId.current() - 1);
		_requestRandomIds[_donators[requestId]] = randomWords[0] % magicNumber + 1;
		_requestFullAmount[_donators[requestId]] = randomWords[0];
	}
	/* solhint-enable */

	/**
	 * dev Nullify mappings after usage.
	 *
	 * @param who address of user to be nullified
	 */
	function _nullifyRandomness(address who) internal virtual {
		_requestRandomIds[who] = 0;
		_requestFullAmount[who] = 0;
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
