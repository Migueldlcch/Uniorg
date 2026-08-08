"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function Home() {
  const { address } = useAccount();
  const [orgName, setOrgName] = useState("");

  // Read: organizaciones del issuer
  const { data: issuerOrgs } = useScaffoldReadContract({
    contractName: "UniOrg",
    functionName: "getIssuerOrgs",
    args: [address],
  });

  // Write: crear organización
  const { writeContractAsync: createOrganization } = useScaffoldWriteContract({
    contractName: "UniOrg",
  });

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return;
    try {
      await createOrganization({
        functionName: "createOrganization",
        args: [orgName],
      });
      setOrgName("");
    } catch (error) {
      console.error("Error creating org:", error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">UniOrg - Issuer Dashboard</h1>

      {address ? (
        <div className="w-full max-w-2xl space-y-8">
          {/* Mis organizaciones */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Mis Organizaciones</h2>
            {issuerOrgs && issuerOrgs.length > 0 ? (
              <ul className="space-y-2">
                {issuerOrgs.map((orgId: bigint) => (
                  <li key={orgId.toString()} className="text-lg">
                    Organización #{orgId.toString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No tienes organizaciones todavía.</p>
            )}
          </div>

          {/* Crear nueva organización */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Crear Nueva Organización</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Nombre de la organización"
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                onClick={handleCreateOrg}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Crear
              </button>
            </div>
          </div>

          {/* Navegación */}
          <div className="flex gap-4">
            <a href="/issue" className="flex-1 px-6 py-3 bg-green-600 text-white rounded text-center hover:bg-green-700">
              Emitir Credencial
            </a>
            <a href="/verify" className="flex-1 px-6 py-3 bg-purple-600 text-white rounded text-center hover:bg-purple-700">
              Verificar Credencial
            </a>
          </div>
        </div>
      ) : (
        <p className="text-xl">Conecta tu wallet para comenzar.</p>
      )}
    </div>
  );
}