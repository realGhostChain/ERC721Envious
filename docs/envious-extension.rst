.. _envious-extension:

#######################
ERC721Envious Extension
#######################

***********
Description
***********

ERC721Envious smart contract is an abstract smart contract that extends the functionality of ERC721 by enabling collateral features. The address of an ERC721Envious collection stores the native coin and ERC20 tokens where the tokenId serves as the access key unlocking the corresponding portion of the balance.

.. hint::
  Following best practices, the native coin will be associated with the 0x0000000000000000000000000000000000000000 address to avoid collision between the native coin and ERC20 tokens.

Any user can collateralize any specific tokenID with any combination of the native coin and any ERC20 tokens. ERC721Envious allows each tokenId to store a unique array of token addresses owned, which eliminates the need for token registration and array length.

However, only the owner of the tokenId can redeem or uncollateralize the native coin and ERC20 tokens attached to the tokenId. This ensures that the collateral balance remains with the tokenId owner at any given point of time, and makes it easier to transfer ownership of the tokenId without having to worry about transferring the collateral balance separately.

.. hint::
  When a new ERC20 token is added as collateral, its token address is added to the array of token addresses associated with the tokenId. When the balance of a specific ERC20 token drops to 0, its address is removed from the array of token addresses.

``Harvesting`` is required to collect accumulated commissions. The total token quantity is calculated after aligning the decimals and taking out a proportional value according to the number of ``communityToken`` submitted.

.. hint::
  Not all ERC20 tokens support the burn function. To work around this limitation, the ERC721Envious standard includes a specific entity called BlackHole, which serves as an analog to the zero address. 

Another important feature of the ERC721Envious standard is to ``disperse`` tokens across all assets in the collection in one single transaction.

.. hint::
  When tokens are dispersed to NFTs in a collection the collateral is stored in a temporary variable, and is not immediately reflected in the actual collateral balance behind respective tokenIds. Instead, the dispersed collateral balance for each tokenId is updated when ``collateral`` or ``uncollateral`` operation takes place on that specific tokenId. 

.. warning::
  The dispersion logic relies on the ``totalSupply`` function. It is important to ensure that there are no issues with the ``totalSupply`` function to prevent any unintended consequences in the dispersion logic. 

It is possible to make the ``collateral``, ``uncollateral``, ``harvest``, and ``disperse`` functions more flexible by allowing users to specify an array of actions to be performed in a single transaction. This can help reduce the gas fees associated with performing these actions individually.

**************
IERC721Envious
**************

IERC721Envious is an optional Envious extension for ERC-721 Non-Fungible Token Standard.

**commissions**

.. code-block:: Solidity

  function commissions(uint256 index) external view returns (uint256)

commissions are defined by an array with two elements as input, each representing a commission percentage charged on collateral. The first element denotes the commission charged for collateralization, while the second element represents the commission for uncollateralization. It is important to note that a 3 decimal buffer should be added to each commission rate. For example, 1% would be represented as 1000.

commissions function returns the value of the respective commission fee.

**_Arguments_**

====== ======= =======================
Name   Type    Description
====== ======= =======================
index  uint256 index of value in array
====== ======= =======================

**ghostAddress**

.. code-block:: Solidity

  function ghostAddress() external view returns (address)

ghostAddress function returns the token address for bond payouts. Following the launch of ghostDAO, ghostAddress will be set to the ``tokenAddress`` of the GHST token.

**ghostBondingAddress**

.. code-block:: Solidity

  function ghostBondingAddress() external view returns (address)

ghostBondingAddress function returns the smart contract address that facilitates the purchase of bonds using the DeFi 2.0 protocol. Following the launch of ghostDAO, ghostBondingAddress will be set to the bonding smart contract address of ghostDAO.

**blackHole**

.. code-block:: Solidity

  function blackHole() external view returns (address)

``blackHole`` is an address that ensures any tokens sent to it cannot be retrieved.

blackHole function returns the address of the ``blackHole``.

**communityToken**

.. code-block:: Solidity

  function communityToken() external view returns (address)

communityToken is an ERC20 token set by the collection registrant. ``communityToken`` can be exchanged to harvest accumulated commissions.

communityToken function returns the address of the ``communityToken``.

**communityPool**

.. code-block:: Solidity

  function communityPool(uint256 index) external view returns (address)

Pool of available tokens for harvesting.

communityPool is an array of ERC20 addresses that can be harvested by ``communityToken`` holders.

communityPool function returns the address of a specific ERC20 token available for harvesting by ``communityToken`` holders.

**_Arguments_**

====== ======= =======================
Name   Type    Description
====== ======= =======================
index  uint256 index of value in array
====== ======= =======================

**communityBalance**

.. code-block:: Solidity

  function communityBalance(address tokenAddress) external view returns (uint256)

communityBalance is the amount of ERC20 token available for harvesting.

communityBalance function returns the total balance of a specified ERC20 token that has been accumulated from collected commissions and is currently available for harvesting. 

**_Arguments_**

============ ======= ==================================================
Name         Type    Description
============ ======= ==================================================
tokenAddress address address of an ERC20 token available for harvesting
============ ======= ==================================================

**disperseTokens**

.. code-block:: Solidity

  function disperseTokens(uint256 index) external view returns (address)

disperseTokens is an array of ERC20 tokens that have already been dispersed.

disperseTokens function returns the address of a specific ERC20 token that has been dispersed.

**_Arguments_**

====== ======= =======================
Name   Type    Description
====== ======= =======================
index  uint256 index of value in array
====== ======= =======================

**disperseBalance**

.. code-block:: Solidity

  function disperseBalance(address tokenAddress) external view returns (uint256)

disperseBalance is the total amount of ERC20 tokens that have been distributed to all tokenIds within a particular NFT collection.

disperseBalance function returns the total amount of a particular ERC20 token that has been dispersed to all tokenIds within a particular NFT collection.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
tokenAddress address address of a dispersed ERC20 token
============ ======= ==================================

**disperseTotalTaken**

.. code-block:: Solidity

  function disperseTotalTaken(address tokenAddress) external view returns (uint256)

disperseTotalTaken is the quantity of ERC20 tokens that has been already claimed from the ``disperseBalance``.

disperseBalance function returns the number of dispersed ERC20 tokens of a specific ``tokenAddress`` from the ``disperseBalance``.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
tokenAddress address address of a dispersed ERC20 token
============ ======= ==================================

**disperseTaken**

.. code-block:: Solidity

  function disperseTaken(uint256 tokenId, address tokenAddress) external view returns (uint256)

disperseTaken is the quantity of ERC20 tokens that has been already claimed from the ``disperseBalance``, specifically in reference to a particular ``tokenId``.

disperseTaken function returns the quantity of a specific ERC20 token that has been distributed from the ``disperseBalance`` to a particular ``tokenId``.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
tokenId      uint256 unique token identifier
tokenAddress address address of a dispersed ERC20 token
============ ======= ==================================

**bondPayouts**

.. code-block:: Solidity

  function bondPayouts(uint256 bondId) external view returns (uint256)

bondPayouts is an estimated quantity of the ``ghostAddress`` token to be obtained from the bond upon completion of the vesting period.

bondPayouts function returns the approximate payout quantity of the ghostAddress token to be obtained from a particular ``bondId`` after the vesting period is over.

**_Arguments_**

=========== ======= ======================
Name         Type    Description
=========== ======= ======================
bondId      uint256 unique bond identifier
=========== ======= ======================

**bondIndexes**

.. code-block:: Solidity

bondIndexes is a mapping that associates each ``tokenId`` from a particular NFT collection with an array of bonds.

bondIndexes function returns the ``index`` of a bond based on ``collection address``, ``tokenId``, and chronological ``index`` position.

**_Arguments_**

============ ======= =======================
Name         Type    Description
============ ======= =======================
tokenId      uint256 unique token identifier
index        uint256 index in array
============ ======= =======================

**collateralTokens**

.. code-block:: Solidity

  function collateralTokens(uint256 tokenId, uint256 index) external view returns (address)

collateralTokens represents ERC20 tokens used as a collateral for a particular NFT.

collateralTokens function returns the address of an ERC20 token used as a collateral for a particular ``tokenId``, determined by its chronological ``index`` position.

**_Arguments_**

============ ======= ==================================================
Name         Type    Description
============ ======= ==================================================
tokenId      uint256 unique token identifier
tokenAddress address address of an ERC20 token being held as collateral
============ ======= ==================================================

**collateralBalances**

.. code-block:: Solidity

collateralBalances reflects the total quantity of ERC20 tokens that are currently being held as collateral for a particular ``tokenId``.

collateralBalances function returns the quantity of ERC20 tokens held as collateral for a specific ``tokenId``, based on the provided ``tokenAddress``.

**_Arguments_**

============ ======= ==================================================
Name         Type    Description
============ ======= ==================================================
tokenId      uint256 unique token identifier
tokenAddress address address of an ERC20 token being held as collateral
============ ======= ==================================================

**getAmount**

.. code-block:: Solidity

  function getAmount(uint256 amount, address tokenAddress) external view returns (uint256)

getAmount is a calculator for estimating the ``harvesting`` amount.

getAmount function returns the ``harvesting`` amount for a specific ERC20 token based on the amount of ``communityToken`` to be exchanged.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
amount       uint256 amount of ``communityToken``
tokenAddress address address of a harvested ERC20 token
============ ======= ==================================

**harvest**

.. code-block:: Solidity

  function harvest(uint256[] memory amounts, address[] memory tokenAddresses) external

harvest function collects commission fees in exchange for ``communityToken``.

**_Arguments_**

============== ========= ========================================
Name           Type      Description
============== ========= ========================================
amounts        uint256[] array of amounts to be harvested
tokenAddresses address[] array of token addresses to be harvested
============== ========= ========================================

**collateralize**

.. code-block:: Solidity

  function collateralize(uint256 tokenId, uint256[] memory amounts, address[] memory tokenAddresses) external payable

collateralize function facilitates the collateralization of a specific ``tokenId`` using a specified amount of a designated ERC20 token.

**_Arguments_**

============== ========= ======================================================
Name           Type      Description
============== ========= ======================================================
tokenId        uint256   unique token identifier
amounts        uint256[] array of amounts to be added to the collateral
tokenAddresses address[] array of token addresses to be added to the collateral
============== ========= ======================================================

**uncollateralize**

.. code-block:: Solidity

  function uncollateralize(uint256 tokenId, uint256[] memory amounts, address[] memory tokenAddresses) external

uncollateralize function facilitates the redemption of a specific ``tokenId`` using a specified amount of a designated ERC20 token.

.. hint::
  Only the owner of the tokenId is able to trigger the uncollateralize function.

**_Arguments_**

============== ========= ===========================================================
Name           Type      Description
============== ========= ===========================================================
tokenId        uint256   unique token identifier
amounts        uint256[] array of amounts to be redeemed from the collateral
tokenAddresses address[] array of token addresses to be redeemed from the collateral
============== ========= ===========================================================

**getDiscountedCollateral**

.. code-block:: Solidity

  function getDiscountedCollateral(uint256 bondId, address quoteToken, uint256 tokenId, uint256 amount, uint256 maxPrice) external

getDiscountedCollateral function enables NFT collateralization with a discount determined by the available bonds. The smart contract acts as the temporary owner of the bond during the bond vesting period.

**_Arguments_**

============== ========= ===========================================================
Name           Type      Description
============== ========= ===========================================================
bondId         uint256   unique bond identifier
quoteToken     address   address of a token that is accepted as a payment for a bond
tokenId        uint256   unique token identifier
amount         uint256   quantity of the quoteToken paid for the bond
maxPrice       uint256   maximum price allowed to pay for the bond
============== ========= ===========================================================

**claimDiscountedCollateral**

.. code-block:: Solidity

  function claimDiscountedCollateral(uint256 tokenId, uint256[] memory indexes) external

claimDiscountedCollateral function allows for the redemption of the corresponding bond notes for ghostAddress collateral after the bond vesting period has elapsed.

**_Arguments_**

============== ========= ==================================
Name           Type      Description
============== ========= ==================================
tokenId        uint256   unique token identifier
indexes        uint256[] array of note indexes to redeem
============== ========= ==================================

**disperse**

.. code-block:: Solidity

  function disperse(uint256[] memory amounts, address[] memory tokenAddresses) external payable

disperse function logs the amounts of ``tokenAddresses` into ``disperseBalance``.

**_Arguments_**

============== ========= ========================================
Name           Type      Description
============== ========= ========================================
amounts        uint256[] array of amounts to be dispersed
tokenAddresses address[] array of token addresses to be dispersed
============== ========= ========================================

**mint**

.. code-block:: Solidity

  function mint(address who) external

Please refer to full documentation at `IERC721-_mint <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol>`_.

**_Arguments_**

============== ========= ===================================
Name           Type      Description
============== ========= ===================================
who            address   receiver of NFT
============== ========= ===================================

**event Collateralized**

event Collateralized is triggered every time a collateral transaction occurs on-chain.

**_Arguments_**

============== ========= ======================================================
Name           Type      Description
============== ========= ======================================================
tokenId        uint256   unique token identifier
amount         uint256   amount to be added to the collateral
tokenAddress   address   address of an EC20 token to be added to the collateral
============== ========= ======================================================

**event Uncollateralized**

event Uncollateralized is triggered every time an uncollateral transaction occurs on-chain.

**_Arguments_**

============== ========= ============================================================
Name           Type      Description
============== ========= ============================================================
tokenId        uint256   unique token identifier
amount         uint256   amount to be redeemed from the collateral
tokenAddress   address   address of an ERC20 token to be redeemed from the collateral
============== ========= ============================================================

**event Dispersed**

event Dispersed is triggered every time a disperse transaction occurs on-chain.

**_Arguments_**

============== ========= =========================================
Name           Type      Description
============== ========= =========================================
tokenAddress   address   amount to be dispersed
amount         uint256   address of an ERC20 token to be dispersed
============== ========= =========================================

**event Harvested**

event Harvested is triggered every time a harvest transaction occurs on-chain.

**_Arguments_**

============== ========= =========================================
Name           Type      Description
============== ========= =========================================
tokenAddress   address   amount to be harvested
amount         uint256   address of an ERC20 token to be harvested
scaledAmount   uint256   amount of ``communityToken`` spent
============== ========= =========================================

*************
ERC721Envious
*************

**_arrayContains**

.. code-block:: Solidity

  function _arrayContains(address tokenAddress, address[] memory findFrom) private pure returns (bool shouldAppend, uint256 index)

_arrayContains function checks whether an element exists in the array. If the element is found, the function returns the index of the element. Otherwise, it sets the variable ``shouldAppend`` to true.

_arrayContains function returns a tuple of values. The first value indicates whether the element should be added to the array (true if the element is not found in the array, false otherwise). The second value indicates the index of the element in the array if it exists.

**_Arguments_**

============ ========= =======================================================
Name         Type      Description
============ ========= =======================================================
tokenAddress address   address of an ERC20 token to be added to the collateral
findFrom     address[] array of available tokenAddresses
============ ========= =======================================================

**_arrayContains**

.. code-block:: Solidity

  function _arrayContains(uint256 noteId, uint256[] memory findFrom) private pure returns (uint256 index)

_arrayContains function checks whether a ``noteId`` exists in the bond index array.

_arrayContains function returns the index of the bond based on the ``noteId``.

**_Arguments_**

============ ========= ===========================
Name         Type      Description
============ ========= ===========================
noteId        uint256  unique bond note identifier
============ ========= ===========================

**_scaledAmount**

.. code-block:: Solidity

  function _scaledAmount(address tokenAddress) private view returns (uint256)

_scaledAmount function adjusts the decimal alignment of tokens collected in ``communityBalance`` to match the decimal places of a ``communityToken``.

**_Arguments_**

============ ========= =========================================
Name         Type      Description
============ ========= =========================================
tokenAddress address   address of an ERC20 token to be harvested
============ ========= =========================================

**_harvest**

.. code-block:: Solidity

  function _harvest(uint256 amount, address tokenAddress) private

_harvest function is an internal function for function harvest.

**_Arguments_**

============ ========= =========================================
Name         Type      Description
============ ========= =========================================
amount       uint256   amount to an ERC20 token to be harvested
tokenAddress address   address of an ERC20 token to be harvested
============ ========= =========================================

**_addTokenCollateral**

.. code-block:: Solidity

  function _addTokenCollateral(uint256 tokenId, uint256 amount, address tokenAddress, bool claim) private

_addTokenCollateral function is an internal function for function ``collateralize``.

**_Arguments_**

============ ========= ==================================================================================
Name         Type      Description
============ ========= ==================================================================================
tokenId      uint256   unique token identifier
amount       uint256   amount to be added to the collateral
tokenAddress address   address of an ERC20 token to be added to the collateral
claim        bool      true for bond collateral redemption and false for common collateralization process
============ ========= ==================================================================================

**_removeTokenCollateral**

.. code-block:: Solidity

  function _removeTokenCollateral(uint256 tokenId, uint256 amount, address tokenAddress) private

_removeTokenCollateral function is an internal function for function ``uncollateralize``.

**_Arguments_**

============ ========= ============================================================
Name         Type      Description
============ ========= ============================================================
tokenId      uint256   unique token identifier
amount       uint256   amount to be redeemed from the collateral
tokenAddress address   address of an ERC20 token to be redeemed from the collateral
============ ========= ============================================================

**_disperseTokenCollateral**

.. code-block:: Solidity

  function _disperseTokenCollateral(uint256 amount, address tokenAddress) private

_disperseTokenCollateral function is an internal function for function ``disperse``.

**_Arguments_**

============ ========= =========================================
Name         Type      Description
============ ========= =========================================
amount       uint256   amount to an ERC20 token to be dispersed
tokenAddress address   address of an ERC20 token to be dispersed
============ ========= =========================================

**_checkValidity**

.. code-block:: Solidity

  function _checkValidity(address tokenAddress) private view

_checkValidity function determines whether a given address represents a valid ERC20 token by invoking the `decimals` function. 

**_Arguments_**

============ ========= ==================================
Name         Type      Description
============ ========= ==================================
tokenAddress address   address of any ERC20 token
============ ========= ==================================

**_communityCommission**

.. code-block:: Solidity

  function _communityCommission(uint256 amount, uint256 percentage, address tokenAddress) private returns (uint256)

_communityCommission computes the amount remaining after deducting the commission.

_communityCommission function returns amount after commission based on the ``amount`` before commission, commission ``percentage`` charged, and ``tokenAddress``.

**_Arguments_**

============ ========= ===================================
Name         Type      Description
============ ========= ===================================
amount       uint256   amount before commission is charged
percentage   uint256   commission fee rate
tokenAddress address   address of an ERC20 token
============ ========= ===================================

**_disperse**

.. code-block:: Solidity

  function _disperse(address collection, address tokenAddress, uint256 tokenId) private

_disperse function enables input of a dispersion value, which is then used to increase the ``collateralBalances`` of a particular ``tokenAddress`` for the corresponding ``tokenId``.

.. hint::

  _disperse function is required to be implemented by the collection creator.

**_Arguments_**

============ ========= =========================================
Name         Type      Description
============ ========= =========================================
collection   address   NFT collection address
tokenAddress address   address of an ERC20 token to be dispersed
tokenId      uint256   unique token identifier
============ ========= =========================================

**_changeCommunityAddresses**

.. code-block:: Solidity

  function _changeCommunityAddresses(address newTokenAddress, address newBlackHole) internal virtual

_changeCommunityAddresses function enables to change the address of the ``communityToken`` and the ``blackHole``.

**_Arguments_**

=============== ========= ==========================================
Name            Type      Description
=============== ========= ==========================================
newTokenAddress address   new address of an ERC20 ``communityToken``
newBlackHole    address   new address of a ``blackHole``
=============== ========= ==========================================

**_changeGhostAddresses**

.. code-block:: Solidity

  function _changeGhostAddresses(address newGhostTokenAddress, address newGhostBondingAddress) internal virtual

_changeGhostAddresses function enables to change the address of the ``ghostAddress`` and the ``ghostBondingAddress``.

**_Arguments_**

====================== ========= ========================================
Name                   Type      Description
====================== ========= ========================================
newGhostTokenAddress   address   new address of a ``ghostAddress``
newGhostBondingAddress address   new address of a ``ghostBondingAddress``
====================== ========= ========================================
