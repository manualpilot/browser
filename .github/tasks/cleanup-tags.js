const { Octokit } = require("octokit");
const { fetch } = require("undici");

async function main() {
  const octo = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const versions = await octo.paginate(octo.rest.packages.getAllPackageVersionsForPackageOwnedByOrg, {
    org: "manualpilot",
    package_type: "container",
    package_name: "browser",
  });

  const tags = Array.from(new Set(
    versions
      .filter((v) => v.metadata.container.tags.length > 0)
      .flatMap((v) => v.metadata.container.tags),
  ));

  // we have to use the registry api directly to discover digests for each platform and arch,
  // the GitHub api does not expose such information
  const { token } = await (await fetch("https://ghcr.io/token?scope=repository:manualpilot/browser:pull")).json();
  const options = { headers: { Authorization: `Bearer ${token}` } };

  const digests = await Promise.all(tags.map(async (tag) => {
    const resp = await fetch(`https://ghcr.io/v2/manualpilot/browser/manifests/${tag}`, options);
    const { manifests } = await resp.json();

    const digests = [resp.headers.get("docker-content-digest")];

    if (manifests) {
      digests.push(...manifests.map((m) => m.digest));
    }

    return digests;
  }));

  const keep = new Set(digests.flat());
  const remove = versions.filter((v) => !keep.has(v.name)).map((v) => v.id);

  console.log("keeping versions", keep);

  for (const version of remove) {
    console.log("dropping version", version);
    await octo.rest.packages.deletePackageVersionForOrg({
      org: "manualpilot",
      package_type: "container",
      package_name: "browser",
      package_version_id: version,
    });
  }
}

(async () => await main())();
