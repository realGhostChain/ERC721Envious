.. Ghost Envious NFTs documentation master file, created by
   sphinx-quickstart on Sun Jan 22 14:48:13 2023.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

ERC721Envious & ghostNFT documentation!
=======================================

ghostNFT is the first application of ERC721Envious Standard aimed at adding collateral to NFTs. ghostNFT introduces an intuitive user experience enabling creators and users to add, redeem, and view collateral to individual NFTs and NFT collections. ghostNFT targets NFT collections, NFT owners, Token Holders, and Web3 Users.

The `ERC-721 standard <https://eips.ethereum.org/EIPS/eip-721>`_ was proposed in January 2018. Starting from `Cryptokitties <https://www.cryptokitties.co/>`_ project getting its
fame in 2017 to `Doodles <https://doodles.app/>`_ success in 2021, NFT space attracted a lot of attention resulting in everincreasing ecosystem, spiking trading volumes and diverse sets of NFT collections.

Further innovation in the NFT space was introduced by NFTfi. NFTfi focuses on the NFT floor price to enable the market value of the NFT serve as a collateral in lending protocols. Floor price is impacted by supply-demand dynamics of the NFT market which typically experiences higher volatility relative to price action of the general crypto market. Additionally, potential price increase the floor price accounted for by lending protocols. Using floor price based on the market manipulation in individual NFT collections may artificially increase market prices and, thus, value alone is both volatile and unreliable.

The :ref:`ERC721Envious <envious-extension>` standard is an extension of ERC721, similar to `OpenZeppelin's ERC721Enumerable <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol>`_ abstract contract. ERC721Envious is designed to ensure compatibility with `OpenZeppelin ERC721 <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol>`_, making it more convenient to use. This standard permits the collateralization of individual NFTs and NFT collections. Furthermore, :ref:`EnviousHouse <envious-house>` allows for the addition of collateral to previously minted NFTs, turning them into collateralized NFTs.

.. warning::

  ghostNFT is an experimental initiative that seeks to unite the DeFi and NFT communities to benefit both. It is crucial to have a complete understanding of the project's objectives, examine the code thoroughly, and review the contents of the ``./audits`` folder.

The ERC721Envious framework aims to utilize the smart contract address as a shared ERC20 token vault, with each unique ``tokenId`` acting as the key to the partial amount that belongs to the token holder and never leaves their wallet.

.. Hint::
  To obtain this documentation, you can access the versions flyout menu located at the bottom-left corner of the page and select the preferred download format, which includes PDF, HTML, or Epub.

Getting Started
---------------

**1. Create a gNFT.**

If you already have a collection, you can use the :ref:`EnviousHouse <envious-house>` wrapper to integrate the ERC721Envious standard and make it compatible with the Envious protocol. 

On the other hand, if you are starting a new project, it is recommended to use the :ref:`ERC721Envious <envious-extension>` extension or one of the available :ref:`Presets <basic-preset>` as a starting point to simplify the process of implementing the Envious standard.

* :ref:`Starting a new project with ERC721Envious <start-the-project>`.
* :ref:`Using the ERC721Envious extension <envious-extension-usage>`.
* :ref:`Making an existing collection envious with EnviousHouse <envious-house-usage>`.
* :ref:`Example of using gNFT <basic-preset-usage>`.
* :ref:`Implementing Envious for Web3 use cases <use-cases>`.

**2. ERC721Envious Presets.**

Preset contracts combine ERC721Envious with custom extensions and modules, presenting common configurations and business logic that can be easily deployed **without the need to write Solidity code**.

.. Hint::
  Preset contracts are pre-built smart contracts that come with pre-configured extensions and modules, demonstrating common configurations and business logic. They allow intermediate and advanced users to utilize them as a foundation when developing their own contracts, expanding them with custom features to suit their needs. As the GHOST team continues to work on new ideas and real-world use cases, they welcome suggestions for new presets.

.. warning::
  The most **battle-tested** preset is ERC721EnviousDynamic, which has been thoroughly tested and is recommended for use. Please refer to John McAfee Legacy (JML) NFT Collection for more information on this preset. GHOST team is continuously exploring new opportunities to implement other presets for Web3 use cases.

* :ref:`Basic Preset <basic-preset>`.
* :ref:`Dynamic Preset <dynamic-preset>`.
* :ref:`Royalty Preset <royalty-preset>`.
* :ref:`ChainLink Verifiable Random Function (VRF) Preset <vrf-preset>`.

**3. Use Cases.**

The `ERC721Dynamic <dynamic-preset>`_ preset was first used for the John McAfee Legacy (JML) NFT Collection. However, because of its dynamic nature, it requires the use of a ``measurementToken`` called Ghost McAfee Vision (GMV). GMV is utilized to rotate NFT images in accordance with the actual collateral and represents the initial balance for the genesis block on the `GHOST Chain <http://ghostchain.io/>`_.

.. hint::
  Additional information on the Initial NFT Offering (INO) can be found :ref:`here <use-cases>`.

To ensure a decentralized approach, a `ghostFaucet <https://airdrop.ghostchain.io/>`_ has been developed, which represents the first real-world **Initial NFT Offering (INO)**. It gamifies the idea of an airdrop by providing actual collateral in the form of NFTs.

**4. Testing.**

You can locate full test coverage in the ``./coverage`` folder, while test results and gas reports are stored in the ``./gas_reporter`` folder.

To test smart contracts locally, please execute the following commands:

.. code-block:: bash

  truffle run coverage                 # prepare test coverage report
  truffle test                         # run all tests as single unit
  # OR
  truffle test tests/FILENAME.test.js  # run specific needed test

You can find `Slither <https://github.com/crytic/slither>`_ reports for each smart contract in the ``./audits/slither/`` folder. Similarly, `Mythril <https://github.com/ConsenSys/mythril>`_ reports can be found in the ``./audits/mythril/`` folder.

We welcome your feedback and pull requests!

.. warning::
  The Mythril analysis was conducted in a Docker container and took around 1 hour for each smart contract.

Contents
========

:ref:`Keyword Index <genindex>`, :ref:`Search Page <search>`


.. toctree::
  :maxdepth: 2
  :caption: Getting Started

  envious-usage
  envious-extension-usage
  envious-house-usage
  basic-preset-usage

.. toctree::
  :maxdepth: 2
  :caption: Basics

  envious-extension
  envious-house
  black-hole

.. toctree::
  :maxdepth: 2
  :caption: Presets

  basic-preset
  dynamic-preset
  royalty-preset
  vrf-preset

.. toctree::
  :maxdepth: 2
  :caption: Products

  products

.. toctree::
  :maxdepth: 2
  :caption: Use Cases

  use-cases
