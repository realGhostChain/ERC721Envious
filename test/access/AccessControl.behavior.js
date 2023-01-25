const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const { shouldSupportInterfaces } = require('../utils/introspection/SupportsInterface.behavior');

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const MINTER_ROLE = web3.utils.soliditySha3('MINTER_ROLE');
const PAUSER_ROLE = web3.utils.soliditySha3('PAUSER_ROLE');
const GHOSTY_ROLE = web3.utils.soliditySha3('GHOSTY_ROLE');

function shouldBehaveLikeAccessControl (errorPrefix, admin, authorized, other, otherAdmin, otherAuthorized) {
  shouldSupportInterfaces(['AccessControl']);

  describe('default admin', function () {
    it('deployer has default admin role', async function () {
      expect(await this.token.hasRole(DEFAULT_ADMIN_ROLE, admin)).to.equal(true);
    });

    it('other roles\'s admin is the default admin role', async function () {
      expect(await this.token.getRoleAdmin(MINTER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
      expect(await this.token.getRoleAdmin(PAUSER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
      expect(await this.token.getRoleAdmin(GHOSTY_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
    });

    it('default admin role\'s admin is itself', async function () {
      expect(await this.token.getRoleAdmin(DEFAULT_ADMIN_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
    });
  });

  describe('granting', function () {
    beforeEach(async function () {
      await this.token.grantRole(MINTER_ROLE, authorized, { from: admin });
      await this.token.grantRole(PAUSER_ROLE, authorized, { from: admin });
      await this.token.grantRole(GHOSTY_ROLE, authorized, { from: admin });
    });

    it('non-admin cannot grant role to other accounts', async function () {
      await expectRevert(
        this.token.grantRole(MINTER_ROLE, authorized, { from: other }),
        `${errorPrefix}: account ${other.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
      await expectRevert(
        this.token.grantRole(PAUSER_ROLE, authorized, { from: other }),
        `${errorPrefix}: account ${other.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
      await expectRevert(
        this.token.grantRole(GHOSTY_ROLE, authorized, { from: other }),
        `${errorPrefix}: account ${other.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
    });

    it('accounts can be granted a role multiple times', async function () {
      await this.token.grantRole(MINTER_ROLE, authorized, { from: admin });
      const receipt1 = await this.token.grantRole(MINTER_ROLE, authorized, { from: admin });
      expectEvent.notEmitted(receipt1, 'RoleGranted');

      await this.token.grantRole(PAUSER_ROLE, authorized, { from: admin });
      const receipt2 = await this.token.grantRole(PAUSER_ROLE, authorized, { from: admin });
      expectEvent.notEmitted(receipt2, 'RoleGranted');

      await this.token.grantRole(GHOSTY_ROLE, authorized, { from: admin });
      const receipt3 = await this.token.grantRole(GHOSTY_ROLE, authorized, { from: admin });
      expectEvent.notEmitted(receipt3, 'RoleGranted');
    });
  });

  describe('revoking', function () {
    it('roles that are not had can be revoked', async function () {
      expect(await this.token.hasRole(MINTER_ROLE, authorized)).to.equal(false);
      const receipt1 = await this.token.revokeRole(MINTER_ROLE, authorized, { from: admin });
      expectEvent.notEmitted(receipt1, 'RoleRevoked');
		
      expect(await this.token.hasRole(PAUSER_ROLE, authorized)).to.equal(false);
      const receipt2 = await this.token.revokeRole(PAUSER_ROLE, authorized, { from: admin });
      expectEvent.notEmitted(receipt2, 'RoleRevoked');
		
      expect(await this.token.hasRole(GHOSTY_ROLE, authorized)).to.equal(false);
      const receipt3 = await this.token.revokeRole(GHOSTY_ROLE, authorized, { from: admin });
      expectEvent.notEmitted(receipt3, 'RoleRevoked');
    });

    context('with granted role', function () {
      beforeEach(async function () {
        await this.token.grantRole(MINTER_ROLE, authorized, { from: admin });
        await this.token.grantRole(PAUSER_ROLE, authorized, { from: admin });
        await this.token.grantRole(GHOSTY_ROLE, authorized, { from: admin });
      });

      it('admin can revoke role', async function () {
        const receipt1 = await this.token.revokeRole(MINTER_ROLE, authorized, { from: admin });
        expectEvent(receipt1, 'RoleRevoked', { account: authorized, role: MINTER_ROLE, sender: admin });
        expect(await this.token.hasRole(MINTER_ROLE, authorized)).to.equal(false);
		  
        const receipt2 = await this.token.revokeRole(PAUSER_ROLE, authorized, { from: admin });
        expectEvent(receipt2, 'RoleRevoked', { account: authorized, role: PAUSER_ROLE, sender: admin });
        expect(await this.token.hasRole(PAUSER_ROLE, authorized)).to.equal(false);
		  
        const receipt3 = await this.token.revokeRole(GHOSTY_ROLE, authorized, { from: admin });
        expectEvent(receipt3, 'RoleRevoked', { account: authorized, role: GHOSTY_ROLE, sender: admin });
        expect(await this.token.hasRole(GHOSTY_ROLE, authorized)).to.equal(false);
      });

      it('non-admin cannot revoke role', async function () {
        await expectRevert(
          this.token.revokeRole(MINTER_ROLE, authorized, { from: other }),
          `${errorPrefix}: account ${other.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
        await expectRevert(
          this.token.revokeRole(PAUSER_ROLE, authorized, { from: other }),
          `${errorPrefix}: account ${other.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
        await expectRevert(
          this.token.revokeRole(GHOSTY_ROLE, authorized, { from: other }),
          `${errorPrefix}: account ${other.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
      });

      it('a role can be revoked multiple times', async function () {
        await this.token.revokeRole(MINTER_ROLE, authorized, { from: admin });
        const receipt1 = await this.token.revokeRole(MINTER_ROLE, authorized, { from: admin });
        expectEvent.notEmitted(receipt1, 'RoleRevoked');
		  
        await this.token.revokeRole(PAUSER_ROLE, authorized, { from: admin });
        const receipt2 = await this.token.revokeRole(PAUSER_ROLE, authorized, { from: admin });
        expectEvent.notEmitted(receipt2, 'RoleRevoked');
		  
        await this.token.revokeRole(GHOSTY_ROLE, authorized, { from: admin });
        const receipt3 = await this.token.revokeRole(GHOSTY_ROLE, authorized, { from: admin });
        expectEvent.notEmitted(receipt3, 'RoleRevoked');
      });
    });
  });

  describe('renouncing', function () {
    it('roles that are not had can be renounced', async function () {
      const receipt1 = await this.token.renounceRole(MINTER_ROLE, authorized, { from: authorized });
      expectEvent.notEmitted(receipt1, 'RoleRevoked');

      const receipt2 = await this.token.renounceRole(PAUSER_ROLE, authorized, { from: authorized });
      expectEvent.notEmitted(receipt2, 'RoleRevoked');

      const receipt3 = await this.token.renounceRole(GHOSTY_ROLE, authorized, { from: authorized });
      expectEvent.notEmitted(receipt3, 'RoleRevoked');
    });

    context('with granted role', function () {
      beforeEach(async function () {
        await this.token.grantRole(MINTER_ROLE, authorized, { from: admin });
        await this.token.grantRole(PAUSER_ROLE, authorized, { from: admin });
        await this.token.grantRole(GHOSTY_ROLE, authorized, { from: admin });
      });

      it('bearer can renounce role', async function () {
        const receipt1 = await this.token.renounceRole(MINTER_ROLE, authorized, { from: authorized });
        expectEvent(receipt1, 'RoleRevoked', { account: authorized, role: MINTER_ROLE, sender: authorized });
        expect(await this.token.hasRole(MINTER_ROLE, authorized)).to.equal(false);

        const receipt2 = await this.token.renounceRole(PAUSER_ROLE, authorized, { from: authorized });
        expectEvent(receipt2, 'RoleRevoked', { account: authorized, role: PAUSER_ROLE, sender: authorized });
        expect(await this.token.hasRole(PAUSER_ROLE, authorized)).to.equal(false);

        const receipt3 = await this.token.renounceRole(GHOSTY_ROLE, authorized, { from: authorized });
        expectEvent(receipt3, 'RoleRevoked', { account: authorized, role: GHOSTY_ROLE, sender: authorized });
        expect(await this.token.hasRole(GHOSTY_ROLE, authorized)).to.equal(false);
      });

      it('only the sender can renounce their roles', async function () {
        await expectRevert(
          this.token.renounceRole(MINTER_ROLE, authorized, { from: admin }),
          `${errorPrefix}: can only renounce roles for self`,
        );
        await expectRevert(
          this.token.renounceRole(PAUSER_ROLE, authorized, { from: admin }),
          `${errorPrefix}: can only renounce roles for self`,
        );
        await expectRevert(
          this.token.renounceRole(GHOSTY_ROLE, authorized, { from: admin }),
          `${errorPrefix}: can only renounce roles for self`,
        );
      });

      it('a role can be renounced multiple times', async function () {
        await this.token.renounceRole(MINTER_ROLE, authorized, { from: authorized });
        const receipt1 = await this.token.renounceRole(MINTER_ROLE, authorized, { from: authorized });
        expectEvent.notEmitted(receipt1, 'RoleRevoked');

        await this.token.renounceRole(PAUSER_ROLE, authorized, { from: authorized });
        const receipt2 = await this.token.renounceRole(PAUSER_ROLE, authorized, { from: authorized });
        expectEvent.notEmitted(receipt2, 'RoleRevoked');

        await this.token.renounceRole(GHOSTY_ROLE, authorized, { from: authorized });
        const receipt3 = await this.token.renounceRole(GHOSTY_ROLE, authorized, { from: authorized });
        expectEvent.notEmitted(receipt3, 'RoleRevoked');
      });
    });
  });
}

function shouldBehaveLikeAccessControlEnumerable (errorPrefix, admin, authorized, other, otherAdmin, otherAuthorized) {
  shouldSupportInterfaces(['AccessControlEnumerable']);

  describe('enumerating', function () {
    it('role bearers can be enumerated for role #1', async function () {
      await this.token.grantRole(MINTER_ROLE, authorized, { from: admin });
      await this.token.grantRole(MINTER_ROLE, other, { from: admin });
      await this.token.grantRole(MINTER_ROLE, otherAuthorized, { from: admin });
      await this.token.revokeRole(MINTER_ROLE, other, { from: admin });

      const memberCount = await this.token.getRoleMemberCount(MINTER_ROLE);
      expect(memberCount).to.bignumber.equal('3');

      const bearers = [];
      for (let i = 0; i < memberCount; ++i) {
        bearers.push(await this.token.getRoleMember(MINTER_ROLE, i));
      }

      expect(bearers).to.have.members([authorized, otherAuthorized, admin]);
    });

    it('role enumeration should be in sync after renounceRole call for role #1', async function () {
      expect(await this.token.getRoleMemberCount(MINTER_ROLE)).to.bignumber.equal('1');
      await this.token.grantRole(MINTER_ROLE, other, { from: admin });
      expect(await this.token.getRoleMemberCount(MINTER_ROLE)).to.bignumber.equal('2');
      await this.token.renounceRole(MINTER_ROLE, other, { from: other });
      expect(await this.token.getRoleMemberCount(MINTER_ROLE)).to.bignumber.equal('1');
    });

    it('role bearers can be enumerated for role #2', async function () {
      await this.token.grantRole(PAUSER_ROLE, authorized, { from: admin });
      await this.token.grantRole(PAUSER_ROLE, other, { from: admin });
      await this.token.grantRole(PAUSER_ROLE, otherAuthorized, { from: admin });
      await this.token.revokeRole(PAUSER_ROLE, other, { from: admin });

      const memberCount = await this.token.getRoleMemberCount(PAUSER_ROLE);
      expect(memberCount).to.bignumber.equal('3');

      const bearers = [];
      for (let i = 0; i < memberCount; ++i) {
        bearers.push(await this.token.getRoleMember(PAUSER_ROLE, i));
      }

      expect(bearers).to.have.members([authorized, otherAuthorized, admin]);
    });

    it('role enumeration should be in sync after renounceRole call for role #2', async function () {
      expect(await this.token.getRoleMemberCount(PAUSER_ROLE)).to.bignumber.equal('1');
      await this.token.grantRole(PAUSER_ROLE, other, { from: admin });
      expect(await this.token.getRoleMemberCount(PAUSER_ROLE)).to.bignumber.equal('2');
      await this.token.renounceRole(PAUSER_ROLE, other, { from: other });
      expect(await this.token.getRoleMemberCount(PAUSER_ROLE)).to.bignumber.equal('1');
    });

    it('role bearers can be enumerated for role #3', async function () {
      await this.token.grantRole(GHOSTY_ROLE, authorized, { from: admin });
      await this.token.grantRole(GHOSTY_ROLE, other, { from: admin });
      await this.token.grantRole(GHOSTY_ROLE, otherAuthorized, { from: admin });
      await this.token.revokeRole(GHOSTY_ROLE, other, { from: admin });

      const memberCount = await this.token.getRoleMemberCount(GHOSTY_ROLE);
      expect(memberCount).to.bignumber.equal('3');

      const bearers = [];
      for (let i = 0; i < memberCount; ++i) {
        bearers.push(await this.token.getRoleMember(GHOSTY_ROLE, i));
      }

      expect(bearers).to.have.members([authorized, otherAuthorized, admin]);
    });

    it('role enumeration should be in sync after renounceRole call for role #3', async function () {
      expect(await this.token.getRoleMemberCount(GHOSTY_ROLE)).to.bignumber.equal('1');
      await this.token.grantRole(GHOSTY_ROLE, other, { from: admin });
      expect(await this.token.getRoleMemberCount(GHOSTY_ROLE)).to.bignumber.equal('2');
      await this.token.renounceRole(GHOSTY_ROLE, other, { from: other });
      expect(await this.token.getRoleMemberCount(GHOSTY_ROLE)).to.bignumber.equal('1');
    });
  });
}

module.exports = {
  shouldBehaveLikeAccessControl,
  shouldBehaveLikeAccessControlEnumerable,
};
