.. _envious-extension-usage:

###############
Extension Usage
###############

*********************
Inherit ERC721Envious
*********************

To begin minting an ERC721Envious NFT Collection, it is recommended to follow the `OpenZeppelin ERC721 <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol>`_ standard for actual EIP-721 implementation. Follow the steps outlined below to mint an ERC721Envious NFT Collection.

.. code-block:: Solidity

  // SPDX-License-Identifier: MIT

  pragma solidity ^0.8.0;

  import "./contracts/extension/ERC721Envious.sol";

  contract YourCollectionName is ERC721Envious {
    constructor (string memory name, string memory symbol) ERC721(name, symbol) {}
  }

*******************
Basic Customization
*******************

Many NFT collections prefer to use `IPFS <https://ipfs.tech/>`_, which is an excellent tool for Web3 developers. Let’s assume that every new NFT is minted after the asset is designed and uploaded onto IPFS. This way, the NFT collection will have the `creator role`.

While creating a unique IPFS hash for every new NFT is not a standard way of implementing NFT, it is still feasible by overriding the ``tokenURI`` function logic. 

.. hint::

  This is a simplified method to incorporate smart contract admin. Make sure to incorporate any logic that suits the project requirements.

Sending native coins to a smart contract by mistake can lead to the permanent loss of those coins. The issue can be resolved by implementing a ``receive`` function and rerouting the mistake.

It is recommended to use `ERC721Enumerable <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol>`_ to improve the search capabilities in the collection.

ERC721Envious standard enables developers to create their own distribution logic for the ``_disperse`` function, which is responsible for distributing funds across assets in a collection. The standard also offers customizable templates for this function. However, by default, the ``_disperse`` function splits the contract's balance equally among all NFTs in the collection.

.. code-block:: Solidity

  // SPDX-License-Identifier: MIT

  pragma solidity ^0.8.0;

  import "./contracts/extension/ERC721Envious.sol";
  import "@openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";

  contract YourCollectionName is ERC721Envious, ERC721Enumerable  {
    address private immutable _creator;
    uint256 private _tokenNumber;
    mapping(uint256 => string) private _tokenURIs;

    /* --snip-- */

    receive() external payable {
  		_disperseTokenCollateral(msg.value, address(0));
  	}

    function mint(address who, string memory hash) public override {
      require(_msgSender() == address(this), "only for itself");
      _tokenNumber += 1;
      _safeMint(who, _tokenNumber);
    }

    function creatorMint(address who, string memory hash) external {
      require(_msgSender() == _creator(), "only for creator");
      mint(who);
      _tokenURIs[_tokenNumber] = hash;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
      _requireMinted(tokenId);
      return _tokenURIs[tokenId];
    }
  }

******************************
Defining Disperse Function
******************************

In most cases the default dispersion method will follow its classic definition in which the entire balance splits equality among all NFTs in the collection. However, the ``_disperse`` function is left undefined so that developers can define their own custom dispersion logic tailored to their specific project needs.

.. hint::

  When the ``_disperse`` function is executed the collateral amount is not transferred under the corresponding tokenId. To keep track of this intermediate step, it is necessary to store both the total disperse balance and the disperse balance for each tokenId. 

.. code-block:: Solidity

  // SPDX-License-Identifier: MIT

  pragma solidity ^0.8.0;

  import "./contracts/extension/ERC721Envious.sol";
  import "@openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";

  contract YourCollectionName is ERC721Envious, ERC721Enumerable  {

    /* --snip-- */

    function _disperse(address tokenAddress, uint256 tokenId) internal virtual override {
      uint256 balance = disperseBalance[tokenAddress] / totalSupply();

      if (disperseTotalTaken[tokenAddress] + balance > disperseBalance[tokenAddress]) {
        balance = disperseBalance[tokenAddress] - disperseTotalTaken[tokenAddress];
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
  }

********
Clean Up
********

Since both ERC721Enumerable and ERC721Envious inherit from the ERC721 standard, there may be some intersections that can cause errors during compilation. All intersections should be overridden to compile without issues.

.. code-block:: Solidity

  // SPDX-License-Identifier: MIT

  pragma solidity ^0.8.0;

  import "./contracts/extension/ERC721Envious.sol";
  import "@openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";

  contract YourCollectionName is ERC721Envious, ERC721Enumerable  {

    /* --snip-- */

    function supportsInterface(bytes4 interfaceId)
      public
      view
      virtual
      override(ERC721Envious, ERC721Enumerable, ERC721)
      returns (bool)
    {
      return ERC721Envious.supportsInterface(interfaceId) || ERC721Enumerable.supportsInterface(interfaceId);
    }

    function _disperse(address tokenAddress, uint256 tokenId) internal virtual override {
      uint256 balance = disperseBalance[tokenAddress] / totalSupply();

      if (disperseTotalTaken[tokenAddress] + balance > disperseBalance[tokenAddress]) {
        balance = disperseBalance[tokenAddress] - disperseTotalTaken[tokenAddress];
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
  }

**********
Final Code
**********

Code can now be deployed to any EVM-compatible blockchain network and let the code handle the rest. Developers have the freedom to explore and integrate gamification features around ``collateralization`` and/or ``dispersion`` as they see fit. More advanced Solidity developers will find this powerful tool inspiring to design creative and diverse solutions that push the boundaries of both NFT and DeFi ecosystems.

Please find the final version of the code below:

.. code-block:: Solidity

  // SPDX-License-Identifier: MIT

  pragma solidity ^0.8.0;

  import "./contracts/extension/ERC721Envious.sol";
  import "@openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";

  contract YourCollectionName is ERC721Envious, ERC721Enumerable  {

    address private immutable _creator;
    uint256 private _tokenNumber;
    mapping(uint256 => string) private _tokenURIs;

    constructor (string memory name, string memory symbol) ERC721(name, symbol) {
      _creator = _msgSender();
    }

    receive() external payable {
      _disperseTokenCollateral(msg.value, address(0));
    }

    function mint(address who, string memory hash) public override {
      require(_msgSender() == address(this), "only for itself");
      _tokenNumber += 1;
      _safeMint(who, _tokenNumber);
    }

    function creatorMint(address who, string memory hash) external {
      require(_msgSender() == _creator(), "only for creator");
      mint(who);
      _tokenURIs[_tokenNumber] = hash;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
      _requireMinted(tokenId);
      return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
      public
      view
      virtual
      override(ERC721Envious, ERC721Enumerable, ERC721)
      returns (bool)
    {
      return ERC721Envious.supportsInterface(interfaceId) || ERC721Enumerable.supportsInterface(interfaceId);
    }
  }
