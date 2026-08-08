//SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

/**
 * @title UniOrg
 * @dev On-chain credential infrastructure for university organizations
 */
contract UniOrg {
    struct Organization {
        uint256 id;
        string name;
        address issuer;
        uint256 createdAt;
    }

    struct Credential {
        uint256 id;
        uint256 orgId;
        address recipient;
        string metadataURI;
        address issuer;
        uint256 issuedAt;
        bool revoked;
    }

    uint256 private _nextOrgId = 1;
    uint256 private _nextCredentialId = 1;

    mapping(uint256 => Organization) private _organizations;
    mapping(uint256 => Credential) private _credentials;
    mapping(address => uint256[]) private _issuerOrgs;
    mapping(address => uint256[]) private _recipientCredentials;

    event OrganizationCreated(uint256 indexed orgId, string name, address indexed issuer);
    event CredentialIssued(
        uint256 indexed credentialId,
        uint256 indexed orgId,
        address indexed recipient,
        string metadataURI
    );
    event CredentialRevoked(uint256 indexed credentialId, uint256 indexed orgId, address indexed recipient);

    modifier orgExists(uint256 orgId) {
        require(orgId > 0 && orgId < _nextOrgId, "Organization does not exist");
        _;
    }

    modifier onlyIssuer(uint256 orgId) {
        require(_organizations[orgId].issuer == msg.sender, "Not organization issuer");
        _;
    }

    function createOrganization(string calldata name) external returns (uint256 orgId) {
        require(bytes(name).length > 0, "Name cannot be empty");

        orgId = _nextOrgId++;
        _organizations[orgId] = Organization({
            id: orgId,
            name: name,
            issuer: msg.sender,
            createdAt: block.timestamp
        });
        _issuerOrgs[msg.sender].push(orgId);

        emit OrganizationCreated(orgId, name, msg.sender);
    }

    function issueCredential(
        uint256 orgId,
        address recipient,
        string calldata metadataURI
    ) external orgExists(orgId) onlyIssuer(orgId) returns (uint256 credentialId) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(metadataURI).length > 0, "Metadata cannot be empty");

        credentialId = _nextCredentialId++;
        _credentials[credentialId] = Credential({
            id: credentialId,
            orgId: orgId,
            recipient: recipient,
            metadataURI: metadataURI,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false
        });
        _recipientCredentials[recipient].push(credentialId);

        emit CredentialIssued(credentialId, orgId, recipient, metadataURI);
    }

    function revokeCredential(uint256 credentialId) external {
        require(credentialId > 0 && credentialId < _nextCredentialId, "Credential does not exist");

        uint256 orgId = _credentials[credentialId].orgId;
        _revokeCredential(orgId, credentialId);
    }

    function verifyCredential(uint256 credentialId) external view returns (bool) {
        if (credentialId == 0 || credentialId >= _nextCredentialId) {
            return false;
        }

        return !_credentials[credentialId].revoked;
    }

    function getOrganization(uint256 orgId) external view orgExists(orgId) returns (Organization memory) {
        return _organizations[orgId];
    }

    function getIssuerOrgs(address issuer) external view returns (uint256[] memory) {
        return _issuerOrgs[issuer];
    }

    function getRecipientCredentials(address recipient) external view returns (uint256[] memory) {
        return _recipientCredentials[recipient];
    }

    function _revokeCredential(uint256 orgId, uint256 credentialId) internal orgExists(orgId) onlyIssuer(orgId) {
        Credential storage credential = _credentials[credentialId];
        require(!credential.revoked, "Credential already revoked");

        credential.revoked = true;

        emit CredentialRevoked(credentialId, orgId, credential.recipient);
    }
}
