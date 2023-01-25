// SPDX-License-Identifier: AGPL-3.0
  
pragma solidity ^0.8.0;

import "../openzeppelin/token/ERC20/IERC20.sol";
import "../openzeppelin/token/ERC20/utils/SafeERC20.sol";

contract BondingMock {
	using SafeERC20 for IERC20;

	event Bond(uint256 indexed id, uint256 amount, uint256 price);

	struct Note {
        uint256 payout;
        uint48 created;
        uint48 matured;
        uint48 redeemed;
        uint48 marketID;
    }
	
	address private _quoteToken;
	address private _innerToken;
	uint256 private _timeOffset;

	mapping(address => Note[]) public notes;
	mapping(address => mapping(uint256 => address)) private noteTransers;

	string public NOT_NEEDED = "not needed for current mock";

	constructor(address innerToken, address quoteToken, uint256 timeOffset) {
		_innerToken = innerToken;
		_quoteToken = quoteToken;
		_timeOffset = timeOffset;
	}

	function deposit(
        uint256 _id,        // the ID of the market
        uint256 _amount,    // the amount of quote token to spend
        uint256 _maxPrice,  // the maximum price at which to buy
        address _user,      // the recipient of the payout
        address _referral   // the front-end operator address
    ) external returns (uint256 payout_, uint256 expiry_, uint256 index_) {
		require(_id > 0, "Depository: market concluded");
		require(_maxPrice > 0, "Depository: market concluded");
		require(_amount > 0, "Depository: max size exceeded");
		
		uint256 price = _id;
		payout_ = _amount * price;
		expiry_ = block.timestamp + 100;

		index_ = _addNote(_user, payout_, uint48(expiry_), uint48(_id), _referral);
		IERC20(_quoteToken).safeTransferFrom(msg.sender, address(this), _amount);

		emit Bond(_id, _amount, price);
	}

	function redeem(
        address _user,
        uint256[] memory _indexes,
        bool _sendgSTRL
    ) public returns (uint256 payout_) {
        uint48 time = uint48(block.timestamp);
        payout_ = 0;

        for (uint256 i = 0; i < _indexes.length; i++) {
            (uint256 pay, bool matured) = pendingFor(_user, _indexes[i]);
        
            if (matured) {
                notes[_user][_indexes[i]].redeemed = time;
                payout_ = payout_ + pay;
            }
        }
        
        if (_sendgSTRL) {
            IERC20(_innerToken).safeTransfer(_user, payout_);
        } else {
			revert(NOT_NEEDED);
        }
    }

	function indexesFor(address _user) public view returns (uint256[] memory) {
        Note[] memory info = notes[_user];

        uint256 length;
        for (uint256 i = 0; i < info.length; i++) {
            if (info[i].redeemed == 0 && info[i].payout != 0) length++;
        }

        uint256[] memory indexes = new uint256[](length);
        uint256 position;

        for (uint256 i = 0; i < info.length; i++) {
            if (info[i].redeemed == 0 && info[i].payout != 0) {
                indexes[position] = i;
                position++;
            }
        }

        return indexes;
    }

	function pendingFor(
        address user,
        uint256 index
    ) public view returns (uint256 payout_, bool matured_) {
        Note memory note = notes[user][index];

        payout_ = note.payout;
        matured_ = note.redeemed == 0 && note.matured <= block.timestamp && note.payout != 0;
    }

	function _addNote(
        address _user,
        uint256 _payout,
        uint48 _expiry,
        uint48 _marketID,
        address _referral
    ) internal returns (uint256 index_) {
        index_ = notes[_user].length;
        notes[_user].push(
            Note({
                payout: _payout,
                created: uint48(block.timestamp),
                matured: _expiry,
                redeemed: 0,
                marketID: _marketID
            })
        );
    }
}
