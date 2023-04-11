import { IStorageArtifacts } from "../types";
import { RLNFullProof } from "rlnjs";


export interface IIdentityKeeper {
    getIdentityCommitment: () => Promise<bigint>;
    generateRLNProof: (
        epoch: bigint,
        signal: string,
        circuitFilePath: string,
        zkeyFilePath: string,
        storageArtifacts: IStorageArtifacts,
        rlnIdentifier: bigint,
        spamThreshold?: number
    ) => Promise<RLNFullProof>;
}
