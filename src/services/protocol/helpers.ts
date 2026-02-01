import { Transaction } from "@mysten/sui/transactions";
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

async function signAndExecuteTransaction(
  transaction: Transaction,
  client: SuiGrpcClient,
  keypair: Ed25519Keypair,
) {
  transaction.setGasBudget(5000000000);
  return await client
    .signAndExecuteTransaction({
      signer: keypair,
      transaction,
    })
    .then(function (res) {
      return res;
    });
}
