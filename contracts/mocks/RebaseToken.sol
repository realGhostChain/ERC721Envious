// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "../openzeppelin/utils/Address.sol";
import "../openzeppelin/utils/math/SafeMath.sol";

import "../openzeppelin/token/ERC20/extensions/draft-ERC20Permit.sol";

import "../interfaces/IgSTRL.sol";
import "../interfaces/IsSTRL.sol";
import "../interfaces/IStaking.sol";

contract RebaseToken is IsSTRL, ERC20Permit {
	// PLEASE READ BEFORE CHANGING ANY ACCOUNTING OR MATH
	// Anytime there is division, there is a risk of numerical instability from rounding errors.
	// In order to minimize this risk, we adhere to the following  guidelines:
	// 1) The conversion rate adopted is the number of gons that equals 1 fragment.
	//    The inverse rate must not be used--TOTAL_GONS is always the numerator and _totalSupply is
	//    always the denominator. (i.e. If you want to convert gons to fragments instead of
	//    multiplying by the inverse rate, you should divide by the normal rate)
	// 2) Gon balances converted into Fragments are always rounded down (truncted).
	//
	// We make the following guarantees:
	// - If address 'A' transfers x Fragments to address 'B'. A's resulting external balance will
	//   be decreased by precisely x Fragments, and B's external balance will be precisely
	//   increased by x Fragments.
	//
	// We do not guarantee that the sum of all balances equals the result of calling totalSupply().
	// This is because, for any conversion function 'f()' that has non-zero rounding error,
	// f(x0) + f(x1) + ... + f(xn) is not always equal to f(x0 + x1 + ... + xn).

	using SafeMath for uint256;

	address public stakingContract; // balance used to calc rebase

	modifier onlyStakingContract() {
		require(msg.sender == stakingContract, "sSTRL: only for staking contract");
		_;
	}

	address internal initializer;

	uint256 internal INDEX; // Index Gons - track rebase growth

	IgSTRL public gSTRL; // additional staked supply (governance/bridge token)

	Rebase[] public rebases; // past rebase data

	// NOTE: {ERC20-_totalSupply} marked as private in latest version of openzeppelin
	// so we need to re-declare it here
	uint256 private _totalSupply;

	uint256 private constant MAX_UINT256 = type(uint256).max;
	uint256 private constant INITIAL_FRAGMENTS_SUPPLY = 5 * 10**15; // 5*10^6 (amount) * 10^9 (decimals)

	// TOTAL_GONS is a multiple of INITIAL_FRAGMENTS_SUPPLY so that _gonsPerFragment
	// is an integer. Use the highest value that fits in a uint256 for max granularity.
	uint256 private constant TOTAL_GONS = MAX_UINT256 - (MAX_UINT256 % INITIAL_FRAGMENTS_SUPPLY);

	// MAX_SUPPLY = maximum integer < (sqrt(4*TOTAL_GONS + 1) - 1) / 2
	uint256 private constant MAX_SUPPLY = type(uint128).max; // (2^128)-1

	uint256 private _gonsPerFragment;
	mapping(address => uint256) private _gonBalances;

	// This is denominated, because the gons-fragments conversion might change before
	// it's fully paid.
	mapping(address => mapping(address => uint256)) private _allowedValue;

	address public treasury;
	mapping(address => uint256) public override debtBalances;

	constructor() ERC20("Staked eGHST", "sGHST")
	ERC20Permit("Staked eGHST")
	{
		initializer = msg.sender;
		_totalSupply = INITIAL_FRAGMENTS_SUPPLY;
		_gonsPerFragment = TOTAL_GONS.div(_totalSupply);
	}

	function decimals() public pure virtual override returns (uint8) {
		return 9;
	}

	function setIndex(uint256 _index) external {
		require(msg.sender == initializer, "sSTRL: only from initializer");
		require(INDEX == 0, "sSTRL: index already set");
		INDEX = gonsForBalance(_index);
	}

	function setgSTRL(address _gSTRL) external {
		require(msg.sender == initializer, "sSTRL: only from initializer");
		require(address(gSTRL) == address(0), "sSTRL: gSTRL address already set");
		require(_gSTRL != address(0), "sSTRL: gSTRL is not a valid contract");
		gSTRL = IgSTRL(_gSTRL);
	}

	// do this last
	function initialize(address _stakingContract, address _treasury) external {
		require(msg.sender == initializer, "sSTRL: only from initializer");
		require(_stakingContract != address(0), "sSTRL: Staking is not a valid contract");

		stakingContract = _stakingContract;
		_gonBalances[_stakingContract] = TOTAL_GONS;

		require(_treasury != address(0), "sSTRL: Treasury is not a valid contract");
		treasury = _treasury;

		emit Transfer(address(0x0), _stakingContract, _totalSupply);
		emit LogStakingContractUpdated(_stakingContract);

		initializer = address(0);
	}

	function scaledTotalSupply() external pure override returns (uint256) {
		return TOTAL_GONS;
	}

	/**
	 * @dev Notifies contract about a new rebase cycle.
	 * @param profit_ The number of new tokens to add into circulation via expansion.
	 * @return The total number of sSTRL after the supply adjustment.
	 */
	function rebase(uint256 profit_, uint256 epoch_)
		public
	   	override
	   	onlyStakingContract
	   	returns (uint256)
	{
		uint256 rebaseAmount;
		uint256 circulatingSupply_ = circulatingSupply();

		if (profit_ == 0) {
			emit LogRebase(epoch_, _totalSupply, 0, index());
			return _totalSupply;
		} else if (circulatingSupply_ > 0) {
			rebaseAmount = profit_.mul(_totalSupply).div(circulatingSupply_);
		} else {
			rebaseAmount = profit_;
		}

		_totalSupply = _totalSupply.add(rebaseAmount);

		if (_totalSupply > MAX_SUPPLY) {
			_totalSupply = MAX_SUPPLY;
		}

		_gonsPerFragment = TOTAL_GONS.div(_totalSupply);

		_storeRebase(circulatingSupply_, profit_, epoch_);

		// From this point forward, _gonsPerFragment is taken as the source of truth.
		// We recalculate a new _totalSupply to be in agreement with the _gonsPerFragment
		// conversion rate.
		//
		// This means our applied profit can deviate from the requested profit,
		// but this deviation is guaranteed to be < (_totalSupply^2)/(TOTAL_GONS - _totalSupply).
		//
		// In the case of _totalSupply <= MAX_UINT128 (our current supply cap), this deviation is
		// guaranteed to be < 1, so we can omit this step. If the supply cap is ever increased,
		// it must be re-included.
		// _totalSupply = TOTAL_GONS.div(_gonsPerFragment)

		return _totalSupply;
	}

	function _storeRebase(
		uint256 previousCirculating_,
		uint256 profit_,
		uint256 epoch_
	) internal {
		uint256 rebasePercent = profit_.mul(1e18).div(previousCirculating_);
		rebases.push(
			Rebase({
				epoch: epoch_,
				rebase: rebasePercent, // 18 decimals
				totalStakedBefore: previousCirculating_,
				totalStakedAfter: circulatingSupply(),
				amountRebased: profit_,
				index: index(),
				blockNumberOccured: block.number
			})
		);

		emit LogRebase(epoch_, _totalSupply, rebasePercent, index());
	}

	function transfer(
		address to,
		uint256 value
	) public override(IERC20, ERC20) returns (bool) {
		uint256 gonValue = gonsForBalance(value);

		_gonBalances[msg.sender] = _gonBalances[msg.sender].sub(gonValue);
		_gonBalances[to] = _gonBalances[to].add(gonValue);

		_checkDebt(msg.sender);
		emit Transfer(msg.sender, to, value);
		return true;
	}

	function transferFrom(
		address from,
		address to,
		uint256 value
	) public override(IERC20, ERC20) returns (bool) {
		_allowedValue[from][msg.sender] = _allowedValue[from][msg.sender].sub(value);
		emit Approval(from, msg.sender, _allowedValue[from][msg.sender]);

		uint256 gonValue = gonsForBalance(value);
		_gonBalances[from] = _gonBalances[from].sub(gonValue);
		_gonBalances[to] = _gonBalances[to].add(gonValue);

		_checkDebt(from);
		emit Transfer(msg.sender, to, value);
		return true;
	}

	function approve(address spender, uint256 value) public override(IERC20, ERC20) returns (bool) {
		_approve(msg.sender, spender, value);
		return true;
	}

	function increaseAllowance(address spender, uint256 value) public override returns (bool) {
		_approve(msg.sender, spender, _allowedValue[msg.sender][spender].add(value));
		return true;
	}

	function decreaseAllowance(address spender, uint256 value) public override returns (bool) {
		uint256 oldValue = _allowedValue[msg.sender][spender];
		uint256 amount = (value >= oldValue) ? 0 : oldValue.sub(value);
		_approve(msg.sender, spender, amount);
		return true;
	}

	// this function is called by the treasury, and informs sSTRL of changes to debt.
	// note that addresses with debt balances cannot transfer collateralized sSTRL
	// until the debt has been repaid.
	function changeDebt(
		uint256 amount,
		address debtor,
		bool add
	) external override {
		require(msg.sender == treasury, "sSTRL: only Treasury");
		debtBalances[debtor] = add ? debtBalances[debtor].add(amount) : debtBalances[debtor].sub(amount);
		_checkDebt(debtor);
	}

	function _checkDebt(address from) internal view {
		require(balanceOf(from) >= debtBalances[from], "sSTRL: cannot transfer amount");
	}

	function _approve(
		address owner,
		address spender,
		uint256 value
	) internal virtual override {
		_allowedValue[owner][spender] = value;
		emit Approval(owner, spender, value);
	}

	function balanceOf(address account) public view override(IERC20, ERC20) returns (uint256) {
		return _gonBalances[account].div(_gonsPerFragment);
	}

	function scaledBalanceOf(address account) external view override returns (uint256) {
		return _gonBalances[account];
	}

	function gonsForBalance(uint256 amount) public view override returns (uint256) {
		return amount.mul(_gonsPerFragment);
	}

	function balanceForGons(uint256 gons) public view override returns (uint256) {
		return gons.div(_gonsPerFragment);
	}

	// toG converts an sSTRL balance to gSTRL terms. gSTRL is an 18 decimal token.
	// balance given is in 18 decimals format.
	function toG(uint256 amount) external view override returns (uint256) {
		return gSTRL.balanceTo(amount);
	}

	// fromG converts a gSTRL balance to sSTRL terms. sSTRL is a 9 decimals token.
	// balance given is in 9 decimals format.
	function fromG(uint256 amount) external view override returns (uint256) {
		return gSTRL.balanceFrom(amount);
	}

	function totalSupply() public view override(ERC20, IERC20) returns (uint256) {
		return _totalSupply;
	}

	// staking contract holds excess sSTRL
	function circulatingSupply() public view override returns (uint256) {
		// NOTE: changed for mocking purposes
		return _totalSupply;
	}

	function index() public view override returns (uint256) {
		return balanceForGons(INDEX);
	}

	function allowance(address owner, address spender) public view override(IERC20, ERC20) returns (uint256) {
		return _allowedValue[owner][spender];
	}
}
