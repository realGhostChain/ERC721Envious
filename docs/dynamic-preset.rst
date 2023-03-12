.. _dynamic-preset:

######################
Dynamic Envious Preset
######################

***********
Description
***********

In the specification of the ERC721 standard, the ``tokenId`` maps to a unique URI using the ``tokenURI`` function. This mapping is possible since the tokenURI function is `bijective <https://en.wikipedia.org/wiki/Bijection>`_.

In :ref:`ERC721Envious <envious-extension>` and :ref:`EnviousHouse <envious-house>`, a new parameter ``collateral`` is added to represent the power of the NFT. The ``tokenURI`` function is modified to include this new parameter and to update the result of the function on every ``collateral``, ``uncollateral``, and ``disperse`` function call. These functions are overridden with additional logic to include the new collateral parameter. This allows for more flexibility and customization in how the NFTs are used and represented.

.. hint::

  Currently, collateral is only measured for the ``measurementToken``, but an upgrade is possible to enable checking of all collateral and achieve a dynamic ``tokenURI``.

The ``tokenURI`` function in the template implementation appears as follows:

.. code-block:: Solidity

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    _requireMinted(tokenId);

    string memory currentURI = _baseURI();
    return string(abi.encodePacked(currentURI, tokenId.toString()));
  }

The results are likely recognizable to most readers and take the form of ``ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1337`` for a specific `Bored Ape Yacht Club <https://boredapeyachtclub.com/#/>`_ NFT (in this case, number 1337). This link points to the metadata for the given NFT and consists of two components:

* Basic URI (in the example, an IPFS hash)
* tokenId for an existing NFT

To make the collection dynamic, it's only necessary to update the ``tokenURI`` function with the following:

.. code-block:: Solidity

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    _requireMinted(tokenId);

    string memory currentURI = _baseURI();
    uint256 tokenPointer = getTokenPointer(tokenId);
    return string(abi.encodePacked(currentURI, tokenPointer.toString()));
  }

The ``tokenPointer`` refers to the proportional quantity of the ``measurementToken``.

.. hint::

  Although the GHOST team favors appending ``.json`` to every ``tokenURI``, any preferred method will suffice.

To implement the ``getTokenPointer`` function, it is necessary to define the ``edges`` that correspond to specific groups of URIs. The ``keccak256`` hashing function can then be applied to merge different parameters into one, resulting in the final tokenPointer. An example of the ``getTokenPointer`` function is provided below:

.. code-block:: Solidity

  function getTokenPointer(uint256 tokenId) public view virtual override returns (uint256) {
    uint256 collateral = collateralBalances[tokenId][measurmentTokenAddress];
    uint256 totalDisperse = disperseBalance[measurmentTokenAddress] / totalSupply();
    uint256	takenDisperse = disperseTaken[tokenId][measurmentTokenAddress];
    uint256 value = collateral + totalDisperse - takenDisperse;

    uint256 range = 1;
    uint256 offset = 0;

    for (uint256 i = edges.length; i > 0; i--) {
      if (value >= edges[i-1].value) {
        range = edges[i-1].range;
        offset = edges[i-1].offset;
        break;
      }
    }

    uint256 seed = uint256(keccak256(abi.encodePacked(tokenId, collateral, totalDisperse))) % range;
    return seed + offset;
  }

The initial step is to obtain the amount of full collateral in the ``measurementToken`` for a specific ``tokenId``. Subsequently, the iteration through predetermined ``edges`` takes place to determine the level at which the collateral amount falls into. Finally, the ``keccak256`` is applied to retrieve a specific value within a predefined range.

John McAfee Legacy (JML) NFT Collection is the first implementation of the ERC721EnviousDynamic preset.

*********************
IERC721EnviousDynamic
*********************

**struct Edge**

struct Edge stores the required data for enabling dynamic behavior in the collection, which can be compared to levels in gaming.

**_Arguments_**

======== ======= ===========================================
Name     Type    Description
======== ======= ===========================================
value    uint256 minimal measurementToken collateral in edge
offset   uint256 minimum tokenId in edge
range    uint256 maximum tokenId range between the edges
======== ======= ===========================================

**getTokenPointer**

.. code-block:: Solidity

  function getTokenPointer(uint256 tokenId) external view returns (uint256)

getTokenPointer serves as a tokenURI getter for a specific ``tokenId``, with the edge being determined by the collateral.

getTokenPointer function returns a pseudo pointer to the metadata.

**_Arguments_**

======== ======= ==========================
Name     Type    Description
======== ======= ==========================
tokenId  uint256 unique token identifier
======== ======= ==========================

********************
ERC721EnviousDynamic
********************

**baseURI**

.. code-block:: Solidity

  function baseURI() external view virtual returns (string memory)

baseURI is a getter function for the baseURI, typically represented by an IPFS hash.

baseURI function returns the prefix for the URI with metadata.

**setGhostAddresses**

.. code-block:: Solidity

  function setGhostAddresses(address ghostToken, address ghostBonding) public virtual

setGhostAddresses function modifies the underlying ghost-related addresses.

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

**********
Gas Report
**********

The complete test results can be found in the ``./gas reporter/ERC721EnviousDynamicPreset.txt`` file. The actual tests are available in the ``./tests/ERC721EnviousDynamicPreset.test.js`` file.

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
  |  BaseToken                   ·  approve                    ·      46220  ·      46244  ·       46241  ·         109  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  BaseToken                   ·  mint                       ·      51185  ·      68285  ·       67982  ·         114  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  BaseToken                   ·  transfer                   ·          -  ·          -  ·       46608  ·           1  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  DAI                         ·  approve                    ·      46201  ·      46213  ·       46212  ·          59  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  DAI                         ·  mint                       ·          -  ·          -  ·       70713  ·          59  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  approve                    ·      26672  ·      51125  ·       44754  ·         215  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  burn                       ·      46412  ·      62487  ·       59571  ·          15  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  changeCommunityAddresses   ·          -  ·          -  ·       66687  ·           2  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  claimDiscountedCollateral  ·      55765  ·     182596  ·      156257  ·          14  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  collateralize              ·      69447  ·     466833  ·      137521  ·         105  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  disperse                   ·      72718  ·     403232  ·      148481  ·          31  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  getDiscountedCollateral    ·     158312  ·     206589  ·      187408  ·          23  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  mint                       ·     151053  ·     162853  ·      158041  ·         562  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  safeTransferFrom           ·      31313  ·     101463  ·       84615  ·         104  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  safeTransferFrom           ·      32033  ·     102625  ·       85522  ·         104  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  setApprovalForAll          ·      26386  ·      46298  ·       45350  ·         189  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  setGhostAddresses          ·      66774  ·      66786  ·       66784  ·          26  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  transferFrom               ·      30954  ·      94056  ·       80619  ·          56  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset  ·  uncollateralize            ·      56897  ·     138116  ·       90793  ·          39  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  RebaseToken                 ·  approve                    ·      46223  ·      46235  ·       46234  ·          59  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  RebaseToken                 ·  initialize                 ·      94307  ·      94319  ·       94317  ·          59  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  StakingMock                 ·  fund                       ·          -  ·          -  ·       61607  ·          59  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  TetherToken                 ·  approve                    ·      46232  ·      46244  ·       46243  ·          59  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  TetherToken                 ·  mint                       ·          -  ·          -  ·       68219  ·          59  ·          -  │
  ·······························|·····························|·············|·············|··············|··············|··············
  |  Deployments                                               ·                                          ·  % of limit  ·             │
  ·····························································|·············|·············|··············|··············|··············
  |  BadToken                                                  ·          -  ·          -  ·     1140859  ·        17 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  BaseToken                                                 ·     775391  ·     775475  ·      775422  ·      11.5 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  BondingMock                                               ·    1114846  ·    1114870  ·     1114867  ·      16.6 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  DAI                                                       ·          -  ·          -  ·     1148998  ·      17.1 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  ERC721EnviousDynamicPreset                                ·    4701295  ·    4701307  ·     4701306  ·        70 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  ERC721ReceiverMock                                        ·     285979  ·     286027  ·      286014  ·       4.3 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  RebaseToken                                               ·          -  ·          -  ·     1711816  ·      25.5 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  StakingMock                                               ·     246573  ·     246585  ·      246584  ·       3.7 %  ·          -  │
  ·····························································|·············|·············|··············|··············|··············
  |  TetherToken                                               ·          -  ·          -  ·      758083  ·      11.3 %  ·          -  │
  ·------------------------------------------------------------|-------------|-------------|--------------|--------------|-------------·
