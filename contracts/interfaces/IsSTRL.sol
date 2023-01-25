// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "../openzeppelin/token/ERC20/IERC20.sol";

interface IsSTRL is IERC20 {
	event LogRebase(uint256 indexed epoch, uint256 totalSupply, uint256 rebase, uint256 index);
    event LogStakingContractUpdated(address stakingContract);

	struct Rebase {
        uint256 epoch;
        uint256 rebase; // 18 decimals
        uint256 totalStakedBefore;
        uint256 totalStakedAfter;
        uint256 amountRebased;
        uint256 index;
        uint256 blockNumberOccured;
    }

	function scaledTotalSupply() external pure returns (uint256);

    function rebase( uint256 ohmProfit_, uint epoch_) external returns (uint256);

    function circulatingSupply() external view returns (uint256);

	function scaledBalanceOf( address account ) external view returns (uint256);

    function gonsForBalance( uint amount ) external view returns ( uint );

    function balanceForGons( uint gons ) external view returns ( uint );

    function toG(uint amount) external view returns (uint);

    function fromG(uint amount) external view returns (uint);

    function index() external view returns ( uint );
	
	function changeDebt(uint256 amount, address debtor, bool add) external;

    function debtBalances(address _address) external view returns (uint256);
}
