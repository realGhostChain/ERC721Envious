.. _vrf-preset:

######################
VRF Envious Preset
######################

***********
Description
***********

The Chainlink VRF (Verifiable Random Function) is a secure and trustworthy method of generating random numbers that enables smart contracts to access unpredictable values while maintaining the integrity and usability of the system. Upon receiving a request, the Chainlink VRF produces one or multiple random values, along with cryptographic evidence of how these values were generated. The evidence is then recorded on the blockchain and validated before being available for consumption by applications. This approach guarantees that the outcomes cannot be altered or controlled by any single party, including oracle operators, miners, users, or smart contract developers. For further details, please refer to the ChainLink documentation <https://docs.chain.link/vrf/v2/introduction/>`_.

The Envious standard offers a variety of functions, but in certain circumstances, they may not suffice. Consider a gaming NFT platform that requires a reward system that ``disperses`` a particular amount of specific ``tokenIds`` chosen at random. In such situations, the VRF Envious Preset is an exceptional solution.

***********************
IERC721EnviousVrfPreset
***********************

**vrfCoordinatorAddress**

.. code-block:: Solidity

  function vrfCoordinatorAddress() external view returns (address)

vrfCoordinatorAddress function is the coordinator address, which is unique and immutable for each network. Read more `here <https://docs.chain.link/docs/vrf-contracts/#configurations>`_. 

**sSubscriptionId**

.. code-block:: Solidity

  function sSubscriptionId() external view returns (uint64)

sSubscriptionId function returns the ChainLink VRF v2 subscription ID.

**sKeyHash**

.. code-block:: Solidity

  function sKeyHash() external view returns (bytes32)

sKeyHash function returns the gas lane that determines the upper limit for gas prices that can be increased. To view the available gas lanes for each network, please refer to the following link.

**callbackGasLimit**

.. code-block:: Solidity

  function callbackGasLimit() external view returns (uint32)

callbackGasLimit function depends on the number of requested values to be forwarded to the ``fulfillRandomWords()`` function. Since storing each word requires about 20,000 gas, a safe default value for this example contract is 40,000 gas. However, it is recommended to test and adjust this limit based on the selected network, the request's size, and the processing of the callback request in the ``fulfillRandomWords()`` function.

**numWords**

.. code-block:: Solidity

  function numWords() external view returns (uint32)

numWords function returns the word count. It should be noted that numWords cannot exceed the value defined in ``VRFCoordinatorV2.MAX_NUM_WORDS``.

**requestConfirmations**

.. code-block:: Solidity

  function requestConfirmations() external view returns (uint16)

requestConfirmations function returns the required number of block confirmations, with a default value of 3 confirmations.

**prepareRandomness**

.. code-block:: Solidity

  function prepareRandomness() external returns (uint256)

prepareRandomness function returns on-chain randomness from Chainlink VRF v2.

**extraDisperseAmount**

.. code-block:: Solidity

  function extraDisperseAmount(address tokenAddress) external view returns (uint256)

extraDisperseAmount is an extra quantity of a particular ``tokenAddress`` to be randomly distributed.

extraDisperseAmount function returns the additional quantity of a specific ``tokenAddress`` to be randomly dispersed.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
tokenAddress address address of a dispersed ERC20 token
============ ======= ==================================

**extraDisperseTaken**

.. code-block:: Solidity

  function extraDisperseTaken(address tokenAddress) external view returns (uint256)

extraDisperseTaken is a quantity of an ERC20 token that has been already claimed from the ``extraDisperseAmount``.

extraDisperseTaken function returns the amount of a specific ``tokenAddress`` that has been distributed from the ``extraDisperseAmount``.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
tokenAddress address address of a dispersed ERC20 token
============ ======= ==================================

**extraDisperseTokenId**

.. code-block:: Solidity

  function extraDisperseTokenId(address tokenAddress) external view returns (uint256)

extraDisperseTokenId function selects all ``tokenIds`` that are divisible by a specified number, without leaving a remainder, for random distribution.

extraDisperseTokenId function returns divisor used to determine which ``tokenIds`` are eligible for random distribution.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
tokenAddress address address of a dispersed ERC20 token
============ ======= ==================================

**randomAmountsDisperse**

.. code-block:: Solidity

  function randomAmountsDisperse(address tokenAddress, uint256 tokenId) external view returns(uint256)

randomAmountsDisperse generates an additional random amount of tokens to be distributed.

randomAmountsDisperse returns an additional random quantity of tokens for distribution.

**_Arguments_**

============ ======= ==================================
Name         Type    Description
============ ======= ==================================
tokenAddress address address of a dispersed ERC20 token
tokenId      uint256 unique token identifier
============ ======= ==================================

**collateralRandomTokens**

.. code-block:: Solidity

  function collateralRandomTokens(uint256[] memory amounts, address[] memory tokenAddresses) external payable;

collateralRandomTokens function collateralizes randomly selected ``tokenIds`` with predetermined amount of ``tokenAddresses``.

**_Arguments_**

============== ========= ======================================================
Name           Type      Description
============== ========= ======================================================
amounts        uint256[] array of amounts to be added to the collateral
tokenAddresses address[] array of token addresses to be added to the collateral
============== ========= ======================================================

**collateralRandomAmounts**

.. code-block:: Solidity

  function collateralRandomAmounts(uint256[] memory tokenIds, uint256 amount, address tokenAddress) external payable

collateralRandomAmounts function collateralizes specific ``tokenIds`` with randomly generated ``amounts``.

.. warning::

  If ETH is used, the amount of collateral required should match the value of the ``msg.value`` parameter.


**_Arguments_**

============== ========= ======================================================
Name           Type      Description
============== ========= ======================================================
tokenIds       uint256[] unique token identifiers
amounts        uint256[] array of amounts to be added to the collateral
tokenAddresses address[] array of token addresses to be added to the collateral
============== ========= ======================================================

**function initializeVRF**

.. code-block:: Solidity

  function initializeVRF(uint64 newSSubscriptionId, bytes32 newSKeyHash, uint32 newNumWords, uint32 newCallbackGasLimit, uint16 newRequestConfirmations) external

initializeVRF function is used to initialize all the necessary information related to ChainlinkVRF.

**_Arguments_**

======================= ========= ==================================================================
Name                    Type      Description
======================= ========= ==================================================================
newSSubscriptionId      uint64    Chainlink subscription id
newSKeyHash             bytes32   gas lane used to specify the maximum gas price to increase to
newNumWords             uint32    number of random values to retrieve
newCallbackGasLimit     uint32    required gas limit for the fulfillRandomWords() function
newRequestConfirmations uint16    number of confirmations required
======================= ========= ==================================================================

**event VrfChanged**

.. code-block:: Solidity

  event VrfChanged(uint64 newSSubscriptionId, bytes32 newSKeyHash, uint32 newNumWords, uint32 newCallbackGasLimit, uint16 newRequestConfirmations);

event vrfChanged is triggered after the parameters related to Chainlink VRF v2 have been changed.

**_Arguments_**

======================= ========= ==================================================================
Name                    Type      Description
======================= ========= ==================================================================
newSSubscriptionId      uint64    Chainlink subscription id
newSKeyHash             bytes32   gas lane used to specify the maximum gas price to increase to
newNumWords             uint32    number of random values to retrieve
newCallbackGasLimit     uint32    required gas limit for the fulfillRandomWords() function
newRequestConfirmations uint16    number of confirmations required
======================= ========= ==================================================================

**********************
ERC721EnviousVrfPreset
**********************

**baseURI**

.. code-block:: Solidity

  function baseURI() external view virtual returns (string memory)

baseURI is a getter function for the baseURI.

baseURI function returns baseURI for the entire collection.

**tokenURI**

.. code-block:: Solidity

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory)

tokenURI is a getter function for a particular tokenURI.

tokenURI function returns tokenURI for a specific NFT.

**_Arguments_**

======= ======= =======================
Name    Type    Description
======= ======= =======================
tokenId uint256 unique token identifier
======= ======= =======================

**totalSupply**

.. code-block:: Solidity

  function totalSupply() public view virtual returns (uint256)

totalSupply is a getter function for the total count of NFTs in the collection.

totalSupply function returns the overall count of NFTs within the collection.

**setGhostAddresses**

.. code-block:: Solidity

  function setGhostAddresses(address ghostToken, address ghostBonding) public virtual

setGhostAddress function enables the feature of bonding, representing the ability to add discounted collateral.

**_Arguments_**

============ ======== =======================================
Name         Type     Description
============ ======== =======================================
ghostToken   address  address of a non-rebasing bonding token
ghostBonding address  address of a bonding smart contract
============ ======== =======================================

**changeCommunityAddresses**

.. code-block:: Solidity

  function changeCommunityAddresses(address newTokenAddress, address newBlackHole) public virtual

changeCommunityAddresses function enables to change the address of the ``communityToken`` and the ``blackHole``.

**_Arguments_**

=============== ======= ======================================
Name            Type    Description
=============== ======= ======================================
newTokenAddress address new address of an ERC20 communityToken
newBlackHole    address new address of a blackHole
=============== ======= ======================================

**_nullifyRandomness**

.. code-block:: Solidity

  function _nullifyRandomness(address who) internal virtual

_nullifyRandomness function invalidates mappings after their use.

**_Arguments_**

=============== ======= ===================================
Name            Type    Description
=============== ======= ===================================
who             address address that requires nullification
=============== ======= ===================================

***********
Gas  Report
***********

The complete test results can be found in the ``./gas reporter/ERC721VRFRoyaltyPreset.txt`` file. The actual tests are available in the ``./tests/ERC721VRFRoyaltyPreset.test.js`` file.

.. code-block:: bash

  ·--------------------------------------------------------|---------------------------|--------------|----------------------------·
  |          Solc version: 0.8.4+commit.c7e474f2           ·  Optimizer enabled: true  ·  Runs: 1337  ·  Block limit: 6718946 gas  │
  ·························································|···························|··············|·····························
  |  Methods                                                                                                                       │
  ···························|·····························|·············|·············|··············|··············|··············
  |  Contract                ·  Method                     ·  Min        ·  Max        ·  Avg         ·  # calls     ·  eur (avg)  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  BadToken                ·  approve                    ·      46201  ·      46213  ·       46211  ·          25  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  BadToken                ·  mint                       ·          -  ·          -  ·       70691  ·          15  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  BaseToken               ·  approve                    ·      29180  ·      46244  ·       46094  ·         115  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  BaseToken               ·  burn                       ·          -  ·          -  ·       26889  ·           1  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  BaseToken               ·  mint                       ·      51185  ·      68321  ·       68000  ·         120  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  BaseToken               ·  transfer                   ·          -  ·          -  ·       46608  ·           1  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  DAI                     ·  approve                    ·      29149  ·      46213  ·       45964  ·          69  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  DAI                     ·  burn                       ·          -  ·          -  ·       27704  ·           1  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  DAI                     ·  mint                       ·      70713  ·      70749  ·       70714  ·          69  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  approve                    ·      26650  ·      51103  ·       44732  ·         215  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  burn                       ·          -  ·          -  ·       31690  ·           6  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  changeCommissions          ·          -  ·          -  ·       46175  ·         343  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  changeCommunityAddresses   ·      32553  ·      66753  ·       66541  ·         326  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  claimDiscountedCollateral  ·      55787  ·     187261  ·      160258  ·          14  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  collateralize              ·      74112  ·     490178  ·      143443  ·         101  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  collateralRandomAmounts    ·          -  ·          -  ·       79304  ·           3  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  collateralRandomTokens     ·      69452  ·     102238  ·       94950  ·           9  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  disperse                   ·      72740  ·     403254  ·      150519  ·          27  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  getDiscountedCollateral    ·     158294  ·     206567  ·      187390  ·          23  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  harvest                    ·      81301  ·     312999  ·      132266  ·          14  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  initializeVRF              ·      36246  ·      56182  ·       54796  ·          29  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  mint                       ·      59205  ·      76305  ·       69393  ·         522  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  prepareRandomness          ·          -  ·          -  ·       98895  ·          12  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  renounceOwnership          ·          -  ·          -  ·       23335  ·           2  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  safeTransferFrom           ·      31028  ·      69852  ·       59029  ·         104  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  safeTransferFrom           ·      31704  ·      70970  ·       59892  ·         104  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  setApprovalForAll          ·      26364  ·      46276  ·       45328  ·         189  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  setGhostAddresses          ·      66642  ·      66654  ·       66653  ·          24  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  transferFrom               ·      30714  ·      62490  ·       54579  ·          50  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  transferOwnership          ·          -  ·          -  ·       28676  ·           2  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset  ·  uncollateralize            ·      89204  ·     506027  ·      153918  ·          45  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  RebaseToken             ·  approve                    ·      29135  ·      46235  ·       45986  ·          69  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  RebaseToken             ·  initialize                 ·      94307  ·      94319  ·       94319  ·          68  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  RebaseToken             ·  transfer                   ·          -  ·          -  ·       34665  ·           1  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  StakingMock             ·  fund                       ·          -  ·          -  ·       61607  ·          69  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  TetherToken             ·  approve                    ·      26344  ·      46244  ·       45954  ·          69  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  TetherToken             ·  burn                       ·          -  ·          -  ·       26907  ·           1  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  TetherToken             ·  mint                       ·          -  ·          -  ·       68219  ·          69  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  VRFCoordinatorV2Mock    ·  addConsumer                ·      70732  ·      70744  ·       70740  ·          13  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  VRFCoordinatorV2Mock    ·  createSubscription         ·          -  ·          -  ·       67774  ·          13  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  VRFCoordinatorV2Mock    ·  fulfillRandomWords         ·      82435  ·      82447  ·       82443  ·          13  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  VRFCoordinatorV2Mock    ·  fundSubscription           ·          -  ·          -  ·       29385  ·          12  ·          -  │
  ···························|·····························|·············|·············|··············|··············|··············
  |  Deployments                                           ·                                          ·  % of limit  ·             │
  ·························································|·············|·············|··············|··············|··············
  |  BadToken                                              ·          -  ·          -  ·     1140859  ·        17 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  BaseToken                                             ·     775391  ·     775475  ·      775422  ·      11.5 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  BlackHole                                             ·          -  ·          -  ·      321368  ·       4.8 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  BondingMock                                           ·    1114858  ·    1114870  ·     1114868  ·      16.6 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  DAI                                                   ·          -  ·          -  ·     1148998  ·      17.1 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  ERC721EnviousVRFPreset                                ·    4949552  ·    4949564  ·     4949563  ·      73.7 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  ERC721ReceiverMock                                    ·     285979  ·     286027  ·      286014  ·       4.3 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  RebaseToken                                           ·          -  ·          -  ·     1711816  ·      25.5 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  StakingMock                                           ·     246573  ·     246585  ·      246585  ·       3.7 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  TetherToken                                           ·          -  ·          -  ·      758083  ·      11.3 %  ·          -  │
  ·························································|·············|·············|··············|··············|··············
  |  VRFCoordinatorV2Mock                                  ·          -  ·          -  ·     1448986  ·      21.6 %  ·          -  │
  ·--------------------------------------------------------|-------------|-------------|--------------|--------------|-------------·
