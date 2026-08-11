"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href?: string;
  items?: { label: string; href: string; external?: boolean }[];
};

export const menuLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/" },
  {
    label: "Producto",
    items: [
      { label: "🔍 Verificar credencial", href: "/verify" },
      { label: "🎓 Emitir credencial", href: "/issue" },
    ],
  },
  {
    label: "Organizaciones",
    items: [
      { label: "🏛️ Mi panel de organizaciones", href: "/" },
      { label: "📁 Proyectos · beta", href: "/" },
      { label: "👥 Afiliados · beta", href: "/" },
      { label: "🎖️ Roles · beta", href: "/" },
    ],
  },
  {
    label: "Recursos",
    items: [
      {
        label: "⛓️ Contrato en Arbiscan",
        href: "https://sepolia.arbiscan.io/address/0xcd2b62013948f6ddd0f64aa19e1287164a06d4ff",
        external: true,
      },
      {
        label: "📄 Certificado en IPFS",
        href: "https://ipfs.io/ipfs/bafybeib4rpfdp22c7hpfsryxymmm5rhkehn7zyang3d572kmbaoepfxste",
        external: true,
      },
      { label: "💻 Código fuente", href: "https://github.com/Migueldlcch/Uniorg", external: true },
    ],
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map((link) => {
        if (link.items) {
          return (
            <li key={link.label} className="h-full">
              <div className="dropdown dropdown-hover h-full">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex h-full items-center gap-1 px-4 text-sm whitespace-nowrap hover:bg-base-300"
                >
                  {link.label} <span className="text-xs text-gray-400">▾</span>
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-30 w-64 p-2 shadow-lg">
                  {link.items.map((item) => (
                    <li key={item.label}>
                      {item.external ? (
                        <a href={item.href} target="_blank" rel="noreferrer">
                          {item.label}
                        </a>
                      ) : (
                        <Link href={item.href}>{item.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        }

        const isActive = pathname === link.href;
        return (
          <li key={link.label} className="h-full">
            <Link
              href={link.href as string}
              passHref
              className={`${isActive ? "bg-base-300" : ""
                } hover:bg-base-300 focus:!bg-base-300 h-full px-4 text-sm gap-2 flex items-center whitespace-nowrap`}
            >
              <span>{link.label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-white/80 backdrop-blur-md min-h-16 shrink-0 justify-between z-20 border-b border-indigo-100 p-0 sm:px-2">
      <div className="navbar-start w-auto self-stretch">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg bg-base-100 w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="UniOrg logo" className="cursor-pointer" fill src="/uniorg-logo.png" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">UniOrg 🎓</span>
            <span className="text-xs">Credenciales verificables en Arbitrum</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap h-full m-0 p-0 list-none">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
