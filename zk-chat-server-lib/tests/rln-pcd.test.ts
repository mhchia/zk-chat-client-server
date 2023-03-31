import { RLNPCDArgs, RLNPCDPackage } from '../src/rln-pcd';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import * as path from "path";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";

const TREE_DEPTH = 16;

const zkeyFilePath = path.join(__dirname, "../circuitFiles/rln/rln_final.zkey");
const wasmFilePath = path.join(__dirname, "../circuitFiles/rln/rln.wasm");


describe("rln-pcd should work", function () {
    jest.setTimeout(10000)

    beforeAll(async function () {
      if (!RLNPCDPackage.init) return;
      await RLNPCDPackage.init({
        zkeyFilePath,
        wasmFilePath,
      });
    });

    let args: RLNPCDArgs;

    beforeEach(async function () {
      const identity = new Identity();
      const group = new Group(1, TREE_DEPTH);
      group.addMember(identity.commitment);
      const merkleProof = group.generateMerkleProof(0);
      const signal = "hey hey";
      const rlnIdentifier = BigInt(5566);
      const epoch = BigInt(42);

      const identityPCD = await SemaphoreIdentityPCDPackage.serialize(
        await SemaphoreIdentityPCDPackage.prove({ identity })
      );

      // Arguments required for proving
      args = {
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
    });

    test('prove, verify, serialize, deserialize are all working', async () => {
        const { prove, verify, serialize, deserialize } = RLNPCDPackage;
        const pcd = await prove(args);
        expect(await verify(pcd)).toBe(true);
        const serialized = await serialize(pcd);
        const deserialized = await deserialize(serialized.pcd);
    });

});