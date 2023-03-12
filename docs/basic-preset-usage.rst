.. _basic-preset-usage:

############
Preset Usage
############

*******
Concept
*******

The primary objective of all presets is to predefine the majority of the template's functionality for developers, in order to strike a balance between code flexibility and time efficiency. Please read the documentation for all presets to detect already implemented functionality which can be inherited by simply copying the code.

If you have any ideas regarding code improvement or additional presets, pull requests (PRs) are welcome.

*********************
Inherit ERC721Envious
*********************

``ERC721EnviousPreset`` logic should be simply inherited if the business logic of the project is aligned with the logic of the standard.

.. hint::

  For most NFT collections, the predefined functionalities and structure provided by the EnviousHouse framework and ERC721EnviousPreset will not meet the requirements, and additional customization will be necessary.

.. code-block:: Solidity

  // SPDX-License-Identifier: MIT

  import "./presets/ERC721EnviousPreset.sol";

  pragma solidity ^0.8.0;

  contract YourAwesomeName is ERC721EnviousPreset {

    constructor(
      string memory name,
      string memory symbol,
      string memory baseURI
    ) ERC721Envious(name, symbol, baseURI) {}

  }

A more detailed description of each existing ERC721Envious Preset can be found in the **Presets** section of this documentation.
