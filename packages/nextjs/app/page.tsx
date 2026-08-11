"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  useScaffoldReadContract,
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type Org = { id: bigint; name: string; issuer: string; createdAt: bigint };

const truncate = (s: string) => (s.length > 12 ? `${s.slice(0, 6)}...${s.slice(-4)}` : s);
const fmtDate = (ts: bigint) =>
  new Date(Number(ts) * 1000).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const ARBISCAN = "https://sepolia.arbiscan.io/address/";

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OrgCard({ orgId }: { orgId: bigint }) {
  const { data } = useScaffoldReadContract({
    contractName: "UniOrg",
    functionName: "getOrganization",
    args: [orgId],
  });
  if (!data) return <div className="h-28 animate-pulse rounded-2xl bg-white/70" />;
  const org = data as Org;
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Organización #{org.id.toString()}
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{org.name}</h3>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">🏛️ Emisor</span>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        <span className="font-mono">{truncate(org.issuer)}</span> · Creada el {fmtDate(org.createdAt)}
      </p>
    </div>
  );
}

function CredCard({ credId, onRevoke }: { credId: bigint; onRevoke: (id: bigint) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { data: cred } = useScaffoldReadContract({
    contractName: "UniOrg",
    functionName: "getCredential",
    args: [credId],
  });
  const { data: isValid } = useScaffoldReadContract({
    contractName: "UniOrg",
    functionName: "verifyCredential",
    args: [credId],
  });
  const { data: org } = useScaffoldReadContract({
    contractName: "UniOrg",
    functionName: "getOrganization",
    args: [cred ? cred.orgId : undefined],
  });

  if (!cred || !org || isValid === undefined) {
    return <div className="h-24 animate-pulse rounded-2xl bg-white/70" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-indigo-50/40"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${isValid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
            >
              {isValid ? "✅ Válida" : "❌ Revocada"}
            </span>
            <span className="text-xs font-medium text-gray-400">Credencial #{cred.id.toString()}</span>
          </div>
          <h4 className="mt-2 text-base font-bold text-gray-900">{org.name}</h4>
          <p className="mt-1 text-xs text-gray-500">
            Para <span className="font-mono">{truncate(cred.recipient)}</span> · {fmtDate(cred.issuedAt)}
          </p>
        </div>
        <span className="text-xl text-indigo-400">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-indigo-50 bg-indigo-50/30 px-5 py-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Issuer</p>
            <p className="font-mono text-xs text-gray-700">{cred.issuer}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Metadata (IPFS)</p>
            <p className="font-mono text-xs break-all text-gray-700">{cred.metadataURI}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={`${ARBISCAN}${cred.issuer}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Ver en Arbiscan ↗
            </a>
            {!cred.revoked && (
              <button
                onClick={() => onRevoke(cred.id)}
                className="ml-auto rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
              >
                Revocar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [orgName, setOrgName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  const { data: issuerOrgIds } = useScaffoldReadContract({
    contractName: "UniOrg",
    functionName: "getIssuerOrgs",
    args: [address],
  });
  const { data: recipientCredIds } = useScaffoldReadContract({
    contractName: "UniOrg",
    functionName: "getRecipientCredentials",
    args: [address],
  });

  const { writeContractAsync: createOrg } = useScaffoldWriteContract({ contractName: "UniOrg" });
  const { writeContractAsync: revokeCred } = useScaffoldWriteContract({ contractName: "UniOrg" });

  useScaffoldWatchContractEvent({
    contractName: "UniOrg",
    eventName: "CredentialIssued",
    onLogs: () => refresh(),
  });
  useScaffoldWatchContractEvent({
    contractName: "UniOrg",
    eventName: "OrganizationCreated",
    onLogs: () => refresh(),
  });

  const handleCreate = async () => {
    if (!orgName.trim()) return notification.error("Escribe un nombre para la organización");
    try {
      await createOrg({ functionName: "createOrganization", args: [orgName] });
      notification.success(`Organización "${orgName}" creada`);
      setOrgName("");
      refresh();
    } catch (e: any) {
      notification.error(e?.shortMessage || "Error al crear la organización");
    }
  };

  const handleRevoke = async (credId: bigint) => {
    if (!confirm(`¿Revocar la credencial #${credId.toString()}? Esta acción no se puede deshacer.`)) return;
    try {
      await revokeCred({ functionName: "revokeCredential", args: [credId] });
      notification.success(`Credencial #${credId.toString()} revocada`);
      refresh();
    } catch (e: any) {
      notification.error(e?.shortMessage || "Error al revocar");
    }
  };

  if (!isConnected) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center">
          <Image src="/uniorg-logo.png" alt="UniOrg" width={96} height={96} className="rounded-3xl shadow-lg" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-indigo-500">
            Infraestructura de credenciales · Arbitrum
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-tight text-gray-900 sm:text-6xl">
            La verdad de tus títulos,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              en la cadena
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-gray-600">
            Las universidades emiten en una transacción. Cualquier persona verifica en segundos, sin wallet y sin
            pedir permiso. Identidad, liderazgo, impacto.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/verify"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:brightness-110"
            >
              🔍 Verificar credencial
            </Link>
            <Link
              href="/issue"
              className="rounded-xl border-2 border-indigo-200 bg-white px-8 py-3 text-lg font-bold text-indigo-700 transition hover:border-indigo-400"
            >
              🎓 Emitir credencial
            </Link>
          </div>

          <div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6 text-left shadow-sm backdrop-blur">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                1
              </span>
              <h3 className="mt-3 font-bold text-gray-900">La universidad emite</h3>
              <p className="mt-1 text-sm text-gray-500">
                Una transacción firma la credencial con la identidad de la organización.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6 text-left shadow-sm backdrop-blur">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                2
              </span>
              <h3 className="mt-3 font-bold text-gray-900">Cualquiera verifica</h3>
              <p className="mt-1 text-sm text-gray-500">Sin cuenta, sin wallet: un ID y diez segundos de verdad.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6 text-left shadow-sm backdrop-blur">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                3
              </span>
              <h3 className="mt-3 font-bold text-gray-900">Arbitrum garantiza</h3>
              <p className="mt-1 text-sm text-gray-500">
                Inmutable, revocable en público y auditable por siempre en Arbiscan.
              </p>
            </div>
          </div>

          <p className="mt-10 text-xs text-gray-400">
            Contrato público en Arbitrum Sepolia:{" "}
            <a
              href="https://sepolia.arbiscan.io/address/0xcd2b62013948f6ddd0f64aa19e1287164a06d4ff"
              target="_blank"
              rel="noreferrer"
              className="font-mono font-semibold text-indigo-500 hover:underline"
            >
              0xcd2b…d4ff ↗
            </a>
          </p>
        </div>
      </div>
    );
  }

  const orgIds = issuerOrgIds ?? [];
  const credIds = recipientCredIds ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Dashboard UniOrg 🎓</h1>
            <p className="mt-1 text-sm text-gray-500">
              Conectado como <span className="font-mono font-semibold text-indigo-600">{truncate(address!)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/issue"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              + Emitir
            </Link>
            <Link
              href="/verify"
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              Verificar
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon="🏛️" label="Mis organizaciones" value={String(orgIds.length)} />
          <StatCard icon="🎓" label="Credenciales recibidas" value={String(credIds.length)} />
          <StatCard icon="⛓️" label="Red" value="Arbitrum Sepolia" />
        </div>

        <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Crear organización emisora</h2>
          <p className="mb-4 text-xs text-gray-500">
            Registra tu universidad como emisor verificable. Quedará grabado en Arbitrum.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="Ej: Universidad Nacional de Ingeniería"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              Crear
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Mis organizaciones</h2>
          {orgIds.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {orgIds.map(id => (
                <OrgCard key={`${id.toString()}-${refreshKey}`} orgId={id} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-indigo-200 p-6 text-center text-sm text-gray-500">
              Aún no tienes organizaciones. Crea la primera arriba. ☝️
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Credenciales recibidas</h2>
          {credIds.length > 0 ? (
            <div className="space-y-3">
              {credIds.map(id => (
                <CredCard key={`${id.toString()}-${refreshKey}`} credId={id} onRevoke={handleRevoke} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-indigo-200 p-6 text-center text-sm text-gray-500">
              Aún no recibes credenciales. Emite la primera con el botón + Emitir de arriba. 🎓
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-indigo-600 p-5 text-sm text-indigo-50 shadow-md">
          <strong>🔍 Transparencia total:</strong> cada emisión, revocación y verificación queda en Arbitrum Sepolia.
          Audítalo en{" "}
          <a href={ARBISCAN} target="_blank" rel="noreferrer" className="font-bold underline">
            Arbiscan ↗
          </a>
          . La metadata vive en IPFS: la cadena guarda el sello inmutable.
        </section>
      </div>
    </div>
  );
}
