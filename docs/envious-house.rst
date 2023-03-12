.. _envious-house:

#####################
EnviousHouse Contract
#####################

***********
Description
***********

EnviousHouse smart contract serves as a middleware between standard ERC721 and `ERC721Envious <envious-extension.html>`_ NFT collections.

By integrating EnviousHouse, standard ERC721 collections can become Envious without needing to redeploy their smart contracts. EnviousHouse mirrors the ERC721Envious standard and serves as storage for tokens and native coins. On the other hand, `ERC721Envious <envious-extension.html>`_ collections already have all the necessary Envious functionality, and EnviousHouse simply routes the calls.

.. hint::
    Any user has the ability to ``rescue`` unregistered collections by either adding collateral (``collateralize``) to an individual NFT or executing a ``disperse`` on the entire collection. ``Rescued`` collections have their commission fees set to 0 by default.

.. warning::
  ``Commissions`` and ``communityToken`` cannot be modified after the standard ERC721 collection has been registered at ``EnviousHouse``.

The GHOST team believes in the principles of decentralization and web3, and therefore, we do not grant or maintain any admin rights over the current contract. The first user to register a collection will have an opportunity to irreversibly set the ``communityToken``.

The GHOST team strongly encourages all users to act in good faith and share ``communityToken`` and/or harvested ``commissions`` with the collection creators and community.

.. hint::

  The first user to register a collection will have the ability to set the rate for ``commissions`` and ``communityToken``. To prevent spam registrations, the registrant is required to make an initial contribution of the minimum dispersion in the native coin to all NFT holders. The minimum required ``disperse`` amount was set to approximately $69.00 on all networks at the time of deployment.

*************
IEnviousHouse
*************

**totalCollections**

.. code-block:: Solidity

  function totalCollections() external view returns (uint256)

totalCollections represents the total number of registered collections.

totalCollections function returns the total count of registered collections.

**ghostAddress**

.. code-block:: Solidity

  function ghostAddress(address collection) external view returns (address)

ghostAddress function returns the token address for bond payouts. Following the launch of ghostDAO, ghostAddress will be set to the ``tokenAddress`` of the GHST token.

**_Arguments_**

============ ======= =========================
Name         Type    Description
============ ======= =========================
collection   address NFT collection address
============ ======= =========================

**ghostBondingAddress**

.. code-block:: Solidity

  function ghostBondingAddress(address collection) external view returns (address)

ghostBondingAddress function returns the smart contract address that facilitates the purchase of bonds using the DeFi 2.0 protocol. Following the launch of ghostDAO, ghostBondingAddress will be set to the bonding smart contract address of ghostDAO.

**_Arguments_**

============ ======= =========================
Name         Type    Description
============ ======= =========================
collection   address NFT collection address
============ ======= =========================

**blackHole**

.. code-block:: Solidity

  function blackHole(address collection) external view returns (address)

``blackHole`` is an address that ensures any tokens sent to it cannot be retrieved.

blackHole function returns the address of the ``blackHole``.

**_Arguments_**

============ ======= =========================
Name         Type    Description
============ ======= =========================
collection   address NFT collection address
============ ======= =========================

**collections**

.. code-block:: Solidity

  function collections(uint256 index) external view returns (address)

collections is a getter function for registered collection addresses based on the collection ``index``.

collections function returns the collection address based on the collection ``index`` input.

**_Arguments_**

============ ======= =============================
Name         Type    Description
============ ======= =============================
index        uint256 index in array of collections
============ ======= =============================

**collectionIds**

.. code-block:: Solidity

  function collectionIds(address collection) external view returns (uint256)

collectionIds is a getter function for collection index based on the registered collection address.

collectionIds function returns the collection index based on the collection address input.

**_Arguments_**

============ ======= =========================
Name         Type    Description
============ ======= =========================
collection   address NFT collection address
============ ======= =========================

**specificCollections**

.. code-block:: Solidity

  function specificCollections(address collection) external view returns (bool)

specificCollections is a getter function for collections that do not follow the ERC721 standard. 

specificCollections function returns whether a particular collection follows the ERC721 standard or not. 

**_Arguments_**

============ ======= =========================
Name         Type    Description
============ ======= =========================
collection   address NFT collection address
============ ======= =========================

**commissions**

.. code-block:: Solidity

  function commissions(address collection, uint256 index) external view returns (uint256)

commissions are defined by an array with two elements as input, each representing a commission percentage charged on collateral. The first element denotes the commission charged for collateralization, while the second element represents the commission for uncollateralization. It is important to note that a 3 decimal buffer should be added to each commission rate. For example, 1% would be represented as 1000.

commissions function returns the value of the respective commission fee.

**_Arguments_**

========== ======= =======================
Name       Type    Description
========== ======= =======================
collection address NFT collection address
index      uint256 index of value in array
========== ======= =======================

**communityToken**

.. code-block:: Solidity

  function communityToken(address collection) external view returns (address)

``communityToken`` is an ERC20 token set by the collection registrant. communityToken can be exchanged to harvest accumulated commissions.

communityToken function returns the address of the communityToken.

**_Arguments_**

============ ======= =========================
Name         Type    Description
============ ======= =========================
collection   address NFT collection address
============ ======= =========================

**communityPool**

.. code-block:: Solidity

  function communityPool(address collection, uint256 index) external view returns (address)

communityPool is an array of ERC20 tokens that can be harvested by ``communityToken`` holders.

communityPool function returns the address of a specific ERC20 token available for harvesting by ``communityToken`` holders.

**_Arguments_**

========== ======= =======================
Name       Type    Description
========== ======= =======================
collection address NFT collection address
index      uint256 index of value in array
========== ======= =======================

**communityBalance**

.. code-block:: Solidity

  function communityBalance(address collection, address tokenAddress) external view returns (uint256)

communityBalance is the amount of ERC20 token available for harvesting.

communityBalance function returns the total balance of a specified ERC20 token that has been accumulated from collected commissions and is currently available for harvesting. 

**_Arguments_**

============ ======= ===========================================
Name         Type    Description
============ ======= ===========================================
collection   address NFT collection address
tokenAddress address address of a token available for harvesting
============ ======= ===========================================

**disperseTokens**

.. code-block:: Solidity

  function disperseTokens(address collection, uint256 index) external view returns (address)

disperseTokens is an array of ERC20 tokens that have already been dispersed.

disperseTokens function returns the address of a specific ERC20 token that has been dispersed.

**_Arguments_**

========== ======= =======================
Name       Type    Description
========== ======= =======================
collection address NFT collection address
index      uint256 index of value in array
========== ======= =======================

**disperseBalance**

.. code-block:: Solidity

  function disperseBalance(address collection, address tokenAddress) external view returns (uint256)

disperseBalance is the total amount of ERC20 tokens that have been distributed to all ``tokenIds`` within a particular NFT collection.

disperseBalance function returns the total amount of a particular ERC20 token that has been dispersed to all tokenIds within a particular NFT collection.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
collection   address NFT collection address
tokenAddress address address of a dispersed ERC20 token
============ ======= ==================================

**disperseTotalTaken**

.. code-block:: Solidity

  function disperseTotalTaken(address collection, address tokenAddress) external view returns (uint256)

disperseTotalTaken is the quantity of ERC20 tokens that has been already claimed from the ``disperseBalance``.

disperseBalance function returns the number of dispersed ERC20 tokens of a specific ``tokenAddress`` from the ``disperseBalance``.

**_Arguments_**

============ ======= =======================
Name         Type    Description
============ ======= =======================
collection   address NFT collection address
tokenAddress address address of token
============ ======= =======================

**disperseTaken**

.. code-block:: Solidity

  function disperseTaken(address collection, uint256 tokenId, address tokenAddress) external view returns (uint256)

disperseTaken is the quantity of ERC20 tokens that has been already claimed from the ``disperseBalance``, specifically in reference to a particular tokenId.

disperseTaken function returns the quantity of a specific ERC20 token that has been distributed from the ``disperseBalance`` to a particular ``tokenId``.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
collection   address NFT collection address
tokenId      uint256 unique token identifier
tokenAddress address address of a dispersed ERC20 token
============ ======= ==================================

**bondPayouts**

.. code-block:: Solidity

  function bondPayouts(address collection, uint256 bondId) external view returns (uint256)

bondPayouts is an estimated quantity of the ``ghostAddress`` token to be obtained from the bond upon completion of the vesting period.

bondPayouts function returns the approximate payout quantity of the ghostAddress token to be obtained from a particular ``bondId`` after the vesting period is over.

**_Arguments_**

============ ======= ======================
Name         Type    Description
============ ======= ======================
collection   address NFT collection address
bondId       uint256 unique bond identifier
============ ======= ======================

**bondIndexes**

.. code-block:: Solidity

  function bondIndexes(address collection, uint256 tokenId, uint256 index) external view returns (uint256)

bondIndexes is a mapping that associates each ``tokenId`` from a particular NFT collection with an array of bonds. 

bondIndexes function returns the ``index`` of a bond based on ``collection address``, ``tokenId``, and chronological ``index`` position.

**_Arguments_**

============ ======= =======================
Name         Type    Description
============ ======= =======================
collection   address NFT collection address
tokenId      uint256 unique token identifier
index        uint256 index in array
============ ======= =======================

**collateralTokens**

.. code-block:: Solidity

  function collateralTokens(address collection, uint256 tokenId, uint256 index) external view returns (address)

collateralTokens represents ERC20 tokens used as a collateral for a particular NFT.

collateralTokens function returns the address of an ERC20 token used as a collateral for a particular ``tokenId``, determined by its chronological ``index`` position.

**_Arguments_**

============ ======= =======================
Name         Type    Description
============ ======= =======================
collection   address NFT collection address
tokenId      uint256 unique token identifier
index        uint256 index in array
============ ======= =======================

**collateralBalances**

.. code-block:: Solidity

  function collateralBalances(address collection, uint256 tokenId, address tokenAddress) external view returns (uint256)

collateralBalances reflects the total quantity of ERC20 tokens that are currently being held as collateral for a particular ``tokenId``.

collateralBalances function returns the quantity of ERC20 tokens held as collateral for a specific ``tokenId``, based on the provided ``tokenAddress``.

**_Arguments_**

============ ======= ==================================================
Name         Type    Description
============ ======= ==================================================
collection   address NFT collection address
tokenId      uint256 unique token identifier
tokenAddress address address of an ERC20 token being held as collateral
============ ======= ==================================================

**getAmount**

.. code-block:: Solidity

  function getAmount(address collection, uint256 amount, address tokenAddress) external view returns (uint256)

getAmount is a calculator for estimating the ``harvesting`` amount.

getAmount function returns the ``harvesting`` amount for a specific ERC20 token based on the amount of ``communityToken`` to be exchanged.

**_Arguments_**

============ ======= ===================================
Name         Type    Description
============ ======= ===================================
collection   address NFT collection address
amount       uint256 amount of ``communityToken``
tokenAddress address address of an ERC20 harvested token
============ ======= ===================================

**setGhostAddresses**

.. code-block:: Solidity

  function setGhostAddresses(address ghostToken, address ghostBonding) external

setGhostAddress function enables the feature of bonding, representing the ability to add discounted collateral.

**_Arguments_**

============ ======= =======================================
Name         Type    Description
============ ======= =======================================
ghostToken   address address of a non-rebasing bonding token
ghostBonding address address of a bonding smart contract
============ ======= =======================================

**setSpecificCollection**

.. code-block:: Solidity

  function setSpecificCollection(address collection) external

setSpecificCollection function enables the addition of any collection that is not compatible with the ERC721 standard to the list of exceptions.

**_Arguments_**

============ ======= ============================
Name         Type    Description
============ ======= ============================
collection   address NFT collection address
============ ======= ============================

**registerCollection**

.. code-block:: Solidity

  function registerCollection(address collection, address token, uint256 incoming, uint256 outcoming) external payable

registerCollection function grants Envious functionality to any ERC721-compatible collection and streamlines the distribution of an initial minimum disbursement to all NFT holders.

**_Arguments_**

============ ======= ================================================
Name         Type    Description
============ ======= ================================================
collection   address NFT collection address
token        address address of an ERC20 ``communityToken``
incoming     uint256 collateralization fee, `incoming / 1e5 * 100%`
outcoming    uint256 uncollateralization fee, `incoming / 1e5 * 100%`
============ ======= ================================================

**harvest**

.. code-block:: Solidity

  function harvest(address collection, uint256[] memory amounts, address[] memory tokenAddresses) external

harvest function collects commission fees in exchange for ``communityToken``.

**_Arguments_**

============== ========= ========================================
Name           Type      Description
============== ========= ========================================
collection     address   NFT collection address
amounts        uint256[] array of amounts to be harvested
tokenAddresses address[] array of token addresses to be harvested
============== ========= ========================================

**collateralize**

.. code-block:: Solidity

  function collateralize(address collection, uint256 tokenId, uint256[] memory amounts, address[] memory tokenAddresses) external payable

collateralize function facilitates the collateralization of a specific ``tokenId`` using a specified amount of a designated ERC20 token.

**_Arguments_**

============== ========= ======================================================
Name           Type      Description
============== ========= ======================================================
collection     address   NFT collection address
tokenId        uint256   unique token identifier
amounts        uint256[] array of amounts to be added to the collateral
tokenAddresses address[] array of token addresses to be added to the collateral
============== ========= ======================================================

**uncollateralize**

.. code-block:: Solidity

  function uncollateralize(address collection, uint256 tokenId, uint256[] memory amounts, address[] memory tokenAddresses) external

uncollateralize function facilitates the redemption of a specific ``tokenId`` using a specified amount of a designated ERC20 token.

.. hint::
  Only the owner of the tokenId is able to trigger the uncollateralize function.

**_Arguments_**

============== ========= ===========================================================
Name           Type      Description
============== ========= ===========================================================
collection     address   NFT collection address
tokenId        uint256   unique token identifier
amounts        uint256[] array of amounts to be redeemed from the collateral
tokenAddresses address[] array of token addresses to be redeemed from the collateral
============== ========= ===========================================================

**getDiscountedCollateral**

.. code-block:: Solidity

  function getDiscountedCollateral(address collection, uint256 bondId, address quoteToken, uint256 tokenId, uint256 amount, uint256 maxPrice) external

getDiscountedCollateral function enables NFT collateralization with a discount determined by the available bonds. The smart contract acts as the temporary owner of the bond during the bond vesting period.

**_Arguments_**

============== ========= =============================================================
Name           Type      Description
============== ========= =============================================================
collection     address   NFT collection address
bondId         uint256   unique bond identifier
quoteToken     address   address of the token that is accepted as a payment for a bond
tokenId        uint256   unique token identifier
amount         uint256   quantity of the quoteToken paid for the bond
maxPrice       uint256   maximum price allowed to pay for the bond
============== ========= =============================================================

**claimDiscountedCollateral**

.. code-block:: Solidity

  function claimDiscountedCollateral(address collection, uint256 tokenId, uint256[] memory indexes) external

claimDiscountedCollateral function allows for the redemption of the corresponding bond notes for ghostAddress collateral after the bond vesting period has elapsed.

**_Arguments_**

============== ========= ==================================
Name           Type      Description
============== ========= ==================================
collection     address   NFT collection address
tokenId        uint256   unique token identifier
indexes        uint256[] array of note indexes to redeem
============== ========= ==================================

**disperse**

.. code-block:: Solidity

  function disperse(address collection, uint256[] memory amounts, address[] memory tokenAddresses) external payable

disperse function logs the amounts of ``tokenAddresses`` into ``disperseBalance``.

**_Arguments_**

============== ========= ========================================
Name           Type      Description
============== ========= ========================================
collection     address   NFT collection address
amounts        uint256[] array of amounts to be dispersed
tokenAddresses address[] array of token addresses to be dispersed
============== ========= ========================================

**event Collateralized**

event Collateralized is triggered every time a collateral transaction occurs on-chain.

**_Arguments_**

============ ======= =======================================================
Name         Type    Description
============ ======= =======================================================
collection   address NFT collection address
tokenId      uint256 unique token identifier
amount       uint256 amount to be added to the collateral
tokenAddress address address of an ERC20 token to be added to the collateral
============ ======= =======================================================

**event Uncollateralized**

event Uncollateralized is triggered every time an uncollateral transaction occurs on-chain.

**_Arguments_**

============ ======= ============================================================
Name         Type    Description
============ ======= ============================================================
collection   address NFT collection address
tokenId      uint256 unique token identifier
amount       uint256 amount to be redeemed from the collateral
tokenAddress address address of an ERC20 token to be redeemed from the collateral
============ ======= ============================================================

**event Dispersed**

event Dispersed is triggered every time a disperse transaction occurs on-chain.

**_Arguments_**

============ ======= =========================================
Name         Type    Description
============ ======= =========================================
collection   address NFT collection address
amount       uint256 amount to be dispersed
tokenAddress address address of an ERC20 token to be dispersed
============ ======= =========================================

**event Harvested**

event Harvested is triggered every time a harvest transaction occurs on-chain.

**_Arguments_**

============ ======= ==========================================================
Name         Type    Description
============ ======= ==========================================================
collection   address NFT collection address
tokenAddress address address of an ERC20 token to be harvested
amount       uint256 amount to be harvested
scaledAmount uint256 amount of ``communityToken`` exchanged for commission fees
============ ======= ==========================================================

************
EnviousHouse
************

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

  function _scaledAmount(address collection, address tokenAddress) private view returns (uint256)

_scaledAmount function adjusts the decimal alignment of tokens collected in ``communityBalance`` to match the decimal places of a ``communityToken``.

**_Arguments_**

============ ========= =========================================
Name         Type      Description
============ ========= =========================================
collection   address   NFT collection address
tokenAddress address   address of an ERC20 token to be harvested
============ ========= =========================================

**_harvest**

.. code-block:: Solidity

  function _harvest(address collection, uint256 amount, address tokenAddress) private

_harvest function is an internal function for function harvest.

**_Arguments_**

============ ========= =========================================
Name         Type      Description
============ ========= =========================================
collection   address   NFT collection address
amount       uint256   amount to an ERC20  token to be harvested
tokenAddress address   address of an ERC20 token to be harvested
============ ========= =========================================

**_addTokenCollateral**

.. code-block:: Solidity

  function _addTokenCollateral(address collection, uint256 tokenId, uint256 amount, address tokenAddress, bool claim) private

_addTokenCollateral function is an internal function for function ``collateralize``.

**_Arguments_**

============ ========= ==================================================================================
Name         Type      Description
============ ========= ==================================================================================
collection   address   NFT collection address
tokenId      uint256   unique token identifier
amount       uint256   amount to be added to the collateral
tokenAddress address   address of an ERC20 token to be added to the collateral
claim        bool      true for bond collateral redemption and false for common collateralization process
============ ========= ==================================================================================

**_removeTokenCollateral**

.. code-block:: Solidity

  function _removeTokenCollateral(address collection, uint256 tokenId, uint256 amount, address tokenAddress) private

_removeTokenCollateral function is an internal function for function ``uncollateralize``.

**_Arguments_**

============ ========= ============================================================
Name         Type      Description
============ ========= ============================================================
collection   address   NFT collection address
tokenId      uint256   unique token identifier
amount       uint256   amount to be redeemed from the collateral
tokenAddress address   address of an ERC20 token to be redeemed from the collateral
============ ========= ============================================================

**_disperseTokenCollateral**

.. code-block:: Solidity

  function _disperseTokenCollateral(address collection, uint256 amount, address tokenAddress) private

_disperseTokenCollateral function is an internal function for ``function disperse``.

**_Arguments_**

============ ========= =========================================
Name         Type      Description
============ ========= =========================================
collection   address   NFT collection address
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

  function _communityCommission(address collection, uint256 amount, uint256 percentage, address tokenAddress) private returns (uint256)

_communityCommission computes the amount remaining after deducting the commission.

_communityCommission function returns amount after commission based on the ``amount`` before commission, commission ``percentage`` charged, and ``tokenAddress``.

**_Arguments_**

============ ========= ===================================
Name         Type      Description
============ ========= ===================================
collection   address   NFT collection address
amount       uint256   amount before commission is charged
percentage   uint256   commission fee rate
tokenAddress address   address of an ERC20 token
============ ========= ===================================

**_disperse**

.. code-block:: Solidity

  function _disperse(address collection, address tokenAddress, uint256 tokenId) private

_disperse function enables input of a dispersion value, which is then used to increase the ``collateralBalances`` of a particular ``tokenAddress`` for the corresponding ``tokenId``.

**_Arguments_**

============ ========= =========================================
Name         Type      Description
============ ========= =========================================
collection   address   NFT collection address
tokenAddress address   address of an ERC20 token to be dispersed
tokenId      uint256   unique token identifier
============ ========= =========================================

**_rescueCollection**

.. code-block:: Solidity

  function _rescueCollection(address collection) private

_rescueCollection function sets the ``commissions`` to 0% permanently after an individual NFT from an unregistered collection is collateralized.

**_Arguments_**

============ ========= ==================================
Name         Type      Description
============ ========= ==================================
collection   address   NFT collection address
============ ========= ==================================

**_checkEnvious**

.. code-block:: Solidity

  function _checkEnvious(address collection) private view

_checkEnvious function determines whether a particular address supports IERC721Envious functionality.

**_Arguments_**

============ ========= ==================================
Name         Type      Description
============ ========= ==================================
collection   address   NFT collection address
============ ========= ==================================

**********
Gas Report
**********

The complete test results can be found in the ``./gas reporter/EnviousHouse.txt`` file. The actual tests are available in the ``./tests/EnviousHouse.test.js`` file.

.. code-block:: bash

  ·-----------------------------------------------------|---------------------------|--------------|----------------------------·
  |         Solc version: 0.8.4+commit.c7e474f2         ·  Optimizer enabled: true  ·  Runs: 1337  ·  Block limit: 6718946 gas  │
  ······················································|···························|··············|·····························
  |  Methods                                                                                                                    │
  ························|·····························|·············|·············|··············|··············|··············
  |  Contract             ·  Method                     ·  Min        ·  Max        ·  Avg         ·  # calls     ·  eur (avg)  │
  ························|·····························|·············|·············|··············|··············|··············
  |  BaseToken            ·  approve                    ·      46220  ·      46244  ·       46232  ·         127  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  BaseToken            ·  mint                       ·          -  ·          -  ·       68285  ·          72  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  EnviousHouse         ·  claimDiscountedCollateral  ·          -  ·          -  ·      180886  ·           2  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  EnviousHouse         ·  collateralize              ·     157311  ·     328704  ·      189772  ·          42  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  EnviousHouse         ·  disperse                   ·      42280  ·     131304  ·      108063  ·          10  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  EnviousHouse         ·  getDiscountedCollateral    ·     206118  ·     206130  ·      206128  ·           6  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  EnviousHouse         ·  harvest                    ·     115467  ·     134801  ·      122870  ·           8  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  EnviousHouse         ·  registerCollection         ·      80192  ·     213650  ·      128844  ·         116  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  EnviousHouse         ·  setGhostAddresses          ·      68807  ·      68819  ·       68818  ·          11  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  EnviousHouse         ·  uncollateralize            ·     153272  ·     269507  ·      188441  ·           8  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousPreset  ·  claimDiscountedCollateral  ·          -  ·          -  ·      171087  ·           1  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousPreset  ·  collateralize              ·     144540  ·     149340  ·      145189  ·          15  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousPreset  ·  disperse                   ·          -  ·          -  ·      130087  ·           2  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousPreset  ·  getDiscountedCollateral    ·     183430  ·     201799  ·      189558  ·           6  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousPreset  ·  mint                       ·          -  ·          -  ·      167530  ·          59  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousPreset  ·  setGhostAddresses          ·      69177  ·      69189  ·       69188  ·          12  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousPreset  ·  uncollateralize            ·          -  ·          -  ·       76840  ·           2  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  ERC721Mock           ·  mint                       ·          -  ·          -  ·       91012  ·          66  ·          -  │
  ························|·····························|·············|·············|··············|··············|··············
  |  Deployments                                        ·                                          ·  % of limit  ·             │
  ······················································|·············|·············|··············|··············|··············
  |  BaseToken                                          ·     775391  ·     775451  ·      775414  ·      11.5 %  ·          -  │
  ······················································|·············|·············|··············|··············|··············
  |  BlackHole                                          ·     321380  ·     321452  ·      321416  ·       4.8 %  ·          -  │
  ······················································|·············|·············|··············|··············|··············
  |  BondingMock                                        ·    1114846  ·    1114870  ·     1114868  ·      16.6 %  ·          -  │
  ······················································|·············|·············|··············|··············|··············
  |  EnviousHouse                                       ·    4266540  ·    4266552  ·     4266551  ·      63.5 %  ·          -  │
  ······················································|·············|·············|··············|··············|··············
  |  ERC721EnviousPreset                                ·          -  ·          -  ·     5433128  ·      80.9 %  ·          -  │
  ······················································|·············|·············|··············|··············|··············
  |  ERC721Mock                                         ·    1477822  ·    1477834  ·     1477827  ·        22 %  ·          -  │
  ·-----------------------------------------------------|-------------|-------------|--------------|--------------|-------------·
