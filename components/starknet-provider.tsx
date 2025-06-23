"use client";

import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  Connector,
} from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { ReactNode, useState, useEffect } from "react";
import { ControllerOptions } from "@cartridge/controller";

const localnet = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    public: {
      http: ["http://localhost:5050"],
    },
    default: {
      http: ["http://localhost:5050"],
    },
  },
};

export function StarknetProvider({ children }: { children: ReactNode }) {
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    const controllerOptions: ControllerOptions = {
      chains: [{ rpcUrl: localnet.rpcUrls.public.http[0] }],
      defaultChainId: "0x" + localnet.id.toString(16),
    };
    setConnectors([new ControllerConnector(controllerOptions)]);
  }, []);

  return (
    <StarknetConfig
      chains={[localnet]}
      provider={publicProvider()}
      connectors={connectors}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
