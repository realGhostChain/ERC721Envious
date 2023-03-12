.. _use-cases:

##############################
NFT 2.0 == Promises of NFT 1.0
##############################

NFT 2.0 is a new concept with a number of features and use cases. The list of features and use cases is ever expanding as NFT 2.0 gets more adoption.

A number of promises of NFT 1.0 are just not feasible given NFT 1.0 limitations. However, NFT 2.0 extends these limitations.

**On-chain verifiable price floor**

NFT 1.0 attempts to bring ‘big data’ and statistical methods to estimate the price floor. There are many problems with such an approach. First of all, the data is easily manipulated to inflate the prices of NFTs through inside wash sale, which gives a very inaccurate picture on the real liquidity deposited into a given NFT collection. Secondly, many NFT marketplaces are powered by off-chain NFT storage and operations resulting in even more obscure datapoints. Finally, there is simply not enough data to make any statistically significant forecasts let alone fair ‘big data’ predictions.

NFT 2.0 easily solves the problem of on-chain verifiable price floors since every gNFT has an on-chain collateral attached to it.

**Sustainable NFT royalties**

Since its origination, the concept of NFT staking was always desirable. Many NFT and Play2Earn projects were offering the yield on their NFTs. However, the yield was often in the form of a native token with unlimited supply where inflated supply was not backed appropriately creating all types of busts in bank-run scenario.

Appropriate collateral enables a gNFT to generate sustainable and sometimes consistently sustainable royalties. As it was already mentioned throughout this lightpaper, collateralizing a gNFT with DeFi 2.0 tokens or LP tokens could result in sustainable appreciation of gNFT value.

Further integration with DeFi 2.0 protocols such as ghostDAO enables discounted collateral and additional appreciation of the value of gNFT.

.. _ghost_nft_2.0_promises_of_nft_1.0:

########################
New Monetization Streams
########################

NFT 2.0 enables additional monetization of NFT collections through the following fees:

* Collateralization Fee
* Uncollateralization Fee
* NFT Transfer Fee

Additional NFT collection gamification can be implemented by utilizing VRFPreset and DynamicPreset described earlier

.. _ghost_nft_new_monetization_streams:

###################
NFT 2.0 Powers DAOs
###################

As DAOs are getting more traction in Web 3.0, NFT 2.0 offers novel ways to realize governance mechanisms. NFTs representing DAO decision makers was receiving more and more popularization in 2020-2021. gNFTs can significantly improve governance mechanisms by aligning incentives more appropriately.

For example, the voting power can be correlated to the amount of collateral behind a voting gNFT. Council members with more belief in the protocol will have to provide a larger collateral to achieve a higher voting power. Similarly, all gNFT collection holders can have an equivalent amount of native token distributed behind every gNFT; those holders to redeem gNFT collateral partial or in-full will lose a proportional amount of voting power.

Another way to utilize gNFT for voting is by rewarding Council members who dispersed larger amounts of collateral to other members of the gNFT collection with a higher voting power. All gNFT collateral activities are on-chain verifiable making it easy for DAOs to construct various mechanisms and incentive structures.

.. _ghost_nft_2.0_powers_daos:

###################
NFT 2.0 Powers DeFi
###################

Utility NFTs that the world was expecting for a very long time are somewhat difficult with NFT 1.0 and super achievable with NFT 2.0.

On-chain portfolio management applications can be designed with gNFTs. gNFT can be collateralized by any combinations of underlying tokens.

For example, let’s assume that a given gNFT was collateralized by:

* 10 ETH
* 1,000 DAI
* 5,000 eGHST
* 30 LP

The owner of the gNFT has the claim for all 4 tokens: ETH, DAI, eGHST, LP. Transfer of this gNFT to another user would give that user the claim for the 4 tokens. Thus, the gNFT serves as a receipt for the underlying tokens in the collateralized digital asset basket.

.. _ghost_nft_2.0_powers_defi:

##########################
Initial NFT Offering (INO)
##########################

NFT 2.0 empowers a new crowdfunding standard of the Initial NFT Offering (INO). The following example will illustrate how INOs work.

Let’s assume there is a new gNFT collection based on ERC721Envious | DynamicPreset. Let’s assume there are 5 levels of gNFTs based on the amount of collateral attached where Level 1 has the lowest amount of collateral and Level 5 is achieved by depositing the largest amount of collateral. The visual associated with gNFT changes dynamically and becomes rarer with larger amounts of tokens and/or capital contributed.

Users place respective NFT visuals on their avatars to reflect their status. Users with Level 1 gNFT have common NFT visuals. They would need to acquire the native token and collateralize Level 1 gNFT to get to Level 5 gNFT with more status-rich NFT visuals.

.. _ghost_initial_nft_offering:

############################
Cross-Chain Interoperability
############################

ghostNFT has natural integration with the GHOST protocol, which is responsible for decentralized cross-chain interoperability. GHOST protocol powers cross-chain interoperability of both NFTs and gNFTs. To reiterate, both NFTs and NFTs with attached collateral can move between EVM-compatible blockchains powered by the GHOST protocol. Please read the GHOST Lightpaper for a more in-depth explanation.

.. _ghost_cross_chain_interoperability: