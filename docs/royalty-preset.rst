.. _royalty-preset:

######################
Royalty Envious Preset
######################

***********
Description
***********

The possibility for creators of an :ref:`ERC721Envious Collection <envious-extension>` to receive royalty payments on every transaction between different addresses is due to the fact that the ``tokenId`` can hold actual collateral in ERC20 tokens and native coin.

.. hint::

  By default, all ERC20 tokens that collateralize an NFT will be included in the royalty payments. However, there is an option to customize the list and include only specific tokens if needed.

Commission fees can be collected during the collateralization and uncollateralization processes, which creates an additional revenue stream for creators that is triggered during ``transferFrom``. It's worth noting that there are two types of addresses:

* Externally Owned Accounts (EOA) that are controlled by private keys and are typically used by humans
* Contract Accounts that represent smart contracts deployed on the EVM network

.. hint::
  It is possible for transfers between different accounts to have varying commission fees, which can be customized by the collection developer.

More detailed information on potential use cases for the **Royalty Envious Preset** can be found :ref:`here <use-cases>`.

********************
IERC721RoyaltyPreset
********************

**royalties**

.. code-block:: Solidity

  function royalties(uint256 id) external view returns (uint256)

royalties function represents royalties that can be assigned to both user addresses and smart contracts. When a transfer occurs between a user address and another user address or smart contract, the first element of the royalty array will be used. Conversely, when a transfer occurs between two smart contracts, the second element of the array will be used.

royalties function returns royalty percentage with a 3 decimal point buffer, meaning that a value of 1,000 represents a royalty percentage of 1%.

**_Arguments_**

==== ======= ===========================================================
Name Type    Description
==== ======= ===========================================================
id   uint256 index position of an element in an array with a length of 2
==== ======= ===========================================================

**changeRoyalties**

.. code-block:: Solidity

  function changeRoyalties(uint256 user, uint256 smart) external

_changeRoyalties function enables to change royalties.

**_Arguments_**

===== ======= ==========================================
Name  Type    Description
===== ======= ==========================================
user  uint256 royalty percentage between EOA addresses
smart uint256 royalty percentage between smart contracts
===== ======= ==========================================

*******************
ERC721RoyaltyPreset
*******************

**baseURI**

.. code-block:: Solidity

  function baseURI() external view virtual returns (string memory)

baseURI is a getter function for the baseURI, typically represented by an IPFS hash.

baseURI function returns the prefix for the URI with metadata.

**setGhostAddresses**

.. code-block:: Solidity

  function setGhostAddresses(address ghostToken, address ghostBonding) public virtual

setGhostAddresses function modifies the underlying ghost-related addresses.

.. hint::

  `OpenZeppelin's Ownable <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol>`_ provides the ``onlyOwner`` modifier by default.

**_Arguments_**

============ ======= =======================================
Name         Type    Description
============ ======= =======================================
ghostToken   address address of a non-rebasing bonding token
ghostBonding address address of a bonding smart contract
============ ======= =======================================

**changeCommunityAddresses**

.. code-block:: Solidity

  function changeCommunityAddresses(address newTokenAddress, address newBlackHole) public virtual

changeCommunityAddresses function enables to change the address of the ``communityToken`` and the ``blackHole``.

**_Arguments_**

=============== ======= ==========================================
Name            Type    Description
=============== ======= ==========================================
newTokenAddress address new address of an ERC20 ``communityToken``
newBlackHole    address new address of a ``blackHole``
=============== ======= ==========================================

**_changeBaseURI**

.. code-block:: Solidity

  function _changeBaseURI(string memory newBaseURI) internal virtual

_changeBaseURI function enables to change baseURI.

**_Arguments_**

=============== ======= ==========================
Name            Type    Description
=============== ======= ==========================
newBaseURI      string  new link prefix
=============== ======= ==========================

**changeCommissions**

.. code-block:: Solidity

  function changeCommissions(uint256 incoming, uint256 outcoming) public virtual

changeCommissions function enables to change the rates of commission fees.

.. hint::

  `OpenZeppelin's Ownable <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol>`_ provides ``onlyOwner`` as the default availability.

**_Arguments_**

=============== ======= ===============================
Name            Type    Description
=============== ======= ===============================
incoming        uint256 updated collateralization fee
outcoming       uint256 updated uncollateralization fee
=============== ======= ===============================

**changeRoyalties**

.. code-block:: Solidity

  function changeRoyalties(uint256 user, uint256 smart) public virtual override onlyOwner

changeRoyalties function enables to change royalties.

.. hint::

  `OpenZeppelin's Ownable <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol>`_ provides ``onlyOwner`` as the default availability.

**_Arguments_**

===== ======= ==========================================
Name  Type    Description
===== ======= ==========================================
user  uint256 royalty percentage between EOA addresses
smart uint256 royalty percentage between smart contracts
===== ======= ==========================================

**_getRoyaltyFromCollateral**

.. code-block:: Solidity

  function _getRoyaltyFromCollateral(uint256 tokenId, uint256 royalty) internal virtual

_getRoyaltyFromCollateral function calculates and stores royalty payments.

.. warning::

  The collection owner can withdraw collected royalties only in the same manner as other commissions were collected.

**_Arguments_**

=============== ======= ==========================
Name            Type    Description
=============== ======= ==========================
tokenId         uint256 unique token identifier
royalty         uint256 royalty percentage
=============== ======= ==========================

**********
Gas Report
**********

The complete test results can be found in the ``./gas reporter/ERC721EnviousRoyaltyPreset.txt`` file. The actual tests are available in the ``./tests/ERC721EnviousRoyaltyPreset.test.js`` file.

.. code-block:: bash

  ·------------------------------------------------------------|---------------------------|--------------|----------------------------·
  |            Solc version: 0.8.4+commit.c7e474f2             ·  Optimizer enabled: true  ·  Runs: 1337  ·  Block limit: 6718946 gas  │
  ·····························································|···························|··············|·····························
  |  Methods                                                                                                                           │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  Contract                    ·  Method                     ·  Min        ·  Max        ·  Avg         ·  # calls     ·  eur (avg)  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  BadToken                    ·  approve                    ·          -  ·          -  ·       46213  ·          12  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  BadToken                    ·  mint                       ·          -  ·          -  ·       70691  ·           6  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  BaseToken                   ·  approve                    ·      29180  ·      46244  ·       46115  ·         133  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  BaseToken                   ·  burn                       ·          -  ·          -  ·       26889  ·           1  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  BaseToken                   ·  mint                       ·      51185  ·      68321  ·       67929  ·         144  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  BaseToken                   ·  transfer                   ·          -  ·          -  ·       46608  ·           1  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  DAI                         ·  approve                    ·      29149  ·      46213  ·       45966  ·          69  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  DAI                         ·  burn                       ·          -  ·          -  ·       27704  ·           1  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  DAI                         ·  mint                       ·      70713  ·      70749  ·       70714  ·          69  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  approve                    ·      26628  ·      51081  ·       44710  ·         215  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  burn                       ·      52199  ·      68274  ·       65358  ·          15  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  changeCommissions          ·      27230  ·      68285  ·       68074  ·         389  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  changeCommunityAddresses   ·      34651  ·      68851  ·       68659  ·         360  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  changeRoyalties            ·          -  ·          -  ·       28271  ·           6  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  claimDiscountedCollateral  ·      55765  ·     244786  ·      209562  ·          28  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  collateralize              ·      74616  ·     682724  ·      194172  ·         106  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  disperse                   ·      72718  ·     403232  ·      150496  ·          27  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  getDiscountedCollateral    ·     158329  ·     206611  ·      187426  ·          46  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  harvest                    ·      81301  ·     312999  ·      132266  ·          14  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  mint                       ·     160493  ·     172293  ·      167614  ·         578  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  renounceOwnership          ·          -  ·          -  ·       23269  ·           2  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  safeTransferFrom           ·      36109  ·     106120  ·       90073  ·         104  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  safeTransferFrom           ·      36783  ·     107239  ·       90936  ·         104  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  setApprovalForAll          ·      26386  ·      46298  ·       45350  ·         189  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  setGhostAddresses          ·      68948  ·      68972  ·       68970  ·          50  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  transferFrom               ·      35755  ·     139697  ·       92096  ·          64  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  transferOwnership          ·          -  ·          -  ·       28654  ·           2  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset  ·  uncollateralize            ·      61717  ·     298705  ·      111035  ·          43  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  RebaseToken                 ·  approve                    ·      29135  ·      46235  ·       45987  ·          69  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  RebaseToken                 ·  initialize                 ·      94307  ·      94319  ·       94318  ·          68  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  RebaseToken                 ·  transfer                   ·          -  ·          -  ·       34665  ·           1  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  StakingMock                 ·  fund                       ·          -  ·          -  ·       61607  ·          69  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  TetherToken                 ·  approve                    ·      26344  ·      46244  ·       45955  ·          69  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  TetherToken                 ·  burn                       ·          -  ·          -  ·       26907  ·           1  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  TetherToken                 ·  mint                       ·          -  ·          -  ·       68219  ·          69  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  Deployments                                               ·                                          ·  % of limit  ·             │
  ·····························································|·············|·············|··············|··············|··············
  |  BadToken                                                  ·          -  ·          -  ·     1140859  ·        17 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  BaseToken                                                 ·     775391  ·     775475  ·      775424  ·      11.5 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  BlackHole                                                 ·          -  ·          -  ·      321368  ·       4.8 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  BondingMock                                               ·    1114846  ·    1114870  ·     1114868  ·      16.6 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  DAI                                                       ·          -  ·          -  ·     1148998  ·      17.1 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  ERC721EnviousRoyaltyPreset                                ·          -  ·          -  ·     4539709  ·      67.6 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  ERC721ReceiverMock                                        ·     285979  ·     286027  ·      286014  ·       4.3 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  RebaseToken                                               ·          -  ·          -  ·     1711816  ·      25.5 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  StakingMock                                               ·     246573  ·     246585  ·      246584  ·       3.7 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  TetherToken                                               ·          -  ·          -  ·      758083  ·      11.3 %  ·          -  │
  ·------------------------------------------------------------|-------------|-------------|--------------|--------------|-------------·
