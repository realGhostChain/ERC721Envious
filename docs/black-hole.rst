.. _black-hole:

###################
BlackHole Contract
###################

***********
Description
***********

Since some ERC20 tokens forbid transfers to the zero address and/or lack implementation of the ``burn`` functionality, it is necessary to have a reliable burning mechanism in the ``harvest`` transactions. blackHole smart contract removes ERC20 ``communityTokens`` from the circulating supply in exchange for commission fees withdrawn.

blackHole has been designed to prevent the transfer of any tokens from itself and can only perform read operations. It is intended to be used with the ERC721Envious extension in implementations related to commission ``harvesting``.

**********
IBlackHole
**********

**function whoAmI**

.. code-block:: Solidity

  function whoAmI() external view returns (string memory)

whoAmI function returns the name of the BlackHole instance. For instance, the function could be set to return the name `IC 1011 <https://en.wikipedia.org/wiki/IC_1101>`_, which would serve as a unique identifier for the blackHole instance.

**absorbedBalance**

.. code-block:: Solidity

  function absorbedBalance(address token) external view returns (uint256)

absorbedBalance function returns the balance of an ERC20 token that was ``harvested`` and subsequently forwarded to the blackHole smart contract.

**_Arguments_**

====== ======= =========================
Name   Type    Description
====== ======= =========================
token  address address of an ERC20 token
====== ======= =========================

**availableSupply**

.. code-block:: Solidity

  function availableSupply(address token) external view returns (uint256)

availableSupply function returns the remaining balance of an ERC20 token that has not yet been ``harvested`` and is still considered as part of the actual circulating supply.

**_Arguments_**

====== ======= =========================
Name   Type    Description
====== ======= =========================
token  address address of an ERC20 token
====== ======= =========================

**********
Gas Report
**********

The complete test results can be found in the ``./gas reporter/BlackHole.txt`` file. The actual tests are available in the ``./tests/BlackHole.test.js`` file.

.. code-block:: bash

  ·---------------------------------------|---------------------------|--------------|----------------------------·
  |  Solc version: 0.8.4+commit.c7e474f2  ·  Optimizer enabled: true  ·  Runs: 1337  ·  Block limit: 6718946 gas  │
  ········································|···························|··············|·····························
  |  Methods                                                                                                      │
  ·····················|··················|·············|·············|··············|··············|··············
  |  Contract          ·  Method          ·  Min        ·  Max        ·  Avg         ·  # calls     ·  eur (avg)  │
  ·····················|··················|·············|·············|··············|··············|··············
  |  BaseToken         ·  mint            ·          -  ·          -  ·       68285  ·           8  ·          -  │
  ·····················|··················|·············|·············|··············|··············|··············
  |  BaseToken         ·  transfer        ·          -  ·          -  ·       51396  ·           3  ·          -  │
  ·····················|··················|·············|·············|··············|··············|··············
  |  Deployments                          ·                                          ·  % of limit  ·             │
  ········································|·············|·············|··············|··············|··············
  |  BaseToken                            ·          -  ·          -  ·      775367  ·      11.5 %  ·          -  │
  ········································|·············|·············|··············|··············|··············
  |  BlackHole                            ·          -  ·          -  ·      321380  ·       4.8 %  ·          -  │
  ·---------------------------------------|-------------|-------------|--------------|--------------|-------------·
