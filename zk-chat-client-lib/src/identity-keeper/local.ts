import { ArgumentTypeName } from "@pcd/pcd-types";
import { Identity } from "@semaphore-protocol/identity";
import { IIdentityKeeper } from "./types";
import { RLNPCDPackage, RLNPCDArgs, RLNPCD } from "../rln-pcd";
import { IStorageArtifacts } from "../types";
import { RLNFullProof } from "rlnjs";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { generateMerkleProof } from "@zk-kit/protocols";
import { LocalStorageProvider } from "../storage/local_storage";


const LOCAL_STORAGE_KEY = "zk-chat-local-identity";

export class LocalIdentityKeeper implements IIdentityKeeper {

    constructor(private readonly identity: Identity) {}

    static async load(): Promise<LocalIdentityKeeper> {
      console.log("Loading identity from local storage...")
      const localStorage = new LocalStorageProvider();
      let identity: Identity;
      // try to load identity from local storage
      try {
        const identityStr = await localStorage.load(LOCAL_STORAGE_KEY);
        identity = new Identity(identityStr);
      } catch(error) {
        console.info("Identity not found in local storage, creating a new one.")
        // if not found, create a new identity
        identity = new Identity();
        const identityStr = identity.toString();
        await localStorage.save(LOCAL_STORAGE_KEY, identityStr);
      }
      return new LocalIdentityKeeper(identity);
    }

    async getIdentityCommitment(): Promise<bigint> {
        return this.identity.getCommitment();
    };

    async generateRLNProof(
        epoch: bigint,
        signal: string,
        circuitFilePath: string,
        zkeyFilePath: string,
        storageArtifacts: IStorageArtifacts,
        rlnIdentifier: bigint,
        spamThreshold: number = 2,
    ): Promise<RLNFullProof> {
        if (!RLNPCDPackage.init) {
            throw new Error("RLNPCDPackage has no init method");
        }
        await RLNPCDPackage.init({
            zkeyFilePath: zkeyFilePath,
            wasmFilePath: circuitFilePath,
        });

        const identityPCD = await SemaphoreIdentityPCDPackage.serialize(
            await SemaphoreIdentityPCDPackage.prove({ identity: this.identity })
        );
        const identityCommitment = await this.getIdentityCommitment();
        // Generate merkle proof
        const leaves = storageArtifacts.leaves.map(leaf => BigInt(leaf));
        const merkleProof = generateMerkleProof(storageArtifacts.depth, BigInt(0), leaves, identityCommitment)

        const args = {
            rlnIdentifier: {
              argumentType: ArgumentTypeName.BigInt,
              value: String(rlnIdentifier),
            },
            identity: {
              argumentType: ArgumentTypeName.PCD,
              value: identityPCD,
            },
            merkleProof: {
              argumentType: ArgumentTypeName.Object,
              value: merkleProof,
            },
            signal: {
              argumentType: ArgumentTypeName.String,
              value: signal,
            },
            epoch: {
              argumentType: ArgumentTypeName.BigInt,
              value: String(epoch),
            },
        };
        const pcd = await RLNPCDPackage.prove(args as RLNPCDArgs) as RLNPCD;
        return pcd.toRLNFullProof();
    };
}
