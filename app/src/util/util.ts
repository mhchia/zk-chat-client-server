import { RLNFullProof } from "rlnjs";
import { clientUrl } from "../constants/constants";
import { IFuncGenerateProof, IStorageArtifacts, IIdentityKeeper } from "zk-chat-client";

/**
 * A callback function to generate RLN proof using the ZK-keeper plugin.
 */
export const generateProof: IFuncGenerateProof = async(epoch: string, signal: string, storage_artifacts: IStorageArtifacts, rln_identitifer: string): Promise<RLNFullProof> => {
    const idKeeper = ((window as any).idKeeper as IIdentityKeeper)
    return await idKeeper.generateRLNProof(
        BigInt(epoch),
        signal,
        `${clientUrl}/circuitFiles/rln/rln.wasm`,
        `${clientUrl}/circuitFiles/rln/rln_final.zkey`,
        storage_artifacts,
        BigInt(rln_identitifer),
    );
}
