import { deployScript, artifacts } from "../rocketh/deploy.js";

/**
 * Deploys UniOrg contract.
 * No constructor args: organizations are created via createOrganization() after deploy.
 */
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const uniOrg = await env.deploy("UniOrg", {
      account: deployer,
      artifact: artifacts.UniOrg,
    });

    // Sanity check: deployer starts with zero organizations
    const issuerOrgs = await env.read(uniOrg, {
      functionName: "getIssuerOrgs",
      args: [deployer],
    });
    console.log("UniOrg deployed. Issuer orgs for deployer:", issuerOrgs.length);
  },
  {
    tags: ["UniOrg"],
  },
);